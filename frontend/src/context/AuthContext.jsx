import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('civiclens_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
          } else {
            logout();
          }
        } catch (err) {
          console.error("Failed to restore auth session:", err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.token && res.data.user) {
        localStorage.setItem('civiclens_token', res.data.token);
        localStorage.setItem('civiclens_user', JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
      return { success: false, error: res.data.message || 'Login failed' };
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const register = async (formData) => {
    setError(null);
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data.token && res.data.user) {
        localStorage.setItem('civiclens_token', res.data.token);
        localStorage.setItem('civiclens_user', JSON.stringify(res.data.user));
        setToken(res.data.token);
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
      return { success: false, error: res.data.message || 'Registration failed' };
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Registration failed.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const demoLogin = async (role) => {
    let email = 'citizen@civiclens.demo';
    if (role === 'CONTRACTOR') email = 'contractor@civiclens.demo';
    if (role === 'GOVERNMENT_ADMIN') email = 'government@civiclens.demo';
    return await login(email, 'Demo@123');
  };

  const logout = () => {
    localStorage.removeItem('civiclens_token');
    localStorage.removeItem('civiclens_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        error,
        login,
        register,
        demoLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
