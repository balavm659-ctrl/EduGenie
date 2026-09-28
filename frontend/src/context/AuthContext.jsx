import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('edugenie_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('edugenie_token'));
  const [loading, setLoading] = useState(true);

  // Sync session on initial load
  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const profile = await api.getMe();
          setUser(profile);
          localStorage.setItem('edugenie_user', JSON.stringify(profile));
        } catch (err) {
          console.error("Session verification failed:", err);
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    localStorage.setItem('edugenie_token', res.access_token);
    localStorage.setItem('edugenie_user', JSON.stringify(res.user));
    setToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const loginDemo = async () => {
    return login('student@edugenie.demo', 'DemoPass123!');
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    localStorage.setItem('edugenie_token', res.access_token);
    localStorage.setItem('edugenie_user', JSON.stringify(res.user));
    setToken(res.access_token);
    setUser(res.user);
    return res.user;
  };

  const completeOnboarding = async (data) => {
    const updated = await api.completeOnboarding(data);
    setUser(updated);
    localStorage.setItem('edugenie_user', JSON.stringify(updated));
    return updated;
  };

  const updateUser = (updated) => {
    setUser(updated);
    localStorage.setItem('edugenie_user', JSON.stringify(updated));
  };

  const logout = () => {
    localStorage.removeItem('edugenie_token');
    localStorage.removeItem('edugenie_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!token && !!user,
      login,
      loginDemo,
      register,
      completeOnboarding,
      updateUser,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
