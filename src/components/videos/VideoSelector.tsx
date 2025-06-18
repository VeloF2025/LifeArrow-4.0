import React, { useState, useEffect } from 'react';
import { useVideos } from '../../contexts/VideoContext';
import { Video } from '../../types/videos';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { VideoCard } from './VideoCard';
import { Search, Key, X } from 'lucide-react';
import { clsx } from 'clsx';

interface VideoSelectorProps {
  onSelect: (video: Video) => void;
  selectedVideoId?: string;
  label?: string;
  placeholder?: string;
  className?: string;
}

export const VideoSelector: React.FC<VideoSelectorProps> = ({
  onSelect,
  selectedVideoId,
  label = "Select Video",
  placeholder = "Search by title or unique ID...",
  className
}) => {
  const { videos, getVideoById } = useVideos();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Load selected video if ID is provided
  useEffect(() => {
    const loadSelectedVideo = async () => {
      if (selectedVideoId) {
        const video = await getVideoById(selectedVideoId);
        if (video) {
          setSelectedVideo(video);
        }
      } else {
        setSelectedVideo(null);
      }
    };
    
    loadSelectedVideo();
  }, [selectedVideoId]);

  // Filter videos based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredVideos(videos.slice(0, 5));
      return;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = videos.filter(video => 
      video.title.toLowerCase().includes(lowerSearchTerm) ||
      video.uniqueId.toLowerCase().includes(lowerSearchTerm)
    );
    
    setFilteredVideos(filtered.slice(0, 10));
  }, [searchTerm, videos]);

  const handleVideoSelect = (video: Video) => {
    setSelectedVideo(video);
    onSelect(video);
    setShowDropdown(false);
  };

  const handleClearSelection = () => {
    setSelectedVideo(null);
    onSelect(null as any);
  };

  return (
    <div className={clsx("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      {selectedVideo ? (
        <div className="flex items-center space-x-3 p-3 border rounded-lg">
          <div className="flex-1">
            <div className="flex items-center">
              <h4 className="font-medium text-gray-900">{selectedVideo.title}</h4>
              <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-700">
                {selectedVideo.category}
              </span>
            </div>
            <div className="flex items-center mt-1 text-xs text-gray-500">
              <Key className="w-3 h-3 mr-1" />
              <code className="bg-gray-100 px-1 rounded">{selectedVideo.uniqueId}</code>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearSelection}
            className="text-gray-400 hover:text-red-500"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder={placeholder}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
          
          {showDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
              {filteredVideos.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No videos found
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {filteredVideos.map(video => (
                    <div 
                      key={video.id}
                      onClick={() => handleVideoSelect(video)}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                        {video.thumbnailUrl ? (
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-6 h-6 text-gray-400">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="23 7 16 12 23 17 23 7" />
                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{video.title}</p>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-gray-500 flex items-center">
                            <Key className="w-3 h-3 mr-1" />
                            <code className="bg-gray-100 px-1 rounded">{video.uniqueId}</code>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};