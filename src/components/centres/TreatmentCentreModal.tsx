import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Building, MapPin, Phone, Mail, Clock, Users, Star } from 'lucide-react';
import { TreatmentCentre } from '../../types/treatmentCentres';
import { countries, getCountryByCode } from '../../data/countries';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface TreatmentCentreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (centreData: Omit<TreatmentCentre, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<void>;
  centre?: TreatmentCentre | null;
  mode: 'create' | 'edit';
}

interface CentreFormData {
  name: string;
  code: string;
  description: string;
  countryCode: string;
  city: string;
  street: string;
  state: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  maxDailyAppointments: number;
  maxConcurrentAppointments: number;
  rooms: number;
  isHeadquarters: boolean;
  features: string[];
  workingHours: {
    [key: string]: {
      isOpen: boolean;
      openTime: string;
      closeTime: string;
    };
  };
}

const initialFormData: CentreFormData = {
  name: '',
  code: '',
  description: '',
  countryCode: '',
  city: '',
  street: '',
  state: '',
  postalCode: '',
  phone: '',
  email: '',
  website: '',
  maxDailyAppointments: 50,
  maxConcurrentAppointments: 8,
  rooms: 5,
  isHeadquarters: false,
  features: [],
  workingHours: {
    monday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
    tuesday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
    wednesday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
    thursday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
    friday: { isOpen: true, openTime: '08:00', closeTime: '17:00' },
    saturday: { isOpen: true, openTime: '09:00', closeTime: '13:00' },
    sunday: { isOpen: false, openTime: '', closeTime: '' },
  },
};

const availableFeatures = [
  'parking',
  'wheelchair-accessible',
  'wifi',
  'cafe',
  'reception',
  'valet',
  'concierge',
  'pharmacy',
  'laboratory',
  'imaging',
];

