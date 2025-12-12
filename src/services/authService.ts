// src/services/authService.ts
import api from './api';

export interface User {
    id: number;
    name: string;
    email: string;
    isActive: boolean;
    roles?: string[];
}

export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    token?: string;
    user?: User;
    error?: string;
}

class AuthService {
    async register(data: RegisterData): Promise<AuthResponse> {
        try {
            const response = await api.post('/auth/register', data);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Registration failed'
            };
        }
    }

    async login(data: LoginData): Promise<AuthResponse> {
        try {
            const response = await api.post('/auth/login', data);
            if (response.data.success && response.data.token) {
                localStorage.setItem('auth_token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            } else {
                console.log('❌ Login failed:', response.data.error);
            }

            return response.data;
        } catch (error: any) {
            console.error('🔥 Login error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });

            return {
                success: false,
                error: error.response?.data?.error || 'Network error during login'
            };
        }
    }

    logout(): void {
        // localStorage.removeItem('auth_token');
        // localStorage.removeItem('user');
        // window.location.href = '/login';
    }

    async verifyToken(): Promise<AuthResponse> {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                console.log("No token in localStorage")
                return { success: false, error: 'No token found' };
            }

            const response = await api.get('/auth/verify');
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Token verification failed'
            };
        }
    }

    getCurrentUser(): User | null {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;

        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem('auth_token');
    }

    hasRole(roleName: string): boolean {
        const user = this.getCurrentUser();
        return user?.roles?.includes(roleName) || false;
    }

    isCaller(): boolean {
        return this.hasRole('caller') || this.hasRole('admin');
    }
}

export default new AuthService();