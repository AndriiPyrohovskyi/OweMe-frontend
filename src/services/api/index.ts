// Export all API endpoints
export { authApi } from './endpoints/auth';
export { usersApi } from './endpoints/users';
export { friendsApi } from './endpoints/friends';
export { groupsApi } from './endpoints/groups';
export { walletApi } from './endpoints/wallet';
export { owesApi } from './endpoints/owes';

// Export types from each endpoint (these have priority)
export * from './endpoints/auth';
export * from './endpoints/users';
export * from './endpoints/friends';
export * from './endpoints/groups';
export * from './endpoints/wallet';
export * from './endpoints/owes';

// Re-export remaining common types from types.ts (only those not duplicated above)
export type { LoginDto, RegisterDto, UpdateUserDto } from './types';
export { UserRole, GroupsUserRole, RequestStatus } from './types';
