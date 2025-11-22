'use client';

import { useState, useEffect } from 'react';
import { Post } from '@/types/post';
import { updatePost } from '@/services/postService';
import Modal from '@/components/ui/Modal';
import ImageUpload from '@/components/upload/ImageUpload';
import { X } from 'lucide-react';

interface EditPostModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: Post;
    onPostUpdated?: () => void;
}

export default function EditPostModal({ isOpen, onClose, post, onPostUpdated }: EditPostModalProps) {
    const [content, setContent] = useState(post.content);
    const [loading, setLoading] = useState(false);
    const [existingImages, setExistingImages] = useState(post.media || []);
    const [newImages, setNewImages] = useState<{ url: string; publicId: string }[]>([]);

    useEffect(() => {
        if (isOpen) {
            setContent(post.content);
            setExistingImages(post.media || []);
            setNewImages([]);
        }
    }, [isOpen, post]);

    const handleImageUploaded = (url: string, publicId: string) => {
        setNewImages(prev => [...prev, { url, publicId }]);
    };

    const removeExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeNewImage = (index: number) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() && existingImages.length === 0 && newImages.length === 0) return;

        setLoading(true);
        try {
            const allMedia = [
                ...existingImages,
                ...newImages.map(img => ({
                    url: img.url,
                    type: 'image' as const,
                    publicId: img.publicId
                }))
            ];

            await updatePost(post._id, {
                content,
                media: allMedia.length > 0 ? allMedia : undefined
            });

            onPostUpdated?.();
            onClose();
        } catch (error: any) {
            console.error('Failed to update post:', error);
            alert(error.message || 'Failed to update post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Post">
            <form onSubmit={handleSubmit} className="p-4">
                {/* Content */}
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full bg-gray-100 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                    rows={4}
                />

                {/* Existing Images */}
                {existingImages.length > 0 && (
                    <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Current Images</p>
                        <div className="grid grid-cols-2 gap-2">
                            {existingImages.map((image, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={image.url}
                                        alt={`Image ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImage(index)}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* New Images Upload */}
                {(existingImages.length + newImages.length) < 4 && (
                    <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">Add More Images</p>
                        <ImageUpload
                            onImageUploaded={handleImageUploaded}
                            maxFiles={4 - existingImages.length - newImages.length}
                        />
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 justify-end pt-4 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={(!content.trim() && existingImages.length === 0 && newImages.length === 0) || loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
