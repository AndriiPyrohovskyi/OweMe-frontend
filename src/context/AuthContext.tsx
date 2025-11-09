import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { authStorage } from '../services/storage/authStorage';
import { authApi } from '../services/api/endpoints/auth';
import { ApiError } from '../services/api/client';

interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  description?: string;
  isBanned?: boolean;
  createdAt?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children } : { children: ReactNode}) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        try {
          setIsLoading(true);
          const savedToken = await authStorage.getToken();
        
          if (!savedToken) {
            setUser(null);
            setToken(null);
            return;
          }

          try {
            const profile = await authApi.getProfile();
            setUser(profile);
            setToken(savedToken);
          } catch (error) {
            await authStorage.clearAll();
            setUser(null);
            setToken(null);
          }
        } catch (error) {
            console.error('Auth check error:', error);
            setUser(null);
            setToken(null);
        } finally {
            setIsLoading(false);
        }
    };
    const login = async (username: string, password: string) => {
        try {
          const response = await authApi.login({ username, password });
          await authStorage.setToken(response.accessToken);
        
          const profile = await authApi.getProfile();
          await authStorage.setUser(profile);
        
          setToken(response.accessToken);
          setUser(profile);
        } catch (error) {
          throw error;
        }
    };
    const logout = async () => {
        await authStorage.clearAll();
        setUser(null);
        setToken(null);
    };
    useEffect(() => {
        checkAuth();
    }, []);

    const value = {
        user,
        token,
        isLoading,
        isAuthenticated: !!user && !!token,
        login,
        logout,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};