import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Video as VideoIcon, 
  Play, 
  Grid, 
  List,
  Tag,
  Clock,
  Users,
  Calendar,
  Key
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { VideoCard } from '../components/videos/VideoCard';
import { VideoPlayer } from '../components/videos/VideoPlayer';
import { VideoUploadModal } from '../components/videos/VideoUploadModal';
import { useVideos } from '../contexts/VideoContext';
import { useAuth } from '../contexts/AuthContext';
import { Video, VideoCategory, VideoSearchFilters } from '../types/videos';
import { clsx } from 'clsx';

type ViewMode = 'grid' | 'list';

export const VideosPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    videos,
    isLoading,
    searchVideos,
    getRecentVideos,
    getVideosByCategory,
    deleteVideo,
    checkPlaybackEligibility
  } = useVideos();
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [uniqueIdSearch, setUniqueIdSearch] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [recentVideos, setRecentVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [playableVideos, setPlayableVideos] = useState<Record<string, boolean>>({});
  const [showUniqueIds, setShowUniqueIds] = useState(false);
  
  const [filters, setFilters] = useState<VideoSearchFilters>({
    sort: 'date_desc',
    page: 1,
    limit: 20
  });

  // Load initial data
  useEffect(() => {
    loadVideos();
    loadRecentVideos();
  }, []);

  // Check which videos are playable
  useEffect(() => {
    const checkVideos = async () => {
      const eligibility: Record<string, boolean> = {};
      
      for (const video of [...filteredVideos, ...recentVideos]) {
        eligibility[video.id] = await checkPlaybackEligibility(video.id);
      }
      
      setPlayableVideos(eligibility);
    };
    
    checkVideos();
  }, [filteredVideos, recentVideos]);

  const loadVideos = async () => {
    try {
      const result = await searchVideos(filters);
      setFilteredVideos(result.videos);
    } catch (error) {
      console.error('Failed to load videos:', error);
    }
  };

  const loadRecentVideos = async () => {
    try {
      const recent = await getRecentVideos(5);
      setRecentVideos(recent);
    } catch (error) {
      console.error('Failed to load recent videos:', error);
    }
  };

  const handleSearch = async () => {
    const searchFilters: VideoSearchFilters = {
      ...filters,
      title: searchTerm || undefined,
      uniqueId: uniqueIdSearch || undefined,
      page: 1
    };
    
    try {
      const result = await searchVideos(searchFilters);
      setFilteredVideos(result.videos);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleFilterChange = (key: keyof VideoSearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePlayVideo = async (video: Video) => {
    const canPlay = await checkPlaybackEligibility(video.id);
    if (canPlay) {
      setSelectedVideo(video);
      setShowPlayer(true);
    } else {
      alert('You do not have permission to play this video.');
    }
  };

  const handleDeleteVideo = async (video: Video) => {
    if (confirm(`Are you sure you want to delete "${video.title}"?`)) {
      try {
        await deleteVideo(video.id);
        loadVideos();
        loadRecentVideos();
        alert('Video deleted successfully');
      } catch (error) {
        alert('Failed to delete video');
      }
    }
  };

  const clearFilters = () => {
    setFilters({
      sort: 'date_desc',
      page: 1,
      limit: 20
    });
    setSearchTerm('');
    setUniqueIdSearch('');
  };

  const isPractitioner = user?.role === 'practitioner';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video Library</h1>
          <p className="text-gray-600 mt-1">
            Browse and watch educational and wellness videos
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {isPractitioner && (
            <Button variant="outline" onClick={() => setShowUniqueIds(!showUniqueIds)}>
              <Key className="w-4 h-4 mr-2" />
              {showUniqueIds ? 'Hide IDs' : 'Show IDs'}
            </Button>
          )}
          {isPractitioner && (
            <Button onClick={() => setShowUploadModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Upload Video
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <VideoIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Videos</p>
                <p className="text-2xl font-bold text-gray-900">{videos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Duration</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.floor(videos.reduce((sum, v) => sum + (v.duration || 0), 0) / 60)} min
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Tag className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(videos.map(v => v.category)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Contributors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(videos.map(v => v.uploadedBy)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Videos */}
      {recentVideos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {recentVideos.map(video => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onPlay={handlePlayVideo}
                  onDelete={isPractitioner ? handleDeleteVideo : undefined}
                  isPlayable={playableVideos[video.id]}
                  showUniqueId={showUniqueIds && isPractitioner}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Title Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search videos by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Unique ID Search - Only for practitioners */}
            {isPractitioner && (
              <div className="flex-1">
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search by unique ID..."
                    value={uniqueIdSearch}
                    onChange={(e) => setUniqueIdSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </Button>

            {/* Search Button */}
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={clsx(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={clsx(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">All Categories</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="educational">Educational</option>
                    <option value="exercise">Exercise</option>
                    <option value="nutrition">Nutrition</option>
                    <option value="wellness">Wellness</option>
                    <option value="testimonial">Testimonial</option>
                    <option value="marketing">Marketing</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Date From
                  </label>
                  <input
                    type="date"
                    value={filters.uploadDateFrom?.toISOString().split('T')[0] || ''}
                    onChange={(e) => handleFilterChange('uploadDateFrom', e.target.value ? new Date(e.target.value) : undefined)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="date_desc">Newest First</option>
                    <option value="date_asc">Oldest First</option>
                    <option value="title_asc">Title (A-Z)</option>
                    <option value="title_desc">Title (Z-A)</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <Button variant="ghost" onClick={clearFilters}>
                  Clear Filters
                </Button>
                <Button onClick={loadVideos}>
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Videos Display */}
      {filteredVideos.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <VideoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No videos found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || uniqueIdSearch || Object.keys(filters).some(key => filters[key as keyof VideoSearchFilters])
                ? 'Try adjusting your search or filters to find videos.'
                : "No videos have been uploaded yet."
              }
            </p>
            {isPractitioner && (!searchTerm && !uniqueIdSearch && !Object.keys(filters).some(key => filters[key as keyof VideoSearchFilters])) && (
              <Button onClick={() => setShowUploadModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Upload Your First Video
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={clsx(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        )}>
          {filteredVideos.map(video => (
            <VideoCard
              key={video.id}
              video={video}
              compact={viewMode === 'list'}
              onPlay={handlePlayVideo}
              onDelete={isPractitioner ? handleDeleteVideo : undefined}
              isPlayable={playableVideos[video.id]}
              showUniqueId={showUniqueIds && isPractitioner}
            />
          ))}
        </div>
      )}

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          isOpen={showPlayer}
          onClose={() => setShowPlayer(false)}
        />
      )}

      {/* Upload Modal */}
      <VideoUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
      />
    </div>
  );
};