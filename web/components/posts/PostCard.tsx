'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Post } from '@/types/post';
import { useAuth } from '@/contexts/AuthContext';
import { toggleLike, deletePost } from '@/services/postService';
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import CommentSection from './CommentSection';
import LikesModal from './LikesModal';
import EditPostModal from './EditPostModal';

interface PostCardProps {
    post: Post;
    onUpdate?: () => void;
}

export default function PostCard({ post, onUpdate }: PostCardProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [isLiked, setIsLiked] = useState(post.likes.includes(user?._id || ''));
    const [likesCount, setLikesCount] = useState(post.likesCount);
    const [showMenu, setShowMenu] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [showLikesModal, setShowLikesModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const handleLike = async () => {
        try {
            const updatedPost = await toggleLike(post._id);
            setIsLiked(updatedPost.likes.includes(user?._id || ''));
            setLikesCount(updatedPost.likesCount);
        } catch (error) {
            console.error('Failed to toggle like:', error);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            await deletePost(post._id);
            onUpdate?.();
        } catch (error) {
            console.error('Failed to delete post:', error);
        }
    };

    const handleEdit = () => {
        setShowMenu(false);
        setShowEditModal(true);
    };

    const isOwner = user?._id === post.author._id;

    return (
        <>
            <div className="bg-white rounded-lg shadow">
                {/* Post Header */}
                <div className="p-4 flex items-center justify-between">
                    <div
                        onClick={() => router.push(`/profile/${post.author._id}`)}
                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 rounded-lg p-1 -m-1 transition"
                    >
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">
                                {post.author.username.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <p className="font-semibold text-sm hover:underline">{post.author.username}</p>
                            <p className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                            </p>
                        </div>
                    </div>

                    {isOwner && (
                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="p-2 hover:bg-gray-100 rounded-full transition"
                            >
                                <MoreHorizontal className="w-5 h-5 text-gray-600" />
                            </button>

                            {showMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                                    <button
                                        onClick={handleEdit}
                                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
                                    >
                                        <Edit className="w-4 h-4" />
                                        <span className="text-sm">Edit Post</span>
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-red-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span className="text-sm">Delete Post</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Post Content */}
                <div className="px-4 pb-3">
                    <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
                </div>

                {/* Post Media */}
                {post.media && post.media.length > 0 && (
                    <div className="px-4 pb-3">
                        <img
                            src={post.media[0].url}
                            alt="Post media"
                            className="w-full rounded-lg"
                        />
                    </div>
                )}

                {/* Stats - Clickable */}
                <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500 border-t border-b">
                    <button
                        onClick={() => setShowLikesModal(true)}
                        className="hover:underline cursor-pointer"
                    >
                        {likesCount} {likesCount === 1 ? 'like' : 'likes'}
                    </button>
                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="hover:underline cursor-pointer"
                    >
                        {post.commentsCount} {post.commentsCount === 1 ? 'comment' : 'comments'}
                    </button>
                </div>

                {/* Actions */}
                <div className="p-2 flex items-center justify-around">
                    <button
                        onClick={handleLike}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-50 transition ${isLiked ? 'text-blue-600' : 'text-gray-600'
                            }`}
                    >
                        <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                        <span className="font-medium text-sm">Like</span>
                    </button>

                    <button
                        onClick={() => setShowComments(!showComments)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-50 transition text-gray-600"
                    >
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-medium text-sm">Comment</span>
                    </button>

                    <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg hover:bg-gray-50 transition text-gray-600">
                        <Share2 className="w-5 h-5" />
                        <span className="font-medium text-sm">Share</span>
                    </button>
                </div>

                {/* Comment Section */}
                <CommentSection
                    postId={post._id}
                    commentsCount={post.commentsCount}
                    isOpen={showComments}
                />
            </div>

            {/* Likes Modal */}
            <LikesModal
                isOpen={showLikesModal}
                onClose={() => setShowLikesModal(false)}
                postId={post._id}
            />

            {/* Edit Post Modal */}
            <EditPostModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                post={post}
                onPostUpdated={onUpdate}
            />
        </>
    );
}
