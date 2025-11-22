'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { User } from '@/types/user';
import api from '@/lib/api';

interface LikesModalProps {
    isOpen: boolean;
    onClose: () => void;
    postId: string;
}

export default function LikesModal({ isOpen, onClose, postId }: LikesModalProps) {
    const [likes, setLikes] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadLikes();
        }
    }, [isOpen, postId]);

    const loadLikes = async () => {
        setLoading(true);
        try {
            // Get post with populated likes
            const response = await api.get(`/posts/${postId}`);
            const post = response.data.data;

            // If likes are populated as user objects
            if (post.likes && Array.isArray(post.likes)) {
                // Check if likes are already populated
                if (post.likes.length > 0 && typeof post.likes[0] === 'object') {
                    setLikes(post.likes);
                } else {
                    // If likes are just IDs, we'll show count only
                    setLikes([]);
                }
            }
        } catch (error) {
            console.error('Failed to load likes:', error);
            setLikes([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Likes">
            <div className="p-4">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-3 animate-pulse">
                                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-32" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : likes.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                        Likes are not available in detail view yet
                    </p>
                ) : (
                    <div className="space-y-3">
                        {likes.map((user) => (
                            <div key={user._id} className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-semibold">
                                        {user.username.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">{user.username}</p>
                                    {user.profile?.fullName && (
                                        <p className="text-xs text-gray-500">{user.profile.fullName}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
}
