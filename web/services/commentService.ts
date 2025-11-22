import api, { handleApiError } from '@/lib/api';
import { Comment, CreateCommentData } from '@/types/post';
import { ApiResponse } from '@/types/api';

// Get comments for a post
export const getComments = async (postId: string): Promise<Comment[]> => {
    try {
        const response = await api.get(`/comments?postId=${postId}`);
        // Backend returns { success: true, comments: [...], pagination: {...} }
        return response.data.comments || [];
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

// Create comment
export const createComment = async (data: CreateCommentData): Promise<Comment> => {
    try {
        const response = await api.post<ApiResponse<Comment>>('/comments', data);
        if (!response.data.data) throw new Error('Failed to create comment');
        return response.data.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

// Delete comment
export const deleteComment = async (id: string): Promise<void> => {
    try {
        await api.delete(`/comments/${id}`);
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

// Like/Unlike comment
export const toggleCommentLike = async (id: string): Promise<Comment> => {
    try {
        const response = await api.post<ApiResponse<Comment>>(`/comments/${id}/like`);
        if (!response.data.data) throw new Error('Failed to toggle like');
        return response.data.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};
