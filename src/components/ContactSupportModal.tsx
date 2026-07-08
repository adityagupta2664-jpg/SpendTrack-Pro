import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Copy,
  Check,
  Mail,
  HelpCircle,
  MessageSquare,
  ExternalLink,
  Laptop
} from 'lucide-react';

interface ContactSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  onOpenFeedback: () => void;
  onNavigateToHelp: () => void;
}

export default function ContactSupportModal({
  isOpen,
  onClose,
  showNotification,
  onOpenFeedback,
  onNavigateToHelp
}: ContactSupportModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('hemanttech2654@gmail.com');
    setCopied(true);
    showNotification('Support Email copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMailTo = () => {
    try {
      window.open('mailto:hemanttech2654@gmail.com', '_blank');
      showNotification('Opening your default mail app...', 'success');
    } catch (err) {
      showNotification('Unable to launch mail app. Please copy the email manually.', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto" id="contact-support-modal">
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
            className="relative transform overflow-hidden rounded-3xl bg-white dark:bg-slate-900 text-left shadow-2xl transition-all w-full max-w-md border border-slate-200 dark:border-slate-800 flex flex-col p-6 sm:p-8 space-y-6"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              id="close-contact-modal-btn"
            >
              <X size={16} />
            </button>

            {/* Header */}
            <div className="space-y-1.5 pr-8">
              <div className="inline-flex p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl">
                <Mail size={20} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Contact Developer Support
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal font-medium">
                Got transaction lag, feature requests, or custom database configuration queries? We are here to help!
              </p>
            </div>

            {/* Support Email Card */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center space-y-3.5 text-center">
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Official Support Email Address
              </span>
              <div className="text-sm font-extrabold text-blue-600 dark:text-blue-400 select-all tracking-tight font-mono bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
                hemanttech2654@gmail.com
              </div>
              <div className="flex gap-2 w-full">
                <button
                  onClick={handleCopy}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-transparent dark:border-slate-800"
                >
                  {copied ? (
                    <>
                      <Check size={13} className="text-emerald-500 animate-bounce" />
                      <span>Copied Email!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy Email</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleMailTo}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ExternalLink size={13} />
                  <span>Launch Email App</span>
                </button>
              </div>
            </div>

            {/* Explanation box: Why sometimes it just opens a browser tab / empty browser tab */}
            <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-950/20 rounded-xl space-y-2">
              <div className="flex items-start gap-2">
                <Laptop size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-[11px] font-bold text-amber-800 dark:text-amber-400 leading-none">
                    Why does my browser open an empty tab?
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">
                    If your device has no default mail client installed or configured (e.g. Outlook, Apple Mail), clicking "Launch Email App" may just open a blank browser tab. In that case, simply click <strong>"Copy Email"</strong> above and paste it directly into your preferred email provider (like Gmail or Yahoo).
                  </p>
                </div>
              </div>
            </div>

            {/* Other Support Alternatives */}
            <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
              <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">
                Or choose other options
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenFeedback();
                  }}
                  className="p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800/80 text-left rounded-xl flex flex-col space-y-1 cursor-pointer"
                >
                  <MessageSquare size={14} className="text-purple-500" />
                  <span className="text-[11px] font-extrabold text-slate-800 dark:text-white leading-tight">
                    Submit Ticket
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium leading-normal">
                    Send directly in this app
                  </span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onNavigateToHelp();
                  }}
                  className="p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800/80 text-left rounded-xl flex flex-col space-y-1 cursor-pointer"
                >
                  <HelpCircle size={14} className="text-indigo-500" />
                  <span className="text-[11px] font-extrabold text-slate-800 dark:text-white leading-tight">
                    Help Center
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium leading-normal">
                    Search docs & guides
                  </span>
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
