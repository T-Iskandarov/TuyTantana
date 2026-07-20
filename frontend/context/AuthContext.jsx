'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      api
        .getMe(savedToken)
        .then((res) => {
          if (res.success) {
            setUser(res.data);
            setToken(savedToken);
          } else {
            localStorage.removeItem('token');
          }
        })
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (phone_number, password) => {
    const res = await api.login({ phone_number, password });
    if (res.success) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
    }
    return res;
  };

  const register = async (data) => {
    const res = await api.register(data);
    if (res.success) {
      setUser(res.data.user);
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
    }
    return res;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
