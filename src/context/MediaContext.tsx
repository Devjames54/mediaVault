import React, { createContext, useContext, useState, useEffect } from 'react';
import { MediaItem } from '../types';
import { supabase } from '../lib/supabase';

interface MediaContextType {
  media: MediaItem[];
  addMedia: (item: Omit<MediaItem, 'id' | 'createdAt'>) => Promise<void>;
  deleteMedia: (id: string) => Promise<void>;
  updateMedia: (id: string, updates: Partial<MediaItem>) => Promise<void>;
  bulkDeleteMedia: (ids: string[]) => Promise<void>;
  bulkUpdateCategory: (ids: string[], category: string) => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export function MediaProvider({ children }: { children: React.ReactNode }) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching media:', error);
      return;
    }

    if (data) {
      setMedia(data.map(item => ({
        id: item.id,
        title: item.title,
        type: item.type,
        url: item.url,
        thumbnailUrl: item.thumbnail_url,
        category: item.category,
        seoTitle: item.seo_title,
        seoDescription: item.seo_description,
        seoKeywords: item.seo_keywords,
        createdAt: item.created_at
      })));
    }
  };

  const addMedia = async (item: Omit<MediaItem, 'id' | 'createdAt'>) => {
    const { data, error } = await supabase
      .from('media')
      .insert([{
        title: item.title,
        type: item.type,
        url: item.url,
        thumbnail_url: item.thumbnailUrl,
        category: item.category,
        seo_title: item.seoTitle,
        seo_description: item.seoDescription,
        seo_keywords: item.seoKeywords
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding media:', error);
      throw error;
    }

    if (data) {
      const newItem: MediaItem = {
        id: data.id,
        title: data.title,
        type: data.type,
        url: data.url,
        thumbnailUrl: data.thumbnail_url,
        category: data.category,
        seoTitle: data.seo_title,
        seoDescription: data.seo_description,
        seoKeywords: data.seo_keywords,
        createdAt: data.created_at
      };
      setMedia([newItem, ...media]);
    }
  };

  const deleteMedia = async (id: string) => {
    const { error } = await supabase
      .from('media')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting media:', error);
      throw error;
    }

    setMedia(media.filter(m => m.id !== id));
  };

  const updateMedia = async (id: string, updates: Partial<MediaItem>) => {
    const { error } = await supabase
      .from('media')
      .update({
        title: updates.title,
        url: updates.url,
        thumbnail_url: updates.thumbnailUrl,
        category: updates.category,
        seo_title: updates.seoTitle,
        seo_description: updates.seoDescription,
        seo_keywords: updates.seoKeywords
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating media:', error);
      throw error;
    }

    setMedia(media.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const bulkDeleteMedia = async (ids: string[]) => {
    const { error } = await supabase
      .from('media')
      .delete()
      .in('id', ids);

    if (error) {
      console.error('Error bulk deleting media:', error);
      throw error;
    }

    setMedia(media.filter(m => !ids.includes(m.id)));
  };

  const bulkUpdateCategory = async (ids: string[], category: string) => {
    const { error } = await supabase
      .from('media')
      .update({ category: category || null })
      .in('id', ids);

    if (error) {
      console.error('Error bulk updating category:', error);
      throw error;
    }

    setMedia(media.map(m => ids.includes(m.id) ? { ...m, category: category || undefined } : m));
  };

  return (
    <MediaContext.Provider value={{
      media, addMedia, deleteMedia, updateMedia,
      bulkDeleteMedia, bulkUpdateCategory,
      searchQuery, setSearchQuery,
      typeFilter, setTypeFilter,
      categoryFilter, setCategoryFilter
    }}>
      {children}
    </MediaContext.Provider>
  );
}

export function useMedia() {
  const context = useContext(MediaContext);
  if (context === undefined) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return context;
}
