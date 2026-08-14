import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, ArrowRight } from 'lucide-react';

export const RegisterPage = () => {
  const [role, setRole] = useState('CITIZEN');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [ward, setWard] = useState('Indiranagar (Ward 112)');
  const [companyName, setCompanyName] = useState('');
  const [registrationId, setRegistrationId] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    const formData = {
      name,
      email,
      phone,
      password,
      role,
      city,
      ward,
      companyName,
      registrationId,
    };

    const result = await register(formData);
    setLoading(false);

    if (result.success) {
      if (role === 'CITIZEN') navigate('/citizen/dashboard');
      else if (role === 'CONTRACTOR') navigate('/contractor/dashboard');
      else navigate('/government/dashboard');
    } else {
      setErrorMsg(result.error);
    }
  };

  const ROLES = [
    { value: 'CITIZEN', label: 'Citizen' },
    { value: 'CONTRACTOR', label: 'Contractor' },
    { value: 'GOVERNMENT_ADMIN', label: 'Govt Admin' },
  ];

  return (
    <div
      className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ background: 'var(--ink-base)' }}
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          {/* Eyelet badge */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-5"
            style={{
              background: 'var(--ink-surface-2)',
              color: 'var(--ink-text)',
              border: '1px solid var(--ink-border)',
            }}
          >
            <span>🇮🇳</span>
            <span style={{ color: 'var(--tricolor-saffron-dark)' }}>INDEPENDENCE DAY 2026</span>
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
            Create a CivicLens account
          </h1>
          <p className="mt-1.5 text-sm" style={{ color: 'var(--ink-muted)' }}>
            Join the civic transparency network.
          </p>
        </div>

        {/* Card */}
        <div
          className="cl-card px-8 py-8"
          style={{ boxShadow: '0 1px 4px rgba(28,24,20,0.06)' }}
        >
          {/* Error */}
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

          {/* Role selector */}
          <div className="mb-6">
            <span className="cl-label">Select your role</span>
            <div
              className="grid grid-cols-3 gap-1.5 p-1 rounded-lg"
              style={{ background: 'var(--ink-surface-2)', border: '1px solid var(--ink-border)' }}
              role="group"
              aria-label="Account role"
            >
              {ROLES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRole(value)}
                  className="py-2 text-xs font-semibold rounded transition-all"
                  style={
                    role === value
                      ? { background: 'var(--ink-accent)', color: '#fff' }
                      : { color: 'var(--ink-muted)' }
                  }
                  aria-pressed={role === value}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4" noValidate>

            {/* Full name */}
            <div>
              <label htmlFor="reg-name" className="cl-label">
                Full name / representative
              </label>
              <input
                id="reg-name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ananya Sharma"
                className="cl-input"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="cl-label">
                Email address
              </label>
              <input
                id="reg-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="cl-input"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="reg-phone" className="cl-label">
                Phone number
              </label>
              <input
                id="reg-phone"
                type="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="cl-input"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="cl-label">
                Password
              </label>
              <input
                id="reg-password"
                type="password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="cl-input"
              />
            </div>

            {/* Citizen-specific fields */}
            {role === 'CITIZEN' && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label htmlFor="reg-city" className="cl-label">City</label>
                  <input
                    id="reg-city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="cl-input"
                  />
                </div>
                <div>
                  <label htmlFor="reg-ward" className="cl-label">Ward</label>
                  <select
                    id="reg-ward"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="cl-input"
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="Indiranagar (Ward 112)">Indiranagar (Ward 112)</option>
                    <option value="Koramangala (Ward 151)">Koramangala (Ward 151)</option>
                    <option value="Whitefield (Ward 84)">Whitefield (Ward 84)</option>
                    <option value="Jayanagar (Ward 153)">Jayanagar (Ward 153)</option>
                    <option value="Malleshwaram (Ward 65)">Malleshwaram (Ward 65)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Contractor-specific fields */}
            {role === 'CONTRACTOR' && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label htmlFor="reg-company" className="cl-label">Company name</label>
                  <input
                    id="reg-company"
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Apex Civil Infra Ltd"
                    className="cl-input"
                  />
                </div>
                <div>
                  <label htmlFor="reg-regid" className="cl-label">Registration ID</label>
                  <input
                    id="reg-regid"
                    type="text"
                    required
                    value={registrationId}
                    onChange={(e) => setRegistrationId(e.target.value)}
                    placeholder="e.g. KA-BBMP-2024-90"
                    className="cl-input"
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="cl-btn cl-btn--primary w-full mt-2"
              aria-busy={loading}
            >
              {loading ? (
                <span
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <>
                  Register account
                  <ArrowRight size={15} aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <p
            className="mt-6 text-center text-sm"
            style={{ color: 'var(--ink-muted)' }}
          >
            Already registered?{' '}
            <Link
              to="/login"
              className="font-semibold no-underline hover:underline"
              style={{ color: 'var(--ink-accent)' }}
            >
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
