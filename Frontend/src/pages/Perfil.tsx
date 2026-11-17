import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const Perfil: React.FC = () => {
  const { user } = useAuth();

  const [nombres, setNombres] = useState(user?.nombre?.split(' ')[0] || 'Lucía');
  const [apellidos, setApellidos] = useState(user?.nombre?.split(' ').slice(1).join(' ') || 'Méndez');
  const [telefono, setTelefono] = useState('+503 2224 0182');
  
  const [passwordActual, setPasswordActual] = useState('');
  const [nuevoPassword, setNuevoPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');

  if (!user) return null;

  const handleGuardarDatos = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Datos personales actualizados correctamente.');
  };

  const handleActualizarPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (nuevoPassword !== confirmarPassword) {
      alert('Las nuevas contraseñas no coinciden.');
      return;
    }
    alert('Contraseña actualizada exitosamente.');
    setPasswordActual('');
    setNuevoPassword('');
    setConfirmarPassword('');
  };

  const iniciales = user.nombre
    ? user.nombre
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'LM';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
          Mi Perfil
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Consulta tus datos personales y actualiza tus credenciales de acceso.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] text-center space-y-4">
            <div className="w-20 h-20 bg-[#EEF0F8] text-[#050758] font-extrabold text-2xl rounded-full flex items-center justify-center mx-auto shadow-inner">
              {iniciales}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{user.nombre}</h3>
              <div className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-700">
                <span className="w-2 h-2 rounded-full bg-[#050758]" />
                {user.rol === 'USUARIO'
                  ? 'Usuario Estándar'
                  : user.rol === 'ADMINISTRADOR'
                  ? 'Administrador'
                  : 'Superusuario'}
              </div>
            </div>

            <div className="text-xs text-gray-500 pt-2 border-t border-gray-100 space-y-1">
              <p className="font-medium text-gray-700">
                Docente - Departamento de Sistemas
              </p>
              <p>{user.facultadNombre || 'Ingeniería y Tecnología'}</p>
            </div>

            <div className="pt-2 flex justify-center">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Activo
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
            <h4 className="text-sm font-bold text-gray-900">Asignaciones</h4>
            <div className="text-xs text-gray-600 space-y-2">
              <p className="font-medium">2 planes de estudio</p>
              <p className="font-medium">2 asignaturas</p>
              <p className="text-[11px] text-gray-400 pt-1 border-t border-gray-100">
                Último acceso: 20 oct 2026, 09:18
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
            <div>
              <h3 className="text-base font-bold text-gray-900">Datos personales</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Tu identificación y tu facultad son administradas por la institución.
              </p>
            </div>

            <form onSubmit={handleGuardarDatos} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-xl px-3.5 py-2">
                  <label className="text-[10px] font-medium text-gray-400">Nombres</label>
                  <input
                    type="text"
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none"
                  />
                </div>
                <div className="border border-gray-200 rounded-xl px-3.5 py-2">
                  <label className="text-[10px] font-medium text-gray-400">Apellidos</label>
                  <input
                    type="text"
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none"
                  />
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl px-3.5 py-2 bg-gray-50/50">
                <label className="text-[10px] font-medium text-gray-400">Correo institucional</label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full text-xs font-medium text-gray-500 bg-transparent mt-0.5 focus:outline-none cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-xl px-3.5 py-2 bg-gray-50/50">
                  <label className="text-[10px] font-medium text-gray-400">Identificación institucional</label>
                  <input
                    type="text"
                    disabled
                    value="DOC-0142"
                    className="w-full text-xs font-medium text-gray-500 bg-transparent mt-0.5 focus:outline-none cursor-not-allowed"
                  />
                </div>
                <div className="border border-gray-200 rounded-xl px-3.5 py-2">
                  <label className="text-[10px] font-medium text-gray-400">Teléfono</label>
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none"
                  />
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl px-3.5 py-2 bg-gray-50/50">
                <label className="text-[10px] font-medium text-gray-400">Facultad</label>
                <input
                  type="text"
                  disabled
                  value={user.facultadNombre || 'Ingeniería y Tecnología'}
                  className="w-full text-xs font-medium text-gray-500 bg-transparent mt-0.5 focus:outline-none cursor-not-allowed"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
                >
                  Guardar datos personales
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
            <div>
              <h3 className="text-base font-bold text-gray-900">Credenciales de acceso</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Usa al menos 12 caracteres, mayúsculas, minúsculas y números.
              </p>
            </div>

            <form onSubmit={handleActualizarPassword} className="space-y-4">
              <div className="border border-gray-200 rounded-xl px-3.5 py-2">
                <label className="text-[10px] font-medium text-gray-400">Contraseña actual</label>
                <input
                  type="password"
                  value={passwordActual}
                  onChange={(e) => setPasswordActual(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-xl px-3.5 py-2">
                  <label className="text-[10px] font-medium text-gray-400">Nueva contraseña</label>
                  <input
                    type="password"
                    value={nuevoPassword}
                    onChange={(e) => setNuevoPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none"
                  />
                </div>
                <div className="border border-gray-200 rounded-xl px-3.5 py-2">
                  <label className="text-[10px] font-medium text-gray-400">Confirmar nueva contraseña</label>
                  <input
                    type="password"
                    value={confirmarPassword}
                    onChange={(e) => setConfirmarPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
                >
                  Actualizar contraseña
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};