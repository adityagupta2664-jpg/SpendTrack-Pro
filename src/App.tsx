import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, 
  Clock, 
  LogOut, 
  Search, 
  Info, 
  X,
  LayoutDashboard,
  Receipt,
  PiggyBank,
  FolderOpen,
  LineChart,
  User,
  Settings,
  CreditCard,
  Sun,
  Moon,
  Github,
  Twitter,
  Linkedin,
  HelpCircle
} from 'lucide-react';

import { Transaction, Category, Budget } from './types';
import { DEFAULT_CATEGORIES, DEFAULT_TRANSACTIONS, DEFAULT_BUDGETS } from './data';
import AuthScreen from './components/AuthScreen';
import HelpCenterTab from './components/HelpCenterTab';
import FeedbackModal from './components/FeedbackModal';
import ContactSupportModal from './components/ContactSupportModal';

// Supabase imports
import { supabase, isProdWithInvalidConfig, isDevSandbox, isSupabaseLive } from './supabase';
import { 
  getTransactions, 
  getCategories, 
  getBudgets, 
  getUserProfile, 
  updateUserProfile,
  addTransaction,
  deleteTransaction,
  updateTransaction,
  addBudget,
  deleteBudget,
  updateBudget,
  addCategory,
  deleteCategory,
  updateCategory,
  wipeUserData,
  seedDemoData
} from './services/supabaseService';

// Core Tabs Components
import DashboardTab from './components/DashboardTab';
import TransactionsTab from './components/TransactionsTab';
import BudgetsTab from './components/BudgetsTab';
import CategoriesTab from './components/CategoriesTab';
import AnalyticsTab from './components/AnalyticsTab';
import ProfileTab from './components/ProfileTab';
import SettingsTab from './components/SettingsTab';

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

