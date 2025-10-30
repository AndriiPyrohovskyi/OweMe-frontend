import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { authStorage } from '../storage/authStorage';
import { API_CONFIG } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

export class ApiError extends Error {
    constructor(
        public status: number,
        public message: string,
    ) {
    super(message);
    this.name = 'ApiError';
    }
}

const apiClient: AxiosInstance = axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            const token = await authStorage.getToken();

            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            //Debug option - will be removed in production
            if (__DEV__) {
                console.log('Request:', {
                    method: config.method?.toUpperCase(),
                    url: config.url,
                    data: config.data
                })
            }
            return config;
        } catch (error) {
            return Promise.reject(error);
        }
    },
    (error) => {
        return Promise.reject(error);
    }
)

apiClient.interceptors.response.use(
    //Debug option - will be removed in production
    (response: AxiosResponse) => {
        if (__DEV__) {
            console.log('Response:', {
                status: response.status,
                url: response.config.url,
                data: response.data,
            });
        }
        return response;
    },
    async (error: AxiosError) => {
        if (__DEV__) {
            console.log('Error', {
                status: error.response?.status,
                url: error.config?.url,
                message: error.message
            });
        }
        if (error.response) {
            const { status } = error.response;

            if (status === 401) {
                await authStorage.clearAll();
                throw new ApiError(
                    status,
                    'Сесія закінчилась. Будь ласка, увійдіть знову.',
                );
            }
            if (status === 403) {
                throw new ApiError(
                    status,
                    'Доступ заборонений'
                );
            }
            if (status === 404) {
                throw new ApiError(
                    status,
                    'Ресурс не знайдено',
              );
            }
            if (status === 422) {
                throw new ApiError(
                    status,
                    'Помилка валідації даних',
              );
            }
            if (status >= 500) {
                throw new ApiError(
                    status,
                    'Помилка сервера. Спробуйте пізніше.',
              );
            }
            throw new ApiError(
              status,
                'Помилка.',
            );
        }
        if (error.message === 'Network Error') {
            throw new ApiError(
              0,
              'Немає з\'єднання з інтернетом'
            );
          }
        if (error.code === 'ECONNABORTED') {
            throw new ApiError(
              0,
              'Час очікування вичерпано. Перевірте з\'єднання.'
            );
        }
        throw new ApiError(
            0,
            error.message || 'Невідома помилка'
        );
    }
);

export const api = {
    get: <T = any>(url: string, config?: any) => 
        apiClient.get<T>(url, config).then(res => res.data),
    post: <T = any>(url: string, data?: any, config?: any) => 
        apiClient.post<T>(url, config).then(res => res.data),
    put: <T = any>(url: string, data?: any, config?: any) => 
        apiClient.put<T>(url, data, config).then(res => res.data),
    patch: <T = any>(url: string, data?: any, config?: any) => 
        apiClient.patch<T>(url, data, config).then(res => res.data),
    delete: <T = any>(url: string, config?: any) => 
        apiClient.delete<T>(url, config).then(res => res.data),
}

export default api;