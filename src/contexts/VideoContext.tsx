import React, { createContext, useContext, useState, useEffect } from 'react';
import { Video, VideoCategory, VideoSearchFilters, VideoSearchResult, VideoUploadRequest } from '../types/videos';
import { useAuth } from './AuthContext';

interface VideoContextType {
  videos: Video[];
  isLoading: boolean;
  
  // Video management
  uploadVideo: (uploadData: VideoUploadRequest) => Promise<Video>;
  getVideoById: (id: string) => Promise<Video | null>;
  getVideoByUniqueId: (uniqueId: string) => Promise<Video | null>;
  updateVideo: (id: string, updates: Partial<Video>) => Promise<Video>;
  deleteVideo: (id: string) => Promise<void>;
  toggleVideoStatus: (id: string) => Promise<void>;
  
  // Search and filtering
  searchVideos: (filters: VideoSearchFilters) => Promise<VideoSearchResult>;
  getRecentVideos: (limit?: number) => Promise<Video[]>;
  getVideosByCategory: (category: VideoCategory, limit?: number) => Promise<Video[]>;
  
  // Playback conditions
  checkPlaybackEligibility: (videoId: string) => Promise<boolean>;
}

const VideoContext = createContext<VideoContextType | undefined>(undefined);

export const useVideos = () => {
  const context = useContext(VideoContext);
  if (context === undefined) {
    throw new Error('useVideos must be used within a VideoProvider');
  }
  return context;
};

// Mock data for demonstration
const mockVideos: Video[] = [
  {
    id: 'video-001',
    uniqueId: 'intro-body-composition',
    title: 'Introduction to Body Composition Analysis',
    description: 'Learn about the basics of body composition analysis and how to interpret your scan results.',
    url: 'https://example.com/videos/intro-body-composition.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    duration: 360, // 6 minutes
    category: 'educational',
    tags: ['body composition', 'tutorial', 'beginner'],
    uploadDate: new Date('2024-01-15'),
    uploadedBy: '1', // Dr. Sarah Johnson
    isPublic: true,
    status: 'active',
  },
  {
    id: 'video-002',
    uniqueId: 'nutrition-strategies',
    title: 'Advanced Nutrition Strategies',
    description: 'Detailed guide on nutrition strategies for optimal wellness and performance.',
    url: 'https://example.com/videos/advanced-nutrition.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    duration: 1200, // 20 minutes
    category: 'nutrition',
    tags: ['nutrition', 'advanced', 'meal planning'],
    uploadDate: new Date('2024-01-20'),
    uploadedBy: '1',
    isPublic: true,
    status: 'active',
  },
  {
    id: 'video-003',
    uniqueId: 'morning-stretch',
    title: 'Morning Stretching Routine',
    description: 'A 10-minute morning stretching routine to improve flexibility and start your day right.',
    url: 'https://example.com/videos/morning-stretch.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    duration: 600, // 10 minutes
    category: 'exercise',
    tags: ['exercise', 'stretching', 'morning routine'],
    uploadDate: new Date('2024-01-25'),
    uploadedBy: '2', // Michael Chen
    isPublic: true,
    status: 'active',
  },
  {
    id: 'video-004',
    uniqueId: 'weight-loss-success',
    title: 'Client Success Story: Weight Loss Journey',
    description: 'Hear from one of our clients about their successful weight loss journey with Life Arrow.',
    url: 'https://example.com/videos/success-story.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/6551144/pexels-photo-6551144.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    duration: 480, // 8 minutes
    category: 'testimonial',
    tags: ['success story', 'weight loss', 'testimonial'],
    uploadDate: new Date('2024-02-01'),
    uploadedBy: '1',
    isPublic: true,
    status: 'active',
  },
  {
    id: 'video-005',
    uniqueId: 'inbody-scanner-training',
    title: 'Practitioner Training: Using the InBody Scanner',
    description: 'Training video for practitioners on how to use the InBody scanner and interpret results.',
    url: 'https://example.com/videos/inbody-training.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/7089401/pexels-photo-7089401.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    duration: 1800, // 30 minutes
    category: 'tutorial',
    tags: ['training', 'inbody', 'scanner', 'practitioner'],
    uploadDate: new Date('2024-02-05'),
    uploadedBy: '4', // Admin User
    isPublic: false,
    status: 'active',
    playbackConditions: [
      {
        type: 'practitioner',
        operator: 'equals',
        value: true
      }
    ]
  },
  {
    id: 'video-006',
    uniqueId: 'high-body-fat',
    title: 'Understanding High Body Fat Percentage',
    description: 'Educational video explaining what high body fat percentage means and strategies to address it.',
    url: 'https://example.com/videos/high-body-fat.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    duration: 720, // 12 minutes
    category: 'educational',
    tags: ['body fat', 'weight management', 'health risks'],
    uploadDate: new Date('2024-02-10'),
    uploadedBy: '1',
    isPublic: true,
    status: 'active',
    playbackConditions: [
      {
        type: 'scan',
        field: 'body_fat_percentage',
        operator: 'greater_than',
        value: 25
      }
    ]
  },
  {
    id: 'video-007',
    uniqueId: 'low-muscle-mass',
    title: 'Building Muscle Mass: Essential Guide',
    description: 'Comprehensive guide to building muscle mass for clients with low muscle mass readings.',
    url: 'https://example.com/videos/building-muscle.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/1229356/pexels-photo-1229356.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    duration: 900, // 15 minutes
    category: 'exercise',
    tags: ['muscle building', 'strength training', 'nutrition'],
    uploadDate: new Date('2024-02-15'),
    uploadedBy: '3', // Emily Davis
    isPublic: true,
    status: 'active',
    playbackConditions: [
      {
        type: 'scan',
        field: 'muscle_mass',
        operator: 'less_than',
        value: 40
      }
    ]
  },
  {
    id: 'video-008',
    uniqueId: 'excellent-wellness-score',
    title: 'Maintaining Your Excellent Wellness',
    description: 'Tips and strategies for maintaining an excellent wellness score and overall health.',
    url: 'https://example.com/videos/maintain-wellness.mp4',
    thumbnailUrl: 'https://images.pexels.com/photos/3771069/pexels-photo-3771069.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    duration: 540, // 9 minutes
    category: 'wellness',
    tags: ['wellness', 'maintenance', 'healthy habits'],
    uploadDate: new Date('2024-02-20'),
    uploadedBy: '1',
    isPublic: true,
    status: 'active',
    playbackConditions: [
      {
        type: 'scan',
        field: 'body_wellness_score',
        operator: 'greater_than',
        value: 85
      }
    ]
  }
];

