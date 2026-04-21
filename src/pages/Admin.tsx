import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMedia } from '../context/MediaContext';
import { useDeletionRequests } from '../context/DeletionRequestContext';
import { useSettings } from '../context/SettingsContext';
import { useModal } from '../context/ModalContext';
import { Trash2, Plus, Image as ImageIcon, Film, CheckSquare, Square, Tag, AlertTriangle, CheckCircle, Settings, Upload, X, Edit } from 'lucide-react';
import { MediaType, MediaItem } from '../types';
import { supabase, getFixedUrl } from '../lib/supabase';

export function Admin() {
  const { user } = useAuth();
  const { media, addMedia, updateMedia, deleteMedia, bulkDeleteMedia, bulkUpdateCategory } = useMedia();
  const { requests, resolveRequest } = useDeletionRequests();
  const { settings, updateSettings, setupRequired } = useSettings();
  const { showAlert, showConfirm } = useModal();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'media' | 'settings'>('media');

  // Media Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState<MediaType>('image');
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [thumbnailUrlInput, setThumbnailUrlInput] = useState('');
  const [category, setCategory] = useState('');
  const [mediaSeoTitle, setMediaSeoTitle] = useState('');
  const [mediaSeoDesc, setMediaSeoDesc] = useState('');
  const [mediaSeoKeywords, setMediaSeoKeywords] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);

  // Bulk Actions State
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkCategory, setBulkCategory] = useState('');

  // Settings State
  const [siteName, setSiteName] = useState(settings.site_name);
  const [siteDesc, setSiteDesc] = useState(settings.site_description);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [faviconUrlInput, setFaviconUrlInput] = useState('');
  const [categories, setCategories] = useState<string[]>(settings.categories);
  const [newCategory, setNewCategory] = useState('');
  const [contactEmail, setContactEmail] = useState(settings.contact_email || '');
  const [contactPhone, setContactPhone] = useState(settings.contact_phone || '');
  const [twitterUrl, setTwitterUrl] = useState(settings.twitter_url || '');
  const [telegramUrl, setTelegramUrl] = useState(settings.telegram_url || '');
  const [globalSeoTitle, setGlobalSeoTitle] = useState(settings.seo_title || '');
  const [globalSeoDesc, setGlobalSeoDesc] = useState(settings.seo_description || '');
  const [globalSeoKeywords, setGlobalSeoKeywords] = useState(settings.seo_keywords || '');
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    setSiteName(settings.site_name);
    setSiteDesc(settings.site_description);
    setCategories(settings.categories);
    setContactEmail(settings.contact_email || '');
    setContactPhone(settings.contact_phone || '');
    setTwitterUrl(settings.twitter_url || '');
    setTelegramUrl(settings.telegram_url || '');
    setGlobalSeoTitle(settings.seo_title || '');
    setGlobalSeoDesc(settings.seo_description || '');
    setGlobalSeoKeywords(settings.seo_keywords || '');
  }, [settings]);

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };

  const selectAll = () => {
    const nonAdMedia = media.filter(m => m.category !== 'ad');
    if (selectedItems.size === nonAdMedia.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(nonAdMedia.map(m => m.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    const confirmed = await showConfirm(`Are you sure you want to delete ${selectedItems.size} items?`);
    if (confirmed) {
      try {
        await bulkDeleteMedia(Array.from(selectedItems));
        setSelectedItems(new Set());
        showAlert({ type: 'success', message: 'Items deleted successfully.' });
      } catch (error) {
        showAlert({ type: 'error', message: 'Failed to delete selected items.' });
      }
    }
  };

  const handleBulkCategoryUpdate = async () => {
    if (selectedItems.size === 0) return;
    try {
      await bulkUpdateCategory(Array.from(selectedItems), bulkCategory);
      setSelectedItems(new Set());
      setBulkCategory('');
      showAlert({ type: 'success', message: 'Categories updated successfully!' });
    } catch (error) {
      showAlert({ type: 'error', message: 'Failed to update categories.' });
    }
  };

  const uploadToSupabase = async (uploadFile: File, path: string) => {
    const fileExt = uploadFile.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;
    
    const { error: uploadError } = await supabase.storage.from('media').upload(filePath, uploadFile);
    if (uploadError) throw uploadError;
    
    const { data } = supabase.storage.from('media').getPublicUrl(filePath);
    return getFixedUrl(data.publicUrl);
  };

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      showAlert({ type: 'error', message: 'Title is required' });
      return;
    }
    if (uploadMethod === 'file' && !file) {
      showAlert({ type: 'error', message: 'File is required' });
      return;
    }
    if (uploadMethod === 'url' && !mediaUrlInput) {
      showAlert({ type: 'error', message: 'Media URL is required' });
      return;
    }
    
    setIsUploading(true);
    try {
      let mediaUrl = mediaUrlInput;
      let thumbUrl = thumbnailUrlInput;

      if (uploadMethod === 'file') {
        mediaUrl = await uploadToSupabase(file!, type === 'video' ? 'videos' : 'images');
        if (type === 'video' && thumbnailFile) {
          thumbUrl = await uploadToSupabase(thumbnailFile, 'thumbnails');
        }
      }

      await addMedia({
        title,
        type,
        url: mediaUrl,
        category: category.trim() || undefined,
        seoTitle: mediaSeoTitle.trim() || undefined,
        seoDescription: mediaSeoDesc.trim() || undefined,
        seoKeywords: mediaSeoKeywords.trim() || undefined,
        ...(type === 'video' && thumbUrl ? { thumbnailUrl: thumbUrl } : {})
      });
      
      setTitle('');
      setFile(null);
      setThumbnailFile(null);
      setMediaUrlInput('');
      setThumbnailUrlInput('');
      setCategory('');
      setMediaSeoTitle('');
      setMediaSeoDesc('');
      setMediaSeoKeywords('');
      showAlert({ type: 'success', message: 'Media added successfully!' });
    } catch (error: any) {
      console.error(error);
      let errorMsg = error.message;
      if (errorMsg.includes('403') || errorMsg.includes('Forbidden') || errorMsg.includes('<html>')) {
        errorMsg = "Storage permission denied. Please ensure your Supabase storage bucket is set to public and you have the correct permissions.";
      }
      showAlert({ type: 'error', message: `Failed to add media: ${errorMsg}` });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      let logo_url = logoUrlInput || settings.logo_url;
      let favicon_url = faviconUrlInput || settings.favicon_url;

      if (logoFile) {
        logo_url = await uploadToSupabase(logoFile, 'site');
      }
      if (faviconFile) {
        favicon_url = await uploadToSupabase(faviconFile, 'site');
      }

      await updateSettings({
        site_name: siteName,
        site_description: siteDesc,
        logo_url,
        favicon_url,
        categories,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        twitter_url: twitterUrl,
        telegram_url: telegramUrl,
        seo_title: globalSeoTitle,
        seo_description: globalSeoDesc,
        seo_keywords: globalSeoKeywords
      });
      
      setLogoFile(null);
      setFaviconFile(null);
      setLogoUrlInput('');
      setFaviconUrlInput('');
      showAlert({ type: 'success', message: 'Settings saved successfully!' });
    } catch (error: any) {
      console.error(error);
      let errorMsg = error.message || 'Unknown error occurred';
      
      // Only show storage error if it was actually a storage operation that failed
      if ((logoFile || faviconFile) && (errorMsg.includes('403') || errorMsg.includes('Forbidden') || errorMsg.includes('<html>'))) {
        errorMsg = "Storage permission denied. Please ensure your Supabase storage bucket is set to public and you have the correct permissions.";
      } else if (errorMsg.includes('row-level security') || errorMsg.includes('RLS')) {
        errorMsg = "Database permission denied. Please run the SQL setup script to configure RLS policies for the settings table.";
      }
      
      showAlert({ type: 'error', message: `Failed to save settings: ${errorMsg}` });
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (catToRemove: string) => {
    setCategories(categories.filter(c => c !== catToRemove));
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');

  // Protect route
  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h2>
        <p className="text-zinc-400 mb-6">You do not have permission to view this page.</p>
        <button onClick={() => navigate('/')} className="text-indigo-400 hover:text-indigo-300">
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-zinc-100">Admin Dashboard</h1>
        <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
          <button
            onClick={() => setActiveTab('media')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'media' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Media Management
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            <Settings className="w-4 h-4" />
            Site Settings
          </button>
        </div>
      </div>

      {setupRequired && (
        <div className="mb-8 bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Database Setup Required
          </h2>
          <p className="text-zinc-300 mb-4">
            To use the settings and storage features, you need to run the following SQL in your Supabase SQL Editor:
          </p>
          <pre className="bg-zinc-950 p-4 rounded-xl text-sm text-zinc-400 overflow-x-auto whitespace-pre-wrap">
{`-- Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY DEFAULT 1,
  site_name TEXT,
  site_description TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  categories JSONB,
  contact_email TEXT,
  contact_phone TEXT,
  twitter_url TEXT,
  telegram_url TEXT
);

-- Update media table to include duration column
ALTER TABLE media ADD COLUMN IF NOT EXISTS duration TEXT;

-- SEO Additions
ALTER TABLE settings ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS seo_keywords TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS seo_keywords TEXT;


-- Enable RLS and add policies for settings table
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to update settings" ON settings FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated users to insert settings" ON settings FOR INSERT TO authenticated WITH CHECK (true);

INSERT INTO settings (id, site_name, site_description, categories, contact_email, contact_phone) 
VALUES (1, 'BestNigthVideos&Pics', 'A lightweight media app', '["Nature", "Gaming", "Music"]', 'support@example.com', '+1 (555) 123-4567') 
ON CONFLICT DO NOTHING;

-- Create media bucket
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict do nothing;
create policy "Public Access" on storage.objects for select using ( bucket_id = 'media' );
create policy "Auth Insert" on storage.objects for insert with check ( bucket_id = 'media' and auth.role() = 'authenticated' );
create policy "Auth Update" on storage.objects for update with check ( bucket_id = 'media' and auth.role() = 'authenticated' );
create policy "Auth Delete" on storage.objects for delete using ( bucket_id = 'media' and auth.role() = 'authenticated' );`}
          </pre>
        </div>
      )}

      {activeTab === 'settings' ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-zinc-100 mb-6">Site Settings</h2>
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Site Name</label>
                <input
                  type="text"
                  required
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Site Description</label>
                <input
                  type="text"
                  required
                  value={siteDesc}
                  onChange={(e) => setSiteDesc(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="support@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Contact Phone</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Twitter URL</label>
                <input
                  type="url"
                  value={twitterUrl}
                  onChange={(e) => setTwitterUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Telegram URL</label>
                <input
                  type="url"
                  value={telegramUrl}
                  onChange={(e) => setTelegramUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://t.me/yourchannel"
                />
              </div>
              
              <div className="md:col-span-2 pt-6 border-t border-zinc-800">
                <h3 className="text-lg font-medium text-zinc-100 mb-4">Global Search Engine Optimization (SEO)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">SEO Meta Title</label>
                    <input
                      type="text"
                      value={globalSeoTitle}
                      onChange={(e) => setGlobalSeoTitle(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="BestNigthVideos&Pics - Best Quality Media"
                    />
                    <p className="mt-1 text-xs text-zinc-500">Defaults to Site Name if left empty.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">SEO Meta Keywords</label>
                    <input
                      type="text"
                      value={globalSeoKeywords}
                      onChange={(e) => setGlobalSeoKeywords(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="media, videos, pictures, download"
                    />
                    <p className="mt-1 text-xs text-zinc-500">Comma-separated list of keywords.</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">SEO Meta Description</label>
                    <textarea
                      value={globalSeoDesc}
                      onChange={(e) => setGlobalSeoDesc(e.target.value)}
                      rows={2}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      placeholder="A lightweight media app for downloading, viewing images and videos."
                    />
                    <p className="mt-1 text-xs text-zinc-500">Defaults to Site Description if left empty.</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Site Logo</label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setLogoFile(e.target.files?.[0] || null);
                      setLogoUrlInput('');
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                  />
                  <div className="flex items-center gap-2 text-zinc-500 text-sm">
                    <span className="flex-1 h-px bg-zinc-800"></span>
                    OR PASTE URL
                    <span className="flex-1 h-px bg-zinc-800"></span>
                  </div>
                  <input
                    type="url"
                    value={logoUrlInput}
                    onChange={(e) => {
                      setLogoUrlInput(e.target.value);
                      setLogoFile(null);
                    }}
                    placeholder="https://example.com/logo.png"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {settings.logo_url && !logoFile && !logoUrlInput && (
                  <div className="mt-2 text-sm text-zinc-500 flex items-center gap-2">
                    Current: <img src={getFixedUrl(settings.logo_url)} alt="Logo" className="h-6 w-auto" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Site Favicon</label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setFaviconFile(e.target.files?.[0] || null);
                      setFaviconUrlInput('');
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                  />
                  <div className="flex items-center gap-2 text-zinc-500 text-sm">
                    <span className="flex-1 h-px bg-zinc-800"></span>
                    OR PASTE URL
                    <span className="flex-1 h-px bg-zinc-800"></span>
                  </div>
                  <input
                    type="url"
                    value={faviconUrlInput}
                    onChange={(e) => {
                      setFaviconUrlInput(e.target.value);
                      setFaviconFile(null);
                    }}
                    placeholder="https://example.com/favicon.ico"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {settings.favicon_url && !faviconFile && !faviconUrlInput && (
                  <div className="mt-2 text-sm text-zinc-500 flex items-center gap-2">
                    Current: <img src={getFixedUrl(settings.favicon_url)} alt="Favicon" className="h-6 w-auto" />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-800">
              <label className="block text-sm font-medium text-zinc-300 mb-3">Manage Categories</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map(cat => (
                  <span key={cat} className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-sm">
                    {cat}
                    <button type="button" onClick={() => handleRemoveCategory(cat)} className="text-zinc-500 hover:text-red-400">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="New category name"
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-xl transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingSettings}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-medium py-3 rounded-xl transition-colors mt-6"
            >
              {isSavingSettings ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      ) : (
        <>
          {pendingRequests.length > 0 && (
            <div className="mb-8 bg-zinc-900 border border-red-500/20 rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Pending Deletion Requests ({pendingRequests.length})
              </h2>
              <div className="space-y-4">
                {pendingRequests.map(request => {
                  const targetMedia = media.find(m => m.id === request.mediaId);
                  return (
                    <div key={request.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-zinc-300">Target Media:</span>
                          {targetMedia ? (
                            <span className="text-sm text-indigo-400 font-medium">{targetMedia.title}</span>
                          ) : (
                            <span className="text-sm text-zinc-500 italic">Media already deleted</span>
                          )}
                        </div>
                        <p className="text-zinc-400 text-sm">
                          <span className="text-zinc-300 font-medium">Reason:</span> {request.reason}
                        </p>
                        <p className="text-zinc-600 text-xs mt-2">
                          Requested on {new Date(request.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        {targetMedia && (
                          <button
                            onClick={async () => {
                              const confirmed = await showConfirm('Are you sure you want to delete this media?');
                              if (confirmed) {
                                try {
                                  await deleteMedia(targetMedia.id);
                                  resolveRequest(request.id);
                                  showAlert({ type: 'success', message: 'Media deleted successfully.' });
                                } catch (e) {
                                  showAlert({ type: 'error', message: 'Failed to delete media.' });
                                }
                              }
                            }}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors text-sm font-medium"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Media
                          </button>
                        )}
                        <button
                          onClick={() => resolveRequest(request.id)}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 rounded-lg transition-colors text-sm font-medium"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Dismiss
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add Media Form */}
            <div className="lg:col-span-1">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-zinc-100 mb-6 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-indigo-400" />
                  Upload New Media
                </h2>
                
                <form onSubmit={handleAddMedia} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. Sunset at the beach"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setType('image')}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-colors ${type === 'image' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                      >
                        <ImageIcon className="w-4 h-4" /> Image
                      </button>
                      <button
                        type="button"
                        onClick={() => setType('video')}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-colors ${type === 'video' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                      >
                        <Film className="w-4 h-4" /> Video
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Upload Method</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setUploadMethod('file')}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-colors ${uploadMethod === 'file' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                      >
                        Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadMethod('url')}
                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-colors ${uploadMethod === 'url' ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}
                      >
                        Paste URL
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">Category (Optional)</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select a category...</option>
                      {settings.categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {uploadMethod === 'file' ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Media File</label>
                        <input
                          type="file"
                          required
                          accept={type === 'image' ? 'image/*' : 'video/*'}
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                        />
                      </div>

                      {type === 'video' && (
                        <div>
                          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Thumbnail File (Optional)</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1.5">Media URL</label>
                        <input
                          type="url"
                          required
                          value={mediaUrlInput}
                          onChange={(e) => setMediaUrlInput(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="https://example.com/image.jpg"
                        />
                        <p className="text-xs text-zinc-500 mt-1">Paste a direct link to the image or video (e.g., from Google Drive, Cloudinary, Imgur).</p>
                      </div>

                      {type === 'video' && (
                        <div>
                          <label className="block text-sm font-medium text-zinc-300 mb-1.5">Thumbnail URL (Optional)</label>
                          <input
                            type="url"
                            value={thumbnailUrlInput}
                            onChange={(e) => setThumbnailUrlInput(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="https://example.com/thumbnail.jpg"
                          />
                        </div>
                      )}
                    </>
                  )}

                  <div className="pt-4 border-t border-zinc-800/50 space-y-4">
                    <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">SEO Details (Optional)</h3>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1.5">SEO Meta Title</label>
                      <input
                        type="text"
                        value={mediaSeoTitle}
                        onChange={(e) => setMediaSeoTitle(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Optimized generic title for search engines"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1.5">SEO Meta Keywords</label>
                      <input
                        type="text"
                        value={mediaSeoKeywords}
                        onChange={(e) => setMediaSeoKeywords(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="funny video, epic fails, highlight"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-1.5">SEO Meta Description</label>
                      <textarea
                        value={mediaSeoDesc}
                        onChange={(e) => setMediaSeoDesc(e.target.value)}
                        rows={2}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        placeholder="Detailed description about the media..."
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUploading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-medium py-3 rounded-xl transition-colors mt-6"
                  >
                    {isUploading ? 'Uploading...' : 'Upload Media'}
                  </button>
                </form>
              </div>
            </div>

            {/* Manage Media List */}
            <div className="lg:col-span-2">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <h2 className="text-xl font-semibold text-zinc-100">Manage Media</h2>
                  
                  {selectedItems.size > 0 && (
                    <div className="flex items-center gap-3 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-xl">
                      <span className="text-sm font-medium text-indigo-400">{selectedItems.size} selected</span>
                      
                      <div className="h-4 w-px bg-indigo-500/20 mx-1" />
                      
                      <div className="flex items-center gap-2">
                        <select
                          value={bulkCategory}
                          onChange={(e) => setBulkCategory(e.target.value)}
                          className="bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">No Category</option>
                          {settings.categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <button
                          onClick={handleBulkCategoryUpdate}
                          className="p-1.5 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-colors"
                          title="Apply Category"
                        >
                          <Tag className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="h-4 w-px bg-indigo-500/20 mx-1" />
                      
                      <button
                        onClick={handleBulkDelete}
                        className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Delete Selected"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                {media.filter(m => m.category !== 'ad').length === 0 ? (
                  <p className="text-zinc-500 text-center py-8">No media uploaded yet.</p>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 px-4 py-2 border-b border-zinc-800">
                      <button onClick={selectAll} className="text-zinc-400 hover:text-zinc-300">
                        {selectedItems.size === media.filter(m => m.category !== 'ad').length ? (
                          <CheckSquare className="w-5 h-5 text-indigo-400" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                      <span className="text-sm font-medium text-zinc-400">Select All</span>
                    </div>
                    {media.filter(m => m.category !== 'ad').map((item) => (
                      <div 
                        key={item.id} 
                        className={`flex items-center justify-between p-4 bg-zinc-950 border rounded-xl transition-colors cursor-pointer ${selectedItems.has(item.id) ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-zinc-800 hover:border-zinc-700'}`}
                        onClick={() => toggleSelection(item.id)}
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <button 
                            className="text-zinc-400 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelection(item.id);
                            }}
                          >
                            {selectedItems.has(item.id) ? (
                              <CheckSquare className="w-5 h-5 text-indigo-400" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                            <img 
                              src={item.type === 'video' ? (item.thumbnailUrl ? getFixedUrl(item.thumbnailUrl) : 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=200&q=80') : getFixedUrl(item.url)} 
                              alt={item.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-zinc-100 font-medium truncate">{item.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 capitalize">
                                {item.type}
                              </span>
                              {item.category && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 capitalize border border-indigo-500/20">
                                  {item.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingMedia(item);
                            }}
                            className="p-2 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors flex-shrink-0"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              const confirmed = await showConfirm('Are you sure you want to delete this media?');
                              if (confirmed) {
                                try {
                                  await deleteMedia(item.id);
                                  showAlert({ type: 'success', message: 'Media deleted successfully.' });
                                } catch (error) {
                                  showAlert({ type: 'error', message: 'Failed to delete media.' });
                                }
                              }
                            }}
                            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors flex-shrink-0"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {editingMedia && (
            <EditMediaModal 
              item={editingMedia}
              categories={settings.categories}
              onClose={() => setEditingMedia(null)}
              onSave={async (updates) => {
                try {
                  await updateMedia(editingMedia.id, updates);
                  showAlert({ type: 'success', message: 'Media updated successfully!' });
                  setEditingMedia(null);
                } catch (error) {
                  showAlert({ type: 'error', message: 'Failed to update media.' });
                }
              }}
            />
          )}
        </>
      )}
    </div>
  );
}

function EditMediaModal({ 
  item, 
  categories, 
  onClose, 
  onSave 
}: { 
  item: MediaItem; 
  categories: string[]; 
  onClose: () => void; 
  onSave: (updates: Partial<MediaItem>) => Promise<void>;
}) {
  const [title, setTitle] = useState(item.title);
  const [category, setCategory] = useState(item.category || '');
  const [seoTitle, setSeoTitle] = useState(item.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(item.seoDescription || '');
  const [seoKeywords, setSeoKeywords] = useState(item.seoKeywords || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setIsSaving(true);
    await onSave({
      title: title.trim(),
      category: category.trim() || undefined,
      seoTitle: seoTitle.trim() || undefined,
      seoDescription: seoDescription.trim() || undefined,
      seoKeywords: seoKeywords.trim() || undefined
    });
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-zinc-100">Edit Media Details</h2>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1.5">Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">No Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-zinc-800/50 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">SEO Overrides</h3>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">SEO Meta Title</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Optimized generic title for search engines"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">SEO Meta Keywords</label>
              <input
                type="text"
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="funny video, epic fails, highlight"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">SEO Meta Description</label>
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={3}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Detailed description about the media..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-zinc-800/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-medium px-6 py-2 rounded-xl transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
