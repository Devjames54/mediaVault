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
    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 my-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {visibleAds.map((ad) => {
          const card = (
            <div key={ad.id} className="h-full flex flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-xl shadow-black/20 transition-transform duration-200 hover:-translate-y-1">
              <div className="h-44 overflow-hidden bg-zinc-900">
                <img
                  src={getFixedUrl(ad.url)}
                  alt={ad.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 p-4 flex flex-col justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-zinc-100 truncate">{ad.title}</h4>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                    Sponsored content from a partner brand.
                  </p>
                </div>
                <span className="inline-flex items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-zinc-400">
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
