/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MediaProvider } from './context/MediaContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Admin } from './pages/Admin';
import { MediaView } from './pages/MediaView';
import { Profile } from './pages/Profile';

export default function App() {
  return (
    <AuthProvider>
      <MediaProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500/30">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/media/:id" element={<MediaView />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </MediaProvider>
    </AuthProvider>
  );
}
