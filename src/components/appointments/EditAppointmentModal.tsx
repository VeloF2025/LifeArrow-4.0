import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Video,
  Activity,
  UserCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CurrencyDisplay } from '../currency/CurrencyDisplay';
import { useServices } from '../../contexts/ServicesContext';
import { useStaff } from '../../contexts/StaffContext';
import { useTreatmentCentres } from '../../contexts/TreatmentCentresContext';
import { Appointment } from '../../types/appointments';
import { StaffMember } from '../../types/staff';
import { format, addDays, startOfWeek } from 'date-fns';
import { clsx } from 'clsx';

interface EditAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onSave: (appointmentId: string, updates: Partial<Appointment>) => Promise<void>;
}

interface EditFormData {
  date: Date;
  startTime: string;
  endTime: string;
  serviceTypeId: string;
  selectedStaffId: string;
  location: 'in-person' | 'virtual';
  notes: string;
  practitionerNotes: string;
}

export const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onSave
}) => {
  const { getActiveServices, getServiceById } = useServices();
  const { getStaffById, getActiveStaff } = useStaff();
  const { getCentreById } = useTreatmentCentres();
  
  const [formData, setFormData] = useState<EditFormData>({
    date: new Date(),
    startTime: '',
    endTime: '',
    serviceTypeId: '',
    selectedStaffId: '',
    location: 'in-person',
    notes: '',
    practitionerNotes: ''
  });
  
  const [availableStaff, setAvailableStaff] = useState<StaffMember[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<EditFormData>>({});
  const [selectedWeek, setSelectedWeek] = useState(startOfWeek(new Date()));

  const activeServices = getActiveServices();
  const allStaff = getActiveStaff();

  // Initialize form data when appointment changes
  useEffect(() => {
    if (appointment && isOpen) {
      console.log('Initializing form with appointment:', appointment);
      
      // Find the service ID from the service name
      const service = activeServices.find(s => s.name === appointment.serviceType);
      console.log('Found service:', service);
      
      const initialData = {
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        serviceTypeId: service?.id || '',
        selectedStaffId: appointment.practitionerId,
        location: appointment.location,
        notes: appointment.notes || '',
        practitionerNotes: appointment.practitionerNotes || ''
      };
      
      console.log('Setting initial form data:', initialData);
      setFormData(initialData);
      setSelectedWeek(startOfWeek(appointment.date));
      
      // Load initial staff list
      if (service?.id) {
        loadAvailableStaff(service.id);
      } else {
        // If no service found, load all staff
        setAvailableStaff(allStaff.filter(staff => staff.isAvailableForBooking));
      }
    }
  }, [appointment, isOpen, activeServices, allStaff]);

  // Load staff when service changes
  useEffect(() => {
    if (formData.serviceTypeId) {
      loadAvailableStaff(formData.serviceTypeId);
    }
  }, [formData.serviceTypeId]);

  // Load time slots when date changes
  useEffect(() => {
    loadAvailableSlots();
  }, [formData.date]);

  const loadAvailableStaff = (serviceId: string) => {
    console.log('Loading staff for service:', serviceId);
    
    // Filter staff who can provide this service
    const staffForService = allStaff.filter(staff => 
      staff.availableServices.includes(serviceId) && 
      staff.isAvailableForBooking
    );
    
    console.log('Available staff:', staffForService);
    setAvailableStaff(staffForService);
    
    // If current staff member can't provide the new service, clear selection
    if (formData.selectedStaffId && !staffForService.find(s => s.id === formData.selectedStaffId)) {
      console.log('Current staff cannot provide service, clearing selection');
      setFormData(prev => ({ ...prev, selectedStaffId: '' }));
    }
  };

  const loadAvailableSlots = () => {
    // Generate available time slots (simplified for demo)
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    setAvailableSlots(slots);
  };

  const handleInputChange = (field: keyof EditFormData, value: any) => {
    console.log(`Updating ${field} to:`, value);
    
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Calculate end time when start time or service changes
      if (field === 'startTime' || field === 'serviceTypeId') {
        const service = getServiceById(field === 'serviceTypeId' ? value : newData.serviceTypeId);
        if (service && (field === 'startTime' ? value : newData.startTime)) {
          const startTime = field === 'startTime' ? value : newData.startTime;
          const [hours, minutes] = startTime.split(':').map(Number);
          const totalMinutes = hours * 60 + minutes + service.duration;
          const endHour = Math.floor(totalMinutes / 60);
          const endMinute = totalMinutes % 60;
          const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
          newData.endTime = endTime;
        }
      }
      
      return newData;
    });
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<EditFormData> = {};

    if (!formData.serviceTypeId) newErrors.serviceTypeId = 'Service is required';
    if (!formData.selectedStaffId) newErrors.selectedStaffId = 'Staff member is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log('Submitting form with data:', formData);
    
    if (!validateForm() || !appointment) {
      console.log('Form validation failed or no appointment');
      return;
    }

    setIsLoading(true);
    try {
      const selectedService = getServiceById(formData.serviceTypeId);
      const selectedStaffMember = getStaffById(formData.selectedStaffId);
      
      console.log('Selected service:', selectedService);
      console.log('Selected staff:', selectedStaffMember);
      
      const updates: Partial<Appointment> = {
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        serviceType: selectedService?.name || appointment.serviceType,
        serviceDescription: selectedService?.description,
        practitionerId: formData.selectedStaffId,
        practitionerName: selectedStaffMember ? `${selectedStaffMember.firstName} ${selectedStaffMember.lastName}` : appointment.practitionerName,
        location: formData.location,
        notes: formData.notes,
        practitionerNotes: formData.practitionerNotes,
        price: selectedService?.price || appointment.price,
        duration: selectedService?.duration || appointment.duration,
        updatedAt: new Date()
      };

      console.log('Saving updates:', updates);
      await onSave(appointment.id, updates);
      onClose();
    } catch (error) {
      console.error('Failed to update appointment:', error);
      alert('Failed to update appointment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(selectedWeek, i));
    }
    return days;
  };

  if (!isOpen || !appointment) return null;

  const selectedService = getServiceById(formData.serviceTypeId);
  const selectedStaffMember = getStaffById(formData.selectedStaffId);

  console.log('Rendering modal with:', {
    formData,
    selectedService,
    selectedStaffMember,
    availableStaff: availableStaff.length,
    activeServices: activeServices.length
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-cyan-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Edit Appointment</h2>
              <p className="text-sm text-gray-600">{appointment.clientName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Appointment Details */}
            <div className="space-y-6">
              {/* Client Info (Read-only) */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Client Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    {appointment.clientAvatar && (
                      <img
                        src={appointment.clientAvatar}
                        alt={appointment.clientName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{appointment.clientName}</p>
                      <p className="text-sm text-gray-600">{appointment.clientEmail}</p>
                      <p className="text-sm text-gray-600">{appointment.clientPhone}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Service Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.serviceTypeId}
                  onChange={(e) => handleInputChange('serviceTypeId', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Select a service</option>
                  {activeServices.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {service.duration}min - <CurrencyDisplay amount={service.price} />
                    </option>
                  ))}
                </select>
                {errors.serviceTypeId && <p className="text-red-500 text-sm mt-1">{errors.serviceTypeId}</p>}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="location"
                      value="in-person"
                      checked={formData.location === 'in-person'}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="mr-3"
                    />
                    <MapPin className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="text-sm">In-Person</span>
                  </label>
                  <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="location"
                      value="virtual"
                      checked={formData.location === 'virtual'}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="mr-3"
                    />
                    <Video className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="text-sm">Virtual</span>
                  </label>
                </div>
              </div>

              {/* Staff Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Staff <span className="text-red-500">*</span>
                </label>
                {availableStaff.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availableStaff.map((staff) => (
                      <label key={staff.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="selectedStaff"
                          value={staff.id}
                          checked={formData.selectedStaffId === staff.id}
                          onChange={() => handleInputChange('selectedStaffId', staff.id)}
                          className="text-cyan-600 focus:ring-cyan-500"
                        />
                        <img
                          src={staff.avatar || `https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2`}
                          alt={`${staff.firstName} ${staff.lastName}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {staff.title} {staff.firstName} {staff.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {staff.specializations.slice(0, 2).join(', ')}
                            {staff.specializations.length > 2 && ` +${staff.specializations.length - 2} more`}
                          </p>
                        </div>
                        <UserCheck className="w-5 h-5 text-gray-400" />
                      </label>
                    ))}
                  </div>
                ) : formData.serviceTypeId ? (
                  <div className="p-4 border border-orange-200 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-800">
                      No staff available for the selected service. Please choose a different service.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 border border-gray-200 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Please select a service first to see available staff.
                    </p>
                  </div>
                )}
                {errors.selectedStaffId && <p className="text-red-500 text-sm mt-1">{errors.selectedStaffId}</p>}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any special requirements or notes..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Practitioner Notes
                </label>
                <textarea
                  value={formData.practitionerNotes}
                  onChange={(e) => handleInputChange('practitionerNotes', e.target.value)}
                  placeholder="Internal notes for the practitioner..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>

            {/* Right Column - Date & Time Selection */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Select Date & Time
                </h3>
                
                {/* Week Navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setSelectedWeek(addDays(selectedWeek, -7))}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-medium">
                    {format(selectedWeek, 'MMMM yyyy')}
                  </span>
                  <button
                    onClick={() => setSelectedWeek(addDays(selectedWeek, 7))}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                  {getWeekDays().map(day => (
                    <button
                      key={day.toISOString()}
                      onClick={() => handleInputChange('date', day)}
                      className={clsx(
                        'p-3 text-sm rounded-lg border transition-colors',
                        formData.date.toDateString() === day.toDateString()
                          ? 'bg-cyan-500 text-white border-cyan-500'
                          : day < new Date()
                          ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                          : 'text-gray-900 border-gray-200 hover:bg-gray-50'
                      )}
                      disabled={day < new Date()}
                    >
                      {format(day, 'd')}
                    </button>
                  ))}
                </div>

                {/* Time Slots */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Available Time Slots <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                    {availableSlots.map(slot => (
                      <button
                        key={slot}
                        onClick={() => handleInputChange('startTime', slot)}
                        className={clsx(
                          'p-2 text-sm rounded-lg border transition-colors',
                          formData.startTime === slot
                            ? 'bg-cyan-500 text-white border-cyan-500'
                            : 'text-gray-900 border-gray-200 hover:bg-gray-50'
                        )}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                  {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>}
                </div>

                {/* Service Summary */}
                {selectedService && formData.startTime && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Appointment Summary</h4>
                    <div className="space-y-2 text-sm text-blue-700">
                      <div className="flex justify-between">
                        <span>Service:</span>
                        <span>{selectedService.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{selectedService.duration} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time:</span>
                        <span>{formData.startTime} - {formData.endTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price:</span>
                        <span><CurrencyDisplay amount={selectedService.price} /></span>
                      </div>
                      {selectedStaffMember && (
                        <div className="flex justify-between">
                          <span>Practitioner:</span>
                          <span>{selectedStaffMember.firstName} {selectedStaffMember.lastName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50 flex-shrink-0">
          <div className="text-sm text-gray-600">
            {selectedService && (
              <span>Updated Price: <CurrencyDisplay amount={selectedService.price} /></span>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isLoading || !formData.serviceTypeId || !formData.selectedStaffId || !formData.startTime}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};