import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Heart, 
  Shield, 
  CheckCircle, 
  ArrowRight,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';

interface OnboardingFormData {
  // Personal Information
  title: string;
  fullName: string;
  preferredName: string;
  dateOfBirth: string;
  gender: string;
  idPassportNumber: string;
  
  // Contact Details
  emailAddress: string;
  cellNumber: string;
  alternativeNumber: string;
  physicalAddress: string;
  postalAddress: string;
  preferredContactMethod: string;
  
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactNumber: string;
  relationshipToYou: string;
  
  // Medical Aid Information
  medicalAidSchemeName: string;
  medicalAidPlan: string;
  medicalAidNumber: string;
  mainMemberName: string;
  mainMemberIdNumber: string;
  
  // Consent & Declarations
  consentToProcessInfo: boolean;
  declarationTruthful: boolean;
  signature: string;
  date: string;
}

const initialFormData: OnboardingFormData = {
  title: '',
  fullName: '',
  preferredName: '',
  dateOfBirth: '',
  gender: '',
  idPassportNumber: '',
  emailAddress: '',
  cellNumber: '',
  alternativeNumber: '',
  physicalAddress: '',
  postalAddress: '',
  preferredContactMethod: '',
  emergencyContactName: '',
  emergencyContactNumber: '',
  relationshipToYou: '',
  medicalAidSchemeName: '',
  medicalAidPlan: '',
  medicalAidNumber: '',
  mainMemberName: '',
  mainMemberIdNumber: '',
  consentToProcessInfo: false,
  declarationTruthful: false,
  signature: '',
  date: new Date().toISOString().split('T')[0]
};

