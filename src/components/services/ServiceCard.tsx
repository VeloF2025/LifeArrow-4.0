import React from 'react';
import { 
  Clock, 
  DollarSign, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Activity,
  Heart,
  Users,
  FileText
} from 'lucide-react';
import { ServiceType } from '../../types/appointments';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { CurrencyDisplay } from '../currency/CurrencyDisplay';
import { clsx } from 'clsx';

interface ServiceCardProps {
  service: ServiceType;
  onEdit?: (service: ServiceType) => void;
  onDelete?: (service: ServiceType) => void;
  onToggleStatus?: (service: ServiceType) => void;
  showActions?: boolean;
  compact?: boolean;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onEdit,
  onDelete,
  onToggleStatus,
  showActions = true,
  compact = false
}) => {
  const getCategoryIcon = (category: ServiceType['category']) => {
    switch (category) {
      case 'consultation':
        return <Users className="w-5 h-5" />;
      case 'scan':
        return <Activity className="w-5 h-5" />;
      case 'therapy':
        return <Heart className="w-5 h-5" />;
      case 'assessment':
        return <FileText className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: ServiceType['category']) => {
    switch (category) {
      case 'consultation':
        return 'text-blue-600 bg-blue-100';
      case 'scan':
        return 'text-green-600 bg-green-100';
      case 'therapy':
        return 'text-purple-600 bg-purple-100';
      case 'assessment':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (compact) {
    return (
      <div className={clsx(
        'flex items-center justify-between p-4 border rounded-lg transition-colors',
        service.isActive ? 'hover:bg-gray-50' : 'bg-gray-50 opacity-75'
      )}>
        <div className="flex items-center space-x-3">
          <div className={clsx('p-2 rounded-lg', getCategoryColor(service.category))}>
            {getCategoryIcon(service.category)}
          </div>
          <div>
            <h3 className={clsx(
              'font-medium',
              service.isActive ? 'text-gray-900' : 'text-gray-500'
            )}>
              {service.name}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {service.duration}min
              </span>
              <span className="flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                <CurrencyDisplay amount={service.price} />
              </span>
            </div>
          </div>
        </div>
        
        {showActions && (
          <div className="flex items-center space-x-2">
            <span className={clsx(
              'px-2 py-1 rounded-full text-xs font-medium',
              service.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            )}>
              {service.isActive ? 'Active' : 'Inactive'}
            </span>
            
            <div className="flex items-center space-x-1">
              {onToggleStatus && (
                <button
                  onClick={() => onToggleStatus(service)}
                  title={service.isActive ? 'Deactivate Service' : 'Activate Service'}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {service.isActive ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              )}
              
              {onEdit && (
                <button
                  onClick={() => onEdit(service)}
                  title="Edit Service"
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={() => onDelete(service)}
                  title="Delete Service"
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
      service.isActive ? 'hover:shadow-md' : 'opacity-75',
      !service.isActive && 'bg-gray-50'
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={clsx('p-3 rounded-lg', getCategoryColor(service.category))}>
              {getCategoryIcon(service.category)}
            </div>
            <div>
              <h3 className={clsx(
                'text-lg font-semibold',
                service.isActive ? 'text-gray-900' : 'text-gray-500'
              )}>
                {service.name}
              </h3>
              <span className={clsx(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize',
                getCategoryColor(service.category)
              )}>
                {service.category}
              </span>
            </div>
          </div>
          
          <span className={clsx(
            'px-3 py-1 rounded-full text-sm font-medium',
            service.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          )}>
            {service.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <p className={clsx(
          'text-sm mb-4',
          service.isActive ? 'text-gray-600' : 'text-gray-500'
        )}>
          {service.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              <span className="font-medium">{service.duration}</span>
              <span className="ml-1">minutes</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="w-4 h-4 mr-2" />
              <span className="font-medium text-lg">
                <CurrencyDisplay amount={service.price} />
              </span>
            </div>
          </div>

          {showActions && (
            <div className="flex items-center space-x-1">
              {onToggleStatus && (
                <button
                  onClick={() => onToggleStatus(service)}
                  title={service.isActive ? 'Deactivate Service' : 'Activate Service'}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {service.isActive ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              )}
              
              {onEdit && (
                <button
                  onClick={() => onEdit(service)}
                  title="Edit Service"
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={() => onDelete(service)}
                  title="Delete Service"
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};