export const VideoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>(mockVideos);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate API delay
  const simulateApiDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

  const uploadVideo = async (uploadData: VideoUploadRequest): Promise<Video> => {
    setIsLoading(true);
    await simulateApiDelay(1500); // Longer delay for upload
    
    // Check if uniqueId already exists
    const existingVideo = videos.find(v => v.uniqueId === uploadData.uniqueId);
    if (existingVideo) {
      throw new Error(`A video with uniqueId "${uploadData.uniqueId}" already exists. Please use a different uniqueId.`);
    }
    
    const newVideo: Video = {
      id: `video-${Date.now()}`,
      uniqueId: uploadData.uniqueId,
      title: uploadData.title,
      description: uploadData.description,
      url: URL.createObjectURL(uploadData.file), // In a real app, this would be a server URL
      thumbnailUrl: 'https://images.pexels.com/photos/7089401/pexels-photo-7089401.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2', // Placeholder
      duration: 0, // Would be determined after processing
      category: uploadData.category,
      tags: uploadData.tags,
      uploadDate: new Date(),
      uploadedBy: user?.id || '1',
      isPublic: uploadData.isPublic,
      status: 'processing', // Initially processing
      playbackConditions: uploadData.playbackConditions,
      metadata: uploadData.metadata
    };
    
    setVideos(prev => [newVideo, ...prev]);
    
    // Simulate video processing
    setTimeout(() => {
      setVideos(prev => prev.map(video => 
        video.id === newVideo.id 
          ? { 
              ...video, 
              status: 'active',
              duration: Math.floor(Math.random() * 1200) + 300 // Random duration between 5-25 minutes
            } 
          : video
      ));
    }, 5000);
    
    setIsLoading(false);
    return newVideo;
  };

  const getVideoById = async (id: string): Promise<Video | null> => {
    await simulateApiDelay();
    return videos.find(video => video.id === id) || null;
  };
  
  const getVideoByUniqueId = async (uniqueId: string): Promise<Video | null> => {
    await simulateApiDelay();
    return videos.find(video => video.uniqueId === uniqueId) || null;
  };

  const updateVideo = async (id: string, updates: Partial<Video>): Promise<Video> => {
    setIsLoading(true);
    await simulateApiDelay();
    
    const updatedVideo = videos.find(video => video.id === id);
    if (!updatedVideo) throw new Error('Video not found');
    
    // Check if uniqueId is being updated and if it already exists
    if (updates.uniqueId && updates.uniqueId !== updatedVideo.uniqueId) {
      const existingVideo = videos.find(v => v.uniqueId === updates.uniqueId);
      if (existingVideo) {
        throw new Error(`A video with uniqueId "${updates.uniqueId}" already exists. Please use a different uniqueId.`);
      }
    }
    
    const newVideo = { ...updatedVideo, ...updates };
    setVideos(prev => prev.map(video => video.id === id ? newVideo : video));
    
    setIsLoading(false);
    return newVideo;
  };

  const deleteVideo = async (id: string): Promise<void> => {
    setIsLoading(true);
    await simulateApiDelay();
    
    setVideos(prev => prev.filter(video => video.id !== id));
    setIsLoading(false);
  };

  const toggleVideoStatus = async (id: string): Promise<void> => {
    const video = videos.find(v => v.id === id);
    if (video) {
      const newStatus = video.status === 'active' ? 'inactive' : 'active';
      await updateVideo(id, { status: newStatus });
    }
  };

  const searchVideos = async (filters: VideoSearchFilters): Promise<VideoSearchResult> => {
    await simulateApiDelay();
    let filteredVideos = [...videos];
    
    // Apply filters
    if (filters.title) {
      filteredVideos = filteredVideos.filter(video =>
        video.title.toLowerCase().includes(filters.title!.toLowerCase())
      );
    }
    
    if (filters.uniqueId) {
      filteredVideos = filteredVideos.filter(video =>
        video.uniqueId.toLowerCase().includes(filters.uniqueId!.toLowerCase())
      );
    }
    
    if (filters.category) {
      filteredVideos = filteredVideos.filter(video => video.category === filters.category);
    }
    
    if (filters.tags && filters.tags.length > 0) {
      filteredVideos = filteredVideos.filter(video =>
        filters.tags!.some(tag => video.tags.includes(tag))
      );
    }
    
    if (filters.uploadDateFrom) {
      filteredVideos = filteredVideos.filter(video => video.uploadDate >= filters.uploadDateFrom!);
    }
    
    if (filters.uploadDateTo) {
      filteredVideos = filteredVideos.filter(video => video.uploadDate <= filters.uploadDateTo!);
    }
    
    if (filters.isPublic !== undefined) {
      filteredVideos = filteredVideos.filter(video => video.isPublic === filters.isPublic);
    }
    
    if (filters.status) {
      filteredVideos = filteredVideos.filter(video => video.status === filters.status);
    }
    
    // Apply sorting
    switch (filters.sort) {
      case 'date_asc':
        filteredVideos.sort((a, b) => a.uploadDate.getTime() - b.uploadDate.getTime());
        break;
      case 'date_desc':
        filteredVideos.sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
        break;
      case 'title_asc':
        filteredVideos.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title_desc':
        filteredVideos.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        filteredVideos.sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
    }
    
    // Apply pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedVideos = filteredVideos.slice(startIndex, endIndex);
    
    return {
      videos: paginatedVideos,
      totalCount: filteredVideos.length,
      page,
      totalPages: Math.ceil(filteredVideos.length / limit)
    };
  };

  const getRecentVideos = async (limit = 5): Promise<Video[]> => {
    await simulateApiDelay();
    
    // Filter for public videos or videos uploaded by the current user
    const accessibleVideos = videos.filter(video => 
      video.isPublic || video.uploadedBy === user?.id
    );
    
    return accessibleVideos
      .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime())
      .slice(0, limit);
  };

  const getVideosByCategory = async (category: VideoCategory, limit = 10): Promise<Video[]> => {
    await simulateApiDelay();
    
    // Filter for public videos or videos uploaded by the current user
    const accessibleVideos = videos.filter(video => 
      (video.isPublic || video.uploadedBy === user?.id) && 
      video.category === category
    );
    
    return accessibleVideos
      .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime())
      .slice(0, limit);
  };

  const checkPlaybackEligibility = async (videoId: string): Promise<boolean> => {
    await simulateApiDelay(200);
    
    const video = videos.find(v => v.id === videoId);
    if (!video) return false;
    
    // If no conditions or public video, allow playback
    if (!video.playbackConditions || video.playbackConditions.length === 0) {
      return video.isPublic || video.uploadedBy === user?.id;
    }
    
    // Check each condition
    for (const condition of video.playbackConditions) {
      switch (condition.type) {
        case 'practitioner':
          if (condition.operator === 'equals' && condition.value === true) {
            if (user?.role !== 'practitioner') return false;
          }
          break;
        case 'client':
          if (condition.operator === 'equals' && condition.value === true) {
            if (user?.role !== 'client') return false;
          }
          break;
        // Add more condition checks as needed
      }
    }
    
    return true;
  };

  return (
    <VideoContext.Provider value={{
      videos,
      isLoading,
      uploadVideo,
      getVideoById,
      getVideoByUniqueId,
      updateVideo,
      deleteVideo,
      toggleVideoStatus,
      searchVideos,
      getRecentVideos,
      getVideosByCategory,
      checkPlaybackEligibility,
    }}>
      {children}
    </VideoContext.Provider>
  );
};