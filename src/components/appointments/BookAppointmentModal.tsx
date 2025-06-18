import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Video,
  Save,
  Search,
  Building,
  Navigation,
  UserCheck
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CurrencyDisplay } from '../currency/CurrencyDisplay';
import { CentreSelectionModal } from './CentreSelectionModal';
import { useAppointments } from '../../contexts/AppointmentsContext';
import { useServices } from '../../contexts/ServicesContext';
import { useTreatmentCentres } from '../../contexts/TreatmentCentresContext';
import { useStaff } from '../../contexts/StaffContext';
import { useAuth } from '../../contexts/AuthContext';
import { ServiceType, TimeSlot } from '../../types/appointments';
import { TreatmentCentre } from '../../types/treatmentCentres';
import { StaffMember } from '../../types/staff';
import { format, addDays, startOfWeek } from 'date-fns';

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedClientId?: string;
  preselectedDate?: Date;
  preselectedServiceType?: string;
}

interface AppointmentFormData {
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientCountry: string;
  clientCity: string;
  serviceTypeId: string;
  date: Date;
  timeSlot: string;
  location: 'in-person' | 'virtual';
  selectedCentreId: string;
  selectedStaffId: string;
  notes: string;
}

interface ClientSuggestion {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  avatar?: string;
}

// Mock client data for lookup - in a real app, this would come from an API
const mockClients: ClientSuggestion[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1 (555) 123-4567',
    country: 'ZA',
    city: 'Johannesburg',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+1 (555) 234-5678',
    country: 'US',
    city: 'New York',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2'
  },
  {
    id: '3',
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    phone: '+1 (555) 345-6789',
    country: 'GB',
    city: 'London',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2'
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david.wilson@email.com',
    phone: '+1 (555) 456-7890',
    country: 'ZA',
    city: 'Cape Town',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2'
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    email: 'lisa.anderson@email.com',
    phone: '+1 (555) 567-8901',
    country: 'US',
    city: 'Los Angeles',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2'
  },
  {
    id: '6',
    name: 'James Brown',
    email: 'james.brown@email.com',
    phone: '+1 (555) 678-9012',
    country: 'GB',
    city: 'Manchester',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2'
  }
];

