import React from 'react';
import { Link } from 'react-router-dom';
import { MediaItem } from '../types';
import { Play, Image as ImageIcon } from 'lucide-react';

export const MediaCard: React.FC<{ item: MediaItem }> = ({ item }) => {
  const displayUrl = item.type === 'video' ? (item.thumbnailUrl || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80') : item.url;

  return (
    <Link to={`/media/${item.id}`} className="group relative block aspect-video rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700/50 hover:border-indigo-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10">
      <img 
        src={displayUrl} 
        alt={item.title} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
        <div className="min-w-0 pr-4">
          <h3 className="text-white font-medium truncate drop-shadow-md">{item.title}</h3>
          {item.category && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-zinc-900/60 backdrop-blur-md border border-zinc-700/50 rounded-md text-[10px] font-medium text-zinc-300 uppercase tracking-wider">
              {item.category}
            </span>
          )}
        </div>
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
          {item.type === 'video' ? <Play className="w-4 h-4 ml-0.5" /> : <ImageIcon className="w-4 h-4" />}
        </div>
      </div>
    </Link>
  );
}
