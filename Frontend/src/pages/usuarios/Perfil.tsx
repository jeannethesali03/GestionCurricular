import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usuariosApi, type DetalleUsuario } from '../../services/usuariosApi';
import { CheckCircle2, Eye, EyeOff, AlertCircle } from 'lucide-react';

export const Perfil: React.FC = () => {
  const { user, setSession } = useAuth();
  
  // Estados funcionales de datos
  const [detalle, setDetalle] = useState<DetalleUsuario | null>(null);
  const [nombreCompleto, setNombreCompleto] = useState(user?.nombre ?? '');
  const [gradoAcademico, setGradoAcademico] = useState(user?.gradoAcademico ?? '');
  const [experiencia, setExperiencia] = useState<number>(user?.experienciaEducacionSuperior ?? 0);
  
  // Estados funcionales de contraseñas y visibilidad con ojitos
  const [contrasenaActual, setContrasenaActual] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [confirmacion, setConfirmacion] = useState('');

  const [mostrarPassActual, setMostrarPassActual] = useState(false);
  const [mostrarNuevoPass, setMostrarNuevoPass] = useState(false);
  const [mostrarConfPass, setMostrarConfPass] = useState(false);

  // Estados de carga, error y éxito separados para cada sección (heredados de la lógica robusta)
  const [errorDatos, setErrorDatos] = useState('');
  const [exitoDatos, setExitoDatos] = useState(false);
  const [guardandoDatos, setGuardandoDatos] = useState(false);

  const [errorPass, setErrorPass] = useState('');
  const [exitoPass, setExitoPass] = useState(false);
  const [guardandoPass, setGuardandoPass] = useState(false);

  // Cargar datos reales del perfil al montar el componente
  useEffect(() => {
    if (!user) return;
    let vigente = true;
    usuariosApi.obtenerDetalle(user.id)
      .then((resultado) => {
        if (!vigente) return;
        setDetalle(resultado);
        setNombreCompleto(resultado.usuario.nombreCompleto);
        setGradoAcademico(resultado.usuario.gradoAcademico);
        setExperiencia(resultado.usuario.experienciaEducacionSuperior);
      })
      .catch((err: unknown) => { 
        if (vigente) setErrorDatos(err instanceof Error ? err.message : 'No se pudo cargar el perfil.'); 
      });
    return () => { vigente = false; };
  }, [user]);

  if (!user) return null;

  // Manejador funcional para guardar perfil
  const handleGuardarDatos = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorDatos('');
    setExitoDatos(false);
    setGuardandoDatos(true);

    if (isNaN(experiencia) || experiencia < 0) {
      setErrorDatos('La experiencia en educación superior debe ser un número entero válido.');
      setGuardandoDatos(false);
      return;
    }

    try {
      const actualizado = await usuariosApi.actualizarPerfil(user.id, {
        nombreCompleto: nombreCompleto.trim(),
        gradoAcademico: gradoAcademico.trim(),
        experienciaEducacionSuperior: experiencia,
      });

      // Actualizar sesión global
      setSession({
        ...user,
        nombre: actualizado.nombreCompleto,
        gradoAcademico: actualizado.gradoAcademico,
        experienciaEducacionSuperior: actualizado.experienciaEducacionSuperior,
      });

      setExitoDatos(true);
    } catch (err) {
      setErrorDatos(err instanceof Error ? err.message : 'No se pudo actualizar el perfil.');
    } finally {
      setGuardandoDatos(false);
    }
  };

  // Manejador funcional para actualizar contraseña
  const handleActualizarPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorPass('');
    setExitoPass(false);

    if (contrasenaActual.trim() === '') {
      setErrorPass('Por favor, ingresa tu contraseña actual.');
      return;
    }
    if (nuevaContrasena.length < 8) {
      setErrorPass('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (nuevaContrasena !== confirmacion) {
      setErrorPass('La nueva contraseña y su confirmación no coinciden.');
      return;
    }

    setGuardandoPass(true);
    try {
      await usuariosApi.cambiarContrasena(user.id, contrasenaActual, nuevaContrasena);
      setContrasenaActual('');
      setNuevaContrasena('');
      setConfirmacion('');
      setExitoPass(true);
    } catch (err) {
      setErrorPass(err instanceof Error ? err.message : 'No se pudo cambiar la contraseña.');
    } finally {
      setGuardandoPass(false);
    }
  };

  const iniciales = nombreCompleto
    ? nombreCompleto
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'LM';

  const nombreRol = user.rol === 'USUARIO' ? 'Usuario Estándar' : user.rol === 'ADMINISTRADOR' ? 'Administrador' : 'Superusuario';

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
        {/* Columna Izquierda: Resumen (Diseño bonito + Datos dinámicos de detalle) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] text-center space-y-4">
            <div className="w-20 h-20 bg-[#EEF0F8] text-[#050758] font-extrabold text-2xl rounded-full flex items-center justify-center mx-auto shadow-inner">
              {iniciales}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{nombreCompleto || user.nombre}</h3>
              <div className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-700">
                <span className="w-2 h-2 rounded-full bg-[#050758]" />
                {nombreRol}
              </div>
            </div>

            <div className="text-xs text-gray-500 pt-2 border-t border-gray-100 space-y-1">
              <p className="font-medium text-gray-700">
                {gradoAcademico || 'Sin grado académico'}
              </p>
              <p>{user.email}</p>
              <p>{user.facultadNombre || 'Sin facultad asignada'}</p>
            </div>

            <div className="pt-2 flex justify-center">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Activo
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
            <h4 className="text-sm font-bold text-gray-900">Asignaciones institucionales</h4>
            <div className="text-xs text-gray-600 space-y-2">
              <p className="font-medium">{detalle ? `${detalle.planesAsignados.length} planes de estudio` : 'Cargando...'}</p>
              <p className="font-medium">{detalle ? `${detalle.asignaturasAsignadas.length} asignaturas` : 'Cargando...'}</p>
              <p className="text-[11px] text-gray-400 pt-1 border-t border-gray-100">
                Último acceso: {detalle?.usuario.ultimoAcceso ? new Date(detalle.usuario.ultimoAcceso).toLocaleString() : 'Sin registro'}
              </p>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Formularios (Diseño bonito con toda la funcionalidad intacta) */}
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
              <div className="border border-gray-200 rounded-xl px-3.5 py-2">
                <label className="text-[10px] font-medium text-gray-400">Nombre completo *</label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none"
                />
              </div>

              {/* Grado Académico y Experiencia en Educación Superior */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-xl px-3.5 py-2">
                  <label className="text-[10px] font-medium text-gray-400">Grado académico *</label>
                  <input
                    type="text"
                    required
                    maxLength={150}
                    value={gradoAcademico}
                    onChange={(e) => setGradoAcademico(e.target.value)}
                    placeholder="Ej. Licenciada en Computación"
                    className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none"
                  />
                </div>
                <div className="border border-gray-200 rounded-xl px-3.5 py-2">
                  <label className="text-[10px] font-medium text-gray-400">Experiencia en educación superior (Años enteros) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={experiencia}
                    onChange={(e) => setExperiencia(Number(e.target.value))}
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

              {/* Facultad Bloqueada */}
              <div className="border border-gray-200 rounded-xl px-3.5 py-2 bg-gray-50/50">
                <label className="text-[10px] font-medium text-gray-400">Facultad (No modificable)</label>
                <input
                  type="text"
                  disabled
                  value={user.facultadNombre || 'Sin facultad asignada'}
                  className="w-full text-xs font-medium text-gray-500 bg-transparent mt-0.5 focus:outline-none cursor-not-allowed"
                />
              </div>

              {/* Mensajes de error o éxito */}
              {errorDatos && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <p className="text-xs font-bold">{errorDatos}</p>
                </div>
              )}

              {exitoDatos && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <p className="text-xs font-bold">¡Datos del perfil actualizados correctamente!</p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={guardandoDatos}
                  className="bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                  {guardandoDatos ? 'Guardando...' : 'Guardar datos personales'}
                </button>
              </div>
            </form>
          </div>

          {/* Credenciales de Acceso */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
            <div>
              <h3 className="text-base font-bold text-gray-900">Credenciales de acceso</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Usa al menos 8 caracteres para tu nueva contraseña de acceso al sistema.
              </p>
            </div>

            <form onSubmit={handleActualizarPassword} className="space-y-4">
              {/* Contraseña Actual */}
              <div className="border border-gray-200 rounded-xl px-3.5 py-2">
                <label className="text-[10px] font-medium text-gray-400">Contraseña actual *</label>
                <div className="relative flex items-center mt-0.5">
                  <input
                    type={mostrarPassActual ? 'text' : 'password'}
                    required
                    maxLength={128}
                    value={contrasenaActual}
                    onChange={(e) => setContrasenaActual(e.target.value)}
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
                      required
                      minLength={8}
                      maxLength={128}
                      value={nuevaContrasena}
                      onChange={(e) => setNuevaContrasena(e.target.value)}
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
                      required
                      minLength={8}
                      maxLength={128}
                      value={confirmacion}
                      onChange={(e) => setConfirmacion(e.target.value)}
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

              {/* Mensajes de error o éxito */}
              {errorPass && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <p className="text-xs font-bold">{errorPass}</p>
                </div>
              )}

              {exitoPass && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <p className="text-xs font-bold">¡Contraseña actualizada correctamente!</p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={guardandoPass}
                  className="bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition cursor-pointer disabled:opacity-50"
                >
                  {guardandoPass ? 'Actualizando...' : 'Actualizar contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};