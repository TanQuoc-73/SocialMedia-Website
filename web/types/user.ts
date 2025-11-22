// User types
export interface User {
    _id: string;
    username: string;
    email: string;
    profile: {
        fullName?: string;
        bio?: string;
        avatar?: string;
        coverPhoto?: string;
        location?: string;
        website?: string;
    };
    followers: string[];
    following: string[];
    followersCount: number;
    followingCount: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    lastSeen?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
    fullName?: string;
}

export interface AuthResponse {
    success: boolean;
    accessToken: string;
    refreshToken?: string;
    user?: User;
}

export interface UpdateProfileData {
    profile?: {
        fullName?: string;
        bio?: string;
        avatar?: string;
        coverPhoto?: string;
        location?: string;
        website?: string;
    };
}
