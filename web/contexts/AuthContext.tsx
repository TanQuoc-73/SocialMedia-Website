'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData } from '@/types/user';
import * as authService from '@/services/authService';
import { initializeSocket, disconnectSocket } from '@/lib/socket';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const loadUser = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const storedUser = localStorage.getItem('user');

                if (token && storedUser) {
                    // Verify token and get current user
                    const currentUser = await authService.getCurrentUser();
                    setUser(currentUser);

                    // Initialize Socket.IO
                    initializeSocket(token);
                }
            } catch (error) {
                console.error('Failed to load user:', error);
                // Clear invalid data
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (credentials: LoginCredentials) => {
        try {
            const response = await authService.login(credentials);

            // Store tokens
            localStorage.setItem('accessToken', response.accessToken);
            if (response.refreshToken) {
                localStorage.setItem('refreshToken', response.refreshToken);
            }

            // Get user data
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
            localStorage.setItem('user', JSON.stringify(currentUser));

            // Initialize Socket.IO
            initializeSocket(response.accessToken);
        } catch (error) {
            throw error;
        }
    };

    const register = async (data: RegisterData) => {
        try {
            const response = await authService.register(data);

            // Store tokens
            localStorage.setItem('accessToken', response.accessToken);
            if (response.refreshToken) {
                localStorage.setItem('refreshToken', response.refreshToken);
            }

            // Get user data
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
            localStorage.setItem('user', JSON.stringify(currentUser));

            // Initialize Socket.IO
            initializeSocket(response.accessToken);
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local data
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setUser(null);

            // Disconnect Socket.IO
            disconnectSocket();
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
