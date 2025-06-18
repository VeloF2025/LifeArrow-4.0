import React, { useState } from 'react';
import { X, User, Mail, Phone, MapPin, Heart, AlertCircle, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: any) => void;
}

interface ClientFormData {
  // Personal Information
  title: string;
  firstName: string;
  lastName: string;
  preferredName: string;
  dateOfBirth: string;
  gender: string;
  idPassportNumber: string;
  
  // Contact Details
  email: string;
  phone: string;
  alternativePhone: string;
  physicalAddress: string;
  postalAddress: string;
  preferredContactMethod: string;
  
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  
  // Medical Information
  medicalHistory: string;
  allergies: string;
  medications: string;
  
  // Wellness Goals
  goals: string[];
  notes: string;
}

const initialFormData: ClientFormData = {
  title: '',
  firstName: '',
  lastName: '',
  preferredName: '',
  dateOfBirth: '',
  gender: '',
  idPassportNumber: '',
  email: '',
  phone: '',
  alternativePhone: '',
  physicalAddress: '',
  postalAddress: '',
  preferredContactMethod: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelationship: '',
  medicalHistory: '',
  allergies: '',
  medications: '',
  goals: [],
  notes: ''
};

const availableGoals = [
  'Weight Loss',
  'Muscle Gain',
  'Improved Energy',
  'Better Sleep',
  'Stress Management',
  'Flexibility',
  'Endurance',
  'Heart Health',
  'Nutrition',
  'Balance',
  'Strength Training',
  'Mental Wellness'
];

