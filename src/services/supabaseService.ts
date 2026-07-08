import { supabase } from '../supabase';
import { Transaction, Category, Budget } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_BUDGETS, DEFAULT_TRANSACTIONS } from '../data';

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  currencyCode: string;
  themePreference: 'light' | 'dark';
}

// ==========================================
// Robust Bidirectional DB Mapping Helpers
// ==========================================

function mapProfileFromDB(row: any): UserProfile {
  return {
    name: row.name || '',
    email: row.email || '',
    avatar: row.avatar || '🦁',
    currencyCode: row.currencyCode || row.currency_code || row.currencycode || 'INR',
    themePreference: row.themePreference || row.theme_preference || row.themepreference || 'light',
  };
}

function mapProfileToDB(profile: Partial<UserProfile>): any {
  const dbRow: any = {};
  if (profile.name !== undefined) dbRow.name = profile.name;
  if (profile.email !== undefined) dbRow.email = profile.email;
  if (profile.avatar !== undefined) dbRow.avatar = profile.avatar;
  if (profile.currencyCode !== undefined) dbRow.currencyCode = profile.currencyCode;
  if (profile.themePreference !== undefined) dbRow.themePreference = profile.themePreference;
  return dbRow;
}

function mapCategoryFromDB(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    iconName: row.iconName || row.icon_name || row.iconname || 'Briefcase',
    colorClass: row.colorClass || row.color_class || row.colorclass || 'bg-blue-50',
    textClass: row.textClass || row.text_class || row.textclass || 'text-blue-600',
    borderClass: row.borderClass || row.border_class || row.borderclass || 'border-blue-100',
    type: row.type || 'expense',
  };
}

function mapCategoryToDB(cat: Partial<Category>): any {
  const dbRow: any = {};
  if (cat.id !== undefined) dbRow.id = cat.id;
  if (cat.name !== undefined) dbRow.name = cat.name;
  if (cat.iconName !== undefined) dbRow.iconName = cat.iconName;
  if (cat.colorClass !== undefined) dbRow.colorClass = cat.colorClass;
  if (cat.textClass !== undefined) dbRow.textClass = cat.textClass;
  if (cat.borderClass !== undefined) dbRow.borderClass = cat.borderClass;
  if (cat.type !== undefined) dbRow.type = cat.type;
  return dbRow;
}

function mapTransactionFromDB(row: any): Transaction {
  return {
    id: row.id,
    type: row.type || 'expense',
    amount: parseFloat(row.amount || '0'),
    category: row.category,
    description: row.description || '',
    date: row.date || new Date().toISOString().split('T')[0],
    notes: row.notes || undefined,
    createdAt: row.createdAt || row.created_at || row.createdat || new Date().toISOString(),
  };
}

function mapTransactionToDB(tx: Partial<Transaction>): any {
  const dbRow: any = {};
  if (tx.id !== undefined) dbRow.id = tx.id;
  if (tx.type !== undefined) dbRow.type = tx.type;
  if (tx.amount !== undefined) dbRow.amount = tx.amount;
  if (tx.category !== undefined) dbRow.category = tx.category;
  if (tx.description !== undefined) dbRow.description = tx.description;
  if (tx.date !== undefined) dbRow.date = tx.date;
  if (tx.notes !== undefined) dbRow.notes = tx.notes;
  if (tx.createdAt !== undefined) dbRow.createdAt = tx.createdAt;
  return dbRow;
}

function mapBudgetFromDB(row: any): Budget {
  return {
    id: row.id,
    name: row.name || '',
    amount: parseFloat(row.amount || '0'),
    category: row.category,
    month: row.month || new Date().toISOString().substring(0, 7),
  };
}

function mapBudgetToDB(b: Partial<Budget>): any {
  const dbRow: any = {};
  if (b.id !== undefined) dbRow.id = b.id;
  if (b.name !== undefined) dbRow.name = b.name;
  if (b.amount !== undefined) dbRow.amount = b.amount;
  if (b.category !== undefined) dbRow.category = b.category;
  if (b.month !== undefined) dbRow.month = b.month;
  return dbRow;
}

