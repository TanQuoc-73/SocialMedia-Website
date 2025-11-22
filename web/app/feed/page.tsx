'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/layouts/Navbar';
import Sidebar from '@/components/layouts/Sidebar';
import CreatePost from '@/components/posts/CreatePost';
import PostList from '@/components/posts/PostList';

export default function FeedPage() {
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-100">
                <Navbar />

                <div className="max-w-7xl mx-auto pt-16">
                    <div className="flex gap-4 p-4">
                        {/* Left Sidebar */}
                        <Sidebar />

                        {/* Main Feed */}
                        <main className="flex-1 max-w-2xl">
                            <CreatePost />
                            <PostList />
                        </main>

                        {/* Right Sidebar - Contacts/Suggestions */}
                        <aside className="hidden xl:block w-80">
                            <div className="sticky top-20 bg-white rounded-lg shadow p-4">
                                <h3 className="font-semibold text-gray-700 mb-4">Contacts</h3>
                                <p className="text-sm text-gray-500">Coming soon...</p>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
