import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMedia } from '../context/MediaContext';
import { PlaySquare, LogOut, User as UserIcon, Shield, Menu, X, Search } from 'lucide-react';
import { CATEGORIES } from '../constants';

export function Navbar() {
  const { user, logout } = useAuth();
  const { searchQuery, setSearchQuery, typeFilter, setTypeFilter, categoryFilter, setCategoryFilter } = useMedia();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (location.pathname !== '/') navigate('/');
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTypeFilter(e.target.value);
    setCategoryFilter('all'); // Reset category when type changes
    if (location.pathname !== '/') navigate('/');
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
    if (location.pathname !== '/') navigate('/');
  };

  return (
    <>
      <nav className="bg-zinc-900 border-b border-zinc-800 text-zinc-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight hover:text-indigo-400 transition-colors">
              <PlaySquare className="w-6 h-6 text-indigo-500" />
              <span>MediaVault</span>
            </Link>
            
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="p-2 text-zinc-400 hover:text-white transition-colors rounded-lg hover:bg-zinc-800"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Drawer Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]" onClick={() => setIsMenuOpen(false)} />
      )}

      {/* Drawer Content */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-zinc-950 border-l border-zinc-800 z-[70] transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto shadow-2xl`}>
        <div className="p-4 flex justify-between items-center border-b border-zinc-800/50">
          <span className="font-bold text-lg text-zinc-100">Menu</span>
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Auth Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Account</h3>
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-3 py-2 bg-zinc-900 rounded-lg border border-zinc-800">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-200 truncate">{user.email}</p>
                    <p className="text-xs text-zinc-500 capitalize">{user.role}</p>
                  </div>
                </div>
                
                <Link 
                  to="/profile" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-indigo-400" />
                  Your Profile
                </Link>
                
                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-zinc-300 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
                  >
                    <Shield className="w-4 h-4 text-indigo-400" />
                    Admin Panel
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link 
                  to="/login" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors"
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Search & Filter Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Search & Filter</h3>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-zinc-500" />
              </div>
              <input
                type="text"
                placeholder="Search media..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1.5">Media Type</label>
                <select
                  value={typeFilter}
                  onChange={handleTypeChange}
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                >
                  <option value="all">All Types</option>
                  <option value="image">Images</option>
                  <option value="video">Videos</option>
                </select>
              </div>

              {(typeFilter === 'image' || typeFilter === 'video') && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="block text-xs text-zinc-500 mb-1.5">Sub Category</label>
                  <select
                    value={categoryFilter}
                    onChange={handleCategoryChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2.5"
                  >
                    <option value="all">All Categories</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