export const BookAppointmentModal: React.FC<BookAppointmentModalProps> = ({
  isOpen,
  onClose,
  preselectedClientId,
  preselectedDate,
  preselectedServiceType
}) => {
  const { user } = useAuth();
  const { getActiveServices } = useServices();
  const { createAppointment, getAvailableTimeSlots } = useAppointments();
  const { getActiveCentres, getCentresByCountry } = useTreatmentCentres();
  const { getStaffByCentre, getStaffByService, getStaffById } = useStaff();
  const [isLoading, setIsLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [availableStaff, setAvailableStaff] = useState<StaffMember[]>([]);
  const [availableServices, setAvailableServices] = useState<ServiceType[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(startOfWeek(preselectedDate || new Date()));
  
  // Client lookup states
  const [showClientSuggestions, setShowClientSuggestions] = useState(false);
  const [clientSuggestions, setClientSuggestions] = useState<ClientSuggestion[]>([]);
  const [selectedClient, setSelectedClient] = useState<ClientSuggestion | null>(null);
  
  // Centre selection states
  const [showCentreModal, setShowCentreModal] = useState(false);
  const [availableCentres, setAvailableCentres] = useState<TreatmentCentre[]>([]);
  const [selectedCentre, setSelectedCentre] = useState<TreatmentCentre | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  
  const allServices = getActiveServices();
  const allCentres = getActiveCentres();
  
  const [formData, setFormData] = useState<AppointmentFormData>({
    clientId: preselectedClientId || '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientCountry: '',
    clientCity: '',
    serviceTypeId: preselectedServiceType || '',
    date: preselectedDate || new Date(),
    timeSlot: '',
    location: 'in-person',
    selectedCentreId: '',
    selectedStaffId: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Partial<AppointmentFormData>>({});

  // STEP 1: When location changes to in-person and client is selected, handle centre selection
  useEffect(() => {
    if (formData.location === 'in-person' && selectedClient) {
      handleLocationBasedCentreSelection();
    } else if (formData.location === 'virtual') {
      // For virtual appointments, clear centre-related selections and load all services
      setSelectedCentre(null);
      setSelectedStaff(null);
      setAvailableServices(allServices);
      setAvailableStaff([]);
      setAvailableSlots([]);
      setFormData(prev => ({ 
        ...prev, 
        selectedCentreId: '', 
        selectedStaffId: '',
        timeSlot: ''
      }));
    }
  }, [formData.location, selectedClient]);

  // STEP 2: When centre is selected, load available services at that centre
  useEffect(() => {
    if (selectedCentre && formData.location === 'in-person') {
      loadAvailableServicesAtCentre();
    }
  }, [selectedCentre]);

  // STEP 3: When service is selected, load available staff for that service
  useEffect(() => {
    if (formData.serviceTypeId) {
      if (formData.location === 'virtual') {
        // For virtual appointments, load all staff who can provide this service
        loadAvailableStaffForService();
      } else if (selectedCentre) {
        // For in-person appointments, load staff at the centre who can provide this service
        loadAvailableStaffForService();
      }
    } else {
      setAvailableStaff([]);
      setSelectedStaff(null);
      setAvailableSlots([]);
      setFormData(prev => ({ ...prev, selectedStaffId: '', timeSlot: '' }));
    }
  }, [formData.serviceTypeId, selectedCentre, formData.location]);

  // STEP 4: When staff is selected, load available time slots for that staff member
  useEffect(() => {
    if (formData.selectedStaffId && formData.serviceTypeId && formData.date) {
      loadAvailableTimeSlotsForStaff();
    } else {
      setAvailableSlots([]);
      setFormData(prev => ({ ...prev, timeSlot: '' }));
    }
  }, [formData.selectedStaffId, formData.serviceTypeId, formData.date]);

  // Initialize with preselected client if provided
  useEffect(() => {
    if (preselectedClientId) {
      const client = mockClients.find(c => c.id === preselectedClientId);
      if (client) {
        handleClientSelect(client);
      }
    }
  }, [preselectedClientId]);

  const handleLocationBasedCentreSelection = () => {
    if (!selectedClient) return;

    const centresInCountry = getCentresByCountry(selectedClient.country);
    
    if (centresInCountry.length === 0) {
      alert(`No treatment centres available in ${selectedClient.country}. Please contact us to arrange an appointment or select virtual consultation.`);
      setFormData(prev => ({ ...prev, location: 'virtual' }));
      return;
    }

    if (centresInCountry.length === 1) {
      // Auto-select the only available centre
      const centre = centresInCountry[0];
      setSelectedCentre(centre);
      setFormData(prev => ({ ...prev, selectedCentreId: centre.id }));
      alert(`Automatically selected ${centre.name} as it's the only centre available in ${selectedClient.country}.`);
    } else {
      // Show centre selection modal for multiple options
      setAvailableCentres(centresInCountry);
      setShowCentreModal(true);
    }
  };

  const loadAvailableServicesAtCentre = () => {
    if (!selectedCentre) {
      setAvailableServices([]);
      return;
    }

    // Filter services that are available at the selected centre
    const centreServices = allServices.filter(service => 
      selectedCentre.services.includes(service.id)
    );
    
    setAvailableServices(centreServices);
    
    // Clear service selection if current service is not available at this centre
    if (formData.serviceTypeId && !centreServices.find(s => s.id === formData.serviceTypeId)) {
      setFormData(prev => ({ ...prev, serviceTypeId: '', selectedStaffId: '', timeSlot: '' }));
    }
  };

  const loadAvailableStaffForService = () => {
    if (!formData.serviceTypeId) {
      setAvailableStaff([]);
      return;
    }

    let staffForService: StaffMember[] = [];

    if (formData.location === 'virtual') {
      // For virtual appointments, get all staff who can provide this service
      staffForService = getStaffByService(formData.serviceTypeId).filter(staff => 
        staff.status === 'active' && staff.isAvailableForBooking
      );
    } else if (selectedCentre) {
      // For in-person appointments, get staff at this centre who can provide this service
      const centreStaff = getStaffByCentre(selectedCentre.id);
      staffForService = centreStaff.filter(staff => 
        staff.status === 'active' && 
        staff.isAvailableForBooking &&
        staff.availableServices.includes(formData.serviceTypeId)
      );
    }

    setAvailableStaff(staffForService);
    
    // Clear staff selection if current staff is not available
    if (formData.selectedStaffId && !staffForService.find(s => s.id === formData.selectedStaffId)) {
      setSelectedStaff(null);
      setFormData(prev => ({ ...prev, selectedStaffId: '', timeSlot: '' }));
    }
  };

  const loadAvailableTimeSlotsForStaff = async () => {
    if (!formData.selectedStaffId || !formData.serviceTypeId) {
      setAvailableSlots([]);
      return;
    }

    try {
      // In a real app, this would get time slots specifically for the selected staff member
      const slots = await getAvailableTimeSlots(formData.date, formData.serviceTypeId);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Failed to load available slots:', error);
      setAvailableSlots([]);
    }
  };

  const handleInputChange = (field: keyof AppointmentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Client lookup functions
  const handleClientNameChange = (value: string) => {
    handleInputChange('clientName', value);
    
    if (value.length > 0) {
      // Filter clients based on name input
      const filtered = mockClients.filter(client =>
        client.name.toLowerCase().includes(value.toLowerCase())
      );
      setClientSuggestions(filtered);
      setShowClientSuggestions(true);
      
      // Clear selected client if name doesn't match
      if (selectedClient && !selectedClient.name.toLowerCase().includes(value.toLowerCase())) {
        setSelectedClient(null);
        setSelectedCentre(null);
        setSelectedStaff(null);
        setAvailableServices([]);
        setAvailableStaff([]);
        setAvailableSlots([]);
        handleInputChange('clientEmail', '');
        handleInputChange('clientPhone', '');
        handleInputChange('clientCountry', '');
        handleInputChange('clientCity', '');
        handleInputChange('clientId', '');
        handleInputChange('selectedCentreId', '');
        handleInputChange('selectedStaffId', '');
        handleInputChange('serviceTypeId', '');
        handleInputChange('timeSlot', '');
      }
    } else {
      setShowClientSuggestions(false);
      setClientSuggestions([]);
      setSelectedClient(null);
      setSelectedCentre(null);
      setSelectedStaff(null);
      setAvailableServices([]);
      setAvailableStaff([]);
      setAvailableSlots([]);
      handleInputChange('clientEmail', '');
      handleInputChange('clientPhone', '');
      handleInputChange('clientCountry', '');
      handleInputChange('clientCity', '');
      handleInputChange('clientId', '');
      handleInputChange('selectedCentreId', '');
      handleInputChange('selectedStaffId', '');
      handleInputChange('serviceTypeId', '');
      handleInputChange('timeSlot', '');
    }
  };

  const handleClientSelect = (client: ClientSuggestion) => {
    setSelectedClient(client);
    setFormData(prev => ({
      ...prev,
      clientId: client.id,
      clientName: client.name,
      clientEmail: client.email,
      clientPhone: client.phone,
      clientCountry: client.country,
      clientCity: client.city
    }));
    setShowClientSuggestions(false);
    
    // Clear any errors for auto-populated fields
    setErrors(prev => ({
      ...prev,
      clientName: undefined,
      clientEmail: undefined,
      clientPhone: undefined
    }));
  };

  const handleCentreSelect = (centre: TreatmentCentre) => {
    setSelectedCentre(centre);
    setSelectedStaff(null);
    setAvailableStaff([]);
    setAvailableSlots([]);
    setFormData(prev => ({ 
      ...prev, 
      selectedCentreId: centre.id,
      selectedStaffId: '',
      serviceTypeId: '',
      timeSlot: ''
    }));
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedStaff(null);
    setAvailableStaff([]);
    setAvailableSlots([]);
    setFormData(prev => ({ 
      ...prev, 
      serviceTypeId: serviceId,
      selectedStaffId: '',
      timeSlot: ''
    }));
  };

  const handleStaffSelect = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setAvailableSlots([]);
    setFormData(prev => ({ 
      ...prev, 
      selectedStaffId: staff.id,
      timeSlot: ''
    }));
  };

  const handleTimeSlotSelect = (timeSlot: string) => {
    setFormData(prev => ({ 
      ...prev, 
      timeSlot: timeSlot
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<AppointmentFormData> = {};

    if (!formData.clientName) newErrors.clientName = 'Client name is required';
    if (!selectedClient) {
      // Only require manual entry if no client is selected
      if (!formData.clientEmail) newErrors.clientEmail = 'Client email is required';
      if (!formData.clientPhone) newErrors.clientPhone = 'Client phone is required';
    }
    
    if (formData.location === 'in-person') {
      if (!formData.selectedCentreId) {
        newErrors.selectedCentreId = 'Treatment centre is required for in-person appointments';
      }
    }
    
    if (!formData.serviceTypeId) newErrors.serviceTypeId = 'Service type is required';
    if (!formData.selectedStaffId) newErrors.selectedStaffId = 'Staff member is required';
    if (!formData.timeSlot) newErrors.timeSlot = 'Time slot is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const selectedService = availableServices.find(s => s.id === formData.serviceTypeId) || 
                            allServices.find(s => s.id === formData.serviceTypeId);
      if (!selectedService) throw new Error('Service type not found');

      const [hours, minutes] = formData.timeSlot.split(':').map(Number);
      const endTime = `${(hours + Math.floor(selectedService.duration / 60)).toString().padStart(2, '0')}:${((minutes + selectedService.duration % 60) % 60).toString().padStart(2, '0')}`;

      await createAppointment({
        clientId: formData.clientId || `temp-${Date.now()}`,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        practitionerId: formData.selectedStaffId || user?.id || '1',
        practitionerName: selectedStaff ? `${selectedStaff.firstName} ${selectedStaff.lastName}` : (user ? `${user.firstName} ${user.lastName}` : 'Dr. Sarah Johnson'),
        date: formData.date,
        startTime: formData.timeSlot,
        endTime: endTime,
        duration: selectedService.duration,
        serviceType: selectedService.name,
        serviceDescription: selectedService.description,
        location: formData.location,
        notes: formData.notes,
        price: selectedService.price,
        centreId: formData.selectedCentreId || undefined,
        centreName: selectedCentre?.name || undefined,
      });

      onClose();
      // Reset form
      setFormData({
        clientId: '',
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientCountry: '',
        clientCity: '',
        serviceTypeId: '',
        date: new Date(),
        timeSlot: '',
        location: 'in-person',
        selectedCentreId: '',
        selectedStaffId: '',
        notes: ''
      });
      setSelectedClient(null);
      setSelectedCentre(null);
      setSelectedStaff(null);
      setAvailableServices([]);
      setAvailableStaff([]);
      setAvailableSlots([]);
      setShowClientSuggestions(false);
    } catch (error) {
      console.error('Failed to create appointment:', error);
      alert('Failed to book appointment. Please try again.');
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

  if (!isOpen) return null;

  const selectedService = availableServices.find(s => s.id === formData.serviceTypeId) || 
                         allServices.find(s => s.id === formData.serviceTypeId);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-cyan-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Book Appointment</h2>
                <p className="text-sm text-gray-600">Schedule a new appointment</p>
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
              {/* Left Column - Client & Service Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Client Information
                  </h3>
                  <div className="space-y-4">
                    {/* Client Name with Lookup */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Client Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.clientName}
                          onChange={(e) => handleClientNameChange(e.target.value)}
                          placeholder="Start typing client name..."
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                      {errors.clientName && <p className="text-red-500 text-sm mt-1">{errors.clientName}</p>}
                      
                      {/* Client Suggestions Dropdown */}
                      {showClientSuggestions && clientSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {clientSuggestions.map((client) => (
                            <button
                              key={client.id}
                              onClick={() => handleClientSelect(client)}
                              className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors text-left"
                            >
                              {client.avatar && (
                                <img
                                  src={client.avatar}
                                  alt={client.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              )}
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{client.name}</p>
                                <p className="text-sm text-gray-600">{client.email} • {client.city}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Only show manual entry fields if no client is selected */}
                    {!selectedClient && (
                      <>
                        <Input
                          label="Email Address"
                          type="email"
                          value={formData.clientEmail}
                          onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                          placeholder="Enter client's email"
                          icon={<Mail className="w-4 h-4" />}
                          required
                          error={errors.clientEmail}
                        />
                        <Input
                          label="Phone Number"
                          type="tel"
                          value={formData.clientPhone}
                          onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                          placeholder="Enter client's phone number"
                          icon={<Phone className="w-4 h-4" />}
                          required
                          error={errors.clientPhone}
                        />
                      </>
                    )}
                    
                    {/* Show selected client indicator */}
                    {selectedClient && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <img
                            src={selectedClient.avatar || `https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&dpr=2`}
                            alt={selectedClient.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-green-900">{selectedClient.name}</p>
                            <p className="text-sm text-green-700">{selectedClient.email}</p>
                            <p className="text-sm text-green-700">{selectedClient.phone}</p>
                            <p className="text-sm text-green-700">{selectedClient.city}, {selectedClient.country}</p>
                          </div>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Appointment Details
                  </h3>
                  <div className="space-y-4">
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

                    {/* STEP 1: Treatment Centre Selection (only for in-person) */}
                    {formData.location === 'in-person' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Step 1: Treatment Centre <span className="text-red-500">*</span>
                        </label>
                        {selectedCentre ? (
                          <div className="p-4 border border-green-200 bg-green-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Building className="w-5 h-5 text-green-600" />
                                <div>
                                  <p className="font-medium text-green-900">{selectedCentre.name}</p>
                                  <p className="text-sm text-green-700">{selectedCentre.address.city}, {selectedCentre.country.name}</p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowCentreModal(true)}
                              >
                                Change
                              </Button>
                            </div>
                          </div>
                        ) : selectedClient ? (
                          <div className="p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <MapPin className="w-5 h-5 text-gray-400" />
                                <div>
                                  <p className="text-sm text-gray-600">
                                    {getCentresByCountry(selectedClient.country).length > 0
                                      ? 'Centre will be selected automatically'
                                      : 'No centres available in client\'s country'
                                    }
                                  </p>
                                </div>
                              </div>
                              {getCentresByCountry(selectedClient.country).length > 1 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setAvailableCentres(getCentresByCountry(selectedClient.country));
                                    setShowCentreModal(true);
                                  }}
                                >
                                  <Navigation className="w-4 h-4 mr-1" />
                                  Select
                                </Button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <p className="text-sm text-gray-600">
                              Please select a client first to determine available centres
                            </p>
                          </div>
                        )}
                        {errors.selectedCentreId && <p className="text-red-500 text-sm mt-1">{errors.selectedCentreId}</p>}
                      </div>
                    )}

                    {/* STEP 2: Service Selection */}
                    {(formData.location === 'virtual' || selectedCentre) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {formData.location === 'in-person' ? 'Step 2: ' : ''}Service Type <span className="text-red-500">*</span>
                        </label>
                        {availableServices.length > 0 ? (
                          <select
                            value={formData.serviceTypeId}
                            onChange={(e) => handleServiceSelect(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          >
                            <option value="">
                              {formData.location === 'in-person' 
                                ? `Select a service available at ${selectedCentre?.name}`
                                : 'Select a service'
                              }
                            </option>
                            {availableServices.map(service => (
                              <option key={service.id} value={service.id}>
                                {service.name} - {service.duration}min - <CurrencyDisplay amount={service.price} />
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <p className="text-sm text-gray-600">
                              {formData.location === 'in-person' 
                                ? selectedCentre 
                                  ? 'No services available at the selected centre'
                                  : 'Please select a treatment centre first'
                                : 'Loading services...'
                              }
                            </p>
                          </div>
                        )}
                        {errors.serviceTypeId && <p className="text-red-500 text-sm mt-1">{errors.serviceTypeId}</p>}
                      </div>
                    )}

                    {selectedService && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-900">{selectedService.name}</h4>
                        <p className="text-sm text-blue-700 mt-1">{selectedService.description}</p>
                        <div className="flex items-center justify-between mt-3 text-sm">
                          <span className="flex items-center text-blue-600">
                            <Clock className="w-4 h-4 mr-1" />
                            {selectedService.duration} minutes
                          </span>
                          <span className="flex items-center text-blue-600">
                            <CurrencyDisplay amount={selectedService.price} />
                          </span>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: Staff Selection (after service is selected) */}
                    {formData.serviceTypeId && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {formData.location === 'in-person' ? 'Step 3: ' : ''}Available Staff <span className="text-red-500">*</span>
                        </label>
                        {availableStaff.length > 0 ? (
                          <div className="space-y-2">
                            {availableStaff.map((staff) => (
                              <label key={staff.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                  type="radio"
                                  name="selectedStaff"
                                  value={staff.id}
                                  checked={formData.selectedStaffId === staff.id}
                                  onChange={() => handleStaffSelect(staff)}
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
                              No staff available for the selected service
                              {formData.location === 'in-person' && selectedCentre && ` at ${selectedCentre.name}`}.
                              Please choose a different service.
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
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Any special requirements or notes..."
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Date & Time Selection */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {formData.location === 'in-person' ? 'Step 4: ' : 'Step 2: '}Select Date & Time
                  </h3>
                  
                  {/* Week Navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setSelectedWeek(addDays(selectedWeek, -7))}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                    >
                      ←
                    </button>
                    <span className="font-medium">
                      {format(selectedWeek, 'MMMM yyyy')}
                    </span>
                    <button
                      onClick={() => setSelectedWeek(addDays(selectedWeek, 7))}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                    >
                      →
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
                        className={`p-3 text-sm rounded-lg border transition-colors ${
                          formData.date.toDateString() === day.toDateString()
                            ? 'bg-cyan-500 text-white border-cyan-500'
                            : day < new Date()
                            ? 'text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'text-gray-900 border-gray-200 hover:bg-gray-50'
                        }`}
                        disabled={day < new Date()}
                      >
                        {format(day, 'd')}
                      </button>
                    ))}
                  </div>

                  {/* Time Slots - Only show if staff is selected */}
                  {formData.selectedStaffId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Available Time Slots for {selectedStaff?.firstName} {selectedStaff?.lastName} <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                        {availableSlots.map(slot => (
                          <button
                            key={slot.time}
                            onClick={() => handleTimeSlotSelect(slot.time)}
                            disabled={!slot.available}
                            className={`p-2 text-sm rounded-lg border transition-colors ${
                              formData.timeSlot === slot.time
                                ? 'bg-cyan-500 text-white border-cyan-500'
                                : slot.available
                                ? 'text-gray-900 border-gray-200 hover:bg-gray-50'
                                : 'text-gray-400 border-gray-200 cursor-not-allowed bg-gray-50'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                      {errors.timeSlot && <p className="text-red-500 text-sm mt-1">{errors.timeSlot}</p>}
                      {availableSlots.length === 0 && formData.selectedStaffId && (
                        <p className="text-gray-500 text-sm mt-2">
                          No available slots for the selected date and staff member. Please choose another date.
                        </p>
                      )}
                    </div>
                  )}

                  {!formData.selectedStaffId && formData.serviceTypeId && (
                    <div className="p-4 border border-gray-200 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        Please select a staff member first to see available time slots.
                      </p>
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
                <span>Total: <CurrencyDisplay amount={selectedService.price} /></span>
              )}
            </div>
            
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading || !formData.serviceTypeId || !formData.selectedStaffId || !formData.timeSlot}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Booking...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Book Appointment
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Centre Selection Modal */}
      <CentreSelectionModal
        isOpen={showCentreModal}
        onClose={() => setShowCentreModal(false)}
        onSelectCentre={handleCentreSelect}
        centres={availableCentres}
        clientLocation={selectedClient ? {
          country: selectedClient.country,
          city: selectedClient.city
        } : undefined}
      />
    </>
  );
};