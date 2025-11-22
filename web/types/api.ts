// Generic API response types
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        hasMore: boolean;
    };
}

export interface ApiError {
    success: false;
    message: string;
    error?: string;
    statusCode?: number;
}

// Upload types
export interface UploadResponse {
    success: boolean;
    message: string;
    data: {
        url: string;
        publicId: string;
        format?: string;
        width?: number;
        height?: number;
        size?: number;
    };
}
