// Feature: synthesized-ether-full-functionality
// Unit tests for authentication flow
// Requirements: 12.1, 12.3, 12.5, 15.5

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import ProtectedRoute from '../components/ProtectedRoute';
import useAppStore from '../store/useAppStore';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const defaultMetrics = {
  totalInteractions: 0,
  conversionRate: 0,
  avgSessionTime: 0,
  sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
  history: [],
};

function resetStore() {
  useAppStore.setState({
    session: null,
    leads: [],
    metrics: { ...defaultMetrics },
    unreadNotifications: 0,
  });
}

// Minimal stub for a protected page used in routing tests
function ProtectedPage() {
  return <div>Protected Content</div>;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Authentication flow', () => {
  beforeEach(() => {
    // Stub localStorage to prevent persist middleware side-effects
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
    resetStore();
  });

  // ── 1. ProtectedRoute redirects to /login when no session ─────────────────

  describe('ProtectedRoute', () => {
    it('redirects to /login when no session exists', () => {
      // Ensure store has no session
      expect(useAppStore.getState().session).toBeNull();

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ProtectedPage />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      // Should have been redirected to /login, not showing protected content
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
      expect(screen.getByText('Login Page')).toBeInTheDocument();
    });

    it('renders children when a session exists', () => {
      useAppStore.setState({
        session: { token: 'tok-123', user: { name: 'Alice', email: 'alice@example.com', avatarUrl: '' } },
      });

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ProtectedPage />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });
  });

  // ── 2. LoginPage re-hydration: redirect away when session already exists ──

  describe('LoginPage re-hydration', () => {
    it('redirects to /dashboard when a session is already present in the store', () => {
      // Simulate session restored from localStorage by seeding the store directly
      useAppStore.setState({
        session: { token: 'restored-token', user: { name: 'Bob', email: 'bob@example.com', avatarUrl: '' } },
      });

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      );

      // LoginPage should redirect away since session exists
      expect(screen.queryByRole('button', { name: /sign in/i })).not.toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('shows the login form when no session exists', () => {
      // Store has no session (default after resetStore)
      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });
  });

  // ── 3. Invalid credentials show a generic error message ───────────────────

  describe('LoginPage invalid credentials', () => {
    it('shows "Invalid email or password" when empty credentials are submitted', async () => {
      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      );

      // Submit with empty fields (store.login throws for empty email/password)
      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password');
      });
    });

    it('does not reveal which field (email or password) is wrong', async () => {
      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      );

      // Fill in email but leave password empty
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'user@example.com' },
      });
      // Leave password empty and submit
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        // Must be the generic message — no mention of "email" or "password" specifically
        expect(alert).toHaveTextContent('Invalid email or password');
        expect(alert.textContent).not.toMatch(/email is (wrong|incorrect|invalid)/i);
        expect(alert.textContent).not.toMatch(/password is (wrong|incorrect|invalid)/i);
      });
    });

    it('does not navigate away on failed login', async () => {
      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      );

      // Submit with empty fields
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Still on login page
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });
  });
});
