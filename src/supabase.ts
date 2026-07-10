import { createClient } from '@supabase/supabase-js';

const sanitizeEnvVar = (val: any): string => {
  if (!val) return '';
  return val.trim().replace(/^["']|["']$/g, '').trim();
};

const supabaseUrlRaw = sanitizeEnvVar((import.meta as any).env.VITE_SUPABASE_URL);
const supabaseAnonKey = sanitizeEnvVar((import.meta as any).env.VITE_SUPABASE_ANON_KEY);

// Auto-format URL if only project ID is provided (e.g. 'bdvvalaotrcwleyybjck')
const supabaseUrl = supabaseUrlRaw && !supabaseUrlRaw.startsWith('http') && /^[a-z0-9]{15,25}$/i.test(supabaseUrlRaw)
  ? `https://${supabaseUrlRaw}.supabase.co`
  : supabaseUrlRaw;

// Check if credentials are valid
export const isRealSupabaseConfigured = 
  !!(supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-supabase-project.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key-here' &&
  supabaseUrl.startsWith('http'));

// Helper to manage high-fidelity mock local storage database
const getLocalData = (key: string, defaultValue: any) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setLocalData = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// High-fidelity local state proxy that mirrors Supabase Client API
class LocalSupabaseAuth {
  private listeners: Array<(event: string, session: any) => void> = [];

  constructor() {
    // No redundant trigger on startup is needed, since onAuthStateChange will trigger with INITIAL_SESSION
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    this.listeners.push(callback);
    const activeUser = getLocalData('sb-simulated-user', null);
    // Real Supabase callbacks run asynchronously to let app subscription complete cleanly
    setTimeout(() => {
      callback('INITIAL_SESSION', activeUser ? { user: activeUser } : null);
    }, 0);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter(l => l !== callback);
          }
        }
      }
    };
  }

  private trigger(event: string, session: any) {
    // Real Supabase events are triggered asynchronously on next event-loop tick
    setTimeout(() => {
      this.listeners.forEach(l => l(event, session));
    }, 0);
  }

  async signUp({ email, password, options }: any) {
    const users = getLocalData('sb-simulated-users-db', []);
    if (users.find((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
      return { data: { user: null }, error: { message: 'This email address is already registered.' } };
    }

    const newUser = {
      id: 'usr-' + Math.random().toString(36).substr(2, 9),
      email,
      created_at: new Date().toISOString(),
      user_metadata: options?.data || {}
    };

    users.push({ ...newUser, password });
    setLocalData('sb-simulated-users-db', users);
    
    // Auto-login on signup
    setLocalData('sb-simulated-user', newUser);
    this.trigger('SIGNED_IN', { user: newUser });

    return { data: { user: newUser }, error: null };
  }

  async signInWithPassword({ email, password }: any) {
    const users = getLocalData('sb-simulated-users-db', []);
    const found = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (!found) {
      return { data: { user: null }, error: { message: 'Invalid email or password.' } };
    }

    const { password: _, ...userWithoutPassword } = found;
    setLocalData('sb-simulated-user', userWithoutPassword);
    this.trigger('SIGNED_IN', { user: userWithoutPassword });

    return { data: { user: userWithoutPassword }, error: null };
  }

  async signOut() {
    setLocalData('sb-simulated-user', null);
    this.trigger('SIGNED_OUT', null);
    return { error: null };
  }

  async getUser() {
    const user = getLocalData('sb-simulated-user', null);
    return { data: { user }, error: null };
  }

  async resetPasswordForEmail(email: string, options: any = {}) {
    const users = getLocalData('sb-simulated-users-db', []);
    const found = users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      return { data: null, error: { message: 'No registered user found with this email address.' } };
    }
    return { data: {}, error: null };
  }

  async updateUser({ password }: any) {
    const user = getLocalData('sb-simulated-user', null);
    if (!user) {
      return { data: { user: null }, error: { message: 'Not authenticated.' } };
    }
    const users = getLocalData('sb-simulated-users-db', []);
    const idx = users.findIndex((u: any) => u.id === user.id);
    if (idx !== -1) {
      users[idx].password = password;
      setLocalData('sb-simulated-users-db', users);
    }
    return { data: { user }, error: null };
  }
}

class LocalSupabaseQueryBuilder {
  private tableName: string;
  private userId: string | null = null;
  private filters: Array<{ field: string; value: any }> = [];
  private orderField: string | null = null;
  private orderAscending: boolean = true;
  private updateData: any = null;
  private isInsert: boolean = false;
  private isUpdate: boolean = false;
  private isDelete: boolean = false;
  private insertData: any = null;

  constructor(tableName: string) {
    this.tableName = tableName;
    const user = getLocalData('sb-simulated-user', null);
    this.userId = user?.id || 'anonymous';
  }

  private getStorageKey() {
    return `sb-simulated-table-${this.tableName}`;
  }

  private getAllRows(): any[] {
    return getLocalData(this.getStorageKey(), []);
  }

  private saveAllRows(rows: any[]) {
    setLocalData(this.getStorageKey(), rows);
  }

  select(columns: string = '*') {
    this.filters = [];
    return this;
  }

  insert(data: any) {
    this.isInsert = true;
    this.insertData = data;
    return this;
  }

