import api from "../client";
import { UpdateUserDto, UserRole } from "../types";

export interface GetPublicUserDto {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string;
  description: string;
}

export interface FullUserDto {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatarUrl: string;
  description: string;
  isBanned: boolean;
  banReason?: string;
  bannedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserChangeLogDto {
  id: number;
  actionedId: number;
  actionerId: number;
  action: string;
  createdAt: Date;
}

export interface GiveRoleDto {
  targetUserId: number;
  role: UserRole;
}

export interface BanUserDto {
  userId: number;
  reason?: string;
}

export interface UnbanUserDto {
  userId: number;
}

export const usersApi = {
  // Health check
  healthcheck: () => api.get('/users/healthcheck'),
  
  // Get all users (admin only)
  getAll: () => api.get<FullUserDto[]>('/users/'),
  
  // Get user role
  getCurrentRole: (targetUserId: number) => 
    api.get<UserRole>(`/users/userRole?targetUserId=${targetUserId}`),
  
  // Get user change logs
  getUserInLogs: (targetUserId: number) => 
    api.get<UserChangeLogDto[]>(`/users/userInLogs?targetUserId=${targetUserId}`),
  
  getUserOutLogs: (targetUserId: number) => 
    api.get<UserChangeLogDto[]>(`/users/userOutLogs?targetUserId=${targetUserId}`),
  
  // Search public users
  getPublicUsersByUsernamePart: (username: string) => 
    api.get<GetPublicUserDto[]>(`/users/publicUsersByUsernamePart?username=${username}`),
  
  getPublicUserByUsername: (username: string) => 
    api.get<GetPublicUserDto>(`/users/publicUserByUsername?username=${username}`),
  
  // Search full users (admin only)
  getFullUsersByUsernamePart: (username: string) => 
    api.get<FullUserDto[]>(`/users/fullUsersByUsernamePart?username=${username}`),
  
  getFullUserByUsername: (username: string) => 
    api.get<FullUserDto>(`/users/fullUserByUsername?username=${username}`),
  
  // Role management (admin only)
  giveNewRole: (data: GiveRoleDto) => 
    api.post<FullUserDto>('/users/userGiveNewRole', data),
  
  // Ban/unban (admin only)
  banUser: (data: BanUserDto) => 
    api.post<FullUserDto>('/users/banUser', data),
  
  unbanUser: (data: UnbanUserDto) => 
    api.post<FullUserDto>('/users/unbanUser', data),
  
  // Update user (owner or admin)
  updateUser: (targetUserId: number, data: UpdateUserDto) => 
    api.put<FullUserDto>(`/users/user/${targetUserId}`, data),
  
  // Delete user (admin only)
  deleteUser: (targetUserId: number) => 
    api.delete<void>(`/users/user/${targetUserId}`),

  getAdminStats: (userId: number) => 
    api.get(`/users/${userId}/admin-stats`),

  resetFields: (userId: number) => 
    api.post(`/users/${userId}/reset-fields`, {}),
};