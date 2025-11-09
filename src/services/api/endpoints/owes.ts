import api from "../client";

// Enums
export enum OweStatus {
  Opened = "Opened",
  Canceled = "Canceled",
  Accepted = "Accepted",
  Declined = "Declined",
  Returned = "Returned",
  PartlyReturned = "PartlyReturned"
}

export enum ReturnStatus {
  Opened = "Opened",
  Canceled = "Canceled",
  Accepted = "Accepted",
  Declined = "Declined"
}

// Base Entities
export interface FullOwe {
  id: number;
  name: string;
  description?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  fromUser: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  oweItems: OweItem[];
}

export interface OweItem {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  fullOwe: {
    id: number;
    name: string;
  };
  oweParticipants: OweParticipant[];
}

export interface OweParticipant {
  id: number;
  sum: number;
  status: OweStatus;
  createdAt: Date;
  updatedAt: Date;
  oweItem: {
    id: number;
    name: string;
  };
  toUser?: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
  group?: {
    id: number;
    name: string;
    avatarUrl?: string;
  };
  oweReturns: OweReturn[];
}

export interface OweReturn {
  id: number;
  returned: number;
  status: ReturnStatus;
  createdAt: Date;
  updatedAt: Date;
  participant: {
    id: number;
    sum: number;
  };
}

// DTOs for creating
export interface CreateOweParticipantDto {
  sum: number;
  toUserId?: number;
  groupId?: number;
}

export interface CreateOweItemDto {
  sum: number;
  name: string;
  description?: string;
  imageUrl?: string;
  participants: CreateOweParticipantDto[];
}

export interface CreateOweDto {
  name: string;
  description?: string;
  image?: string;
  fromUserId: number;
  oweItems: CreateOweItemDto[];
}

export interface AddParticipantDto {
  oweItemId: number;
  sum: number;
  toUserId?: number;
  groupId?: number;
}

export interface ReturnOweDto {
  participantId: number;
  returned: number;
}

// DTOs for updating
export interface UpdateOweDto {
  name?: string;
  description?: string;
  image?: string;
  status?: OweStatus;
}

export interface UpdateOweItemDto {
  sum?: number;
  name?: string;
  description?: string;
  imageUrl?: string;
  status?: OweStatus;
}

export interface UpdateOweParticipantDto {
  sum?: number;
}

