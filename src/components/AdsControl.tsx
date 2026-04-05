import React, { useState } from 'react';
import { useMedia } from '../context/MediaContext';
import { useModal } from '../context/ModalContext';
import { Trash2, Plus, ExternalLink, Edit2, X, Save } from 'lucide-react';

export function AdsControl() {
  const { media, addMedia, deleteMedia, updateMedia } = useMedia();
  const { showAlert, showConfirm } = useModal();
  
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [description, setDescription] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editLinkUrl, setEditLinkUrl] = useState('');

  // Filter only ads
  const ads = media.filter(item => item.category === 'ad');

  const handleAddAd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title && imageUrl) {
      try {
        await addMedia({
          title: title,
          type: 'image',
          url: imageUrl,
          thumbnailUrl: linkUrl, // We use thumbnailUrl to store the click link
          category: 'ad'
        });
        setTitle('');
        setImageUrl('');
        setLinkUrl('');
        setDescription('');
        showAlert({ type: 'success', message: 'Advertisement added successfully!' });
      } catch (error) {
        showAlert({ type: 'error', message: 'Failed to add advertisement. Please try again.' });
      }
    }
  };

  const startEditing = (ad: any) => {
    setEditingId(ad.id);
    setEditTitle(ad.title);
    setEditImageUrl(ad.url);
    setEditLinkUrl(ad.thumbnailUrl || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const handleSaveEdit = async (id: string) => {
    try {
      await updateMedia(id, {
        title: editTitle,
        url: editImageUrl,
        thumbnailUrl: editLinkUrl
      });
      
      showAlert({ type: 'success', message: 'Advertisement updated successfully!' });
      setEditingId(null);
    } catch (error) {
      console.error('Error updating ad:', error);
      showAlert({ type: 'error', message: 'Failed to update advertisement. Please try again.' });
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mt-8">
      <h2 className="text-xl font-semibold text-zinc-100 mb-6 flex items-center gap-2">
        <ExternalLink className="w-5 h-5 text-green-400" />
        Ads Control
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Ad Form */}
        <div className="lg:col-span-1">
          <form onSubmit={handleAddAd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Ad Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g. Premium Cloud Storage"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Ad Image URL</label>
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Target Link URL (Optional)</label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Where should the ad lead?"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-500 text-white font-medium py-3 rounded-xl transition-colors mt-6 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Advertisement
            </button>
          </form>
        </div>

        {/* Manage Ads List */}
        <div className="lg:col-span-2">
          {ads.length === 0 ? (
            <p className="text-zinc-500 text-center py-8 bg-zinc-950 rounded-xl border border-zinc-800">No ads running currently.</p>
          ) : (
            <div className="space-y-4">
              {ads.map((ad) => (
                <div key={ad.id} className="flex flex-col p-4 bg-zinc-950 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors">
                  {editingId === ad.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-green-500"
                        placeholder="Ad Title"
                      />
                      <input
                        type="url"
                        value={editImageUrl}
                        onChange={(e) => setEditImageUrl(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-green-500"
                        placeholder="Image URL"
                      />
                      <input
                        type="url"
                        value={editLinkUrl}
                        onChange={(e) => setEditLinkUrl(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-green-500"
                        placeholder="Target Link URL"
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={cancelEditing}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                        >
                          <X className="w-3 h-3" /> Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(ad.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-500 rounded-lg transition-colors"
                        >
                          <Save className="w-3 h-3" /> Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-24 h-16 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                          <img 
                            src={ad.url} 
                            alt={ad.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-zinc-100 font-medium truncate">{ad.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 capitalize border border-green-500/20">
                              Active Ad
                            </span>
                            {ad.thumbnailUrl && (
                              <a href={ad.thumbnailUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline truncate max-w-[200px]">
                                {ad.thumbnailUrl}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => startEditing(ad)}
                          className="p-2 text-zinc-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                          title="Edit Ad"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={async () => {
                            const confirmed = await showConfirm('Are you sure you want to delete this advertisement?');
                            if (confirmed) {
                              try {
                                await deleteMedia(ad.id);
                                showAlert({ type: 'success', message: 'Advertisement deleted successfully.' });
                              } catch (error) {
                                showAlert({ type: 'error', message: 'Failed to delete advertisement.' });
                              }
                            }
                          }}
                          className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          title="Delete Ad"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
