import api from "../client";
import { LoginDto, RegisterDto } from "../types";

export const authApi = {
    login: (data: LoginDto) => api.post('/auth/login', data),
    register: (data: RegisterDto) => api.post('/auth/register', data),
    getProfile: () => api.get('/auth/profile'),
    healthcheck: () => api.get('/auth/healthcheck',)
};