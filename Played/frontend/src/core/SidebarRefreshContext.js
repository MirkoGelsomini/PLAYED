import React, { createContext, useState, useCallback } from 'react';

export const SidebarRefreshContext = createContext({ refresh: () => {}, refreshToken: 0 });

export const SidebarRefreshProvider = ({ children }) => {
  const [refreshToken, setRefreshToken] = useState(0);
  const refresh = useCallback(() => setRefreshToken(t => t + 1), []);
  return (
    <SidebarRefreshContext.Provider value={{ refresh, refreshToken }}>
      {children}
    </SidebarRefreshContext.Provider>
  );
}; 