import React, { createContext, useContext, useState } from 'react';
import type { UserSession } from '../types/auth.types';
import { usuariosApi } from '../services/usuariosApi';

interface AuthContextType {
  user: UserSession | null;
  setSession: (userData: UserSession) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(leerSesionGuardada);

  const setSession = (userData: UserSession) => {
    sessionStorage.setItem('unicaes_curricular_user', JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error('Por favor, completa todos los campos.');
    }

    const userData = await usuariosApi.iniciarSesion(email, password);
    setSession({
      ...userData,
      sessionToken: userData.sessionToken,
      facultadId: userData.facultadId ?? undefined,
      facultadNombre: userData.facultadNombre ?? undefined,
    });
  };

  const logout = async () => {
    await usuariosApi.cerrarSesion();
    sessionStorage.removeItem('unicaes_curricular_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setSession, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

function leerSesionGuardada(): UserSession | null {
  const key = 'unicaes_curricular_user';
  const saved = sessionStorage.getItem(key);
  localStorage.removeItem(key);
  if (!saved) return null;

  try {
    const parsed = JSON.parse(saved) as UserSession;
    if (/^\d+$/.test(parsed.id)
      && typeof parsed.sessionToken === 'string'
      && parsed.sessionToken.length > 0
      && ['SUPER_USUARIO', 'ADMINISTRADOR', 'USUARIO'].includes(parsed.rol)) {
      return parsed;
    }
  } catch {
    sessionStorage.removeItem(key);
    return null;
  }

  sessionStorage.removeItem(key);
  return null;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};