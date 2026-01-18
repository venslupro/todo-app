import { Context, Next } from 'hono';
import { createRemoteJWKSet, jwtVerify } from 'jose';

export const authMiddleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.substring(7);
  
  try {
    const supabaseUrl = (c.env as any).SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('Supabase URL not configured');
    }

    const JWKS = createRemoteJWKSet(new URL(`${supabaseUrl}/auth/v1/jwks`));
    const { payload } = await jwtVerify(token, JWKS);

    (c as any).set('userId', payload.sub);
    (c as any).set('userEmail', payload.email);
    
    await next();
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};