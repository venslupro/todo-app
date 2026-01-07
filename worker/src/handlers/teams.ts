import { Context } from 'hono';
import { createClient } from '@supabase/supabase-js';
import type { 
  CreateTeamRequest, 
  UpdateTeamRequest, 
  AddTeamMemberRequest 
} from '@/shared/types';

export async function listTeamsHandler(c: Context) {
  const user = c.get('user');
  const env = c.env;
  
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  
  const { data: teams, error } = await supabase
    .from('teams')
    .select('*, members:team_members(user_id, role)')
    .or(`created_by.eq.${user.id},id.in.(select team_id from team_members where user_id.eq.${user.id})`);
  
  if (error) {
    return c.json({
      error: 'Database Error',
      message: 'Failed to fetch teams'
    }, 500);
  }
  
  return c.json({ teams: teams || [] });
}

export async function createTeamHandler(c: Context) {
  const user = c.get('user');
  const env = c.env;
  const teamData = c.get('validatedData') as CreateTeamRequest;
  
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  
  const { data: team, error } = await supabase
    .from('teams')
    .insert([{
      ...teamData,
      created_by: user.id
    }])
    .select('*, members:team_members(user_id, role)')
    .single();
  
  if (error) {
    return c.json({
      error: 'Database Error',
      message: 'Failed to create team'
    }, 500);
  }
  
  return c.json(team, 201);
}

export async function getTeamHandler(c: Context) {
  const user = c.get('user');
  const env = c.env;
  const { id } = c.req.param();
  
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  
  const { data: team, error } = await supabase
    .from('teams')
    .select('*, members:team_members(user_id, role)')
    .eq('id', id)
    .or(`created_by.eq.${user.id},id.in.(select team_id from team_members where user_id.eq.${user.id})`)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return c.json({
        error: 'Not Found',
        message: 'Team not found'
      }, 404);
    }
    
    return c.json({
      error: 'Database Error',
      message: 'Failed to fetch team'
    }, 500);
  }
  
  return c.json(team);
}

export async function updateTeamHandler(c: Context) {
  const user = c.get('user');
  const env = c.env;
  const { id } = c.req.param();
  const updateData = c.get('validatedData') as UpdateTeamRequest;
  
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  
  // Check if user is team owner
  const { data: existingTeam } = await supabase
    .from('teams')
    .select('created_by')
    .eq('id', id)
    .eq('created_by', user.id)
    .single();
  
  if (!existingTeam) {
    return c.json({
      error: 'Forbidden',
      message: 'Only team owner can update team'
    }, 403);
  }
  
  const { data: team, error } = await supabase
    .from('teams')
    .update(updateData)
    .eq('id', id)
    .select('*, members:team_members(user_id, role)')
    .single();
  
  if (error) {
    return c.json({
      error: 'Database Error',
      message: 'Failed to update team'
    }, 500);
  }
  
  return c.json(team);
}

export async function deleteTeamHandler(c: Context) {
  const user = c.get('user');
  const env = c.env;
  const { id } = c.req.param();
  
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  
  // Check if user is team owner
  const { data: existingTeam } = await supabase
    .from('teams')
    .select('created_by')
    .eq('id', id)
    .eq('created_by', user.id)
    .single();
  
  if (!existingTeam) {
    return c.json({
      error: 'Forbidden',
      message: 'Only team owner can delete team'
    }, 403);
  }
  
  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', id);
  
  if (error) {
    return c.json({
      error: 'Database Error',
      message: 'Failed to delete team'
    }, 500);
  }
  
  return c.body(null, 204);
}

export async function addTeamMemberHandler(c: Context) {
  const user = c.get('user');
  const env = c.env;
  const { id: teamId } = c.req.param();
  const memberData = c.get('validatedData') as AddTeamMemberRequest;
  
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  
  // Check if user is team owner or admin
  const { data: teamMember } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', user.id)
    .in('role', ['OWNER', 'ADMIN'])
    .single();
  
  if (!teamMember) {
    return c.json({
      error: 'Forbidden',
      message: 'Only team owners or admins can add members'
    }, 403);
  }
  
  const { data: member, error } = await supabase
    .from('team_members')
    .insert([{
      team_id: teamId,
      user_id: memberData.user_id,
      role: memberData.role || 'MEMBER'
    }])
    .select('user_id, role')
    .single();
  
  if (error) {
    if (error.code === '23505') {
      return c.json({
        error: 'Conflict',
        message: 'User is already a team member'
      }, 409);
    }
    
    return c.json({
      error: 'Database Error',
      message: 'Failed to add team member'
    }, 500);
  }
  
  return c.json(member, 201);
}

export async function removeTeamMemberHandler(c: Context) {
  const user = c.get('user');
  const env = c.env;
  const { id: teamId, userId } = c.req.param();
  
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  
  // Check if user is team owner or admin
  const { data: teamMember } = await supabase
    .from('team_members')
    .select('role')
    .eq('team_id', teamId)
    .eq('user_id', user.id)
    .in('role', ['OWNER', 'ADMIN'])
    .single();
  
  if (!teamMember) {
    return c.json({
      error: 'Forbidden',
      message: 'Only team owners or admins can remove members'
    }, 403);
  }
  
  // Cannot remove self if owner
  if (userId === user.id && teamMember.role === 'OWNER') {
    return c.json({
      error: 'Forbidden',
      message: 'Team owner cannot remove themselves'
    }, 403);
  }
  
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', userId);
  
  if (error) {
    return c.json({
      error: 'Database Error',
      message: 'Failed to remove team member'
    }, 500);
  }
  
  return c.body(null, 204);
}