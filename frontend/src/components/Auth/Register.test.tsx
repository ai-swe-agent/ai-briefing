import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Register from './Register';
import * as authApi from '../../api/auth';

vi.mock('../../api/auth');

describe('Register Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('TC-6: renders registration form with all required fields', () => {
    render(<Register />);
    
    expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('TC-7: validates all required fields', async () => {
    const user = userEvent.setup();
    render(<Register />);
    
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/^password is required$/i)).toBeInTheDocument();
      expect(screen.getByText(/confirm password is required/i)).toBeInTheDocument();
    });
  });

  it('TC-8: validates email format', async () => {
    const user = userEvent.setup();
    render(<Register />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    await user.type(emailInput, 'not-an-email');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
    });
  });

  it('TC-9: validates password requirements', async () => {
    const user = userEvent.setup();
    render(<Register />);
    
    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    await user.type(passwordInput, 'weak');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/password must contain at least one uppercase letter/i)).toBeInTheDocument();
      expect(screen.getByText(/password must contain at least one number/i)).toBeInTheDocument();
    });
  });

  it('TC-10: validates password and confirmation match', async () => {
    const user = userEvent.setup();
    render(<Register />);
    
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    
    await user.type(passwordInput, 'SecurePass1!');
    await user.type(confirmInput, 'DifferentPass1!');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('TC-11: creates account and stores token on success', async () => {
    const user = userEvent.setup();
    const mockRegister = vi.mocked(authApi.register);
    mockRegister.mockResolvedValueOnce({ token: 'new-user-token' });
    
    render(<Register />);
    
    await user.type(screen.getByLabelText(/username/i), 'newuser');
    await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'SecurePass1!');
    await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass1!');
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'SecurePass1!'
      });
      expect(localStorage.getItem('authToken')).toBe('new-user-token');
    });
  });

  it('TC-12: displays error on duplicate email', async () => {
    const user = userEvent.setup();
    const mockRegister = vi.mocked(authApi.register);
    mockRegister.mockRejectedValueOnce(new Error('Email already registered'));
    
    render(<Register />);
    
    await user.type(screen.getByLabelText(/username/i), 'existinguser');
    await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'SecurePass1!');
    await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass1!');
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/email already registered/i);
    });
  });

  it('EC-8: shows error when username is empty', async () => {
    const user = userEvent.setup();
    render(<Register />);
    
    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'SecurePass1!');
    await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass1!');
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/username is required/i)).toBeInTheDocument();
    });
  });

  it('EC-9: validates password minimum length of 8 characters', async () => {
    const user = userEvent.setup();
    render(<Register />);
    
    await user.type(screen.getByLabelText(/username/i), 'newuser');
    await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Short1!');
    await user.type(screen.getByLabelText(/confirm password/i), 'Short1!');
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it('EC-10: validates password contains uppercase letter', async () => {
    const user = userEvent.setup();
    render(<Register />);
    
    await user.type(screen.getByLabelText(/^password$/i), 'lowercase123');
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/password must contain at least one uppercase letter/i)).toBeInTheDocument();
    });
  });

  it('EC-11: validates password contains number', async () => {
    const user = userEvent.setup();
    render(<Register />);
    
    await user.type(screen.getByLabelText(/^password$/i), 'NoNumbersHere');
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/password must contain at least one number/i)).toBeInTheDocument();
    });
  });

  it('EC-12: shows error when passwords do not match', async () => {
    const user = userEvent.setup();
    render(<Register />);
    
    await user.type(screen.getByLabelText(/^password$/i), 'SecurePass1!');
    await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass2!');
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });

  it('EC-13: displays error on server 500 error', async () => {
    const user = userEvent.setup();
    const mockRegister = vi.mocked(authApi.register);
    mockRegister.mockRejectedValueOnce(new Error('Server error'));
    
    render(<Register />);
    
    await user.type(screen.getByLabelText(/username/i), 'newuser');
    await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'SecurePass1!');
    await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass1!');
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('EC-14: clears form fields after successful registration', async () => {
    const user = userEvent.setup();
    const mockRegister = vi.mocked(authApi.register);
    mockRegister.mockResolvedValueOnce({ token: 'token' });
    
    render(<Register />);
    
    await user.type(screen.getByLabelText(/username/i), 'newuser');
    await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'SecurePass1!');
    await user.type(screen.getByLabelText(/confirm password/i), 'SecurePass1!');
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    
    await waitFor(() => {
      expect(screen.getByLabelText(/username/i)).toHaveValue('');
      expect(screen.getByLabelText(/email/i)).toHaveValue('');
      expect(screen.getByLabelText(/^password$/i)).toHaveValue('');
      expect(screen.getByLabelText(/confirm password/i)).toHaveValue('');
    });
  });
});
