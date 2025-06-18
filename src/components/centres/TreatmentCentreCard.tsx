import React from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Users, 
  Building, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Star,
  Globe,
  Calendar,
  Wifi,
  Car,
  Coffee,
  Accessibility
} from 'lucide-react';
import { TreatmentCentre } from '../../types/treatmentCentres';
import { Card, CardContent } from '../ui/Card';
import { clsx } from 'clsx';

interface TreatmentCentreCardProps {
  centre: TreatmentCentre;
  onEdit?: (centre: TreatmentCentre) => void;
  onDelete?: (centre: TreatmentCentre) => void;
  onToggleStatus?: (centre: TreatmentCentre) => void;
  showActions?: boolean;
  compact?: boolean;
}

export const TreatmentCentreCard: React.FC<TreatmentCentreCardProps> = ({
  centre,
  onEdit,
  onDelete,
  onToggleStatus,
  showActions = true,
  compact = false
}) => {
  const getStatusColor = (status: TreatmentCentre['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'parking': return <Car className="w-4 h-4" />;
      case 'wifi': return <Wifi className="w-4 h-4" />;
      case 'cafe': return <Coffee className="w-4 h-4" />;
      case 'wheelchair-accessible': return <Accessibility className="w-4 h-4" />;
      default: return <Building className="w-4 h-4" />;
    }
  };

  const getCurrentTime = () => {
    try {
      return new Date().toLocaleTimeString('en-US', {
        timeZone: centre.timezone,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return new Date().toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const isCurrentlyOpen = () => {
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const schedule = centre.workingHours[dayName];
    
    if (!schedule || !schedule.isOpen) return false;
    
    const currentTime = getCurrentTime();
    return currentTime >= schedule.openTime && currentTime <= schedule.closeTime;
  };

  if (compact) {
    return (
      <div className={clsx(
        'flex items-center justify-between p-4 border rounded-lg transition-colors',
        centre.status === 'active' ? 'hover:bg-gray-50' : 'bg-gray-50 opacity-75'
      )}>
        <div className="flex items-center space-x-3">
          <div className={clsx(
            'p-2 rounded-lg',
            centre.isHeadquarters ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
          )}>
            {centre.isHeadquarters ? <Star className="w-5 h-5" /> : <Building className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className={clsx(
                'font-medium',
                centre.status === 'active' ? 'text-gray-900' : 'text-gray-500'
              )}>
                {centre.name}
              </h3>
              {centre.isHeadquarters && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                  HQ
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {centre.city}, {centre.country.name}
              </span>
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {centre.practitioners.length} practitioners
              </span>
            </div>
          </div>
        </div>
        
        {showActions && (
          <div className="flex items-center space-x-2">
            <span className={clsx(
              'px-2 py-1 rounded-full text-xs font-medium border',
              getStatusColor(centre.status)
            )}>
              {centre.status}
            </span>
            
            <div className="flex items-center space-x-1">
              {onToggleStatus && (
                <button
                  onClick={() => onToggleStatus(centre)}
                  title={centre.status === 'active' ? 'Deactivate Centre' : 'Activate Centre'}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {centre.status === 'active' ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              )}
              
              {onEdit && (
                <button
                  onClick={() => onEdit(centre)}
                  title="Edit Centre"
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              
              {onDelete && !centre.isHeadquarters && (
                <button
                  onClick={() => onDelete(centre)}
                  title="Delete Centre"
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={clsx(
      'transition-all duration-200',
      centre.status === 'active' ? 'hover:shadow-md' : 'opacity-75',
      centre.status !== 'active' && 'bg-gray-50'
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={clsx(
              'p-3 rounded-lg',
              centre.isHeadquarters ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'
            )}>
              {centre.isHeadquarters ? <Star className="w-6 h-6" /> : <Building className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h3 className={clsx(
                  'text-lg font-semibold',
                  centre.status === 'active' ? 'text-gray-900' : 'text-gray-500'
                )}>
                  {centre.name}
                </h3>
                {centre.isHeadquarters && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                    Headquarters
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-2">{centre.code}</p>
              {centre.description && (
                <p className="text-sm text-gray-600">{centre.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={clsx(
              'px-3 py-1 rounded-full text-sm font-medium border',
              getStatusColor(centre.status)
            )}>
              {centre.status}
            </span>
            {isCurrentlyOpen() && centre.status === 'active' && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Open
              </span>
            )}
          </div>
        </div>

        {/* Location & Contact */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{centre.address.street}, {centre.address.city}, {centre.country.name}</span>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              <span>{centre.phone}</span>
            </div>
            <div className="flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              <span>{centre.email}</span>
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Globe className="w-4 h-4 mr-2" />
            <span>{centre.country.name} ({centre.country.currency.code}) • {getCurrentTime()}</span>
          </div>
        </div>

        {/* Capacity & Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{centre.capacity.rooms}</p>
            <p className="text-xs text-gray-600">Rooms</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{centre.capacity.maxDailyAppointments}</p>
            <p className="text-xs text-gray-600">Daily Capacity</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">{centre.practitioners.length}</p>
            <p className="text-xs text-gray-600">Practitioners</p>
          </div>
        </div>

        {/* Features */}
        {centre.features.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Features</p>
            <div className="flex flex-wrap gap-2">
              {centre.features.slice(0, 4).map((feature) => (
                <div
                  key={feature}
                  className="flex items-center space-x-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                >
                  {getFeatureIcon(feature)}
                  <span className="capitalize">{feature.replace('-', ' ')}</span>
                </div>
              ))}
              {centre.features.length > 4 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  +{centre.features.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-500">
              Updated {centre.updatedAt.toLocaleDateString()}
            </div>

            <div className="flex items-center space-x-1">
              {onToggleStatus && (
                <button
                  onClick={() => onToggleStatus(centre)}
                  title={centre.status === 'active' ? 'Deactivate Centre' : 'Activate Centre'}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {centre.status === 'active' ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              )}
              
              {onEdit && (
                <button
                  onClick={() => onEdit(centre)}
                  title="Edit Centre"
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              
              {onDelete && !centre.isHeadquarters && (
                <button
                  onClick={() => onDelete(centre)}
                  title="Delete Centre"
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};