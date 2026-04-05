import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../context/ModalContext';
import { User as UserIcon, Save, Mail, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showAlert } = useModal();
  
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Fetch current profile data
    const fetchProfile = async () => {
      try {
        const { data: { user: authUser }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error fetching user:', error);
          if (error.message.includes('Refresh Token Not Found') || error.message.includes('Invalid Refresh Token')) {
            await supabase.auth.signOut();
            navigate('/login');
          }
          return;
        }
        if (authUser?.user_metadata?.display_name) {
          setDisplayName(authUser.user_metadata.display_name);
        }
      } catch (err) {
        console.error('Unexpected error fetching profile:', err);
      }
    };
    
    fetchProfile();
  }, [user, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName }
      });
        
      if (error) throw error;
      
      showAlert({ type: 'success', message: 'Profile updated successfully!' });
    } catch (error) {
      console.error('Error updating profile:', error);
      showAlert({ type: 'error', message: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="bg-zinc-800/50 px-8 py-6 border-b border-zinc-800 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <UserIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Your Profile</h1>
            <p className="text-zinc-400">Manage your account information</p>
          </div>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-zinc-500 cursor-not-allowed"
                />
              </div>
              <p className="mt-1.5 text-xs text-zinc-500">Email address cannot be changed.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Role
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  type="text"
                  disabled
                  value={user.role}
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-zinc-500 capitalize cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Display Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your display name"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
              >
                <Save className="w-5 h-5" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
