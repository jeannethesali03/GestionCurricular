import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Building2, MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const GestionUniversidad: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const rolActual = (user?.rol as string) || '';
  const esSuperUsuario = rolActual === 'SUPER_USUARIO';

  // Si no es superusuario (es administrador o usuario estándar), muestra la pantalla limpia de Página no encontrada (404)
  if (!user || !esSuperUsuario) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center space-y-4 bg-white rounded-2xl border border-gray-200 mt-16 shadow-sm">
        <p className="text-6xl font-extrabold text-[#050758]">404</p>
        <h2 className="text-2xl font-bold text-gray-900">Página no encontrada</h2>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          La página que estás buscando no existe, ha sido movida o no tienes autorización para visualizarla.
        </p>
        <div className="pt-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-6 py-3 rounded-xl transition cursor-pointer shadow-sm"
          >
            Regresar al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Encabezado Superior */}
      <div>
        <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
          Gestión de Universidad
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Panel de control global para la administración de la infraestructura institucional, carreras y sedes académicas.
        </p>
      </div>

      {/* Grid de 3 Tarjetas de Gestión */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Tarjeta 1: Gestión de Carreras */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-6 hover:border-[#050758]/40 transition">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-[#050758]/5 text-[#050758] rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Gestión de Carreras</h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Administra el catálogo general de carreras universitarias.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/app/university/carreras')} // Ajusta la ruta cuando crees la vista
            className="inline-flex items-center justify-between w-full bg-gray-50 hover:bg-[#050758] text-gray-700 hover:text-white text-xs font-bold px-4 py-3 rounded-xl transition cursor-pointer group"
          >
            <span>Administrar carreras</span>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition" />
          </button>
        </div>

        {/* Tarjeta 2: Gestión de Facultades */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-6 hover:border-[#050758]/40 transition">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-[#050758]/5 text-[#050758] rounded-2xl flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Gestión de Facultades</h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Gestiona la creación, edición y eliminación de las facultades institucionales.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/app/university/facultades')} // Ajusta la ruta cuando crees la vista
            className="inline-flex items-center justify-between w-full bg-gray-50 hover:bg-[#050758] text-gray-700 hover:text-white text-xs font-bold px-4 py-3 rounded-xl transition cursor-pointer group"
          >
            <span>Administrar facultades</span>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition" />
          </button>
        </div>

        {/* Tarjeta 3: Gestión de Sedes */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-6 hover:border-[#050758]/40 transition">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-[#050758]/5 text-[#050758] rounded-2xl flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Gestión de Sedes</h3>
              <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                Administra las sedes físicas de la universidad, campus regionales, ubicaciones y centros de atención.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('/app/university/sedes')} // Ajusta la ruta cuando crees la vista
            className="inline-flex items-center justify-between w-full bg-gray-50 hover:bg-[#050758] text-gray-700 hover:text-white text-xs font-bold px-4 py-3 rounded-xl transition cursor-pointer group"
          >
            <span>Administrar sedes</span>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white transition" />
          </button>
        </div>

      </div>
    </div>
  );
};