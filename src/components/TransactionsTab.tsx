import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Trash2, 
  Edit, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  Plus, 
  Download, 
  Upload, 
  Calendar,
  DollarSign
} from 'lucide-react';
import { Transaction, Category } from '../types';
import CategoryIcon from './CategoryIcon';

interface TransactionsTabProps {
  transactions: Transaction[];
  categories: Category[];
  currencySymbol: string;
  formatVal: (val: number) => string;
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onDeleteTransaction: (id: string) => void;
  onUpdateTransaction: (id: string, updated: Partial<Transaction>) => void;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({
  transactions,
  categories,
  currencySymbol,
  formatVal,
  onAddTransaction,
  onDeleteTransaction,
  onUpdateTransaction,
  searchQuery,
  onSearchQueryChange,
}) => {
  // New Transaction Form States
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formType, setFormType] = useState<'income' | 'expense'>('expense');
  const [formCategory, setFormCategory] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formNotes, setFormNotes] = useState('');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState<'income' | 'expense'>('expense');
  const [editCategory, setEditCategory] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Filters
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  // Auto select first category appropriate to type
  React.useEffect(() => {
    const appropriateCats = categories.filter(c => c.type === formType);
    if (appropriateCats.length > 0) {
      setFormCategory(appropriateCats[0].id);
    }
  }, [formType, categories]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formAmount) return;

    onAddTransaction({
      type: formType,
      amount: parseFloat(formAmount),
      category: formCategory,
      description: formTitle,
      date: formDate,
      notes: formNotes || undefined,
    });

    // Reset Form
    setFormTitle('');
    setFormAmount('');
    setFormNotes('');
  };

  const handleStartEdit = (tx: Transaction) => {
    setEditingId(tx.id);
    setEditTitle(tx.description);
    setEditAmount(tx.amount.toString());
    setEditType(tx.type);
    setEditCategory(tx.category);
    setEditDate(tx.date);
    setEditNotes(tx.notes || '');
  };

  const handleSaveEdit = (id: string) => {
    if (!editTitle || !editAmount) return;
    onUpdateTransaction(id, {
      description: editTitle,
      amount: parseFloat(editAmount),
      type: editType,
      category: editCategory,
      date: editDate,
      notes: editNotes || undefined,
    });
    setEditingId(null);
  };

  // Filter and Sort implementation
  const processedTransactions = useMemo(() => {
    let result = [...transactions];

    // Global Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(tx => {
        const catName = categories.find(c => c.id === tx.category)?.name || '';
        return (
          tx.description.toLowerCase().includes(q) ||
          catName.toLowerCase().includes(q) ||
          (tx.notes && tx.notes.toLowerCase().includes(q))
        );
      });
    }

    // Type filter
    if (filterType !== 'all') {
      result = result.filter(tx => tx.type === filterType);
    }

    // Category filter
    if (filterCategory !== 'all') {
      result = result.filter(tx => tx.category === filterCategory);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
      }
      if (sortBy === 'oldest') {
        return a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt);
      }
      if (sortBy === 'highest') {
        return b.amount - a.amount;
      }
      if (sortBy === 'lowest') {
        return a.amount - b.amount;
      }
      return 0;
    });

    return result;
  }, [transactions, searchQuery, filterType, filterCategory, sortBy, categories]);

  // Pagination bounds
  const totalPages = Math.max(1, Math.ceil(processedTransactions.length / rowsPerPage));
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return processedTransactions.slice(start, start + rowsPerPage);
  }, [processedTransactions, currentPage, rowsPerPage]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Add Transaction Card - Left Form (Col-span 4) */}
      <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mb-5">
          <Sparkles size={16} className="text-blue-500 animate-pulse" />
          Add Transaction
        </h3>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Title input */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Dinner with friends"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Amount input */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Amount ({currencySymbol})
            </label>
            <input
              type="number"
              required
              min="0.01"
              step="any"
              placeholder="0.00"
              value={formAmount}
              onChange={(e) => setFormAmount(e.target.value)}
              className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Transaction Type selection */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setFormType('expense')}
              className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                formType === 'expense'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setFormType('income')}
              className={`py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                formType === 'income'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Income
            </button>
          </div>

          {/* Category selection */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Category
            </label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white text-xs focus:outline-none cursor-pointer font-semibold"
            >
              {categories
                .filter((c) => c.type === formType)
                .map((c) => (
                  <option key={c.id} value={c.id} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Date Picker */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Date
            </label>
            <input
              type="date"
              required
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950 focus:border-blue-500 transition-all font-semibold"
            />
          </div>

          {/* Optional Notes */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Notes (Optional)
            </label>
            <textarea
              placeholder="e.g. Shared with roommates"
              rows={2}
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950 focus:border-blue-500 transition-all resize-none font-semibold"
            />
          </div>

          {/* Submit & Reset Button block */}
          <div className="flex gap-2.5 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> Add Transaction
            </button>
            <button
              type="button"
              onClick={() => {
                setFormTitle('');
                setFormAmount('');
                setFormNotes('');
              }}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold rounded-2xl transition-all cursor-pointer"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Transactions Ledger - Right List (Col-span 8) */}
      <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-[580px]">
        <div>
          {/* Header Title with Counts */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Transactions Ledger
                <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                  {processedTransactions.length} items
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Review and filter your financial records
              </p>
            </div>
          </div>

          {/* Filters Bar Row */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
            {/* Global Search inside ledger */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search description..."
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none font-semibold"
              />
            </div>

            {/* Type selector */}
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as any);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none cursor-pointer font-semibold"
            >
              <option value="all" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">All Types</option>
              <option value="income" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Inflow (Income)</option>
              <option value="expense" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Outflow (Expense)</option>
            </select>

            {/* Category selection */}
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none cursor-pointer font-semibold"
            >
              <option value="all" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                  {c.name} ({c.type})
                </option>
              ))}
            </select>

            {/* Sort order selection */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-800 dark:text-white focus:outline-none cursor-pointer font-semibold"
            >
              <option value="newest" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Newest First</option>
              <option value="oldest" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Oldest First</option>
              <option value="highest" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Highest Amount</option>
              <option value="lowest" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Lowest Amount</option>
            </select>
          </div>

          {/* Ledger Table Rows */}
          <div className="space-y-3 min-h-[360px]">
            {paginatedTransactions.length === 0 ? (
              <div className="text-center py-20 flex flex-col items-center justify-center text-slate-400">
                <Filter size={32} className="mb-2 opacity-50" />
                <p className="text-xs font-semibold text-slate-500">No items match your filters.</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Try widening filters or clear search values.</p>
              </div>
            ) : (
              paginatedTransactions.map((tx) => {
                const isEditing = editingId === tx.id;
                const cat = categories.find((c) => c.id === (isEditing ? editCategory : tx.category)) || {
                  name: 'Other',
                  colorClass: 'bg-slate-50 dark:bg-slate-800',
                  textClass: 'text-slate-600 dark:text-slate-400',
                  borderClass: 'border-slate-100 dark:border-slate-800',
                  iconName: 'HelpCircle',
                };

                return (
                  <div
                    key={tx.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 rounded-2xl transition-all ${
                      isEditing ? 'border-blue-300 ring-2 ring-blue-50 dark:ring-blue-950 bg-white dark:bg-slate-900' : ''
                    }`}
                  >
                    {isEditing ? (
                      /* Editing fields row layout */
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center w-full">
                        <div className="sm:col-span-4">
                          <input
                            type="text"
                            required
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            type="number"
                            required
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="w-full px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-white cursor-pointer font-semibold"
                          >
                            {categories.map((c) => (
                              <option key={c.id} value={c.id} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="sm:col-span-2 col-span-1">
                          <input
                            type="date"
                            required
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                          />
                        </div>
                        <div className="sm:col-span-2 flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleSaveEdit(tx.id)}
                            className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all cursor-pointer"
                            title="Save Changes"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg transition-all cursor-pointer"
                            title="Cancel Edit"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Display row layout */
                      <>
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-10 h-10 rounded-xl flex items-center justify-center border text-lg select-none ${cat.colorClass} ${cat.borderClass}`}
                          >
                            <CategoryIcon name={cat.iconName} size={18} className={cat.textClass} />
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-slate-900 dark:text-white max-w-[200px] truncate" title={tx.description}>
                                {tx.description}
                              </p>
                              {tx.notes && (
                                <span className="text-[9px] font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 px-1.5 py-0.2 rounded border border-indigo-100 dark:border-indigo-950 max-w-[120px] truncate" title={tx.notes}>
                                  {tx.notes}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                              {cat.name} • {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {tx.type === 'income' ? '+' : '-'}{currencySymbol}{formatVal(tx.amount)}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleStartEdit(tx)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-all cursor-pointer"
                              title="Edit"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={() => onDeleteTransaction(tx.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer RowsPerPage & Page Navigation Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-2">
            <span>Rows per page</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer font-semibold"
            >
              <option value={4} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">4</option>
              <option value={8} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">8</option>
              <option value={12} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">12</option>
              <option value={20} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">20</option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-all"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsTab;
