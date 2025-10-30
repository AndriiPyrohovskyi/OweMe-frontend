export interface LoginDto {
    username: string;
    password: string;
}

export interface RegisterDto {
    username: string;
    password: string;
    email: string;
}

export interface CreateGroupDto {
    name: string;
    tag: string;
    avatarUrl: string;
    description: string;
}

export interface AddParticipantDto {
  oweItemId: number;
  sum: number;
  toUserId?: number;
  groupId?: number;
}
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

export interface ReturnOweDto {
  participantId: number;
  returned: number;
}
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

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  username?: string;
  passwordHash?: string;
  email?: string;
  avatarUrl?: string;
  description?: string;
}

export enum UserRole {
    User = "User",
    Premium = "Premium",
    Admin = "Admin"
}

export enum GroupsUserRole {
    Member = "Member",
    Admin = "Admin",
    Owner = "Owner",
    Founder = "Founder"
}

export enum RequestStatus {
    Opened = "Opened",
    Canceled = "Canceled",
    Accepted = "Accepted",
    Declined = "Declined",
    Closed = "Closed"
}

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