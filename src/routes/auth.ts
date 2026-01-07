import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env, ApiResponse, AuthResponse } from '../types';

const authRoutes = new Hono<{ Bindings: Env }>();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(255)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1)
});

const changePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8)
});

const updateProfileSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  email: z.string().email().optional()
});

// Register endpoint
authRoutes.post('/register', zValidator('json', registerSchema), async (c) => {
  const { email, password, name } = c.req.valid('json');
  
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  
  try {
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    if (authError) {
      return c.json<ApiResponse>({
        success: false,
        error: 'AUTH_ERROR',
        message: authError.message
      }, 400);
    }

    if (!authData.user) {
      return c.json<ApiResponse>({
        success: false,
        error: 'USER_CREATION_FAILED',
        message: 'Failed to create user'
      }, 500);
    }

    // Create user profile in database
    const supabaseAdmin = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .insert([{
        id: authData.user.id,
        email: authData.user.email!,
        name: name
      }]);

    if (profileError) {
      // Rollback auth user creation if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return c.json<ApiResponse>({
        success: false,
        error: 'PROFILE_CREATION_FAILED',
        message: 'Failed to create user profile'
      }, 500);
    }

    const response: AuthResponse = {
      user: {
        id: authData.user.id,
        email: authData.user.email!,
        name: name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      session: {
        access_token: authData.session?.access_token || '',
        refresh_token: authData.session?.refresh_token || '',
        expires_in: authData.session?.expires_in || 3600
      }
    };

    return c.json<ApiResponse<AuthResponse>>({
      success: true,
      data: response
    }, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }, 500);
  }
});

// Login endpoint
authRoutes.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return c.json<ApiResponse>({
        success: false,
        error: 'AUTH_ERROR',
        message: 'Invalid credentials'
      }, 401);
    }

    if (!authData.user || !authData.session) {
      return c.json<ApiResponse>({
        success: false,
        error: 'AUTH_ERROR',
        message: 'Authentication failed'
      }, 401);
    }

    // Get user profile
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (!userProfile) {
      return c.json<ApiResponse>({
        success: false,
        error: 'PROFILE_NOT_FOUND',
        message: 'User profile not found'
      }, 404);
    }

    const response: AuthResponse = {
      user: userProfile,
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_in: authData.session.expires_in
      }
    };

    return c.json<ApiResponse<AuthResponse>>({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }, 500);
  }
});

// Logout endpoint
authRoutes.post('/logout', async (c) => {
  const authHeader = c.req.header('Authorization');
  
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
    
    await supabase.auth.signOut();
  }

  return c.json<ApiResponse>({
    success: true,
    message: 'Logged out successfully'
  });
});

// Refresh token endpoint
authRoutes.post('/refresh', zValidator('json', refreshTokenSchema), async (c) => {
  const { refresh_token } = c.req.valid('json');
  
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  
  try {
    const { data: authData, error: authError } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (authError) {
      return c.json<ApiResponse>({
        success: false,
        error: 'AUTH_ERROR',
        message: 'Invalid refresh token'
      }, 401);
    }

    if (!authData.session || !authData.user) {
      return c.json<ApiResponse>({
        success: false,
        error: 'AUTH_ERROR',
        message: 'Failed to refresh session'
      }, 401);
    }

    // Get user profile
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (!userProfile) {
      return c.json<ApiResponse>({
        success: false,
        error: 'PROFILE_NOT_FOUND',
        message: 'User profile not found'
      }, 404);
    }

    const response: AuthResponse = {
      user: userProfile,
      session: {
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
        expires_in: authData.session.expires_in
      }
    };

    return c.json<ApiResponse<AuthResponse>>({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }, 500);
  }
});

// Change password endpoint
authRoutes.post('/change-password', zValidator('json', changePasswordSchema), async (c) => {
  const authHeader = c.req.header('Authorization');
  const { current_password, new_password } = c.req.valid('json');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json<ApiResponse>({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Missing or invalid authorization header'
    }, 401);
  }

  const token = authHeader.slice(7);
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  
  try {
    // First verify current password
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return c.json<ApiResponse>({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Invalid token'
      }, 401);
    }

    // Update password using Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      password: new_password
    });

    if (updateError) {
      return c.json<ApiResponse>({
        success: false,
        error: 'PASSWORD_UPDATE_FAILED',
        message: updateError.message
      }, 400);
    }

    return c.json<ApiResponse>({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }, 500);
  }
});

// Update profile endpoint
authRoutes.put('/profile', zValidator('json', updateProfileSchema), async (c) => {
  const authHeader = c.req.header('Authorization');
  const profileData = c.req.valid('json');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json<ApiResponse>({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Missing or invalid authorization header'
    }, 401);
  }

  const token = authHeader.slice(7);
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return c.json<ApiResponse>({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Invalid token'
      }, 401);
    }

    // Update user profile
    const { data: updatedProfile, error: updateError } = await supabase
      .from('users')
      .update(profileData)
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      return c.json<ApiResponse>({
        success: false,
        error: 'PROFILE_UPDATE_FAILED',
        message: updateError.message
      }, 400);
    }

    return c.json<ApiResponse>({
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }, 500);
  }
});

// Get current user endpoint
authRoutes.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json<ApiResponse>({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Missing or invalid authorization header'
    }, 401);
  }

  const token = authHeader.slice(7);
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
  
  try {
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) {
      return c.json<ApiResponse>({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Invalid token'
      }, 401);
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!userProfile) {
      return c.json<ApiResponse>({
        success: false,
        error: 'PROFILE_NOT_FOUND',
        message: 'User profile not found'
      }, 404);
    }

    return c.json<ApiResponse>({
      success: true,
      data: userProfile
    });
  } catch (error) {
    console.error('Get user error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }, 500);
  }
});

export default authRoutes;