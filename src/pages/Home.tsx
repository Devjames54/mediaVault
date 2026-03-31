import React, { useMemo, useState } from 'react';
import { useMedia } from '../context/MediaContext';
import { MediaCard } from '../components/MediaCard';
import { AdBanner } from '../components/AdBanner';
import { Film, Calendar } from 'lucide-react';

export function Home() {
  const { media, searchQuery, typeFilter, categoryFilter } = useMedia();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredMedia = useMemo(() => {
    return media.filter(item => {
      // Search by title
      if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Filter by type
      if (typeFilter !== 'all' && item.type !== typeFilter) {
        return false;
      }
      
      // Exclude ads from the main media list
      if (item.category === 'ad') {
        return false;
      }

      // Filter by category
      if (categoryFilter !== 'all' && item.category !== categoryFilter) {
        return false;
      }

      // Filter by date range
      if (startDate || endDate) {
        const itemDate = new Date(item.createdAt).getTime();
        
        if (startDate) {
          const start = new Date(startDate).getTime();
          if (itemDate < start) return false;
        }
        
        if (endDate) {
          // Set to end of day for the end date
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (itemDate > end.getTime()) return false;
        }
      }
      
      return true;
    });
  }, [media, searchQuery, typeFilter, categoryFilter, startDate, endDate]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Discover Media</h1>
          <p className="text-zinc-400 mt-1">Explore our collection of images and videos.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-zinc-900/50 p-2 rounded-xl border border-zinc-800">
          <div className="flex items-center gap-2 px-2">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-300">Date Range</span>
          </div>
          <div className="hidden sm:block h-6 w-px bg-zinc-800" />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 flex-1 sm:flex-none"
              title="Start Date"
            />
            <span className="text-zinc-500 text-sm">to</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500 flex-1 sm:flex-none"
              title="End Date"
            />
          </div>
          {(startDate || endDate) && (
            <button 
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="text-xs text-zinc-400 hover:text-zinc-200 px-2 w-full sm:w-auto text-right sm:text-left"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <AdBanner />

      {filteredMedia.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-zinc-800">
          <Film className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-zinc-300">No media found</h3>
          <p className="text-zinc-500">Try adjusting your search or filters in the menu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMedia.map((item) => (
            <MediaCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
