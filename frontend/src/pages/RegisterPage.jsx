import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, Lock, Mail, User, Phone, MapPin, Building, ArrowRight } from 'lucide-react';

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
      registrationId
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

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 mx-auto flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-teal-500/20 mb-4">
          <Eye className="w-7 h-7 stroke-[2.5]" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">Create a CivicLens Account</h2>
        <p className="mt-1 text-xs text-slate-400">Join the civic transparency network</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="glass-card p-8 rounded-2xl border border-slate-800 shadow-2xl">
          
          {errorMsg && (
            <div className="mb-5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Role Selector Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Select Your Role:</label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setRole('CITIZEN')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${role === 'CITIZEN' ? 'bg-teal-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Citizen
              </button>
              <button
                type="button"
                onClick={() => setRole('CONTRACTOR')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${role === 'CONTRACTOR' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Contractor
              </button>
              <button
                type="button"
                onClick={() => setRole('GOVERNMENT_ADMIN')}
                className={`py-2 text-xs font-bold rounded-lg transition-all ${role === 'GOVERNMENT_ADMIN' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Govt Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name / Representative</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ananya Sharma"
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* Citizen Specific Fields */}
            {role === 'CITIZEN' && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ward</label>
                  <select
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
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

            {/* Contractor Specific Fields */}
            {role === 'CONTRACTOR' && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Apex Civil Infra Ltd"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Registration ID</label>
                  <input
                    type="text"
                    required
                    value={registrationId}
                    onChange={(e) => setRegistrationId(e.target.value)}
                    placeholder="e.g. KA-BBMP-2024-90"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin"></div>
              ) : (
                <>
                  Register Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="text-teal-400 font-semibold hover:underline">
              Log in here
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
