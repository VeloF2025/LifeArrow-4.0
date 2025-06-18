import React, { createContext, useContext, useState, useEffect } from 'react';
import { ServiceType } from '../types/appointments';
import { useAuth } from './AuthContext';

interface ServicesContextType {
  services: ServiceType[];
  isLoading: boolean;
  
  // Service management
  addService: (service: Omit<ServiceType, 'id'>) => Promise<ServiceType>;
  updateService: (id: string, updates: Partial<ServiceType>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  toggleServiceStatus: (id: string) => Promise<void>;
  
  // Queries
  getActiveServices: () => ServiceType[];
  getServicesByCategory: (category: ServiceType['category']) => ServiceType[];
  getServiceById: (id: string) => ServiceType | undefined;
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

export const useServices = () => {
  const context = useContext(ServicesContext);
  if (context === undefined) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return context;
};

// Initial mock services with ZAR pricing
const initialServices: ServiceType[] = [
  {
    id: '1',
    name: 'Body Composition Analysis',
    description: 'Comprehensive body composition scan using advanced bioelectrical impedance technology. Includes detailed analysis of body fat percentage, muscle mass, hydration levels, and metabolic age.',
    duration: 45,
    price: 2800, // ZAR
    category: 'scan',
    isActive: true,
  },
  {
    id: '2',
    name: 'Initial Wellness Consultation',
    description: 'Comprehensive wellness assessment including health history review, goal setting, and personalized wellness plan development.',
    duration: 60,
    price: 3700, // ZAR
    category: 'consultation',
    isActive: true,
  },
  {
    id: '3',
    name: 'Follow-up Consultation',
    description: 'Progress review session to assess wellness goals, adjust plans, and provide ongoing support and guidance.',
    duration: 30,
    price: 1850, // ZAR
    category: 'consultation',
    isActive: true,
  },
  {
    id: '4',
    name: 'Nutrition Therapy Session',
    description: 'Personalized nutrition guidance including meal planning, dietary recommendations, and nutritional counseling.',
    duration: 45,
    price: 2200, // ZAR
    category: 'therapy',
    isActive: true,
  },
  {
    id: '5',
    name: 'Fitness Assessment',
    description: 'Complete fitness evaluation including strength testing, cardiovascular assessment, and flexibility analysis.',
    duration: 60,
    price: 3300, // ZAR
    category: 'assessment',
    isActive: true,
  },
  {
    id: '6',
    name: 'Stress Management Session',
    description: 'Therapeutic session focused on stress reduction techniques, mindfulness training, and relaxation strategies.',
    duration: 50,
    price: 2600, // ZAR
    category: 'therapy',
    isActive: true,
  },
  {
    id: '7',
    name: 'Metabolic Rate Testing',
    description: 'Advanced testing to determine resting metabolic rate and caloric needs for optimal weight management.',
    duration: 30,
    price: 1650, // ZAR
    category: 'assessment',
    isActive: true,
  },
  {
    id: '8',
    name: 'Wellness Package - Basic',
    description: 'Comprehensive wellness package including initial consultation, body composition scan, and follow-up session.',
    duration: 120,
    price: 6500, // ZAR
    category: 'consultation',
    isActive: true,
  },
];

export const ServicesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceType[]>(initialServices);
  const [isLoading, setIsLoading] = useState(false);

  const addService = async (serviceData: Omit<ServiceType, 'id'>): Promise<ServiceType> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newService: ServiceType = {
      ...serviceData,
      id: Date.now().toString(),
    };
    
    setServices(prev => [...prev, newService]);
    setIsLoading(false);
    
    return newService;
  };

  const updateService = async (id: string, updates: Partial<ServiceType>): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setServices(prev => prev.map(service => 
      service.id === id ? { ...service, ...updates } : service
    ));
    
    setIsLoading(false);
  };

  const deleteService = async (id: string): Promise<void> => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setServices(prev => prev.filter(service => service.id !== id));
    setIsLoading(false);
  };

  const toggleServiceStatus = async (id: string): Promise<void> => {
    const service = services.find(s => s.id === id);
    if (service) {
      await updateService(id, { isActive: !service.isActive });
    }
  };

  // Helper functions
  const getActiveServices = (): ServiceType[] => {
    return services.filter(service => service.isActive);
  };

  const getServicesByCategory = (category: ServiceType['category']): ServiceType[] => {
    return services.filter(service => service.category === category);
  };

  const getServiceById = (id: string): ServiceType | undefined => {
    return services.find(service => service.id === id);
  };

  return (
    <ServicesContext.Provider value={{
      services,
      isLoading,
      addService,
      updateService,
      deleteService,
      toggleServiceStatus,
      getActiveServices,
      getServicesByCategory,
      getServiceById,
    }}>
      {children}
    </ServicesContext.Provider>
  );
};