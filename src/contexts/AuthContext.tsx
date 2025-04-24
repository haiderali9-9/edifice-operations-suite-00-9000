
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/types/supabase';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  avatar_url: string | null;
  email: string | null;
  phone?: string | null;
  position?: string | null;
  department?: string | null;
  is_active?: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Function to check if the user is an admin
  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('is_admin');
      
      if (error) throw error;
      
      setIsAdmin(data || false);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          try {
            // Use setTimeout to avoid potential auth deadlocks
            setTimeout(() => {
              fetchProfile(currentSession.user.id);
              checkAdminStatus(currentSession.user.id);
            }, 0);
          } catch (error) {
            console.error('Error fetching profile during auth change:', error);
          } finally {
            setIsLoading(false);
          }
        } else {
          setProfile(null);
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id)
          .catch(error => {
            console.error('Error fetching profile during initial load:', error);
          })
          .finally(() => {
            setIsLoading(false);
          });
        checkAdminStatus(currentSession.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchProfile(userId: string) {
    try {
      console.log('Fetching profile for user:', userId);
      
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (profileError) {
        console.error('Supabase error fetching profile:', profileError);
        
        // If profile doesn't exist, create one
        if (profileError.code === 'PGRST116') { // No rows returned
          await createProfile(userId);
          return;
        }
        throw profileError;
      }
      
      if (existingProfile) {
        console.log('Found existing profile:', existingProfile);

        // Check if user is active before setting profile
        if (existingProfile.is_active === false) {
          toast({
            title: 'Account Pending Approval',
            description: 'Your account is pending approval from an administrator.',
            variant: 'destructive',
          });
          await signOut();
          return;
        }

        setProfile(existingProfile as unknown as UserProfile);
      } else {
        console.warn('No profile found for user:', userId);
        await createProfile(userId);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  async function createProfile(userId: string) {
    try {
      // Get user data
      const { data: userData } = await supabase.auth.getUser(userId);
      
      if (!userData?.user) {
        console.error('Could not find user data for profile creation');
        return;
      }
      
      // Create a default profile with user data - set is_active to false for admin approval
      const newProfile = {
        id: userId,
        first_name: userData.user.user_metadata?.first_name || '',
        last_name: userData.user.user_metadata?.last_name || '',
        email: userData.user.email,
        role: 'user',
        avatar_url: null,
        is_active: false // Requires admin approval
      };
      
      console.log('Creating new profile:', newProfile);
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert(newProfile);
        
      if (insertError) {
        console.error('Error creating profile:', insertError);
        throw insertError;
      }
      
      // Don't set the profile for new users since they need approval
      // Instead, show a toast and sign them out
      toast({
        title: 'Registration Complete',
        description: 'Your account has been created but requires admin approval. You will be notified when your account is approved.',
        duration: 6000,
      });
      
      // Sign out the user after registration since they need approval
      setTimeout(() => signOut(), 3000);
      
      console.log('Profile created successfully, awaiting approval');
    } catch (error) {
      console.error('Error in profile creation:', error);
    }
  }

  async function refreshProfile(): Promise<void> {
    if (user) {
      try {
        await fetchProfile(user.id);
      } catch (error) {
        console.error('Error refreshing profile:', error);
      }
    }
  }

  async function signIn(email: string, password: string) {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;

      // Redirect happens in useEffect after successfully fetching profile
    } catch (error: any) {
      toast({
        title: 'Error signing in',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function signUp(email: string, password: string, firstName: string, lastName: string) {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });
      
      if (error) throw error;
      
      toast({
        title: 'Account created!',
        description: 'Your account has been created and is pending approval from an administrator.',
        duration: 6000,
      });

      navigate('/auth');
      
    } catch (error: any) {
      toast({
        title: 'Error creating account',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function signOut() {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: 'Error signing out',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function updateProfile(updates: Partial<UserProfile>): Promise<void> {
    try {
      if (!user) throw new Error('No user logged in');
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error updating profile',
        description: error.message,
        variant: 'destructive',
      });
    }
  }

  const value = {
    session,
    user,
    profile,
    isAdmin,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
