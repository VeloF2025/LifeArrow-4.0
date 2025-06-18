import React from 'react';
import { 
  Clock, 
  MapPin, 
  Video, 
  Phone, 
  Mail, 
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Calendar,
  Edit
} from 'lucide-react';
import { Appointment } from '../../types/appointments';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { CurrencyDisplay } from '../currency/CurrencyDisplay';
import { format } from 'date-fns';
import { clsx } from 'clsx';

interface AppointmentCardProps {
  appointment: Appointment;
  onEdit?: (appointment: Appointment) => void;
  onCancel?: (appointment: Appointment) => void;
  onReschedule?: (appointment: Appointment) => void;
  onComplete?: (appointment: Appointment) => void;
  onViewDetails?: (appointment: Appointment) => void;
  showClientInfo?: boolean;
  compact?: boolean;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onEdit,
  onCancel,
  onReschedule,
  onComplete,
  onViewDetails,
  showClientInfo = true,
  compact = false
}) => {
  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'no-show':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const canEdit = appointment.status === 'scheduled' || appointment.status === 'confirmed';
  const canComplete = appointment.status === 'confirmed' || appointment.status === 'in-progress';
  const canCancel = appointment.status === 'scheduled' || appointment.status === 'confirmed';

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
        <div className="flex items-center space-x-3">
          {showClientInfo && appointment.clientAvatar && (
            <img
              src={appointment.clientAvatar}
              alt={appointment.clientName}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          <div>
            <p className="font-medium text-gray-900">
              {showClientInfo ? appointment.clientName : appointment.serviceType}
            </p>
            <p className="text-sm text-gray-600">
              {appointment.startTime} - {appointment.endTime}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={clsx(
            'px-2 py-1 rounded-full text-xs font-medium border',
            getStatusColor(appointment.status)
          )}>
            {appointment.status}
          </span>
          {onViewDetails && (
            <Button variant="ghost" size="sm" onClick={() => onViewDetails(appointment)}>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {showClientInfo && appointment.clientAvatar && (
              <img
                src={appointment.clientAvatar}
                alt={appointment.clientName}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div>
              <h3 className="font-semibold text-gray-900">
                {showClientInfo ? appointment.clientName : appointment.serviceType}
              </h3>
              <p className="text-sm text-gray-600">
                {showClientInfo ? appointment.serviceType : appointment.clientName}
              </p>
            </div>
          </div>
          <span className={clsx(
            'px-3 py-1 rounded-full text-sm font-medium border',
            getStatusColor(appointment.status)
          )}>
            {appointment.status}
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>
              {format(appointment.date, 'EEEE, MMMM d, yyyy')} • {appointment.startTime} - {appointment.endTime}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            {appointment.location === 'in-person' ? (
              <MapPin className="w-4 h-4 mr-2" />
            ) : (
              <Video className="w-4 h-4 mr-2" />
            )}
            <span>
              {appointment.location === 'in-person' ? 'In-Person' : 'Virtual Meeting'}
            </span>
          </div>

          {showClientInfo && (
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                <span>{appointment.clientPhone}</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                <span>{appointment.clientEmail}</span>
              </div>
            </div>
          )}

          {appointment.notes && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{appointment.notes}</p>
            </div>
          )}

          {appointment.practitionerNotes && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Practitioner Notes:</strong> {appointment.practitionerNotes}
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <div className="text-sm text-gray-600">
            <span className="font-medium">
              <CurrencyDisplay amount={appointment.price} />
            </span>
            <span className="mx-2">•</span>
            <span className={clsx(
              appointment.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-600'
            )}>
              {appointment.paymentStatus}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {canEdit && onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(appointment)}>
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
            
            {canComplete && onComplete && (
              <Button variant="outline" size="sm" onClick={() => onComplete(appointment)}>
                <CheckCircle className="w-4 h-4 mr-1" />
                Complete
              </Button>
            )}
            
            {canCancel && onCancel && (
              <Button variant="outline" size="sm" onClick={() => onCancel(appointment)}>
                <XCircle className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            )}
            
            {onReschedule && canEdit && (
              <Button variant="outline" size="sm" onClick={() => onReschedule(appointment)}>
                <Calendar className="w-4 h-4 mr-1" />
                Reschedule
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};