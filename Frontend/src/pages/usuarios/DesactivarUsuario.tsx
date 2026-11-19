import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usuariosApi, type Usuario } from '../../services/usuariosApi';

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

  // Estados funcionales de la API
  const [registro, setRegistro] = useState<Usuario | null>(null);
  const [error, setError] = useState('');
  const [desactivado, setDesactivado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Cargar datos reales del usuario al montar el componente
  useEffect(() => {
    if (!id) return;
    let vigente = true;
    usuariosApi.obtener(id)
      .then((resultado) => { 
        if (vigente) setRegistro(resultado); 
      })
      .catch((err: unknown) => { 
        if (vigente) setError(err instanceof Error ? err.message : 'No se pudo cargar el usuario.'); 
      });
    return () => { vigente = false; };
  }, [id]);

  const handleDesactivar = async () => {
    if (!id) return;
    setError('');
    setGuardando(true);
    try {
      await usuariosApi.cambiarEstado(id, false);
      setDesactivado(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo desactivar el usuario.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-6 pb-12">
      <div>
        <h2 className="text-3xl font-bold text-[#050758] tracking-tight">Desactivar usuario</h2>
        <p className="text-xs text-gray-500 mt-1">
          {esSuperUsuario
            ? `Superusuario · Desactivación de cuenta en el sistema (ID: ${id || '1'})`
            : `Administrador de Facultad · Desactivación de usuario (ID: ${id || '1'})`}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 p-8 space-y-6 shadow-sm">
        
        {/* Alerta de seguridad */}
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 flex items-center gap-3">
          <Lock className="w-5 h-5 shrink-0 text-red-600" />
          <p className="text-xs font-bold">Esta acción desactivará el acceso del usuario al sistema y se conservarán sus datos y su historial.</p>
        </div>

        {/* Error visual si ocurre */}
        {error && (
          <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            {error}
          </div>
        )}

        {/* Estado de carga */}
        {!registro && !error && (
          <p className="text-xs text-gray-500 italic">Cargando datos del usuario...</p>
        )}

        {/* Datos reales del usuario consultado */}
        {registro && (
          <div className="border border-gray-200 rounded-xl p-5 space-y-2 bg-gray-50/40">
            <h4 className="font-bold text-gray-900">{registro.nombreCompleto}</h4>
            <p className="text-xs text-gray-500">{registro.correo} · <span className="font-semibold text-gray-700">{registro.nombreRol ?? 'Usuario'}</span></p>
            <p className="text-xs text-gray-600 font-medium pt-1">
              Facultad: <span className="text-gray-900">{registro.nombreFacultad ?? 'Sin facultad asignada'}</span>
            </p>
          </div>
        )}

        <p className="text-xs text-gray-500 leading-relaxed">
          La cuenta dejará de permitir el inicio de sesión en la plataforma de gestión curricular.
        </p>

        {/* Éxito */}
        {desactivado && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <p className="text-xs font-bold">¡Usuario desactivado correctamente en el sistema!</p>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/usuarios')}
            className="border border-gray-300 text-gray-700 hover:bg-gray-50 text-xs font-bold px-5 py-3 rounded-xl transition cursor-pointer shadow-sm"
          >
            {desactivado ? 'Volver al directorio' : 'Cancelar'}
          </button>

          {!desactivado && (
            <button
              type="button"
              disabled={!registro || guardando}
              onClick={handleDesactivar}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-6 py-3 rounded-xl transition cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {guardando ? 'Desactivando...' : 'Desactivar usuario'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};