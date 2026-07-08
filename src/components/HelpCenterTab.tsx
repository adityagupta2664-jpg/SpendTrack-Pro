import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  BookOpen,
  HelpCircle,
  Coins,
  Shield,
  FolderOpen,
  PiggyBank,
  User,
  ChevronDown,
  ChevronRight,
  Info,
  LifeBuoy,
  Compass,
  MessageSquare,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';

interface HelpCenterTabProps {
  onNavigateToTab: (tab: string) => void;
  onBackToPrevious: () => void;
  showNotification: (message: string, type: 'success' | 'error' | 'info') => void;
  onOpenFeedback: () => void;
}

interface HelpSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  category: string;
  content: string;
  subsections?: { title: string; body: string; steps?: string[] }[];
}

export default function HelpCenterTab({ onNavigateToTab, onBackToPrevious, showNotification, onOpenFeedback }: HelpCenterTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSectionId, setActiveSectionId] = useState<string>('getting-started');
  const [expandedSubsections, setExpandedSubsections] = useState<Record<string, boolean>>({});
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);

  // Load feedbacks locally when section changes to inbox
  React.useEffect(() => {
    if (activeSectionId === 'inbox') {
      const list = JSON.parse(localStorage.getItem('sb-user-feedbacks') || '[]');
      setFeedbacks([...list].reverse());
    }
  }, [activeSectionId]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('hemanttech2654@gmail.com');
    setCopiedEmail(true);
    showNotification('Support Email copied to clipboard!', 'success');
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const helpSections = useMemo<HelpSection[]>(() => [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <BookOpen size={16} className="text-blue-500" />,
      category: 'Basics',
      content: 'Welcome to Expense Tracker! Managing your personal finances has never been simpler. Follow this quick setup guide to begin tracking your expenses, monitoring budgets, and understanding your spending habits.',
      subsections: [
        {
          title: 'Quick Onboarding',
          body: 'Expense Tracker helps you log ledger transactions, build categories, and set strict budgets to save money. Here are the 3 core steps to master your finance:',
          steps: [
            'Go to the "Categories" tab to inspect or customize your transaction categories.',
            'Record your first transaction in the "Transactions Ledger" tab.',
            'Set spending targets in the "Budgets" tab to prevent overspending.'
          ]
        }
      ]
    },
    {
      id: 'transactions',
      title: 'How to add, edit, and delete transactions',
      icon: <Coins size={16} className="text-amber-500" />,
      category: 'Transactions',
      content: 'Your transaction history is the core ledger of the application. Keep a granular log of every single income and expense to stay financially aware.',
      subsections: [
        {
          title: 'Adding a Transaction',
          body: 'To record a new transaction, navigate to the "Transactions Ledger" tab or click on the Dashboard quick links:',
          steps: [
            'Click on "Transactions Ledger" in the top navigation bar.',
            'Fill in the "Record New Transaction" form on the left.',
            'Specify the Amount, Type (Income or Expense), Date, Category, and a brief Description.',
            'Click the "Record Entry" button to save it in your database.'
          ]
        },
        {
          title: 'Editing an Existing Transaction',
          body: 'Made a typo or need to adjust an entry? No worries:',
          steps: [
            'Go to the "Transactions Ledger" tab.',
            'In the history list, locate the transaction you want to modify.',
            'Click the Edit (pencil) icon on the right side of that transaction.',
            'An edit dialog will appear with current details. Modify the values and click "Update Transaction" to save changes.'
          ]
        },
        {
          title: 'Deleting a Transaction',
          body: 'To remove an entry permanently from your history:',
          steps: [
            'In the "Transactions Ledger" list, click the Delete (trash bin) icon next to the transaction.',
            'The item will be immediately removed, and your dashboard balances will update dynamically.'
          ]
        }
      ]
    },
    {
      id: 'categories',
      title: 'How to create categories',
      icon: <FolderOpen size={16} className="text-emerald-500" />,
      category: 'Categories',
      content: 'Categories allow you to organize your spending into logical groups like Food, Rent, Entertainment, and Salaries for clean pie charts and analytics.',
      subsections: [
        {
          title: 'Creating and Editing Categories',
          body: 'Personalize your taxonomy with custom categories:',
          steps: [
            'Navigate to the "Categories" tab.',
            'To add a new category, use the form on the left. Pick an appropriate name, select a visual emoji representation as an icon, and choose a distinct color theme.',
            'Click "Create Category" to save.',
            'You can also modify or delete any existing user-created category using the Edit or Delete action buttons next to the categories list.'
          ]
        }
      ]
    },
    {
      id: 'budgets',
      title: 'How to create and manage budgets',
      icon: <PiggyBank size={16} className="text-purple-500" />,
      category: 'Budgets',
      content: 'Set monthly boundaries for specific categories. The app compares your actual expenses with the target limits in real time, notifying you if you are close to overspending.',
      subsections: [
        {
          title: 'Creating a Monthly Budget',
          body: 'Avoid impulse buys by setting hard budget caps:',
          steps: [
            'Click the "Budgets" tab.',
            'Use the "Create New Budget Cap" form.',
            'Choose the Category you want to limit, set the maximum monthly spending Limit (e.g. 5,000 INR), and save.',
            'Your active budgets will appear as progress bars, automatically fetching matching expenses of the current month to show percentage consumption.'
          ]
        },
        {
          title: 'Understanding the Color-Coded Warning Levels',
          body: 'Our budget tracker uses smart colors to indicate status: Green represents safe spending, Yellow triggers when you cross 80% of your threshold, and Crimson indicates you have exceeded your target cap.'
        }
      ]
    },
    {
      id: 'currency',
      title: 'How currency settings work',
      icon: <Coins size={16} className="text-indigo-500" />,
      category: 'Preferences',
      content: 'Configure how amounts are styled and displayed across your entire financial space. The application dynamically adjusts formatters for consistent representations.',
      subsections: [
        {
          title: 'Switching Currency Symbols',
          body: 'We support international currency formats. To change the active currency:',
          steps: [
            'Navigate to the "Profile Preferences" tab.',
            'Locate the "Preferred Currency Display" selector.',
            'Pick your preference: Indian Rupee (₹), US Dollar ($), Euro (€), British Pound (£), Japanese Yen (¥), or Swiss Franc (CHF).',
            'All dashboard balances, ledger items, budgets, and analytics charts will instantly switch to display your new preferred currency.'
          ]
        }
      ]
    },
    {
      id: 'profile-settings',
      title: 'How account and profile settings work',
      icon: <User size={16} className="text-rose-500" />,
      category: 'Account',
      content: 'Customize your dashboard profile, visual layout theme, and account state to make the app feel truly yours.',
      subsections: [
        {
          title: 'Profile Customization',
          body: 'Go to the "Profile Preferences" tab to manage your configuration:',
          steps: [
            'Change your Display Name to personalize the dashboard greeting.',
            'Select a custom Avatar Emoji that represents you.',
            'Switch between Light Mode (optimal for high clarity) and Dark Mode (soothing slate color for eye safety).'
          ]
        }
      ]
    },
    {
      id: 'privacy-security',
      title: 'Data privacy and security',
      icon: <Shield size={16} className="text-teal-500" />,
      category: 'Security',
      content: 'We treat your financial ledger with extreme care. Your monetary habits are highly private, and our security models are designed to respect that.',
      subsections: [
        {
          title: 'Where is my data stored?',
          body: 'Depending on your session status, your data is saved securely as follows:',
          steps: [
            'Supabase Cloud Database: If logged in, your entries are stored in a secure cloud container tied to your email. Data is transmitted via SSL encryption.',
            'Development Sandbox: If you are using the app in Sandbox mode, all transactions, categories, and settings remain local. They are stored inside your browser\'s secure LocalStorage and never leave your machine.'
          ]
        }
      ]
    },
    {
      id: 'faqs',
      title: 'Frequently Asked Questions (FAQs)',
      icon: <HelpCircle size={16} className="text-sky-500" />,
      category: 'Support',
      content: 'Quick answers to common questions about operating Expense Tracker.',
      subsections: [
        {
          title: 'Can I use this app across multiple devices?',
          body: 'Yes! Create a secure account via email login, and your dashboard will immediately sync your ledger and budgets in real time on any mobile or desktop screen.'
        },
        {
          title: 'Can I back up my transactions offline?',
          body: 'Absolutely. Navigate to the "Settings Control" tab. Under Data Management, you can click "Export Backup" to download your complete history as a structured JSON file. You can restore this file at any time using the "Import Backup" feature.'
        },
        {
          title: 'My budget bar is showing 0% usage. Why?',
          body: 'Budget calculations only look at transactions of the "Expense" type. Double-check if you logged your items as "Income" or if the transaction date lies outside the current calendar month.'
        }
      ]
    },
    {
      id: 'inbox',
      title: 'Developer Support Inbox',
      icon: <MessageSquare size={16} className="text-rose-500" />,
      category: 'Admin Panel',
      content: 'Real-time dashboard of all user-submitted feedback, satisfaction ratings, bug reports, and support tickets.'
    }
  ], []);

  // Filter content based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return helpSections;

    const query = searchQuery.toLowerCase();
    return helpSections.filter((section) => {
      const titleMatch = section.title.toLowerCase().includes(query);
      const categoryMatch = section.category.toLowerCase().includes(query);
      const descMatch = section.content.toLowerCase().includes(query);
      
      const subsectionMatch = section.subsections?.some(
        (sub) =>
          sub.title.toLowerCase().includes(query) ||
          sub.body.toLowerCase().includes(query) ||
          sub.steps?.some((step) => step.toLowerCase().includes(query))
      );

      return titleMatch || categoryMatch || descMatch || subsectionMatch;
    });
  }, [helpSections, searchQuery]);

  const toggleSubsection = (key: string) => {
    setExpandedSubsections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-50 dark:bg-slate-950/20 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-6"
    >
      {/* 1. Upper Breadcrumb & Back Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBackToPrevious}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs font-bold transition-all cursor-pointer group"
          id="back-to-app-btn"
        >
          <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 group-hover:-translate-x-0.5 transition-transform">
            <ArrowLeft size={14} />
          </div>
          <span>Back to Ledger Space</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
            <Sparkles size={11} className="animate-spin-slow" /> Interactive Documentation
          </span>
        </div>
      </div>

      {/* 2. Hero Header Banner */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-xl pointer-events-none -ml-12 -mb-12" />
        
        <div className="relative max-w-2xl space-y-3">
          <div className="inline-flex p-2 bg-white/10 rounded-xl mb-1">
            <LifeBuoy size={20} className="text-blue-200" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            How can we help you today?
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-medium">
            Browse guides on transaction controls, budget targets, category configuration, and security models.
          </p>
        </div>
      </div>

      {/* 3. Search Bar Area */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800/80 shadow-xs">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search for help... (e.g. 'how to delete transaction', 'category icon', 'backup data')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950/30 focus:border-blue-500 transition-all"
            id="full-help-search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <XIcon size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 4. Two Column Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Topic Navigation Menu */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-4 space-y-1">
          <span className="px-2.5 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2.5">
            Help Categories
          </span>
          {filteredSections.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No matching sections</p>
          ) : (
            filteredSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSectionId(section.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  activeSectionId === section.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1 rounded-lg shrink-0 ${activeSectionId === section.id ? 'bg-white/20' : 'bg-slate-50 dark:bg-slate-800'}`}>
                    {section.icon}
                  </div>
                  <span className="truncate pr-1">{section.title}</span>
                </div>
                <ChevronRight size={13} className={`shrink-0 ${activeSectionId === section.id ? 'opacity-100' : 'opacity-40'}`} />
              </button>
            ))
          )}

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-center">
            <button
              onClick={onOpenFeedback}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all flex items-center gap-2 cursor-pointer"
            >
              <MessageSquare size={14} className="text-indigo-500" />
              <span>Submit Support Ticket</span>
            </button>
          </div>
        </div>

        {/* Right Side: Selected Content view */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-6 space-y-6 min-h-[400px]">
          {activeSectionId && filteredSections.some(s => s.id === activeSectionId) ? (
            (() => {
              const section = filteredSections.find(s => s.id === activeSectionId)!;
              return (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  {/* Category Pill + Header */}
                  <div className="space-y-2">
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                      {section.category}
                    </span>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                      {section.title}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed font-medium pt-1">
                      {section.content}
                    </p>
                  </div>

                  {section.id === 'inbox' ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                          Total Received: {feedbacks.length}
                        </span>
                        {feedbacks.length > 0 && (
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to clear all received feedbacks and tickets from your browser workspace?')) {
                                localStorage.removeItem('sb-user-feedbacks');
                                setFeedbacks([]);
                                showNotification('Support inbox cleared successfully.', 'success');
                              }
                            }}
                            className="text-[10px] text-rose-500 font-extrabold hover:underline cursor-pointer"
                          >
                            Clear All Logs
                          </button>
                        )}
                      </div>

                      {feedbacks.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 space-y-2">
                          <MessageSquare size={32} className="mx-auto opacity-40 animate-pulse text-indigo-500" />
                          <p className="text-xs font-bold">Your Support Inbox is Empty</p>
                          <p className="text-[10px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                            Submit some feedback or support tickets using the "Send Feedback" modal, and they will immediately appear here!
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
                          {feedbacks.map((item: any, idx: number) => {
                            const dateStr = item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A';
                            return (
                              <div
                                key={item.id || idx}
                                className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/80 relative space-y-2.5 shadow-2xs"
                              >
                                <div className="flex justify-between items-start gap-4">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">
                                      {item.rating === 1 ? '😞' : item.rating === 2 ? '😐' : item.rating === 3 ? '😊' : item.rating === 4 ? '💖' : '✨'}
                                    </span>
                                    <div>
                                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        {item.email || 'Anonymous User'}
                                      </p>
                                      <p className="text-[10px] text-slate-400">
                                        {dateStr}
                                      </p>
                                    </div>
                                  </div>
                                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                                    item.feedbackType === 'bug' ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600' :
                                    item.feedbackType === 'feature' ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-600' :
                                    item.feedbackType === 'ux' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600' :
                                    'bg-blue-50 dark:bg-blue-950/30 text-blue-600'
                                  } uppercase tracking-wider`}>
                                    {item.feedbackType || 'ux'}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium bg-white dark:bg-slate-900/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800/40 whitespace-pre-wrap">
                                  {item.message}
                                </p>
                                <div className="flex justify-end gap-3 text-[10px] pt-1">
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(JSON.stringify(item, null, 2));
                                      showNotification('Feedback detail copied to clipboard!', 'success');
                                    }}
                                    className="text-blue-500 font-bold hover:underline cursor-pointer"
                                  >
                                    Copy Raw Data
                                  </button>
                                  <button
                                    onClick={() => {
                                      const updated = feedbacks.filter((_, fIdx) => fIdx !== idx);
                                      setFeedbacks(updated);
                                      // Save reverse back
                                      localStorage.setItem('sb-user-feedbacks', JSON.stringify([...updated].reverse()));
                                      showNotification('Feedback item deleted.', 'info');
                                    }}
                                    className="text-rose-500 font-bold hover:underline cursor-pointer"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Sub-accordions */}
                      {section.subsections && (
                        <div className="space-y-4">
                          {section.subsections.map((sub, idx) => {
                            const subkey = `${section.id}-${idx}`;
                            const isExpanded = expandedSubsections[subkey] !== false; // default true

                            return (
                              <div
                                key={idx}
                                className="border border-slate-100 dark:border-slate-800/60 rounded-xl overflow-hidden bg-slate-50/30 dark:bg-slate-950/10"
                              >
                                <button
                                  onClick={() => toggleSubsection(subkey)}
                                  className="w-full flex items-center justify-between px-4 py-3 text-left font-bold text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-all cursor-pointer"
                                >
                                  <span>{sub.title}</span>
                                  {isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                                </button>

                                <AnimatePresence initial={false}>
                                  {isExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="px-4 pb-4 pt-1.5 border-t border-slate-100 dark:border-slate-800/50 space-y-3">
                                        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                                          {sub.body}
                                        </p>

                                        {sub.steps && (
                                          <ul className="space-y-2.5 pl-1.5">
                                            {sub.steps.map((step, sIdx) => (
                                              <li key={sIdx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                                <span className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-extrabold flex items-center justify-center text-[10px] shrink-0 mt-0.5 shadow-2xs">
                                                  {sIdx + 1}
                                                </span>
                                                <span className="pt-0.5">{step}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}

                  {/* Smart Navigation Link */}
                  {['transactions', 'categories', 'budgets', 'currency', 'profile-settings'].includes(section.id) && (
                    <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/60 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
                      <div className="flex items-start gap-2.5">
                        <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-blue-800 dark:text-blue-300">
                            Practice what you learn!
                          </h4>
                          <p className="text-[11px] text-blue-600 dark:text-blue-400 leading-relaxed">
                            Click below to immediately navigate to the correct feature in your ledger.
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          let targetTab = 'dashboard';
                          if (section.id === 'transactions') targetTab = 'transactions';
                          if (section.id === 'categories') targetTab = 'categories';
                          if (section.id === 'budgets') targetTab = 'budgets';
                          if (section.id === 'currency' || section.id === 'profile-settings') targetTab = 'profile';
                          onNavigateToTab(targetTab);
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs hover:shadow-sm cursor-pointer transition-all shrink-0"
                      >
                        Navigate to Feature
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })()
          ) : (
            <div className="text-center py-20 space-y-4">
              <Compass size={48} className="mx-auto text-slate-300 dark:text-slate-700 animate-pulse" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                No matching help guides
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Try selecting a help category from the sidebar or clearing your search phrase to view general documentation.
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Reset Search Filter
                </button>
              )}
            </div>
          )}
        </div>

      </div>

      {/* 5. Help Footer Support Info */}
      <div className="p-4.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <p className="font-bold text-slate-700 dark:text-slate-200">
            Need Direct Support?
          </p>
          <p className="text-[11px] leading-relaxed max-w-md">
            Click to launch a support ticket instantly. Or, copy our support email to write to us from any device.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleCopyEmail}
            className="px-3.5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-slate-700 dark:text-slate-200 transition-all text-xs flex items-center gap-1.5 cursor-pointer"
          >
            {copiedEmail ? <Check size={13} className="text-emerald-500 animate-bounce" /> : <Copy size={13} />}
            <span>{copiedEmail ? 'Email Copied!' : 'Copy Support Email'}</span>
          </button>
          <button
            onClick={onOpenFeedback}
            className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all text-xs cursor-pointer shadow-xs"
          >
            Create Support Ticket
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Minimal inline X icon to avoid import issues
function XIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
