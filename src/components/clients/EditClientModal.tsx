import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  avatar: string;
  wellnessScore: number;
  lastScanDate: Date;
  goals: string[];
  status: 'active' | 'inactive';
  joinDate: Date;
}

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: any) => void;
  client: Client | null;
}

interface ClientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  goals: string[];
  status: 'active' | 'inactive';
  notes: string;
}

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

export const EditClientModal: React.FC<EditClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  client
}) => {
  const [formData, setFormData] = useState<ClientFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    goals: [],
    status: 'active',
    notes: ''
  });
  const [errors, setErrors] = useState<Partial<ClientFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        firstName: client.firstName,
        lastName: client.lastName,
        email: client.email,
        phone: client.phone,
        dateOfBirth: client.dateOfBirth.toISOString().split('T')[0],
        goals: client.goals,
        status: client.status,
        notes: ''
      });
    }
  }, [client]);

  if (!isOpen || !client) return null;

  const handleInputChange = (field: keyof ClientFormData, value: string | string[] | 'active' | 'inactive') => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ClientFormData> = {};

    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const updatedClient = {
        ...client,
        ...formData,
        dateOfBirth: new Date(formData.dateOfBirth)
      };

      await onSave(updatedClient);
      onClose();
    } catch (error) {
      console.error('Failed to update client:', error);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6 text-cyan-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Edit Client</h2>
              <p className="text-sm text-gray-600">{client.firstName} {client.lastName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
          {/* Personal Information */}
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
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              required
              error={errors.dateOfBirth}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'inactive')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Wellness Goals */}
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

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add any notes about this update..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="flex items-center"
          >
            {isSubmitting ? (
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
  );
};