import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

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
    const checkSession = async () => {
      setIsLoading(true);
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          return;
        }
        
        if (session) {
          // Get user profile from our users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (userError) {
            console.error('Error fetching user data:', userError);
            return;
          }
          
          if (userData) {
            setUser({
              id: userData.id,
              email: userData.email,
              firstName: userData.first_name,
              lastName: userData.last_name,
              role: userData.role,
              avatar: userData.avatar,
              phone: userData.phone,
              createdAt: new Date(userData.created_at),
              onboardingCompleted: userData.onboarding_completed,
              hasSeenIntroVideo: userData.has_seen_intro_video
            });
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Get user profile from our users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (userError) {
            console.error('Error fetching user data:', userError);
            return;
          }
          
          if (userData) {
            setUser({
              id: userData.id,
              email: userData.email,
              firstName: userData.first_name,
              lastName: userData.last_name,
              role: userData.role,
              avatar: userData.avatar,
              phone: userData.phone,
              createdAt: new Date(userData.created_at),
              onboardingCompleted: userData.onboarding_completed,
              hasSeenIntroVideo: userData.has_seen_intro_video
            });
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // For demo purposes, allow login with demo credentials
      if (email === 'practitioner@lifearrow.com' && password === 'password') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        // Check if user exists in our users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        // If user doesn't exist in our table, create them
        if (userError) {
          // Create user profile
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: email,
              first_name: 'Dr. Sarah',
              last_name: 'Johnson',
              role: 'practitioner',
              avatar: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
              phone: '+27 11 123 4567',
              onboarding_completed: true
            });
          
          if (insertError) throw insertError;
        }
      } else if (email === 'client@lifearrow.com' && password === 'password') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        // Check if user exists in our users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        // If user doesn't exist in our table, create them
        if (userError) {
          // Create user profile
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: email,
              first_name: 'John',
              last_name: 'Doe',
              role: 'client',
              avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
              phone: '+1 (555) 987-6543',
              onboarding_completed: true,
              has_seen_intro_video: true
            });
          
          if (insertError) throw insertError;
        }
      } else {
        // Regular login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Partial<User> & { password: string }) => {
    setIsLoading(true);
    
    try {
      // Register with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email!,
        password: userData.password
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Create user profile in our users table
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: userData.email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            role: userData.role,
            phone: userData.phone,
            avatar: userData.role === 'practitioner' 
              ? 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
              : 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
            onboarding_completed: userData.role === 'practitioner', // Only clients need onboarding
            has_seen_intro_video: userData.role === 'practitioner' // Only clients need to see intro video
          });
        
        if (insertError) throw insertError;
        
        // If user is a client, create a client profile
        if (userData.role === 'client') {
          const { data: clientProfile, error: profileError } = await supabase
            .from('client_profiles')
            .insert({
              user_id: data.user.id,
              status: 'active',
              wellness_score: 70
            })
            .select()
            .single();
          
          if (profileError) throw profileError;
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async (onboardingData: any) => {
    if (!user) throw new Error('No user found');
    
    setIsLoading(true);
    
    try {
      // Update user record to mark onboarding as completed
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({
          onboarding_completed: true,
          has_seen_intro_video: false // Set to false so intro video will play after onboarding
        })
        .eq('id', user.id);
      
      if (userUpdateError) throw userUpdateError;
      
      // Update client profile with onboarding data
      const { data: clientProfile, error: profileError } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      
      // If client profile exists, update it, otherwise create it
      if (clientProfile) {
        const { error: updateError } = await supabase
          .from('client_profiles')
          .update({
            title: onboardingData.title,
            preferred_name: onboardingData.preferredName,
            date_of_birth: onboardingData.dateOfBirth,
            gender: onboardingData.gender,
            id_passport_number: onboardingData.idPassportNumber,
            physical_address: onboardingData.physicalAddress,
            postal_address: onboardingData.postalAddress,
            preferred_contact_method: onboardingData.preferredContactMethod,
            emergency_contact_name: onboardingData.emergencyContactName,
            emergency_contact_phone: onboardingData.emergencyContactNumber,
            emergency_contact_relationship: onboardingData.relationshipToYou,
            medical_aid_scheme: onboardingData.medicalAidSchemeName,
            medical_aid_plan: onboardingData.medicalAidPlan,
            medical_aid_number: onboardingData.medicalAidNumber,
            main_member_name: onboardingData.mainMemberName,
            main_member_id: onboardingData.mainMemberIdNumber,
            updated_at: new Date().toISOString()
          })
          .eq('id', clientProfile.id);
        
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('client_profiles')
          .insert({
            user_id: user.id,
            title: onboardingData.title,
            preferred_name: onboardingData.preferredName,
            date_of_birth: onboardingData.dateOfBirth,
            gender: onboardingData.gender,
            id_passport_number: onboardingData.idPassportNumber,
            physical_address: onboardingData.physicalAddress,
            postal_address: onboardingData.postalAddress,
            preferred_contact_method: onboardingData.preferredContactMethod,
            emergency_contact_name: onboardingData.emergencyContactName,
            emergency_contact_phone: onboardingData.emergencyContactNumber,
            emergency_contact_relationship: onboardingData.relationshipToYou,
            medical_aid_scheme: onboardingData.medicalAidSchemeName,
            medical_aid_plan: onboardingData.medicalAidPlan,
            medical_aid_number: onboardingData.medicalAidNumber,
            main_member_name: onboardingData.mainMemberName,
            main_member_id: onboardingData.mainMemberIdNumber,
            status: 'active',
            wellness_score: 70
          });
        
        if (insertError) throw insertError;
      }
      
      // Update local user state
      setUser({
        ...user,
        onboardingCompleted: true,
        hasSeenIntroVideo: false,
        onboardingData
      });
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      throw new Error('Failed to complete onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: any) => {
    if (!user) throw new Error('No user found');
    
    setIsLoading(true);
    
    try {
      // Update user record if needed
      if (profileData.firstName || profileData.lastName || profileData.email || profileData.phone || 
          profileData.hasSeenIntroVideo !== undefined) {
        
        const updates: any = {};
        if (profileData.firstName) updates.first_name = profileData.firstName;
        if (profileData.lastName) updates.last_name = profileData.lastName;
        if (profileData.email) updates.email = profileData.email;
        if (profileData.phone) updates.phone = profileData.phone;
        if (profileData.hasSeenIntroVideo !== undefined) updates.has_seen_intro_video = profileData.hasSeenIntroVideo;
        
        const { error: userUpdateError } = await supabase
          .from('users')
          .update(updates)
          .eq('id', user.id);
        
        if (userUpdateError) throw userUpdateError;
      }
      
      // Update client profile if user is a client
      if (user.role === 'client') {
        const { data: clientProfile, error: profileError } = await supabase
          .from('client_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') throw profileError;
        
        if (clientProfile) {
          const profileUpdates: any = {};
          
          // Map profile data fields to database fields
          const fieldMappings: Record<string, string> = {
            title: 'title',
            fullName: 'full_name',
            preferredName: 'preferred_name',
            dateOfBirth: 'date_of_birth',
            gender: 'gender',
            idPassportNumber: 'id_passport_number',
            emailAddress: 'email_address',
            cellNumber: 'cell_number',
            alternativeNumber: 'alternative_number',
            physicalAddress: 'physical_address',
            postalAddress: 'postal_address',
            preferredContactMethod: 'preferred_contact_method',
            emergencyContactName: 'emergency_contact_name',
            emergencyContactNumber: 'emergency_contact_phone',
            relationshipToYou: 'emergency_contact_relationship',
            medicalAidSchemeName: 'medical_aid_scheme',
            medicalAidPlan: 'medical_aid_plan',
            medicalAidNumber: 'medical_aid_number',
            mainMemberName: 'main_member_name',
            mainMemberIdNumber: 'main_member_id'
          };
          
          // Add fields that exist in the profile data
          Object.entries(fieldMappings).forEach(([clientKey, dbKey]) => {
            if (profileData[clientKey] !== undefined) {
              profileUpdates[dbKey] = profileData[clientKey];
            }
          });
          
          // Only update if there are changes
          if (Object.keys(profileUpdates).length > 0) {
            profileUpdates.updated_at = new Date().toISOString();
            
            const { error: updateError } = await supabase
              .from('client_profiles')
              .update(profileUpdates)
              .eq('id', clientProfile.id);
            
            if (updateError) throw updateError;
          }
        }
      }
      
      // Update local user state
      setUser(prev => {
        if (!prev) return null;
        
        const updatedUser = { ...prev };
        
        if (profileData.firstName) updatedUser.firstName = profileData.firstName;
        if (profileData.lastName) updatedUser.lastName = profileData.lastName;
        if (profileData.email) updatedUser.email = profileData.email;
        if (profileData.phone) updatedUser.phone = profileData.phone;
        if (profileData.hasSeenIntroVideo !== undefined) updatedUser.hasSeenIntroVideo = profileData.hasSeenIntroVideo;
        
        // Store onboarding data
        updatedUser.onboardingData = {
          ...prev.onboardingData,
          ...profileData
        };
        
        return updatedUser;
      });
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw new Error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
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