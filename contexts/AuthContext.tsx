'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthState } from '@/types';
import { getCurrentUser, setCurrentUser, getUserByEmail, logout as logoutUser } from '@/lib/storage';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  register: (userData: { email: string; name: string; password: string; role: 'admin' | 'user' }) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Check for existing user session on app load
    const currentUser = getCurrentUser();
    if (currentUser) {
      setAuthState({
        user: currentUser,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      // For demo purposes, we'll use a simple password check
      // In a real app, you'd hash passwords and check against a database
      const user = getUserByEmail(email);
      
      if (!user) {
        return { success: false, message: 'User not found' };
      }

      // Simple password check (demo: password is "password123" for all users)
      if (password !== 'password123') {
        return { success: false, message: 'Invalid password' };
      }

      setCurrentUser(user);
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });

      return { success: true, message: 'Login successful' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Login failed' };
    }
  };

  const logout = () => {
    logoutUser();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const register = async (userData: { email: string; name: string; password: string; role: 'admin' | 'user' }): Promise<{ success: boolean; message: string }> => {
    try {
      const existingUser = getUserByEmail(userData.email);
      if (existingUser) {
        return { success: false, message: 'User with this email already exists' };
      }

      // In a real app, you'd hash the password before storing
      const { addUser } = await import('@/lib/storage');
      const newUser = addUser({
        email: userData.email,
        name: userData.name,
        role: userData.role,
      });

      return { success: true, message: 'Registration successful' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Registration failed' };
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
