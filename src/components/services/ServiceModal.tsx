import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Activity } from 'lucide-react';
import { ServiceType } from '../../types/appointments';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceData: Omit<ServiceType, 'id'> | ServiceType) => Promise<void>;
  service?: ServiceType | null;
  mode: 'create' | 'edit';
}

interface ServiceFormData {
  name: string;
  description: string;
  duration: number;
  price: number;
  category: ServiceType['category'];
  isActive: boolean;
}

const initialFormData: ServiceFormData = {
  name: '',
  description: '',
  duration: 30,
  price: 0,
  category: 'consultation',
  isActive: true,
};

export const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  service,
  mode
}) => {
  const [formData, setFormData] = useState<ServiceFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<ServiceFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (service && mode === 'edit') {
      setFormData({
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price,
        category: service.category,
        isActive: service.isActive,
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [service, mode, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof ServiceFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ServiceFormData> = {};

    if (!formData.name.trim()) newErrors.name = 'Service name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.duration <= 0) newErrors.duration = 'Duration must be greater than 0';
    if (formData.price < 0) newErrors.price = 'Price cannot be negative';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (mode === 'edit' && service) {
        await onSave({ ...service, ...formData });
      } else {
        await onSave(formData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save service:', error);
      alert('Failed to save service. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = [
    { value: 'consultation', label: 'Consultation' },
    { value: 'scan', label: 'Scan' },
    { value: 'therapy', label: 'Therapy' },
    { value: 'assessment', label: 'Assessment' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Activity className="w-6 h-6 text-cyan-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {mode === 'create' ? 'Add New Service' : 'Edit Service'}
              </h2>
              <p className="text-sm text-gray-600">
                {mode === 'create' 
                  ? 'Create a new service offering for your practice'
                  : 'Update service details and pricing'
                }
              </p>
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <Input
              label="Service Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter service name"
              required
              error={errors.name}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what this service includes..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value as ServiceType['category'])}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & Duration */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Pricing & Duration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                  placeholder="30"
                  min="1"
                  step="5"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (R) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="100"
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-900">Service Summary</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    {formData.duration} minute {formData.category} session for R{formData.price}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-600">Rate per minute</p>
                  <p className="font-bold text-blue-900">
                    R{formData.duration > 0 ? (formData.price / formData.duration).toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Status</h3>
            
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Service is active and available for booking
              </label>
            </div>
            
            <p className="text-sm text-gray-600">
              {formData.isActive 
                ? 'Clients will be able to book this service'
                : 'This service will be hidden from clients and unavailable for booking'
              }
            </p>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50 flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
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
                {mode === 'create' ? 'Add Service' : 'Save Changes'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};