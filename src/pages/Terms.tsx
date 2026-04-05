import React from 'react';
import { useSettings } from '../context/SettingsContext';

export function Terms() {
  const { settings } = useSettings();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-zinc-100 mb-8">Terms of Service</h1>
      <div className="prose prose-invert prose-zinc max-w-none">
        <p className="text-zinc-400 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">1. Acceptance of Terms</h2>
        <p className="text-zinc-400 mb-6">
          By accessing and using {settings.site_name}, you accept and agree to be bound by the terms and provision of this agreement.
        </p>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">2. User Conduct</h2>
        <p className="text-zinc-400 mb-6">
          You agree to use the service only for lawful purposes and in a way that does not infringe the rights of, restrict or inhibit anyone else's use and enjoyment of the website.
        </p>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">3. Content Ownership</h2>
        <p className="text-zinc-400 mb-6">
          Users retain all ownership rights to the content they upload. By uploading content, you grant {settings.site_name} a worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute that content in connection with the service.
        </p>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">4. Termination</h2>
        <p className="text-zinc-400 mb-6">
          We may terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
        </p>
      </div>
    </div>
  );
}
