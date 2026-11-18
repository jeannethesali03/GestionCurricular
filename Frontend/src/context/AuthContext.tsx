import React, { createContext, useContext, useState } from 'react';
import type { UserSession, UserRole } from '../types/auth.types';

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

    const emailLower = email.trim().toLowerCase();
    
    // MODO PRUEBAS / MOCK LOCAL con aserción de tipo para evitar conflictos con UserRole
    if (
      emailLower === 'super@unicaes.edu.sv' ||
      emailLower === 'admin@unicaes.edu.sv' ||
      emailLower === 'docente@unicaes.edu.sv'
    ) {
      let mockUser: UserSession = {
        id: 'test-id-123',
        nombre: 'Usuario Prueba',
        email: emailLower,
        rol: 'USUARIO_ESTANDAR' as UserRole,
        facultadNombre: 'Ingeniería y Tecnología',
      };

      if (emailLower === 'super@unicaes.edu.sv') {
        mockUser.nombre = 'Eyleen Salinas (Super Usuario)';
        mockUser.rol = 'SUPER_USUARIO' as UserRole;
      } else if (emailLower === 'admin@unicaes.edu.sv') {
        mockUser.nombre = 'Carlos Ruiz (Administrador)';
        mockUser.rol = 'ADMINISTRADOR' as UserRole;
      } else {
        mockUser.nombre = 'Lucía Méndez (Usuario Estándar)';
        mockUser.rol = 'USUARIO_ESTANDAR' as UserRole;
      }

      setSession(mockUser);
      return;
    }

    // Conexión al backend real si no es correo de prueba
    try {
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
    } catch (err: any) {
      throw new Error(err.message || 'Error al conectar con el servidor backend.');
    }
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