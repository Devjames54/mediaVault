import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Film, Eye, EyeOff } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { login, resetPassword, signInWithProvider } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isForgotPassword) {
      if (!email.trim()) {
        setError('Please enter your email address');
        return;
      }
      setLoading(true);
      setError('');
      try {
        await resetPassword(email.trim());
        setResetSent(true);
      } catch (err: any) {
        setError(err.message || 'Failed to send reset email');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (email.trim() && password.trim()) {
      setError('');
      setLoading(true);
      try {
        await login(email.trim(), password.trim());
        navigate('/');
      } catch (err: any) {
        console.error("Login Error Details:", err);
        if (err.message === 'Failed to fetch') {
          setError('Network error: Could not connect to the server. Please check your internet connection or try again later.');
        } else if (err.message.includes('Invalid login credentials')) {
          setError('The email or password you entered is incorrect. Please try again.');
        } else {
          setError('We encountered an issue signing you in. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSocialLogin = async (provider: 'google') => {
    try {
      await signInWithProvider(provider);
    } catch (err: any) {
      setError(err.message || `Failed to login with ${provider}`);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4">
            <Film className="w-6 h-6 text-indigo-500" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-100">
            {isForgotPassword ? 'Reset Password' : 'Welcome back'}
          </h2>
          <p className="text-zinc-400 text-sm mt-1">
            {isForgotPassword ? 'Enter your email to receive a reset link' : 'Sign in to download media'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-400 p-3 rounded-xl mb-4 text-sm border border-red-500/20">
            {error}
          </div>
        )}

        {resetSent ? (
          <div className="text-center">
            <div className="bg-green-500/10 text-green-400 p-4 rounded-xl mb-6 text-sm border border-green-500/20">
              Password reset link has been sent to your email.
            </div>
            <button
              onClick={() => {
                setIsForgotPassword(false);
                setResetSent(false);
                setPassword('');
              }}
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1.5">Email address</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>
            
            {!isForgotPassword && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-zinc-300">Password</label>
                  <button 
                    type="button" 
                    onClick={() => setIsForgotPassword(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 pr-12 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? (isForgotPassword ? 'Sending...' : 'Signing in...') : (isForgotPassword ? 'Send Reset Link' : 'Sign In')}
            </button>
          </form>
        )}

        {!isForgotPassword && !resetSent && (
          <>
            <div className="mt-6 flex items-center justify-center">
              <div className="border-t border-zinc-800 flex-grow"></div>
              <span className="px-3 text-xs text-zinc-500 uppercase tracking-wider">Or continue with</span>
              <div className="border-t border-zinc-800 flex-grow"></div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                className="w-full flex items-center justify-center gap-3 bg-zinc-950 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 font-medium py-2.5 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
            </div>
          </>
        )}

        <p className="mt-6 text-center text-sm text-zinc-400">
          {isForgotPassword ? (
            <button onClick={() => setIsForgotPassword(false)} className="text-indigo-400 hover:text-indigo-300 font-medium">
              Back to Sign In
            </button>
          ) : (
            <>
              Don't have an account?{' '}
              <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium">
                Sign up
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
