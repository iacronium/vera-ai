import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { useLogin, useSession } from '../store/useAppStore';

/**
 * LoginPage – authentication entry point.
 *
 * Renders a centered glass card with email/password fields.
 * On success, redirects to the originally requested route or /dashboard.
 * On failure, shows a generic error message (no field-level detail).
 * If a session already exists (e.g. restored from localStorage), redirects
 * immediately to /dashboard without showing the form (Requirement 12.3).
 */
function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const session = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  // If already authenticated (e.g. session restored from localStorage), skip login
  if (session !== null) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-surface flex items-center justify-center overflow-hidden px-4">
      {/* Background ambient blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-card rounded-3xl p-10 border border-outline-variant/40 shadow-[0_0_60px_rgba(164,230,255,0.08)]">
          {/* Branding */}
          <div className="text-center mb-10">
            <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-br from-primary to-primary-container bg-clip-text text-transparent mb-1">
              Vera AI
            </h1>
            <p className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">
              Sign in to your workspace
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 bg-error/10 border border-error/30 text-error rounded-xl px-4 py-3 mb-6 text-sm font-medium"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-surface-container border border-outline-variant rounded-xl pl-10 pr-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-surface-container border border-outline-variant rounded-xl pl-10 pr-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-on-primary/40 border-t-on-primary rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Footer note */}
          <p className="text-center text-xs text-on-surface-variant mt-8">
            Enter any email and password to access the demo workspace.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default LoginPage;
