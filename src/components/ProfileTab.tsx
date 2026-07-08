import React, { useState } from 'react';
import { motion } from 'motion/react';
import { User, Check, RefreshCw, Sparkles, MapPin, Settings } from 'lucide-react';

interface ProfileTabProps {
  currentUser: { email: string; name: string; avatar: string };
  onUpdateUser: (updated: { name: string; email: string; avatar: string }) => void;
  currencyCode: string;
  onUpdateCurrency: (code: string) => void;
  themePreference: 'light' | 'dark';
  onUpdateTheme: (theme: 'light' | 'dark') => void;
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const COMMON_TIMEZONES = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'Europe/London', label: 'Europe/London (GMT)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET)' },
];

const CURRENCIES_LIST = [
  { code: 'INR', name: 'INR — Indian Rupee' },
];

export const ProfileTab: React.FC<ProfileTabProps> = ({
  currentUser,
  onUpdateUser,
  currencyCode,
  onUpdateCurrency,
  themePreference,
  onUpdateTheme,
  showNotification,
}) => {
  // Local form states
  const [avatarInitials, setAvatarInitials] = useState(currentUser.name.substring(0, 2).toUpperCase());
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [currency, setCurrency] = useState(currencyCode);
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [themePref, setThemePref] = useState<'light' | 'dark'>(themePreference);

  // Derive initials from name dynamically if user changes name
  const handleNameChange = (val: string) => {
    setName(val);
    if (val.length >= 2) {
      setAvatarInitials(val.substring(0, 2).toUpperCase());
    } else if (val.length === 1) {
      setAvatarInitials(val.substring(0, 1).toUpperCase());
    } else {
      setAvatarInitials('??');
    }
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Update current user credentials
    onUpdateUser({
      name,
      email,
      avatar: currentUser.avatar, // keep existing emoji icon
    });

    // 2. Update currency
    onUpdateCurrency(currency);

    // 3. Update theme
    onUpdateTheme(themePref);

    showNotification('Profile preferences updated successfully!', 'success');
  };

  const handleDiscard = () => {
    setName(currentUser.name);
    setEmail(currentUser.email);
    setCurrency(currencyCode);
    setThemePref(themePreference);
    setAvatarInitials(currentUser.name.substring(0, 2).toUpperCase());
    onUpdateTheme(themePreference);
    showNotification('Changes discarded.', 'info');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs max-w-2xl mx-auto">
      
      {/* Top Identity card layout */}
      <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl font-extrabold shadow-sm select-none shrink-0">
          {avatarInitials}
        </div>
        <div className="text-center sm:text-left">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center justify-center sm:justify-start gap-1.5">
            Profile Preferences
            <Sparkles size={14} className="text-blue-500" />
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Frontend profile preferences for the dashboard.
          </p>
        </div>
      </div>

      <form onSubmit={handleSaveChanges} className="space-y-5 pt-6">
        
        {/* Initials display field */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Avatar Initials
          </label>
          <input
            type="text"
            readOnly
            value={avatarInitials}
            className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs focus:outline-none font-bold"
          />
        </div>

        {/* Name input */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950 focus:border-blue-500 transition-all font-semibold"
          />
        </div>

        {/* Email Input */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Email
          </label>
          <input
            type="email"
            readOnly
            disabled
            value={email}
            className="block w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 dark:text-slate-500 text-xs focus:outline-none font-semibold cursor-not-allowed"
          />
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            Registered auth email cannot be modified.
          </p>
        </div>

        {/* Currency selection list */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Currency
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white text-xs focus:outline-none cursor-pointer font-semibold"
          >
            {CURRENCIES_LIST.map((c) => (
              <option key={c.code} value={c.code} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white font-semibold">
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Timezone Selection list */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Timezone
          </label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white text-xs focus:outline-none cursor-pointer font-semibold"
          >
            {COMMON_TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white font-semibold">
                {tz.label}
              </option>
            ))}
          </select>
        </div>

        {/* Theme Preference Selection list */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Theme Preference
          </label>
          <select
            value={themePref}
            onChange={(e) => {
              const val = e.target.value as 'light' | 'dark';
              setThemePref(val);
              onUpdateTheme(val);
            }}
            className="block w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white text-xs focus:outline-none cursor-pointer font-semibold"
          >
            <option value="light" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white font-semibold">Light</option>
            <option value="dark" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white font-semibold">Dark</option>
          </select>
        </div>

        {/* Save & Discard buttons */}
        <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Check size={14} /> Save Changes
          </button>
          <button
            type="button"
            onClick={handleDiscard}
            className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs font-bold rounded-2xl transition-all cursor-pointer"
          >
            Discard
          </button>
        </div>

      </form>
    </div>
  );
};

export default ProfileTab;
