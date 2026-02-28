import { apiFetch } from './api';

interface LoginResponse {
  token: string;
}

interface RegisterResponse {
  message: string;
}

export async function login(email: string, password: string): Promise<string> {
  const response = await apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    data: { email, password },
  });
  return response.token;
}

export async function register(
  email: string,
  password: string
): Promise<string> {
  const response = await apiFetch<RegisterResponse>('/auth/register', {
    method: 'POST',
    data: { email, password },
  });
  return response.message;
}