// ==========================================
// Service API Export
// ==========================================

/**
 * Gets the user's profile document from Supabase.
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId);

    if (error) {
      console.warn('Error reading profiles live, using local fallback:', error.message);
      const fallback = localStorage.getItem(`sb-simulated-table-profiles`);
      if (fallback) {
        const rows = JSON.parse(fallback);
        const found = rows.find((r: any) => r.id === userId);
        if (found) return mapProfileFromDB(found);
      }
      return null;
    }
    
    if (data && data.length > 0) {
      return mapProfileFromDB(data[0]);
    }
    
    const fallback = localStorage.getItem(`sb-simulated-table-profiles`);
    if (fallback) {
      const rows = JSON.parse(fallback);
      const found = rows.find((r: any) => r.id === userId);
      if (found) return mapProfileFromDB(found);
    }
    return null;
  } catch (err) {
    console.warn('Network or other error reading profiles, using local fallback:', err);
    const fallback = localStorage.getItem(`sb-simulated-table-profiles`);
    if (fallback) {
      const rows = JSON.parse(fallback);
      const found = rows.find((r: any) => r.id === userId);
      if (found) return mapProfileFromDB(found);
    }
    return null;
  }
}

/**
 * Creates a brand new user profile and seeds the default categories in Supabase.
 * Respects User Intent: No demo or sample budgets/transactions are added for new accounts.
 */
export async function createUserProfile(
  userId: string, 
  profile: Omit<UserProfile, 'currencyCode' | 'themePreference'>
): Promise<UserProfile> {
  const fullProfile: UserProfile = {
    ...profile,
    currencyCode: 'INR',
    themePreference: 'light'
  };

  const dbProfile = mapProfileToDB(fullProfile);
  dbProfile.id = userId;

  try {
    // 1. Create user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(dbProfile);

    if (profileError) {
      console.warn('Error creating profile live, saving to local backup:', profileError.message);
    }
  } catch (err) {
    console.warn('Network error creating profile live, saving to local backup:', err);
  }

  // Save profile locally as backup
  saveProfileLocally(userId, dbProfile);

  // 2. Seed default categories only (NO transactions or budgets for new user)
  const categoriesToInsert = DEFAULT_CATEGORIES.map(cat => ({
    ...mapCategoryToDB(cat),
    user_id: userId
  }));

  try {
    const { error: catError } = await supabase
      .from('categories')
      .upsert(categoriesToInsert);

    if (catError) {
      console.warn('Error seeding default categories live, saving to local backup:', catError.message);
    }
  } catch (err) {
    console.warn('Network error seeding default categories live, saving to local backup:', err);
  }

  // Save categories locally as backup
  try {
    const key = `sb-simulated-table-categories`;
    const raw = localStorage.getItem(key);
    let rows = raw ? JSON.parse(raw) : [];
    categoriesToInsert.forEach(cat => {
      const index = rows.findIndex((r: any) => r.id === cat.id);
      if (index !== -1) {
        rows[index] = { ...rows[index], ...cat };
      } else {
        rows.push(cat);
      }
    });
    localStorage.setItem(key, JSON.stringify(rows));
  } catch (err) {
    console.error('Failed to save categories to local backup:', err);
  }

  return fullProfile;
}

/**
 * Updates an existing user profile document.
 */
export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
  const dbData = mapProfileToDB(data);
  try {
    const { error } = await supabase
      .from('profiles')
      .update(dbData)
      .eq('id', userId);

    if (error) {
      console.warn('Error updating profile live, saving to local backup:', error.message);
    }
  } catch (err: any) {
    console.warn('Network error updating profile live, saving to local backup:', err.message || err);
  }

  // Save locally as backup
  saveProfileLocally(userId, dbData);
}

/**
 * Gets all transactions for a user from Supabase.
 */
