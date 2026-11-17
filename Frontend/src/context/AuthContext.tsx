import React, { createContext, useContext, useState } from 'react';
import type { UserSession } from '../types/auth.types';

interface AuthContextType {
  user: UserSession | null;
  setSession: (userData: UserSession) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('unicaes_curricular_user');
    return saved ? JSON.parse(saved) : null;
  });

  const setSession = (userData: UserSession) => {
    localStorage.setItem('unicaes_curricular_user', JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error('Por favor, completa todos los campos.');
    }

    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Credenciales incorrectas o error de conexión con el servidor.');
    }

    const userData: UserSession = await response.json();
    setSession(userData);
  };

  const logout = () => {
    localStorage.removeItem('unicaes_curricular_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setSession, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};