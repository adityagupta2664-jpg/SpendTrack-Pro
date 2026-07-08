export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  iconName: string; // Used to look up Lucide icons
  colorClass: string; // Tailwind bg color class
  textClass: string; // Tailwind text color class
  borderClass: string; // Tailwind border color class
  type?: TransactionType; // Category type
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string; // Matches Category id
  description: string;
  date: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string; // ISO String
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  category: string; // Category ID
  month: string; // e.g. "2026-07"
}

export interface DashboardStats {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  budgetProgress: number;
}

