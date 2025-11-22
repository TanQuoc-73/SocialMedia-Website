'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/layouts/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types/user';
import { Post } from '@/types/post';
import api from '@/lib/api';
import PostCard from '@/components/posts/PostCard';
import { Camera, MapPin, Calendar, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ProfilePage() {
    const params = useParams();
    const userId = params.id as string;
    const { user: currentUser } = useAuth();
    const [user, setUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');

    const isOwnProfile = currentUser?._id === userId;

    useEffect(() => {
        loadUserData();
        loadUserPosts();
    }, [userId]);

    const loadUserData = async () => {
        try {
            const response = await api.get(`/users/${userId}`);
            setUser(response.data.data);
        } catch (error) {
            console.error('Failed to load user:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadUserPosts = async () => {
        try {
            const response = await api.get(`/posts/user/${userId}`);
            setPosts(response.data.posts || []);
        } catch (error) {
            console.error('Failed to load posts:', error);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-100">
                    <Navbar />
                    <div className="max-w-5xl mx-auto pt-20 p-4">
                        <div className="animate-pulse">
                            <div className="h-96 bg-gray-200 rounded-lg mb-4"></div>
                            <div className="h-32 bg-gray-200 rounded-lg"></div>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!user) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gray-100">
                    <Navbar />
                    <div className="max-w-5xl mx-auto pt-20 p-4 text-center">
                        <p className="text-gray-500">User not found</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-100">
                <Navbar />

                <div className="max-w-5xl mx-auto pt-16">
                    {/* Cover Photo */}
                    <div className="relative h-96 bg-gradient-to-r from-blue-500 to-purple-600 rounded-b-lg overflow-hidden">
                        {user.profile?.coverPhoto ? (
                            <img
                                src={user.profile.coverPhoto}
                                alt="Cover"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Camera className="w-16 h-16 text-white opacity-50" />
                            </div>
                        )}

                        {isOwnProfile && (
                            <button className="absolute bottom-4 right-4 px-4 py-2 bg-white rounded-lg shadow hover:bg-gray-100 transition flex items-center gap-2">
                                <Camera className="w-4 h-4" />
                                <span className="text-sm font-medium">Edit Cover Photo</span>
                            </button>
                        )}
                    </div>

                    {/* Profile Info */}
                    <div className="bg-white shadow rounded-b-lg">
                        <div className="max-w-5xl mx-auto px-4">
                            <div className="flex items-end justify-between -mt-20 pb-4">
                                {/* Avatar */}
                                <div className="relative">
                                    <div className="w-40 h-40 rounded-full border-4 border-white bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center overflow-hidden">
                                        {user.profile?.avatar ? (
                                            <img
                                                src={user.profile.avatar}
                                                alt={user.username}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-white text-5xl font-bold">
                                                {user.username.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>

                                    {isOwnProfile && (
                                        <button className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow hover:bg-gray-100 transition">
                                            <Camera className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="mb-4">
                                    {isOwnProfile ? (
                                        <button className="px-6 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium flex items-center gap-2 transition">
                                            <Edit className="w-4 h-4" />
                                            Edit Profile
                                        </button>
                                    ) : (
                                        <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">
                                            Add Friend
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="pb-4">
                                <h1 className="text-3xl font-bold">{user.username}</h1>
                                {user.profile?.bio && (
                                    <p className="text-gray-600 mt-2">{user.profile.bio}</p>
                                )}

                                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                    {user.profile?.location && (
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            <span>{user.profile.location}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>Joined {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}</span>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex gap-6 mt-4">
                                    <div>
                                        <span className="font-bold text-lg">{user.followersCount || 0}</span>
                                        <span className="text-gray-600 ml-1">Followers</span>
                                    </div>
                                    <div>
                                        <span className="font-bold text-lg">{user.followingCount || 0}</span>
                                        <span className="text-gray-600 ml-1">Following</span>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="border-t flex gap-4">
                                <button
                                    onClick={() => setActiveTab('posts')}
                                    className={`px-4 py-3 font-medium border-b-2 transition ${activeTab === 'posts'
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    Posts
                                </button>
                                <button
                                    onClick={() => setActiveTab('about')}
                                    className={`px-4 py-3 font-medium border-b-2 transition ${activeTab === 'about'
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    About
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="max-w-5xl mx-auto p-4">
                        {activeTab === 'posts' ? (
                            <div className="max-w-2xl mx-auto space-y-4">
                                {posts.length === 0 ? (
                                    <div className="bg-white rounded-lg shadow p-8 text-center">
                                        <p className="text-gray-500">No posts yet</p>
                                    </div>
                                ) : (
                                    posts.map((post) => (
                                        <PostCard key={post._id} post={post} onUpdate={loadUserPosts} />
                                    ))
                                )}
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-xl font-bold mb-4">About</h2>
                                <div className="space-y-3">
                                    {user.profile?.bio && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Bio</p>
                                            <p className="text-gray-800">{user.profile.bio}</p>
                                        </div>
                                    )}
                                    {user.profile?.location && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Location</p>
                                            <p className="text-gray-800">{user.profile.location}</p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Email</p>
                                        <p className="text-gray-800">{user.email}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
