import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { 
  BarChart3, 
  Coins, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  PieChart as PieIcon,
  AlertCircle
} from 'lucide-react';
import { Transaction, Category } from '../types';
import CategoryIcon from './CategoryIcon';

interface AnalyticsTabProps {
  transactions: Transaction[];
  categories: Category[];
  currencySymbol: string;
  formatVal: (val: number) => string;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  transactions,
  categories,
  currencySymbol,
  formatVal,
}) => {
  // 1. Calculate high-level Analytics Metrics
  const metrics = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');

    const totalExpenseAmount = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncomeAmount = income.reduce((sum, t) => sum + t.amount, 0);

    // Largest items
    const largestExpense = expenses.length > 0 
      ? expenses.reduce((max, t) => t.amount > max.amount ? t : max, expenses[0])
      : null;

    const largestIncome = income.length > 0
      ? income.reduce((max, t) => t.amount > max.amount ? t : max, income[0])
      : null;

    // Daily spending average (based on distinct dates)
    const distinctDates = Array.from(new Set(expenses.map(t => t.date)));
    const averageDailySpending = distinctDates.length > 0 
      ? totalExpenseAmount / distinctDates.length
      : 0;

    return {
      totalExpenseAmount,
      totalIncomeAmount,
      largestExpense,
      largestIncome,
      averageDailySpending,
    };
  }, [transactions]);

  // 2. Category Pie Chart calculations
  const categoryChartData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([catId, amount]) => {
      const category = categories.find(c => c.id === catId) || { name: 'Other' };
      // Map standard Hex Color codes
      let colorHex = '#64748B'; // slate
      if (catId === 'food') colorHex = '#EA580C'; // orange-600
      else if (catId === 'rent') colorHex = '#9333EA'; // purple-600
      else if (catId === 'grocery') colorHex = '#65A30D'; // lime-600
      else if (catId === 'shopping') colorHex = '#D97706'; // amber-600
      else if (catId === 'transport') colorHex = '#0284C7'; // sky-600
      else if (catId === 'entertainment') colorHex = '#DB2777'; // pink-600
      else if (catId === 'healthcare') colorHex = '#E11D48'; // rose-600
      else if (catId === 'education') colorHex = '#4F46E5'; // indigo-600
      else if (catId === 'travel') colorHex = '#0891B2'; // cyan-600
      else if (catId === 'fuel') colorHex = '#CA8A04'; // yellow-600
      else if (catId === 'internet') colorHex = '#2563EB'; // blue-600
      else if (catId === 'mobile-recharge') colorHex = '#0D9488'; // teal-600
      else if (catId === 'electricity') colorHex = '#EAB308'; // yellow-500
      else if (catId === 'emi') colorHex = '#DC2626'; // red-600

      return {
        id: catId,
        name: category.name,
        value: amount,
        color: colorHex,
      };
    });
  }, [transactions, categories]);

  // 3. Monthly expenses bar charts
  const monthlyData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc, tx) => {
      const monthLabel = tx.date.substring(0, 7); // e.g. "2026-06"
      acc[monthLabel] = (acc[monthLabel] || 0) + tx.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, sum]) => ({
        month,
        amount: sum,
      }));
  }, [transactions]);

  // 4. Income vs Expense trend calculations
  const comparisonTrendData = useMemo(() => {
    // Group transactions by date
    const grouped = transactions.reduce((acc, tx) => {
      const date = tx.date;
      if (!acc[date]) {
        acc[date] = { date, income: 0, expense: 0 };
      }
      if (tx.type === 'income') {
        acc[date].income += tx.amount;
      } else {
        acc[date].expense += tx.amount;
      }
      return acc;
    }, {} as Record<string, { date: string; income: number; expense: number }>);

    return (Object.values(grouped) as Array<{ date: string; income: number; expense: number }>)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-10); // Take last 10 records for better visual density
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 mb-4">
          <BarChart3 size={32} />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">No Analytics Data Found</h3>
        <p className="text-xs text-slate-500 max-w-xs mt-1.5 leading-relaxed">
          Log some transactions in the ledger list or restore from backup files to begin generating charts and metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 4 Analytics highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Monthly spending */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly Spending</span>
          <div className="mt-2.5">
            <h4 className="text-2xl font-bold text-blue-600">
              {currencySymbol}{formatVal(metrics.totalExpenseAmount)}
            </h4>
            <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 block">Accumulated outflow</span>
          </div>
        </div>

        {/* Average daily spending */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average Daily Spending</span>
          <div className="mt-2.5">
            <h4 className="text-2xl font-bold text-slate-950 dark:text-white">
              {currencySymbol}{formatVal(metrics.averageDailySpending)}
            </h4>
            <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 block">Per logged outflow day</span>
          </div>
        </div>

        {/* Largest expense */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Largest Expense</span>
          <div className="mt-2.5">
            <h4 className="text-2xl font-bold text-rose-500 truncate" title={metrics.largestExpense?.description}>
              {metrics.largestExpense ? `${currencySymbol}${formatVal(metrics.largestExpense.amount)}` : 'N/A'}
            </h4>
            <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 block truncate">
              {metrics.largestExpense ? metrics.largestExpense.description : 'No expense recorded'}
            </span>
          </div>
        </div>

        {/* Largest income */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Largest Income</span>
          <div className="mt-2.5">
            <h4 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 truncate" title={metrics.largestIncome?.description}>
              {metrics.largestIncome ? `${currencySymbol}${formatVal(metrics.largestIncome.amount)}` : 'N/A'}
            </h4>
            <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 block truncate">
              {metrics.largestIncome ? metrics.largestIncome.description : 'No income recorded'}
            </span>
          </div>
        </div>
      </div>

      {/* Graphical Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Category distribution donut (Col-span 5) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              Spending by Category
            </h3>
            {categoryChartData.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center justify-center text-slate-400">
                <PieIcon size={24} className="mb-2 opacity-50" />
                <p className="text-xs font-semibold text-slate-500">No outflow shares found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-44 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
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
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Spent</span>
                    <span className="text-sm font-extrabold text-slate-800 dark:text-white">
                      {currencySymbol}{formatVal(metrics.totalExpenseAmount)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                  {categoryChartData.map((cat, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 truncate w-full">
                        {cat.name}: <span className="font-bold">{currencySymbol}{formatVal(cat.value)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Expenses bar chart (Col-span 7) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
            Monthly Expenses
          </h3>
          {monthlyData.length === 0 ? (
            <div className="text-center py-20 flex flex-col items-center justify-center text-slate-400">
              <BarChart3 size={24} className="mb-2 opacity-50" />
              <p className="text-xs font-semibold text-slate-500">No monthly expense bars found.</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={9} fontWeight="bold" tickLine={false} />
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
                  <Bar dataKey="amount" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>

      {/* Income vs Expense line/area trend comparison chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          Income vs Expense Comparison
        </h3>
        {comparisonTrendData.length === 0 ? (
          <div className="text-center py-16 flex flex-col items-center justify-center text-slate-400">
            <TrendingUp size={24} className="mb-2 opacity-50" />
            <p className="text-xs font-semibold text-slate-500">No comparison data lines available.</p>
          </div>
        ) : (
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={comparisonTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={9} fontWeight="bold" tickLine={false} />
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
                <Area type="monotone" dataKey="income" name="Inflow" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" name="Outflow" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsTab;
