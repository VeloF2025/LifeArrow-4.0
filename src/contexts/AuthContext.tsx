import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  completeOnboarding: (onboardingData: any) => Promise<void>;
  updateProfile: (profileData: any) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('lifeArrowUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem('lifeArrowUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Mock authentication - check credentials
      if (password !== 'password') {
        throw new Error('Invalid credentials');
      }

      let mockUser: User;
      
      if (email === 'practitioner@lifearrow.com') {
        mockUser = {
          id: '1',
          email,
          firstName: 'Dr. Sarah',
          lastName: 'Johnson',
          role: 'practitioner',
          avatar: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
          phone: '+27 11 123 4567',
          createdAt: new Date(),
          onboardingCompleted: true, // Practitioners don't need onboarding
        };
      } else if (email === 'client@lifearrow.com') {
        mockUser = {
          id: '2',
          email,
          firstName: 'John',
          lastName: 'Doe',
          role: 'client',
          avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
          phone: '+1 (555) 987-6543',
          createdAt: new Date(),
          onboardingCompleted: true, // Demo client has completed onboarding
          hasSeenIntroVideo: true, // Demo client has already seen the intro video
        };
      } else {
        throw new Error('Invalid credentials');
      }
      
      localStorage.setItem('lifeArrowUser', JSON.stringify(mockUser));
      setUser(mockUser);
    } catch (error) {
      throw new Error('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Partial<User> & { password: string }) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email!,
        firstName: userData.firstName!,
        lastName: userData.lastName!,
        role: userData.role!,
        phone: userData.phone,
        avatar: userData.role === 'practitioner' 
          ? 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
          : 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        createdAt: new Date(),
        onboardingCompleted: userData.role === 'practitioner', // Only clients need onboarding
        hasSeenIntroVideo: userData.role === 'practitioner', // Only clients need to see intro video
      };
      
      localStorage.setItem('lifeArrowUser', JSON.stringify(newUser));
      setUser(newUser);
    } catch (error) {
      throw new Error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async (onboardingData: any) => {
    if (!user) throw new Error('No user found');
    
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser = {
        ...user,
        onboardingCompleted: true,
        onboardingData,
        hasSeenIntroVideo: false // Set to false so intro video will play after onboarding
      };
      
      localStorage.setItem('lifeArrowUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      throw new Error('Failed to complete onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: any) => {
    if (!user) throw new Error('No user found');
    
    setIsLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser = {
        ...user,
        ...profileData,
        onboardingData: {
          ...user.onboardingData,
          ...profileData
        }
      };
      
      localStorage.setItem('lifeArrowUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      throw new Error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('lifeArrowUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      register, 
      completeOnboarding, 
      updateProfile, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};