export async function getTransactions(userId: string): Promise<Transaction[]> {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.warn('Error fetching transactions live, using local backup:', error.message);
      return getLocalBackupRows('transactions', userId).map(mapTransactionFromDB);
    }

    const items = (data || []).map(mapTransactionFromDB);
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn('Network error fetching transactions live, using local backup:', err);
    return getLocalBackupRows('transactions', userId).map(mapTransactionFromDB);
  }
}

/**
 * Adds a transaction.
 */
export async function addTransaction(userId: string, tx: Transaction): Promise<void> {
  const dbTx = mapTransactionToDB(tx);
  dbTx.user_id = userId;

  try {
    const { error } = await supabase
      .from('transactions')
      .insert(dbTx);

    if (error) {
      console.warn('Error adding transaction live, saving to local backup:', error.message);
    }
  } catch (err) {
    console.warn('Network error adding transaction live, saving to local backup:', err);
  }

  // Save to local backup
  saveLocalBackupRow('transactions', userId, tx.id, dbTx);
}

/**
 * Updates an existing transaction.
 */
export async function updateTransaction(userId: string, id: string, tx: Partial<Transaction>): Promise<void> {
  const dbTx = mapTransactionToDB(tx);

  try {
    const { error } = await supabase
      .from('transactions')
      .update(dbTx)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.warn('Error updating transaction live, saving to local backup:', error.message);
    }
  } catch (err) {
    console.warn('Network error updating transaction live, saving to local backup:', err);
  }

  // Save to local backup
  saveLocalBackupRow('transactions', userId, id, dbTx);
}

/**
 * Deletes a transaction.
 */
export async function deleteTransaction(userId: string, id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.warn('Error deleting transaction live, updating local backup:', error.message);
    }
  } catch (err) {
    console.warn('Network error deleting transaction live, updating local backup:', err);
  }

  // Delete from local backup
  deleteLocalBackupRow('transactions', userId, id);
}

/**
 * Gets all categories for a user from Supabase.
 */
export async function getCategories(userId: string): Promise<Category[]> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.warn('Error fetching categories live, using local backup:', error.message);
      return getLocalBackupRows('categories', userId).map(mapCategoryFromDB);
    }

    return (data || []).map(mapCategoryFromDB);
  } catch (err) {
    console.warn('Network error fetching categories live, using local backup:', err);
    return getLocalBackupRows('categories', userId).map(mapCategoryFromDB);
  }
}

/**
 * Adds a category.
 */
export async function addCategory(userId: string, cat: Category): Promise<void> {
  const dbCat = mapCategoryToDB(cat);
  dbCat.user_id = userId;

  try {
    const { error } = await supabase
      .from('categories')
      .insert(dbCat);

    if (error) {
      console.warn('Error adding category live, saving to local backup:', error.message);
    }
  } catch (err) {
    console.warn('Network error adding category live, saving to local backup:', err);
  }

  // Save to local backup
  saveLocalBackupRow('categories', userId, cat.id, dbCat);
}

/**
 * Updates an existing category.
 */
export async function updateCategory(userId: string, id: string, cat: Partial<Category>): Promise<void> {
  const dbCat = mapCategoryToDB(cat);

  try {
    const { error } = await supabase
      .from('categories')
      .update(dbCat)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.warn('Error updating category live, saving to local backup:', error.message);
    }
  } catch (err) {
    console.warn('Network error updating category live, saving to local backup:', err);
  }

  // Save to local backup
  saveLocalBackupRow('categories', userId, id, dbCat);
}

/**
 * Deletes a category.
 */
export async function deleteCategory(userId: string, id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.warn('Error deleting category live, updating local backup:', error.message);
    }
  } catch (err) {
    console.warn('Network error deleting category live, updating local backup:', err);
  }

  // Delete from local backup
  deleteLocalBackupRow('categories', userId, id);
}

/**
 * Gets all budgets for a user from Supabase.
 */
