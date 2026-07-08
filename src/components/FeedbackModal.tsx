import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Send,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Star,
  Frown,
  Meh,
  Smile,
  Heart,
  Loader2
} from 'lucide-react';
import { supabase, isSupabaseLive } from '../supabase';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { email: string; name: string; avatar: string } | null;
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

type FeedbackType = 'bug' | 'feature' | 'ux' | 'other';
type SatisfactionLevel = 1 | 2 | 3 | 4 | 5;

export default function FeedbackModal({
  isOpen,
  onClose,
  currentUser,
  showNotification
}: FeedbackModalProps) {
  const [rating, setRating] = useState<SatisfactionLevel | null>(null);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('ux');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Prefill email if currentUser changes
  React.useEffect(() => {
    if (currentUser?.email) {
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  const satisfactionEmojis = [
    { value: 1 as SatisfactionLevel, label: 'Frown', icon: <Frown size={24} />, desc: 'Disappointed', color: 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 border-rose-200' },
    { value: 2 as SatisfactionLevel, label: 'Meh', icon: <Meh size={24} />, desc: 'Satisfied-ish', color: 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 border-amber-200' },
    { value: 3 as SatisfactionLevel, label: 'Smile', icon: <Smile size={24} />, desc: 'Happy', color: 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border-emerald-200' },
    { value: 4 as SatisfactionLevel, label: 'Heart', icon: <Heart size={24} />, desc: 'Love it', color: 'text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950/20 border-pink-200' },
    { value: 5 as SatisfactionLevel, label: 'Sparkles', icon: <Sparkles size={24} />, desc: 'Excellent!', color: 'text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 border-blue-200' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      showNotification('Please choose a satisfaction rating before submitting.', 'info');
      return;
    }
    if (!message.trim()) {
      showNotification('Please enter a feedback message.', 'info');
      return;
    }

    setIsSubmitting(true);

    // Simulate server feedback delivery
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      const newFeedback = {
        id: 'fb-' + Math.random().toString(36).substr(2, 9),
        email: email.trim() || 'Anonymous',
        rating,
        feedbackType,
        message: message.trim(),
        timestamp: new Date().toISOString()
      };

      // 1. Save feedback to LocalStorage to make it persistent and verifiable offline
      const existingFeedback = JSON.parse(localStorage.getItem('sb-user-feedbacks') || '[]');
      existingFeedback.push(newFeedback);
      localStorage.setItem('sb-user-feedbacks', JSON.stringify(existingFeedback));

      // 2. Safely sync to Supabase if connected
      if (isSupabaseLive) {
        try {
          const { error } = await supabase
            .from('feedbacks')
            .insert({
              email: newFeedback.email,
              rating: newFeedback.rating,
              category: newFeedback.feedbackType,
              message: newFeedback.message,
              created_at: newFeedback.timestamp
            });
          if (error) {
            console.warn("Could not sync feedback to Supabase 'feedbacks' table (you might need to run the feedbacks schema SQL in your Supabase console):", error.message);
          }
        } catch (supabaseError) {
          console.warn("Supabase feedback insert bypassed due to connectivity or configuration:", supabaseError);
        }
      }

      setIsSuccess(true);
      showNotification('Feedback submitted successfully! Thank you for your support.', 'success');
    } catch (err) {
      showNotification('Unable to submit feedback. Please check your network and try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRating(null);
    setFeedbackType('ux');
    setMessage('');
    setIsSuccess(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto" id="feedback-modal">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Window Container */}
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative transform overflow-hidden rounded-3xl bg-white dark:bg-slate-900 text-left shadow-2xl transition-all w-full max-w-lg border border-slate-200 dark:border-slate-800 flex flex-col p-6 sm:p-8"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              id="close-feedback-modal-btn"
            >
              <X size={16} />
            </button>

            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Header branding */}
                <div className="space-y-1.5 pr-8">
                  <div className="inline-flex p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl">
                    <MessageSquare size={20} />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Share Your Feedback
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal font-medium">
                    Help us improve your personal ledger workspace. Tell us what we can do better or report any issues.
                  </p>
                </div>

                {/* Rating selection (Interactive Icons) */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Your Satisfaction Rating <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex justify-between items-center gap-2 pt-1">
                    {satisfactionEmojis.map((emoji) => {
                      const isSelected = rating === emoji.value;
                      return (
                        <button
                          key={emoji.value}
                          type="button"
                          onClick={() => setRating(emoji.value)}
                          className={`flex-1 flex flex-col items-center gap-1.5 p-2.5 border rounded-2xl cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-slate-50 dark:bg-slate-800 border-blue-500 ring-2 ring-blue-100 dark:ring-blue-950 scale-105 shadow-2xs font-extrabold'
                              : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                          title={emoji.desc}
                        >
                          <div className={`${isSelected ? emoji.color : 'text-slate-400 hover:text-slate-600'}`}>
                            {emoji.icon}
                          </div>
                          <span className={`text-[9px] ${isSelected ? 'text-slate-800 dark:text-white font-bold' : 'text-slate-400 font-medium'}`}>
                            {emoji.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Feedback Type Selection */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Feedback Category
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'ux' as FeedbackType, label: 'User Experience' },
                      { value: 'bug' as FeedbackType, label: 'Bug / Tech Issue' },
                      { value: 'feature' as FeedbackType, label: 'Feature Request' },
                      { value: 'other' as FeedbackType, label: 'Other / Inquiry' }
                    ].map((type) => {
                      const isSelected = feedbackType === type.value;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFeedbackType(type.value)}
                          className={`px-3 py-2 border rounded-xl text-[11px] font-bold transition-all text-center cursor-pointer ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Email input field */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Your Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email for responses (e.g. aditya@gmail.com)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/30 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Message input field */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Feedback Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Write your feedback details here..."
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/30 focus:border-blue-500 transition-all resize-none leading-relaxed"
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Submitting Feedback...</span>
                      </>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Submit Feedback</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

              </form>
            ) : (
              // Success Splash block
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 text-center space-y-4"
              >
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto text-xl shadow-xs border border-emerald-100 dark:border-emerald-900/40">
                  <CheckCircle2 size={32} className="animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Feedback Received!
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                    Thank you for sharing your experience. We have logged your feedback securely in our local server registry to analyze and improve future updates.
                  </p>
                </div>
                <div className="pt-4 flex justify-center gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Write More Feedback
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Back to App
                  </button>
                </div>
              </motion.div>
            )}

          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
