import React from 'react';
import { 
  Activity, 
  Calendar, 
  MapPin, 
  User, 
  Eye, 
  Download, 
  MoreHorizontal,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { ScanCardData, ScanData } from '../../types/scans';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { WellnessScore } from '../dashboard/WellnessScore';
import { format } from 'date-fns';
import { clsx } from 'clsx';

interface ScanCardProps {
  scan: ScanCardData | ScanData;
  onView?: (scanId: string) => void;
  onDownload?: (scanId: string) => void;
  showClientInfo?: boolean;
  compact?: boolean;
  previousScore?: number;
}

export const ScanCard: React.FC<ScanCardProps> = ({
  scan,
  onView,
  onDownload,
  showClientInfo = true,
  compact = false,
  previousScore
}) => {
  const getScoreChange = () => {
    if (!previousScore) return null;
    const change = scan.body_wellness_score - previousScore;
    return {
      value: Math.abs(change),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'same',
      percentage: Math.abs((change / previousScore) * 100)
    };
  };

  const scoreChange = getScoreChange();

  if (compact) {
    return (
      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-gray-900">{scan.scan_type}</h3>
              {showClientInfo && 'client_name' in scan && (
                <span className="text-sm text-gray-600">• {scan.client_name}</span>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {format(scan.scan_date, 'MMM dd, yyyy')}
              </span>
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {scan.centre_name}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <WellnessScore score={scan.body_wellness_score} size="sm" />
          {scoreChange && (
            <div className={clsx(
              'flex items-center text-sm',
              scoreChange.direction === 'up' ? 'text-green-600' : 
              scoreChange.direction === 'down' ? 'text-red-600' : 'text-gray-600'
            )}>
              {scoreChange.direction === 'up' && <TrendingUp className="w-4 h-4 mr-1" />}
              {scoreChange.direction === 'down' && <TrendingDown className="w-4 h-4 mr-1" />}
              {scoreChange.value > 0 && (
                <span>{scoreChange.direction === 'up' ? '+' : '-'}{scoreChange.value}</span>
              )}
            </div>
          )}
          <div className="flex items-center space-x-1">
            {onView && (
              <Button variant="ghost" size="sm" onClick={() => onView(scan.scan_id)}>
                <Eye className="w-4 h-4" />
              </Button>
            )}
            {onDownload && 'file_url' in scan && scan.file_url && (
              <Button variant="ghost" size="sm" onClick={() => onDownload(scan.scan_id)}>
                <Download className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{scan.scan_type}</h3>
              {showClientInfo && 'client_name' in scan && (
                <p className="text-sm text-gray-600">{scan.client_name}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <WellnessScore score={scan.body_wellness_score} size="md" />
            {scoreChange && (
              <div className={clsx(
                'flex items-center text-sm font-medium',
                scoreChange.direction === 'up' ? 'text-green-600' : 
                scoreChange.direction === 'down' ? 'text-red-600' : 'text-gray-600'
              )}>
                {scoreChange.direction === 'up' && <TrendingUp className="w-4 h-4 mr-1" />}
                {scoreChange.direction === 'down' && <TrendingDown className="w-4 h-4 mr-1" />}
                {scoreChange.value > 0 && (
                  <span>{scoreChange.direction === 'up' ? '+' : '-'}{scoreChange.value}</span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{format(scan.scan_date, 'EEEE, MMMM dd, yyyy')}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{scan.centre_name}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-2" />
            <span>{scan.consultant_name}</span>
          </div>
        </div>

        {'detailed_results' in scan && scan.detailed_results && (
          <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{scan.detailed_results.body_fat_percentage}%</p>
              <p className="text-xs text-gray-600">Body Fat</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{scan.detailed_results.muscle_mass}kg</p>
              <p className="text-xs text-gray-600">Muscle Mass</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-500">
            Scan ID: {scan.scan_id}
          </div>

          <div className="flex items-center space-x-2">
            {onView && (
              <Button variant="outline" size="sm" onClick={() => onView(scan.scan_id)}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            )}
            
            {onDownload && 'file_url' in scan && scan.file_url && (
              <Button variant="outline" size="sm" onClick={() => onDownload(scan.scan_id)}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};