export const owesApi = {
  // ---------------------------------- Health Check ------------------------------------
  healthcheck: () => api.get('/owes/healthcheck'),

  // ---------------------------------- GET Full Owes ------------------------------------
  // Get all full owes (admin only)
  getAllFullOwes: () => api.get<FullOwe[]>('/owes/full'),

  // Get full owes by user
  getFullOwesByUser: (userId: number) => 
    api.get<FullOwe[]>(`/owes/full/user/${userId}`),

  // Get my full owes
  getMyFullOwes: () => api.get<FullOwe[]>('/owes/full/my'),

  // Get full owes by group
  getFullOwesByGroup: (groupId: number) => 
    api.get<FullOwe[]>(`/owes/full/group/${groupId}`),

  // Get full owes by group and member
  getFullOwesByGroupMember: (groupId: number, userId: number) => 
    api.get<FullOwe[]>(`/owes/full/group/${groupId}/member/${userId}`),

  // Get full owe by ID
  getFullOwe: (id: number) => api.get<FullOwe>(`/owes/full/${id}`),

  // ---------------------------------- GET Owe Items ------------------------------------
  // Get all owe items (admin only)
  getAllOweItems: () => api.get<OweItem[]>('/owes/items'),

  // Get owe items by user
  getOweItemsByUser: (userId: number) => 
    api.get<OweItem[]>(`/owes/items/user/${userId}`),

  // Get my owe items
  getMyOweItems: () => api.get<OweItem[]>('/owes/items/my'),

  // Get owe items by group
  getOweItemsByGroup: (groupId: number) => 
    api.get<OweItem[]>(`/owes/items/group/${groupId}`),

  // Get owe item by ID
  getOweItem: (id: number) => api.get<OweItem>(`/owes/items/${id}`),

  // ---------------------------------- GET Owe Participants ------------------------------------
  // Get all owe participants (admin only)
  getAllOweParticipants: () => api.get<OweParticipant[]>('/owes/participants'),

  // Get owe participants by user
  getOweParticipantsByUser: (userId: number) => 
    api.get<OweParticipant[]>(`/owes/participants/user/${userId}`),

  // Get my owe participants
  getMyOweParticipants: () => api.get<OweParticipant[]>('/owes/participants/my'),

  // Get owe participants by group
  getOweParticipantsByGroup: (groupId: number) => 
    api.get<OweParticipant[]>(`/owes/participants/group/${groupId}`),

  // Get owe participant by ID
  getOweParticipant: (id: number) => api.get<OweParticipant>(`/owes/participants/${id}`),

  // ---------------------------------- GET Owe Returns ------------------------------------
  // Get all owe returns (admin only)
  getAllOweReturns: () => api.get<OweReturn[]>('/owes/returns'),

  // Get owe returns by user
  getOweReturnsByUser: (userId: number) => 
    api.get<OweReturn[]>(`/owes/returns/user/${userId}`),

  // Get my owe returns
  getMyOweReturns: () => api.get<OweReturn[]>('/owes/returns/my'),

  // Get owe returns by group
  getOweReturnsByGroup: (groupId: number) => 
    api.get<OweReturn[]>(`/owes/returns/group/${groupId}`),

  // Get owe return by ID
  getOweReturn: (id: number) => api.get<OweReturn>(`/owes/returns/${id}`),

  // ---------------------------------- POST (Create) ------------------------------------
  // Create full owe
  createFullOwe: (data: CreateOweDto) => 
    api.post<FullOwe>('/owes/full', data),

  // Create owe item
  createOweItem: (fullOweId: number, itemDto: CreateOweItemDto) => 
    api.post<OweItem>('/owes/items', { fullOweId, itemDto }),

  // Add participant
  addParticipant: (data: AddParticipantDto) => 
    api.post<OweParticipant>('/owes/participants', data),

  // Create owe return
  createOweReturn: (data: ReturnOweDto) => 
    api.post<OweReturn>('/owes/returns', data),

  // ---------------------------------- PUT (Update) ------------------------------------
  // Update full owe
  updateFullOwe: (id: number, data: UpdateOweDto) => 
    api.put<FullOwe>(`/owes/full/${id}`, data),

  // Update owe item
  updateOweItem: (id: number, data: UpdateOweItemDto) => 
    api.put<OweItem>(`/owes/items/${id}`, data),

  // Update owe participant
  updateOweParticipant: (id: number, data: UpdateOweParticipantDto) => 
    api.put<OweParticipant>(`/owes/participants/${id}`, data),

  // ---------------------------------- PUT (Status Management - Participants) ------------------------------------
  // Cancel owe participant (owner only)
  cancelOweParticipant: (id: number) => 
    api.put<OweParticipant>(`/owes/participants/${id}/cancel`, {}),

  // Accept owe participant (participant only)
  acceptOweParticipant: (id: number) => 
    api.put<OweParticipant>(`/owes/participants/${id}/accept`, {}),

  // Decline owe participant (participant only)
  declineOweParticipant: (id: number) => 
    api.put<OweParticipant>(`/owes/participants/${id}/decline`, {}),

  // ---------------------------------- PUT (Status Management - Returns) ------------------------------------
  // Cancel owe return (participant only)
  cancelOweReturn: (id: number) => 
    api.put<OweReturn>(`/owes/returns/${id}/cancel`, {}),

  // Accept owe return (owner only)
  acceptOweReturn: (id: number) => 
    api.put<OweReturn>(`/owes/returns/${id}/accept`, {}),

  // Decline owe return (owner only)
  declineOweReturn: (id: number) => 
    api.put<OweReturn>(`/owes/returns/${id}/decline`, {}),

  // ---------------------------------- DELETE ------------------------------------
  // Delete full owe
  deleteFullOwe: (id: number) => api.delete<void>(`/owes/full/${id}`),

  // Delete owe item
  deleteOweItem: (id: number) => api.delete<void>(`/owes/items/${id}`),

  // Delete owe participant
  deleteOweParticipant: (id: number) => api.delete<void>(`/owes/participants/${id}`),

  // Delete owe return
  deleteOweReturn: (id: number) => api.delete<void>(`/owes/returns/${id}`),
};
