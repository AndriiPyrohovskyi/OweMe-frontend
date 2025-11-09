import api from "../client";
import { LoginDto, RegisterDto } from "../types";

export interface AuthResponse {
  accessToken: string;
}

export const authApi = {
  login: (data: LoginDto) => api.post<AuthResponse>('/auth/login', data),
  register: (data: RegisterDto) => api.post<AuthResponse>('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  getAdmin: () => api.get('/auth/admin'), // Admin role required
  healthcheck: () => api.get('/auth/healthcheck'),
};