  update(data: any) {
    this.isUpdate = true;
    this.updateData = data;
    this.filters = [];
    return this;
  }

  delete() {
    this.isDelete = true;
    this.filters = [];
    return this;
  }

  eq(field: string, value: any) {
    this.filters.push({ field, value });
    return this;
  }

  order(orderField: string, { ascending = true } = {}) {
    this.orderField = orderField;
    this.orderAscending = ascending;
    return this;
  }

  single() {
    return {
      then: (resolve: any, reject: any) => {
        this.execute().then(res => {
          if (res.error) {
            resolve({ data: null, error: res.error });
          } else {
            resolve({ data: res.data ? res.data[0] : null, error: null });
          }
        }, reject);
      }
    };
  }

  then(resolve: any, reject: any) {
    return this.execute().then(resolve, reject);
  }

  private async execute() {
    let rows = this.getAllRows();

    if (this.isInsert) {
      const records = Array.isArray(this.insertData) ? this.insertData : [this.insertData];
      const created: any[] = [];
      records.forEach(item => {
        const newRecord = {
          ...item,
          created_at: item.created_at || new Date().toISOString()
        };
        rows.push(newRecord);
        created.push(newRecord);
      });
      this.saveAllRows(rows);
      return { data: created, error: null };
    }

    if (this.isUpdate) {
      const updatedRows = rows.map(row => {
        const matches = this.filters.every(f => row[f.field] === f.value);
        if (matches) {
          return { ...row, ...this.updateData };
        }
        return row;
      });
      this.saveAllRows(updatedRows);
      const matches = updatedRows.filter(row => this.filters.every(f => row[f.field] === f.value));
      return { data: matches, error: null };
    }

    if (this.isDelete) {
      const remaining = rows.filter(row => !this.filters.every(f => row[f.field] === f.value));
      this.saveAllRows(remaining);
      return { error: null };
    }

    // Default SELECT
    let result = rows.filter(row => this.filters.every(f => row[f.field] === f.value));

    if (this.orderField) {
      result.sort((a, b) => {
        const valA = a[this.orderField!];
        const valB = b[this.orderField!];
        if (valA < valB) return this.orderAscending ? -1 : 1;
        if (valA > valB) return this.orderAscending ? 1 : -1;
        return 0;
      });
    }

    return { data: result, error: null };
  }

  async upsert(data: any) {
    const rows = this.getAllRows();
    const records = Array.isArray(data) ? data : [data];
    
    records.forEach(item => {
      const index = rows.findIndex(row => row.id === item.id);
      if (index !== -1) {
        rows[index] = { ...rows[index], ...item };
      } else {
        rows.push(item);
      }
    });

    this.saveAllRows(rows);
    return { data: records, error: null };
  }
}

const isProd = !!(import.meta as any).env.PROD;
const isDev = !!(import.meta as any).env.DEV;

// Allow the user to bypass the config screen in production and use high-fidelity localStorage sandbox
const useDemoMode = typeof window !== 'undefined' && localStorage.getItem('sb-use-demo-mode') === 'true';

export const isProdWithInvalidConfig = !!(isProd && !isRealSupabaseConfigured && !useDemoMode);
export const isDevSandbox = !!((isDev || useDemoMode) && (!isRealSupabaseConfigured || useDemoMode));
export const isSupabaseLive = !!(isRealSupabaseConfigured && !useDemoMode);

const rejectConfigError = () => {
  return Promise.reject(new Error("Application configuration error. The cloud backend is not configured correctly."));
};

const chainableError: any = {
  select: () => chainableError,
  insert: () => chainableError,
  update: () => chainableError,
  delete: () => chainableError,
  upsert: () => chainableError,
  eq: () => chainableError,
  single: () => chainableError,
  order: () => chainableError,
  then: (onfulfilled: any, onrejected: any) => {
    const p = Promise.reject(new Error("Application configuration error. The cloud backend is not configured correctly."));
    return p.then(onfulfilled, onrejected);
  }
};

// Client Export
export const supabase = isSupabaseLive
  ? createClient(supabaseUrl, supabaseAnonKey)
  : isDevSandbox
    ? ({
        auth: new LocalSupabaseAuth(),
        from: (tableName: string) => new LocalSupabaseQueryBuilder(tableName)
      } as any)
    : ({
        auth: {
          onAuthStateChange: (callback: any) => {
            return {
              data: {
                subscription: {
                  unsubscribe: () => {}
                }
              }
            };
          },
          getUser: rejectConfigError,
          signUp: rejectConfigError,
          signInWithPassword: rejectConfigError,
          signInWithOAuth: rejectConfigError,
          signOut: rejectConfigError,
          resetPasswordForEmail: rejectConfigError,
          updateUser: rejectConfigError
        },
        from: () => chainableError
      } as any);

if (isProdWithInvalidConfig) {
  console.error('[SpendTrack Pro] Blocked initialization due to invalid production Supabase configuration.');
} else {
  console.log(`[SpendTrack Pro] Initialized ${isSupabaseLive ? 'LIVE Production Supabase' : 'LOCAL Safe Simulated Sandbox'} Client (useDemoMode: ${useDemoMode})`);
}
