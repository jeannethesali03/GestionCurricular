import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DesactivarUsuario: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const rolActual = (user?.rol as string) || '';
  const esSuperUsuario = rolActual === 'SUPER_USUARIO';
  const esAdministrador = rolActual === 'ADMINISTRADOR';

  // Si es un usuario estándar (o no autenticado), muestra la pantalla limpia de Página no encontrada (404)
  if (!user || (!esSuperUsuario && !esAdministrador)) {
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

  const [desactivado, setDesactivado] = useState(false);

  const handleDesactivar = () => {
    setDesactivado(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-6 pb-12">
      <div>
        <h2 className="text-3xl font-bold text-[#050758] tracking-tight">Desactivar usuario</h2>
        <p className="text-xs text-gray-500 mt-1">
          {esSuperUsuario
            ? `Superusuario · Desactivación de cuenta en el sistema (ID: ${id || '1'})`
            : `Administrador de Facultad · Desactivación de usuario estándar (ID: ${id || '1'})`}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 p-8 space-y-6 shadow-sm">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-center gap-3">
          <Lock className="w-5 h-5 shrink-0 text-red-600" />
          <p className="text-xs font-bold">Esta acción desactivará el acceso del usuario al sistema y lo moverá al final del listado.</p>
        </div>

        <div className="border border-gray-200 rounded-xl p-5 space-y-2">
          <h4 className="font-bold text-gray-900">Lucía Méndez</h4>
          <p className="text-xs text-gray-500">lucia.mendez@catolica.edu.sv · Usuario Estándar</p>
          <p className="text-xs text-gray-600 font-medium pt-1">
            {user.facultadNombre ? `Facultad de ${user.facultadNombre}` : 'Facultad de Ingeniería y Tecnología'}
          </p>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed">
          Se retirarán sus 2 planes y 2 asignaturas asignadas. La información académica y el historial de autoría se conservarán.
        </p>

        {desactivado && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <p className="text-xs font-bold">¡Usuario desactivado correctamente!</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/usuarios')}
            className="border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold px-5 py-3 rounded-xl transition cursor-pointer"
          >
            {desactivado ? 'Volver al directorio' : 'Cancelar'}
          </button>

          {!desactivado && (
            <button
              type="button"
              onClick={handleDesactivar}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition cursor-pointer shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              Desactivar usuario
            </button>
          )}
        </div>
      </div>
    </div>
  );
};