export const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<ClientFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Partial<ClientFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 4;

  const steps = [
    { id: 1, title: 'Personal Information', icon: User },
    { id: 2, title: 'Contact & Emergency', icon: Phone },
    { id: 3, title: 'Medical Information', icon: Heart },
    { id: 4, title: 'Goals & Notes', icon: AlertCircle }
  ];

  if (!isOpen) return null;

  const handleInputChange = (field: keyof ClientFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<ClientFormData> = {};

    switch (step) {
      case 1:
        if (!formData.title) newErrors.title = 'Title is required';
        if (!formData.firstName) newErrors.firstName = 'First name is required';
        if (!formData.lastName) newErrors.lastName = 'Last name is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        break;
      
      case 2:
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.phone) newErrors.phone = 'Phone number is required';
        if (!formData.physicalAddress) newErrors.physicalAddress = 'Address is required';
        if (!formData.emergencyContactName) newErrors.emergencyContactName = 'Emergency contact name is required';
        if (!formData.emergencyContactPhone) newErrors.emergencyContactPhone = 'Emergency contact phone is required';
        break;
      
      case 3:
        // Medical information is optional
        break;
      
      case 4:
        // Goals and notes are optional
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
      // Create client object
      const newClient = {
        id: Date.now().toString(),
        ...formData,
        avatar: `https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2`,
        wellnessScore: Math.floor(Math.random() * 40) + 60, // Random score between 60-100
        status: 'active' as const,
        joinDate: new Date(),
        lastScanDate: new Date(),
        dateOfBirth: new Date(formData.dateOfBirth)
      };

      await onSave(newClient);
      
      // Reset form
      setFormData(initialFormData);
      setCurrentStep(1);
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Failed to add client:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoalToggle = (goal: string) => {
    const currentGoals = formData.goals;
    if (currentGoals.includes(goal)) {
      handleInputChange('goals', currentGoals.filter(g => g !== goal));
    } else {
      handleInputChange('goals', [...currentGoals, goal]);
    }
  };

  const renderPersonalInformation = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">Select Title</option>
            <option value="Mr">Mr</option>
            <option value="Mrs">Mrs</option>
            <option value="Miss">Miss</option>
            <option value="Ms">Ms</option>
            <option value="Dr">Dr</option>
            <option value="Prof">Prof</option>
          </select>
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        <Input
          label="Preferred Name"
          value={formData.preferredName}
          onChange={(e) => handleInputChange('preferredName', e.target.value)}
          placeholder="What should we call you?"
        />
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
          label="Date of Birth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
          required
          error={errors.dateOfBirth}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.gender}
            onChange={(e) => handleInputChange('gender', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">Prefer not to say</option>
          </select>
          {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
        </div>
      </div>

      <Input
        label="ID/Passport Number"
        value={formData.idPassportNumber}
        onChange={(e) => handleInputChange('idPassportNumber', e.target.value)}
        placeholder="Enter ID or passport number"
      />
    </div>
  );

  const renderContactInformation = () => (
    <div className="space-y-6">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Contact Method
          </label>
          <select
            value={formData.preferredContactMethod}
            onChange={(e) => handleInputChange('preferredContactMethod', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">Select method</option>
            <option value="Email">Email</option>
            <option value="Phone">Phone</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="SMS">SMS</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <Input
          label="Alternative Phone"
          type="tel"
          value={formData.alternativePhone}
          onChange={(e) => handleInputChange('alternativePhone', e.target.value)}
          placeholder="Enter alternative number"
          icon={<Phone className="w-4 h-4" />}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Physical Address <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.physicalAddress}
          onChange={(e) => handleInputChange('physicalAddress', e.target.value)}
          placeholder="Enter physical address"
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        {errors.physicalAddress && <p className="text-red-500 text-sm mt-1">{errors.physicalAddress}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Postal Address
        </label>
        <textarea
          value={formData.postalAddress}
          onChange={(e) => handleInputChange('postalAddress', e.target.value)}
          placeholder="Enter postal address (if different)"
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {/* Emergency Contact */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
          Emergency Contact
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Emergency Contact Name"
            value={formData.emergencyContactName}
            onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
            placeholder="Enter emergency contact name"
            required
            error={errors.emergencyContactName}
          />

          <Input
            label="Emergency Contact Phone"
            type="tel"
            value={formData.emergencyContactPhone}
            onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
            placeholder="Enter emergency contact phone"
            icon={<Phone className="w-4 h-4" />}
            required
            error={errors.emergencyContactPhone}
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Relationship
          </label>
          <select
            value={formData.emergencyContactRelationship}
            onChange={(e) => handleInputChange('emergencyContactRelationship', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="">Select relationship</option>
            <option value="Parent">Parent</option>
            <option value="Spouse">Spouse</option>
            <option value="Sibling">Sibling</option>
            <option value="Friend">Friend</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderMedicalInformation = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Heart className="w-5 h-5 text-blue-600 mr-2" />
          <p className="text-sm text-blue-800">
            Medical information helps us provide better care. All fields are optional.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Medical History
        </label>
        <textarea
          value={formData.medicalHistory}
          onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
          placeholder="Enter any relevant medical history, conditions, or previous surgeries..."
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Allergies
        </label>
        <textarea
          value={formData.allergies}
          onChange={(e) => handleInputChange('allergies', e.target.value)}
          placeholder="List any known allergies (food, medication, environmental)..."
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Medications
        </label>
        <textarea
          value={formData.medications}
          onChange={(e) => handleInputChange('medications', e.target.value)}
          placeholder="List current medications, supplements, or vitamins..."
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>
    </div>
  );

  const renderGoalsAndNotes = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Wellness Goals
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {availableGoals.map((goal) => (
            <label key={goal} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.goals.includes(goal)}
                onChange={() => handleGoalToggle(goal)}
                className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              <span className="text-sm text-gray-700">{goal}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Any additional information, specific concerns, or goals not listed above..."
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">Review Your Information</h4>
        <p className="text-sm text-green-800">
          Please review all the information you've entered. You can go back to previous steps to make changes if needed.
        </p>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderPersonalInformation();
      case 2: return renderContactInformation();
      case 3: return renderMedicalInformation();
      case 4: return renderGoalsAndNotes();
      default: return null;
    }
  };

  const CurrentStepIcon = steps[currentStep - 1].icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <CurrentStepIcon className="w-6 h-6 text-cyan-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add New Client</h2>
              <p className="text-sm text-gray-600">{steps[currentStep - 1].title}</p>
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
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= step.id
                    ? 'bg-cyan-500 border-cyan-500 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}>
                  {currentStep > step.id ? (
                    <span className="text-sm">✓</span>
                  ) : (
                    <span className="text-sm">{step.id}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-full h-1 mx-4 ${
                    currentStep > step.id ? 'bg-cyan-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
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
                className="flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding Client...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Add Client
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