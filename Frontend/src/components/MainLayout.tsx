import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types/auth.types';
import { SidebarUsuario } from './sidebars/SidebarUsuario';
import { SidebarAdmin } from './sidebars/SidebarAdmin';
import { SidebarSuperUsuario } from './sidebars/SidebarSuperUsuario';

export const MainLayout: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const roleBadgeLabel: Record<UserRole, string> = {
    USUARIO: 'Usuario Estándar',
    ADMINISTRADOR: 'Administrador',
    SUPER_USUARIO: 'Superusuario',
  };

  const renderSidebarByRole = () => {
    switch (user.rol) {
      case 'ADMINISTRADOR':
        return <SidebarAdmin />;
      case 'SUPER_USUARIO':
        return <SidebarSuperUsuario />;
      case 'USUARIO':
      default:
        return <SidebarUsuario />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F9FB] flex font-sans text-gray-800">
      {/* Barra Lateral según el rol */}
      {renderSidebarByRole()}

      {/* Contenedor Derecho */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-gray-200/80 px-8 flex items-center justify-between sticky top-0 z-10">
          <p className="text-xs text-gray-500">
            Sistema Web de Gestión Colaborativa de Planes de Estudio y Reportes Institucionales
          </p>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#050758]" />
            <span className="text-xs font-bold text-[#050758]">
              {roleBadgeLabel[user.rol]}
            </span>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-6xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};