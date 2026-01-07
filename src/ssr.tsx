import { renderToReadableStream } from 'react-dom/server';
import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import App from '../client/App';
import { AuthProvider } from '../client/contexts/AuthContext';
import { TodoProvider } from '../client/contexts/TodoContext';
import type { Env } from './types';

export const ssrHandler = async (c: any) => {
  const supabase = createClient(
    c.env.SUPABASE_URL,
    c.env.SUPABASE_ANON_KEY
  );

  // Get session from cookies or headers
  const session = await getSessionFromRequest(c);
  
  const app = (
    <AuthProvider initialUser={session?.user || null}>
      <TodoProvider>
        <App />
      </TodoProvider>
    </AuthProvider>
  );

  const stream = await renderToReadableStream(app, {
    bootstrapModules: ['/client/index.js']
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
};

async function getSessionFromRequest(c: any) {
  const authHeader = c.req.header('Authorization');
  
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const supabase = createClient(
      c.env.SUPABASE_URL,
      c.env.SUPABASE_ANON_KEY
    );
    
    const { data: { user } } = await supabase.auth.getUser(token);
    return user ? { user, access_token: token } : null;
  }
  
  return null;
}