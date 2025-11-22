'use client';

import { useState } from 'react';
import { User } from '@/types/user';
import api from '@/lib/api';
import { getOrCreateDirectChat } from '@/services/chatService';
import { X, Search } from 'lucide-react';

interface NewChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onChatCreated: (conversationId: string) => void;
}

export default function NewChatModal({ isOpen, onClose, onChatCreated }: NewChatModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    const searchUsers = async (query: string) => {
        if (!query.trim()) {
            setUsers([]);
            return;
        }

        setLoading(true);
        try {
            const response = await api.get('/users/search', {
                params: { q: query, limit: 10 }
            });
            setUsers(response.data.data || []);
        } catch (error) {
            console.error('Failed to search users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectUser = async (userId: string) => {
        try {
            const conversation = await getOrCreateDirectChat(userId);
            onChatCreated(conversation._id);
            onClose();
        } catch (error) {
            console.error('Failed to create chat:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md mx-4">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-xl font-bold">New Message</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                searchUsers(e.target.value);
                            }}
                            placeholder="Search for people..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Users List */}
                <div className="max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Searching...</div>
                    ) : users.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            {searchQuery ? 'No users found' : 'Search for people to start chatting'}
                        </div>
                    ) : (
                        users.map((user) => (
                            <div
                                key={user._id}
                                onClick={() => handleSelectUser(user._id)}
                                className="p-4 hover:bg-gray-50 cursor-pointer transition flex items-center gap-3"
                            >
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">
                                        {user.username.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-semibold">{user.username}</h3>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
