import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  Plus, 
  AlertTriangle, 
  PieChart, 
  DollarSign,
  TrendingDown
} from 'lucide-react';
import { Budget, Category, Transaction } from '../types';
import CategoryIcon from './CategoryIcon';

interface BudgetsTabProps {
  budgets: Budget[];
  categories: Category[];
  transactions: Transaction[];
  currencySymbol: string;
  formatVal: (val: number) => string;
  onAddBudget: (budget: Omit<Budget, 'id'>) => void;
  onDeleteBudget: (id: string) => void;
  onUpdateBudget: (id: string, updated: Partial<Budget>) => void;
}

export const BudgetsTab: React.FC<BudgetsTabProps> = ({
  budgets,
  categories,
  transactions,
  currencySymbol,
  formatVal,
  onAddBudget,
  onDeleteBudget,
  onUpdateBudget,
}) => {
  // Add Budget form states
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [month, setMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM

  // Edit Budget state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editMonth, setEditMonth] = useState('');

  // Default initial category dropdown select
  React.useEffect(() => {
    const expenses = categories.filter((c) => c.type === 'expense');
    if (expenses.length > 0 && !category) {
      setCategory(expenses[0].id);
    }
  }, [categories, category]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !category) return;

    onAddBudget({
      name,
      amount: parseFloat(amount),
      category,
      month,
    });

    setName('');
    setAmount('');
  };

  const handleStartEdit = (b: Budget) => {
    setEditingId(b.id);
    setEditName(b.name);
    setEditAmount(b.amount.toString());
    setEditCategory(b.category);
    setEditMonth(b.month);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName || !editAmount) return;
    onUpdateBudget(id, {
      name: editName,
      amount: parseFloat(editAmount),
      category: editCategory,
      month: editMonth,
    });
    setEditingId(null);
  };

  // Calculate actual spending for each category in their budget month
  const budgetsWithSpent = useMemo(() => {
    return budgets.map((b) => {
      // Find all transactions of type 'expense' that match budget's category and date year-month prefix
      const spent = transactions
        .filter(
          (tx) =>
            tx.type === 'expense' &&
            tx.category === b.category &&
            tx.date.startsWith(b.month)
        )
        .reduce((sum, tx) => sum + tx.amount, 0);

      const ratio = b.amount > 0 ? (spent / b.amount) * 100 : 0;
      const isExceeded = spent > b.amount;
      const remaining = b.amount - spent;

      return {
        ...b,
        spent,
        ratio,
        isExceeded,
        remaining,
      };
    });
  }, [budgets, transactions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Add Budget Form (Col-span 4) */}
      <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mb-5">
          <PieChart size={16} className="text-blue-500" />
          Add Budget
        </h3>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Budget Name */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Budget Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Monthly groceries"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950 focus:border-blue-500 transition-all font-semibold"
            />
          </div>

          {/* Monthly Amount */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Monthly Amount ({currencySymbol})
            </label>
            <input
              type="number"
              required
              min="1"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950 focus:border-blue-500 transition-all font-semibold"
            />
          </div>

          {/* Category Dropdown */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white text-xs focus:outline-none cursor-pointer font-semibold"
            >
              {categories
                .filter((c) => c.type === 'expense')
                .map((c) => (
                  <option key={c.id} value={c.id} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Month select */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Month
            </label>
            <input
              type="month"
              required
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950 focus:border-blue-500 transition-all font-semibold"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> Add Budget
            </button>
            <button
              type="button"
              onClick={() => {
                setName('');
                setAmount('');
              }}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold rounded-2xl transition-all cursor-pointer"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Budgets Progress Status Cards List (Col-span 8) */}
      <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-[500px]">
        <div>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Budgets Configuration
                <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                  {budgets.length} active
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Monthly limits with progress and remaining balance
              </p>
            </div>
          </div>

          {/* List/Grid of active budgets */}
          {budgetsWithSpent.length === 0 ? (
            <div className="text-center py-24 flex flex-col items-center justify-center text-slate-400">
              <TrendingDown size={36} className="mb-2 opacity-50" />
              <p className="text-xs font-semibold text-slate-500">No active budgets configured.</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Configure category targets to keep your spending in check.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {budgetsWithSpent.map((b) => {
                const isEditing = editingId === b.id;
                const cat = categories.find((c) => c.id === (isEditing ? editCategory : b.category)) || {
                  name: 'Expense',
                  colorClass: 'bg-slate-50',
                  textClass: 'text-slate-600',
                  borderClass: 'border-slate-100',
                  iconName: 'HelpCircle',
                };

                return (
                  <div
                    key={b.id}
                    className={`p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 transition-all ${
                      isEditing ? 'border-blue-300 ring-2 ring-blue-50 bg-white dark:bg-slate-900' : ''
                    }`}
                  >
                    {isEditing ? (
                      /* Editing form */
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-4">
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Name</label>
                          <input
                            type="text"
                            required
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Limit</label>
                          <input
                            type="number"
                            required
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Category</label>
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="w-full px-2 py-1.5 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-800 dark:text-white cursor-pointer font-semibold"
                          >
                            {categories
                              .filter((c) => c.type === 'expense')
                              .map((c) => (
                                <option key={c.id} value={c.id} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                                  {c.name}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div className="sm:col-span-2 flex items-center justify-end gap-1.5 pt-4">
                          <button
                            onClick={() => handleSaveEdit(b.id)}
                            className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all cursor-pointer"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg transition-all cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Display of Budget details with Progress Indicator */
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span
                              className={`w-9 h-9 rounded-xl flex items-center justify-center border text-base select-none ${cat.colorClass} ${cat.borderClass}`}
                            >
                              <CategoryIcon name={cat.iconName} size={15} className={cat.textClass} />
                            </span>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{b.name}</h4>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                                {cat.name} / {b.month}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStartEdit(b)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-all cursor-pointer"
                              title="Edit Budget Limit"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={() => onDeleteBudget(b.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all cursor-pointer"
                              title="Delete Budget"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>

                        {/* Ratio stats and indicators */}
                        <div className="flex justify-between items-baseline text-xs font-semibold">
                          <span className="text-slate-500 dark:text-slate-400">
                            {currencySymbol}{formatVal(b.spent)} spent
                          </span>
                          <span className={`${b.isExceeded ? 'text-rose-500' : 'text-emerald-500'} font-bold`}>
                            {b.isExceeded
                              ? `Exceeded by ${currencySymbol}${formatVal(Math.abs(b.remaining))}`
                              : `${currencySymbol}${formatVal(b.remaining)} remaining`}
                          </span>
                        </div>

                        {/* ProgressBar */}
                        <div className="relative w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              b.isExceeded ? 'bg-rose-500' : b.ratio > 80 ? 'bg-amber-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${Math.min(100, b.ratio)}%` }}
                          />
                        </div>

                        {/* Warning Callout for Exceeded Budget */}
                        {b.isExceeded && (
                          <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-1.5 text-[10px] font-bold text-rose-600 uppercase tracking-wider">
                            <AlertTriangle size={12} />
                            <span>Warning: Budget Threshold Exceeded!</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetsTab;
