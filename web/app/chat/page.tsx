'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/layouts/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Conversation, Message, getConversations, getMessages, sendMessage } from '@/services/chatService';
import NewChatModal from '@/components/chat/NewChatModal';
import { Send, Search, MoreVertical, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ChatPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            loadMessages(selectedConversation._id);
        }
    }, [selectedConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Socket.IO listener for real-time messages
    useEffect(() => {
        const setupSocket = async () => {
            const { getSocket } = await import('@/lib/socket');
            const socket = getSocket();

            if (!socket) return;

            // Listen for new messages
            socket.on('message:new', (data: { conversationId: string; message: Message }) => {
                console.log('Received new message:', data);

                // Only add message if it's for the current conversation
                if (selectedConversation && data.conversationId === selectedConversation._id) {
                    setMessages(prev => {
                        // Check if message already exists (avoid duplicates)
                        const exists = prev.some(m => m._id === data.message._id);
                        if (exists) return prev;
                        return [...prev, data.message];
                    });
                }

                // Update conversation list: update lastMessage AND move to top
                setConversations(prev => {
                    const updatedConvs = prev.map(conv => {
                        if (conv._id === data.conversationId) {
                            return { ...conv, lastMessage: data.message, updatedAt: new Date().toISOString() };
                        }
                        return conv;
                    });

                    // Sort by updatedAt descending (newest first)
                    return updatedConvs.sort((a, b) =>
                        new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
                    );
                });
            });

            return () => {
                socket.off('message:new');
            };
        };

        setupSocket();
    }, [selectedConversation]);

    const loadConversations = async () => {
        try {
            const data = await getConversations();
            setConversations(data);
        } catch (error) {
            console.error('Failed to load conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (conversationId: string) => {
        try {
            const { messages: data } = await getMessages(conversationId);
            console.log('Loaded messages:', data);
            const sortedMessages = data.sort((a, b) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
            setMessages(sortedMessages);
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !selectedConversation) return;

        try {
            const message = await sendMessage(selectedConversation._id, messageInput);
            setMessages(prev => [...prev, message]);
            setMessageInput('');

            // Emit socket event for real-time update
            const { emitSocketEvent } = await import('@/lib/socket');
            emitSocketEvent('message:send', {
                conversationId: selectedConversation._id,
                message
            });
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleNewChatCreated = async (conversationId: string) => {
        await loadConversations();
        const conversation = conversations.find(c => c._id === conversationId);
        if (conversation) {
            setSelectedConversation(conversation);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const getOtherParticipant = (conversation: Conversation) => {
        return conversation.participants.find(p => p._id !== user?._id);
    };

    const filteredConversations = conversations.filter(conv => {
        const other = getOtherParticipant(conv);
        return other?.username?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-100">
                <Navbar />

                <div className="max-w-7xl mx-auto pt-16 h-screen flex">
                    <div className="w-80 bg-white border-r flex flex-col">
                        <div className="p-4 border-b">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-xl font-bold">Messages</h2>
                                <button
                                    onClick={() => setShowNewChatModal(true)}
                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition"
                                >
                                    New
                                </button>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search conversations..."
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="p-4 text-center text-gray-500">Loading...</div>
                            ) : filteredConversations.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                    {searchQuery ? 'No conversations found' : 'No conversations yet'}
                                </div>
                            ) : (
                                filteredConversations.map((conversation) => {
                                    const other = getOtherParticipant(conversation);
                                    return (
                                        <div
                                            key={conversation._id}
                                            onClick={() => setSelectedConversation(conversation)}
                                            className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${selectedConversation?._id === conversation._id ? 'bg-blue-50' : ''
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white font-bold">
                                                        {other?.username?.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="font-semibold text-sm truncate">{other?.username}</h3>
                                                        {conversation.lastMessage && (
                                                            <span className="text-xs text-gray-500">
                                                                {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {conversation.lastMessage && (
                                                        <p className="text-sm text-gray-600 truncate">
                                                            {conversation.lastMessage.content}
                                                        </p>
                                                    )}
                                                </div>
                                                {conversation.unreadCount && conversation.unreadCount > 0 && (
                                                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-xs font-bold">{conversation.unreadCount}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col bg-white">
                        {selectedConversation ? (
                            <>
                                <div className="p-4 border-b flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                            <span className="text-white font-bold">
                                                {getOtherParticipant(selectedConversation)?.username?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{getOtherParticipant(selectedConversation)?.username}</h3>
                                            <p className="text-xs text-gray-500">Active now</p>
                                        </div>
                                    </div>
                                    <button className="p-2 hover:bg-gray-100 rounded-full">
                                        <MoreVertical className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messages.map((message) => {
                                        const isOwn = message.sender._id === user?._id;
                                        const senderName = message.sender?.username || 'Unknown User';
                                        return (
                                            <div
                                                key={message._id}
                                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                                                    <div
                                                        className={`px-4 py-2 rounded-2xl ${isOwn ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
                                                            }`}
                                                    >
                                                        {!isOwn && (
                                                            <p className="text-xs font-semibold mb-1 text-blue-600">{senderName}</p>
                                                        )}
                                                        <p className="text-sm">{message.content}</p>
                                                    </div>
                                                    <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                                                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                <form onSubmit={handleSendMessage} className="p-4 border-t">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            placeholder="Type a message..."
                                            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!messageInput.trim()}
                                            className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-500">
                                <div className="text-center">
                                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p className="text-lg font-medium">Select a conversation</p>
                                    <p className="text-sm">Choose a conversation to start messaging</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <NewChatModal
                isOpen={showNewChatModal}
                onClose={() => setShowNewChatModal(false)}
                onChatCreated={handleNewChatCreated}
            />
        </ProtectedRoute>
    );
}
