import React, { createContext, useContext, useState, useEffect } from 'react';
import { TreatmentCentre, TreatmentCentreStats } from '../types/treatmentCentres';
import { countries, getCountryByCode } from '../data/countries';
import { useAuth } from './AuthContext';
import { useCurrency } from './CurrencyContext';

interface TreatmentCentresContextType {
  centres: TreatmentCentre[];
  stats: TreatmentCentreStats;
  isLoading: boolean;
  
  // Centre management
  addCentre: (centreData: Omit<TreatmentCentre, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => Promise<TreatmentCentre>;
  updateCentre: (id: string, updates: Partial<TreatmentCentre>) => Promise<void>;
  deleteCentre: (id: string) => Promise<void>;
  toggleCentreStatus: (id: string) => Promise<void>;
  
  // Queries
  getActiveCentres: () => TreatmentCentre[];
  getCentresByCountry: (countryCode: string) => TreatmentCentre[];
  getCentreById: (id: string) => TreatmentCentre | undefined;
  getHeadquarters: () => TreatmentCentre | undefined;
  
  // Currency integration
  ensureCurrencyAvailable: (countryCode: string) => Promise<void>;
}

const TreatmentCentresContext = createContext<TreatmentCentresContextType | undefined>(undefined);

export const useTreatmentCentres = () => {
  const context = useContext(TreatmentCentresContext);
  if (context === undefined) {
    throw new Error('useTreatmentCentres must be used within a TreatmentCentresProvider');
  }
  return context;
};

// Mock data for demonstration
const mockCentres: TreatmentCentre[] = [
  {
    id: '1',
    name: 'Life Arrow Johannesburg',
    code: 'JHB001',
    description: 'Our flagship wellness centre in the heart of Johannesburg',
    country: getCountryByCode('ZA')!,
    city: 'Johannesburg',
    address: {
      street: '123 Wellness Street, Sandton',
      city: 'Johannesburg',
      state: 'Gauteng',
      postalCode: '2196',
      country: 'South Africa',
    },
    coordinates: {
      latitude: -26.1076,
      longitude: 28.0567,
    },
    phone: '+27 11 123 4567',
    email: 'johannesburg@lifearrow.com',
    website: 'https://lifearrow.com/johannesburg',
    timezone: 'Africa/Johannesburg',
    workingHours: {
      monday: { isOpen: true, openTime: '08:00', closeTime: '17:00', breakTimes: [{ startTime: '12:00', endTime: '13:00', description: 'Lunch Break' }] },
      tuesday: { isOpen: true, openTime: '08:00', closeTime: '17:00', breakTimes: [{ startTime: '12:00', endTime: '13:00', description: 'Lunch Break' }] },
      wednesday: { isOpen: true, openTime: '08:00', closeTime: '17:00', breakTimes: [{ startTime: '12:00', endTime: '13:00', description: 'Lunch Break' }] },
      thursday: { isOpen: true, openTime: '08:00', closeTime: '17:00', breakTimes: [{ startTime: '12:00', endTime: '13:00', description: 'Lunch Break' }] },
      friday: { isOpen: true, openTime: '08:00', closeTime: '16:00', breakTimes: [{ startTime: '12:00', endTime: '13:00', description: 'Lunch Break' }] },
      saturday: { isOpen: true, openTime: '09:00', closeTime: '13:00' },
      sunday: { isOpen: false, openTime: '', closeTime: '' },
    },
    services: ['1', '2', '3', '4', '5'],
    practitioners: ['1'],
    capacity: {
      maxDailyAppointments: 50,
      maxConcurrentAppointments: 8,
      rooms: 6,
    },
    status: 'active',
    isHeadquarters: true,
    features: ['parking', 'wheelchair-accessible', 'wifi', 'cafe', 'reception'],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date(),
    createdBy: '1',
  },
  {
    id: '2',
    name: 'Life Arrow New York',
    code: 'NYC001',
    description: 'Premium wellness centre in Manhattan',
    country: getCountryByCode('US')!,
    city: 'New York',
    address: {
      street: '456 Wellness Avenue, Manhattan',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'United States',
    },
    coordinates: {
      latitude: 40.7128,
      longitude: -74.0060,
    },
    phone: '+1 212 555 0123',
    email: 'newyork@lifearrow.com',
    website: 'https://lifearrow.com/newyork',
    timezone: 'America/New_York',
    workingHours: {
      monday: { isOpen: true, openTime: '07:00', closeTime: '19:00', breakTimes: [{ startTime: '12:00', endTime: '13:00', description: 'Lunch Break' }] },
      tuesday: { isOpen: true, openTime: '07:00', closeTime: '19:00', breakTimes: [{ startTime: '12:00', endTime: '13:00', description: 'Lunch Break' }] },
      wednesday: { isOpen: true, openTime: '07:00', closeTime: '19:00', breakTimes: [{ startTime: '12:00', endTime: '13:00', description: 'Lunch Break' }] },
      thursday: { isOpen: true, openTime: '07:00', closeTime: '19:00', breakTimes: [{ startTime: '12:00', endTime: '13:00', description: 'Lunch Break' }] },
      friday: { isOpen: true, openTime: '07:00', closeTime: '18:00', breakTimes: [{ startTime: '12:00', endTime: '13:00', description: 'Lunch Break' }] },
      saturday: { isOpen: true, openTime: '08:00', closeTime: '16:00' },
      sunday: { isOpen: true, openTime: '09:00', closeTime: '15:00' },
    },
    services: ['1', '2', '3', '4'],
    practitioners: [],
    capacity: {
      maxDailyAppointments: 75,
      maxConcurrentAppointments: 12,
      rooms: 8,
    },
    status: 'active',
    isHeadquarters: false,
    features: ['parking', 'wheelchair-accessible', 'wifi', 'reception', 'valet'],
    createdAt: new Date('2023-06-01'),
    updatedAt: new Date(),
    createdBy: '1',
  },
  {
    id: '3',
    name: 'Life Arrow London',
    code: 'LON001',
    description: 'Elegant wellness centre in Central London',
    country: getCountryByCode('GB')!,
    city: 'London',
    address: {
      street: '789 Wellness Road, Mayfair',
      city: 'London',
      postalCode: 'W1K 1AA',
      country: 'United Kingdom',
    },
    coordinates: {
      latitude: 51.5074,
      longitude: -0.1278,
    },
    phone: '+44 20 7123 4567',
    email: 'london@lifearrow.com',
    website: 'https://lifearrow.com/london',
    timezone: 'Europe/London',
    workingHours: {
      monday: { isOpen: true, openTime: '08:00', closeTime: '18:00', breakTimes: [{ startTime: '13:00', endTime: '14:00', description: 'Lunch Break' }] },
      tuesday: { isOpen: true, openTime: '08:00', closeTime: '18:00', breakTimes: [{ startTime: '13:00', endTime: '14:00', description: 'Lunch Break' }] },
      wednesday: { isOpen: true, openTime: '08:00', closeTime: '18:00', breakTimes: [{ startTime: '13:00', endTime: '14:00', description: 'Lunch Break' }] },
      thursday: { isOpen: true, openTime: '08:00', closeTime: '18:00', breakTimes: [{ startTime: '13:00', endTime: '14:00', description: 'Lunch Break' }] },
      friday: { isOpen: true, openTime: '08:00', closeTime: '17:00', breakTimes: [{ startTime: '13:00', endTime: '14:00', description: 'Lunch Break' }] },
      saturday: { isOpen: true, openTime: '09:00', closeTime: '15:00' },
      sunday: { isOpen: false, openTime: '', closeTime: '' },
    },
    services: ['1', '2', '3'],
    practitioners: [],
    capacity: {
      maxDailyAppointments: 40,
      maxConcurrentAppointments: 6,
      rooms: 5,
    },
    status: 'active',
    isHeadquarters: false,
    features: ['wheelchair-accessible', 'wifi', 'reception', 'concierge'],
    createdAt: new Date('2023-09-01'),
    updatedAt: new Date(),
    createdBy: '1',
  },
];

export const TreatmentCentresProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { addCurrency, getCurrencyByCode } = useCurrency();
  const [centres, setCentres] = useState<TreatmentCentre[]>(mockCentres);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate stats
  const stats: TreatmentCentreStats = {
    totalCentres: centres.length,
    activeCentres: centres.filter(c => c.status === 'active').length,
    countriesCount: new Set(centres.map(c => c.country.code)).size,
    totalPractitioners: centres.reduce((sum, c) => sum + c.practitioners.length, 0),
    totalCapacity: centres.reduce((sum, c) => sum + c.capacity.maxDailyAppointments, 0),
    monthlyAppointments: 1250, // Mock data
    averageUtilization: 78, // Mock data
  };

