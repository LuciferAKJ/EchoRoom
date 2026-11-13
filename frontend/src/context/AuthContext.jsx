import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [identity, setIdentity] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('echoroom_token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch current user and identity on initial app load if token exists
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const storedToken = localStorage.getItem('echoroom_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          setIdentity(res.data.identity);
          setToken(storedToken);
        }
      } catch (err) {
        console.warn('[AuthContext] Session expired or invalid token:', err.response?.data?.message);
        localStorage.removeItem('echoroom_token');
        setUser(null);
        setIdentity(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Register action
  const register = async (email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/register', { email, password });
      if (res.data.success) {
        localStorage.setItem('echoroom_token', res.data.token);
        setUser(res.data.user);
        setIdentity(res.data.identity);
        setToken(res.data.token);
        return { success: true, data: res.data };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Login action
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('echoroom_token', res.data.token);
        setUser(res.data.user);
        setIdentity(res.data.identity);
        setToken(res.data.token);
        return { success: true, data: res.data };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Logout action
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('echoroom_token');
      setUser(null);
      setIdentity(null);
      setToken(null);
    }
  };

  // Update anonymous identity
  const updateIdentity = async (updates) => {
    try {
      const res = await api.patch('/identity/me', updates);
      if (res.data.success) {
        setIdentity(res.data.data);
        return { success: true, data: res.data.data };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update identity.';
      return { success: false, error: msg };
    }
  };

  const value = {
    user,
    identity,
    token,
    loading,
    error,
    isAuthenticated: !!user && !!token,
    register,
    login,
    logout,
    updateIdentity,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
