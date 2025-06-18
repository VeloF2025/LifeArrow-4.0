import React, { useState, useEffect } from 'react';
import { X, Save, Plus, User, Mail, Phone, Award, Building, Activity } from 'lucide-react';
import { StaffMember } from '../../types/staff';
import { useTreatmentCentres } from '../../contexts/TreatmentCentresContext';
import { useServices } from '../../contexts/ServicesContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (staffData: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<void>;
  staff?: StaffMember | null;
  mode: 'create' | 'edit';
}

interface StaffFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  role: StaffMember['role'];
  specializations: string[];
  qualifications: string[];
  licenseNumber: string;
  yearsOfExperience: number;
  assignedCentres: string[];
  primaryCentre: string;
  availableServices: string[];
  maxDailyAppointments: number;
  appointmentDuration: number;
  isAvailableForBooking: boolean;
  status: StaffMember['status'];
}

const initialFormData: StaffFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  title: '',
  role: 'consultant',
  specializations: [],
  qualifications: [],
  licenseNumber: '',
  yearsOfExperience: 0,
  assignedCentres: [],
  primaryCentre: '',
  availableServices: [],
  maxDailyAppointments: 8,
  appointmentDuration: 45,
  isAvailableForBooking: true,
  status: 'active',
};

const roleOptions = [
  { value: 'admin', label: 'Administrator' },
  { value: 'practitioner', label: 'Practitioner' },
  { value: 'consultant', label: 'Consultant' },
];

const titleOptions = ['Dr.', 'Prof.', 'Mr.', 'Mrs.', 'Ms.', 'Miss'];

const commonSpecializations = [
  'Body Composition Analysis',
  'Wellness Consulting',
  'Nutrition Therapy',
  'Fitness Assessment',
  'Stress Management',
  'Weight Management',
  'Metabolic Health',
  'Lifestyle Coaching',
  'Preventive Medicine',
  'Sports Medicine',
];

