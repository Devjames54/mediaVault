import React, { useState, useEffect } from 'react';
import { useMedia } from '../context/MediaContext';

export function AdBanner() {
  const { media } = useMedia();
  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  const ads = media.filter(item => item.category === 'ad');

  useEffect(() => {
    if (ads.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, 10000); // Rotate every 10 seconds

    return () => clearInterval(interval);
  }, [ads.length]);

  if (ads.length === 0) {
    return null; // Don't show anything if there are no ads
  }

  const currentAd = ads[currentAdIndex];

  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 my-8 relative overflow-hidden group">
      <div className="absolute top-2 right-2 px-2 py-0.5 bg-zinc-950/80 backdrop-blur-sm rounded text-[10px] font-medium text-zinc-500 uppercase tracking-wider z-10">
        Advertisement
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="w-full sm:w-48 h-32 sm:h-24 bg-zinc-800 rounded-xl overflow-hidden flex-shrink-0">
          <img 
            src={currentAd.url} 
            alt={currentAd.title} 
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h4 className="text-lg font-bold text-zinc-100 mb-1">{currentAd.title}</h4>
          <p className="text-sm text-zinc-400 mb-3 sm:mb-0">
            {currentAd.thumbnailUrl ? 'Click to learn more about this offer.' : 'Special offer for our users.'}
          </p>
        </div>
        <div className="flex-shrink-0 w-full sm:w-auto">
          {currentAd.thumbnailUrl ? (
            <a 
              href={currentAd.thumbnailUrl} 
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors text-center shadow-lg shadow-indigo-500/20"
            >
              Learn More
            </a>
          ) : (
            <button 
              disabled
              className="inline-block w-full sm:w-auto px-6 py-2.5 bg-zinc-800 text-zinc-400 text-sm font-medium rounded-xl text-center cursor-not-allowed"
            >
              Learn More
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
