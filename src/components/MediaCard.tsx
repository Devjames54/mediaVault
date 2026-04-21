import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MediaItem } from '../types';
import { getFixedUrl } from '../lib/supabase';
import { MoreVertical } from 'lucide-react';

export const MediaCard: React.FC<{ item: MediaItem }> = ({ item }) => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Format the date like in the screenshot (e.g., 4-10)
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return `${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
    } catch {
      return '';
    }
  };

  const displayUrl = item.type === 'video' 
    ? (item.thumbnailUrl ? getFixedUrl(item.thumbnailUrl) : `${getFixedUrl(item.url)}#t=0.5`) 
    : getFixedUrl(item.url);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // First click ad logic
    const hasClickedAd = sessionStorage.getItem('hasClickedAd');
    if (!hasClickedAd) {
      sessionStorage.setItem('hasClickedAd', 'true');
      window.open('https://www.profitablecpmratenetwork.com/a28v6vs8kz?key=3b03c444eff3c42df665f815e2cc24f2', '_blank');
      return; 
    }

    navigate(`/media/${item.id}`);
  };

  const handleMouseEnter = () => {
    if (item.type === 'video' && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (item.type === 'video' && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div className="group relative bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800/50 hover:border-indigo-500/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5">
      <a 
        href={`/media/${item.id}`}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="block"
      >
        <div className="aspect-video relative overflow-hidden bg-black">
          {item.type === 'video' ? (
            <>
              <video 
                ref={videoRef}
                src={displayUrl}
                poster={item.thumbnailUrl ? getFixedUrl(item.thumbnailUrl) : undefined}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                muted
                loop
                playsInline
                preload="metadata"
              />
              {/* Type Badge */}
              <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 backdrop-blur-md rounded text-[10px] font-bold text-white z-10 uppercase tracking-widest">
                {item.type}
              </div>
            </>
          ) : (
            <>
              <img 
                src={displayUrl} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              {/* Type Badge */}
              <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 backdrop-blur-md rounded text-[10px] font-bold text-white z-10 uppercase tracking-widest">
                {item.type}
              </div>
            </>
          )}
        </div>
      </a>
      
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-zinc-100 text-sm font-medium truncate leading-tight mb-1 group-hover:text-indigo-400 transition-colors">
              {item.title}
            </h3>
            <div className="flex items-center gap-2 text-zinc-500 text-[11px]">
              <span>{formatDate(item.createdAt)}</span>
              {item.category && (
                <>
                  <span>•</span>
                  <span className="truncate">{item.category}</span>
                </>
              )}
            </div>
          </div>
          <button className="text-zinc-500 hover:text-white p-1 -mr-1 transition-colors">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
