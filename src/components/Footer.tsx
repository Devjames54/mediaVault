import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Mail, Info, Link as LinkIcon, Twitter, Facebook, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* About Us */}
          <div>
            <h3 className="text-zinc-100 font-semibold mb-4 flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-500" />
              About Us
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              We provide high-quality media downloads for creators and professionals. Our platform ensures you get the best content quickly and securely.
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
              <li><a href="#" className="text-zinc-400 hover:text-indigo-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="text-zinc-100 font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-500" />
              Contact Us
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="text-zinc-400">support@example.com</li>
              <li className="text-zinc-400">+1 (555) 123-4567</li>
              <li className="mt-4">
                <a href="#" className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  Report Image/Video
                </a>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-zinc-100 font-semibold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-all">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-indigo-400 hover:border-indigo-500/50 transition-all">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

        </div>
        
        <div className="border-t border-zinc-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} MediaHub. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-zinc-500">
            <a href="#" className="hover:text-zinc-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
