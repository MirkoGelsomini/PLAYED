import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/api/users/auth/status', { withCredentials: true });
      const data = response.data;
      if (data.isAuthenticated && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Errore nel controllo dello stato di autenticazione:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Controlla lo stato solo al mount iniziale
    checkAuthStatus();
  }, []);

  const login = (userData) => {
    setUser(userData);
    setLoading(false);
  };

  const logout = async () => {
    try {
      await axios.post('/api/users/auth/logout', {}, { withCredentials: true });
    } catch (error) {
      console.error('Errore durante il logout:', error);
    } finally {
      setUser(null);
    }
  };

  // Utility per gestire errori 401 (token scaduto)
  const handle401 = () => {
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, handle401, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 