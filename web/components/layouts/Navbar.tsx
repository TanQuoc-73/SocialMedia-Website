'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Home, Users, MessageCircle, Bell } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div
                        onClick={() => router.push('/feed')}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">S</span>
                        </div>
                        <span className="text-xl font-bold text-gray-800 hidden sm:block">Social</span>
                    </div>

                    {/* Center Icons */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.push('/feed')}
                            className="p-3 hover:bg-gray-100 rounded-lg transition"
                        >
                            <Home className="w-6 h-6 text-gray-700" />
                        </button>
                        <button
                            onClick={() => router.push('/friends')}
                            className="p-3 hover:bg-gray-100 rounded-lg transition"
                        >
                            <Users className="w-6 h-6 text-gray-700" />
                        </button>
                        <button
                            onClick={() => router.push('/chat')}
                            className="p-3 hover:bg-gray-100 rounded-lg transition"
                        >
                            <MessageCircle className="w-6 h-6 text-gray-700" />
                        </button>
                        <button className="p-3 hover:bg-gray-100 rounded-lg transition">
                            <Bell className="w-6 h-6 text-gray-700" />
                        </button>
                    </div>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-semibold">
                                    {user?.username?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <span className="text-sm font-medium hidden sm:block">{user?.username}</span>
                        </button>

                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2">
                                <button
                                    onClick={() => {
                                        setShowUserMenu(false);
                                        router.push(`/profile/${user?._id}`);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition"
                                >
                                    View Profile
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 transition"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
