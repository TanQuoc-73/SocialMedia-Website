import { User } from './user';

// Post types
export interface Post {
  _id: string;
  author: User;
  content: string;
  media?: MediaItem[];
  likes: string[];
  likesCount: number;
  commentsCount: number;
  privacy: 'public' | 'friends' | 'private';
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MediaItem {
  url: string;
  type: 'image' | 'video';
  publicId?: string;
}

export interface CreatePostData {
  content: string;
  media?: MediaItem[];
  privacy?: 'public' | 'friends' | 'private';
  tags?: string[];
}

export interface UpdatePostData {
  content?: string;
  media?: MediaItem[];
  privacy?: 'public' | 'friends' | 'private';
  tags?: string[];
}

// Comment types
export interface Comment {
  _id: string;
  post: string;
  author: User;
  content: string;
  parentComment?: string;
  likes: string[];
  likesCount: number;
  repliesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentData {
  postId: string;
  content: string;
  parentComment?: string;
}