export const StaffModal: React.FC<StaffModalProps> = ({
  isOpen,
  onClose,
  onSave,
  staff,
  mode
}) => {
  const { getActiveCentres } = useTreatmentCentres();
  const { getActiveServices } = useServices();
  const [formData, setFormData] = useState<StaffFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<StaffFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const totalSteps = 4;
  const activeCentres = getActiveCentres();
  const activeServices = getActiveServices();

  useEffect(() => {
    if (staff && mode === 'edit') {
      setFormData({
        firstName: staff.firstName,
        lastName: staff.lastName,
        email: staff.email,
        phone: staff.phone,
        title: staff.title || '',
        role: staff.role,
        specializations: staff.specializations,
        qualifications: staff.qualifications,
        licenseNumber: staff.licenseNumber || '',
        yearsOfExperience: staff.yearsOfExperience,
        assignedCentres: staff.assignedCentres,
        primaryCentre: staff.primaryCentre || '',
        availableServices: staff.availableServices,
        maxDailyAppointments: staff.maxDailyAppointments,
        appointmentDuration: staff.appointmentDuration,
        isAvailableForBooking: staff.isAvailableForBooking,
        status: staff.status,
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
    setCurrentStep(1);
  }, [staff, mode, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof StaffFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleArrayToggle = (field: 'specializations' | 'qualifications' | 'assignedCentres' | 'availableServices', value: string) => {
    const currentArray = formData[field] as string[];
    if (currentArray.includes(value)) {
      handleInputChange(field, currentArray.filter(item => item !== value));
    } else {
      handleInputChange(field, [...currentArray, value]);
    }
  };

  const handleAddCustomItem = (field: 'specializations' | 'qualifications', value: string) => {
    if (value.trim() && !formData[field].includes(value.trim())) {
      handleInputChange(field, [...formData[field], value.trim()]);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<StaffFormData> = {};

    switch (step) {
      case 1:
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        if (!formData.role) newErrors.role = 'Role is required';
        break;
      
      case 2:
        if (formData.yearsOfExperience < 0) newErrors.yearsOfExperience = 'Experience cannot be negative';
        break;
      
      case 3:
        if (formData.assignedCentres.length === 0) newErrors.assignedCentres = 'At least one centre must be assigned';
        if (formData.primaryCentre && !formData.assignedCentres.includes(formData.primaryCentre)) {
          newErrors.primaryCentre = 'Primary centre must be one of the assigned centres';
        }
        break;
      
      case 4:
        if (formData.isAvailableForBooking) {
          if (formData.maxDailyAppointments <= 0) newErrors.maxDailyAppointments = 'Must be greater than 0';
          if (formData.appointmentDuration <= 0) newErrors.appointmentDuration = 'Must be greater than 0';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);
    try {
      // Generate default working hours for assigned centres
      const workingHours: StaffMember['workingHours'] = {};
      formData.assignedCentres.forEach(centreId => {
        workingHours[centreId] = {
          monday: { isWorking: true, startTime: '08:00', endTime: '17:00', breakTimes: [{ startTime: '12:00', endTime: '13:00' }] },
          tuesday: { isWorking: true, startTime: '08:00', endTime: '17:00', breakTimes: [{ startTime: '12:00', endTime: '13:00' }] },
          wednesday: { isWorking: true, startTime: '08:00', endTime: '17:00', breakTimes: [{ startTime: '12:00', endTime: '13:00' }] },
          thursday: { isWorking: true, startTime: '08:00', endTime: '17:00', breakTimes: [{ startTime: '12:00', endTime: '13:00' }] },
          friday: { isWorking: true, startTime: '08:00', endTime: '17:00', breakTimes: [{ startTime: '12:00', endTime: '13:00' }] },
          saturday: { isWorking: false, startTime: '', endTime: '' },
          sunday: { isWorking: false, startTime: '', endTime: '' },
        };
      });

      const staffData: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> = {
        ...formData,
        permissions: formData.role === 'admin' 
          ? ['manage_all', 'system_admin', 'manage_staff', 'manage_centres', 'manage_services']
          : ['manage_appointments', 'view_clients'],
        workingHours,
        joinDate: staff?.joinDate || new Date(),
      };

      await onSave(staffData);
      onClose();
    } catch (error) {
      console.error('Failed to save staff member:', error);
      alert('Failed to save staff member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <select
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">Select Title</option>
            {titleOptions.map(title => (
              <option key={title} value={title}>{title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.role}
            onChange={(e) => handleInputChange('role', e.target.value as StaffMember['role'])}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            {roleOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.role && <p className="text-red-500 text-sm mt-1">{errors.role}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="First Name"
          value={formData.firstName}
          onChange={(e) => handleInputChange('firstName', e.target.value)}
          placeholder="Enter first name"
          required
          error={errors.firstName}
        />

        <Input
          label="Last Name"
          value={formData.lastName}
          onChange={(e) => handleInputChange('lastName', e.target.value)}
          placeholder="Enter last name"
          required
          error={errors.lastName}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="Enter email address"
          icon={<Mail className="w-4 h-4" />}
          required
          error={errors.email}
        />

        <Input
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="Enter phone number"
          icon={<Phone className="w-4 h-4" />}
          required
          error={errors.phone}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="License Number"
          value={formData.licenseNumber}
          onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
          placeholder="Professional license number"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years of Experience
          </label>
          <input
            type="number"
            value={formData.yearsOfExperience}
            onChange={(e) => handleInputChange('yearsOfExperience', parseInt(e.target.value) || 0)}
            min="0"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          {errors.yearsOfExperience && <p className="text-red-500 text-sm mt-1">{errors.yearsOfExperience}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Status
        </label>
        <select
          value={formData.status}
          onChange={(e) => handleInputChange('status', e.target.value as StaffMember['status'])}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="on-leave">On Leave</option>
        </select>
      </div>
    </div>
  );

  const renderProfessionalInfo = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Specializations
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {commonSpecializations.map((spec) => (
            <label key={spec} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.specializations.includes(spec)}
                onChange={() => handleArrayToggle('specializations', spec)}
                className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              <span className="text-sm text-gray-700">{spec}</span>
            </label>
          ))}
        </div>
        
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Add custom specialization..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddCustomItem('specializations', e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
              handleAddCustomItem('specializations', input.value);
              input.value = '';
            }}
          >
            Add
          </Button>
        </div>

        {formData.specializations.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {formData.specializations.map((spec, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {spec}
                <button
                  type="button"
                  onClick={() => handleArrayToggle('specializations', spec)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Qualifications
        </label>
        <div className="flex space-x-2 mb-4">
          <input
            type="text"
            placeholder="Add qualification (e.g., MD, PhD, BSc)..."
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddCustomItem('qualifications', e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
              handleAddCustomItem('qualifications', input.value);
              input.value = '';
            }}
          >
            Add
          </Button>
        </div>

        {formData.qualifications.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.qualifications.map((qual, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
              >
                {qual}
                <button
                  type="button"
                  onClick={() => handleArrayToggle('qualifications', qual)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderAssignments = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Assigned Treatment Centres <span className="text-red-500">*</span>
        </label>
        <div className="space-y-3">
          {activeCentres.map((centre) => (
            <label key={centre.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.assignedCentres.includes(centre.id)}
                onChange={() => handleArrayToggle('assignedCentres', centre.id)}
                className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              <Building className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{centre.name}</p>
                <p className="text-sm text-gray-600">{centre.city}, {centre.country.name}</p>
              </div>
            </label>
          ))}
        </div>
        {errors.assignedCentres && <p className="text-red-500 text-sm mt-1">{errors.assignedCentres}</p>}
      </div>

      {formData.assignedCentres.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Centre
          </label>
          <select
            value={formData.primaryCentre}
            onChange={(e) => handleInputChange('primaryCentre', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">Select primary centre</option>
            {formData.assignedCentres.map(centreId => {
              const centre = activeCentres.find(c => c.id === centreId);
              return centre ? (
                <option key={centre.id} value={centre.id}>
                  {centre.name} - {centre.city}
                </option>
              ) : null;
            })}
          </select>
          {errors.primaryCentre && <p className="text-red-500 text-sm mt-1">{errors.primaryCentre}</p>}
        </div>
      )}

      {formData.role !== 'admin' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Available Services
          </label>
          <div className="space-y-3">
            {activeServices.map((service) => (
              <label key={service.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.availableServices.includes(service.id)}
                  onChange={() => handleArrayToggle('availableServices', service.id)}
                  className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                />
                <Activity className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{service.name}</p>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderCapacitySettings = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="isAvailableForBooking"
          checked={formData.isAvailableForBooking}
          onChange={(e) => handleInputChange('isAvailableForBooking', e.target.checked)}
          className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
        />
        <label htmlFor="isAvailableForBooking" className="text-sm font-medium text-gray-700">
          Available for client bookings
        </label>
      </div>

      {formData.isAvailableForBooking && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Daily Appointments <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.maxDailyAppointments}
                onChange={(e) => handleInputChange('maxDailyAppointments', parseInt(e.target.value) || 0)}
                min="1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {errors.maxDailyAppointments && <p className="text-red-500 text-sm mt-1">{errors.maxDailyAppointments}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Appointment Duration (minutes) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.appointmentDuration}
                onChange={(e) => handleInputChange('appointmentDuration', parseInt(e.target.value) || 0)}
                min="15"
                step="15"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {errors.appointmentDuration && <p className="text-red-500 text-sm mt-1">{errors.appointmentDuration}</p>}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Capacity Summary</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Maximum {formData.maxDailyAppointments} appointments per day</p>
              <p>• Default {formData.appointmentDuration} minute sessions</p>
              <p>• Estimated {Math.floor((8 * 60) / formData.appointmentDuration)} appointments in an 8-hour day</p>
            </div>
          </div>
        </div>
      )}

      {!formData.isAvailableForBooking && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            This staff member will not be available for client bookings. They can still access the system based on their role permissions.
          </p>
        </div>
      )}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderBasicInfo();
      case 2: return renderProfessionalInfo();
      case 3: return renderAssignments();
      case 4: return renderCapacitySettings();
      default: return null;
    }
  };

  const stepTitles = [
    'Basic Information',
    'Professional Details',
    'Centre & Service Assignments',
    'Capacity Settings'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6 text-cyan-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {mode === 'create' ? 'Add New Staff Member' : 'Edit Staff Member'}
              </h2>
              <p className="text-sm text-gray-600">{stepTitles[currentStep - 1]}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            {stepTitles.map((title, index) => (
              <div key={index} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= index + 1
                    ? 'bg-cyan-500 border-cyan-500 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {currentStep > index + 1 ? (
                    <span className="text-sm">✓</span>
                  ) : (
                    <span className="text-sm">{index + 1}</span>
                  )}
                </div>
                {index < stepTitles.length - 1 && (
                  <div className={`w-full h-1 mx-4 ${
                    currentStep > index + 1 ? 'bg-cyan-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderStepContent()}
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50 flex-shrink-0">
          <div className="text-sm text-gray-500">
            Step {currentStep} of {totalSteps}
          </div>
          
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            {currentStep < totalSteps ? (
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    {mode === 'create' ? (
                      <Plus className="w-4 h-4 mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {mode === 'create' ? 'Add Staff Member' : 'Save Changes'}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};