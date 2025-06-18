import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appointment, ServiceType, PractitionerSchedule, TimeSlot } from '../types/appointments';
import { useAuth } from './AuthContext';
import { useServices } from './ServicesContext';

interface AppointmentsContextType {
  appointments: Appointment[];
  practitionerSchedule: PractitionerSchedule | null;
  isLoading: boolean;
  
  // Appointment management
  createAppointment: (appointmentData: Partial<Appointment>) => Promise<Appointment>;
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>;
  cancelAppointment: (id: string, reason?: string) => Promise<void>;
  rescheduleAppointment: (id: string, newDate: Date, newTime: string) => Promise<void>;
  
  // Schedule management
  getAvailableTimeSlots: (date: Date, serviceTypeId: string) => Promise<TimeSlot[]>;
  updatePractitionerSchedule: (schedule: Partial<PractitionerSchedule>) => Promise<void>;
  
  // Filters and queries
  getAppointmentsByDate: (date: Date) => Appointment[];
  getAppointmentsByDateRange: (startDate: Date, endDate: Date) => Appointment[];
  getClientAppointments: (clientId: string) => Appointment[];
  getPractitionerAppointments: (practitionerId: string) => Appointment[];
}

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(undefined);

export const useAppointments = () => {
  const context = useContext(AppointmentsContext);
  if (context === undefined) {
    throw new Error('useAppointments must be used within an AppointmentsProvider');
  }
  return context;
};

const mockPractitionerSchedule: PractitionerSchedule = {
  practitionerId: '1',
  workingHours: {
    monday: { isWorking: true, startTime: '08:00', endTime: '17:00', breakTimes: [{ startTime: '12:00', endTime: '13:00' }] },
    tuesday: { isWorking: true, startTime: '08:00', endTime: '17:00', breakTimes: [{ startTime: '12:00', endTime: '13:00' }] },
    wednesday: { isWorking: true, startTime: '08:00', endTime: '17:00', breakTimes: [{ startTime: '12:00', endTime: '13:00' }] },
    thursday: { isWorking: true, startTime: '08:00', endTime: '17:00', breakTimes: [{ startTime: '12:00', endTime: '13:00' }] },
    friday: { isWorking: true, startTime: '08:00', endTime: '16:00', breakTimes: [{ startTime: '12:00', endTime: '13:00' }] },
    saturday: { isWorking: true, startTime: '09:00', endTime: '13:00', breakTimes: [] },
    sunday: { isWorking: false, startTime: '', endTime: '', breakTimes: [] },
  },
  holidays: [],
  timeOffRequests: [],
};

const generateMockAppointments = (services: ServiceType[]): Appointment[] => {
  const appointments: Appointment[] = [];
  const today = new Date();
  
  // Generate appointments for the next 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Skip weekends for some variety
    if (date.getDay() === 0) continue; // Skip Sundays
    
    // Generate 2-5 appointments per day
    const appointmentsPerDay = Math.floor(Math.random() * 4) + 2;
    
    for (let j = 0; j < appointmentsPerDay; j++) {
      const hour = 9 + j * 2; // Spread appointments throughout the day
      const startTime = `${hour.toString().padStart(2, '0')}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`;
      
      const serviceType = services.length > 0 ? services[Math.floor(Math.random() * services.length)] : null;
      const statuses: Appointment['status'][] = ['scheduled', 'confirmed', 'completed'];
      const status = i < 7 ? 'scheduled' : statuses[Math.floor(Math.random() * statuses.length)];
      
      if (serviceType) {
        appointments.push({
          id: `${i}-${j}`,
          clientId: `client-${j + 1}`,
          practitionerId: '1',
          clientName: ['Sarah Johnson', 'Michael Chen', 'Emily Davis', 'David Wilson', 'Lisa Anderson'][j % 5],
          clientEmail: ['sarah@email.com', 'michael@email.com', 'emily@email.com', 'david@email.com', 'lisa@email.com'][j % 5],
          clientPhone: ['+1 (555) 123-4567', '+1 (555) 234-5678', '+1 (555) 345-6789', '+1 (555) 456-7890', '+1 (555) 567-8901'][j % 5],
          clientAvatar: [
            'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2',
            'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2',
            'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2',
            'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2',
            'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&dpr=2'
          ][j % 5],
          practitionerName: 'Dr. Sarah Johnson',
          date: new Date(date),
          startTime,
          endTime,
          duration: serviceType.duration,
          serviceType: serviceType.name,
          serviceDescription: serviceType.description,
          status,
          location: Math.random() > 0.3 ? 'in-person' : 'virtual',
          meetingLink: Math.random() > 0.3 ? undefined : 'https://meet.lifearrow.com/room/123',
          notes: j % 3 === 0 ? 'Client requested early morning appointment' : undefined,
          practitionerNotes: status === 'completed' ? 'Session completed successfully. Client showed good progress.' : undefined,
          price: serviceType.price,
          paymentStatus: status === 'completed' ? 'paid' : 'pending',
          reminderSent: i < 7,
          createdAt: new Date(date.getTime() - 7 * 24 * 60 * 60 * 1000), // Created a week before
          updatedAt: new Date(),
        });
      }
    }
  }
  
  return appointments;
};

