/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MediaProvider } from './context/MediaContext';
import { ThemeProvider } from './context/ThemeContext';
import { DeletionRequestProvider } from './context/DeletionRequestContext';
import { SettingsProvider } from './context/SettingsContext';
import { ModalProvider } from './context/ModalContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Admin } from './pages/Admin';
import { MediaView } from './pages/MediaView';
import { Profile } from './pages/Profile';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { Cookies } from './pages/Cookies';
import { UpdatePassword } from './pages/UpdatePassword';
import { HelmetProvider } from 'react-helmet-async';

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <AuthProvider>
          <SettingsProvider>
            <ModalProvider>
              <MediaProvider>
                <DeletionRequestProvider>
                  <Router>
                    <div className="min-h-screen flex flex-col bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-indigo-500/30 transition-colors duration-200">
                      <Navbar />
                      <main className="flex-grow">
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/signup" element={<Signup />} />
                          <Route path="/admin" element={<Admin />} />
                          <Route path="/profile" element={<Profile />} />
                          <Route path="/media/:id" element={<MediaView />} />
                          <Route path="/terms" element={<Terms />} />
                          <Route path="/privacy" element={<Privacy />} />
                          <Route path="/cookies" element={<Cookies />} />
                          <Route path="/update-password" element={<UpdatePassword />} />
                        </Routes>
                      </main>
                      <Footer />
                    </div>
                  </Router>
                </DeletionRequestProvider>
              </MediaProvider>
            </ModalProvider>
          </SettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
