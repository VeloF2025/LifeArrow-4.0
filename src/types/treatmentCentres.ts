export interface Country {
  code: string; // ISO 3166-1 alpha-2 code (e.g., 'ZA', 'US', 'GB')
  name: string;
  currency: {
    code: string; // ISO 4217 currency code (e.g., 'ZAR', 'USD', 'GBP')
    name: string;
    symbol: string;
    symbolPosition: 'before' | 'after';
    decimalPlaces: number;
    thousandsSeparator: string;
    decimalSeparator: string;
  };
  timezone: string; // IANA timezone (e.g., 'Africa/Johannesburg')
  phonePrefix: string;
}

export interface TreatmentCentre {
  id: string;
  name: string;
  code: string; // Unique identifier code (e.g., 'JHB001', 'NYC001')
  description?: string;
  
  // Location Details
  country: Country;
  city: string;
  address: {
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  
  // Contact Information
  phone: string;
  email: string;
  website?: string;
  
  // Operating Details
  timezone: string;
  workingHours: {
    [key: string]: { // day of week (monday, tuesday, etc.)
      isOpen: boolean;
      openTime: string;
      closeTime: string;
      breakTimes?: Array<{
        startTime: string;
        endTime: string;
        description?: string;
      }>;
    };
  };
  
  // Services & Pricing
  services: string[]; // Service IDs available at this centre
  localPricing?: {
    [serviceId: string]: number; // Override prices in local currency
  };
  
  // Staff & Capacity
  practitioners: string[]; // Practitioner IDs assigned to this centre
  capacity: {
    maxDailyAppointments: number;
    maxConcurrentAppointments: number;
    rooms: number;
  };
  
  // Status & Settings
  status: 'active' | 'inactive' | 'maintenance';
  isHeadquarters: boolean;
  features: string[]; // e.g., ['parking', 'wheelchair-accessible', 'wifi', 'cafe']
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface TreatmentCentreStats {
  totalCentres: number;
  activeCentres: number;
  countriesCount: number;
  totalPractitioners: number;
  totalCapacity: number;
  monthlyAppointments: number;
  averageUtilization: number;
}