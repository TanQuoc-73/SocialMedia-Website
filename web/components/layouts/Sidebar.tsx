'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Home, Users, Bookmark, Calendar } from 'lucide-react';

export default function Sidebar() {
    const { user } = useAuth();
    const router = useRouter();

    const menuItems = [
        { icon: Home, label: 'Feed', active: true },
        { icon: Users, label: 'Friends', active: false },
        { icon: Bookmark, label: 'Saved', active: false },
        { icon: Calendar, label: 'Events', active: false },
    ];

    return (
        <aside className="hidden lg:block w-64 sticky top-20">
            <div className="bg-white rounded-lg shadow p-4">
                {/* User Profile */}
                <div
                    onClick={() => router.push(`/profile/${user?._id}`)}
                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer mb-4"
                >
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                            {user?.username?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <p className="font-semibold text-sm">{user?.username}</p>
                        <p className="text-xs text-gray-500">View profile</p>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.label}
                            className={`w-full flex items-center gap-3 p-2 rounded-lg transition ${item.active
                                ? 'bg-blue-50 text-blue-600'
                                : 'hover:bg-gray-50 text-gray-700'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium text-sm">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </aside>
    );
}
