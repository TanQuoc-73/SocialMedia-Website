import api from '@/lib/api';

export interface Message {
    _id: string;
    conversation: string;
    sender: {
        _id: string;
        username: string;
        profile?: {
            avatar?: string;
        };
    };
    content: string;
    type: 'text' | 'image' | 'file';
    readBy: string[];
    createdAt: string;
    updatedAt: string;
}

export interface Conversation {
    _id: string;
    participants: Array<{
        _id: string;
        username: string;
        profile?: {
            avatar?: string;
        };
    }>;
    type: 'direct' | 'group';
    name?: string;
    lastMessage?: Message;
    unreadCount?: number;
    createdAt: string;
    updatedAt: string;
}

// Get all conversations for current user
export const getConversations = async (): Promise<Conversation[]> => {
    const response = await api.get('/chat/conversations');
    return response.data.data || [];
};

// Get or create direct conversation with a user
export const getOrCreateDirectChat = async (userId: string): Promise<Conversation> => {
    const response = await api.post('/chat/conversations/direct', { userId });
    return response.data.data;
};

// Get messages in a conversation
export const getMessages = async (conversationId: string, page = 1, limit = 50): Promise<{ messages: Message[]; pagination: any }> => {
    const response = await api.get('/chat/messages', {
        params: { conversationId, page, limit }
    });
    return {
        messages: response.data.data || [],
        pagination: response.data.pagination
    };
};

// Send a message
export const sendMessage = async (conversationId: string, content: string, type: 'text' | 'image' | 'file' = 'text'): Promise<Message> => {
    const response = await api.post('/chat/messages', {
        conversationId,
        content,
        type
    });
    return response.data.data;
};

// Mark messages as read
export const markAsRead = async (conversationId: string): Promise<void> => {
    await api.put(`/chat/conversations/${conversationId}/read`);
};
