'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Conversation, Message, getConversations, getMessages, sendMessage } from '@/services/chatService';
import { formatDistanceToNow } from 'date-fns';

export default function FloatingChat() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const previousScrollHeightRef = useRef<number>(0);

    useEffect(() => {
        if (user && isOpen) {
            loadConversations();
        }
    }, [user, isOpen]);

    useEffect(() => {
        if (selectedConversation) {
            setPage(1);
            setHasMore(true);
            setMessages([]);
            loadMessages(selectedConversation._id, 1);
        }
    }, [selectedConversation]);

    useEffect(() => {
        if (messages.length > 0 && !loadingMore && page === 1) {
            scrollToBottom();
        }
    }, [messages]);

    useEffect(() => {
        const setupSocket = async () => {
            const { getSocket } = await import('@/lib/socket');
            const socket = getSocket();
            if (!socket) return;

            socket.on('message:new', (data: { conversationId: string; message: Message }) => {
                if (selectedConversation && data.conversationId === selectedConversation._id) {
                    setMessages(prev => {
                        const exists = prev.some(m => m._id === data.message._id);
                        if (exists) return prev;
                        return [...prev, data.message];
                    });
                }

                setConversations(prev => {
                    const updatedConvs = prev.map(conv => {
                        if (conv._id === data.conversationId) {
                            return { ...conv, lastMessage: data.message, updatedAt: new Date().toISOString() };
                        }
                        return conv;
                    });
                    return updatedConvs.sort((a, b) =>
                        new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
                    );
                });

                const unread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
                setUnreadCount(unread);
            });

            return () => socket.off('message:new');
        };
        setupSocket();
    }, [selectedConversation, conversations]);

    const loadConversations = async () => {
        try {
            const data = await getConversations();
            setConversations(data);
            const unread = data.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
            setUnreadCount(unread);
        } catch (error) {
            console.error('Failed to load conversations:', error);
        }
    };

    const loadMessages = async (conversationId: string, pageNum: number) => {
        try {
            setLoadingMore(true);
            const { messages: data, pagination } = await getMessages(conversationId, pageNum, 20);
            const sortedMessages = data.sort((a, b) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );

            if (pageNum === 1) {
                setMessages(sortedMessages);
            } else {
                setMessages(prev => [...sortedMessages, ...prev]);
            }

            setHasMore(pagination.page < pagination.pages);
            setPage(pageNum);
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !selectedConversation) return;

        try {
            const message = await sendMessage(selectedConversation._id, messageInput);
            setMessages(prev => [...prev, message]);
            setMessageInput('');

            const { emitSocketEvent } = await import('@/lib/socket');
            emitSocketEvent('message:send', {
                conversationId: selectedConversation._id,
                message
            });
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleScroll = () => {
        const container = messagesContainerRef.current;
        if (!container || loadingMore || !hasMore) return;

        if (container.scrollTop === 0 && selectedConversation) {
            previousScrollHeightRef.current = container.scrollHeight;
            loadMessages(selectedConversation._id, page + 1);
        }
    };

    useEffect(() => {
        if (loadingMore === false && page > 1 && messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - previousScrollHeightRef.current;
        }
    }, [loadingMore, page]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const getOtherParticipant = (conversation: Conversation) => {
        const participant = conversation.participants.find(p => {
            // Check if participant has nested user object
            const pUserId = (p as any).user?._id;
            if (pUserId) {
                return pUserId !== user?._id;
            }
            // Otherwise check direct _id
            return p._id !== user?._id;
        });

        // Return nested user object if exists, otherwise return participant directly
        return (participant as any)?.user || participant;
    };

    if (!user) return null;

    return (
        <>
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition flex items-center justify-center z-50"
                >
                    <MessageCircle className="w-6 h-6" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            )}

            {isOpen && (
                <div className={`fixed bottom-6 right-6 w-96 bg-white rounded-lg shadow-2xl z-50 flex flex-col ${isMinimized ? 'h-14' : 'h-[600px]'} transition-all`}>
                    <div className="p-4 bg-blue-600 text-white rounded-t-lg flex items-center justify-between">
                        <h3 className="font-semibold">
                            {selectedConversation
                                ? getOtherParticipant(selectedConversation)?.username || 'Messages'
                                : 'Messages'
                            }
                        </h3>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-blue-700 rounded">
                                <Minimize2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => { setIsOpen(false); setSelectedConversation(null); }} className="p-1 hover:bg-blue-700 rounded">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>
                            {!selectedConversation ? (
                                <div className="flex-1 overflow-y-auto">
                                    {conversations.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500 text-sm">No conversations yet</div>
                                    ) : (
                                        conversations.map((conversation) => {
                                            const other = getOtherParticipant(conversation);
                                            return (
                                                <div key={conversation._id} onClick={() => setSelectedConversation(conversation)} className="p-3 border-b cursor-pointer hover:bg-gray-50 transition">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <span className="text-white font-bold text-sm">{other?.username?.charAt(0).toUpperCase()}</span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-semibold text-sm truncate">{other?.username}</h4>
                                                            {conversation.lastMessage && (
                                                                <p className="text-xs text-gray-600 truncate">{conversation.lastMessage.content}</p>
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
                            ) : (
                                <>
                                    <div className="p-3 border-b flex items-center gap-2">
                                        <button onClick={() => setSelectedConversation(null)} className="text-blue-600 hover:text-blue-700">←</button>
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                            <span className="text-white font-bold text-sm">
                                                {getOtherParticipant(selectedConversation)?.username?.charAt(0).toUpperCase() || '?'}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-sm">
                                                {getOtherParticipant(selectedConversation)?.username || 'User'}
                                            </h4>
                                        </div>
                                    </div>

                                    <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-3 space-y-2">
                                        {loadingMore && page > 1 && (
                                            <div className="text-center py-2">
                                                <span className="text-xs text-gray-500">Loading...</span>
                                            </div>
                                        )}
                                        {messages.map((message, index) => {
                                            const isOwn = message.sender._id === user?._id;
                                            const senderName = message.sender?.username || 'Unknown User';
                                            return (
                                                <div key={`${message._id}-${index}`} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                                                        <div className={`px-3 py-2 rounded-2xl text-sm ${isOwn ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                                            {!isOwn && <p className="text-xs font-semibold mb-1 text-blue-600">{senderName}</p>}
                                                            {message.content}
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

                                    <form onSubmit={handleSendMessage} className="p-3 border-t">
                                        <div className="flex items-center gap-2">
                                            <input type="text" value={messageInput} onChange={(e) => setMessageInput(e.target.value)} placeholder="Type a message..." className="flex-1 px-3 py-2 text-sm border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                            <button type="submit" disabled={!messageInput.trim()} className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50">
                                                <Send className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}
                        </>
                    )}
                </div>
            )}
        </>
    );
}
