import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Recupera token e user dal localStorage all'avvio
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Controllo scadenza token ogni volta che cambia la pagina
  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && Date.now() >= payload.exp * 1000) {
          logout();
          window.location.href = '/login';
        }
      } catch (e) {
        // Token malformato, logout di sicurezza
        logout();
        window.location.href = '/login';
      }
    }
  }, [token, location]);

  const login = (userData, jwt) => {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem('token', jwt);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Utility per gestire errori 401 (token scaduto)
  const handle401 = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, handle401, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 