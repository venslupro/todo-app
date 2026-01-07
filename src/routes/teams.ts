import { Hono } from 'hono';
import { createClient } from '@supabase/supabase-js';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Env, ApiResponse } from '../types';
import type { Team, TeamMember } from '../../shared/types';

const teamRoutes = new Hono<{ Bindings: Env }>();

// Validation schemas
const createTeamSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional()
});

const updateTeamSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional()
});

const addTeamMemberSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(['MEMBER', 'ADMIN']).default('MEMBER')
});

// Get all teams for user
teamRoutes.get('/', async (c) => {
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
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return c.json<ApiResponse>({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Invalid token'
      }, 401);
    }

    // Get teams where user is a member
    const { data: userTeams, error: userTeamsError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id);

    if (userTeamsError) {
      return c.json<ApiResponse>({
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Failed to fetch user teams'
      }, 500);
    }

    const teamIds = userTeams?.map(tm => tm.team_id) || [];
    
    if (teamIds.length === 0) {
      return c.json<ApiResponse<Team[]>>({
        success: true,
        data: []
      });
    }

    const { data: teams, error } = await supabase
      .from('teams')
      .select('*, members:team_members(count)')
      .in('id', teamIds);

    if (error) {
      return c.json<ApiResponse>({
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Failed to fetch teams'
      }, 500);
    }

    return c.json<ApiResponse<Team[]>>({
      success: true,
      data: teams || []
    });
  } catch (error) {
    console.error('List teams error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }, 500);
  }
});

// Create a new team
teamRoutes.post('/', zValidator('json', createTeamSchema), async (c) => {
  const authHeader = c.req.header('Authorization');
  const teamData = c.req.valid('json');
  
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

    // Create team
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert([{
        ...teamData,
        created_by: user.id
      }])
      .select()
      .single();

    if (teamError) {
      return c.json<ApiResponse>({
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Failed to create team'
      }, 500);
    }

    // Add creator as owner
    const { error: memberError } = await supabase
      .from('team_members')
      .insert([{
        team_id: team.id,
        user_id: user.id,
        role: 'OWNER'
      }]);

    if (memberError) {
      // Rollback team creation
      await supabase.from('teams').delete().eq('id', team.id);
      return c.json<ApiResponse>({
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Failed to add team member'
      }, 500);
    }

    return c.json<ApiResponse<Team>>({
      success: true,
      data: team,
      message: 'Team created successfully'
    }, 201);
  } catch (error) {
    console.error('Create team error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }, 500);
  }
});

// Get a single team
teamRoutes.get('/:id', async (c) => {
  const authHeader = c.req.header('Authorization');
  const teamId = c.req.param('id');
  
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

    // Check if user is a member of the team
    const { data: teamMember } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single();

    if (!teamMember) {
      return c.json<ApiResponse>({
        success: false,
        error: 'FORBIDDEN',
        message: 'You are not a member of this team'
      }, 403);
    }

    const { data: team, error } = await supabase
      .from('teams')
      .select('*, members:team_members(*, user:users(name, email))')
      .eq('id', teamId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return c.json<ApiResponse>({
          success: false,
          error: 'NOT_FOUND',
          message: 'Team not found'
        }, 404);
      }
      return c.json<ApiResponse>({
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Failed to fetch team'
      }, 500);
    }

    return c.json<ApiResponse<Team>>({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Get team error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }, 500);
  }
});

// Update a team
teamRoutes.put('/:id', zValidator('json', updateTeamSchema), async (c) => {
  const authHeader = c.req.header('Authorization');
  const teamId = c.req.param('id');
  const teamData = c.req.valid('json');
  
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

    // Check if user is an admin or owner of the team
    const { data: teamMember } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .in('role', ['OWNER', 'ADMIN'])
      .single();

    if (!teamMember) {
      return c.json<ApiResponse>({
        success: false,
        error: 'FORBIDDEN',
        message: 'You do not have permission to update this team'
      }, 403);
    }

    const { data: team, error } = await supabase
      .from('teams')
      .update(teamData)
      .eq('id', teamId)
      .select()
      .single();

    if (error) {
      return c.json<ApiResponse>({
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Failed to update team'
      }, 500);
    }

    return c.json<ApiResponse<Team>>({
      success: true,
      data: team,
      message: 'Team updated successfully'
    });
  } catch (error) {
    console.error('Update team error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }, 500);
  }
});

