import apiClient from '../client';
import { usersApi, GetPublicUserDto } from './users';

export interface Friend {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  description?: string;
  email?: string;
  createdAt?: string;
}

export interface FriendRequest {
  id: number;
  requestStatus: 'Opened' | 'Accepted' | 'Declined' | 'Canceled';
  createdAt: string;
  finishedAt?: string;
  user: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
}

export interface FriendRequestFull {
  id: number;
  requestStatus: 'Opened' | 'Accepted' | 'Declined' | 'Canceled';
  createdAt: string;
  finishedAt?: string;
  acceptedAt?: string;
  sender: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
  receiver: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
  };
}

export interface UserSearchResult {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  description?: string;
}

export interface FriendshipStatus {
  areFriends: boolean;
  hasRequest: boolean;
  requestId?: number;
  requestStatus?: 'Opened' | 'Accepted' | 'Declined' | 'Canceled';
  isRequestSender?: boolean; // true якщо поточний користувач відправив запит
}

export const friendsApi = {
  // Health check
  healthcheck: async (): Promise<{ message: string }> => {
    const response = await apiClient.get('/friends/healthcheck');
    return response;
  },

  // Отримати всі дружби (admin only)
  getAllFriendships: async (): Promise<any[]> => {
    const response = await apiClient.get('/friends');
    return response;
  },

  // Отримати список друзів користувача
  getUserFriends: async (userId: number): Promise<Friend[]> => {
    const response = await apiClient.get<Friend[]>(`/friends/user/${userId}`);
    return response;
  },

  // Отримати спільних друзів
  getCommonFriends: async (userId1: number, userId2: number): Promise<Friend[]> => {
    const response = await apiClient.get<Friend[]>(
      `/friends/common?targetUserId=${userId1}&targetedUserId=${userId2}`
    );
    return response;
  },

  // Отримати всі запити (admin only)
  getAllRequests: async (): Promise<any[]> => {
    const response = await apiClient.get('/friends/requests');
    return response;
  },

  // Отримати всі запити користувача (відправлені та отримані)
  getAllUserRequests: async (userId: number): Promise<{ sended: FriendRequest[], received: FriendRequest[] }> => {
    const response = await apiClient.get(`/friends/requests/user/${userId}`);
    return response;
  },

  // Отримати відправлені запити
  getSentRequests: async (userId: number): Promise<FriendRequest[]> => {
    const response = await apiClient.get<FriendRequest[]>(`/friends/requests/sent/${userId}`);
    return response;
  },

  // Отримати отримані запити
  getReceivedRequests: async (userId: number): Promise<FriendRequest[]> => {
    const response = await apiClient.get<FriendRequest[]>(`/friends/requests/received/${userId}`);
    return response;
  },

  // Перевірити чи є друзями
  checkFriendship: async (userId1: number, userId2: number): Promise<boolean> => {
    const response = await apiClient.get<boolean>(
      `/friends/check-friends?targetUserId=${userId1}&targetedUserId=${userId2}`
    );
    return response;
  },

  // Кількість друзів
  getFriendCount: async (userId: number): Promise<number> => {
    const response = await apiClient.get<number>(`/friends/friend-count/${userId}`);
    return response;
  },

  // Перевірити чи існує запит
  checkFriendRequestExists: async (userId1: number, userId2: number): Promise<boolean> => {
    const response = await apiClient.get<boolean>(
      `/friends/check-request?targetUserId=${userId1}&targetedUserId=${userId2}`
    );
    return response;
  },

  // Отримати повний статус дружби між користувачами
  getFriendshipStatus: async (currentUserId: number, targetUserId: number): Promise<FriendshipStatus> => {
    try {
      const [areFriends, requests] = await Promise.all([
        friendsApi.checkFriendship(currentUserId, targetUserId),
        friendsApi.getAllUserRequests(currentUserId),
      ]);

      if (areFriends) {
        return {
          areFriends: true,
          hasRequest: false,
        };
      }

      // Перевірити відправлені запити
      const sentRequest = requests.sended?.find(
        (req: FriendRequest) => req.user.id === targetUserId && req.requestStatus === 'Opened'
      );

      if (sentRequest) {
        return {
          areFriends: false,
          hasRequest: true,
          requestId: sentRequest.id,
          requestStatus: sentRequest.requestStatus,
          isRequestSender: true,
        };
      }

      // Перевірити отримані запити
      const receivedRequest = requests.received?.find(
        (req: FriendRequest) => req.user.id === targetUserId && req.requestStatus === 'Opened'
      );

      if (receivedRequest) {
        return {
          areFriends: false,
          hasRequest: true,
          requestId: receivedRequest.id,
          requestStatus: receivedRequest.requestStatus,
          isRequestSender: false,
        };
      }

      return {
        areFriends: false,
        hasRequest: false,
      };
    } catch (error) {
      console.error('Failed to get friendship status:', error);
      return {
        areFriends: false,
        hasRequest: false,
      };
    }
  },

  // Відправити запит в друзі
  sendFriendRequest: async (receiverId: number): Promise<{ message: string }> => {
    const response = await apiClient.post('/friends/send-request', { recevierId: receiverId });
    return response;
  },

  // Прийняти запит в друзі
  acceptRequest: async (requestId: number): Promise<FriendRequestFull> => {
    const response = await apiClient.put<FriendRequestFull>(`/friends/accept-request/${requestId}`);
    return response;
  },

  // Прийняти всі запити користувача
  acceptAllRequests: async (userId: number): Promise<FriendRequestFull[]> => {
    const response = await apiClient.put<FriendRequestFull[]>(`/friends/accept-all/${userId}`);
    return response;
  },

  // Відхилити запит
  declineRequest: async (requestId: number): Promise<FriendRequestFull> => {
    const response = await apiClient.put<FriendRequestFull>(`/friends/decline-request/${requestId}`);
    return response;
  },

  // Відхилити всі запити користувача
  declineAllRequests: async (userId: number): Promise<FriendRequestFull[]> => {
    const response = await apiClient.put<FriendRequestFull[]>(`/friends/decline-all/${userId}`);
    return response;
  },

  // Скасувати свій запит
  cancelRequest: async (requestId: number): Promise<FriendRequestFull> => {
    const response = await apiClient.put<FriendRequestFull>(`/friends/cancel-request/${requestId}`);
    return response;
  },

  // Скасувати всі свої запити
  cancelAllRequests: async (userId: number): Promise<FriendRequestFull[]> => {
    const response = await apiClient.put<FriendRequestFull[]>(`/friends/cancel-all/${userId}`);
    return response;
  },

  // Видалити з друзів
  removeFriend: async (userId1: number, userId2: number): Promise<void> => {
    await apiClient.delete(`/friends/remove-friend?targetUserId=${userId1}&targetedUserId=${userId2}`);
  },

  // Пошук користувачів (використовуємо users API)
  searchUsers: async (query: string): Promise<UserSearchResult[]> => {
    const response = await usersApi.getPublicUsersByUsernamePart(query);
    // Мапимо GetPublicUserDto на UserSearchResult
    return response.map((user: GetPublicUserDto) => ({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      description: user.description,
    }));
  },

  // Отримати публічний профіль користувача за username
  getUserProfileByUsername: async (username: string): Promise<UserSearchResult> => {
    const response = await usersApi.getPublicUserByUsername(username);
    return {
      id: response.id,
      username: response.username,
      firstName: response.firstName,
      lastName: response.lastName,
      avatarUrl: response.avatarUrl,
      description: response.description,
    };
  },
};
