import React from 'react';

export function Cookies() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-zinc-100 mb-8">Cookie Policy</h1>
      <div className="prose prose-invert prose-zinc max-w-none">
        <p className="text-zinc-400 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">1. What Are Cookies</h2>
        <p className="text-zinc-400 mb-6">
          Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used in order to make websites work, or work more efficiently, as well as to provide information to the owners of the site.
        </p>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">2. How We Use Cookies</h2>
        <p className="text-zinc-400 mb-6">
          We use cookies to understand how you use our site and to improve your experience. This includes personalizing content and advertising. By continuing to use our site, you accept our use of cookies, revised Privacy Policy and Terms of Use.
        </p>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">3. Types of Cookies We Use</h2>
        <ul className="list-disc pl-6 text-zinc-400 mb-6 space-y-2">
          <li><strong>Essential Cookies:</strong> These cookies are necessary for the website to function and cannot be switched off in our systems.</li>
          <li><strong>Performance Cookies:</strong> These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.</li>
          <li><strong>Functional Cookies:</strong> These cookies enable the website to provide enhanced functionality and personalisation.</li>
        </ul>

        <h2 className="text-xl font-semibold text-zinc-200 mt-8 mb-4">4. Managing Cookies</h2>
        <p className="text-zinc-400 mb-6">
          You can set your browser not to accept cookies, and the above website tells you how to remove cookies from your browser. However, in a few cases, some of our website features may not function as a result.
        </p>
      </div>
    </div>
  );
}
