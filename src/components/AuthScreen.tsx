import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Coins, Mail, Lock, User, ArrowRight, ArrowLeft, ShieldCheck, Sparkles, KeyRound } from 'lucide-react';
import { supabase, isSupabaseLive } from '../supabase';
import { createUserProfile, getUserProfile } from '../services/supabaseService';

interface AuthScreenProps {
  onLoginSuccess: (user: { id: string; email: string; name: string; avatar: string }) => void;
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const AVATARS = ['🦁', '🦊', '🦉', '🐼', '🐨', '🐸', '🚀', '💼', '🎨', '🍀'];

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, showNotification }) => {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🦁');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash && (hash.includes('type=recovery') || hash.includes('access_token='))) {
        setAuthMode('reset');
        // Clean URL hash so it doesn't stay there on reload
        window.history.replaceState(null, '', window.location.pathname);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      if (authMode === 'login') {
        // Supabase login flow
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (authError) {
          setError(authError.message);
          showNotification(authError.message, 'error');
          return;
        }

        const sbUser = authData.user;
        if (!sbUser) {
          throw new Error('User not found after authentication.');
        }
        
        // Load custom user profile from Supabase
        const profile = await getUserProfile(sbUser.id);
        if (profile) {
          showNotification(`Welcome back, ${profile.name}!`, 'success');
          onLoginSuccess({
            id: sbUser.id,
            email: sbUser.email || email,
            name: profile.name,
            avatar: profile.avatar || '🦁',
          });
        } else {
          showNotification(`Welcome back! App profile initialized.`, 'success');
          onLoginSuccess({
            id: sbUser.id,
            email: sbUser.email || email,
            name: email.split('@')[0],
            avatar: '🦁',
          });
        }
      } else if (authMode === 'signup') {
        // Supabase signup flow
        if (!name) {
          setError('Please enter your name.');
          return;
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              avatar: selectedAvatar
            }
          }
        });

        if (authError) {
          setError(authError.message);
          showNotification(authError.message, 'error');
          return;
        }

        const sbUser = authData.user;
        if (!sbUser) {
          throw new Error('Sign up failed.');
        }

        // Seed profile & defaults in Supabase for this user (only categories, no dummy/demo transactions!)
        const newProfile = await createUserProfile(sbUser.id, {
          name,
          email,
          avatar: selectedAvatar,
        });

        showNotification('Account created successfully! Welcome to SpendTrack Pro.', 'success');
        onLoginSuccess({
          id: sbUser.id,
          email: sbUser.email || email,
          name: newProfile.name,
          avatar: newProfile.avatar,
        });
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const errMsg = err.message || 'Authentication failed. Please verify credentials.';
      setError(errMsg);
      showNotification(errMsg, 'error');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });

      if (resetError) {
        setError(resetError.message);
        showNotification(resetError.message, 'error');
        return;
      }

      showNotification('Recovery email sent! Please check your inbox.', 'success');
      setAuthMode('login');
    } catch (err: any) {
      console.error('Reset password error:', err);
      const errMsg = err.message || 'Failed to send recovery email.';
      setError(errMsg);
      showNotification(errMsg, 'error');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        setError(updateError.message);
        showNotification(updateError.message, 'error');
        return;
      }

      showNotification('Password updated successfully! You can now sign in with your new password.', 'success');
      setAuthMode('login');
      setPassword('');
    } catch (err: any) {
      console.error('Update password error:', err);
      const errMsg = err.message || 'Failed to update password.';
      setError(errMsg);
      showNotification(errMsg, 'error');
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    if (authMode === 'forgot') {
      handleForgotPassword(e);
    } else if (authMode === 'reset') {
      handleUpdatePassword(e);
    } else {
      handleAuthSubmit(e);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (authError) {
        throw authError;
      }

      showNotification('Redirecting to Google Sign-In...', 'info');
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      const errMsg = err.message || 'Google Sign-In failed.';
      setError(errMsg);
      showNotification(errMsg, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Brand Logo & Header */}
        <div className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto h-16 w-16 bg-slate-900 rounded-3xl shadow-lg flex items-center justify-center text-white border border-slate-800"
          >
            <Coins size={32} className="text-emerald-400" />
          </motion.div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-900 tracking-tight">
            SpendTrack Pro
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-semibold uppercase tracking-wider">
            Personal Wealth Console
          </p>
        </div>

        {/* Card Body */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200 shadow-md space-y-6"
        >
          {/* Tabs for switching Login / Signup (only shown in login / signup modes) */}
          {(authMode === 'login' || authMode === 'signup') ? (
            <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setError('');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setError('');
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Get Started
              </button>
            </div>
          ) : authMode === 'forgot' ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setError('');
                }}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
              >
                <ArrowLeft size={14} /> Back to Sign In
              </button>
              <h3 className="text-lg font-bold text-slate-800">Reset Your Password</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter your registered email address below. We'll send you a secure link to create a new password.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-500">
                <KeyRound size={20} />
                <h3 className="text-lg font-bold text-slate-800">Setup New Password</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Please enter a secure new password for your account below.
              </p>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs font-semibold text-rose-600"
            >
              {error}
            </motion.div>
          )}

          <form className="space-y-5" onSubmit={handleSubmitForm}>
            {/* Full Name field (only for Sign Up) */}
            {authMode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-1"
              >
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-hidden focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </motion.div>
            )}

            {/* Email Address field (for signup, login, forgot) */}
            {authMode !== 'reset' && (
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-hidden focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            {/* Password field (for signup, login, reset) */}
            {authMode !== 'forgot' && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {authMode === 'reset' ? 'New Password' : 'Password'}
                  </label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot');
                        setError('');
                      }}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-all cursor-pointer"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm focus:outline-hidden focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            {/* Avatar picker for Sign Up */}
            {authMode === 'signup' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Select Your Profile Avatar
                </label>
                <div className="grid grid-cols-5 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  {AVATARS.map((avatar) => {
                    const isSelected = selectedAvatar === avatar;
                    return (
                      <button
                        key={avatar}
                        type="button"
                        onClick={() => setSelectedAvatar(avatar)}
                        className={`text-2xl p-2 rounded-xl transition-all cursor-pointer hover:scale-110 ${
                          isSelected
                            ? 'bg-slate-900 border border-slate-800 shadow-md scale-105'
                            : 'bg-white border border-slate-100 hover:bg-slate-100'
                        }`}
                      >
                        {avatar}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-2xl bg-slate-900 text-white font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-slate-800 active:bg-slate-950 transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              {authMode === 'login'
                ? 'Sign In to Dashboard'
                : authMode === 'signup'
                ? 'Create Wealth Console'
                : authMode === 'forgot'
                ? 'Send Recovery Link'
                : 'Update My Password'}
              <ArrowRight size={16} className="text-emerald-400" />
            </button>
          </form>

          {/* Social Sign In (only shown in login/signup modes) */}
          {(authMode === 'login' || authMode === 'signup') && (
            <>
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-wider">or continue with</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full py-3 px-4 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-sm tracking-wide flex items-center justify-center gap-3 transition-all shadow-xs cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Sign in with Google
              </button>
            </>
          )}

          {/* Quick Info footer */}
          <div className="flex items-center justify-center gap-1.5 pt-4 border-t border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <ShieldCheck size={14} className={isSupabaseLive ? "text-emerald-500" : "text-amber-500"} />
            <span>{isSupabaseLive ? "Supabase Cloud Mode" : "Local Sandbox Storage Only"}</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthScreen;
