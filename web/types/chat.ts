import { User } from './user';

// Message types
export interface Message {
    _id: string;
    conversation: string;
    sender: User;
    content: string;
    media?: {
        url: string;
        type: 'image' | 'video' | 'file';
    }[];
    messageType: 'text' | 'image' | 'video' | 'file';
    readBy: string[];
    reactions?: {
        user: string;
        emoji: string;
    }[];
    repliedTo?: string;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
}

// Conversation types
export interface Conversation {
    _id: string;
    participants: User[];
    isGroup: boolean;
    groupName?: string;
    groupAvatar?: string;
    admins?: string[];
    lastMessage?: Message;
    createdAt: string;
    updatedAt: string;
}

export interface CreateConversationData {
    participantId?: string;
    participants?: string[];
    isGroup?: boolean;
    groupName?: string;
}

export interface SendMessageData {
    conversationId: string;
    content: string;
    messageType?: 'text' | 'image' | 'video' | 'file';
    media?: {
        url: string;
        type: 'image' | 'video' | 'file';
    }[];
}
