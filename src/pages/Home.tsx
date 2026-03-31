import React, { useMemo, useState } from 'react';
import { useMedia } from '../context/MediaContext';
import { MediaCard } from '../components/MediaCard';
import { AdBanner } from '../components/AdBanner';
import { Film, ChevronLeft, ChevronRight } from 'lucide-react';

const ITEMS_PER_PAGE = 80;

export function Home() {
  const { media, searchQuery, typeFilter, categoryFilter } = useMedia();
  const [currentPage, setCurrentPage] = useState(1);

  const filteredMedia = useMemo(() => {
    const filtered = media.filter(item => {
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
      
      return true;
    });

    // Sort by newest first
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [media, searchQuery, typeFilter, categoryFilter]);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, categoryFilter]);

  const totalPages = Math.ceil(filteredMedia.length / ITEMS_PER_PAGE);
  const currentMedia = filteredMedia.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Discover Media</h1>
          <p className="text-zinc-400 mt-1">Explore our collection of images and videos.</p>
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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentMedia.map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-3 py-2 text-zinc-500">...</span>
                  ) : (
                    <button
                      key={`page-${page}`}
                      onClick={() => setCurrentPage(page as number)}
                      className={`min-w-[40px] h-10 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-indigo-600 text-white'
                          : 'border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Next Page"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
