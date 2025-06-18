import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  File, 
  Calendar, 
  MapPin, 
  User, 
  Activity,
  CheckCircle,
  AlertCircle,
  Building,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useScans } from '../../contexts/ScansContext';
import { useTreatmentCentres } from '../../contexts/TreatmentCentresContext';
import { useStaff } from '../../contexts/StaffContext';
import { ScanUploadRequest } from '../../types/scans';

interface ScanUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedClientId?: string;
}

export const ScanUploadModal: React.FC<ScanUploadModalProps> = ({
  isOpen,
  onClose,
  preselectedClientId
}) => {
  const { uploadScan, isLoading } = useScans();
  const { getActiveCentres } = useTreatmentCentres();
  const { getStaffByCentre } = useStaff();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [availableConsultants, setAvailableConsultants] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    client_id: preselectedClientId || '',
    scan_type: 'Body Composition Analysis',
    centre_id: '',
    centre_name: '',
    consultant_id: '',
    consultant_name: '',
    scan_date: new Date().toISOString().split('T')[0],
    file: null as File | null,
    metadata: {
      device_model: '',
      technician: '',
      notes: ''
    }
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const activeCentres = getActiveCentres();

  // Load consultants when centre is selected
  useEffect(() => {
    if (formData.centre_id) {
      const centreStaff = getStaffByCentre(formData.centre_id);
      // Filter for active staff who can perform scans
      const consultants = centreStaff.filter(staff => 
        staff.status === 'active' && 
        (staff.role === 'practitioner' || staff.role === 'consultant') &&
        staff.isAvailableForBooking
      );
      setAvailableConsultants(consultants);
      
      // Clear consultant selection if current consultant is not available at new centre
      if (formData.consultant_id && !consultants.find(c => c.id === formData.consultant_id)) {
        setFormData(prev => ({ 
          ...prev, 
          consultant_id: '', 
          consultant_name: '' 
        }));
      }
    } else {
      setAvailableConsultants([]);
      setFormData(prev => ({ 
        ...prev, 
        consultant_id: '', 
        consultant_name: '' 
      }));
    }
  }, [formData.centre_id, getStaffByCentre]);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = [
      'application/pdf', 
      'image/jpeg', 
      'image/png', 
      'image/tiff',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.oasis.opendocument.spreadsheet'
    ];
    
    // Check file extension as a fallback
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'tiff', 'tif', 'xls', 'xlsx', 'ods', 'csv'];
    
    if (!allowedTypes.includes(file.type) && 
        !allowedExtensions.includes(fileExtension || '')) {
      setErrors({ file: 'Please upload a PDF, JPEG, PNG, TIFF, or Excel file (XLS, XLSX, CSV)' });
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setErrors({ file: 'File size must be less than 50MB' });
      return;
    }

    setFormData(prev => ({ ...prev, file }));
    setErrors(prev => ({ ...prev, file: '' }));
  };

  const handleBrowseClick = () => {
    // Programmatically click the hidden file input
    fileInputRef.current?.click();
  };

  const handleCentreSelect = (centreId: string) => {
    const selectedCentre = activeCentres.find(c => c.id === centreId);
    if (selectedCentre) {
      setFormData(prev => ({
        ...prev,
        centre_id: centreId,
        centre_name: selectedCentre.name,
        consultant_id: '',
        consultant_name: ''
      }));
    }
    
    if (errors.centre_id) {
      setErrors(prev => ({ ...prev, centre_id: '' }));
    }
  };

  const handleConsultantSelect = (consultantId: string) => {
    const selectedConsultant = availableConsultants.find(c => c.id === consultantId);
    if (selectedConsultant) {
      setFormData(prev => ({
        ...prev,
        consultant_id: consultantId,
        consultant_name: `${selectedConsultant.title || ''} ${selectedConsultant.firstName} ${selectedConsultant.lastName}`.trim()
      }));
    }
    
    if (errors.consultant_id) {
      setErrors(prev => ({ ...prev, consultant_id: '' }));
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('metadata.')) {
      const metadataField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        metadata: { ...prev.metadata, [metadataField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.client_id) newErrors.client_id = 'Client ID is required';
    if (!formData.scan_type) newErrors.scan_type = 'Scan type is required';
    if (!formData.centre_id) newErrors.centre_id = 'Treatment centre is required';
    if (!formData.consultant_id) newErrors.consultant_id = 'Consultant is required';
    if (!formData.scan_date) newErrors.scan_date = 'Scan date is required';
    if (!formData.file) newErrors.file = 'Please select a file to upload';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setUploadStatus('uploading');
    try {
      const uploadRequest: ScanUploadRequest = {
        client_id: formData.client_id,
        scan_type: formData.scan_type,
        centre_name: formData.centre_name,
        consultant_name: formData.consultant_name,
        file: formData.file!,
        scan_date: new Date(formData.scan_date),
        metadata: formData.metadata
      };

      await uploadScan(uploadRequest);
      setUploadStatus('success');
      
      // Close modal after success
      setTimeout(() => {
        onClose();
        setUploadStatus('idle');
        setFormData({
          client_id: preselectedClientId || '',
          scan_type: 'Body Composition Analysis',
          centre_id: '',
          centre_name: '',
          consultant_id: '',
          consultant_name: '',
          scan_date: new Date().toISOString().split('T')[0],
          file: null,
          metadata: { device_model: '', technician: '', notes: '' }
        });
      }, 2000);
    } catch (error) {
      setUploadStatus('error');
      console.error('Upload failed:', error);
    }
  };

  // Get file icon based on file type
  const getFileIcon = (file: File) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (['xls', 'xlsx', 'csv', 'ods'].includes(fileExtension || '')) {
      return <FileSpreadsheet className="w-8 h-8 text-green-600" />;
    }
    
    return <File className="w-8 h-8 text-blue-600" />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[95vh] flex flex-col">
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {uploadStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-green-800 font-medium">Scan uploaded successfully!</p>
              </div>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-800 font-medium">Upload failed. Please try again.</p>
              </div>
            </div>
          )}

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-cyan-500 bg-cyan-50' 
                : formData.file 
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {formData.file ? (
              <div className="flex items-center justify-center space-x-3">
                {getFileIcon(formData.file)}
                <div>
                  <p className="font-medium text-green-900">{formData.file.name}</p>
                  <p className="text-sm text-green-700">
                    {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop your scan file here, or click to browse
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Supports PDF, JPEG, PNG, TIFF, Excel files (XLS, XLSX, CSV) up to 50MB
                </p>
                <Button 
                  variant="outline" 
                  onClick={handleBrowseClick}
                  className="cursor-pointer"
                >
                  Browse Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.tiff,.tif,.xls,.xlsx,.csv,.ods"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
              </div>
            )}
          </div>
          {errors.file && <p className="text-red-500 text-sm">{errors.file}</p>}

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Client ID"
              value={formData.client_id}
              onChange={(e) => handleInputChange('client_id', e.target.value)}
              placeholder="Enter client ID"
              icon={<User className="w-4 h-4" />}
              required
              error={errors.client_id}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scan Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.scan_type}
                onChange={(e) => handleInputChange('scan_type', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="Body Composition Analysis">Body Composition Analysis</option>
                <option value="DEXA Scan">DEXA Scan</option>
                <option value="Metabolic Assessment">Metabolic Assessment</option>
                <option value="Fitness Assessment">Fitness Assessment</option>
              </select>
              {errors.scan_type && <p className="text-red-500 text-sm mt-1">{errors.scan_type}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Treatment Centre Selection - STEP 1 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Treatment Centre <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={formData.centre_id}
                  onChange={(e) => handleCentreSelect(e.target.value)}
                  className="w-full pl-10 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">Select a treatment centre</option>
                  {activeCentres.map(centre => (
                    <option key={centre.id} value={centre.id}>
                      {centre.name} - {centre.city}
                    </option>
                  ))}
                </select>
              </div>
              {errors.centre_id && <p className="text-red-500 text-sm mt-1">{errors.centre_id}</p>}
            </div>

            {/* Consultant Selection - STEP 2 (only enabled after centre is selected) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Consultant <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={formData.consultant_id}
                  onChange={(e) => handleConsultantSelect(e.target.value)}
                  disabled={!formData.centre_id}
                  className={`w-full pl-10 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 ${!formData.centre_id ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">
                    {!formData.centre_id 
                      ? 'Select a centre first' 
                      : availableConsultants.length > 0 
                        ? 'Select a consultant' 
                        : 'No consultants available at this centre'
                    }
                  </option>
                  {availableConsultants.map(consultant => (
                    <option key={consultant.id} value={consultant.id}>
                      {consultant.title} {consultant.firstName} {consultant.lastName}
                    </option>
                  ))}
                </select>
              </div>
              {errors.consultant_id && <p className="text-red-500 text-sm mt-1">{errors.consultant_id}</p>}
            </div>
          </div>

          <Input
            label="Scan Date"
            type="date"
            value={formData.scan_date}
            onChange={(e) => handleInputChange('scan_date', e.target.value)}
            icon={<Calendar className="w-4 h-4" />}
            required
            error={errors.scan_date}
          />

          {/* Metadata Fields */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Device Model"
                value={formData.metadata.device_model}
                onChange={(e) => handleInputChange('metadata.device_model', e.target.value)}
                placeholder="e.g., InBody 970"
                icon={<Activity className="w-4 h-4" />}
              />

              <Input
                label="Technician"
                value={formData.metadata.technician}
                onChange={(e) => handleInputChange('metadata.technician', e.target.value)}
                placeholder="Technician ID or name"
                icon={<User className="w-4 h-4" />}
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.metadata.notes}
                onChange={(e) => handleInputChange('metadata.notes', e.target.value)}
                placeholder="Any additional notes about this scan..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50 flex-shrink-0">
          <Button variant="outline" onClick={onClose} disabled={uploadStatus === 'uploading'}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={uploadStatus === 'uploading' || uploadStatus === 'success'}
          >
            {uploadStatus === 'uploading' ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : uploadStatus === 'success' ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Uploaded
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