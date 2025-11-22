'use client';

import { useState, useEffect } from 'react';
import { getPosts } from '@/services/postService';
import { Post } from '@/types/post';
import PostCard from './PostCard';

export default function PostList() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadPosts = async () => {
        try {
            setLoading(true);
            const response = await getPosts(1, 10);
            setPosts(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to load posts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, []);

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-24"></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded"></div>
                            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-red-600">{error}</p>
                <button
                    onClick={loadPosts}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">No posts yet. Be the first to post!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <PostCard key={post._id} post={post} onUpdate={loadPosts} />
            ))}
        </div>
    );
}
