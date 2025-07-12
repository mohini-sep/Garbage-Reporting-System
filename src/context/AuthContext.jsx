// Make sure you're importing React correctly
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Your hooks here
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  console.log('AuthProvider rendering, loading:', loading);

  useEffect(() => {
    console.log('AuthContext useEffect running');
    
    const getInitialSession = async () => {
      try {
        console.log('Getting initial session');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else {
          console.log('Session data received:', data);
          setUser(data.session?.user || null);
        }
      } catch (err) {
        console.error('Unexpected error in getSession:', err);
      } finally {
        setLoading(false);
        console.log('Loading set to false');
      }
    };
    
    getInitialSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setUser(session?.user || null);
        setLoading(false);
      }
    );
    
    return () => {
      console.log('Cleaning up auth subscription');
      subscription?.unsubscribe();
    };
  }, []);

  // Sign up with email and password
  // In your AuthContext.jsx file, update the signUp function
  
  const signUp = async (email, password) => {
    setLoading(true);
    try {
      // Add a timeout promise to detect if Supabase is unreachable
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 15000)
      );
      
      const authPromise = supabase.auth.signUp({
        email,
        password,
      });
      
      // Race between the auth request and the timeout
      const { data, error } = await Promise.race([authPromise, timeoutPromise]);
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      
      // More specific error handling
      if (error.message.includes('fetch') || error.message.includes('timeout')) {
        return { 
          data: null, 
          error: 'Server connection issue. This might be due to Supabase service being unavailable. Please try again later.' 
        };
      }
      
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email and password
  // Inside your signIn function in AuthContext.jsx
  const signIn = async (email, password) => {
    setLoading(true);
    try {
      // Add a timeout to detect if Supabase is unreachable
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 10000)
      );
      
      const authPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      // Race between the auth request and the timeout
      const { data, error } = await Promise.race([authPromise, timeoutPromise]);
      
      if (error) throw error;
      
      setUser(data.user);
      return { data, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      
      // More specific error handling
      if (error.message.includes('fetch') || error.message.includes('timeout')) {
        return { 
          data: null, 
          error: 'Server connection issue. This might be due to Supabase service being unavailable. Please try again later.' 
        };
      }
      
      return { data: null, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };
  
  console.log('AuthProvider value:', { user: !!user, loading });

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
            <p className="mt-4 text-lg">Loading...</p>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}