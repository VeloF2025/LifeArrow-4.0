export interface Video {
  id: string;
  uniqueId: string; // Unique identifier for conditional playback
  title: string;
  description?: string;
  url: string;
  thumbnailUrl?: string;
  duration?: number; // in seconds
  category: VideoCategory;
  tags: string[];
  uploadDate: Date;
  uploadedBy: string;
  isPublic: boolean;
  status: 'active' | 'inactive' | 'processing';
  playbackConditions?: PlaybackCondition[];
  metadata?: Record<string, any>;
}

export type VideoCategory = 
  | 'tutorial' 
  | 'educational' 
  | 'exercise' 
  | 'nutrition' 
  | 'wellness' 
  | 'testimonial'
  | 'marketing'
  | 'other';

export interface PlaybackCondition {
  type: 'client' | 'practitioner' | 'scan' | 'appointment' | 'date' | 'custom';
  field?: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
  value: any;
  secondValue?: any; // For 'between' operator
}

export interface VideoSearchFilters {
  title?: string;
  uniqueId?: string; // Search by uniqueId
  category?: VideoCategory;
  tags?: string[];
  uploadDateFrom?: Date;
  uploadDateTo?: Date;
  isPublic?: boolean;
  status?: 'active' | 'inactive' | 'processing';
  sort?: 'date_asc' | 'date_desc' | 'title_asc' | 'title_desc';
  page?: number;
  limit?: number;
}

export interface VideoSearchResult {
  videos: Video[];
  totalCount: number;
  page: number;
  totalPages: number;
}

export interface VideoUploadRequest {
  title: string;
  uniqueId: string; // Required unique identifier
  description?: string;
  file: File;
  category: VideoCategory;
  tags: string[];
  isPublic: boolean;
  playbackConditions?: PlaybackCondition[];
  metadata?: Record<string, any>;
}