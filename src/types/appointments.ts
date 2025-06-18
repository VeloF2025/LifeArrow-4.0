export interface Appointment {
  id: string;
  clientId: string;
  practitionerId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientAvatar?: string;
  practitionerName: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number; // in minutes
  serviceType: string;
  serviceDescription?: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  location: 'in-person' | 'virtual';
  meetingLink?: string;
  centreId?: string; // Treatment centre ID for in-person appointments
  centreName?: string; // Treatment centre name for display
  notes?: string;
  practitionerNotes?: string;
  price: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceType {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  category: 'consultation' | 'scan' | 'therapy' | 'assessment';
  isActive: boolean;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  appointmentId?: string;
}

export interface DaySchedule {
  date: Date;
  isAvailable: boolean;
  timeSlots: TimeSlot[];
}

export interface PractitionerSchedule {
  practitionerId: string;
  workingHours: {
    [key: string]: { // day of week (monday, tuesday, etc.)
      isWorking: boolean;
      startTime: string;
      endTime: string;
      breakTimes: Array<{
        startTime: string;
        endTime: string;
      }>;
    };
  };
  holidays: Date[];
  timeOffRequests: Array<{
    startDate: Date;
    endDate: Date;
    reason: string;
  }>;
}