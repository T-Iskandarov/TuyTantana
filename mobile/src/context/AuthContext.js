import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('token');
        if (savedToken) {
          const res = await api.getMe(savedToken);
          if (res.success) {
            setUser(res.data);
            setToken(savedToken);
          } else {
            await AsyncStorage.removeItem('token');
          }
        }
      } catch (e) {
        await AsyncStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (phone_number, password) => {
    const res = await api.login({ phone_number, password });
    if (res.success) {
      setUser(res.data.user);
      setToken(res.data.token);
      await AsyncStorage.setItem('token', res.data.token);
    }
    return res;
  };

  const register = async (data) => {
    const res = await api.register(data);
    if (res.success) {
      setUser(res.data.user);
      setToken(res.data.token);
      await AsyncStorage.setItem('token', res.data.token);
    }
    return res;
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
