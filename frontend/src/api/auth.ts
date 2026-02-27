import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await authApi.post<AuthResponse>('/auth/login', credentials);
  return response.data;
}

export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  const response = await authApi.post<AuthResponse>('/auth/register', credentials);
  return response.data;
}
