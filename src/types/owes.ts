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

// User reference
export interface UserRef {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}

// Group reference
export interface GroupRef {
  id: number;
  name: string;
  avatarUrl?: string;
}

// Base Entities
export interface OweReturn {
  id: number;
  returned: number;
  status: ReturnStatus;
  createdAt: Date;
  updatedAt: Date;
  participant: {
    id: number;
    sum: number;
    oweItem?: {
      id: number;
      name: string;
      fullOwe?: {
        id: number;
        name: string;
        fromUser?: UserRef;
      };
    };
    toUser?: UserRef;
    group?: GroupRef;
  };
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
    fullOwe?: {
      id: number;
      name: string;
    };
  };
  toUser?: UserRef;
  group?: GroupRef;
  oweReturns: OweReturn[];
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

export interface FullOwe {
  id: number;
  name: string;
  description?: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  fromUser: UserRef;
  oweItems: OweItem[];
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
}

export interface UpdateOweItemDto {
  sum?: number;
  name?: string;
  description?: string;
  imageUrl?: string;
}

export interface UpdateOweParticipantDto {
  sum?: number;
}

// Helper types for list views
export interface MyOwesResponse {
  sent: FullOwe[];
  received: FullOwe[];
}

export interface MyOweReturnsResponse {
  sent: OweReturn[];
  received: OweReturn[];
}
