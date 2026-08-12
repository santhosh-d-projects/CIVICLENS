import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 mx-auto flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-teal-500/20 mb-4">
          <Eye className="w-7 h-7 stroke-[2.5]" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Log in to CivicLens</h2>
        <p className="mt-1 text-xs text-slate-400">Access your role-based civic transparency portal</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-card p-8 rounded-2xl border border-slate-800 shadow-2xl">
          
          {errorMsg && (
            <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></div>
              ) : (
                <>
                  Log In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Preset Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <p className="text-xs font-bold text-slate-400 text-center mb-3">Quick Demo Account Logins:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('CITIZEN')}
                className="py-2 text-[11px] font-bold rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 transition-all text-center"
              >
                Citizen
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('CONTRACTOR')}
                className="py-2 text-[11px] font-bold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all text-center"
              >
                Contractor
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('GOVERNMENT_ADMIN')}
                className="py-2 text-[11px] font-bold rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all text-center"
              >
                Govt Admin
              </button>
            </div>
            <p className="text-[10px] text-slate-500 text-center mt-2">Demo credentials: password is Demo@123</p>
          </div>

          <div className="mt-6 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-teal-400 font-semibold hover:underline">
              Register here
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
