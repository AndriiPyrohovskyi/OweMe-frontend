import apiClient from '../client';

// Enums
export enum GroupsUserRole {
  Member = 'Member',
  Admin = 'Admin',
  Owner = 'Owner',
  Founder = 'Founder',
}

export enum RequestStatus {
  Opened = 'Opened',
  Canceled = 'Canceled',
  Accepted = 'Accepted',
  Declined = 'Declined',
  Closed = 'Closed',
}

// Interfaces
export interface Group {
  id: number;
  name: string;
  tag: string;
  description?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  members?: GroupMember[];
}

export interface GroupMember {
  id: number;
  user: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
  role: GroupsUserRole;
  joinedAt: string;
  group?: {
    id: number;
    name: string;
    tag: string;
  };
}

export interface GroupRequest {
  id: number;
  createdAt: string;
  requestStatus: RequestStatus;
  finishedAt?: string;
}

export interface RequestToGroup extends GroupRequest {
  sender: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
  group: {
    id: number;
    name: string;
    tag: string;
  };
  actor?: GroupMember;
}

export interface RequestFromGroup extends GroupRequest {
  sender: GroupMember;
  receiver: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
  canceledBy?: GroupMember;
}

export interface CreateGroupDto {
  name: string;
  tag: string;
  description?: string;
  avatarUrl?: string;
}

export interface UpdateGroupDto {
  name?: string;
  description?: string;
  avatarUrl?: string;
}

export interface ChangeRoleDto {
  newRole: GroupsUserRole;
}

// API
export const groupsApi = {
  // Health check
  healthcheck: async (): Promise<{ message: string }> => {
    const response = await apiClient.get('/groups/healthcheck');
    return response;
  },

  // GET Methods
  getMyGroups: async (): Promise<Group[]> => {
    const response = await apiClient.get<Group[]>('/groups/my-groups');
    return response;
  },

  getUserGroups: async (userId: number): Promise<Group[]> => {
    const response = await apiClient.get<Group[]>(`/groups/user/${userId}`);
    return response;
  },

  getGroup: async (groupId: number): Promise<Group> => {
    const response = await apiClient.get<Group>(`/groups/${groupId}`);
    return response;
  },

  getGroupMembers: async (groupId: number): Promise<GroupMember[]> => {
    const response = await apiClient.get<GroupMember[]>(`/groups/${groupId}/members`);
    return response;
  },

  getRequestsToGroup: async (groupId: number): Promise<RequestToGroup[]> => {
    const response = await apiClient.get<RequestToGroup[]>(`/groups/${groupId}/requests/to`);
    return response;
  },

  getRequestsFromGroup: async (groupId: number): Promise<RequestFromGroup[]> => {
    const response = await apiClient.get<RequestFromGroup[]>(`/groups/${groupId}/requests/from`);
    return response;
  },

  getMyRequestsToGroups: async (): Promise<RequestToGroup[]> => {
    const response = await apiClient.get<RequestToGroup[]>('/groups/requests/to/my');
    return response;
  },

  getMyRequestsFromGroups: async (): Promise<RequestFromGroup[]> => {
    const response = await apiClient.get<RequestFromGroup[]>('/groups/requests/from/my');
    return response;
  },

  // POST Methods
  createGroup: async (data: CreateGroupDto): Promise<Group> => {
    const response = await apiClient.post<Group>('/groups/create', data);
    return response;
  },

  sendRequestToGroup: async (groupId: number): Promise<void> => {
    await apiClient.post(`/groups/request/to/${groupId}`);
  },

  sendRequestFromGroup: async (groupId: number, userId: number): Promise<void> => {
    await apiClient.post(`/groups/request/from/${groupId}`, { receiverId: userId });
  },

  // PUT Methods
  updateGroup: async (groupId: number, data: UpdateGroupDto): Promise<Group> => {
    const response = await apiClient.put<Group>(`/groups/${groupId}`, data);
    return response;
  },

  changeMemberRole: async (groupId: number, userId: number, newRole: GroupsUserRole): Promise<void> => {
    await apiClient.put(`/groups/${groupId}/member/${userId}/role`, { newRole });
  },

  acceptRequestToGroup: async (requestId: number): Promise<void> => {
    await apiClient.put(`/groups/request/to/${requestId}/accept`);
  },

  acceptAllRequestsToGroup: async (groupId: number): Promise<void> => {
    await apiClient.put(`/groups/request/to/${groupId}/accept-all`);
  },

  acceptRequestFromGroup: async (requestId: number): Promise<void> => {
    await apiClient.put(`/groups/request/from/${requestId}/accept`);
  },

  acceptAllRequestsFromGroups: async (): Promise<void> => {
    await apiClient.put('/groups/request/from/accept-all');
  },

  declineRequestToGroup: async (requestId: number): Promise<void> => {
    await apiClient.put(`/groups/request/to/${requestId}/decline`);
  },

  declineAllRequestsToGroup: async (groupId: number): Promise<void> => {
    await apiClient.put(`/groups/request/to/${groupId}/decline-all`);
  },

  declineRequestFromGroup: async (requestId: number): Promise<void> => {
    await apiClient.put(`/groups/request/from/${requestId}/decline`);
  },

  declineAllRequestsFromGroups: async (): Promise<void> => {
    await apiClient.put('/groups/request/from/decline-all');
  },

  cancelRequestToGroup: async (requestId: number): Promise<void> => {
    await apiClient.put(`/groups/request/to/${requestId}/cancel`);
  },

  cancelAllRequestsToGroups: async (): Promise<void> => {
    await apiClient.put('/groups/request/to/cancel-all');
  },

  cancelRequestFromGroup: async (requestId: number): Promise<void> => {
    await apiClient.put(`/groups/request/from/${requestId}/cancel`);
  },

  cancelAllRequestsFromGroup: async (groupId: number): Promise<void> => {
    await apiClient.put(`/groups/request/from/${groupId}/cancel-all`);
  },

  // DELETE Methods
  deleteGroup: async (groupId: number): Promise<void> => {
    await apiClient.delete(`/groups/${groupId}`);
  },

  removeMember: async (groupId: number, userId: number): Promise<void> => {
    await apiClient.delete(`/groups/${groupId}/member/${userId}`);
  },
};
