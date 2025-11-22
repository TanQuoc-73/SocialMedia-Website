import api, { handleApiError } from '@/lib/api';
import { UploadResponse } from '@/types/api';

// Upload single image
export const uploadImage = async (file: File, type: 'post' | 'avatar' | 'cover'): Promise<UploadResponse> => {
    try {
        const formData = new FormData();
        formData.append('image', file);

        const endpoint = type === 'post' ? '/upload/post-image' :
            type === 'avatar' ? '/upload/avatar' :
                '/upload/cover-photo';

        const response = await api.post<UploadResponse>(endpoint, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

// Upload multiple images
export const uploadImages = async (files: File[]): Promise<UploadResponse[]> => {
    try {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('images', file);
        });

        const response = await api.post('/upload/post-images', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data.data;
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};

// Delete uploaded file
export const deleteUpload = async (publicId: string): Promise<void> => {
    try {
        await api.delete(`/upload/${publicId}`);
    } catch (error) {
        throw new Error(handleApiError(error));
    }
};
