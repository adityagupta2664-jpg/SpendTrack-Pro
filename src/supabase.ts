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
const isRealSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-supabase-project.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key-here' &&
  supabaseUrl.startsWith('http');

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
    // Check if we have an active simulated session
    const activeUser = getLocalData('sb-simulated-user', null);
    if (activeUser) {
      setTimeout(() => this.trigger('SIGNED_IN', { user: activeUser }), 50);
    }
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    this.listeners.push(callback);
    const activeUser = getLocalData('sb-simulated-user', null);
    callback('INITIAL_SESSION', activeUser ? { user: activeUser } : null);
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
    this.listeners.forEach(l => l(event, session));
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
    return {
      eq: (field: string, value: any) => {
        return {
          order: (orderField: string, { ascending = true } = {}) => {
            let result = this.getAllRows().filter(row => row[field] === value);
            result.sort((a, b) => {
              const valA = a[orderField];
              const valB = b[orderField];
              if (valA < valB) return ascending ? -1 : 1;
              if (valA > valB) return ascending ? 1 : -1;
              return 0;
            });
            return Promise.resolve({ data: result, error: null });
          },
          then: (resolve: any) => {
            const result = this.getAllRows().filter(row => row[field] === value);
            resolve({ data: result, error: null });
          }
        };
      },
      then: (resolve: any) => {
        resolve({ data: this.getAllRows(), error: null });
      }
    };
  }

  insert(data: any) {
    const rows = this.getAllRows();
    const records = Array.isArray(data) ? data : [data];
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
    return {
      select: () => ({
        single: () => Promise.resolve({ data: created[0], error: null }),
        then: (resolve: any) => resolve({ data: created, error: null })
      }),
      then: (resolve: any) => resolve({ data: created, error: null })
    };
  }

  update(data: any) {
    return {
      eq: (field: string, value: any) => {
        const rows = this.getAllRows();
        let updatedCount = 0;
        const updatedRows = rows.map(row => {
          if (row[field] === value) {
            updatedCount++;
            return { ...row, ...data };
          }
          return row;
        });
        this.saveAllRows(updatedRows);
        return Promise.resolve({ data: updatedRows.filter(row => row[field] === value), error: null });
      }
    };
  }

  delete() {
    return {
      eq: (field: string, value: any) => {
        const rows = this.getAllRows();
        const remaining = rows.filter(row => row[field] !== value);
        this.saveAllRows(remaining);
        return Promise.resolve({ error: null });
      }
    };
  }

  upsert(data: any) {
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
    return Promise.resolve({ data: records, error: null });
  }
}

const isProd = !!(import.meta as any).env.PROD;
const isDev = !!(import.meta as any).env.DEV;

// Allow the user to bypass the config screen in production and use high-fidelity localStorage sandbox
const useDemoMode = typeof window !== 'undefined' && localStorage.getItem('sb-use-demo-mode') === 'true';

export const isProdWithInvalidConfig = !!(isProd && !isRealSupabaseConfigured && !useDemoMode);
export const isDevSandbox = !!((isDev || useDemoMode) && !isRealSupabaseConfigured);
export const isSupabaseLive = !!isRealSupabaseConfigured;

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
