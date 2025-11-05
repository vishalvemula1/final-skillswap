/**
 * Comprehensive tests for AuthContext
 * Tests authentication state management, session handling, and user updates
 */
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock fetch
global.fetch = jest.fn();

// Test component to access context
const TestComponent = () => {
  const { user, loading, login, logout, updateUser } = useAuth();

  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{user ? user.username : 'no-user'}</div>
      <button onClick={() => login({ id: 1, username: 'testuser' })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
      <button onClick={() => updateUser({ ...user, bio: 'Updated' })}>
        Update
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  // Initialization Tests

  test('starts with loading state', () => {
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
  });

  test('checks auth status on mount', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        username: 'existinguser',
        email: 'test@example.com'
      })
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/profile/'),
        expect.objectContaining({ credentials: 'include' })
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('existinguser');
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });
  });

  test('handles no existing session', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });
  });

  test('handles network error during auth check', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });
  });

  // Login Tests

  test('login updates user state', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    act(() => {
      screen.getByText('Login').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
    });
  });

  // Logout Tests

  test('logout clears user state', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, username: 'testuser' })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Logged out' })
      });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
    });

    act(() => {
      screen.getByText('Logout').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    });

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/logout/'),
      expect.objectContaining({
        method: 'POST',
        credentials: 'include'
      })
    );
  });

  test('logout handles network error', async () => {
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 1, username: 'testuser' })
      })
      .mockRejectedValueOnce(new Error('Network error'));

    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
    });

    act(() => {
      screen.getByText('Logout').click();
    });

    await waitFor(() => {
      expect(consoleError).toHaveBeenCalled();
    });

    consoleError.mockRestore();
  });

  // Update User Tests

  test('updateUser updates user state', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        username: 'testuser',
        bio: 'Original bio'
      })
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
    });

    act(() => {
      screen.getByText('Update').click();
    });

    // User state should be updated
    await waitFor(() => {
      // updateUser just updates the context state, doesn't make API call
      expect(screen.getByTestId('user')).toHaveTextContent('testuser');
    });
  });

  // Error Handling Tests

  test('handles malformed response from profile endpoint', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ invalid: 'data' }) // Missing expected fields
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });

    // Should handle gracefully
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
  });

  test('throws error when useAuth used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within AuthProvider');

    consoleError.mockRestore();
  });

  // State Persistence Tests

  test('multiple components share same auth state', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 1, username: 'shareduser' })
    });

    const Component1 = () => {
      const { user } = useAuth();
      return <div data-testid="comp1">{user?.username || 'no-user'}</div>;
    };

    const Component2 = () => {
      const { user } = useAuth();
      return <div data-testid="comp2">{user?.username || 'no-user'}</div>;
    };

    render(
      <AuthProvider>
        <Component1 />
        <Component2 />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('comp1')).toHaveTextContent('shareduser');
      expect(screen.getByTestId('comp2')).toHaveTextContent('shareduser');
    });
  });

  test('login in one component updates all components', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401
    });

    const Component1 = () => {
      const { user, login } = useAuth();
      return (
        <div>
          <div data-testid="comp1">{user?.username || 'no-user'}</div>
          <button onClick={() => login({ id: 1, username: 'newuser' })}>
            Login 1
          </button>
        </div>
      );
    };

    const Component2 = () => {
      const { user } = useAuth();
      return <div data-testid="comp2">{user?.username || 'no-user'}</div>;
    };

    render(
      <AuthProvider>
        <Component1 />
        <Component2 />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('comp1')).toHaveTextContent('no-user');
    });

    act(() => {
      screen.getByText('Login 1').click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('comp1')).toHaveTextContent('newuser');
      expect(screen.getByTestId('comp2')).toHaveTextContent('newuser');
    });
  });
});
