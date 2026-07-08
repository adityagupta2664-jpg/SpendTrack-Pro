import React from 'react';
import { motion } from 'motion/react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  Info, 
  Trash2, 
  Edit, 
  FileText, 
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  ChevronRight
} from 'lucide-react';
import { Transaction, Category, Budget } from '../types';
import CategoryIcon from './CategoryIcon';

interface DashboardTabProps {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  currencySymbol: string;
  formatVal: (val: number) => string;
  onNavigateToTab: (tab: string) => void;
  onDeleteTransaction: (id: string) => void;
  searchQuery: string;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  transactions,
  categories,
  budgets,
  currencySymbol,
  formatVal,
  onNavigateToTab,
  onDeleteTransaction,
  searchQuery,
}) => {
  // Filter based on search query (Global Search support)
  const filteredTransactions = transactions.filter(tx => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const catName = categories.find(c => c.id === tx.category)?.name || '';
    return (
      tx.description.toLowerCase().includes(q) ||
      catName.toLowerCase().includes(q) ||
      tx.amount.toString().includes(q)
    );
  });

  // Calculate high-level stats
  const totalIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const currentBalance = totalIncome - totalExpenses;
  const totalTransactionsCount = transactions.length;

  // Active budget limit (Rent, food etc limit summation)
  const totalBudgetLimit = budgets.reduce((sum, b) => sum + b.amount, 0);
  const budgetProgress = totalBudgetLimit > 0 ? (totalExpenses / totalBudgetLimit) * 100 : 0;

  // Pie chart category data calculation
  const expenseByCategory = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieChartData = Object.entries(expenseByCategory).map(([catId, amount]) => {
    const category = categories.find(c => c.id === catId) || {
      name: 'Other',
      colorClass: 'bg-slate-500',
    };
    // Extract Hex Color or fallback
    let hexColor = '#64748B'; // default slate-500
    if (catId === 'food') hexColor = '#EA580C'; // orange-600
    else if (catId === 'rent') hexColor = '#9333EA'; // purple-600
    else if (catId === 'grocery') hexColor = '#65A30D'; // lime-600
    else if (catId === 'shopping') hexColor = '#D97706'; // amber-600
    else if (catId === 'transport') hexColor = '#0284C7'; // sky-600
    else if (catId === 'entertainment') hexColor = '#DB2777'; // pink-600
    else if (catId === 'healthcare') hexColor = '#E11D48'; // rose-600
    else if (catId === 'education') hexColor = '#4F46E5'; // indigo-600
    else if (catId === 'travel') hexColor = '#0891B2'; // cyan-600
    else if (catId === 'fuel') hexColor = '#CA8A04'; // yellow-600
    else if (catId === 'internet') hexColor = '#2563EB'; // blue-600
    else if (catId === 'mobile-recharge') hexColor = '#0D9488'; // teal-600
    else if (catId === 'electricity') hexColor = '#EAB308'; // yellow-500
    else if (catId === 'emi') hexColor = '#DC2626'; // red-600
    else if (catId === 'business') hexColor = '#4F46E5';
    else if (catId === 'freelancing') hexColor = '#2563EB';
    else if (catId === 'salary') hexColor = '#10B981';

    return {
      name: category.name,
      value: amount,
      color: hexColor,
    };
  });

  // Trend mapping for bar charts
  const trendMap = transactions.reduce((acc, tx) => {
    const dateStr = tx.date; // YYYY-MM-DD
    if (!acc[dateStr]) {
      acc[dateStr] = { date: dateStr, income: 0, expense: 0 };
    }
    if (tx.type === 'income') {
      acc[dateStr].income += tx.amount;
    } else {
      acc[dateStr].expense += tx.amount;
    }
    return acc;
  }, {} as Record<string, { date: string; income: number; expense: number }>);

  // Take the last 7 dates for weekly bar charts
  const trendData = (Object.values(trendMap) as Array<{ date: string; income: number; expense: number }>)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7)
    .map(item => {
      const parts = item.date.split('-');
      const label = parts.length === 3 ? `${parts[1]}-${parts[2]}` : item.date;
      return {
        date: item.date,
        income: item.income,
        expense: item.expense,
        label,
      };
    });

  return (
    <div className="space-y-6">
      {/* Overview Intro Label Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Overview</span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1">Financial Snapshot</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Track cash flow, recent activity, and spending trends from one dashboard.
          </p>
        </div>
      </div>

      {/* 4 Bento Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Current Balance */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Balance</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Wallet size={16} />
            </div>
          </div>
          <div>
            <h4 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {currencySymbol}{formatVal(currentBalance)}
            </h4>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 block">Net Liquidity</span>
          </div>
        </motion.div>

        {/* Total Income */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Income</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={16} />
            </div>
          </div>
          <div>
            <h4 className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {currencySymbol}{formatVal(totalIncome)}
            </h4>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 block">Inflows Recorded</span>
          </div>
        </motion.div>

        {/* Total Expenses */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Expenses</span>
            <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <TrendingDown size={16} />
            </div>
          </div>
          <div>
            <h4 className="text-3xl font-bold tracking-tight text-rose-500">
              {currencySymbol}{formatVal(totalExpenses)}
            </h4>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 block">Outflows Spent</span>
          </div>
        </motion.div>

        {/* Total Transactions */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Transactions</span>
            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Layers size={16} />
            </div>
          </div>
          <div>
            <h4 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {totalTransactionsCount}
            </h4>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 block">Ledger Records</span>
          </div>
        </motion.div>
      </div>

      {/* Main Grid Content (Recent Transactions list + category & trend charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Transactions list (Col-span 7) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Recent Transactions</h3>
              <button
                onClick={() => onNavigateToTab('transactions')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest flex items-center gap-1 cursor-pointer"
              >
                View Ledger <ChevronRight size={14} />
              </button>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center justify-center text-slate-400">
                <FileText size={32} className="mb-2 opacity-50 text-slate-500" />
                <p className="text-xs font-semibold text-slate-500">No transactions recorded yet.</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Add some on the Transactions tab or load a template.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                {filteredTransactions.slice(0, 5).map((tx) => {
                  const cat = categories.find((c) => c.id === tx.category) || {
                    name: 'Other',
                    colorClass: 'bg-slate-50 dark:bg-slate-800',
                    textClass: 'text-slate-600 dark:text-slate-400',
                    borderClass: 'border-slate-100 dark:border-slate-800',
                    iconName: 'HelpCircle',
                  };
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 rounded-2xl transition-all hover:bg-slate-100/70 dark:hover:bg-slate-800"
                    >
                      <div className="flex items-center gap-3.5">
                        <span
                          className={`w-10 h-10 rounded-xl flex items-center justify-center border text-lg select-none ${cat.colorClass} ${cat.borderClass}`}
                        >
                          <CategoryIcon name={cat.iconName} size={18} className={cat.textClass} />
                        </span>
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white max-w-[150px] sm:max-w-[220px] truncate" title={tx.description}>
                            {tx.description}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                            {cat.name} • {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {tx.type === 'income' ? '+' : '-'}{currencySymbol}{formatVal(tx.amount)}
                        </span>
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1 text-slate-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                          title="Delete Transaction"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {filteredTransactions.length > 5 && (
            <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => onNavigateToTab('transactions')}
                className="text-xs font-bold text-slate-500 hover:text-slate-700 tracking-wider uppercase cursor-pointer"
              >
                And {filteredTransactions.length - 5} more transactions...
              </button>
            </div>
          )}
        </div>

        {/* Spending by Category donut chart (Col-span 5) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Spending by Category</h3>
            </div>

            {pieChartData.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center justify-center text-slate-400">
                <Layers size={32} className="mb-2 opacity-50 text-slate-500" />
                <p className="text-xs font-semibold text-slate-500">No spend distribution available.</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Outflow records are needed to build charts.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-44 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [`${currencySymbol}${formatVal(value)}`, 'Spent']}
                        contentStyle={{
                          backgroundColor: '#1E293B',
                          borderRadius: '12px',
                          border: 'none',
                          color: '#F8FAFC',
                          fontSize: '11px',
                          fontWeight: 'bold',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Donut Label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Outflow</span>
                    <span className="text-base font-extrabold text-slate-800 dark:text-white">
                      {currencySymbol}{formatVal(totalExpenses)}
                    </span>
                  </div>
                </div>

                {/* Grid listing of Category swatches */}
                <div className="grid grid-cols-2 gap-2.5 max-h-[140px] overflow-y-auto pr-1 scrollbar-thin">
                  {pieChartData.map((cat, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate w-full">
                        {cat.name}: <span className="font-bold">{currencySymbol}{formatVal(cat.value)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Cash Flow Trends Weekly bar chart block */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">Spending Trends</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Last 7 Active Ledger Days</p>
          </div>
        </div>

        {trendData.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center justify-center text-slate-400">
            <TrendingUp size={32} className="mb-2 opacity-50 text-slate-500" />
            <p className="text-xs font-semibold text-slate-500">No ledger historical trends found.</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Data entries populate cash flow charts over days.</p>
          </div>
        ) : (
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={9} fontWeight="bold" tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(value: number) => [`${currencySymbol}${formatVal(value)}`]}
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#F8FAFC',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}
                />
                <Bar dataKey="income" name="Inflow" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="expense" name="Outflow" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardTab;