  const addCentre = async (centreData: Omit<TreatmentCentre, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<TreatmentCentre> => {
    setIsLoading(true);
    
    try {
      // Ensure currency is available for the country
      await ensureCurrencyAvailable(centreData.country.code);
      
      const newCentre: TreatmentCentre = {
        ...centreData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user?.id || '1',
      };
      
      setCentres(prev => [...prev, newCentre]);
      return newCentre;
    } finally {
      setIsLoading(false);
    }
  };

  const updateCentre = async (id: string, updates: Partial<TreatmentCentre>): Promise<void> => {
    setIsLoading(true);
    
    try {
      // If country is being updated, ensure currency is available
      if (updates.country) {
        await ensureCurrencyAvailable(updates.country.code);
      }
      
      setCentres(prev => prev.map(centre => 
        centre.id === id 
          ? { ...centre, ...updates, updatedAt: new Date() }
          : centre
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCentre = async (id: string): Promise<void> => {
    setIsLoading(true);
    
    try {
      setCentres(prev => prev.filter(centre => centre.id !== id));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCentreStatus = async (id: string): Promise<void> => {
    const centre = centres.find(c => c.id === id);
    if (centre) {
      const newStatus = centre.status === 'active' ? 'inactive' : 'active';
      await updateCentre(id, { status: newStatus });
    }
  };

  const ensureCurrencyAvailable = async (countryCode: string): Promise<void> => {
    const country = getCountryByCode(countryCode);
    if (!country) return;

    const existingCurrency = getCurrencyByCode(country.currency.code);
    if (!existingCurrency) {
      // Add the currency if it doesn't exist
      await addCurrency({
        code: country.currency.code,
        name: country.currency.name,
        symbol: country.currency.symbol,
        symbolPosition: country.currency.symbolPosition,
        decimalPlaces: country.currency.decimalPlaces,
        thousandsSeparator: country.currency.thousandsSeparator,
        decimalSeparator: country.currency.decimalSeparator,
        isActive: true,
        isDefault: false,
      }, 1.0); // Default exchange rate, should be updated with real rates
    }
  };

  // Helper functions
  const getActiveCentres = (): TreatmentCentre[] => {
    return centres.filter(centre => centre.status === 'active');
  };

  const getCentresByCountry = (countryCode: string): TreatmentCentre[] => {
    return centres.filter(centre => centre.country.code === countryCode);
  };

  const getCentreById = (id: string): TreatmentCentre | undefined => {
    return centres.find(centre => centre.id === id);
  };

  const getHeadquarters = (): TreatmentCentre | undefined => {
    return centres.find(centre => centre.isHeadquarters);
  };

  return (
    <TreatmentCentresContext.Provider value={{
      centres,
      stats,
      isLoading,
      addCentre,
      updateCentre,
      deleteCentre,
      toggleCentreStatus,
      getActiveCentres,
      getCentresByCountry,
      getCentreById,
      getHeadquarters,
      ensureCurrencyAvailable,
    }}>
      {children}
    </TreatmentCentresContext.Provider>
  );
};