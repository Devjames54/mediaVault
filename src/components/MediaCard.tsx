import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MediaItem } from '../types';
import { getFixedUrl } from '../lib/supabase';

export const MediaCard: React.FC<{ item: MediaItem }> = ({ item }) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const displayUrl = item.type === 'video' ? (item.thumbnailUrl ? getFixedUrl(item.thumbnailUrl) : 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=800&q=80') : getFixedUrl(item.url);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // First click ad logic
    const hasClickedAd = sessionStorage.getItem('hasClickedAd');
    if (!hasClickedAd) {
      sessionStorage.setItem('hasClickedAd', 'true');
      window.open('https://www.profitablecpmratenetwork.com/a28v6vs8kz?key=3b03c444eff3c42df665f815e2cc24f2', '_blank');
      return; // Stop navigation on first click
    }

    // Second click (or subsequent) navigates to media
    navigate(`/media/${item.id}`);
  };

  const handleMouseEnter = () => {
    if (item.type === 'video' && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Ignore auto-play errors
      });
    }
  };

  const handleMouseLeave = () => {
    if (item.type === 'video' && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0; // Reset to start
    }
  };

  return (
    <a 
      href={`/media/${item.id}`}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative block rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700/50 hover:border-indigo-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer"
    >
      <div className="aspect-video relative overflow-hidden bg-black">
        {item.type === 'video' ? (
          <video 
            ref={videoRef}
            src={getFixedUrl(item.url)}
            poster={item.thumbnailUrl ? getFixedUrl(item.thumbnailUrl) : undefined}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            muted
            loop
            playsInline
            preload="none"
          />
        ) : (
          <img 
            src={displayUrl} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        )}
      </div>
      
      <div className="p-4 bg-zinc-950/20">
        <h3 className="text-white text-sm font-medium truncate group-hover:text-indigo-400 transition-colors">{item.title}</h3>
        {item.category && (
          <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-md text-[10px] font-medium text-indigo-300 uppercase tracking-wider">
            {item.category}
          </span>
        )}
      </div>
    </a>
  );
}
