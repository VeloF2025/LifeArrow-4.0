export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  
  // Role & Permissions
  role: 'admin' | 'consultant' | 'practitioner';
  permissions: string[];
  
  // Professional Details
  title?: string; // Dr., Prof., etc.
  specializations: string[];
  qualifications: string[];
  licenseNumber?: string;
  yearsOfExperience: number;
  
  // Assignment Details
  assignedCentres: string[]; // Centre IDs
  primaryCentre?: string; // Primary centre ID
  availableServices: string[]; // Service IDs they can perform
  
  // Schedule & Availability
  workingHours: {
    [centreId: string]: {
      [day: string]: {
        isWorking: boolean;
        startTime: string;
        endTime: string;
        breakTimes?: Array<{
          startTime: string;
          endTime: string;
          description?: string;
        }>;
      };
    };
  };
  
  // Status & Settings
  status: 'active' | 'inactive' | 'on-leave';
  isAvailableForBooking: boolean;
  maxDailyAppointments: number;
  appointmentDuration: number; // Default duration in minutes
  
  // Metadata
  joinDate: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface StaffAvailability {
  staffId: string;
  centreId: string;
  date: Date;
  timeSlots: Array<{
    time: string;
    available: boolean;
    appointmentId?: string;
  }>;
}

export interface StaffStats {
  totalStaff: number;
  activeStaff: number;
  consultants: number;
  admins: number;
  averageExperience: number;
  totalCentreAssignments: number;
}