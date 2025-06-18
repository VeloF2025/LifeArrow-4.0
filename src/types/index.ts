export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'practitioner' | 'client';
  avatar?: string;
  phone?: string;
  createdAt: Date;
  onboardingCompleted?: boolean;
  hasSeenIntroVideo?: boolean; // Track if the user has seen the intro video
  onboardingData?: any;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: Date;
  avatar?: string;
  wellnessScore: number;
  lastScanDate?: Date;
  goals: string[];
  status: 'active' | 'inactive';
  practitionerId: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory: string[];
  createdAt: Date;
}

export interface BodyScan {
  id: string;
  clientId: string;
  scanDate: Date;
  scanType: string;
  bodyFatPercentage: number;
  muscleMass: number;
  hydrationLevel: number;
  metabolicAge: number;
  wellnessScore: number;
  notes: string;
  fileUrl?: string;
  practitionerNotes: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  practitionerId: string;
  date: Date;
  duration: number;
  serviceType: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  price: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
}

export interface WellnessPlan {
  id: string;
  clientId: string;
  title: string;
  description: string;
  goals: WellnessGoal[];
  startDate: Date;
  endDate: Date;
  status: 'active' | 'completed' | 'paused';
  progress: number;
}

export interface WellnessGoal {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  category: 'exercise' | 'nutrition' | 'lifestyle' | 'body-composition';
  deadline: Date;
  completed: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}