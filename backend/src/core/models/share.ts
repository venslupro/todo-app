// core/models/share.ts
/**
 * Share permission enumeration
 */
export enum SharePermission {
  VIEW = 'view',
  EDIT = 'edit',
}

/**
 * TODO share relationship
 */
export interface TodoShare {
  id: string;
  todo_id: string;
  user_id: string;
  permission: SharePermission;
  shared_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create share data
 */
export interface CreateShare {
  todo_id: string;
  user_id: string;
  permission: SharePermission;
}

/**
 * Update share permission data
 */
export interface UpdateShare {
  permission: SharePermission;
}

/**
 * Share query parameters
 */
export interface ShareQueryParams {
  todo_id?: string;
  user_id?: string;
  permission?: SharePermission;
  limit?: number;
  offset?: number;
}
