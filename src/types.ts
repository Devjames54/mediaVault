export type Role = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  role: Role;
}

export type MediaType = 'image' | 'video';

export interface MediaItem {
  id: string;
  title: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string; // Optional, useful for videos
  category?: string;
  createdAt: string;
}
