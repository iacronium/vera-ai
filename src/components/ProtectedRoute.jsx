import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '../store/useAppStore';

/**
 * ProtectedRoute – wraps routes that require an authenticated session.
 *
 * If the user has no active session they are redirected to /login.
 * The current location is preserved in `location.state.from` so the
 * login page can redirect back after a successful sign-in.
 */
function ProtectedRoute({ children }) {
  const session = useSession();
  const location = useLocation();

  if (session === null) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
