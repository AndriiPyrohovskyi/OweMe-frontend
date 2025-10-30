import api from "../client";
import {UpdateUserDto, UserRole } from "../types";

export const usersApi = {
    healthcheck: () => api.get('/users/healthcheck',),
    getAll: () => api.get('/users/',),
    getCurrentRole: (targetUserId: number) => api.get(`/users/userRole?targetUserId=${targetUserId}`,),
    getUserInLogs: (targetUserId: number) => api.get(`/users/userInLogs?targetUserId=${targetUserId}`,),
    getUserOutLogs: (targetUserId: number) => api.get(`/users/userOutLogs?targetUserId=${targetUserId}`,),
    getPublicUsersByUsernamePart: (username: string) => api.get(`/users/publicUsersByUsernamePart?username=${username}`,),
    getPublicUserByUsername: (username: string) => api.get(`/users/publicUserByUsername?username=${username}`,),
    getFullUsersByUsernamePart: (username: string) => api.get(`/users/fullUsersByUsernamePart?username=${username}`,),
    getFullUserByUsername: (username: string) => api.get(`/users/fullUserByUsername?username=${username}`,),

    giveNewRole: (actionedUsername: string, actionerUsername: string, newRole: UserRole) => api.post('/users/userGiveNewRole', {actionedUsername, actionerUsername, newRole}),

    updateUser: (targetUserId: string, data : UpdateUserDto) => api.put(`/users/user/${targetUserId}`, data),

    deleteUser: (targetUserId: string) => api.delete(`/users/user/${targetUserId}`)
};