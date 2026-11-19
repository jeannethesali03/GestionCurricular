import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Info, CheckCircle2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usuariosApi, type CatalogosUsuario, type Usuario } from '../../services/usuariosApi';

export const EditarUsuario: React.FC = () => {
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
  const [catalogos, setCatalogos] = useState<CatalogosUsuario | null>(null);
  const [registro, setRegistro] = useState<Usuario | null>(null);
  
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [correo, setCorreo] = useState('');
  const [gradoAcademico, setGradoAcademico] = useState('');
  const [experiencia, setExperiencia] = useState(0);
  const [idRol, setIdRol] = useState('');
  const [idFacultad, setIdFacultad] = useState('');
  const [password, setPassword] = useState('');
  const [activo, setActivo] = useState(true);

  // Estados de control visual y feedback
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);

  // Cargar datos del usuario y catálogos al montar el componente
  useEffect(() => {
    if (!id) return;
    let vigente = true;
    Promise.all([usuariosApi.obtener(id), usuariosApi.catalogos()])
      .then(([usuario, opciones]) => {
        if (!vigente) return;
        setRegistro(usuario);
        setCatalogos(opciones);
        setIdRol(String(usuario.idRol));
        setIdFacultad(usuario.idFacultad ? String(usuario.idFacultad) : '');
        setNombreCompleto(usuario.nombreCompleto);
        setCorreo(usuario.correo);
        setGradoAcademico(usuario.gradoAcademico);
        setExperiencia(usuario.experienciaEducacionSuperior);
        setActivo(usuario.estadoCuenta === 'activo');
      })
      .catch((err: unknown) => {
        if (vigente) setErrorValidacion(err instanceof Error ? err.message : 'No se pudo cargar el usuario.');
      });
    return () => { vigente = false; };
  }, [id]);

  // Filtrado de roles según permisos del usuario autenticado
  const rolesDisponibles = catalogos?.roles.filter((rol) => {
    const nombre = rol.nombreRol.toUpperCase();
    return esSuperUsuario || nombre === 'USUARIO' || nombre === 'USUARIO_ESTANDAR';
  }) ?? [];

  // Filtrado de facultades según permisos
  const facultadesDisponibles = catalogos?.facultades.filter((facultad) =>
    esSuperUsuario || facultad.idFacultad === user.facultadId
  ) ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !registro) return;
    setErrorValidacion('');
    setGuardando(true);

    try {
      // Validación de contraseña opcional
      if (password.trim() !== '' && password.length < 8) {
        setErrorValidacion('La nueva contraseña debe tener al menos 8 caracteres.');
        setGuardando(false);
        return;
      }

      // Actualizar datos principales del usuario
      await usuariosApi.actualizar(id, {
        idRol: Number(idRol),
        idFacultad: idFacultad ? Number(idFacultad) : null,
        nombreCompleto: nombreCompleto.trim(),
        gradoAcademico: gradoAcademico.trim(),
        experienciaEducacionSuperior: experiencia,
        correo: correo.trim(),
        ...(password ? { password } : {}),
      });

      // Actualizar estado de cuenta si cambió
      if (activo !== (registro.estadoCuenta === 'activo')) {
        await usuariosApi.cambiarEstado(id, activo);
      }

      setExito(true);
    } catch (err) {
      setErrorValidacion(err instanceof Error ? err.message : 'No se pudieron guardar los cambios.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-3xl font-bold text-[#050758] tracking-tight">Editar usuario</h2>
        <p className="text-xs text-gray-500 mt-1">
          {esSuperUsuario
            ? `Superusuario · Edición global de credenciales y permisos (ID: ${id || '1'})`
            : `Administrador de Facultad · Edición de usuario (ID: ${id || '1'})`}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200/80 p-8 space-y-6 shadow-sm">
        
        {/* Nombre completo */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700">Nombre completo *</label>
          <input
            type="text"
            required
            maxLength={150}
            value={nombreCompleto}
            onChange={e => setNombreCompleto(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 focus:outline-none focus:border-[#050758]"
          />
        </div>

        {/* Correo electrónico */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-700">Correo electrónico *</label>
          <input
            type="email"
            required
            maxLength={100}
            value={correo}
            onChange={e => setCorreo(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 focus:outline-none focus:border-[#050758]"
          />
        </div>

        {/* Grado académico y Experiencia */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Grado académico *</label>
            <input
              type="text"
              required
              maxLength={150}
              value={gradoAcademico}
              onChange={e => setGradoAcademico(e.target.value)}
              placeholder="Ej. Licenciado, Ingeniero"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 focus:outline-none focus:border-[#050758]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Experiencia en educación superior (Años) *</label>
            <input
              type="number"
              required
              min={0}
              step={1}
              value={experiencia}
              onChange={e => setExperiencia(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 focus:outline-none focus:border-[#050758]"
            />
          </div>
        </div>

        {/* ROL y FACULTAD */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Rol de usuario *</label>
            <select
              required
              value={idRol}
              onChange={(e) => setIdRol(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 font-medium bg-white focus:outline-none focus:border-[#050758] cursor-pointer"
            >
              {rolesDisponibles.map((rol) => (
                <option key={rol.idRol} value={rol.idRol}>{rol.nombreRol}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Facultad</label>
            <select
              value={idFacultad}
              onChange={(e) => setIdFacultad(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 font-medium bg-white focus:outline-none focus:border-[#050758] cursor-pointer"
            >
              <option value="">Sin facultad (Global)</option>
              {facultadesDisponibles.map((facultad) => (
                <option key={facultad.idFacultad} value={facultad.idFacultad}>{facultad.nombreFacultad}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cuadro informativo exclusivo para Admin */}
        {esAdministrador && (
          <div className="bg-[#050758]/5 border border-[#050758]/15 rounded-xl p-4 flex items-center gap-3">
            <Info className="w-4 h-4 text-[#050758] shrink-0" />
            <p className="text-xs text-[#050758] font-medium">
              Tu administración está limitada a cuentas de tu facultad.
            </p>
          </div>
        )}

        {/* Nueva contraseña opcional y Estado de la cuenta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Nueva contraseña (opcional)</label>
            <div className="relative flex items-center">
              <input
                type={mostrarPassword ? 'text' : 'password'}
                minLength={8}
                maxLength={128}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Dejar en blanco para mantener"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 focus:outline-none focus:border-[#050758] pr-10"
              />
              <button
                type="button"
                onClick={() => setMostrarPassword(!mostrarPassword)}
                className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                title={mostrarPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Estado de la cuenta</label>
            <div className="flex items-center h-[42px] px-4 border border-gray-200 rounded-xl bg-gray-50/50">
              <label className="flex items-center gap-2 text-xs font-medium text-gray-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={activo} 
                  onChange={(e) => setActivo(e.target.checked)} 
                  className="rounded text-[#050758] focus:ring-[#050758]"
                />
                Cuenta activa
              </label>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-gray-400">Deja la contraseña en blanco para conservar las credenciales actuales.</p>

        {/* Errores de validación */}
        {errorValidacion && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <p className="text-xs font-bold">{errorValidacion}</p>
          </div>
        )}

        {/* Éxito */}
        {exito && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <p className="text-xs font-bold">¡Cambios guardados correctamente en el perfil del usuario!</p>
          </div>
        )}

        {/* Botones */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/usuarios')}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold px-5 py-3 rounded-xl transition cursor-pointer shadow-sm"
          >
            Cancelar
          </button>
          <button
            disabled={guardando || !registro}
            type="submit"
            className="bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-6 py-3 rounded-xl transition cursor-pointer shadow-sm disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};