import React, { useMemo } from 'react';
import { useMedia } from '../context/MediaContext';
import { getFixedUrl } from '../lib/supabase';

type AdBannerProps = {
  startIndex?: number;
  count?: number;
};

export function AdBanner({ startIndex = 0, count = 3 }: AdBannerProps) {
  const { media } = useMedia();
  const ads = useMemo(() => media.filter(item => item.category === 'ad'), [media]);

  if (ads.length === 0) {
    return null;
  }

  const visibleAds = [...ads.slice(startIndex, startIndex + count)];
  if (visibleAds.length < count && ads.length > 0) {
    visibleAds.push(...ads.slice(0, Math.min(count - visibleAds.length, ads.length)));
  }

  if (visibleAds.length === 0) {
    return null;
  }

  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 my-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {visibleAds.map((ad) => {
          const card = (
            <div key={ad.id} className="h-full flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-lg shadow-black/10 transition-transform duration-200 hover:-translate-y-0.5">
              <div className="h-32 overflow-hidden bg-zinc-900">
                <img
                  src={getFixedUrl(ad.url)}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 p-3 flex flex-col justify-between gap-2">
                <div>
                  <h4 className="text-base font-semibold text-zinc-100 truncate">{ad.title}</h4>
                  <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                    Sponsored content from a partner brand.
                  </p>
                </div>
                <span className="inline-flex items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-zinc-400">
                  Sponsored
                </span>
              </div>
            </div>
          );

          if (ad.thumbnailUrl) {
            return (
              <a
                key={ad.id}
                href={ad.thumbnailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full"
              >
                {card}
              </a>
            );
          }

          return card;
        })}
      </div>
    </div>
  );
}
