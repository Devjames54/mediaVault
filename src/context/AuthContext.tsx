import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (email: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSession = async (session: any) => {
    if (!session?.user) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Fetch role from public.users table
    const { data } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    let role = data?.role || 'user';
    
    // Set specific email as admin
    if (session.user.email === 'jamesgideon961@gmail.com' || session.user.email === 'jamesgideon961+admin@gmail.com') {
      role = 'admin';
    } else if (session.user.email?.startsWith('admin@')) {
      role = 'admin';
    }

    setUser({
      id: session.user.id,
      email: session.user.email === 'jamesgideon961+admin@gmail.com' ? 'jamesgideon961@gmail.com' : session.user.email!,
      role
    });
    setLoading(false);
  };

  const login = async (email: string, password = 'password123') => {
    let loginEmail = email;
    if (email === 'jamesgideon961@gmail.com' && password === 'Amjay@20206') {
      loginEmail = 'jamesgideon961+admin@gmail.com';
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });
    
    if (error) {
      // Auto-create the requested admin user if they don't exist yet
      if (email === 'jamesgideon961@gmail.com' && password === 'Amjay@20206' && error.message.includes('Invalid login credentials')) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: loginEmail,
          password,
        });
        if (signUpError) throw signUpError;
        
        // Try logging in again after successful signup
        const { error: retryError } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password,
        });
        if (retryError) throw retryError;
        return;
      }
      throw error;
    }
  };

  const signup = async (email: string, password = 'password123') => {
    let signupEmail = email;
    if (email === 'jamesgideon961@gmail.com') {
      signupEmail = 'jamesgideon961+admin@gmail.com';
    }

    const { error } = await supabase.auth.signUp({
      email: signupEmail,
      password,
    });
    
    if (error) {
      if (error.message.includes('already registered')) {
        // Auto-login if they try to sign up but are already registered
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: signupEmail,
          password,
        });
        
        if (loginError) {
          if (loginError.message.includes('Invalid login credentials')) {
            throw new Error('This email is already registered. Please sign in instead.');
          }
          throw loginError;
        }
        return;
      }
      throw error;
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
