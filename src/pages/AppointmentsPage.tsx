import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Plus, 
  Filter, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Users,
  Activity,
  List,
  Grid,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AppointmentCard } from '../components/appointments/AppointmentCard';
import { BookAppointmentModal } from '../components/appointments/BookAppointmentModal';
import { EditAppointmentModal } from '../components/appointments/EditAppointmentModal';
import { CurrencyDisplay } from '../components/currency/CurrencyDisplay';
import { useAppointments } from '../contexts/AppointmentsContext';
import { useAuth } from '../contexts/AuthContext';
import { Appointment } from '../types/appointments';
import { format, startOfWeek, addDays, isSameDay, startOfMonth, endOfMonth, addMonths } from 'date-fns';
import { clsx } from 'clsx';

type ViewMode = 'list' | 'calendar' | 'week';
type FilterStatus = 'all' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled';

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onEdit: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
  onComplete: (appointment: Appointment) => void;
}

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onEdit,
  onCancel,
  onComplete
}) => {
  if (!isOpen || !appointment) return null;

  const canEdit = appointment.status === 'scheduled' || appointment.status === 'confirmed';
  const canComplete = appointment.status === 'confirmed' || appointment.status === 'in-progress';
  const canCancel = appointment.status === 'scheduled' || appointment.status === 'confirmed';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-cyan-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Appointment Details</h2>
              <p className="text-sm text-gray-600">{appointment.serviceType}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Client Information */}
            <div className="flex items-center space-x-4">
              {appointment.clientAvatar && (
                <img
                  src={appointment.clientAvatar}
                  alt={appointment.clientName}
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{appointment.clientName}</h3>
                <p className="text-gray-600">{appointment.clientEmail}</p>
                <p className="text-gray-600">{appointment.clientPhone}</p>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Appointment Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{format(appointment.date, 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{appointment.startTime} - {appointment.endTime}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Activity className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{appointment.duration} minutes</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{appointment.practitionerName}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Service & Payment</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Service</p>
                    <p className="font-medium">{appointment.serviceType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="font-medium">
                      <CurrencyDisplay amount={appointment.price} />
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <span className={clsx(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      appointment.paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-orange-100 text-orange-800'
                    )}>
                      {appointment.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Status</h4>
              <span className={clsx(
                'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                appointment.status === 'scheduled' && 'bg-blue-100 text-blue-800',
                appointment.status === 'confirmed' && 'bg-green-100 text-green-800',
                appointment.status === 'completed' && 'bg-gray-100 text-gray-800',
                appointment.status === 'cancelled' && 'bg-red-100 text-red-800'
              )}>
                {appointment.status}
              </span>
            </div>

            {/* Notes */}
            {(appointment.notes || appointment.practitionerNotes) && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Notes</h4>
                {appointment.notes && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-1">Client Notes:</p>
                    <p className="text-sm text-gray-600">{appointment.notes}</p>
                  </div>
                )}
                {appointment.practitionerNotes && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-700 mb-1">Practitioner Notes:</p>
                    <p className="text-sm text-blue-600">{appointment.practitionerNotes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Location */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Location</h4>
              <div className="flex items-center text-sm">
                {appointment.location === 'in-person' ? (
                  <>
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    <span>In-Person</span>
                    {appointment.centreName && (
                      <span className="ml-2 text-gray-600">at {appointment.centreName}</span>
                    )}
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Virtual Meeting</span>
                    {appointment.meetingLink && (
                      <a 
                        href={appointment.meetingLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-2 text-cyan-600 hover:text-cyan-700"
                      >
                        Join Meeting
                      </a>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions - Fixed at bottom */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50 flex-shrink-0">
          <div className="text-sm text-gray-500">
            Created {format(appointment.createdAt, 'MMM dd, yyyy')}
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            
            {canEdit && (
              <Button 
                variant="outline" 
                onClick={() => {
                  onEdit(appointment);
                  onClose();
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            
            {canComplete && (
              <Button 
                variant="outline" 
                onClick={() => {
                  onComplete(appointment);
                  onClose();
                }}
                className="text-green-600 hover:text-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Complete
              </Button>
            )}
            
            {canCancel && (
              <Button 
                variant="outline" 
                onClick={() => {
                  onCancel(appointment);
                  onClose();
                }}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const AppointmentsPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    appointments, 
    updateAppointment, 
    cancelAppointment, 
    rescheduleAppointment,
    getAppointmentsByDate,
    getAppointmentsByDateRange 
  } = useAppointments();
  
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Filter appointments based on user role
  const userAppointments = useMemo(() => {
    let filtered = appointments;
    
    if (user?.role === 'client') {
      // For clients, show only their appointments
      filtered = appointments.filter(apt => apt.clientEmail === user.email);
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === filterStatus);
    }
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(apt => 
        apt.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.practitionerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [appointments, user, filterStatus, searchTerm]);

  // Get appointments for today
  const todayAppointments = getAppointmentsByDate(new Date());
  
  // Get upcoming appointments (next 7 days)
  const upcomingAppointments = getAppointmentsByDateRange(
    new Date(),
    addDays(new Date(), 7)
  ).filter(apt => apt.status === 'scheduled' || apt.status === 'confirmed');

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date();
    const thisMonth = appointments.filter(apt => 
      apt.date.getMonth() === today.getMonth() && 
      apt.date.getFullYear() === today.getFullYear()
    );
    
    return {
      todayTotal: todayAppointments.length,
      upcomingTotal: upcomingAppointments.length,
      monthlyRevenue: thisMonth
        .filter(apt => apt.status === 'completed')
        .reduce((sum, apt) => sum + apt.price, 0),
      completionRate: thisMonth.length > 0 
        ? Math.round((thisMonth.filter(apt => apt.status === 'completed').length / thisMonth.length) * 100)
        : 0
    };
  }, [appointments, todayAppointments, upcomingAppointments]);

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowDetailsModal(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowEditModal(true);
  };

  const handleSaveAppointment = async (appointmentId: string, updates: Partial<Appointment>) => {
    try {
      await updateAppointment(appointmentId, updates);
      alert('Appointment updated successfully');
    } catch (error) {
      console.error('Failed to update appointment:', error);
      alert('Failed to update appointment');
    }
  };

  const handleCancelAppointment = async (appointment: Appointment) => {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await cancelAppointment(appointment.id, 'Cancelled by user');
        alert('Appointment cancelled successfully');
      } catch (error) {
        alert('Failed to cancel appointment');
      }
    }
  };

  const handleCompleteAppointment = async (appointment: Appointment) => {
    try {
      await updateAppointment(appointment.id, { 
        status: 'completed',
        paymentStatus: 'paid'
      });
      alert('Appointment marked as completed');
    } catch (error) {
      alert('Failed to update appointment');
    }
  };

  const handleRescheduleAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowEditModal(true);
  };

  const renderCalendarView = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = addDays(monthEnd, 6 - monthEnd.getDay());
    
    const days = [];
    let day = startDate;
    
    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
            {days.map(day => {
              const dayAppointments = getAppointmentsByDate(day).filter(apt => 
                user?.role === 'client' ? apt.clientEmail === user.email : true
              );
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
              const isToday = isSameDay(day, new Date());
              
              return (
                <div
                  key={day.toISOString()}
                  className={clsx(
                    'min-h-[120px] p-2 border border-gray-200',
                    !isCurrentMonth && 'bg-gray-50 text-gray-400',
                    isToday && 'bg-blue-50 border-blue-200'
                  )}
                >
                  <div className={clsx(
                    'text-sm font-medium mb-1',
                    isToday && 'text-blue-600'
                  )}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 3).map(appointment => (
                      <div
                        key={appointment.id}
                        className={clsx(
                          'text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity',
                          appointment.status === 'scheduled' && 'bg-blue-100 text-blue-800',
                          appointment.status === 'confirmed' && 'bg-green-100 text-green-800',
                          appointment.status === 'completed' && 'bg-gray-100 text-gray-800',
                          appointment.status === 'cancelled' && 'bg-red-100 text-red-800'
                        )}
                        onClick={() => handleViewAppointment(appointment)}
                        title={`${appointment.startTime} - ${appointment.clientName} - ${appointment.serviceType}`}
                      >
                        <div className="truncate">
                          {appointment.startTime} {user?.role === 'practitioner' ? appointment.clientName : appointment.serviceType}
                        </div>
                      </div>
                    ))}
                    {dayAppointments.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{dayAppointments.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Week of {format(weekStart, 'MMMM d, yyyy')}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(addDays(selectedDate, -7))}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
              >
                This Week
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(addDays(selectedDate, 7))}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-4">
            {weekDays.map(day => {
              const dayAppointments = getAppointmentsByDate(day);
              const isToday = isSameDay(day, new Date());
              
              return (
                <div key={day.toISOString()} className="space-y-2">
                  <div className={clsx(
                    'text-center p-2 rounded-lg',
                    isToday ? 'bg-blue-100 text-blue-800' : 'bg-gray-50'
                  )}>
                    <div className="text-sm font-medium">
                      {format(day, 'EEE')}
                    </div>
                    <div className="text-lg font-bold">
                      {format(day, 'd')}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {dayAppointments.map(appointment => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        compact
                        showClientInfo={user?.role === 'practitioner'}
                        onEdit={handleEditAppointment}
                        onCancel={handleCancelAppointment}
                        onComplete={handleCompleteAppointment}
                        onReschedule={handleRescheduleAppointment}
                        onViewDetails={handleViewAppointment}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderListView = () => (
    <div className="space-y-4">
      {userAppointments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600 mb-4">
              {user?.role === 'practitioner' 
                ? "You don't have any appointments yet. Start by booking your first appointment."
                : "You don't have any appointments scheduled. Book your first appointment to get started."
              }
            </p>
            <Button onClick={() => setShowBookModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Book Appointment
            </Button>
          </CardContent>
        </Card>
      ) : (
        userAppointments.map(appointment => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            showClientInfo={user?.role === 'practitioner'}
            onEdit={handleEditAppointment}
            onCancel={handleCancelAppointment}
            onComplete={user?.role === 'practitioner' ? handleCompleteAppointment : undefined}
            onReschedule={handleRescheduleAppointment}
            onViewDetails={handleViewAppointment}
          />
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'practitioner' 
              ? 'Manage your appointment schedule and client bookings'
              : 'View and manage your upcoming appointments'
            }
          </p>
        </div>
        <Button onClick={() => setShowBookModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          {user?.role === 'practitioner' ? 'Book Appointment' : 'Book New Appointment'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayTotal}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming (7 days)</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingTotal}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {user?.role === 'practitioner' && (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100">
                    <Activity className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      <CurrencyDisplay amount={stats.monthlyRevenue} />
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-orange-100">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completionRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filters and View Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={clsx(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={clsx(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  viewMode === 'week'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={clsx(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  viewMode === 'calendar'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <Calendar className="w-4 h-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments Display */}
      {viewMode === 'list' && renderListView()}
      {viewMode === 'week' && renderWeekView()}
      {viewMode === 'calendar' && renderCalendarView()}

      {/* Book Appointment Modal */}
      <BookAppointmentModal
        isOpen={showBookModal}
        onClose={() => setShowBookModal(false)}
      />

      {/* Appointment Details Modal */}
      <AppointmentDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        appointment={selectedAppointment}
        onEdit={handleEditAppointment}
        onCancel={handleCancelAppointment}
        onComplete={handleCompleteAppointment}
      />

      {/* Edit Appointment Modal */}
      <EditAppointmentModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        appointment={selectedAppointment}
        onSave={handleSaveAppointment}
      />
    </div>
  );
};