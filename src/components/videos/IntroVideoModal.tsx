import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '../ui/Button';
import { useVideos } from '../../contexts/VideoContext';
import { Video } from '../../types/videos';

interface IntroVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const IntroVideoModal: React.FC<IntroVideoModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const navigate = useNavigate();
  const { getVideoByUniqueId } = useVideos();
  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const loadIntroVideo = async () => {
      setIsLoading(true);
      try {
        const introVideo = await getVideoByUniqueId('intro-video');
        if (introVideo) {
          setVideo(introVideo);
        } else {
          setError('Welcome video not found');
        }
      } catch (err) {
        setError('Failed to load welcome video');
        console.error('Error loading intro video:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadIntroVideo();
    }
  }, [isOpen, getVideoByUniqueId]);

  useEffect(() => {
    // Auto-play when video is loaded
    if (video && videoRef.current && !hasStartedPlaying) {
      const playPromise = videoRef.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setHasStartedPlaying(true);
          })
          .catch(error => {
            // Auto-play was prevented, show play button
            console.log('Auto-play prevented:', error);
            setIsPlaying(false);
          });
      }
    }
  }, [video, hasStartedPlaying]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
      setHasStartedPlaying(true);
    }
  };

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(progress);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    onComplete();
    
    // Navigate to profile page after a short delay
    setTimeout(() => {
      navigate('/profile');
    }, 1000);
  };

  const handleSkip = () => {
    onComplete();
    navigate('/profile');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="relative w-full max-w-4xl">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 bg-gray-900 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 bg-gray-900 rounded-lg p-6 text-center">
            <p className="text-white mb-4">{error}</p>
            <Button onClick={handleSkip}>
              Continue to Profile Setup
            </Button>
          </div>
        ) : (
          <>
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={handleSkip}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full rounded-lg"
                src={video?.url}
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={handleVideoEnded}
                onClick={handlePlayPause}
              />
              
              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
                <div 
                  className="h-full bg-cyan-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              {/* Controls overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                {!isPlaying && (
                  <button
                    onClick={handlePlayPause}
                    className="w-16 h-16 rounded-full bg-white bg-opacity-30 hover:bg-opacity-50 flex items-center justify-center transition-all"
                  >
                    <Play className="w-8 h-8 text-white" />
                  </button>
                )}
              </div>
              
              {/* Bottom controls */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handlePlayPause}
                    className="text-white hover:text-cyan-400 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </button>
                  
                  <button
                    onClick={handleMuteToggle}
                    className="text-white hover:text-cyan-400 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSkip}
                  className="text-white border-white hover:bg-white hover:text-gray-900"
                >
                  Skip to Profile
                </Button>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <h2 className="text-xl font-bold text-white">{video?.title}</h2>
              {video?.description && (
                <p className="text-gray-300 mt-2">{video.description}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};