export default function App() {
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVar(text);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  const handleEnableDemoMode = () => {
    localStorage.setItem('sb-use-demo-mode', 'true');
    window.location.reload();
  };

  if (isProdWithInvalidConfig) {
    return (
      <div className="bg-slate-50 dark:bg-slate-950 min-h-screen flex items-center justify-center p-4 sm:p-6 text-slate-900 dark:text-white font-sans antialiased">
        <div className="max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
          
          <div className="flex items-center gap-3.5 mb-6">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl">
              <Coins size={28} />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest leading-none">Netlify Deployment Ready</span>
              <h2 className="text-xl font-extrabold tracking-tight mt-1 text-slate-900 dark:text-white">Connect Your Database</h2>
            </div>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 text-left leading-relaxed mb-6">
            Your personal finance tracker is successfully deployed on Netlify! To save your transactions, budgets, and categories securely to the cloud, you just need to link your **Supabase Project** in your Netlify settings.
          </p>

          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 sm:p-5 mb-6 text-left">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Settings size={13} className="text-indigo-500" />
              How to add keys in Netlify:
            </h3>
            
            <ol className="space-y-3.5 text-xs text-slate-600 dark:text-slate-400 list-decimal pl-4 leading-normal">
              <li>
                Open your <strong className="text-slate-800 dark:text-slate-200">Netlify Dashboard</strong> for this site (<code className="text-blue-600 dark:text-blue-400 font-semibold font-mono">spendtrack-pro</code>).
              </li>
              <li>
                Navigate to <strong className="text-slate-800 dark:text-slate-200">Site Configuration &gt; Environment variables</strong>.
              </li>
              <li>
                Click <strong className="text-slate-800 dark:text-slate-200">Add a variable</strong> and enter these exactly:
                
                <div className="mt-3 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[11px] font-semibold">
                    <span className="text-slate-400">Key 1:</span>
                    <span className="text-indigo-600 dark:text-indigo-400 select-all">VITE_SUPABASE_URL</span>
                    <button 
                      onClick={() => handleCopyText('VITE_SUPABASE_URL')} 
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-[10px] font-sans text-slate-500 hover:text-blue-600 transition-all cursor-pointer"
                    >
                      {copiedVar === 'VITE_SUPABASE_URL' ? 'Copied! ✓' : 'Copy Key Name'}
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[11px] font-semibold">
                    <span className="text-slate-400">Key 2:</span>
                    <span className="text-indigo-600 dark:text-indigo-400 select-all">VITE_SUPABASE_ANON_KEY</span>
                    <button 
                      onClick={() => handleCopyText('VITE_SUPABASE_ANON_KEY')} 
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-[10px] font-sans text-slate-500 hover:text-blue-600 transition-all cursor-pointer"
                    >
                      {copiedVar === 'VITE_SUPABASE_ANON_KEY' ? 'Copied! ✓' : 'Copy Key Name'}
                    </button>
                  </div>
                </div>
              </li>
              <li>
                Trigger a <strong className="text-slate-800 dark:text-slate-200">Deploy site</strong> or redeploy to apply the values.
              </li>
            </ol>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-850 pt-5 text-left">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Don't have keys ready yet?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
              No problem! You can run the entire application in a high-fidelity <strong>Sandbox Demo Mode</strong> right now. All your transactions, budgets, categories, and custom preferences will be persistent directly in your browser.
            </p>

            <button
              onClick={handleEnableDemoMode}
              className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LayoutDashboard size={14} />
              <span>Explore App in Sandbox Demo Mode</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authentication & Session States
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; name: string; avatar: string } | null>(null);

  // Core Active Tab Navigation state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [previousTab, setPreviousTab] = useState<string>('dashboard');

  // Database application states (synchronized per logged user)
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [currencyCode, setCurrencyCode] = useState<string>('INR');
  const [themePreference, setThemePreference] = useState<'light' | 'dark'>('light');
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);
  const [isSupportOpen, setIsSupportOpen] = useState<boolean>(false);

  // Search Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Ticking time widget
  const [currentTime, setCurrentTime] = useState(new Date());

  // Alerts & Notifications State
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Ticker scheduler
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync dark theme class on document element
  useEffect(() => {
    if (themePreference === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themePreference]);

  // 1. Listen for Supabase Auth changes on startup
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user;
      if (user) {
        (async () => {
          try {
            // Fetch profile details from Supabase
            const profile = await getUserProfile(user.id);
            if (profile) {
              setCurrentUser({
                id: user.id,
                email: user.email || '',
                name: profile.name,
                avatar: profile.avatar,
              });
              setCurrencyCode(profile.currencyCode || 'INR');
              setThemePreference(profile.themePreference || 'light');
            } else {
              setCurrentUser({
                id: user.id,
                email: user.email || '',
                name: user.email?.split('@')[0] || 'User',
                avatar: '🦁',
              });
            }

            // Fetch user collections
            const [txs, cats, bdgs] = await Promise.all([
              getTransactions(user.id),
              getCategories(user.id),
              getBudgets(user.id)
            ]);

            setTransactions(txs);
            const validCats = cats.filter(c => c && c.name && c.name !== 'Unnamed Category');
            setCategories(validCats.length > 0 ? validCats : DEFAULT_CATEGORIES);
            setBudgets(bdgs);

            if (isSupabaseLive) {
              showNotification('Connected to cloud database.', 'success');
            } else if (isDevSandbox) {
              showNotification('Development Sandbox active. Data is stored only in this browser.', 'success');
            }
          } catch (err) {
            console.error('Error synchronizing with Supabase:', err);
            showNotification('Failed to sync cloud database.', 'error');
          }
        })();
      } else {
        setCurrentUser(null);
        setTransactions([]);
        setCategories([]);
        setBudgets([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Synchronize profile changes back to Supabase
  useEffect(() => {
    if (!currentUser) return;
    const uid = currentUser.id;
    if (uid) {
      updateUserProfile(uid, {
        name: currentUser.name,
        email: currentUser.email,
        avatar: currentUser.avatar,
        currencyCode,
        themePreference
      }).catch((err) => console.error('Error syncing user profile to Supabase:', err));
    }
  }, [currentUser, currencyCode, themePreference]);

  // Helper currency getters
  const currencySymbol = useMemo(() => {
    return CURRENCIES.find((c) => c.code === currencyCode)?.symbol || '$';
  }, [currencyCode]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const formatVal = (val: number): string => {
    return val.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Mutators for Transactions
  const handleAddTransaction = async (newTx: Omit<Transaction, 'id' | 'createdAt'>) => {
    const tx: Transaction = {
      ...newTx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    setTransactions((prev) => [tx, ...prev]);
    showNotification(`Recorded transaction: ${tx.description}`, 'success');

    const uid = currentUser?.id;
    if (uid) {
      try {
        await addTransaction(uid, tx);
      } catch (err) {
        console.error('Error adding transaction:', err);
      }
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showNotification('Deleted transaction entry.', 'info');

    const uid = currentUser?.id;
    if (uid) {
      try {
        await deleteTransaction(uid, id);
      } catch (err) {
        console.error('Error deleting transaction:', err);
      }
    }
  };

  const handleUpdateTransaction = async (id: string, updated: Partial<Transaction>) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
    );
    showNotification('Updated transaction successfully.', 'success');

    const uid = currentUser?.id;
    if (uid) {
      try {
        await updateTransaction(uid, id, updated);
      } catch (err) {
        console.error('Error updating transaction:', err);
      }
    }
  };

  // Mutators for Budgets
  const handleAddBudget = async (newB: Omit<Budget, 'id'>) => {
    const b: Budget = {
      ...newB,
      id: `b-${Date.now()}`,
    };
    setBudgets((prev) => [...prev, b]);
    showNotification(`Configured new budget limit: ${b.name}`, 'success');

    const uid = currentUser?.id;
    if (uid) {
      try {
        await addBudget(uid, b);
      } catch (err) {
        console.error('Error adding budget:', err);
      }
    }
  };

  const handleDeleteBudget = async (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    showNotification('Deleted budget target limit.', 'info');

    const uid = currentUser?.id;
    if (uid) {
      try {
        await deleteBudget(uid, id);
      } catch (err) {
        console.error('Error deleting budget:', err);
      }
    }
  };

  const handleUpdateBudget = async (id: string, updated: Partial<Budget>) => {
    setBudgets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updated } : b))
    );
    showNotification('Updated budget settings.', 'success');

    const uid = currentUser?.id;
    if (uid) {
      try {
        await updateBudget(uid, id, updated);
      } catch (err) {
        console.error('Error updating budget:', err);
      }
    }
  };

  // Mutators for Categories
  const handleAddCategory = async (newCat: Omit<Category, 'id'>) => {
    const cat: Category = {
      ...newCat,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, cat]);
    showNotification(`Created Category: ${cat.name}`, 'success');

    const uid = currentUser?.id;
    if (uid) {
      try {
        await addCategory(uid, cat);
      } catch (err) {
        console.error('Error adding category:', err);
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showNotification('Deleted category.', 'info');

    const uid = currentUser?.id;
    if (uid) {
      try {
        await deleteCategory(uid, id);
      } catch (err) {
        console.error('Error deleting category:', err);
      }
    }
  };

  const handleUpdateCategory = async (id: string, updated: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );
    showNotification('Updated category details.', 'success');

    const uid = currentUser?.id;
    if (uid) {
      try {
        await updateCategory(uid, id, updated);
      } catch (err) {
        console.error('Error updating category:', err);
      }
    }
  };

  // System Settings utilities
  const handleExportBackup = () => {
    try {
      const dataStr = JSON.stringify({
        transactions,
        categories,
        budgets,
        currencyCode,
        themePreference,
        version: '2.0',
        exportedAt: new Date().toISOString(),
      }, null, 2);

      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `finance_tracker_backup_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showNotification('Downloaded backup file!', 'success');
    } catch (err) {
      showNotification('Backup export failed.', 'error');
    }
  };

  const handleImportBackup = async (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed && Array.isArray(parsed.transactions)) {
        setTransactions(parsed.transactions);
        if (Array.isArray(parsed.categories)) {
          setCategories(parsed.categories);
        }
        if (Array.isArray(parsed.budgets)) {
          setBudgets(parsed.budgets);
        }
        if (parsed.currencyCode) {
          setCurrencyCode(parsed.currencyCode);
        }
        if (parsed.themePreference) {
          setThemePreference(parsed.themePreference);
        }

        const uid = currentUser?.id;
        if (uid) {
          for (const tx of parsed.transactions) {
            await addTransaction(uid, tx);
          }
          if (Array.isArray(parsed.categories)) {
            for (const cat of parsed.categories) {
              await addCategory(uid, cat);
            }
          }
          if (Array.isArray(parsed.budgets)) {
            for (const b of parsed.budgets) {
              await addBudget(uid, b);
            }
          }
        }

        showNotification('Database restored and synced to cloud!', 'success');
      } else {
        showNotification('Malformed backup JSON structure.', 'error');
      }
    } catch (err) {
      console.error('Import error:', err);
      showNotification('Failed to process backup file.', 'error');
    }
  };

  const handleWipeData = async () => {
    setTransactions([]);
    setBudgets([]);
    setCategories(DEFAULT_CATEGORIES);
    setCurrencyCode('INR');
    setThemePreference('light');
    showNotification('Wiped local workspace databases.', 'info');

    const uid = currentUser?.id;
    if (uid) {
      try {
        await wipeUserData(uid);
        showNotification('Wiped cloud database records.', 'info');
      } catch (err) {
        console.error('Error wiping data:', err);
      }
    }
  };

  const handleLoadDemoTemplate = async () => {
    setTransactions(DEFAULT_TRANSACTIONS);
    setBudgets(DEFAULT_BUDGETS);
    setCategories(DEFAULT_CATEGORIES);
    showNotification('Seeded playground data templates!', 'success');

    const uid = currentUser?.id;
    if (uid) {
      try {
        await seedDemoData(uid);
        showNotification('Seeded playgound data templates on the cloud!', 'success');
      } catch (err) {
        console.error('Error seeding data:', err);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setCurrentUser(null);
      showNotification('Successfully signed out of secure session.', 'info');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Switch tab navigate callback
  const handleNavigateToTab = (tabName: string) => {
    if (activeTab !== 'help') {
      setPreviousTab(activeTab);
    }
    setActiveTab(tabName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!currentUser) {
    return (
      <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-white font-sans antialiased">
        {isDevSandbox && (
          <div className="bg-amber-500 text-white text-center py-2 px-4 text-xs font-bold tracking-wide select-none shadow-sm relative z-50">
            Development Sandbox — Data stored only in this browser
          </div>
        )}
        {/* Alerts wrapper */}
        {notification && (
          <div className="fixed top-4 right-4 z-50 max-w-sm">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold shadow-md ${
                notification.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : notification.type === 'error'
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-indigo-50 text-indigo-800 border-indigo-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <Info size={14} />
                <span>{notification.message}</span>
              </div>
              <button onClick={() => setNotification(null)} className="ml-2 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={12} />
              </button>
            </motion.div>
          </div>
        )}
        <AuthScreen
          onLoginSuccess={(user) => {
            setCurrentUser(user);
          }}
          showNotification={showNotification}
        />
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-white font-sans antialiased pb-16 transition-colors duration-200">
      {isDevSandbox && (
        <div className="bg-amber-500 text-white text-center py-2 px-4 text-xs font-bold tracking-wide select-none shadow-sm relative z-50">
          Development Sandbox — Data stored only in this browser
        </div>
      )}
      
      {/* 1. Header/Navigation Brand Layout */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-xs flex items-center justify-center">
              <Coins size={22} className="animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest leading-none">
                FINANCE DASHBOARD
              </span>
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-0.5">
                Expense Tracker
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Global Search box in Header */}
            <div className="relative max-w-xs w-full hidden md:block">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search everything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/40 focus:border-blue-500 transition-all font-semibold"
              />
            </div>

            {/* Real-time digital clock */}
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 font-mono text-[11px] shadow-xs font-bold">
              <Clock size={13} className="text-blue-500 animate-pulse" />
              <span>
                {currentTime.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>

            {/* Interactive Help Center Button */}
            <button
              onClick={() => handleNavigateToTab('help')}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer flex items-center justify-center shrink-0 gap-1.5"
              title="Open Interactive Help Center"
              id="header-help-center-btn"
            >
              <HelpCircle size={15} className="text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:inline text-xs font-bold px-0.5">Help</span>
            </button>

            {/* Quick Theme Toggle Button */}
            <button
              onClick={() => {
                const newTheme = themePreference === 'dark' ? 'light' : 'dark';
                setThemePreference(newTheme);
                showNotification(`Theme switched to ${newTheme} mode!`, 'info');
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer flex items-center justify-center shrink-0"
              title={`Switch to ${themePreference === 'dark' ? 'light' : 'dark'} mode`}
            >
              {themePreference === 'dark' ? <Sun size={15} className="text-amber-500 animate-pulse" /> : <Moon size={15} className="text-indigo-600" />}
            </button>

            {/* User Profile avatar capsule */}
            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3.5">
              <div className="flex items-center gap-2">
                <span className="text-xl w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 flex items-center justify-center select-none shadow-xs">
                  {currentUser.avatar}
                </span>
                <span className="hidden lg:inline text-xs font-bold text-slate-700 dark:text-slate-300 max-w-[110px] truncate" title={currentUser.name}>
                  {currentUser.name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={15} />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* 2. Main Content Wrapper */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        
        {/* Dynamic Alerts */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-semibold shadow-xs ${
                notification.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-950'
                  : notification.type === 'error'
                    ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-950'
                    : 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-950'
              }`}
            >
              <div className="flex items-center gap-2">
                <Info size={14} />
                <span>{notification.message}</span>
              </div>
              <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X size={12} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Horizontal Navigation Pills matching exact layout */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2.5 scrollbar-none">
          <button
            onClick={() => handleNavigateToTab('dashboard')}
            className={`px-4.5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <LayoutDashboard size={14} /> Dashboard
          </button>
          <button
            onClick={() => handleNavigateToTab('transactions')}
            className={`px-4.5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'transactions'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Receipt size={14} /> Transactions Ledger
          </button>
          <button
            onClick={() => handleNavigateToTab('budgets')}
            className={`px-4.5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'budgets'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <PiggyBank size={14} /> Budgets
          </button>
          <button
            onClick={() => handleNavigateToTab('categories')}
            className={`px-4.5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'categories'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <FolderOpen size={14} /> Categories
          </button>
          <button
            onClick={() => handleNavigateToTab('analytics')}
            className={`px-4.5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <LineChart size={14} /> Rich Analytics
          </button>
          <button
            onClick={() => handleNavigateToTab('profile')}
            className={`px-4.5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'profile'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <User size={14} /> Profile preferences
          </button>
          <button
            onClick={() => handleNavigateToTab('settings')}
            className={`px-4.5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Settings size={14} /> Settings Control
          </button>
        </div>

        {/* 3. Core Tab Renders inside dynamic transitions */}
        <div className="pt-2">
          {activeTab === 'dashboard' && (
            <DashboardTab
              transactions={transactions}
              categories={categories}
              budgets={budgets}
              currencySymbol={currencySymbol}
              formatVal={formatVal}
              onNavigateToTab={handleNavigateToTab}
              onDeleteTransaction={handleDeleteTransaction}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsTab
              transactions={transactions}
              categories={categories}
              currencySymbol={currencySymbol}
              formatVal={formatVal}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onUpdateTransaction={handleUpdateTransaction}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
            />
          )}

          {activeTab === 'budgets' && (
            <BudgetsTab
              budgets={budgets}
              categories={categories}
              transactions={transactions}
              currencySymbol={currencySymbol}
              formatVal={formatVal}
              onAddBudget={handleAddBudget}
              onDeleteBudget={handleDeleteBudget}
              onUpdateBudget={handleUpdateBudget}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesTab
              categories={categories}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
              onUpdateCategory={handleUpdateCategory}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab
              transactions={transactions}
              categories={categories}
              currencySymbol={currencySymbol}
              formatVal={formatVal}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              currentUser={currentUser}
              onUpdateUser={setCurrentUser}
              currencyCode={currencyCode}
              onUpdateCurrency={setCurrencyCode}
              themePreference={themePreference}
              onUpdateTheme={setThemePreference}
              showNotification={showNotification}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
              onWipeData={handleWipeData}
              onLoadDemoTemplate={handleLoadDemoTemplate}
              showNotification={showNotification}
            />
          )}

          {activeTab === 'help' && (
            <HelpCenterTab
              onNavigateToTab={handleNavigateToTab}
              onBackToPrevious={() => handleNavigateToTab(previousTab)}
              showNotification={showNotification}
              onOpenFeedback={() => setIsFeedbackOpen(true)}
            />
          )}
        </div>

      </main>

      {/* Footer Section */}
      <footer className="mt-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Left Column: Logo, name and tagline */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 text-white rounded-xl flex items-center justify-center">
                  <Coins size={18} />
                </div>
                <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Expense Tracker
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-sm">
                Track smarter. Spend better. Your simple, single-currency assistant to manage personal finance, ledger transactions, and smart budgets effortlessly.
              </p>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Version 1.0.0 (Latest)</span>
              </div>
            </div>

            {/* Middle Column: Quick Links & Support */}
            <div className="md:col-span-4 grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">
                  Quick Links
                </h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => handleNavigateToTab('dashboard')}
                      className={`text-xs ${
                        activeTab === 'dashboard'
                          ? 'text-blue-600 dark:text-blue-400 font-bold'
                          : 'text-slate-500 dark:text-slate-400 hover:text-blue-500'
                      } cursor-pointer transition-colors`}
                    >
                      Dashboard
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleNavigateToTab('transactions')}
                      className={`text-xs ${
                        activeTab === 'transactions'
                          ? 'text-blue-600 dark:text-blue-400 font-bold'
                          : 'text-slate-500 dark:text-slate-400 hover:text-blue-500'
                      } cursor-pointer transition-colors`}
                    >
                      Transactions
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleNavigateToTab('budgets')}
                      className={`text-xs ${
                        activeTab === 'budgets'
                          ? 'text-blue-600 dark:text-blue-400 font-bold'
                          : 'text-slate-500 dark:text-slate-400 hover:text-blue-500'
                      } cursor-pointer transition-colors`}
                    >
                      Budgets
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleNavigateToTab('analytics')}
                      className={`text-xs ${
                        activeTab === 'analytics'
                          ? 'text-blue-600 dark:text-blue-400 font-bold'
                          : 'text-slate-500 dark:text-slate-400 hover:text-blue-500'
                      } cursor-pointer transition-colors`}
                    >
                      Reports
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">
                  Support
                </h3>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => handleNavigateToTab('help')}
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-500 cursor-pointer transition-colors text-left"
                    >
                      Help Center
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setIsSupportOpen(true)}
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-500 cursor-pointer transition-colors text-left"
                    >
                      Contact Support
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setIsFeedbackOpen(true)}
                      className="text-xs text-slate-500 dark:text-slate-400 hover:text-blue-500 cursor-pointer transition-colors text-left"
                    >
                      Send Feedback
                    </button>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column: Social Links & App Status */}
            <div className="md:col-span-3 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Social Links & Connect
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                Connect with us for latest updates and finance tips.
              </p>
              <div className="flex items-center gap-3">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                  title="GitHub"
                >
                  <Github size={16} />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-blue-400 dark:hover:text-blue-400 transition-all"
                  title="Twitter"
                >
                  <Twitter size={16} />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-400 transition-all"
                  title="LinkedIn"
                >
                  <Linkedin size={16} />
                </a>
              </div>
            </div>

          </div>

          {/* Bottom Bar: Copyright and Legal */}
          <div className="mt-12 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              © 2026 Expense Tracker. All rights reserved. Built with ❤️ in India.
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => showNotification('Privacy Policy: All data stays secure in your cloud database.', 'info')}
                className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-all"
              >
                Privacy Policy
              </button>
              <span className="text-slate-200 dark:text-slate-800">•</span>
              <button
                onClick={() => showNotification('Terms of Service: Intended for personal finance tracking.', 'info')}
                className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-all"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Stunning Feedback Modal Overlay */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        currentUser={currentUser}
        showNotification={showNotification}
      />

      {/* Modern Contact Support Modal Overlay */}
      <ContactSupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        showNotification={showNotification}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        onNavigateToHelp={() => handleNavigateToTab('help')}
      />
    </div>
  );
}
