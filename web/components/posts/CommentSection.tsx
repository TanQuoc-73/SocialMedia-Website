'use client';

import { useState, useEffect } from 'react';
import { Comment } from '@/types/post';
import { useAuth } from '@/contexts/AuthContext';
import { getComments, createComment, deleteComment } from '@/services/commentService';
import { Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommentSectionProps {
    postId: string;
    commentsCount: number;
    isOpen: boolean;
}

export default function CommentSection({ postId, commentsCount, isOpen }: CommentSectionProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);

    const loadComments = async () => {
        try {
            console.log('Loading comments for post:', postId);
            const data = await getComments(postId);
            console.log('Comments loaded:', data);
            setComments(data);
        } catch (error) {
            console.error('Failed to load comments:', error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadComments();
        }
    }, [isOpen, postId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            console.log('Creating comment:', { postId, content: newComment });
            await createComment({ postId, content: newComment });
            setNewComment('');
            await loadComments();
        } catch (error: any) {
            console.error('Create comment error:', error);
            alert(error.message || 'Failed to post comment');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm('Delete this comment?')) return;

        try {
            await deleteComment(commentId);
            await loadComments();
        } catch (error) {
            console.error('Failed to delete comment:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="border-t">
            {/* Comments List */}
            {comments.length > 0 && (
                <div className="px-4 py-3 space-y-3 max-h-96 overflow-y-auto bg-gray-50">
                    {comments.map((comment) => (
                        <div key={comment._id} className="flex gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xs font-semibold">
                                    {comment.author.username.charAt(0).toUpperCase()}
                                </span>
                            </div>

                            <div className="flex-1">
                                <div className="bg-white rounded-2xl px-3 py-2 shadow-sm">
                                    <p className="font-semibold text-sm">{comment.author.username}</p>
                                    <p className="text-sm text-gray-800">{comment.content}</p>
                                </div>

                                <div className="flex items-center gap-3 px-3 mt-1">
                                    <span className="text-xs text-gray-500">
                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                    </span>

                                    {user?._id === comment.author._id && (
                                        <button
                                            onClick={() => handleDelete(comment._id)}
                                            className="text-xs text-red-600 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Comment */}
            <form onSubmit={handleSubmit} className="px-4 py-3 flex gap-2 bg-white">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-semibold">
                        {user?.username?.charAt(0).toUpperCase()}
                    </span>
                </div>

                <div className="flex-1 flex gap-2">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                    />

                    <button
                        type="submit"
                        disabled={!newComment.trim() || loading}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition disabled:opacity-50"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
}
