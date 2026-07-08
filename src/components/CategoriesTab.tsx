import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Check, 
  X, 
  FolderKanban, 
  Sparkles,
  Info
} from 'lucide-react';
import { Category, TransactionType } from '../types';
import CategoryIcon from './CategoryIcon';

interface CategoriesTabProps {
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onDeleteCategory: (id: string) => void;
  onUpdateCategory: (id: string, updated: Partial<Category>) => void;
}

const AVAILABLE_ICONS = [
  'Briefcase', 'Laptop', 'Building', 'TrendingUp', 'Gift', 'Coins', 'Utensils',
  'ShoppingBag', 'Car', 'Flame', 'ShoppingCart', 'Home', 'Zap', 'Globe',
  'Smartphone', 'Tv', 'Heart', 'GraduationCap', 'Plane', 'CreditCard', 'PiggyBank',
  'Activity', 'Coffee', 'Music', 'Map', 'Book', 'Film', 'Tool', 'Shield', 'HelpCircle'
];

const PRESET_COLORS = [
  { name: 'Blue', color: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', hex: '#2563eb' },
  { name: 'Green', color: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', hex: '#10b981' },
  { name: 'Indigo', color: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100', hex: '#4f46e5' },
  { name: 'Orange', color: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100', hex: '#ea580c' },
  { name: 'Purple', color: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', hex: '#9333ea' },
  { name: 'Lime', color: 'bg-lime-50', text: 'text-lime-600', border: 'border-lime-100', hex: '#84cc16' },
  { name: 'Teal', color: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-100', hex: '#0d9488' },
  { name: 'Rose', color: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', hex: '#e11d48' },
  { name: 'Pink', color: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100', hex: '#db2777' },
  { name: 'Slate', color: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100', hex: '#64748b' },
];

export const CategoriesTab: React.FC<CategoriesTabProps> = ({
  categories,
  onAddCategory,
  onDeleteCategory,
  onUpdateCategory,
}) => {
  // Add category state
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [iconName, setIconName] = useState('Briefcase');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  // Edit category state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<TransactionType>('expense');
  const [editIconName, setEditIconName] = useState('');
  const [editColorIndex, setEditColorIndex] = useState(0);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const chosenColor = PRESET_COLORS[selectedColorIndex];

    onAddCategory({
      name,
      type,
      iconName,
      colorClass: chosenColor.color,
      textClass: chosenColor.text,
      borderClass: chosenColor.border,
    });

    setName('');
  };

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditType(cat.type || 'expense');
    setEditIconName(cat.iconName);

    const matchIdx = PRESET_COLORS.findIndex((p) => p.color === cat.colorClass);
    setEditColorIndex(matchIdx >= 0 ? matchIdx : 0);
  };

  const handleSaveEdit = (id: string) => {
    if (!editName) return;

    const chosenColor = PRESET_COLORS[editColorIndex];

    onUpdateCategory(id, {
      name: editName,
      type: editType,
      iconName: editIconName,
      colorClass: chosenColor.color,
      textClass: chosenColor.text,
      borderClass: chosenColor.border,
    });

    setEditingId(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Add Category Form Panel (Col-span 4) */}
      <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mb-5">
          <FolderKanban size={16} className="text-blue-500 animate-pulse" />
          Add Category
        </h3>

        <form onSubmit={handleAddSubmit} className="space-y-4">
          {/* Category Name */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Category Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Subscriptions"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-950 focus:border-blue-500 transition-all font-semibold"
            />
          </div>

          {/* Type Dropdown (Expense/Income) */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TransactionType)}
              className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white text-xs focus:outline-none cursor-pointer font-semibold"
            >
              <option value="expense" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white font-semibold">Expense</option>
              <option value="income" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white font-semibold">Income</option>
            </select>
          </div>

          {/* Icon Choice list */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Icon
            </label>
            <select
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
              className="block w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-800 dark:text-white text-xs focus:outline-none cursor-pointer font-semibold"
            >
              {AVAILABLE_ICONS.map((ic) => (
                <option key={ic} value={ic} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                  {ic}
                </option>
              ))}
            </select>
          </div>

          {/* Color swatches */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Color Accent Swatch
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((col, idx) => {
                const isSelected = selectedColorIndex === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedColorIndex(idx)}
                    className={`w-7 h-7 rounded-full transition-all border shrink-0 cursor-pointer flex items-center justify-center hover:scale-110 ${
                      isSelected
                        ? 'ring-4 ring-blue-100 dark:ring-blue-950 scale-105 border-slate-800 dark:border-slate-200'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  >
                    {isSelected && <Check size={11} className="text-white drop-shadow-xs font-bold" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} /> Add Category
            </button>
            <button
              type="button"
              onClick={() => {
                setName('');
              }}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold rounded-2xl transition-all cursor-pointer"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Categories Swatch Grid (Col-span 8) */}
      <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between min-h-[580px]">
        <div>
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Categories Directory
                <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full">
                  {categories.length} loaded
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                Organize transactions with unique labels, color codes, and vector icon markers
              </p>
            </div>
          </div>

          {/* Core Grid mapping cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
            {categories.map((cat) => {
              const isEditing = editingId === cat.id;

              return (
                <div
                  key={cat.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                    isEditing
                      ? 'border-blue-400 bg-blue-50/20 dark:bg-blue-950/20 ring-4 ring-blue-50 dark:ring-blue-950/20'
                      : 'border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  {isEditing ? (
                    /* Inline Editor fields */
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 text-slate-800 dark:text-white"
                        />
                        <select
                          value={editType}
                          onChange={(e) => setEditType(e.target.value as TransactionType)}
                          className="text-[10px] border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 cursor-pointer text-slate-800 dark:text-white font-semibold"
                        >
                          <option value="expense" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Expense</option>
                          <option value="income" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">Income</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        {/* Icon chooser */}
                        <select
                          value={editIconName}
                          onChange={(e) => setEditIconName(e.target.value)}
                          className="flex-1 text-[10px] border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-950 cursor-pointer text-slate-800 dark:text-white font-semibold"
                        >
                          {AVAILABLE_ICONS.map((ic) => (
                            <option key={ic} value={ic} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                              {ic}
                            </option>
                          ))}
                        </select>

                        {/* Action confirmers */}
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(cat.id)}
                            className="p-1.5 bg-emerald-500 text-white rounded-lg cursor-pointer"
                          >
                            <Check size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="p-1.5 bg-slate-200 text-slate-600 rounded-lg cursor-pointer"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Swatch for editing */}
                      <div className="flex gap-1 pt-1.5">
                        {PRESET_COLORS.map((p, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setEditColorIndex(idx)}
                            className={`w-4 h-4 rounded-full border shrink-0 cursor-pointer ${
                              editColorIndex === idx ? 'ring-2 ring-blue-400 scale-105 border-slate-950' : 'border-slate-200'
                            }`}
                            style={{ backgroundColor: p.hex }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Display row with Badge, Icon, Name */
                    <>
                      <div className="flex items-center gap-3.5">
                        <span
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center border text-lg select-none ${cat.colorClass} ${cat.borderClass}`}
                        >
                          <CategoryIcon name={cat.iconName} size={20} className={cat.textClass} />
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-white">{cat.name}</h4>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider mt-1 px-2 py-0.5 rounded-full inline-block ${
                              cat.type === 'income'
                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-950'
                                : 'bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-950'
                            }`}
                          >
                            {cat.type || 'Expense'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <button
                          onClick={() => handleStartEdit(cat)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-all cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit size={11} />
                        </button>
                        <button
                          onClick={() => onDeleteCategory(cat.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-3.5 bg-blue-50/50 dark:bg-blue-950/25 border border-blue-100/50 dark:border-blue-950/50 rounded-2xl mt-4">
          <Info size={14} className="text-blue-500 shrink-0" />
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-normal">
            Note: Deleting a category does not clear its historic records. Deallocated items defaults back to standard 'Other' markers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CategoriesTab;
