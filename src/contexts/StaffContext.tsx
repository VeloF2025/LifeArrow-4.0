import React, { createContext, useContext, useState, useEffect } from 'react';
import { StaffMember, StaffAvailability, StaffStats } from '../types/staff';
import { useTreatmentCentres } from './TreatmentCentresContext';
import { useServices } from './ServicesContext';
import { useAuth } from './AuthContext';

interface StaffContextType {
  staff: StaffMember[];
  stats: StaffStats;
  isLoading: boolean;
  
  // Staff management
  addStaffMember: (staffData: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<StaffMember>;
  updateStaffMember: (id: string, updates: Partial<StaffMember>) => Promise<void>;
  deleteStaffMember: (id: string) => Promise<void>;
  toggleStaffStatus: (id: string) => Promise<void>;
  
  // Assignments
  assignStaffToCentre: (staffId: string, centreId: string) => Promise<void>;
  removeStaffFromCentre: (staffId: string, centreId: string) => Promise<void>;
  assignServiceToStaff: (staffId: string, serviceId: string) => Promise<void>;
  removeServiceFromStaff: (staffId: string, serviceId: string) => Promise<void>;
  
  // Availability
  getStaffAvailability: (staffId: string, centreId: string, date: Date) => Promise<StaffAvailability>;
  getAvailableStaff: (centreId: string, serviceId: string, date: Date, timeSlot: string) => Promise<StaffMember[]>;
  
  // Queries
  getActiveStaff: () => StaffMember[];
  getStaffByRole: (role: StaffMember['role']) => StaffMember[];
  getStaffByCentre: (centreId: string) => StaffMember[];
  getStaffByService: (serviceId: string) => StaffMember[];
  getStaffById: (id: string) => StaffMember | undefined;
}

const StaffContext = createContext<StaffContextType | undefined>(undefined);

export const useStaff = () => {
  const context = useContext(StaffContext);
  if (context === undefined) {
    throw new Error('useStaff must be used within a StaffProvider');
  }
  return context;
};

// Mock staff data
const mockStaff: StaffMember[] = [
  {
    id: '1',
    firstName: 'Dr. Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@lifearrow.com',
    phone: '+27 11 123 4567',
    avatar: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    role: 'practitioner',
    permissions: ['manage_appointments', 'view_clients', 'manage_scans', 'view_reports'],
    title: 'Dr.',
    specializations: ['Body Composition Analysis', 'Wellness Consulting', 'Nutrition Therapy'],
    qualifications: ['MD', 'PhD in Nutrition Science', 'Certified Wellness Coach'],
    licenseNumber: 'MP123456',
    yearsOfExperience: 12,
    assignedCentres: ['1', '2'], // Johannesburg and New York
    primaryCentre: '1',
    availableServices: ['1', '2', '3', '4'], // All main services
    workingHours: {
      '1': { // Johannesburg
        monday: { isWorking: true, startTime: '08:00', endTime: '17:00', breakTimes: [{ startTime: '12:00', endTime: '13:00' }] },
        tuesday: { isWorking: true, startTime: '08:00', endTime: '17:00', breakTimes: [{ startTime: '12:00', endTime: '13:00' }] },
        wednesday: { isWorking: true, startTime: '08:00', endTime: '17:00', breakTimes: [{ startTime: '12:00', endTime: '13:00' }] },
        thursday: { isWorking: true, startTime: '08:00', endTime: '17:00', breakTimes: [{ startTime: '12:00', endTime: '13:00' }] },
        friday: { isWorking: true, startTime: '08:00', endTime: '16:00', breakTimes: [{ startTime: '12:00', endTime: '13:00' }] },
        saturday: { isWorking: false, startTime: '', endTime: '' },
        sunday: { isWorking: false, startTime: '', endTime: '' },
      },
      '2': { // New York
        monday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakTimes: [{ startTime: '13:00', endTime: '14:00' }] },
        tuesday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakTimes: [{ startTime: '13:00', endTime: '14:00' }] },
        wednesday: { isWorking: false, startTime: '', endTime: '' },
        thursday: { isWorking: true, startTime: '09:00', endTime: '18:00', breakTimes: [{ startTime: '13:00', endTime: '14:00' }] },
        friday: { isWorking: true, startTime: '09:00', endTime: '17:00', breakTimes: [{ startTime: '13:00', endTime: '14:00' }] },
        saturday: { isWorking: false, startTime: '', endTime: '' },
        sunday: { isWorking: false, startTime: '', endTime: '' },
      },
    },
    status: 'active',
    isAvailableForBooking: true,
    maxDailyAppointments: 12,
    appointmentDuration: 60,
    joinDate: new Date('2020-01-15'),
    createdAt: new Date('2020-01-15'),
    updatedAt: new Date(),
    createdBy: 'system',
  },
  {
    id: '2',
    firstName: 'Michael',
    lastName: 'Chen',
    email: 'michael.chen@lifearrow.com',
    phone: '+1 212 555 0123',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    role: 'consultant',
    permissions: ['manage_appointments', 'view_clients'],
    specializations: ['Fitness Assessment', 'Stress Management'],
    qualifications: ['BSc Exercise Science', 'Certified Personal Trainer'],
    yearsOfExperience: 8,
    assignedCentres: ['2'], // New York only
    primaryCentre: '2',
    availableServices: ['3', '5', '6'], // Consultation, Fitness Assessment, Stress Management
    workingHours: {
      '2': { // New York
        monday: { isWorking: true, startTime: '07:00', endTime: '15:00', breakTimes: [{ startTime: '11:00', endTime: '12:00' }] },
        tuesday: { isWorking: true, startTime: '07:00', endTime: '15:00', breakTimes: [{ startTime: '11:00', endTime: '12:00' }] },
        wednesday: { isWorking: true, startTime: '07:00', endTime: '15:00', breakTimes: [{ startTime: '11:00', endTime: '12:00' }] },
        thursday: { isWorking: true, startTime: '07:00', endTime: '15:00', breakTimes: [{ startTime: '11:00', endTime: '12:00' }] },
        friday: { isWorking: true, startTime: '07:00', endTime: '15:00', breakTimes: [{ startTime: '11:00', endTime: '12:00' }] },
        saturday: { isWorking: true, startTime: '08:00', endTime: '14:00' },
        sunday: { isWorking: false, startTime: '', endTime: '' },
      },
    },
    status: 'active',
    isAvailableForBooking: true,
    maxDailyAppointments: 10,
    appointmentDuration: 45,
    joinDate: new Date('2021-06-01'),
    createdAt: new Date('2021-06-01'),
    updatedAt: new Date(),
    createdBy: '1',
  },
  {
    id: '3',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@lifearrow.com',
    phone: '+44 20 7123 4567',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    role: 'consultant',
    permissions: ['manage_appointments', 'view_clients'],
    specializations: ['Nutrition Therapy', 'Wellness Consulting'],
    qualifications: ['MSc Nutrition', 'Registered Dietitian'],
    yearsOfExperience: 6,
    assignedCentres: ['3'], // London only
    primaryCentre: '3',
    availableServices: ['2', '4'], // Consultation, Nutrition Therapy
    workingHours: {
      '3': { // London
        monday: { isWorking: true, startTime: '09:00', endTime: '17:00', breakTimes: [{ startTime: '13:00', endTime: '14:00' }] },
        tuesday: { isWorking: true, startTime: '09:00', endTime: '17:00', breakTimes: [{ startTime: '13:00', endTime: '14:00' }] },
        wednesday: { isWorking: true, startTime: '09:00', endTime: '17:00', breakTimes: [{ startTime: '13:00', endTime: '14:00' }] },
        thursday: { isWorking: true, startTime: '09:00', endTime: '17:00', breakTimes: [{ startTime: '13:00', endTime: '14:00' }] },
        friday: { isWorking: true, startTime: '09:00', endTime: '16:00', breakTimes: [{ startTime: '13:00', endTime: '14:00' }] },
        saturday: { isWorking: false, startTime: '', endTime: '' },
        sunday: { isWorking: false, startTime: '', endTime: '' },
      },
    },
    status: 'active',
    isAvailableForBooking: true,
    maxDailyAppointments: 8,
    appointmentDuration: 45,
    joinDate: new Date('2022-03-01'),
    createdAt: new Date('2022-03-01'),
    updatedAt: new Date(),
    createdBy: '1',
  },
  {
    id: '4',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@lifearrow.com',
    phone: '+27 11 123 4568',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    role: 'admin',
    permissions: ['manage_all', 'system_admin', 'manage_staff', 'manage_centres', 'manage_services'],
    specializations: ['System Administration'],
    qualifications: ['MBA', 'Healthcare Administration'],
    yearsOfExperience: 15,
    assignedCentres: ['1', '2', '3'], // All centres
    primaryCentre: '1',
    availableServices: [], // Admins don't provide services
    workingHours: {
      '1': { // Johannesburg
        monday: { isWorking: true, startTime: '08:00', endTime: '17:00' },
        tuesday: { isWorking: true, startTime: '08:00', endTime: '17:00' },
        wednesday: { isWorking: true, startTime: '08:00', endTime: '17:00' },
        thursday: { isWorking: true, startTime: '08:00', endTime: '17:00' },
        friday: { isWorking: true, startTime: '08:00', endTime: '17:00' },
        saturday: { isWorking: false, startTime: '', endTime: '' },
        sunday: { isWorking: false, startTime: '', endTime: '' },
      },
    },
    status: 'active',
    isAvailableForBooking: false,
    maxDailyAppointments: 0,
    appointmentDuration: 0,
    joinDate: new Date('2019-01-01'),
    createdAt: new Date('2019-01-01'),
    updatedAt: new Date(),
    createdBy: 'system',
  },
];

