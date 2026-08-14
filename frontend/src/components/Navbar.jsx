import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, LogOut, Menu, X, ChevronRight } from 'lucide-react';

const ROLE_PORTAL = {
  CITIZEN:         { path: '/citizen/dashboard',    label: 'Citizen portal' },
  CONTRACTOR:      { path: '/contractor/dashboard', label: 'Contractor portal' },
  GOVERNMENT_ADMIN:{ path: '/government/dashboard', label: 'Govt admin portal' },
  CIVICLENS_ADMIN: { path: '/government/dashboard', label: 'Platform admin' },
};

const DEMO_ROLES = [
  { role: 'CITIZEN',         label: 'Citizen' },
  { role: 'CONTRACTOR',      label: 'Contractor' },
  { role: 'GOVERNMENT_ADMIN',label: 'Govt admin' },
];

export const Navbar = () => {
  const { user, isAuthenticated, logout, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [location.pathname]);

  const handleDemoSwitch = async (role) => {
    await demoLogin(role);
    const portal = ROLE_PORTAL[role];
    if (portal) navigate(portal.path);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileOpen(false);
  };

  const portal = user ? ROLE_PORTAL[user.role] : null;

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{ background: 'var(--ink-surface)', borderColor: 'var(--ink-border)' }}
    >
      {/* ── Tricolor Top Accent Strip ── */}
      <div className="tricolor-strip" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group no-underline"
            aria-label="CivicLens home"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--ink-accent)', color: '#fff' }}
              aria-hidden="true"
            >
              <Eye size={16} strokeWidth={2.5} />
            </div>
            <span
              className="font-bold tracking-tight"
              style={{ color: 'var(--ink-text)', fontSize: '1rem' }}
            >
              CivicLens
            </span>
            <span
              className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] font-medium px-1.5 py-0.5 rounded border"
              style={{ color: 'var(--ink-muted)', borderColor: 'var(--ink-border)', background: 'var(--ink-surface-2)' }}
            >
              <span style={{ color: 'var(--tricolor-saffron-dark)' }}>PROMISE</span>
              <span style={{ color: 'var(--ink-subtle)' }}>→</span>
              <span style={{ color: 'var(--tricolor-green-dark)' }}>PROOF</span>
            </span>
            <span
              className="hidden lg:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-sm"
              style={{
                background: '#FCF9F5',
                borderColor: 'var(--ink-border)',
                color: 'var(--ink-text)'
              }}
              title="Independence Day Edition • 15 August 2026"
            >
              <span aria-hidden="true">🇮🇳</span>
              <span className="tracking-wider">15 AUG</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            <NavLink to="/" label="Home" current={location.pathname} />
            <NavLink to="/explore" label="Explore projects" current={location.pathname} />
            <NavLink to="/schemes" label="Schemes & Yojanas" current={location.pathname} />
            {portal && (
              <NavLink to={portal.path} label={portal.label} current={location.pathname} highlight />
            )}
          </nav>

          {/* Desktop right controls */}
          <div className="hidden md:flex items-center gap-2">
            {/* Demo switcher */}
            <div
              className="flex items-center gap-0.5 rounded-lg border p-0.5"
              style={{ borderColor: 'var(--ink-border)', background: 'var(--ink-surface-2)' }}
              aria-label="Demo role switcher"
            >
              <span className="px-2 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--ink-subtle)' }}>
                Demo:
              </span>
              {DEMO_ROLES.map(({ role, label }) => (
                <button
                  key={role}
                  id={`demo-${role.toLowerCase()}`}
                  onClick={() => handleDemoSwitch(role)}
                  className="px-2.5 py-1 rounded text-xs font-semibold transition-colors min-h-[32px]"
                  style={user?.role === role
                    ? { background: 'var(--ink-accent)', color: '#fff' }
                    : { color: 'var(--ink-muted)' }
                  }
                  aria-pressed={user?.role === role}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-xs font-semibold" style={{ color: 'var(--ink-text)' }}>{user?.name}</p>
                  <p className="font-mono text-[10px]" style={{ color: 'var(--ink-muted)' }}>{user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="cl-btn cl-btn--ghost cl-btn--sm"
                  aria-label="Log out"
                  title="Log out"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="cl-btn cl-btn--ghost cl-btn--sm no-underline">Log in</Link>
                <Link to="/register" className="cl-btn cl-btn--primary cl-btn--sm no-underline">Register</Link>
              </div>
            )}
          </div>

          {/* Mobile: hamburger */}
          <button
            id="mobile-menu-btn"
            onClick={() => setMobileOpen(v => !v)}
            className="md:hidden cl-btn cl-btn--ghost cl-btn--sm"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="md:hidden border-t"
          style={{ background: 'var(--ink-surface)', borderColor: 'var(--ink-border)' }}
        >
          <nav className="px-4 py-3 space-y-1" aria-label="Mobile navigation">
            <MobileNavLink to="/" label="Home" onClick={() => setMobileOpen(false)} />
            <MobileNavLink to="/explore" label="Explore projects" onClick={() => setMobileOpen(false)} />
            <MobileNavLink to="/schemes" label="Schemes & Yojanas" onClick={() => setMobileOpen(false)} />
            {portal && (
              <MobileNavLink to={portal.path} label={portal.label} highlight onClick={() => setMobileOpen(false)} />
            )}
          </nav>

          <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--ink-border)' }}>
            <p className="text-[10px] uppercase tracking-wider font-semibold mb-2" style={{ color: 'var(--ink-subtle)' }}>
              Demo accounts
            </p>
            <div className="flex gap-2 flex-wrap">
              {DEMO_ROLES.map(({ role, label }) => (
                <button
                  key={role}
                  onClick={() => handleDemoSwitch(role)}
                  className="px-3 py-2 rounded text-xs font-semibold transition-colors min-h-touch"
                  style={user?.role === role
                    ? { background: 'var(--ink-accent)', color: '#fff' }
                    : { background: 'var(--ink-surface-2)', color: 'var(--ink-muted)', border: '1px solid var(--ink-border)' }
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--ink-border)' }}>
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--ink-text)' }}>{user?.name}</p>
                  <p className="font-mono text-xs" style={{ color: 'var(--ink-muted)' }}>{user?.role}</p>
                </div>
                <button onClick={handleLogout} className="cl-btn cl-btn--ghost cl-btn--sm">
                  <LogOut size={14} /> Log out
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link to="/login" onClick={() => setMobileOpen(false)}
                  className="cl-btn cl-btn--secondary flex-1 no-underline text-center">Log in</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)}
                  className="cl-btn cl-btn--primary flex-1 no-underline text-center">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

function NavLink({ to, label, current, highlight }) {
  const active = current === to || (to !== '/' && (
    current.startsWith(to) || 
    (to.includes('/contractor') && current.startsWith('/contractor')) ||
    (to.includes('/government') && current.startsWith('/government')) ||
    (to.includes('/citizen') && current.startsWith('/citizen'))
  ));
  return (
    <Link
      to={to}
      className="px-3 py-1.5 rounded text-sm font-medium transition-colors no-underline"
      style={active
        ? { color: 'var(--ink-accent)', background: 'var(--ink-accent-bg)' }
        : highlight
          ? { color: 'var(--ink-accent)' }
          : { color: 'var(--ink-muted)' }
      }
      aria-current={active ? 'page' : undefined}
    >
      {label}
    </Link>
  );
}

function MobileNavLink({ to, label, onClick, highlight }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center justify-between px-3 py-2.5 rounded text-sm font-medium transition-colors no-underline min-h-touch"
      style={highlight
        ? { color: 'var(--ink-accent)', background: 'var(--ink-accent-bg)' }
        : { color: 'var(--ink-text)' }
      }
    >
      {label}
      <ChevronRight size={14} style={{ color: 'var(--ink-muted)' }} />
    </Link>
  );
}
