/**
 * useAuth.js
 *
 * Thin auth helpers derived from AppStore.
 * Prefer these over importing selectors directly from useAppStore
 * so auth-related concerns stay co-located.
 *
 * Requirements: 12.2, 12.3, 12.4
 */

import {
  useSession as _useSession,
  useLogin as _useLogin,
  useLogout as _useLogout,
} from '../store/useAppStore';

/** Returns the current session object, or null when not authenticated. */
export const useSession = () => _useSession();

/** Returns true when a session exists, false otherwise. */
export const useIsAuthenticated = () => _useSession() !== null;

/** Returns the login function from the store. */
export const useLogin = () => _useLogin();

/** Returns the logout function from the store. */
export const useLogout = () => _useLogout();
