import { User } from './user';

// Notification types
export interface Notification {
    _id: string;
    recipient: string;
    sender: User;
    type: 'like' | 'comment' | 'follow' | 'message' | 'mention';
    content: string;
    relatedPost?: string;
    relatedComment?: string;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface NotificationResponse {
    success: boolean;
    data: Notification[];
    pagination?: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        hasMore: boolean;
    };
}
