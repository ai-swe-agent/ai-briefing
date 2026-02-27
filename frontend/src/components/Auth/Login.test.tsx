import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './Login';
import * as authApi from '../../api/auth';

vi.mock('../../api/auth');

describe('Login Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('TC-1: renders login form with email and password fields', () => {
    render(<Login />);
    
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('TC-2: validates required fields', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    const submitButton = screen.getByRole('button', { name: /log in/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('TC-3: validates email format', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });
    
    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  it('TC-4: submits credentials and stores token on success', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.mocked(authApi.login);
    mockLogin.mockResolvedValueOnce({ token: 'mock-jwt-token' });
    
    render(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });
    
    await user.type(emailInput, 'user@example.com');
    await user.type(passwordInput, 'SecurePass1!');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'SecurePass1!'
      });
      expect(localStorage.getItem('authToken')).toBe('mock-jwt-token');
    });
  });

  it('TC-5: displays error message on authentication failure', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.mocked(authApi.login);
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
    
    render(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });
    
    await user.type(emailInput, 'user@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/invalid credentials/i);
    });
  });

  it('EC-1: shows error when email is empty on submit', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    await user.type(passwordInput, 'somepassword');
    
    const submitButton = screen.getByRole('button', { name: /log in/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('EC-2: shows error when password is empty on submit', async () => {
    const user = userEvent.setup();
    render(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'user@example.com');
    
    const submitButton = screen.getByRole('button', { name: /log in/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('EC-3: displays network error when API fails', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.mocked(authApi.login);
    mockLogin.mockRejectedValueOnce(new Error('Network error'));
    
    render(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });
    
    await user.type(emailInput, 'user@example.com');
    await user.type(passwordInput, 'SecurePass1!');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/network error/i);
    });
  });

  it('EC-4: trims whitespace from email input', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.mocked(authApi.login);
    mockLogin.mockResolvedValueOnce({ token: 'mock-jwt-token' });
    
    render(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });
    
    await user.type(emailInput, '  user@example.com  ');
    await user.type(passwordInput, 'SecurePass1!');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'SecurePass1!'
      });
    });
  });

  it('EC-5: shows loading state while submitting', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.mocked(authApi.login);
    mockLogin.mockImplementation(() => new Promise((resolve) => {
      setTimeout(() => resolve({ token: 'token' }), 100);
    }));
    
    render(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });
    
    await user.type(emailInput, 'user@example.com');
    await user.type(passwordInput, 'SecurePass1!');
    await user.click(submitButton);
    
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/logging in/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('EC-6: prevents multiple form submissions', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.mocked(authApi.login);
    mockLogin.mockImplementation(() => new Promise((resolve) => {
      setTimeout(() => resolve({ token: 'token' }), 100);
    }));
    
    render(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });
    
    await user.type(emailInput, 'user@example.com');
    await user.type(passwordInput, 'SecurePass1!');
    await user.click(submitButton);
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledTimes(1);
    });
  });

  it('EC-7: stores authentication token in localStorage', async () => {
    const user = userEvent.setup();
    const mockLogin = vi.mocked(authApi.login);
    mockLogin.mockResolvedValueOnce({ token: 'jwt-token-123' });
    
    render(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /log in/i });
    
    await user.type(emailInput, 'user@example.com');
    await user.type(passwordInput, 'SecurePass1!');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(localStorage.getItem('authToken')).toBe('jwt-token-123');
    });
  });
});