export const ClientOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, completeOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingFormData>({
    ...initialFormData,
    emailAddress: user?.email || '',
    fullName: user ? `${user.firstName} ${user.lastName}` : '',
    cellNumber: user?.phone || ''
  });
  const [errors, setErrors] = useState<Partial<OnboardingFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 5;

  const steps = [
    { id: 1, title: 'Personal Information', icon: User },
    { id: 2, title: 'Contact Details', icon: Phone },
    { id: 3, title: 'Emergency Contact', icon: AlertCircle },
    { id: 4, title: 'Medical Aid Information', icon: Heart },
    { id: 5, title: 'Consent & Declarations', icon: Shield }
  ];

  const handleInputChange = (field: keyof OnboardingFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<OnboardingFormData> = {};

    switch (step) {
      case 1:
        if (!formData.title) newErrors.title = 'Title is required';
        if (!formData.fullName) newErrors.fullName = 'Full name is required';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        if (!formData.idPassportNumber) newErrors.idPassportNumber = 'ID/Passport number is required';
        break;
      
      case 2:
        if (!formData.emailAddress) newErrors.emailAddress = 'Email address is required';
        if (!formData.cellNumber) newErrors.cellNumber = 'Cell number is required';
        if (!formData.physicalAddress) newErrors.physicalAddress = 'Physical address is required';
        if (!formData.preferredContactMethod) newErrors.preferredContactMethod = 'Preferred contact method is required';
        break;
      
      case 3:
        if (!formData.emergencyContactName) newErrors.emergencyContactName = 'Emergency contact name is required';
        if (!formData.emergencyContactNumber) newErrors.emergencyContactNumber = 'Emergency contact number is required';
        if (!formData.relationshipToYou) newErrors.relationshipToYou = 'Relationship is required';
        break;
      
      case 4:
        // Medical aid is optional, no validation needed
        break;
      
      case 5:
        if (!formData.consentToProcessInfo) newErrors.consentToProcessInfo = 'Consent is required';
        if (!formData.declarationTruthful) newErrors.declarationTruthful = 'Declaration is required';
        if (!formData.signature) newErrors.signature = 'Signature is required';
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
      // Complete onboarding
      await completeOnboarding(formData);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPersonalInformation = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <User className="w-5 h-5 text-blue-600 mr-2" />
          <p className="text-sm text-blue-800">
            Please complete your personal information to set up your Life Arrow profile.
          </p>
        </div>
      </div>

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
          placeholder="What would you like to be called?"
        />
      </div>

      <Input
        label="Full Name"
        value={formData.fullName}
        onChange={(e) => handleInputChange('fullName', e.target.value)}
        placeholder="Enter your full name"
        required
        error={errors.fullName}
      />

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
        placeholder="Enter your ID or passport number"
        required
        error={errors.idPassportNumber}
      />
    </div>
  );

  const renderContactDetails = () => (
    <div className="space-y-6">
      <Input
        label="Email Address"
        type="email"
        value={formData.emailAddress}
        onChange={(e) => handleInputChange('emailAddress', e.target.value)}
        placeholder="Enter your email address"
        icon={<Mail className="w-4 h-4" />}
        required
        error={errors.emailAddress}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Cell Number"
          type="tel"
          value={formData.cellNumber}
          onChange={(e) => handleInputChange('cellNumber', e.target.value)}
          placeholder="Enter your cell number"
          icon={<Phone className="w-4 h-4" />}
          required
          error={errors.cellNumber}
        />

        <Input
          label="Alternative Number"
          type="tel"
          value={formData.alternativeNumber}
          onChange={(e) => handleInputChange('alternativeNumber', e.target.value)}
          placeholder="Enter alternative number (optional)"
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
          placeholder="Enter your physical address"
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
          placeholder="Enter your postal address (if different from physical)"
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Preferred Method of Contact <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.preferredContactMethod}
          onChange={(e) => handleInputChange('preferredContactMethod', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="">Select preferred contact method</option>
          <option value="Email">Email</option>
          <option value="Phone">Phone</option>
          <option value="WhatsApp">WhatsApp</option>
          <option value="SMS">SMS</option>
        </select>
        {errors.preferredContactMethod && <p className="text-red-500 text-sm mt-1">{errors.preferredContactMethod}</p>}
      </div>
    </div>
  );

  const renderEmergencyContact = () => (
    <div className="space-y-6">
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-orange-600 mr-2" />
          <p className="text-sm text-orange-800">
            Please provide emergency contact information for someone we can reach in case of an emergency.
          </p>
        </div>
      </div>

      <Input
        label="Emergency Contact Name"
        value={formData.emergencyContactName}
        onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
        placeholder="Enter emergency contact's full name"
        required
        error={errors.emergencyContactName}
      />

      <Input
        label="Emergency Contact Number"
        type="tel"
        value={formData.emergencyContactNumber}
        onChange={(e) => handleInputChange('emergencyContactNumber', e.target.value)}
        placeholder="Enter emergency contact's phone number"
        icon={<Phone className="w-4 h-4" />}
        required
        error={errors.emergencyContactNumber}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Relationship to You <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.relationshipToYou}
          onChange={(e) => handleInputChange('relationshipToYou', e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        >
          <option value="">Select relationship</option>
          <option value="Parent">Parent</option>
          <option value="Spouse">Spouse</option>
          <option value="Sibling">Sibling</option>
          <option value="Friend">Friend</option>
          <option value="Other">Other</option>
        </select>
        {errors.relationshipToYou && <p className="text-red-500 text-sm mt-1">{errors.relationshipToYou}</p>}
      </div>
    </div>
  );

  const renderMedicalAid = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <Heart className="w-5 h-5 text-blue-600 mr-2" />
          <p className="text-sm text-blue-800">
            Medical aid information is optional. Please complete if you have medical aid coverage.
          </p>
        </div>
      </div>

      <Input
        label="Medical Aid Scheme Name"
        value={formData.medicalAidSchemeName}
        onChange={(e) => handleInputChange('medicalAidSchemeName', e.target.value)}
        placeholder="e.g., Discovery Health, Momentum Health"
      />

      <Input
        label="Medical Aid Plan/Option"
        value={formData.medicalAidPlan}
        onChange={(e) => handleInputChange('medicalAidPlan', e.target.value)}
        placeholder="e.g., Executive Plan, Comprehensive Option"
      />

      <Input
        label="Medical Aid Number"
        value={formData.medicalAidNumber}
        onChange={(e) => handleInputChange('medicalAidNumber', e.target.value)}
        placeholder="Enter your medical aid number"
      />

      <Input
        label="Main Member Name"
        value={formData.mainMemberName}
        onChange={(e) => handleInputChange('mainMemberName', e.target.value)}
        placeholder="Enter main member's name (if different)"
      />

      <Input
        label="Main Member ID Number"
        value={formData.mainMemberIdNumber}
        onChange={(e) => handleInputChange('mainMemberIdNumber', e.target.value)}
        placeholder="Enter main member's ID number"
      />
    </div>
  );

  const renderConsent = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <Shield className="w-5 h-5 text-green-600 mr-2" />
          <p className="text-sm text-green-800">
            Please review and accept the following declarations to complete your registration.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={formData.consentToProcessInfo}
              onChange={(e) => handleInputChange('consentToProcessInfo', e.target.checked)}
              className="mt-1 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Consent to Process Personal Information <span className="text-red-500">*</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                I consent to Life Arrow processing my personal information for the purpose of providing wellness services, 
                scheduling appointments, and maintaining my health records in accordance with applicable privacy laws.
              </p>
            </div>
          </label>
          {errors.consentToProcessInfo && <p className="text-red-500 text-sm mt-2">{errors.consentToProcessInfo}</p>}
        </div>

        <div className="border rounded-lg p-4">
          <label className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={formData.declarationTruthful}
              onChange={(e) => handleInputChange('declarationTruthful', e.target.checked)}
              className="mt-1 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">
                Declaration of Truthful Information <span className="text-red-500">*</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                I declare that all information provided in this form is true, complete, and accurate to the best of my knowledge. 
                I understand that providing false information may affect my treatment and services.
              </p>
            </div>
          </label>
          {errors.declarationTruthful && <p className="text-red-500 text-sm mt-2">{errors.declarationTruthful}</p>}
        </div>
      </div>

      <Input
        label="Digital Signature"
        value={formData.signature}
        onChange={(e) => handleInputChange('signature', e.target.value)}
        placeholder="Type your full name as your digital signature"
        required
        error={errors.signature}
      />

      <Input
        label="Date"
        type="date"
        value={formData.date}
        onChange={(e) => handleInputChange('date', e.target.value)}
        disabled
      />
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return renderPersonalInformation();
      case 2: return renderContactDetails();
      case 3: return renderEmergencyContact();
      case 4: return renderMedicalAid();
      case 5: return renderConsent();
      default: return null;
    }
  };

  // Get the current step's icon component
  const CurrentStepIcon = steps[currentStep - 1].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="/Life Arrow Logo.jpg"
            alt="Life Arrow"
            className="mx-auto h-16 w-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-white">Complete Your Profile</h1>
          <p className="text-gray-300 mt-2">
            Welcome {user?.firstName}! Please complete your profile to unlock all wellness features.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.id
                    ? 'bg-cyan-500 border-cyan-500 text-white'
                    : 'border-gray-600 text-gray-400'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-full h-1 mx-4 ${
                    currentStep > step.id ? 'bg-cyan-500' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <div key={step.id} className="text-center">
                <p className={`text-xs ${
                  currentStep >= step.id ? 'text-cyan-400' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CurrentStepIcon className="w-6 h-6 mr-3 text-cyan-600" />
              {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button onClick={handleNext} className="flex items-center">
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
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
                      Completing...
                    </>
                  ) : (
                    <>
                      Complete Profile
                      <CheckCircle className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step Indicator */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Step {currentStep} of {totalSteps}
          </p>
        </div>
      </div>
    </div>
  );
};