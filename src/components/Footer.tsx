import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Mail, Info, Link as LinkIcon, Twitter, Instagram, AlertTriangle } from 'lucide-react';
import { useDeletionRequests } from '../context/DeletionRequestContext';
import { useSettings } from '../context/SettingsContext';

export function Footer() {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const { addRequest } = useDeletionRequests();
  const { settings } = useSettings();

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim()) return;
    
    // Using a placeholder mediaId for general reports from footer
    addRequest('general_report', reportReason);
    setReportSubmitted(true);
    setTimeout(() => {
      setShowReportModal(false);
      setReportSubmitted(false);
      setReportReason('');
    }, 2000);
  };

  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 pt-12 pb-8 mt-auto relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* About Us */}
          <div>
            <h3 className="text-zinc-100 font-semibold mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-500" />
              About Us
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {settings.site_description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-zinc-100 font-semibold mb-4 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-indigo-500" />
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="text-zinc-400 hover:text-indigo-400 transition-colors">Home</Link></li>
              <li><Link to="/login" className="text-zinc-400 hover:text-indigo-400 transition-colors">Sign In</Link></li>
              <li><Link to="/signup" className="text-zinc-400 hover:text-indigo-400 transition-colors">Create Account</Link></li>
              <li><Link to="/terms" className="text-zinc-400 hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-zinc-400 hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="text-zinc-100 font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-500" />
              Contact Us
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="text-zinc-400">{settings.contact_email || 'support@example.com'}</li>
              <li className="text-zinc-400">{settings.contact_phone || '+1 (555) 123-4567'}</li>
              <li className="mt-4">
                <button 
                  onClick={() => setShowReportModal(true)}
                  className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Request Image/Video Deletion
                </button>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-zinc-100 font-semibold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a href={settings.twitter_url || '#'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href={settings.instagram_url || '#'} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-all">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

        </div>
        
        <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} {settings.site_name}. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-zinc-500">
            <Link to="/terms" className="hover:text-zinc-300 transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-zinc-300 transition-colors">Privacy</Link>
            <Link to="/cookies" className="hover:text-zinc-300 transition-colors">Cookies</Link>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-zinc-100 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Request Deletion
            </h3>
            
            {reportSubmitted ? (
              <div className="py-8 text-center">
                <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-zinc-300 font-medium">Request submitted successfully.</p>
                <p className="text-zinc-500 text-sm mt-1">Our admin team will review it shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit}>
                <p className="text-zinc-400 mb-4 text-sm">
                  Please provide details about the media you want to request for deletion (e.g., URL or title) and the reason.
                </p>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Details and reason for deletion..."
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px] mb-6"
                />
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 text-zinc-400 hover:text-zinc-100 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-xl font-medium transition-all shadow-lg shadow-red-500/20"
                  >
                    Submit Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </footer>
  );
}
