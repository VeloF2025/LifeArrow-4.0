import React, { useState, useEffect } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Heart, 
  Shield, 
  Save,
  Edit,
  X,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';

interface ProfileFormData {
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
}

export const ClientProfileForm: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    title: '',
    fullName: user ? `${user.firstName} ${user.lastName}` : '',
    preferredName: '',
    dateOfBirth: '',
    gender: '',
    idPassportNumber: '',
    emailAddress: user?.email || '',
    cellNumber: user?.phone || '',
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
    mainMemberIdNumber: ''
  });

  useEffect(() => {
    // Load existing profile data if available
    if (user?.onboardingData) {
      setFormData(prev => ({ ...prev, ...user.onboardingData }));
    }
  }, [user]);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (user?.onboardingData) {
      setFormData(prev => ({ ...prev, ...user.onboardingData }));
    }
    setIsEditing(false);
  };

  const isProfileComplete = () => {
    const requiredFields = [
      'title', 'fullName', 'dateOfBirth', 'gender', 'idPassportNumber',
      'emailAddress', 'cellNumber', 'physicalAddress', 'preferredContactMethod',
      'emergencyContactName', 'emergencyContactNumber', 'relationshipToYou'
    ];
    
    return requiredFields.every(field => formData[field as keyof ProfileFormData]);
  };

  const renderPersonalInformation = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <User className="w-5 h-5 mr-2 text-blue-600" />
            Personal Information
          </span>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title {!isEditing && <span className="text-red-500">*</span>}
            </label>
            {isEditing ? (
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
            ) : (
              <p className={`text-gray-900 ${!formData.title ? 'text-red-500 italic' : ''}`}>
                {formData.title || 'Required - Please add your title'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Name
            </label>
            {isEditing ? (
              <Input
                value={formData.preferredName}
                onChange={(e) => handleInputChange('preferredName', e.target.value)}
                placeholder="What should we call you?"
              />
            ) : (
              <p className="text-gray-900">{formData.preferredName || 'Not specified'}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name {!isEditing && <span className="text-red-500">*</span>}
            </label>
            {isEditing ? (
              <Input
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="Enter your full name"
              />
            ) : (
              <p className="text-gray-900">{formData.fullName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth {!isEditing && <span className="text-red-500">*</span>}
            </label>
            {isEditing ? (
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              />
            ) : (
              <p className={`text-gray-900 ${!formData.dateOfBirth ? 'text-red-500 italic' : ''}`}>
                {formData.dateOfBirth || 'Required - Please add your date of birth'}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender {!isEditing && <span className="text-red-500">*</span>}
            </label>
            {isEditing ? (
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
            ) : (
              <p className={`text-gray-900 ${!formData.gender ? 'text-red-500 italic' : ''}`}>
                {formData.gender || 'Required - Please select your gender'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID/Passport Number {!isEditing && <span className="text-red-500">*</span>}
            </label>
            {isEditing ? (
              <Input
                value={formData.idPassportNumber}
                onChange={(e) => handleInputChange('idPassportNumber', e.target.value)}
                placeholder="Enter ID or passport number"
              />
            ) : (
              <p className={`text-gray-900 ${!formData.idPassportNumber ? 'text-red-500 italic' : ''}`}>
                {formData.idPassportNumber || 'Required - Please add your ID/Passport number'}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderContactDetails = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Phone className="w-5 h-5 mr-2 text-green-600" />
          Contact Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address {!isEditing && <span className="text-red-500">*</span>}
            </label>
            {isEditing ? (
              <Input
                type="email"
                value={formData.emailAddress}
                onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                placeholder="Enter your email address"
                icon={<Mail className="w-4 h-4" />}
              />
            ) : (
              <p className="text-gray-900">{formData.emailAddress}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Contact Method {!isEditing && <span className="text-red-500">*</span>}
            </label>
            {isEditing ? (
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
            ) : (
              <p className={`text-gray-900 ${!formData.preferredContactMethod ? 'text-red-500 italic' : ''}`}>
                {formData.preferredContactMethod || 'Required - Please select contact method'}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cell Number {!isEditing && <span className="text-red-500">*</span>}
            </label>
            {isEditing ? (
              <Input
                type="tel"
                value={formData.cellNumber}
                onChange={(e) => handleInputChange('cellNumber', e.target.value)}
                placeholder="Enter your cell number"
                icon={<Phone className="w-4 h-4" />}
              />
            ) : (
              <p className="text-gray-900">{formData.cellNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alternative Number
            </label>
            {isEditing ? (
              <Input
                type="tel"
                value={formData.alternativeNumber}
                onChange={(e) => handleInputChange('alternativeNumber', e.target.value)}
                placeholder="Enter alternative number"
                icon={<Phone className="w-4 h-4" />}
              />
            ) : (
              <p className="text-gray-900">{formData.alternativeNumber || 'Not specified'}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Physical Address {!isEditing && <span className="text-red-500">*</span>}
          </label>
          {isEditing ? (
            <textarea
              value={formData.physicalAddress}
              onChange={(e) => handleInputChange('physicalAddress', e.target.value)}
              placeholder="Enter your physical address"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          ) : (
            <p className={`text-gray-900 ${!formData.physicalAddress ? 'text-red-500 italic' : ''}`}>
              {formData.physicalAddress || 'Required - Please add your physical address'}
            </p>
          )}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Postal Address
          </label>
          {isEditing ? (
            <textarea
              value={formData.postalAddress}
              onChange={(e) => handleInputChange('postalAddress', e.target.value)}
              placeholder="Enter your postal address (if different)"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          ) : (
            <p className="text-gray-900">{formData.postalAddress || 'Same as physical address'}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderEmergencyContact = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
          Emergency Contact
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Contact Name {!isEditing && <span className="text-red-500">*</span>}
            </label>
            {isEditing ? (
              <Input
                value={formData.emergencyContactName}
                onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                placeholder="Enter emergency contact's full name"
              />
            ) : (
              <p className={`text-gray-900 ${!formData.emergencyContactName ? 'text-red-500 italic' : ''}`}>
                {formData.emergencyContactName || 'Required - Please add emergency contact name'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Emergency Contact Number {!isEditing && <span className="text-red-500">*</span>}
            </label>
            {isEditing ? (
              <Input
                type="tel"
                value={formData.emergencyContactNumber}
                onChange={(e) => handleInputChange('emergencyContactNumber', e.target.value)}
                placeholder="Enter emergency contact's phone number"
                icon={<Phone className="w-4 h-4" />}
              />
            ) : (
              <p className={`text-gray-900 ${!formData.emergencyContactNumber ? 'text-red-500 italic' : ''}`}>
                {formData.emergencyContactNumber || 'Required - Please add emergency contact number'}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Relationship to You {!isEditing && <span className="text-red-500">*</span>}
          </label>
          {isEditing ? (
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
          ) : (
            <p className={`text-gray-900 ${!formData.relationshipToYou ? 'text-red-500 italic' : ''}`}>
              {formData.relationshipToYou || 'Required - Please select relationship'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderMedicalAid = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Heart className="w-5 h-5 mr-2 text-blue-600" />
          Medical Aid Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            Medical aid information is optional and helps us process claims if applicable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medical Aid Scheme Name
            </label>
            {isEditing ? (
              <Input
                value={formData.medicalAidSchemeName}
                onChange={(e) => handleInputChange('medicalAidSchemeName', e.target.value)}
                placeholder="e.g., Discovery Health, Momentum Health"
              />
            ) : (
              <p className="text-gray-900">{formData.medicalAidSchemeName || 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medical Aid Plan/Option
            </label>
            {isEditing ? (
              <Input
                value={formData.medicalAidPlan}
                onChange={(e) => handleInputChange('medicalAidPlan', e.target.value)}
                placeholder="e.g., Executive Plan, Comprehensive Option"
              />
            ) : (
              <p className="text-gray-900">{formData.medicalAidPlan || 'Not specified'}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medical Aid Number
            </label>
            {isEditing ? (
              <Input
                value={formData.medicalAidNumber}
                onChange={(e) => handleInputChange('medicalAidNumber', e.target.value)}
                placeholder="Enter your medical aid number"
              />
            ) : (
              <p className="text-gray-900">{formData.medicalAidNumber || 'Not specified'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main Member Name
            </label>
            {isEditing ? (
              <Input
                value={formData.mainMemberName}
                onChange={(e) => handleInputChange('mainMemberName', e.target.value)}
                placeholder="Enter main member's name (if different)"
              />
            ) : (
              <p className="text-gray-900">{formData.mainMemberName || 'Not specified'}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Main Member ID Number
          </label>
          {isEditing ? (
            <Input
              value={formData.mainMemberIdNumber}
              onChange={(e) => handleInputChange('mainMemberIdNumber', e.target.value)}
              placeholder="Enter main member's ID number"
            />
          ) : (
            <p className="text-gray-900">{formData.mainMemberIdNumber || 'Not specified'}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">
            View and update your personal information
          </p>
        </div>
        {isEditing && (
          <div className="flex space-x-3">
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
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
        )}
      </div>

      {/* Profile Completion Alert */}
      {!isProfileComplete() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
            <div>
              <p className="font-medium text-yellow-900">Profile Incomplete</p>
              <p className="text-sm text-yellow-700">
                Please complete all required fields marked with * to ensure we can provide you with the best service.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Profile Sections */}
      {renderPersonalInformation()}
      {renderContactDetails()}
      {renderEmergencyContact()}
      {renderMedicalAid()}

      {/* Profile Completion Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2 text-green-600" />
            Profile Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`flex items-center justify-between p-4 rounded-lg border ${
            isProfileComplete() 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${
                isProfileComplete() ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <div>
                <p className={`font-medium ${
                  isProfileComplete() ? 'text-green-900' : 'text-yellow-900'
                }`}>
                  {isProfileComplete() ? 'Profile Complete' : 'Profile Incomplete'}
                </p>
                <p className={`text-sm ${
                  isProfileComplete() ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  {isProfileComplete() 
                    ? 'Your profile information is up to date' 
                    : 'Please complete all required fields'
                  }
                </p>
              </div>
            </div>
            <div className={isProfileComplete() ? 'text-green-600' : 'text-yellow-600'}>
              {isProfileComplete() ? <Shield className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};