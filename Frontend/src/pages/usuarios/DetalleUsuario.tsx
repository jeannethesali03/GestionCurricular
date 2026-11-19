import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Layers, Mail, GraduationCap, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usuariosApi, type DetalleUsuario as DetalleUsuarioData } from '../../services/usuariosApi';

// Función auxiliar para formatear los roles de la base de datos de forma limpia
function formatearRol(nombreRol?: string | null): string {
  if (!nombreRol) return 'Rol sin asignar';
  
  const normalizado = nombreRol.toUpperCase().trim();
  
  switch (normalizado) {
    case 'SUPER_USUARIO':
    case 'SUPERUSUARIO':
      return 'Super usuario';
    case 'ADMINISTRADOR':
      return 'Administrador';
    case 'USUARIO':
    case 'USUARIO_ESTANDAR':
      return 'Usuario estándar';
    default:
      const limpio = nombreRol.replace(/_/g, ' ').toLowerCase();
      return limpio.charAt(0).toUpperCase() + limpio.slice(1);
  }
}

export const DetalleUsuario: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  // Estados funcionales de la API
  const [detalle, setDetalle] = useState<DetalleUsuarioData | null>(null);
  const [error, setError] = useState('');

  // Cargar detalles reales del usuario al montar el componente
  useEffect(() => {
    if (!id) return;
    let vigente = true;
    usuariosApi.obtenerDetalle(id)
      .then((resultado) => { 
        if (vigente) setDetalle(resultado); 
      })
      .catch((err: unknown) => { 
        if (vigente) setError(err instanceof Error ? err.message : 'No se pudo cargar el detalle del usuario.'); 
      });
    return () => { vigente = false; };
  }, [id]);

  if (!user) return null;

  const registro = detalle?.usuario;
  const iniciales = registro?.nombreCompleto 
    ? registro.nombreCompleto.split(/\s+/).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase() 
    : 'U';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Botón Volver y Estado Superior */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/usuarios')}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900 transition cursor-pointer bg-white border border-gray-200 px-3.5 py-2 rounded-xl shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al directorio
        </button>

        {registro && (
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1 rounded-full border ${
            registro.estadoCuenta === 'activo' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-gray-100 text-gray-500 border-gray-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${registro.estadoCuenta === 'activo' ? 'bg-emerald-600' : 'bg-gray-400'}`} />
            {registro.estadoCuenta === 'activo' ? 'Activo' : 'Inactivo'}
          </span>
        )}
      </div>

      <div>
        <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
          Detalle del Usuario
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Consulta de perfil institucional, datos académicos y asignaciones de planes y asignaturas.
        </p>
      </div>

      {/* Manejo de errores y estados de carga */}
      {error && (
        <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          {error}
        </div>
      )}

      {!detalle && !error && (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center text-xs text-gray-500 shadow-sm">
          Cargando datos del usuario desde la base de datos...
        </div>
      )}

      {detalle && registro && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna Izquierda: Tarjeta de Resumen */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] text-center space-y-4">
              <div className="w-20 h-20 bg-[#EEF0F8] text-[#050758] font-extrabold text-2xl rounded-full flex items-center justify-center mx-auto shadow-inner">
                {iniciales}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{registro.nombreCompleto}</h3>
                <div className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-700">
                  <span className="w-2 h-2 rounded-full bg-[#050758]" />
                  {formatearRol(registro.nombreRol)}
                </div>
              </div>

              <div className="text-xs text-gray-500 pt-3 border-t border-gray-100 space-y-2 text-left">
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                  <GraduationCap className="w-4 h-4 text-[#050758] shrink-0" />
                  <span>{registro.gradoAcademico || 'Sin grado académico'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{registro.experienciaEducacionSuperior} años de experiencia en educación superior</span>
                </div>
                <div className="pt-1 text-gray-600 font-medium">
                  Facultad: <span className="text-gray-900">{registro.nombreFacultad ?? 'Sin facultad asignada'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
              <h4 className="text-sm font-bold text-gray-900">Actividad de cuenta</h4>
              <div className="text-xs text-gray-600 space-y-1.5">
                <p className="text-[11px] text-gray-500">
                  Último acceso: <span className="font-semibold text-gray-800">{registro.ultimoAcceso ? new Date(registro.ultimoAcceso).toLocaleString() : 'Sin registro'}</span>
                </p>
                <p className="text-[11px] text-gray-500">
                  Registrado: <span className="font-semibold text-gray-800">{registro.fechaRegistro ? new Date(registro.fechaRegistro).toLocaleDateString() : 'Sin registro'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Información Completa y Asignaciones */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Datos Personales y de Contacto */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
              <h3 className="text-base font-bold text-gray-900">Información de contacto e institucional</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 space-y-1">
                  <span className="text-[10px] font-medium text-gray-400 block">Nombre completo</span>
                  <p className="font-bold text-gray-800">{registro.nombreCompleto}</p>
                </div>

                <div className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 space-y-1">
                  <span className="text-[10px] font-medium text-gray-400 block">Correo institucional</span>
                  <div className="flex items-center gap-2 text-gray-800 font-bold">
                    <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>{registro.correo}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Asignaciones: Planes de Estudio */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#050758]" />
                <h3 className="text-base font-bold text-gray-900">Planes de estudio asignados ({detalle.planesAsignados.length})</h3>
              </div>

              {detalle.planesAsignados.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No hay planes de estudio asignados a este usuario.</p>
              ) : (
                <div className="space-y-2.5">
                  {detalle.planesAsignados.map((plan) => (
                    <div key={plan.idPlan} className="border border-gray-200/80 rounded-xl p-3.5 bg-gray-50/40 text-xs flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-[#050758]">{plan.nombreCarrera}</span>
                        <p className="font-medium text-gray-500 mt-0.5">{plan.cicloInicio} – {plan.cicloFin}</p>
                      </div>
                      <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-gray-600 font-semibold">
                        {plan.estadoPlan}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Asignaciones: Asignaturas */}
            <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#050758]" />
                <h3 className="text-base font-bold text-gray-900">Asignaturas asignadas ({detalle.asignaturasAsignadas.length})</h3>
              </div>

              {detalle.asignaturasAsignadas.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No hay asignaturas asignadas a este usuario.</p>
              ) : (
                <div className="space-y-2.5">
                  {detalle.asignaturasAsignadas.map((asignatura) => (
                    <div key={asignatura.idAsignatura} className="border border-gray-200/80 rounded-xl p-3.5 flex items-center justify-between bg-gray-50/40 text-xs">
                      <div>
                        <span className="font-extrabold text-[#050758]">{asignatura.codigoAsignatura}</span>
                        <p className="font-medium text-gray-800 mt-0.5">{asignatura.nombreAsignatura}</p>
                      </div>
                      <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-gray-600 font-semibold">
                        {asignatura.cicloAcademico}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Historial de cambios */}
            {detalle.historialCambios.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
                <h3 className="text-base font-bold text-gray-900">Historial de cambios</h3>
                <div className="space-y-3">
                  {detalle.historialCambios.map((cambio) => (
                    <div key={cambio.idRegistroCambio} className="border-l-2 border-[#050758] pl-3.5 text-xs space-y-0.5">
                      <p className="font-bold text-gray-800">{cambio.tituloCambio}</p>
                      <p className="text-gray-500">{cambio.detalleCambio} · <span className="font-medium">{new Date(cambio.fechaHora).toLocaleString()}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};