const daysOfWeek = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export const TreatmentCentreModal: React.FC<TreatmentCentreModalProps> = ({
  isOpen,
  onClose,
  onSave,
  centre,
  mode
}) => {
  const [formData, setFormData] = useState<CentreFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<CentreFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const totalSteps = 4;

  useEffect(() => {
    if (centre && mode === 'edit') {
      setFormData({
        name: centre.name,
        code: centre.code,
        description: centre.description || '',
        countryCode: centre.country.code,
        city: centre.city,
        street: centre.address.street,
        state: centre.address.state || '',
        postalCode: centre.address.postalCode,
        phone: centre.phone,
        email: centre.email,
        website: centre.website || '',
        maxDailyAppointments: centre.capacity.maxDailyAppointments,
        maxConcurrentAppointments: centre.capacity.maxConcurrentAppointments,
        rooms: centre.capacity.rooms,
        isHeadquarters: centre.isHeadquarters,
        features: centre.features,
        workingHours: Object.keys(centre.workingHours).reduce((acc, day) => {
          const schedule = centre.workingHours[day];
          acc[day] = {
            isOpen: schedule.isOpen,
            openTime: schedule.openTime,
            closeTime: schedule.closeTime,
          };
          return acc;
        }, {} as any),
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
    setCurrentStep(1);
  }, [centre, mode, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof CentreFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleWorkingHoursChange = (day: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    const currentFeatures = formData.features;
    if (currentFeatures.includes(feature)) {
      handleInputChange('features', currentFeatures.filter(f => f !== feature));
    } else {
      handleInputChange('features', [...currentFeatures, feature]);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<CentreFormData> = {};

    switch (step) {
      case 1:
        if (!formData.name.trim()) newErrors.name = 'Centre name is required';
        if (!formData.code.trim()) newErrors.code = 'Centre code is required';
        if (!formData.countryCode) newErrors.countryCode = 'Country is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        break;
      
      case 2:
        if (!formData.street.trim()) newErrors.street = 'Street address is required';
        if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.email.trim()) newErrors.email = 'Email address is required';
        break;
      
      case 3:
        if (formData.maxDailyAppointments <= 0) newErrors.maxDailyAppointments = 'Must be greater than 0';
        if (formData.maxConcurrentAppointments <= 0) newErrors.maxConcurrentAppointments = 'Must be greater than 0';
        if (formData.rooms <= 0) newErrors.rooms = 'Must be greater than 0';
        break;
      
      case 4:
        // Working hours validation is optional
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
      const country = getCountryByCode(formData.countryCode);
      if (!country) throw new Error('Invalid country selected');

      const centreData: Omit<TreatmentCentre, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        country,
        city: formData.city,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: country.name,
        },
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        timezone: country.timezone,
        workingHours: Object.keys(formData.workingHours).reduce((acc, day) => {
          acc[day] = {
            ...formData.workingHours[day],
            breakTimes: [],
          };
          return acc;
        }, {} as any),
        services: [],
        practitioners: [],
        capacity: {
          maxDailyAppointments: formData.maxDailyAppointments,
          maxConcurrentAppointments: formData.maxConcurrentAppointments,
          rooms: formData.rooms,
        },
        status: 'active',
        isHeadquarters: formData.isHeadquarters,
        features: formData.features,
      };

      await onSave(centreData);
      onClose();
    } catch (error) {
      console.error('Failed to save centre:', error);
      alert('Failed to save centre. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Centre Name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Enter centre name"
          required
          error={errors.name}
        />

        <Input
          label="Centre Code"
          value={formData.code}
          onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
          placeholder="e.g., JHB001, NYC001"
          required
          error={errors.code}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Brief description of the centre..."
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.countryCode}
            onChange={(e) => handleInputChange('countryCode', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">Select Country</option>
            {countries.map(country => (
              <option key={country.code} value={country.code}>
                {country.name} ({country.currency.code})
              </option>
            ))}
          </select>
          {errors.countryCode && <p className="text-red-500 text-sm mt-1">{errors.countryCode}</p>}
        </div>

        <Input
          label="City"
          value={formData.city}
          onChange={(e) => handleInputChange('city', e.target.value)}
          placeholder="Enter city"
          required
          error={errors.city}
        />
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="isHeadquarters"
          checked={formData.isHeadquarters}
          onChange={(e) => handleInputChange('isHeadquarters', e.target.checked)}
          className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
        />
        <label htmlFor="isHeadquarters" className="flex items-center text-sm font-medium text-gray-700">
          <Star className="w-4 h-4 mr-2 text-yellow-600" />
          This is the headquarters location
        </label>
      </div>
    </div>
  );

  const renderContactInfo = () => (
    <div className="space-y-6">
      <Input
        label="Street Address"
        value={formData.street}
        onChange={(e) => handleInputChange('street', e.target.value)}
        placeholder="Enter street address"
        required
        error={errors.street}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="State/Province"
          value={formData.state}
          onChange={(e) => handleInputChange('state', e.target.value)}
          placeholder="Enter state or province"
        />

        <Input
          label="Postal Code"
          value={formData.postalCode}
          onChange={(e) => handleInputChange('postalCode', e.target.value)}
          placeholder="Enter postal code"
          required
          error={errors.postalCode}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Phone Number"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="Enter phone number"
          icon={<Phone className="w-4 h-4" />}
          required
          error={errors.phone}
        />

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
      </div>

      <Input
        label="Website"
        value={formData.website}
        onChange={(e) => handleInputChange('website', e.target.value)}
        placeholder="https://example.com"
      />
    </div>
  );

  const renderCapacityInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Rooms <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.rooms}
            onChange={(e) => handleInputChange('rooms', parseInt(e.target.value) || 0)}
            min="1"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          {errors.rooms && <p className="text-red-500 text-sm mt-1">{errors.rooms}</p>}
        </div>

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
            Max Concurrent Appointments <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.maxConcurrentAppointments}
            onChange={(e) => handleInputChange('maxConcurrentAppointments', parseInt(e.target.value) || 0)}
            min="1"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
          {errors.maxConcurrentAppointments && <p className="text-red-500 text-sm mt-1">{errors.maxConcurrentAppointments}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Centre Features
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {availableFeatures.map((feature) => (
            <label key={feature} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.features.includes(feature)}
                onChange={() => handleFeatureToggle(feature)}
                className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              <span className="text-sm text-gray-700 capitalize">{feature.replace('-', ' ')}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  const renderWorkingHours = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Clock className="w-5 h-5 text-blue-600 mr-2" />
          <p className="text-sm text-blue-800">
            Set the operating hours for this treatment centre. Times are in the local timezone.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {daysOfWeek.map((day) => (
          <div key={day.key} className="flex items-center space-x-4 p-4 border rounded-lg">
            <div className="w-24">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.workingHours[day.key]?.isOpen || false}
                  onChange={(e) => handleWorkingHoursChange(day.key, 'isOpen', e.target.checked)}
                  className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                />
                <span className="text-sm font-medium text-gray-700">{day.label}</span>
              </label>
            </div>

            {formData.workingHours[day.key]?.isOpen && (
              <div className="flex items-center space-x-4 flex-1">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Open</label>
                  <input
                    type="time"
                    value={formData.workingHours[day.key]?.openTime || ''}
                    onChange={(e) => handleWorkingHoursChange(day.key, 'openTime', e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Close</label>
                  <input
                    type="time"
                    value={formData.workingHours[day.key]?.closeTime || ''}
                    onChange={(e) => handleWorkingHoursChange(day.key, 'closeTime', e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderBasicInfo();
      case 2: return renderContactInfo();
      case 3: return renderCapacityInfo();
      case 4: return renderWorkingHours();
      default: return null;
    }
  };

  const stepTitles = [
    'Basic Information',
    'Contact & Address',
    'Capacity & Features',
    'Working Hours'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Building className="w-6 h-6 text-cyan-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {mode === 'create' ? 'Add New Treatment Centre' : 'Edit Treatment Centre'}
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
                    {mode === 'create' ? 'Add Centre' : 'Save Changes'}
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