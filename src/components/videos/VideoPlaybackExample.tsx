import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { ConditionalVideoPlayer } from './ConditionalVideoPlayer';
import { Input } from '../ui/Input';
import { VideoSelector } from './VideoSelector';
import { useVideos } from '../../contexts/VideoContext';
import { Video } from '../../types/videos';

export const VideoPlaybackExample: React.FC = () => {
  const { videos } = useVideos();
  const [uniqueId, setUniqueId] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [useSelector, setUseSelector] = useState(false);

  const handlePlayVideo = () => {
    if (useSelector && selectedVideo) {
      setUniqueId(selectedVideo.uniqueId);
      setShowPlayer(true);
    } else if (uniqueId) {
      setShowPlayer(true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Video Playback Example</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button
            variant={useSelector ? 'outline' : 'primary'}
            onClick={() => setUseSelector(false)}
          >
            Play by Unique ID
          </Button>
          <Button
            variant={useSelector ? 'primary' : 'outline'}
            onClick={() => setUseSelector(true)}
          >
            Select from Library
          </Button>
        </div>

        {useSelector ? (
          <VideoSelector
            onSelect={setSelectedVideo}
            selectedVideoId={selectedVideo?.id}
            label="Select a video to play"
          />
        ) : (
          <Input
            label="Enter Video Unique ID"
            value={uniqueId}
            onChange={(e) => setUniqueId(e.target.value)}
            placeholder="e.g., high-body-fat, nutrition-strategies"
          />
        )}

        <Button 
          onClick={handlePlayVideo}
          disabled={useSelector ? !selectedVideo : !uniqueId}
          className="w-full"
        >
          Play Video
        </Button>

        {showPlayer && (
          <div className="mt-4">
            <ConditionalVideoPlayer
              uniqueId={useSelector && selectedVideo ? selectedVideo.uniqueId : uniqueId}
              fallbackMessage="Video not found or you don't have permission to view it."
              onVideoNotFound={() => console.log("Video not found")}
              onVideoNotPlayable={() => console.log("Video not playable")}
            />
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Available Test Videos</h4>
          <div className="space-y-2 text-sm">
            {videos.slice(0, 5).map(video => (
              <div key={video.id} className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{video.title}</span>
                  <code className="ml-2 bg-gray-100 px-1 py-0.5 rounded text-xs">{video.uniqueId}</code>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setUniqueId(video.uniqueId);
                    setShowPlayer(true);
                  }}
                >
                  Play
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};