import api, { handleApiError } from '@/lib/api';
import { Post, CreatePostData, UpdatePostData } from '@/types/post';
import { PaginatedResponse, ApiResponse } from '@/types/api';

// Get all posts with pagination
export const getPosts = async (page = 1, limit = 10): Promise<PaginatedResponse<Post>> => {
    try {
        const response = await api.get<PaginatedResponse<Post>>(`/posts?page=${page}&limit=${limit}`);
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

// Get single post
export const getPost = async (id: string): Promise<Post> => {
    try {
        const response = await api.get<ApiResponse<Post>>(`/posts/${id}`);
        if (!response.data.data) throw new Error('Post not found');
        return response.data.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

// Create post
export const createPost = async (data: CreatePostData): Promise<Post> => {
    try {
        const response = await api.post<ApiResponse<Post>>('/posts', data);
        if (!response.data.data) throw new Error('Failed to create post');
        return response.data.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

// Update post
export const updatePost = async (id: string, data: UpdatePostData): Promise<Post> => {
    try {
        const response = await api.put<ApiResponse<Post>>(`/posts/${id}`, data);
        if (!response.data.data) throw new Error('Failed to update post');
        return response.data.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

// Delete post
export const deletePost = async (id: string): Promise<void> => {
    try {
        await api.delete(`/posts/${id}`);
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

// Like/Unlike post
export const toggleLike = async (id: string): Promise<Post> => {
    try {
        const response = await api.post<ApiResponse<Post>>(`/posts/${id}/like`);
        if (!response.data.data) throw new Error('Failed to toggle like');
        return response.data.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};
