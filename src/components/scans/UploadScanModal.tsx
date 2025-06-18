import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Calendar, User, MapPin, UserCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useTreatmentCentres } from '../../contexts/TreatmentCentresContext';
import { useStaff } from '../../contexts/StaffContext';

interface UploadScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (scanData: any) => void;
}

interface ScanFormData {
  clientId: string;
  scanType: string;
  centreId: string;
  consultantId: string;
  scanDate: string;
  file: File | null;
}

const scanTypes = [
  'Body Composition Analysis',
  'Metabolic Assessment',
  'Cardiovascular Scan',
  'Bone Density Scan',
  'Nutritional Analysis',
  'Fitness Assessment',
  'Wellness Check-up'
];

export const UploadScanModal: React.FC<UploadScanModalProps> = ({
  isOpen,
  onClose,
  onUpload
}) => {
  const { getActiveCentres } = useTreatmentCentres();
  const { getStaffByCentre } = useStaff();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<ScanFormData>({
    clientId: '',
    scanType: 'Body Composition Analysis',
    centreId: '',
    consultantId: '',
    scanDate: new Date().toISOString().split('T')[0],
    file: null
  });
  
  const [errors, setErrors] = useState<Partial<ScanFormData>>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const activeCentres = getActiveCentres();
  const availableConsultants = formData.centreId 
    ? getStaffByCentre(formData.centreId).filter(staff => 
        staff.status === 'active' && 
        (staff.role === 'practitioner' || staff.role === 'consultant')
      )
    : [];

  if (!isOpen) return null;

  const handleInputChange = (field: keyof ScanFormData, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value,
      // Reset consultant when centre changes
      ...(field === 'centreId' ? { consultantId: '' } : {})
    }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, file: 'Please select a PDF, JPEG, PNG, or TIFF file' }));
      return;
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, file: 'File size must be less than 50MB' }));
      return;
    }

    setFormData(prev => ({ ...prev, file }));
    setErrors(prev => ({ ...prev, file: undefined }));
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ScanFormData> = {};

    if (!formData.clientId.trim()) newErrors.clientId = 'Client ID is required';
    if (!formData.centreId) newErrors.centreId = 'Centre selection is required';
    if (!formData.consultantId) newErrors.consultantId = 'Consultant selection is required';
    if (!formData.scanDate) newErrors.scanDate = 'Scan date is required';
    if (!formData.file) newErrors.file = 'Please select a file to upload';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsUploading(true);
    try {
      // Simulate file upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const selectedCentre = activeCentres.find(c => c.id === formData.centreId);
      const selectedConsultant = availableConsultants.find(c => c.id === formData.consultantId);
      
      const scanData = {
        clientId: formData.clientId,
        scanType: formData.scanType,
        centreName: selectedCentre?.name || '',
        consultantName: selectedConsultant ? `${selectedConsultant.firstName} ${selectedConsultant.lastName}` : '',
        scanDate: new Date(formData.scanDate),
        fileName: formData.file?.name || '',
        fileSize: formData.file?.size || 0,
        fileType: formData.file?.type || ''
      };

      onUpload(scanData);
      
      // Reset form
      setFormData({
        clientId: '',
        scanType: 'Body Composition Analysis',
        centreId: '',
        consultantId: '',
        scanDate: new Date().toISOString().split('T')[0],
        file: null
      });
      setErrors({});
      
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload scan. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Upload className="w-6 h-6 text-cyan-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Upload Scan</h2>
              <p className="text-sm text-gray-600">Upload a new scan file to the system</p>
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
          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scan File <span className="text-red-500">*</span>
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver
                  ? 'border-cyan-500 bg-cyan-50'
                  : formData.file
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {formData.file ? (
                <div className="space-y-3">
                  <FileText className="w-12 h-12 text-green-600 mx-auto" />
                  <div>
                    <p className="font-medium text-green-900">{formData.file.name}</p>
                    <p className="text-sm text-green-700">{formatFileSize(formData.file.size)}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBrowseClick}
                  >
                    Choose Different File
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-900">
                      Drop your scan file here, or click to browse
                    </p>
                    <p className="text-sm text-gray-600">
                      Supports PDF, JPEG, PNG, TIFF files up to 50MB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleBrowseClick}
                  >
                    Browse Files
                  </Button>
                </div>
              )}
            </div>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.tiff,.tif"
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            {errors.file && <p className="text-red-500 text-sm mt-1">{errors.file}</p>}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Client ID"
              value={formData.clientId}
              onChange={(e) => handleInputChange('clientId', e.target.value)}
              placeholder="Enter client ID"
              icon={<User className="w-4 h-4" />}
              required
              error={errors.clientId}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scan Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.scanType}
                onChange={(e) => handleInputChange('scanType', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {scanTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Centre Name <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.centreId}
                onChange={(e) => handleInputChange('centreId', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="">Select a centre</option>
                {activeCentres.map(centre => (
                  <option key={centre.id} value={centre.id}>
                    {centre.name} - {centre.city}
                  </option>
                ))}
              </select>
              {errors.centreId && <p className="text-red-500 text-sm mt-1">{errors.centreId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultant Name <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.consultantId}
                onChange={(e) => handleInputChange('consultantId', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                disabled={!formData.centreId}
              >
                <option value="">
                  {formData.centreId ? 'Select a consultant' : 'Select centre first'}
                </option>
                {availableConsultants.map(consultant => (
                  <option key={consultant.id} value={consultant.id}>
                    {consultant.title} {consultant.firstName} {consultant.lastName}
                  </option>
                ))}
              </select>
              {errors.consultantId && <p className="text-red-500 text-sm mt-1">{errors.consultantId}</p>}
            </div>
          </div>

          <Input
            label="Scan Date"
            type="date"
            value={formData.scanDate}
            onChange={(e) => handleInputChange('scanDate', e.target.value)}
            icon={<Calendar className="w-4 h-4" />}
            required
            error={errors.scanDate}
          />
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50 flex-shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isUploading || !formData.file}
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Scan
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};