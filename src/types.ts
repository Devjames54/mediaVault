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

export interface SiteSettings {
  id: number;
  site_name: string;
  site_description: string;
  logo_url: string;
  favicon_url: string;
  categories: string[];
  contact_email?: string;
  contact_phone?: string;
  twitter_url?: string;
  instagram_url?: string;
}
