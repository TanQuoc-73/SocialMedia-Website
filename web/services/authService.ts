import api, { handleApiError } from '@/lib/api';
import {
    LoginCredentials,
    RegisterData,
    AuthResponse,
    User
} from '@/types/user';
import { ApiResponse } from '@/types/api';

// Login
export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

// Register
export const register = async (data: RegisterData): Promise<AuthResponse> => {
    try {
        const response = await api.post<AuthResponse>('/auth/register', data);
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

// Logout
export const logout = async (): Promise<void> => {
    try {
        await api.post('/auth/logout');
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

// Get current user
export const getCurrentUser = async (): Promise<User> => {
    try {
        const response = await api.get<ApiResponse<User>>('/auth/me');
        if (!response.data.data) {
            throw new Error('User data not found');
        }
        return response.data.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

// Refresh token
export const refreshToken = async (refreshToken: string): Promise<{ accessToken: string }> => {
    try {
        const response = await api.post('/auth/refresh', { refreshToken });
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

// Change password
export const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
    try {
        await api.put('/auth/change-password', { oldPassword, newPassword });
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

// Verify token
export const verifyToken = async (token: string): Promise<boolean> => {
    try {
        const response = await api.post('/auth/verify', { token });
        return response.data.success;
    } catch (error) {
        return false;
    }
};
