import React from 'react';
import { useConditionalVideo } from '../../hooks/useConditionalVideo';
import { ConditionalVideoPlayer } from '../videos/ConditionalVideoPlayer';
import { ScanData } from '../../types/scans';
import { Video, Play, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface ScanResultVideoProps {
  scan: ScanData;
  clientData?: any;
  fallbackVideoId?: string;
}

export const ScanResultVideo: React.FC<ScanResultVideoProps> = ({
  scan,
  clientData,
  fallbackVideoId = 'intro-body-composition'
}) => {
  const scanResult = scan.detailed_results || {};
  
  const { video, isLoading, error } = useConditionalVideo({
    scanResult: {
      body_fat_percentage: scanResult.body_fat_percentage,
      muscle_mass: scanResult.muscle_mass,
      body_wellness_score: scan.body_wellness_score,
      ...scanResult
    },
    clientData,
    fallbackVideoId
  });

  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
          <div>
            <h3 className="font-medium text-red-800">Error Loading Video</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="font-medium text-gray-900 mb-2">No Recommended Video</h3>
        <p className="text-sm text-gray-600">
          There are no specific video recommendations for this scan result.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Recommended Video</h3>
        <span className="text-sm text-gray-500">Based on your scan results</span>
      </div>
      
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <ConditionalVideoPlayer 
          uniqueId={video.uniqueId}
          fallbackMessage="Sorry, this video is not available for your account type."
        />
      </div>
    </div>
  );
};