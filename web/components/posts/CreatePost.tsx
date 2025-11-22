'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createPost } from '@/services/postService';
import { Image, Video, Smile } from 'lucide-react';
import ImageUpload from '@/components/upload/ImageUpload';

interface CreatePostProps {
    onPostCreated?: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
    const { user } = useAuth();
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [showImageUpload, setShowImageUpload] = useState(false);
    const [uploadedImages, setUploadedImages] = useState<{ url: string; publicId: string }[]>([]);

    const handleImageUploaded = (url: string, publicId: string) => {
        setUploadedImages(prev => [...prev, { url, publicId }]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() && uploadedImages.length === 0) return;

        setLoading(true);
        try {
            const media = uploadedImages.map(img => ({
                url: img.url,
                type: 'image' as const,
                publicId: img.publicId
            }));

            await createPost({
                content,
                privacy: 'public',
                media: media.length > 0 ? media : undefined
            });

            setContent('');
            setUploadedImages([]);
            setShowImageUpload(false);
            onPostCreated?.();
        } catch (error: any) {
            console.error('Failed to create post:', error);
            alert(error.message || 'Failed to create post');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
            <form onSubmit={handleSubmit}>
                {/* Input */}
                <div className="flex gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold">
                            {user?.username?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={`What's on your mind, ${user?.username}?`}
                        className="flex-1 bg-gray-100 rounded-full px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={1}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = target.scrollHeight + 'px';
                        }}
                    />
                </div>

                {/* Image Upload */}
                {showImageUpload && (
                    <div className="mb-3">
                        <ImageUpload onImageUploaded={handleImageUploaded} maxFiles={4} />
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setShowImageUpload(!showImageUpload)}
                            className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition ${showImageUpload ? 'bg-gray-100' : ''
                                }`}
                        >
                            <Image className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-gray-700">Photo</span>
                        </button>
                        <button
                            type="button"
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <Video className="w-5 h-5 text-red-600" />
                            <span className="text-sm font-medium text-gray-700">Video</span>
                        </button>
                        <button
                            type="button"
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <Smile className="w-5 h-5 text-yellow-600" />
                            <span className="text-sm font-medium text-gray-700">Feeling</span>
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={(!content.trim() && uploadedImages.length === 0) || loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Posting...' : 'Post'}
                    </button>
                </div>
            </form>
        </div>
    );
}
