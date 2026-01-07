import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Real-time subscriptions for todos
export const subscribeToTodos = (callback: (payload: any) => void) => {
  return supabase
    .channel('todos')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'todos' 
      }, 
      callback
    )
    .subscribe();
};

// Real-time subscriptions for team members
export const subscribeToTeamMembers = (teamId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`team-${teamId}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'team_members',
        filter: `team_id=eq.${teamId}`
      }, 
      callback
    )
    .subscribe();
};