export async function getBudgets(userId: string): Promise<Budget[]> {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.warn('Error fetching budgets live, using local backup:', error.message);
      return getLocalBackupRows('budgets', userId).map(mapBudgetFromDB);
    }

    return (data || []).map(mapBudgetFromDB);
  } catch (err) {
    console.warn('Network error fetching budgets live, using local backup:', err);
    return getLocalBackupRows('budgets', userId).map(mapBudgetFromDB);
  }
}

/**
 * Adds a budget.
 */
export async function addBudget(userId: string, b: Budget): Promise<void> {
  const dbB = mapBudgetToDB(b);
  dbB.user_id = userId;

  try {
    const { error } = await supabase
      .from('budgets')
      .insert(dbB);

    if (error) {
      console.warn('Error adding budget live, saving to local backup:', error.message);
    }
  } catch (err) {
    console.warn('Network error adding budget live, saving to local backup:', err);
  }

  // Save to local backup
  saveLocalBackupRow('budgets', userId, b.id, dbB);
}

/**
 * Updates an existing budget.
 */
export async function updateBudget(userId: string, id: string, b: Partial<Budget>): Promise<void> {
  const dbB = mapBudgetToDB(b);

  try {
    const { error } = await supabase
      .from('budgets')
      .update(dbB)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.warn('Error updating budget live, saving to local backup:', error.message);
    }
  } catch (err) {
    console.warn('Network error updating budget live, saving to local backup:', err);
  }

  // Save to local backup
  saveLocalBackupRow('budgets', userId, id, dbB);
}

/**
 * Deletes a budget.
 */
export async function deleteBudget(userId: string, id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.warn('Error deleting budget live, updating local backup:', error.message);
    }
  } catch (err) {
    console.warn('Network error deleting budget live, updating local backup:', err);
  }

  // Delete from local backup
  deleteLocalBackupRow('budgets', userId, id);
}

/**
 * Clears and wipes all data (transactions, budgets, restores categories to defaults) in Supabase.
 */
export async function wipeUserData(userId: string): Promise<void> {
  try {
    // Delete all transactions
    await supabase.from('transactions').delete().eq('user_id', userId);
    // Delete all budgets
    await supabase.from('budgets').delete().eq('user_id', userId);
    // Delete all categories
    await supabase.from('categories').delete().eq('user_id', userId);
  } catch (err) {
    console.warn('Network error wiping data live:', err);
  }

  // Wipe local backup rows
  wipeLocalBackupRows(userId);

  // Restore default categories only
  const categoriesToInsert = DEFAULT_CATEGORIES.map(cat => ({
    ...mapCategoryToDB(cat),
    user_id: userId
  }));

  try {
    await supabase.from('categories').insert(categoriesToInsert);
  } catch (err) {
    console.warn('Network error inserting categories live during wipe:', err);
  }

  // Save categories locally
  try {
    const key = `sb-simulated-table-categories`;
    localStorage.setItem(key, JSON.stringify(categoriesToInsert));
  } catch (err) {
    console.error('Failed to restore local category backups during wipe:', err);
  }

  // Update profile live
  const dbProfileUpdate = mapProfileToDB({
    currencyCode: 'INR',
    themePreference: 'light'
  });

  try {
    await supabase.from('profiles').update(dbProfileUpdate).eq('id', userId);
  } catch (err) {
    console.warn('Network error updating profile live during wipe:', err);
  }

  // Update profile locally
  saveProfileLocally(userId, dbProfileUpdate);
}

/**
 * Seeds playground demo data templates.
 */
