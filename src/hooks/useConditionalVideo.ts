import { useState, useEffect } from 'react';
import { useVideos } from '../contexts/VideoContext';
import { Video } from '../types/videos';

interface UseConditionalVideoOptions {
  scanResult?: {
    body_fat_percentage?: number;
    muscle_mass?: number;
    body_wellness_score?: number;
    [key: string]: any;
  };
  clientData?: {
    age?: number;
    gender?: string;
    goals?: string[];
    [key: string]: any;
  };
  fallbackVideoId?: string;
}

/**
 * Hook to determine which video to play based on scan results or client data
 */
export const useConditionalVideo = (options: UseConditionalVideoOptions = {}) => {
  const { getVideoByUniqueId, checkPlaybackEligibility } = useVideos();
  const [video, setVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const determineVideo = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { scanResult, clientData, fallbackVideoId } = options;
        let videoToPlay: Video | null = null;
        
        // Check scan results to determine which video to play
        if (scanResult) {
          // High body fat percentage
          if (scanResult.body_fat_percentage && scanResult.body_fat_percentage > 25) {
            const highBodyFatVideo = await getVideoByUniqueId('high-body-fat');
            if (highBodyFatVideo && await checkPlaybackEligibility(highBodyFatVideo.id)) {
              videoToPlay = highBodyFatVideo;
            }
          }
          // Low muscle mass
          else if (scanResult.muscle_mass && scanResult.muscle_mass < 40) {
            const lowMuscleVideo = await getVideoByUniqueId('low-muscle-mass');
            if (lowMuscleVideo && await checkPlaybackEligibility(lowMuscleVideo.id)) {
              videoToPlay = lowMuscleVideo;
            }
          }
          // Excellent wellness score
          else if (scanResult.body_wellness_score && scanResult.body_wellness_score > 85) {
            const excellentScoreVideo = await getVideoByUniqueId('excellent-wellness-score');
            if (excellentScoreVideo && await checkPlaybackEligibility(excellentScoreVideo.id)) {
              videoToPlay = excellentScoreVideo;
            }
          }
        }
        
        // Check client data if no video was selected based on scan results
        if (!videoToPlay && clientData) {
          // Check for specific client goals
          if (clientData.goals && clientData.goals.includes('Weight Loss')) {
            const weightLossVideo = await getVideoByUniqueId('weight-loss-success');
            if (weightLossVideo && await checkPlaybackEligibility(weightLossVideo.id)) {
              videoToPlay = weightLossVideo;
            }
          }
        }
        
        // Use fallback video if provided and no other video was selected
        if (!videoToPlay && fallbackVideoId) {
          const fallbackVideo = await getVideoByUniqueId(fallbackVideoId);
          if (fallbackVideo && await checkPlaybackEligibility(fallbackVideo.id)) {
            videoToPlay = fallbackVideo;
          }
        }
        
        // If still no video, use the introduction video as a last resort
        if (!videoToPlay) {
          const introVideo = await getVideoByUniqueId('intro-body-composition');
          if (introVideo && await checkPlaybackEligibility(introVideo.id)) {
            videoToPlay = introVideo;
          }
        }
        
        setVideo(videoToPlay);
      } catch (error) {
        console.error('Error determining video to play:', error);
        setError('Failed to determine appropriate video');
      } finally {
        setIsLoading(false);
      }
    };
    
    determineVideo();
  }, [options]);

  return { video, isLoading, error };
};