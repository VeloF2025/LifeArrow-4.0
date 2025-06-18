import React, { useState, useEffect } from 'react';
import { IntroVideoModal } from '../videos/IntroVideoModal';
import { useAuth } from '../../contexts/AuthContext';

export const ClientWelcome: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [showIntroVideo, setShowIntroVideo] = useState(false);
  
  useEffect(() => {
    // Check if this is a new client who hasn't seen the intro video
    if (user && user.role === 'client' && user.onboardingCompleted && !user.hasSeenIntroVideo) {
      setShowIntroVideo(true);
    }
  }, [user]);

  const handleVideoComplete = async () => {
    // Mark that the user has seen the intro video
    try {
      await updateProfile({ hasSeenIntroVideo: true });
    } catch (error) {
      console.error('Failed to update user profile:', error);
    }
    
    setShowIntroVideo(false);
  };

  return (
    <>
      <IntroVideoModal
        isOpen={showIntroVideo}
        onClose={() => setShowIntroVideo(false)}
        onComplete={handleVideoComplete}
      />
    </>
  );
};