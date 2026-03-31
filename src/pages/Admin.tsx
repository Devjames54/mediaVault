import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMedia } from '../context/MediaContext';
import { useDeletionRequests } from '../context/DeletionRequestContext';
import { Trash2, Plus, Image as ImageIcon, Film, CheckSquare, Square, Tag, AlertTriangle, CheckCircle } from 'lucide-react';
import { MediaType } from '../types';
import { AdsControl } from '../components/AdsControl';
import { CATEGORIES } from '../constants';

export function Admin() {
  const { user } = useAuth();
  const { media, addMedia, deleteMedia, bulkDeleteMedia, bulkUpdateCategory } = useMedia();
  const { requests, resolveRequest, deleteRequest } = useDeletionRequests();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<MediaType>('image');
  const [url, setUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [category, setCategory] = useState('');

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkCategory, setBulkCategory] = useState('');

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
    if (window.confirm(`Are you sure you want to delete ${selectedItems.size} items?`)) {
      try {
        await bulkDeleteMedia(Array.from(selectedItems));
        setSelectedItems(new Set());
      } catch (error) {
        alert('Failed to delete selected items');
      }
    }
  };

  const handleBulkCategoryUpdate = async () => {
    if (selectedItems.size === 0) return;
    try {
      await bulkUpdateCategory(Array.from(selectedItems), bulkCategory);
      setSelectedItems(new Set());
      setBulkCategory('');
      alert('Categories updated successfully!');
    } catch (error) {
      alert('Failed to update categories');
    }
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

  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title && url) {
      try {
        await addMedia({
          title,
          type,
          url,
          category: category.trim() || undefined,
          ...(type === 'video' && thumbnailUrl ? { thumbnailUrl } : {})
        });
        setTitle('');
        setUrl('');
        setThumbnailUrl('');
        setCategory('');
        alert('Media added successfully!');
      } catch (error) {
        alert('Failed to add media');
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-zinc-100 mb-8">Admin Dashboard</h1>

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
                          if (window.confirm('Are you sure you want to delete this media?')) {
                            try {
                              await deleteMedia(targetMedia.id);
                              resolveRequest(request.id);
                            } catch (e) {
                              alert('Failed to delete media');
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
              <Plus className="w-5 h-5 text-indigo-400" />
              Add New Media
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
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Category (Optional)</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a category...</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Media URL</label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="https://..."
                />
              </div>

              {type === 'video' && (
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Thumbnail URL (Optional)</label>
                  <input
                    type="url"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="https://..."
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-colors mt-6"
              >
                Upload Media
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
                      {CATEGORIES.map(cat => (
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
                          src={item.type === 'video' ? (item.thumbnailUrl || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=200&q=80') : item.url} 
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
                          <span className="text-xs text-zinc-500">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this media?')) {
                          try {
                            await deleteMedia(item.id);
                          } catch (error) {
                            alert('Failed to delete media');
                          }
                        }
                      }}
                      className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors ml-4 flex-shrink-0"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AdsControl />
    </div>
  );
}
