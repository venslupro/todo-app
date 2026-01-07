import { Context } from 'hono';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

function generateTokens(user: { id: string; email: string; name: string }) {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET || 'fallback-secret',
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
}

export async function registerHandler(c: Context) {
  const env = c.env;
  const userData = c.get('validatedData') as { email: string; password: string; name: string };
  
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  
  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', userData.email)
    .single();
    
  if (existingUser) {
    return c.json({
      error: 'Conflict',
      message: 'User already exists'
    }, 409);
  }
  
  // Hash password
  const passwordHash = await bcrypt.hash(userData.password, 12);
  
  // Create user
  const { data: user, error } = await supabase
    .from('users')
    .insert([{
      email: userData.email,
      password_hash: passwordHash,
      name: userData.name
    }])
    .select('id, email, name')
    .single();
    
  if (error) {
    return c.json({
      error: 'Database Error',
      message: 'Failed to create user'
    }, 500);
  }
  
  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);
  
  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    },
    tokens: {
      access_token: accessToken,
      refresh_token: refreshToken
    }
  }, 201);
}

export async function loginHandler(c: Context) {
  const env = c.env;
  const credentials = c.get('validatedData') as { email: string; password: string };
  
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  
  // Get user with password hash
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, name, password_hash')
    .eq('email', credentials.email)
    .single();
    
  if (error || !user) {
    return c.json({
      error: 'Unauthorized',
      message: 'Invalid credentials'
    }, 401);
  }
  
  // Verify password
  const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash);
  
  if (!isValidPassword) {
    return c.json({
      error: 'Unauthorized',
      message: 'Invalid credentials'
    }, 401);
  }
  
  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user);
  
  return c.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    },
    tokens: {
      access_token: accessToken,
      refresh_token: refreshToken
    }
  });
}

export async function refreshTokenHandler(c: Context) {
  const env = c.env;
  const { refresh_token } = c.get('validatedData') as { refresh_token: string };
  
  try {
    // Verify refresh token
    const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret') as { id: string };
    
    const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
    
    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('id', decoded.id)
      .single();
      
    if (!user) {
      return c.json({
        error: 'Unauthorized',
        message: 'Invalid refresh token'
      }, 401);
    }
    
    // Generate new tokens
    const { accessToken, refreshToken } = generateTokens(user);
    
    return c.json({
      tokens: {
        access_token: accessToken,
        refresh_token: refreshToken
      }
    });
    
  } catch (error) {
    return c.json({
      error: 'Unauthorized',
      message: 'Invalid or expired refresh token'
    }, 401);
  }
}

export async function logoutHandler(c: Context) {
  // In a real implementation, you might want to blacklist the refresh token
  // For now, we'll just return success since JWTs are stateless
  return c.json({
    message: 'Logged out successfully'
  });
}