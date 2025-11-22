'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/layouts/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types/user';
import api from '@/lib/api';
import { UserPlus, UserMinus, UserCheck, Search } from 'lucide-react';

export default function FriendsPage() {
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'all' | 'requests' | 'suggestions'>('all');
    const [friends, setFriends] = useState<User[]>([]);
    const [requests, setRequests] = useState<User[]>([]);
    const [suggestions, setSuggestions] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadFriends();
        loadSuggestions();
    }, []);

    const loadFriends = async () => {
        try {
            const response = await api.get(`/users/${currentUser?._id}/friends`);
            setFriends(response.data.data || []);
        } catch (error) {
            console.error('Failed to load friends:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadSuggestions = async () => {
        try {
            const response = await api.get('/users/search?limit=10');
            setSuggestions(response.data.data || []);
        } catch (error) {
            console.error('Failed to load suggestions:', error);
        }
    };

    const handleFollow = async (userId: string) => {
        try {
            await api.post(`/users/${userId}/follow`);
            loadFriends();
            loadSuggestions();
        } catch (error) {
            console.error('Failed to follow user:', error);
        }
    };

    const handleUnfollow = async (userId: string) => {
        try {
            await api.post(`/users/${userId}/unfollow`);
            loadFriends();
        } catch (error) {
            console.error('Failed to unfollow user:', error);
        }
    };

    const filteredFriends = friends.filter(friend =>
        friend.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-100">
                <Navbar />

                <div className="max-w-6xl mx-auto pt-20 p-4">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow p-6 mb-4">
                        <h1 className="text-2xl font-bold mb-4">Friends</h1>

                        {/* Tabs */}
                        <div className="flex gap-2 border-b">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-4 py-2 font-medium border-b-2 transition ${activeTab === 'all'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                All Friends ({friends.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('requests')}
                                className={`px-4 py-2 font-medium border-b-2 transition ${activeTab === 'requests'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Friend Requests ({requests.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('suggestions')}
                                className={`px-4 py-2 font-medium border-b-2 transition ${activeTab === 'suggestions'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Suggestions
                            </button>
                        </div>
                    </div>

                    {/* Search (for All Friends tab) */}
                    {activeTab === 'all' && (
                        <div className="bg-white rounded-lg shadow p-4 mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search friends..."
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeTab === 'all' && (
                            <>
                                {loading ? (
                                    // Loading skeleton
                                    Array.from({ length: 6 }).map((_, i) => (
                                        <div key={i} className="bg-white rounded-lg shadow p-4 animate-pulse">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                                                <div className="flex-1">
                                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : filteredFriends.length === 0 ? (
                                    <div className="col-span-full bg-white rounded-lg shadow p-8 text-center">
                                        <p className="text-gray-500">
                                            {searchQuery ? 'No friends found' : 'No friends yet'}
                                        </p>
                                    </div>
                                ) : (
                                    filteredFriends.map((friend) => (
                                        <div key={friend._id} className="bg-white rounded-lg shadow p-4">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div
                                                    onClick={() => router.push(`/profile/${friend._id}`)}
                                                    className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center cursor-pointer"
                                                >
                                                    <span className="text-white text-xl font-bold">
                                                        {friend.username.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <h3
                                                        onClick={() => router.push(`/profile/${friend._id}`)}
                                                        className="font-semibold hover:underline cursor-pointer"
                                                    >
                                                        {friend.username}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {friend.followersCount || 0} followers
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => router.push(`/profile/${friend._id}`)}
                                                    className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition"
                                                >
                                                    View Profile
                                                </button>
                                                <button
                                                    onClick={() => handleUnfollow(friend._id)}
                                                    className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition"
                                                >
                                                    <UserMinus className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </>
                        )}

                        {activeTab === 'requests' && (
                            <div className="col-span-full bg-white rounded-lg shadow p-8 text-center">
                                <p className="text-gray-500">No friend requests</p>
                                <p className="text-sm text-gray-400 mt-2">
                                    Friend requests will appear here
                                </p>
                            </div>
                        )}

                        {activeTab === 'suggestions' && (
                            <>
                                {suggestions.length === 0 ? (
                                    <div className="col-span-full bg-white rounded-lg shadow p-8 text-center">
                                        <p className="text-gray-500">No suggestions available</p>
                                    </div>
                                ) : (
                                    suggestions.map((suggestion) => (
                                        <div key={suggestion._id} className="bg-white rounded-lg shadow p-4">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div
                                                    onClick={() => router.push(`/profile/${suggestion._id}`)}
                                                    className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center cursor-pointer"
                                                >
                                                    <span className="text-white text-xl font-bold">
                                                        {suggestion.username.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <h3
                                                        onClick={() => router.push(`/profile/${suggestion._id}`)}
                                                        className="font-semibold hover:underline cursor-pointer"
                                                    >
                                                        {suggestion.username}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {suggestion.followersCount || 0} followers
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleFollow(suggestion._id)}
                                                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                                            >
                                                <UserPlus className="w-5 h-5" />
                                                Add Friend
                                            </button>
                                        </div>
                                    ))
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
