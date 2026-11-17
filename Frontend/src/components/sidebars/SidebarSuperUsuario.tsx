import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { label: 'Todos los Planes', to: '/planes' },
  { label: 'Facultades y Catálogos', to: '/facultades' },
  { label: 'Gestión de Usuarios', to: '/usuarios' },
  { label: 'Bitácora y Auditoría', to: '/auditoria' },
  { label: 'Mi Perfil', to: '/perfil' },
];

export const SidebarSuperUsuario: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-[240px] shrink-0 bg-[#8B1124] text-white flex flex-col justify-between min-h-screen sticky top-0">
      <div>
        <div className="px-6 pt-7 pb-6">
          <h1 className="text-[22px] font-extrabold leading-tight tracking-tight">
            Gestión
            <br />
            Curricular
          </h1>
          <span className="text-[10px] font-semibold tracking-widest uppercase text-white/75">
            UNICAES
          </span>
        </div>

        <nav className="px-3 space-y-1.5">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg text-[13px] transition ${
                  isActive
                    ? 'bg-white text-[#050758] font-bold shadow-sm'
                    : 'text-white/90 hover:bg-white/10 font-medium'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="px-4 pb-6 pt-4 space-y-5">
        <div className="px-1">
          <p className="text-xs font-bold text-white leading-snug">{user?.nombre}</p>
          <p className="text-[11px] text-white/70">Sesión institucional</p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-1 py-1.5 text-white hover:text-white/80 text-[15px] font-medium transition cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};