export async function seedDemoData(userId: string): Promise<{ transactions: Transaction[], budgets: Budget[], categories: Category[] }> {
  try {
    // Clear existing items live
    await supabase.from('transactions').delete().eq('user_id', userId);
    await supabase.from('budgets').delete().eq('user_id', userId);
    await supabase.from('categories').delete().eq('user_id', userId);
  } catch (err) {
    console.warn('Network error clearing live data before seeding:', err);
  }

  // Wipe local backups
  wipeLocalBackupRows(userId);

  // Prep seed lists with user_id
  const categoriesToInsert = DEFAULT_CATEGORIES.map(cat => ({ ...mapCategoryToDB(cat), user_id: userId }));
  const budgetsToInsert = DEFAULT_BUDGETS.map(b => ({ ...mapBudgetToDB(b), user_id: userId }));
  const transactionsToInsert = DEFAULT_TRANSACTIONS.map(tx => ({ ...mapTransactionToDB(tx), user_id: userId }));

  try {
    // Insert items live
    await supabase.from('categories').insert(categoriesToInsert);
    await supabase.from('budgets').insert(budgetsToInsert);
    await supabase.from('transactions').insert(transactionsToInsert);
  } catch (err) {
    console.warn('Network error seeding data live:', err);
  }

  // Save locally
  try {
    localStorage.setItem(`sb-simulated-table-categories`, JSON.stringify(categoriesToInsert));
    localStorage.setItem(`sb-simulated-table-budgets`, JSON.stringify(budgetsToInsert));
    localStorage.setItem(`sb-simulated-table-transactions`, JSON.stringify(transactionsToInsert));
  } catch (err) {
    console.error('Failed to save seeded items to local backup:', err);
  }

  return {
    transactions: DEFAULT_TRANSACTIONS,
    budgets: DEFAULT_BUDGETS,
    categories: DEFAULT_CATEGORIES
  };
}

// ==========================================
// Robust Local Storage Fallbacks / Backups Helper Declarations
// ==========================================

function saveProfileLocally(userId: string, dbData: any) {
  try {
    const key = `sb-simulated-table-profiles`;
    const raw = localStorage.getItem(key);
    let rows = raw ? JSON.parse(raw) : [];
    const index = rows.findIndex((r: any) => r.id === userId);
    if (index !== -1) {
      rows[index] = { ...rows[index], ...dbData };
    } else {
      rows.push({ id: userId, ...dbData });
    }
    localStorage.setItem(key, JSON.stringify(rows));
  } catch (err) {
    console.error('Failed to save profile to local storage backup:', err);
  }
}

function getLocalBackupRows(tableName: string, userId: string): any[] {
  try {
    const key = `sb-simulated-table-${tableName}`;
    const raw = localStorage.getItem(key);
    const rows = raw ? JSON.parse(raw) : [];
    return rows.filter((r: any) => r.user_id === userId);
  } catch (err) {
    console.error(`Failed to read local backup for ${tableName}:`, err);
    return [];
  }
}

function saveLocalBackupRow(tableName: string, userId: string, id: string, data: any) {
  try {
    const key = `sb-simulated-table-${tableName}`;
    const raw = localStorage.getItem(key);
    let rows = raw ? JSON.parse(raw) : [];
    const index = rows.findIndex((r: any) => r.id === id);
    const rowWithUser = { ...data, id, user_id: userId };
    if (index !== -1) {
      rows[index] = { ...rows[index], ...rowWithUser };
    } else {
      rows.push(rowWithUser);
    }
    localStorage.setItem(key, JSON.stringify(rows));
  } catch (err) {
    console.error(`Failed to save local backup for ${tableName}:`, err);
  }
}

function deleteLocalBackupRow(tableName: string, userId: string, id: string) {
  try {
    const key = `sb-simulated-table-${tableName}`;
    const raw = localStorage.getItem(key);
    if (!raw) return;
    let rows = JSON.parse(raw);
    const filtered = rows.filter((r: any) => !(r.id === id && r.user_id === userId));
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch (err) {
    console.error(`Failed to delete local backup for ${tableName}:`, err);
  }
}

function wipeLocalBackupRows(userId: string) {
  try {
    ['transactions', 'budgets', 'categories'].forEach(tableName => {
      const key = `sb-simulated-table-${tableName}`;
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const rows = JSON.parse(raw);
      const filtered = rows.filter((r: any) => r.user_id !== userId);
      localStorage.setItem(key, JSON.stringify(filtered));
    });
  } catch (err) {
    console.error('Failed to wipe local backup rows:', err);
  }
}