// Delete a team
teamRoutes.delete('/:id', async (c) => {
  const authHeader = c.req.header('Authorization');
  const teamId = c.req.param('id');
  
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

    // Check if user is the owner of the team
    const { data: teamMember } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .eq('role', 'OWNER')
      .single();

    if (!teamMember) {
      return c.json<ApiResponse>({
        success: false,
        error: 'FORBIDDEN',
        message: 'Only team owners can delete teams'
      }, 403);
    }

    // Delete team members first
    const { error: membersError } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId);

    if (membersError) {
      return c.json<ApiResponse>({
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Failed to delete team members'
      }, 500);
    }

    // Delete team
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (error) {
      return c.json<ApiResponse>({
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Failed to delete team'
      }, 500);
    }

    return c.json<ApiResponse>({
      success: true,
      message: 'Team deleted successfully'
    });
  } catch (error) {
    console.error('Delete team error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }, 500);
  }
});

// Add a team member
teamRoutes.post('/:id/members', zValidator('json', addTeamMemberSchema), async (c) => {
  const authHeader = c.req.header('Authorization');
  const teamId = c.req.param('id');
  const memberData = c.req.valid('json');
  
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

    // Check if user is an admin or owner of the team
    const { data: inviterMember } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .in('role', ['OWNER', 'ADMIN'])
      .single();

    if (!inviterMember) {
      return c.json<ApiResponse>({
        success: false,
        error: 'FORBIDDEN',
        message: 'You do not have permission to add members to this team'
      }, 403);
    }

    // Check if target user exists
    const { data: targetUser } = await supabase
      .from('users')
      .select('id')
      .eq('id', memberData.user_id)
      .single();

    if (!targetUser) {
      return c.json<ApiResponse>({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'Target user not found'
      }, 404);
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('user_id', memberData.user_id)
      .single();

    if (existingMember) {
      return c.json<ApiResponse>({
        success: false,
        error: 'MEMBER_EXISTS',
        message: 'User is already a member of this team'
      }, 400);
    }

    const { data: teamMember, error } = await supabase
      .from('team_members')
      .insert([{
        team_id: teamId,
        user_id: memberData.user_id,
        role: memberData.role
      }])
      .select('*, user:users(name, email)')
      .single();

    if (error) {
      return c.json<ApiResponse>({
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Failed to add team member'
      }, 500);
    }

    return c.json<ApiResponse<TeamMember>>({
      success: true,
      data: teamMember,
      message: 'Team member added successfully'
    }, 201);
  } catch (error) {
    console.error('Add team member error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }, 500);
  }
});

// Remove a team member
teamRoutes.delete('/:id/members/:userId', async (c) => {
  const authHeader = c.req.header('Authorization');
  const teamId = c.req.param('id');
  const userId = c.req.param('userId');
  
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

    // Check if user is an admin or owner of the team
    const { data: removerMember } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .in('role', ['OWNER', 'ADMIN'])
      .single();

    if (!removerMember) {
      return c.json<ApiResponse>({
        success: false,
        error: 'FORBIDDEN',
        message: 'You do not have permission to remove members from this team'
      }, 403);
    }

    // Check if target member exists
    const { data: targetMember } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single();

    if (!targetMember) {
      return c.json<ApiResponse>({
        success: false,
        error: 'MEMBER_NOT_FOUND',
        message: 'Team member not found'
      }, 404);
    }

    // Owners cannot be removed by admins
    if (targetMember.role === 'OWNER' && removerMember.role !== 'OWNER') {
      return c.json<ApiResponse>({
        success: false,
        error: 'FORBIDDEN',
        message: 'Only team owners can remove other owners'
      }, 403);
    }

    // Owners cannot remove themselves if they are the only owner
    if (targetMember.role === 'OWNER' && userId === user.id) {
      const { data: ownerCount } = await supabase
        .from('team_members')
        .select('*', { count: 'exact' })
        .eq('team_id', teamId)
        .eq('role', 'OWNER');

      if (ownerCount && ownerCount.length <= 1) {
        return c.json<ApiResponse>({
          success: false,
          error: 'FORBIDDEN',
          message: 'Cannot remove the only owner of a team'
        }, 403);
      }
    }

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) {
      return c.json<ApiResponse>({
        success: false,
        error: 'DATABASE_ERROR',
        message: 'Failed to remove team member'
      }, 500);
    }

    return c.json<ApiResponse>({
      success: true,
      message: 'Team member removed successfully'
    });
  } catch (error) {
    console.error('Remove team member error:', error);
    return c.json<ApiResponse>({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }, 500);
  }
});

export default teamRoutes;