export const AppointmentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { services } = useServices();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [practitionerSchedule, setPractitionerSchedule] = useState<PractitionerSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize data
    const initializeData = async () => {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setAppointments(generateMockAppointments(services));
      
      if (user?.role === 'practitioner') {
        setPractitionerSchedule(mockPractitionerSchedule);
      }
      
      setIsLoading(false);
    };

    if (services.length > 0) {
      initializeData();
    }
  }, [user, services]);

  const createAppointment = async (appointmentData: Partial<Appointment>): Promise<Appointment> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      clientId: appointmentData.clientId || '',
      practitionerId: appointmentData.practitionerId || '1',
      clientName: appointmentData.clientName || '',
      clientEmail: appointmentData.clientEmail || '',
      clientPhone: appointmentData.clientPhone || '',
      clientAvatar: appointmentData.clientAvatar,
      practitionerName: appointmentData.practitionerName || 'Dr. Sarah Johnson',
      date: appointmentData.date || new Date(),
      startTime: appointmentData.startTime || '09:00',
      endTime: appointmentData.endTime || '10:00',
      duration: appointmentData.duration || 60,
      serviceType: appointmentData.serviceType || '',
      serviceDescription: appointmentData.serviceDescription,
      status: 'scheduled',
      location: appointmentData.location || 'in-person',
      meetingLink: appointmentData.meetingLink,
      notes: appointmentData.notes,
      practitionerNotes: appointmentData.practitionerNotes,
      price: appointmentData.price || 0,
      paymentStatus: 'pending',
      reminderSent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setAppointments(prev => [...prev, newAppointment]);
    setIsLoading(false);
    
    return newAppointment;
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setAppointments(prev => prev.map(appointment => 
      appointment.id === id 
        ? { ...appointment, ...updates, updatedAt: new Date() }
        : appointment
    ));
    
    setIsLoading(false);
  };

  const cancelAppointment = async (id: string, reason?: string): Promise<void> => {
    await updateAppointment(id, { 
      status: 'cancelled', 
      notes: reason ? `Cancelled: ${reason}` : 'Cancelled'
    });
  };

  const rescheduleAppointment = async (id: string, newDate: Date, newTime: string): Promise<void> => {
    const [hours, minutes] = newTime.split(':').map(Number);
    const endTime = `${(hours + 1).toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    await updateAppointment(id, {
      date: newDate,
      startTime: newTime,
      endTime: endTime,
      status: 'scheduled'
    });
  };

  const getAvailableTimeSlots = async (date: Date, serviceTypeId: string): Promise<TimeSlot[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const schedule = practitionerSchedule?.workingHours[dayName];
    
    if (!schedule || !schedule.isWorking) {
      return [];
    }
    
    const slots: TimeSlot[] = [];
    const [startHour] = schedule.startTime.split(':').map(Number);
    const [endHour] = schedule.endTime.split(':').map(Number);
    
    // Generate 30-minute slots
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Check if slot is during break time
        const isBreakTime = schedule.breakTimes.some(breakTime => {
          const [breakStart] = breakTime.startTime.split(':').map(Number);
          const [breakEnd] = breakTime.endTime.split(':').map(Number);
          return hour >= breakStart && hour < breakEnd;
        });
        
        if (isBreakTime) continue;
        
        // Check if slot is already booked
        const isBooked = appointments.some(appointment => 
          appointment.date.toDateString() === date.toDateString() &&
          appointment.startTime === time &&
          appointment.status !== 'cancelled'
        );
        
        slots.push({
          time,
          available: !isBooked,
          appointmentId: isBooked ? appointments.find(a => 
            a.date.toDateString() === date.toDateString() && a.startTime === time
          )?.id : undefined
        });
      }
    }
    
    return slots;
  };

  const updatePractitionerSchedule = async (schedule: Partial<PractitionerSchedule>): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setPractitionerSchedule(prev => prev ? { ...prev, ...schedule } : null);
    setIsLoading(false);
  };

  // Helper functions
  const getAppointmentsByDate = (date: Date): Appointment[] => {
    return appointments.filter(appointment => 
      appointment.date.toDateString() === date.toDateString()
    );
  };

  const getAppointmentsByDateRange = (startDate: Date, endDate: Date): Appointment[] => {
    return appointments.filter(appointment => 
      appointment.date >= startDate && appointment.date <= endDate
    );
  };

  const getClientAppointments = (clientId: string): Appointment[] => {
    return appointments.filter(appointment => appointment.clientId === clientId);
  };

  const getPractitionerAppointments = (practitionerId: string): Appointment[] => {
    return appointments.filter(appointment => appointment.practitionerId === practitionerId);
  };

  return (
    <AppointmentsContext.Provider value={{
      appointments,
      practitionerSchedule,
      isLoading,
      createAppointment,
      updateAppointment,
      cancelAppointment,
      rescheduleAppointment,
      getAvailableTimeSlots,
      updatePractitionerSchedule,
      getAppointmentsByDate,
      getAppointmentsByDateRange,
      getClientAppointments,
      getPractitionerAppointments,
    }}>
      {children}
    </AppointmentsContext.Provider>
  );
};