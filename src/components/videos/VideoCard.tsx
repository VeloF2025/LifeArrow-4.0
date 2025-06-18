import React from 'react';
import { 
  Play, 
  Clock, 
  Calendar, 
  Tag, 
  Eye, 
  Edit, 
  Trash2, 
  Lock,
  Video as VideoIcon,
  User,
  Key
} from 'lucide-react';
import { Video } from '../../types/videos';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { format } from 'date-fns';
import { clsx } from 'clsx';

interface VideoCardProps {
  video: Video;
  onPlay?: (video: Video) => void;
  onEdit?: (video: Video) => void;
  onDelete?: (video: Video) => void;
  compact?: boolean;
  isPlayable?: boolean;
  showUniqueId?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onPlay,
  onEdit,
  onDelete,
  compact = false,
  isPlayable = true,
  showUniqueId = false
}) => {
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'tutorial': return 'bg-blue-100 text-blue-800';
      case 'educational': return 'bg-purple-100 text-purple-800';
      case 'exercise': return 'bg-green-100 text-green-800';
      case 'nutrition': return 'bg-orange-100 text-orange-800';
      case 'wellness': return 'bg-cyan-100 text-cyan-800';
      case 'testimonial': return 'bg-yellow-100 text-yellow-800';
      case 'marketing': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
        <div className="flex items-center space-x-3">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
            {video.thumbnailUrl ? (
              <img 
                src={video.thumbnailUrl} 
                alt={video.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <VideoIcon className="w-8 h-8 text-gray-400" />
              </div>
            )}
            {video.duration && (
              <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                {formatDuration(video.duration)}
              </div>
            )}
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900">{video.title}</h3>
            <div className="flex items-center space-x-3 text-xs text-gray-600">
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {format(video.uploadDate, 'MMM dd, yyyy')}
              </span>
              <span className={clsx(
                'px-2 py-0.5 rounded-full capitalize',
                getCategoryColor(video.category)
              )}>
                {video.category}
              </span>
            </div>
            {showUniqueId && (
              <div className="flex items-center mt-1 text-xs text-gray-500">
                <Key className="w-3 h-3 mr-1" />
                <code className="bg-gray-100 px-1 rounded">{video.uniqueId}</code>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!video.isPublic && (
            <span className="p-1 bg-gray-100 rounded-full" title="Private video">
              <Lock className="w-4 h-4 text-gray-600" />
            </span>
          )}
          
          {onPlay && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onPlay(video)}
              disabled={!isPlayable}
              className={!isPlayable ? 'opacity-50 cursor-not-allowed' : ''}
            >
              <Play className="w-4 h-4" />
            </Button>
          )}
          
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={() => onEdit(video)}>
              <Edit className="w-4 h-4" />
            </Button>
          )}
          
          {onDelete && (
            <Button variant="ghost" size="sm" onClick={() => onDelete(video)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="relative aspect-video w-full overflow-hidden rounded-t-xl">
          {video.thumbnailUrl ? (
            <img 
              src={video.thumbnailUrl} 
              alt={video.title} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <VideoIcon className="w-16 h-16 text-gray-400" />
            </div>
          )}
          
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
              {formatDuration(video.duration)}
            </div>
          )}
          
          {!video.isPublic && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center">
              <Lock className="w-3 h-3 mr-1" />
              Private
            </div>
          )}
          
          {onPlay && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button 
                className={clsx(
                  "rounded-full w-12 h-12 flex items-center justify-center bg-white bg-opacity-80 hover:bg-opacity-100 transition-all",
                  !isPlayable && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => isPlayable && onPlay(video)}
                disabled={!isPlayable}
              >
                <Play className="w-6 h-6 text-gray-900" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900">{video.title}</h3>
            <span className={clsx(
              'px-2 py-0.5 rounded-full text-xs capitalize',
              getCategoryColor(video.category)
            )}>
              {video.category}
            </span>
          </div>
          
          {showUniqueId && (
            <div className="flex items-center mb-2 text-xs text-gray-500">
              <Key className="w-3 h-3 mr-1" />
              <code className="bg-gray-100 px-1 py-0.5 rounded">{video.uniqueId}</code>
            </div>
          )}
          
          {video.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.description}</p>
          )}
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {format(video.uploadDate, 'MMM dd, yyyy')}
              </span>
              <span className="flex items-center">
                <User className="w-3 h-3 mr-1" />
                {video.uploadedBy === '1' ? 'Dr. Sarah Johnson' : 'Staff'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {onEdit && (
                <Button variant="ghost" size="sm" onClick={() => onEdit(video)}>
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              
              {onDelete && (
                <Button variant="ghost" size="sm" onClick={() => onDelete(video)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          
          {video.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {video.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
              {video.tags.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-800">
                  +{video.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};