export const StaffProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { centres } = useTreatmentCentres();
  const { services } = useServices();
  const [staff, setStaff] = useState<StaffMember[]>(mockStaff);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate stats
  const stats: StaffStats = {
    totalStaff: staff.length,
    activeStaff: staff.filter(s => s.status === 'active').length,
    consultants: staff.filter(s => s.role === 'consultant').length,
    admins: staff.filter(s => s.role === 'admin').length,
    averageExperience: staff.length > 0 
      ? Math.round(staff.reduce((sum, s) => sum + s.yearsOfExperience, 0) / staff.length)
      : 0,
    totalCentreAssignments: staff.reduce((sum, s) => sum + s.assignedCentres.length, 0),
  };

  const addStaffMember = async (staffData: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<StaffMember> => {
    setIsLoading(true);
    
    try {
      const newStaff: StaffMember = {
        ...staffData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user?.id || '1',
      };
      
      setStaff(prev => [...prev, newStaff]);
      return newStaff;
    } finally {
      setIsLoading(false);
    }
  };

  const updateStaffMember = async (id: string, updates: Partial<StaffMember>): Promise<void> => {
    setIsLoading(true);
    
    try {
      setStaff(prev => prev.map(member => 
        member.id === id 
          ? { ...member, ...updates, updatedAt: new Date() }
          : member
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteStaffMember = async (id: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      setStaff(prev => prev.filter(member => member.id !== id));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStaffStatus = async (id: string): Promise<void> => {
    const member = staff.find(s => s.id === id);
    if (member) {
      const newStatus = member.status === 'active' ? 'inactive' : 'active';
      await updateStaffMember(id, { status: newStatus });
    }
  };

  const assignStaffToCentre = async (staffId: string, centreId: string): Promise<void> => {
    const member = staff.find(s => s.id === staffId);
    if (member && !member.assignedCentres.includes(centreId)) {
      await updateStaffMember(staffId, {
        assignedCentres: [...member.assignedCentres, centreId]
      });
    }
  };

  const removeStaffFromCentre = async (staffId: string, centreId: string): Promise<void> => {
    const member = staff.find(s => s.id === staffId);
    if (member) {
      await updateStaffMember(staffId, {
        assignedCentres: member.assignedCentres.filter(id => id !== centreId)
      });
    }
  };

  const assignServiceToStaff = async (staffId: string, serviceId: string): Promise<void> => {
    const member = staff.find(s => s.id === staffId);
    if (member && !member.availableServices.includes(serviceId)) {
      await updateStaffMember(staffId, {
        availableServices: [...member.availableServices, serviceId]
      });
    }
  };

  const removeServiceFromStaff = async (staffId: string, serviceId: string): Promise<void> => {
    const member = staff.find(s => s.id === staffId);
    if (member) {
      await updateStaffMember(staffId, {
        availableServices: member.availableServices.filter(id => id !== serviceId)
      });
    }
  };

  const getStaffAvailability = async (staffId: string, centreId: string, date: Date): Promise<StaffAvailability> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const member = staff.find(s => s.id === staffId);
    if (!member || !member.assignedCentres.includes(centreId)) {
      return {
        staffId,
        centreId,
        date,
        timeSlots: []
      };
    }

    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const schedule = member.workingHours[centreId]?.[dayName];
    
    if (!schedule || !schedule.isWorking) {
      return {
        staffId,
        centreId,
        date,
        timeSlots: []
      };
    }

    // Generate time slots based on working hours
    const slots = [];
    const [startHour] = schedule.startTime.split(':').map(Number);
    const [endHour] = schedule.endTime.split(':').map(Number);
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Check if slot is during break time
        const isBreakTime = schedule.breakTimes?.some(breakTime => {
          const [breakStart] = breakTime.startTime.split(':').map(Number);
          const [breakEnd] = breakTime.endTime.split(':').map(Number);
          return hour >= breakStart && hour < breakEnd;
        });
        
        if (isBreakTime) continue;
        
        slots.push({
          time,
          available: true, // In real app, check against existing appointments
          appointmentId: undefined
        });
      }
    }

    return {
      staffId,
      centreId,
      date,
      timeSlots: slots
    };
  };

  const getAvailableStaff = async (centreId: string, serviceId: string, date: Date, timeSlot: string): Promise<StaffMember[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    return staff.filter(member => {
      // Must be active and available for booking
      if (member.status !== 'active' || !member.isAvailableForBooking) return false;
      
      // Must be assigned to the centre
      if (!member.assignedCentres.includes(centreId)) return false;
      
      // Must be able to provide the service
      if (!member.availableServices.includes(serviceId)) return false;
      
      // Must be working on this day at this centre
      const schedule = member.workingHours[centreId]?.[dayName];
      if (!schedule || !schedule.isWorking) return false;
      
      // Must be available at the requested time slot
      const [slotHour, slotMinute] = timeSlot.split(':').map(Number);
      const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
      const [endHour, endMinute] = schedule.endTime.split(':').map(Number);
      
      const slotTime = slotHour * 60 + slotMinute;
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;
      
      if (slotTime < startTime || slotTime >= endTime) return false;
      
      // Check if slot is during break time
      const isBreakTime = schedule.breakTimes?.some(breakTime => {
        const [breakStart] = breakTime.startTime.split(':').map(Number);
        const [breakEnd] = breakTime.endTime.split(':').map(Number);
        const breakStartTime = breakStart * 60;
        const breakEndTime = breakEnd * 60;
        return slotTime >= breakStartTime && slotTime < breakEndTime;
      });
      
      return !isBreakTime;
    });
  };

  // Helper functions
  const getActiveStaff = (): StaffMember[] => {
    return staff.filter(member => member.status === 'active');
  };

  const getStaffByRole = (role: StaffMember['role']): StaffMember[] => {
    return staff.filter(member => member.role === role);
  };

  const getStaffByCentre = (centreId: string): StaffMember[] => {
    return staff.filter(member => member.assignedCentres.includes(centreId));
  };

  const getStaffByService = (serviceId: string): StaffMember[] => {
    return staff.filter(member => member.availableServices.includes(serviceId));
  };

  const getStaffById = (id: string): StaffMember | undefined => {
    return staff.find(member => member.id === id);
  };

  return (
    <StaffContext.Provider value={{
      staff,
      stats,
      isLoading,
      addStaffMember,
      updateStaffMember,
      deleteStaffMember,
      toggleStaffStatus,
      assignStaffToCentre,
      removeStaffFromCentre,
      assignServiceToStaff,
      removeServiceFromStaff,
      getStaffAvailability,
      getAvailableStaff,
      getActiveStaff,
      getStaffByRole,
      getStaffByCentre,
      getStaffByService,
      getStaffById,
    }}>
      {children}
    </StaffContext.Provider>
  );
};