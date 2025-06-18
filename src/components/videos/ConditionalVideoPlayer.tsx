import React, { useState, useEffect } from 'react';
import { useVideos } from '../../contexts/VideoContext';
import { VideoPlayer } from './VideoPlayer';
import { Video } from '../../types/videos';

interface ConditionalVideoPlayerProps {
  uniqueId: string;
  fallbackMessage?: string;
  autoPlay?: boolean;
  onVideoNotFound?: () => void;
  onVideoNotPlayable?: () => void;
}

export const ConditionalVideoPlayer: React.FC<ConditionalVideoPlayerProps> = ({
  uniqueId,
  fallbackMessage = "The requested video is not available.",
  autoPlay = false,
  onVideoNotFound,
  onVideoNotPlayable
}) => {
  const { getVideoByUniqueId, checkPlaybackEligibility } = useVideos();
  const [video, setVideo] = useState<Video | null>(null);
  const [isPlayable, setIsPlayable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showPlayer, setShowPlayer] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVideo = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Find the video by its unique ID
        const foundVideo = await getVideoByUniqueId(uniqueId);
        
        if (!foundVideo) {
          setError(`Video with ID "${uniqueId}" not found`);
          onVideoNotFound?.();
          setIsLoading(false);
          return;
        }
        
        // Check if the current user can play this video
        const canPlay = await checkPlaybackEligibility(foundVideo.id);
        
        if (!canPlay) {
          setError("You don't have permission to view this video");
          onVideoNotPlayable?.();
          setIsLoading(false);
          return;
        }
        
        setVideo(foundVideo);
        setIsPlayable(true);
        
        // Auto-play if enabled
        if (autoPlay) {
          setShowPlayer(true);
        }
      } catch (error) {
        console.error("Error loading video:", error);
        setError("An error occurred while loading the video");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadVideo();
  }, [uniqueId, autoPlay]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-100 rounded-lg">
        <p className="text-gray-600">{error || fallbackMessage}</p>
      </div>
    );
  }

  return (
    <div>
      {!showPlayer ? (
        <div 
          className="relative aspect-video w-full overflow-hidden rounded-lg cursor-pointer"
          onClick={() => setShowPlayer(true)}
        >
          {video.thumbnailUrl ? (
            <img 
              src={video.thumbnailUrl} 
              alt={video.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <div className="w-16 h-16 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
              </div>
            </div>
          )}
          
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="rounded-full w-16 h-16 flex items-center justify-center bg-white bg-opacity-80 hover:bg-opacity-100 transition-all">
              <div className="w-8 h-8 text-gray-900">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <h3 className="text-white font-medium">{video.title}</h3>
          </div>
        </div>
      ) : (
        <VideoPlayer 
          video={video} 
          isOpen={showPlayer} 
          onClose={() => setShowPlayer(false)} 
        />
      )}
    </div>
  );
};