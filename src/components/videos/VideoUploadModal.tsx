import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  Video as VideoIcon, 
  Tag, 
  Plus, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Lock,
  Globe,
  Key
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useVideos } from '../../contexts/VideoContext';
import { VideoCategory, VideoUploadRequest } from '../../types/videos';
import { clsx } from 'clsx';

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const videoCategories: { value: VideoCategory; label: string }[] = [
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'educational', label: 'Educational' },
  { value: 'exercise', label: 'Exercise' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'testimonial', label: 'Testimonial' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'other', label: 'Other' }
];

export const VideoUploadModal: React.FC<VideoUploadModalProps> = ({
  isOpen,
  onClose
}) => {
  const { uploadVideo, isLoading } = useVideos();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<{
    title: string;
    uniqueId: string;
    description: string;
    category: VideoCategory;
    tags: string[];
    isPublic: boolean;
    file: File | null;
  }>({
    title: '',
    uniqueId: '',
    description: '',
    category: 'educational',
    tags: [],
    isPublic: true,
    file: null
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [tagInput, setTagInput] = useState('');

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
    const videoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (!videoTypes.includes(file.type)) {
      setErrors({ ...errors, file: 'Please select a valid video file (MP4, WebM, OGG, MOV)' });
      return;
    }

    // Validate file size (max 500MB)
    if (file.size > 500 * 1024 * 1024) {
      setErrors({ ...errors, file: 'File size must be less than 500MB' });
      return;
    }

    setFormData({ ...formData, file });
    setErrors({ ...errors, file: '' });
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleUniqueIdChange = (value: string) => {
    // Convert to kebab-case and lowercase
    const formattedValue = value
      .toLowerCase()
      .replace(/\s+/g, '-')       // Replace spaces with hyphens
      .replace(/[^a-z0-9-]/g, '') // Remove non-alphanumeric characters except hyphens
      .replace(/-+/g, '-');       // Replace multiple hyphens with single hyphen
    
    handleInputChange('uniqueId', formattedValue);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.uniqueId.trim()) newErrors.uniqueId = 'Unique ID is required';
    if (!formData.file) newErrors.file = 'Please select a video file';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setUploadStatus('uploading');
    try {
      const uploadRequest: VideoUploadRequest = {
        title: formData.title,
        uniqueId: formData.uniqueId,
        description: formData.description || undefined,
        file: formData.file!,
        category: formData.category,
        tags: formData.tags,
        isPublic: formData.isPublic
      };

      await uploadVideo(uploadRequest);
      setUploadStatus('success');
      
      // Close modal after success
      setTimeout(() => {
        onClose();
        setUploadStatus('idle');
        setFormData({
          title: '',
          uniqueId: '',
          description: '',
          category: 'educational',
          tags: [],
          isPublic: true,
          file: null
        });
      }, 2000);
    } catch (error) {
      setUploadStatus('error');
      console.error('Upload failed:', error);
      if (error instanceof Error) {
        setErrors({ ...errors, uniqueId: error.message });
      }
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
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div className="flex items-center space-x-3">
            <VideoIcon className="w-6 h-6 text-cyan-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Upload Video</h2>
              <p className="text-sm text-gray-600">Add a new video to the repository</p>
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
          {uploadStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <p className="text-green-800 font-medium">Video uploaded successfully!</p>
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
            className={clsx(
              'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
              dragActive 
                ? 'border-cyan-500 bg-cyan-50' 
                : formData.file 
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {formData.file ? (
              <div className="flex flex-col items-center space-y-3">
                <VideoIcon className="w-12 h-12 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">{formData.file.name}</p>
                  <p className="text-sm text-green-700">
                    {formatFileSize(formData.file.size)}
                  </p>
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
              <div>
                <VideoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drop your video file here, or click to browse
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Supports MP4, WebM, OGG, MOV files up to 500MB
                </p>
                <Button 
                  variant="outline" 
                  onClick={handleBrowseClick}
                >
                  Browse Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
              </div>
            )}
          </div>
          {errors.file && <p className="text-red-500 text-sm">{errors.file}</p>}

          {/* Video Details */}
          <div className="space-y-4">
            <Input
              label="Video Title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter a descriptive title"
              required
              error={errors.title}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unique ID <span className="text-red-500">*</span>
                <span className="ml-1 text-xs text-gray-500">(Used for conditional playback)</span>
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={formData.uniqueId}
                  onChange={(e) => handleUniqueIdChange(e.target.value)}
                  placeholder="e.g., high-body-fat-recommendations"
                  className={clsx(
                    "w-full pl-10 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2",
                    errors.uniqueId 
                      ? "border-red-300 focus:ring-red-500" 
                      : "border-gray-300 focus:ring-cyan-500"
                  )}
                />
              </div>
              {errors.uniqueId ? (
                <p className="text-red-500 text-sm mt-1">{errors.uniqueId}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  This ID will be used to reference this video in the frontend. Use kebab-case (lowercase with hyphens).
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter a description of the video content..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value as VideoCategory)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                {videoCategories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex space-x-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add tags..."
                  icon={<Tag className="w-4 h-4" />}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <Button 
                  variant="outline" 
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isPublic"
                checked={formData.isPublic}
                onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
              />
              <label htmlFor="isPublic" className="flex items-center text-sm font-medium text-gray-700">
                {formData.isPublic ? (
                  <>
                    <Globe className="w-4 h-4 mr-2 text-green-600" />
                    Public video (visible to all users)
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2 text-orange-600" />
                    Private video (restricted access)
                  </>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
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
                Upload Video
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};