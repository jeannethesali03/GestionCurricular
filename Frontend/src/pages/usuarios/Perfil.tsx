import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const Perfil: React.FC = () => {
  const { user } = useAuth();

  const [nombres, setNombres] = useState(user?.nombre?.split(' ')[0] || 'Lucía');
  const [apellidos, setApellidos] = useState(user?.nombre?.split(' ').slice(1).join(' ') || 'Méndez');
  const [telefono, setTelefono] = useState('2224-0182');
  
  // Nuevos campos
  const [gradoAcademico, setGradoAcademico] = useState('Licenciada en Ciencias de la Computación');
  const [experienciaEduSuperior, setExperienciaEduSuperior] = useState<number>(5);

  // Estados de contraseñas y visibilidad con ojitos
  const [passwordActual, setPasswordActual] = useState('');
  const [nuevoPassword, setNuevoPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  
  const [mostrarPassActual, setMostrarPassActual] = useState(false);
  const [mostrarNuevoPass, setMostrarNuevoPass] = useState(false);
  const [mostrarConfPass, setMostrarConfPass] = useState(false);

  // Mensajes de éxito / error en formato de tarjeta
  const [errorDatos, setErrorDatos] = useState('');
  const [exitoDatos, setExitoDatos] = useState(false);

  const [errorPass, setErrorPass] = useState('');
  const [exitoPass, setExitoPass] = useState(false);

  if (!user) return null;

  // Formateador automático de teléfono salvadoreño opcional (####-####)
  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let valor = e.target.value.replace(/\D/g, '');
    if (valor.length > 4) {
      valor = valor.slice(0, 4) + '-' + valor.slice(4, 8);
    }
    setTelefono(valor);
  };

  const handleGuardarDatos = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorDatos('');
    setExitoDatos(false);

    // Validar teléfono opcional si se ingresó
    if (telefono.trim() !== '') {
      const telefonoRegex = /^\d{4}-\d{4}$/;
      if (!telefonoRegex.test(telefono)) {
        setErrorDatos('El número de teléfono debe tener el formato salvadoreño válido: ####-#### (ej. 2224-0196).');
        return;
      }
    }

    // Validar experiencia en educación superior
    if (isNaN(experienciaEduSuperior) || experienciaEduSuperior < 0) {
      setErrorDatos('La experiencia en educación superior debe ser un número entero válido.');
      return;
    }

    setExitoDatos(true);
  };

  const handleActualizarPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorPass('');
    setExitoPass(false);

    if (passwordActual.trim() === '') {
      setErrorPass('Por favor, ingresa tu contraseña actual.');
      return;
    }
    if (nuevoPassword.length < 6) {
      setErrorPass('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (nuevoPassword !== confirmarPassword) {
      setErrorPass('Las nuevas contraseñas no coinciden.');
      return;
    }

    setExitoPass(true);
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
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
          Mi Perfil
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Consulta tus datos personales, actualiza tu perfil académico y modifica tus credenciales de acceso.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Resumen */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] text-center space-y-4">
            <div className="w-20 h-20 bg-[#EEF0F8] text-[#050758] font-extrabold text-2xl rounded-full flex items-center justify-center mx-auto shadow-inner">
              {iniciales}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{nombres} {apellidos}</h3>
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
                {gradoAcademico}
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

        {/* Columna Derecha: Formularios */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Datos Personales y Académicos */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
            <div>
              <h3 className="text-base font-bold text-gray-900">Datos personales y académicos</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                El correo institucional, el rol y la facultad son administrados por la institución y no pueden modificarse.
              </p>
            </div>

            <form onSubmit={handleGuardarDatos} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-xl px-3.5 py-2">
                  <label className="text-[10px] font-medium text-gray-400">Nombres *</label>
                  <input
                    type="text"
                    required
                    value={nombres}
                    onChange={(e) => setNombres(e.target.value)}
                    className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none"
                  />
                </div>
                <div className="border border-gray-200 rounded-xl px-3.5 py-2">
                  <label className="text-[10px] font-medium text-gray-400">Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={apellidos}
                    onChange={(e) => setApellidos(e.target.value)}
                    className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none"
                  />
                </div>
              </div>

              {/* Grado Académico y Experiencia en Educación Superior */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-xl px-3.5 py-2">
                  <label className="text-[10px] font-medium text-gray-400">Grado académico</label>
                  <input
                    type="text"
                    value={gradoAcademico}
                    onChange={(e) => setGradoAcademico(e.target.value)}
                    placeholder="Ej. Ing., Lic., Mtr."
                    className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none"
                  />
                </div>
                <div className="border border-gray-200 rounded-xl px-3.5 py-2">
                  <label className="text-[10px] font-medium text-gray-400">Experiencia en educación superior (Años enteros)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={experienciaEduSuperior}
                    onChange={(e) => setExperienciaEduSuperior(parseInt(e.target.value) || 0)}
                    className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none"
                  />
                </div>
              </div>

              {/* Correo Bloqueado */}
              <div className="border border-gray-200 rounded-xl px-3.5 py-2 bg-gray-50/50">
                <label className="text-[10px] font-medium text-gray-400">Correo institucional (No modificable)</label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full text-xs font-medium text-gray-500 bg-transparent mt-0.5 focus:outline-none cursor-not-allowed"
                />
              </div>

              {/* Teléfono opcional */}
              <div className="border border-gray-200 rounded-xl px-3.5 py-2">
                <label className="text-[10px] font-medium text-gray-400">Teléfono (Opcional - Formato: ####-####)</label>
                <input
                  type="text"
                  maxLength={9}
                  value={telefono}
                  onChange={handleTelefonoChange}
                  placeholder="2224-0182"
                  className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none"
                />
              </div>

              {/* Facultad Bloqueada */}
              <div className="border border-gray-200 rounded-xl px-3.5 py-2 bg-gray-50/50">
                <label className="text-[10px] font-medium text-gray-400">Facultad (No modificable)</label>
                <input
                  type="text"
                  disabled
                  value={user.facultadNombre || 'Ingeniería y Tecnología'}
                  className="w-full text-xs font-medium text-gray-500 bg-transparent mt-0.5 focus:outline-none cursor-not-allowed"
                />
              </div>

              {/* Mensajes de error o éxito abajo, junto al botón */}
              {errorDatos && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <p className="text-xs font-bold">{errorDatos}</p>
                </div>
              )}

              {exitoDatos && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <p className="text-xs font-bold">¡Datos personales y profesionales actualizados correctamente!</p>
                </div>
              )}

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

          {/* Credenciales de Acceso */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
            <div>
              <h3 className="text-base font-bold text-gray-900">Credenciales de acceso</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Usa al menos 6 caracteres para tu nueva contraseña de acceso al sistema.
              </p>
            </div>

            <form onSubmit={handleActualizarPassword} className="space-y-4">
              {/* Contraseña Actual */}
              <div className="border border-gray-200 rounded-xl px-3.5 py-2">
                <label className="text-[10px] font-medium text-gray-400">Contraseña actual *</label>
                <div className="relative flex items-center mt-0.5">
                  <input
                    type={mostrarPassActual ? 'text' : 'password'}
                    value={passwordActual}
                    onChange={(e) => setPasswordActual(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full text-xs font-medium text-gray-800 bg-transparent focus:outline-none pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarPassActual(!mostrarPassActual)}
                    className="absolute right-0 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                    title={mostrarPassActual ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {mostrarPassActual ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Nueva Contraseña y Confirmación con ojitos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-xl px-3.5 py-2">
                  <label className="text-[10px] font-medium text-gray-400">Nueva contraseña *</label>
                  <div className="relative flex items-center mt-0.5">
                    <input
                      type={mostrarNuevoPass ? 'text' : 'password'}
                      value={nuevoPassword}
                      onChange={(e) => setNuevoPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full text-xs font-medium text-gray-800 bg-transparent focus:outline-none pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarNuevoPass(!mostrarNuevoPass)}
                      className="absolute right-0 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                      title={mostrarNuevoPass ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      {mostrarNuevoPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl px-3.5 py-2">
                  <label className="text-[10px] font-medium text-gray-400">Confirmar nueva contraseña *</label>
                  <div className="relative flex items-center mt-0.5">
                    <input
                      type={mostrarConfPass ? 'text' : 'password'}
                      value={confirmarPassword}
                      onChange={(e) => setConfirmarPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full text-xs font-medium text-gray-800 bg-transparent focus:outline-none pr-8"
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarConfPass(!mostrarConfPass)}
                      className="absolute right-0 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                      title={mostrarConfPass ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      {mostrarConfPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Mensajes de error o éxito abajo, junto al botón */}
              {errorPass && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <p className="text-xs font-bold">{errorPass}</p>
                </div>
              )}

              {exitoPass && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <p className="text-xs font-bold">¡Contraseña actualizada exitosamente!</p>
                </div>
              )}

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