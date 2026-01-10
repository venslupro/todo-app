// core/models/share.ts
/**
 * 分享权限枚举
 */
export enum SharePermission {
  VIEW = 'view',
  EDIT = 'edit',
}

/**
 * TODO分享关系
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
 * 创建分享DTO
 */
export interface CreateShareDto {
  todo_id: string;
  user_id: string;
  permission: SharePermission;
}

/**
 * 更新分享权限DTO
 */
export interface UpdateShareDto {
  permission: SharePermission;
}

/**
 * 分享查询参数
 */
export interface ShareQueryParams {
  todo_id?: string;
  user_id?: string;
  permission?: SharePermission;
  limit?: number;
  offset?: number;
}
