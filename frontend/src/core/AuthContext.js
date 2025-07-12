import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Recupera lo stato autenticazione dal backend tramite cookie
    fetch('/api/users/me', {
      credentials: 'include',
    })
      .then(async res => {
        if (!res.ok) {
          setUser(null);
          return;
        }
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
    // Effettua logout anche lato backend (opzionale: crea endpoint /logout per cancellare il cookie)
    fetch('/api/users/auth/logout', { method: 'POST', credentials: 'include' });
  };

  // Utility per gestire errori 401 (token scaduto)
  const handle401 = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, handle401, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 