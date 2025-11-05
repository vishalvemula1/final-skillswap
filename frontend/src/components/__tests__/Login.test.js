/**
 * Comprehensive tests for Login component
 * Tests authentication flow, error handling, validation, and security
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../Login';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../ui';

// Mock fetch
global.fetch = jest.fn();

const renderLogin = () => {
  return render(
    <ToastProvider>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </ToastProvider>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  // Rendering Tests

  test('renders login form by default', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  test('renders register form when switching tabs', () => {
    renderLogin();

    const registerTab = screen.getByText(/register/i, { selector: 'button' });
    fireEvent.click(registerTab);

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  test('renders demo credential buttons', () => {
    renderLogin();
    expect(screen.getByText(/admin/i, { selector: 'button' })).toBeInTheDocument();
    expect(screen.getByText(/user1/i, { selector: 'button' })).toBeInTheDocument();
  });

  // Login Flow Tests

  test('successful login', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com'
        }
      })
    });

    renderLogin();

    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login/'),
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          body: JSON.stringify({
            username: 'testuser',
            email: '',
            password: 'password123'
          })
        })
      );
    });
  });

  test('login with invalid credentials shows error', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Invalid credentials'
      })
    });

    renderLogin();

    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  test('login with empty fields', async () => {
    renderLogin();

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    // HTML5 validation should prevent submission
    const usernameInput = screen.getByPlaceholderText(/username/i);
    expect(usernameInput).toBeRequired();
  });

  test('shows loading state during login', async () => {
    fetch.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    renderLogin();

    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Button should be disabled during loading
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
  });

  // Registration Tests

  test('successful registration', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'User registered successfully',
        user_id: 1
      })
    });

    renderLogin();

    // Switch to register
    const registerTab = screen.getByText(/register/i, { selector: 'button' });
    fireEvent.click(registerTab);

    const usernameInput = screen.getByPlaceholderText(/username/i);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'newpass123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/register/'),
        expect.any(Object)
      );
    });
  });

  test('registration with duplicate username', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Username already exists'
      })
    });

    renderLogin();

    const registerTab = screen.getByText(/register/i, { selector: 'button' });
    fireEvent.click(registerTab);

    const usernameInput = screen.getByPlaceholderText(/username/i);
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(usernameInput, { target: { value: 'existinguser' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'pass123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/already exists/i)).toBeInTheDocument();
    });
  });

  // Demo Credentials Tests

  test('clicking demo button fills credentials', () => {
    renderLogin();

    const adminButton = screen.getByText(/admin/i, { selector: 'button' });
    fireEvent.click(adminButton);

    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);

    expect(usernameInput.value).toBe('admin');
    expect(passwordInput.value).toBe('admin');
  });

  test('demo button clears previous errors', () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Some error' })
    });

    renderLogin();

    // Trigger an error
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    // Then click demo button
    const adminButton = screen.getByText(/admin/i, { selector: 'button' });
    fireEvent.click(adminButton);

    // Error should be cleared
    waitFor(() => {
      expect(screen.queryByText(/some error/i)).not.toBeInTheDocument();
    });
  });

  // Network Error Tests

  test('handles network error', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    renderLogin();

    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/network error|failed to connect|connection failed/i)).toBeInTheDocument();
    });
  });

  // Input Validation Tests

  test('accepts special characters in username', () => {
    renderLogin();

    const usernameInput = screen.getByPlaceholderText(/username/i);
    fireEvent.change(usernameInput, { target: { value: 'user_123-test' } });

    expect(usernameInput.value).toBe('user_123-test');
  });

  test('accepts unicode characters in username', () => {
    renderLogin();

    const usernameInput = screen.getByPlaceholderText(/username/i);
    fireEvent.change(usernameInput, { target: { value: 'user_🚀_中文' } });

    expect(usernameInput.value).toBe('user_🚀_中文');
  });

  test('password field is type password', () => {
    renderLogin();

    const passwordInput = screen.getByPlaceholderText(/password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('email field is type email in register mode', () => {
    renderLogin();

    const registerTab = screen.getByText(/register/i, { selector: 'button' });
    fireEvent.click(registerTab);

    const emailInput = screen.getByPlaceholderText(/email/i);
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  // UI State Tests

  test('error message disappears when typing', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid credentials' })
    });

    renderLogin();

    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'wrong' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });

    // Type in username field
    fireEvent.change(usernameInput, { target: { value: 'newvalue' } });

    // Error should disappear
    await waitFor(() => {
      expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
    });
  });

  test('switching tabs clears error', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Invalid credentials' })
    });

    renderLogin();

    // Trigger error on login
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });

    // Switch to register
    const registerTab = screen.getByText(/register/i, { selector: 'button' });
    fireEvent.click(registerTab);

    // Error should be cleared
    expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
  });

  // Accessibility Tests

  test('username input has correct autocomplete', () => {
    renderLogin();
    const usernameInput = screen.getByPlaceholderText(/username/i);
    expect(usernameInput).toHaveAttribute('autocomplete', 'username');
  });

  test('password input has correct autocomplete for login', () => {
    renderLogin();
    const passwordInput = screen.getByPlaceholderText(/password/i);
    expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
  });

  test('password input has correct autocomplete for register', () => {
    renderLogin();

    const registerTab = screen.getByText(/register/i, { selector: 'button' });
    fireEvent.click(registerTab);

    const passwordInput = screen.getByPlaceholderText(/password/i);
    expect(passwordInput).toHaveAttribute('autocomplete', 'new-password');
  });

  // Security Tests

  test('credentials are sent with correct headers', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: {} })
    });

    renderLogin();

    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'test' } });
    fireEvent.change(passwordInput, { target: { value: 'pass' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        })
      );
    });
  });

  test('does not expose password in error messages', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Authentication failed' })
    });

    renderLogin();

    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: 'user' } });
    fireEvent.change(passwordInput, { target: { value: 'secretpassword123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errorText = screen.getByText(/authentication failed/i).textContent;
      expect(errorText).not.toContain('secretpassword123');
    });
  });
});
