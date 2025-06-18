import React from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  Clock, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Star,
  Building,
  Activity,
  Shield,
  UserCheck
} from 'lucide-react';
import { StaffMember } from '../../types/staff';
import { Card, CardContent } from '../ui/Card';
import { useTreatmentCentres } from '../../contexts/TreatmentCentresContext';
import { useServices } from '../../contexts/ServicesContext';
import { clsx } from 'clsx';

interface StaffCardProps {
  staff: StaffMember;
  onEdit?: (staff: StaffMember) => void;
  onDelete?: (staff: StaffMember) => void;
  onToggleStatus?: (staff: StaffMember) => void;
  showActions?: boolean;
  compact?: boolean;
}

export const StaffCard: React.FC<StaffCardProps> = ({
  staff,
  onEdit,
  onDelete,
  onToggleStatus,
  showActions = true,
  compact = false
}) => {
  const { getCentreById } = useTreatmentCentres();
  const { getServiceById } = useServices();

  const getRoleColor = (role: StaffMember['role']) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'practitioner':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'consultant':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: StaffMember['role']) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-5 h-5" />;
      case 'practitioner':
        return <UserCheck className="w-5 h-5" />;
      case 'consultant':
        return <User className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: StaffMember['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'on-leave':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const primaryCentre = staff.primaryCentre ? getCentreById(staff.primaryCentre) : null;
  const assignedCentres = staff.assignedCentres.map(id => getCentreById(id)).filter(Boolean);
  const availableServices = staff.availableServices.map(id => getServiceById(id)).filter(Boolean);

  if (compact) {
    return (
      <div className={clsx(
        'flex items-center justify-between p-4 border rounded-lg transition-colors',
        staff.status === 'active' ? 'hover:bg-gray-50' : 'bg-gray-50 opacity-75'
      )}>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={staff.avatar || `https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2`}
              alt={`${staff.firstName} ${staff.lastName}`}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className={clsx(
              'absolute -bottom-1 -right-1 p-1 rounded-full',
              getRoleColor(staff.role)
            )}>
              {getRoleIcon(staff.role)}
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className={clsx(
                'font-medium',
                staff.status === 'active' ? 'text-gray-900' : 'text-gray-500'
              )}>
                {staff.title} {staff.firstName} {staff.lastName}
              </h3>
              {staff.role === 'admin' && (
                <Star className="w-4 h-4 text-yellow-500" />
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <Award className="w-4 h-4 mr-1" />
                {staff.yearsOfExperience} years
              </span>
              <span className="flex items-center">
                <Building className="w-4 h-4 mr-1" />
                {assignedCentres.length} centres
              </span>
              {primaryCentre && (
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {primaryCentre.city}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {showActions && (
          <div className="flex items-center space-x-2">
            <span className={clsx(
              'px-2 py-1 rounded-full text-xs font-medium border',
              getRoleColor(staff.role)
            )}>
              {staff.role}
            </span>
            
            <span className={clsx(
              'px-2 py-1 rounded-full text-xs font-medium border',
              getStatusColor(staff.status)
            )}>
              {staff.status}
            </span>
            
            <div className="flex items-center space-x-1">
              {onToggleStatus && (
                <button
                  onClick={() => onToggleStatus(staff)}
                  title={staff.status === 'active' ? 'Deactivate Staff' : 'Activate Staff'}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {staff.status === 'active' ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              )}
              
              {onEdit && (
                <button
                  onClick={() => onEdit(staff)}
                  title="Edit Staff Member"
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              
              {onDelete && staff.role !== 'admin' && (
                <button
                  onClick={() => onDelete(staff)}
                  title="Delete Staff Member"
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
      staff.status === 'active' ? 'hover:shadow-md' : 'opacity-75',
      staff.status !== 'active' && 'bg-gray-50'
    )}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={staff.avatar || `https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=2`}
                alt={`${staff.firstName} ${staff.lastName}`}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className={clsx(
                'absolute -bottom-1 -right-1 p-2 rounded-full border-2 border-white',
                getRoleColor(staff.role)
              )}>
                {getRoleIcon(staff.role)}
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h3 className={clsx(
                  'text-lg font-semibold',
                  staff.status === 'active' ? 'text-gray-900' : 'text-gray-500'
                )}>
                  {staff.title} {staff.firstName} {staff.lastName}
                </h3>
                {staff.role === 'admin' && (
                  <Star className="w-5 h-5 text-yellow-500" />
                )}
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <span className={clsx(
                  'px-3 py-1 rounded-full text-sm font-medium border',
                  getRoleColor(staff.role)
                )}>
                  {staff.role}
                </span>
                {staff.licenseNumber && (
                  <span className="text-sm text-gray-600">
                    License: {staff.licenseNumber}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <Award className="w-4 h-4 mr-1" />
                  {staff.yearsOfExperience} years experience
                </span>
                {primaryCentre && (
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {primaryCentre.name}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <span className={clsx(
            'px-3 py-1 rounded-full text-sm font-medium border',
            getStatusColor(staff.status)
          )}>
            {staff.status}
          </span>
        </div>

        {/* Contact Information */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="w-4 h-4 mr-2" />
            <span>{staff.email}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2" />
            <span>{staff.phone}</span>
          </div>
        </div>

        {/* Specializations */}
        {staff.specializations.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Specializations</p>
            <div className="flex flex-wrap gap-2">
              {staff.specializations.slice(0, 3).map((spec, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                >
                  {spec}
                </span>
              ))}
              {staff.specializations.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  +{staff.specializations.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Assigned Centres */}
        {assignedCentres.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Assigned Centres</p>
            <div className="flex flex-wrap gap-2">
              {assignedCentres.slice(0, 2).map((centre) => (
                <span
                  key={centre!.id}
                  className={clsx(
                    'px-2 py-1 rounded-full text-xs',
                    centre!.id === staff.primaryCentre
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-700'
                  )}
                >
                  {centre!.name} {centre!.id === staff.primaryCentre && '(Primary)'}
                </span>
              ))}
              {assignedCentres.length > 2 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  +{assignedCentres.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Available Services */}
        {availableServices.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Available Services</p>
            <div className="flex flex-wrap gap-2">
              {availableServices.slice(0, 3).map((service) => (
                <span
                  key={service!.id}
                  className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs"
                >
                  {service!.name}
                </span>
              ))}
              {availableServices.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  +{availableServices.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Capacity Info */}
        {staff.isAvailableForBooking && (
          <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{staff.maxDailyAppointments}</p>
              <p className="text-xs text-gray-600">Max Daily</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{staff.appointmentDuration}min</p>
              <p className="text-xs text-gray-600">Default Duration</p>
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-500">
              Joined {staff.joinDate.toLocaleDateString()}
            </div>

            <div className="flex items-center space-x-1">
              {onToggleStatus && (
                <button
                  onClick={() => onToggleStatus(staff)}
                  title={staff.status === 'active' ? 'Deactivate Staff' : 'Activate Staff'}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {staff.status === 'active' ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              )}
              
              {onEdit && (
                <button
                  onClick={() => onEdit(staff)}
                  title="Edit Staff Member"
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              
              {onDelete && staff.role !== 'admin' && (
                <button
                  onClick={() => onDelete(staff)}
                  title="Delete Staff Member"
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