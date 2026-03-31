import React from 'react';

export function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-zinc-100 mb-8">Privacy Policy</h1>
      <div className="prose prose-invert prose-zinc max-w-none">
        <p className="text-zinc-400 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">1. Information We Collect</h2>
        <p className="text-zinc-400 mb-6">
          We collect information you provide directly to us, such as when you create or modify your account, request on-demand services, contact customer support, or otherwise communicate with us.
        </p>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">2. How We Use Information</h2>
        <p className="text-zinc-400 mb-6">
          We may use the information we collect about you to provide, maintain, and improve our services, including to facilitate payments, send receipts, provide products and services you request, and send related information.
        </p>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">3. Sharing of Information</h2>
        <p className="text-zinc-400 mb-6">
          We may share the information we collect about you as described in this Statement or as described at the time of collection or sharing, including with third-party service providers.
        </p>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">4. Security</h2>
        <p className="text-zinc-400 mb-6">
          We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
        </p>
      </div>
    </div>
  );
}
