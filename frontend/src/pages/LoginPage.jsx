import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      redirectUserByRole(result.user.role);
    } else {
      setErrorMsg(result.error);
    }
  };

  const handleQuickDemo = async (role) => {
    setErrorMsg('');
    setLoading(true);
    const result = await demoLogin(role);
    setLoading(false);
    if (result.success) {
      redirectUserByRole(result.user.role);
    } else {
      setErrorMsg(result.error);
    }
  };

  const redirectUserByRole = (role) => {
    if (role === 'CITIZEN') navigate('/citizen/dashboard');
    else if (role === 'CONTRACTOR') navigate('/contractor/dashboard');
    else if (role === 'GOVERNMENT_ADMIN' || role === 'CIVICLENS_ADMIN') navigate('/government/dashboard');
    else navigate('/');
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ background: 'var(--ink-base)' }}
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md">

        {/* Header section */}
        <div className="text-center mb-8">
          {/* Eyelet badge */}
          <div
            className="inline-block px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider mb-5"
            style={{
              background: 'var(--ink-surface-2)',
              color: 'var(--ink-muted)',
              border: '1px solid var(--ink-border)',
            }}
          >
            Civic transparency
          </div>

          {/* Logo mark */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--ink-accent)', color: '#fff' }}
            aria-hidden="true"
          >
            <Eye size={20} strokeWidth={2.5} />
          </div>

          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--ink-text)' }}>
            Log in to CivicLens
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: 'var(--ink-muted)' }}>
            Access your role-based civic transparency portal.
          </p>
        </div>

        {/* Card */}
        <div
          className="cl-card px-8 py-8"
          style={{ boxShadow: '0 1px 4px rgba(28,24,20,0.06)' }}
        >
          {/* Error message */}
          {errorMsg && (
            <div
              className="mb-5 p-3 rounded text-xs font-medium"
              style={{
                background: 'var(--status-delayed-bg)',
                border: '1px solid var(--status-delayed-border)',
                color: 'var(--status-delayed-text)',
              }}
              role="alert"
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="cl-label">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="cl-input"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="cl-label">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="cl-input"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="cl-btn cl-btn--primary w-full"
              aria-busy={loading}
            >
              {loading ? (
                <span
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <>
                  Log in
                  <ArrowRight size={15} aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo logins */}
          <div
            className="mt-8 pt-6"
            style={{ borderTop: '1px solid var(--ink-border)' }}
          >
            <p className="cl-section-label text-center mb-3">
              Quick demo account logins
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                id="demo-citizen-login"
                onClick={() => handleQuickDemo('CITIZEN')}
                disabled={loading}
                className="cl-btn cl-btn--secondary cl-btn--sm"
              >
                Citizen
              </button>
              <button
                type="button"
                id="demo-contractor-login"
                onClick={() => handleQuickDemo('CONTRACTOR')}
                disabled={loading}
                className="cl-btn cl-btn--secondary cl-btn--sm"
              >
                Contractor
              </button>
              <button
                type="button"
                id="demo-gov-login"
                onClick={() => handleQuickDemo('GOVERNMENT_ADMIN')}
                disabled={loading}
                className="cl-btn cl-btn--secondary cl-btn--sm"
              >
                Govt Admin
              </button>
            </div>
            <p
              className="text-xs text-center mt-2.5"
              style={{ color: 'var(--ink-subtle)' }}
            >
              Demo credentials: password is <strong>Demo@123</strong>
            </p>
          </div>

          {/* Register link */}
          <p
            className="mt-6 text-center text-sm"
            style={{ color: 'var(--ink-muted)' }}
          >
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold no-underline hover:underline"
              style={{ color: 'var(--ink-accent)' }}
            >
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
