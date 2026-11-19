import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Info, CheckCircle2, KeyRound, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usuariosApi, type CatalogosUsuario, type Usuario } from '../../services/usuariosApi';
import { universidadApi, type FacultadApi } from '../../services/universidadApi';

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
    default: {
      const limpio = nombreRol.replace(/_/g, ' ').toLowerCase();
      return limpio.charAt(0).toUpperCase() + limpio.slice(1);
    }
  }
}

type ObjetoConCampos = Record<string, unknown>;

type FacultadConSede = CatalogosUsuario['facultades'][number] & ObjetoConCampos;
type FacultadUniConSede = FacultadApi & ObjetoConCampos;

type CatalogosConSedes = Omit<CatalogosUsuario, 'facultades'> & {
  facultades: FacultadConSede[];
  sedes?: Array<ObjetoConCampos>;
};

const CLAVES_SEDE = [
  'nombreSede',
  'sede',
  'nombreCampus',
  'campus',
  'sucursal',
  'nombreSucursal',
  'region',
  'ubicacion',
];

const obtenerSedeDeObjeto = (obj?: ObjetoConCampos | null): string => {
  if (!obj) return '';
  for (const clave of CLAVES_SEDE) {
    const val = obj[clave];
    if (typeof val === 'string' && val.trim()) {
      return val.trim();
    }
  }
  const idSede = obj.idSede ?? obj.sedeId ?? obj.IdSede ?? obj.SedeId;
  if (idSede !== undefined && idSede !== null && String(idSede).trim() !== '') {
    return String(idSede).trim();
  }
  return '';
};

export const EditarUsuario: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const rolActual = (user?.rol as string) || '';
  const esSuperUsuario = rolActual === 'SUPER_USUARIO';
  const esAdministrador = rolActual === 'ADMINISTRADOR';

  // Estados funcionales de la API
  const [catalogos, setCatalogos] = useState<CatalogosConSedes | null>(null);
  const [facultadesUni, setFacultadesUni] = useState<FacultadUniConSede[]>([]);
  const [registro, setRegistro] = useState<Usuario | null>(null);

  const [nombreCompleto, setNombreCompleto] = useState('');
  const [correo, setCorreo] = useState('');
  const [gradoAcademico, setGradoAcademico] = useState('');
  const [experiencia, setExperiencia] = useState(0);
  const [idRol, setIdRol] = useState('');
  const [sedeSeleccionada, setSedeSeleccionada] = useState('');
  const [idFacultad, setIdFacultad] = useState('');

  // Estado para enviar el enlace de cambio de contraseña
  const [modalGenerarContrasena, setModalGenerarContrasena] = useState(false);
  const [generandoContrasena, setGenerandoContrasena] = useState(false);
  const [errorGenerarContrasena, setErrorGenerarContrasena] = useState('');
  const [exitoGenerarContrasena, setExitoGenerarContrasena] = useState(false);

  // Estados de control visual y feedback
  const [errorValidacion, setErrorValidacion] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  // Cargar datos del usuario, catálogos y facultades al montar el componente
  useEffect(() => {
    if (!user || (!esSuperUsuario && !esAdministrador)) return;
    if (!id) return;
    let vigente = true;
    Promise.all([
      usuariosApi.obtener(id),
      usuariosApi.catalogos(),
      universidadApi.listarFacultades().catch(() => [] as FacultadApi[]),
    ])
      .then(([usuario, opciones, listaFacultadesUni]) => {
        if (!vigente) return;
        const opcionesConSede = opciones as CatalogosConSedes;
        const facUni = (listaFacultadesUni ?? []) as FacultadUniConSede[];

        setRegistro(usuario);
        setCatalogos(opcionesConSede);
        setFacultadesUni(facUni);
        setIdRol(usuario.idRol ? String(usuario.idRol) : '');
        setNombreCompleto(usuario.nombreCompleto ?? '');
        setCorreo(usuario.correo ?? '');
        setGradoAcademico(usuario.gradoAcademico ?? '');
        setExperiencia(usuario.experienciaEducacionSuperior ?? 0);

        const facultadInicialId = usuario.idFacultad ? String(usuario.idFacultad) : '';
        setIdFacultad(facultadInicialId);

        const facCatInicial = opcionesConSede.facultades.find(
          (f) => String(f.idFacultad) === facultadInicialId,
        );
        const facUniInicial = facUni.find(
          (f) => String(f.idFacultad) === facultadInicialId,
        );
        const sedeInicial =
          obtenerSedeDeObjeto(facUniInicial) || obtenerSedeDeObjeto(facCatInicial) || '';
        setSedeSeleccionada(sedeInicial);
      })
      .catch((err: unknown) => {
        if (vigente) setErrorValidacion(err instanceof Error ? err.message : 'No se pudo cargar el usuario.');
      });
    return () => { vigente = false; };
  }, [id, user, esSuperUsuario, esAdministrador]);

  // Sedes disponibles combinando catálogo, facultades de universidad y facultades de usuarios
  const sedesDisponibles = useMemo(() => {
    const conjunto = new Set<string>();

    catalogos?.sedes?.forEach((s) => {
      const nombre =
        obtenerSedeDeObjeto(s) ||
        (typeof s.nombre === 'string' && s.nombre.trim()) ||
        '';
      if (nombre) conjunto.add(nombre);
    });

    facultadesUni.forEach((fac) => {
      if (!esSuperUsuario && fac.idFacultad !== user?.facultadId) return;
      const sede = obtenerSedeDeObjeto(fac);
      if (sede) conjunto.add(sede);
    });

    catalogos?.facultades.forEach((fac) => {
      if (!esSuperUsuario && fac.idFacultad !== user?.facultadId) return;
      const sede = obtenerSedeDeObjeto(fac);
      if (sede) conjunto.add(sede);
    });

    return Array.from(conjunto).sort((a, b) => a.localeCompare(b, 'es'));
  }, [catalogos, facultadesUni, esSuperUsuario, user?.facultadId]);

  // Facultades filtradas según permisos y sede elegida (vacías si no hay sede elegida)
  const facultadesDisponibles = useMemo(() => {
    if (!catalogos || !sedeSeleccionada) return [];

    const base =
      catalogos.facultades.length > 0 ? catalogos.facultades : facultadesUni;

    return base.filter((facultad) => {
      const cumplePermiso = esSuperUsuario || facultad.idFacultad === user?.facultadId;
      const facUniMatch = facultadesUni.find(
        (fu) => String(fu.idFacultad) === String(facultad.idFacultad),
      );
      const sedeFac = obtenerSedeDeObjeto(facUniMatch) || obtenerSedeDeObjeto(facultad);
      return cumplePermiso && sedeFac === sedeSeleccionada;
    });
  }, [catalogos, facultadesUni, sedeSeleccionada, esSuperUsuario, user?.facultadId]);

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

  // Filtrado de roles según permisos del usuario autenticado
  const rolesDisponibles = catalogos?.roles.filter((rol) => {
    const nombre = rol.nombreRol.toUpperCase();
    return esSuperUsuario || nombre === 'USUARIO' || nombre === 'USUARIO_ESTANDAR';
  }) ?? [];

  const validarCamposFormulario = (): boolean => {
    if (!nombreCompleto.trim()) {
      setErrorValidacion('Debes ingresar el nombre completo.');
      return false;
    }
    if (!correo.trim()) {
      setErrorValidacion('Debes ingresar el correo electrónico.');
      return false;
    }
    if (!gradoAcademico.trim()) {
      setErrorValidacion('Debes ingresar el grado académico.');
      return false;
    }
    if (!idRol) {
      setErrorValidacion('Debes seleccionar un rol de usuario.');
      return false;
    }
    if (!sedeSeleccionada.trim()) {
      setErrorValidacion('Debes seleccionar una sede.');
      return false;
    }
    if (!idFacultad.trim()) {
      setErrorValidacion('Debes seleccionar una facultad.');
      return false;
    }
    return true;
  };

  const abrirModalGenerarContrasena = () => {
    setErrorValidacion('');
    if (!validarCamposFormulario()) return;
    setErrorGenerarContrasena('');
    setExitoGenerarContrasena(false);
    setModalGenerarContrasena(true);
  };

  const cerrarModalGenerarContrasena = () => {
    if (generandoContrasena) return;
    setModalGenerarContrasena(false);
    setErrorGenerarContrasena('');
    setExitoGenerarContrasena(false);
  };

  const handleConfirmarGenerarContrasena = async () => {
    if (!id || !registro) return;
    setGenerandoContrasena(true);
    setErrorGenerarContrasena('');
    setExitoGenerarContrasena(false);

    try {
      await usuariosApi.actualizar(id, {
        idRol: Number(idRol),
        idFacultad: Number(idFacultad),
        nombreCompleto: nombreCompleto.trim(),
        gradoAcademico: gradoAcademico.trim(),
        experienciaEducacionSuperior: experiencia,
        correo: correo.trim(),
      });

      if (registro.estadoCuenta === 'activo') {
        await usuariosApi.solicitarRestablecimientoContrasena(id);
      } else {
        await usuariosApi.cambiarEstado(id, true);
      }

      setExitoGenerarContrasena(true);
      setMensajeExito(registro.estadoCuenta === 'activo'
        ? 'Se envió un enlace de un solo uso al correo registrado para que el usuario establezca una contraseña nueva.'
        : 'Se envió un enlace de activación al correo registrado para que el usuario establezca una contraseña y active su cuenta.');
      setExito(true);
    } catch (err) {
      setErrorGenerarContrasena(
        err instanceof Error
          ? err.message
          : 'No se pudo generar la nueva contraseña ni enviar el enlace.',
      );
    } finally {
      setGenerandoContrasena(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !registro) return;
    setErrorValidacion('');
    setExito(false);

    if (!validarCamposFormulario()) return;

    setGuardando(true);

    try {
      await usuariosApi.actualizar(id, {
        idRol: Number(idRol),
        idFacultad: Number(idFacultad),
        nombreCompleto: nombreCompleto.trim(),
        gradoAcademico: gradoAcademico.trim(),
        experienciaEducacionSuperior: experiencia,
        correo: correo.trim(),
      });

      setMensajeExito('¡Cambios guardados correctamente en el perfil del usuario!');
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

        {/* ROL, SEDE y FACULTAD */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Rol de usuario *</label>
            <select
              required
              value={idRol}
              onChange={(e) => setIdRol(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 font-medium bg-white focus:outline-none focus:border-[#050758] cursor-pointer"
            >
              <option value="" disabled>Selecciona un rol</option>
              {rolesDisponibles.map((rol) => (
                <option key={rol.idRol} value={rol.idRol}>{formatearRol(rol.nombreRol)}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Sede *</label>
            <select
              required
              value={sedeSeleccionada}
              onChange={(e) => {
                setSedeSeleccionada(e.target.value);
                setIdFacultad('');
              }}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 font-medium bg-white focus:outline-none focus:border-[#050758] cursor-pointer"
            >
              <option value="" disabled>Selecciona una sede</option>
              {sedesDisponibles.map((sede) => (
                <option key={sede} value={sede}>{sede}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Facultad *</label>
            <select
              required
              disabled={!sedeSeleccionada}
              value={idFacultad}
              onChange={(e) => setIdFacultad(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 font-medium bg-white focus:outline-none focus:border-[#050758] cursor-pointer disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <option value="" disabled>
                {sedeSeleccionada ? 'Selecciona una facultad' : 'Elige primero una sede'}
              </option>
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

        {/* Generar nueva contraseña */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700">Contraseña del usuario</label>
          <div>
            <button
              type="button"
              disabled={!registro}
              onClick={abrirModalGenerarContrasena}
              className="inline-flex items-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-800 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4 text-[#050758]" />
              Generar nueva contraseña
            </button>
          </div>
          <p className="text-[11px] text-gray-400">
            Envía un enlace de un solo uso al correo del usuario para que establezca una contraseña nueva.
          </p>
        </div>

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
            <p className="text-xs font-bold">{mensajeExito}</p>
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

      {/* Modal de confirmación para generar nueva contraseña */}
      {modalGenerarContrasena && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              cerrarModalGenerarContrasena();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="generar-contrasena-titulo"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4"
          >
            <div className="flex items-start justify-between">
              <h3 id="generar-contrasena-titulo" className="text-lg font-bold text-gray-900">
                {exitoGenerarContrasena
                  ? registro?.estadoCuenta === 'activo'
                    ? 'Enlace de cambio de contraseña enviado'
                    : 'Enlace de activación enviado'
                  : '¿Enviar enlace para cambiar la contraseña?'}
              </h3>
              <button
                type="button"
                disabled={generandoContrasena}
                onClick={cerrarModalGenerarContrasena}
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer p-1 rounded-lg disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {exitoGenerarContrasena ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {registro?.estadoCuenta === 'activo'
                    ? 'Se envió un enlace para establecer una contraseña nueva a '
                    : 'Se envió un enlace de activación para establecer una contraseña a '}
                  <span className="font-semibold text-gray-800">{correo || 'el correo registrado'}</span>, válido por 24 horas.
                </p>
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  Correo enviado correctamente.
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600 leading-relaxed">
                {registro?.estadoCuenta === 'activo'
                  ? 'Se enviará un enlace de un solo uso al correo registrado ('
                  : 'La cuenta está inactiva. Se enviará un enlace de activación al correo registrado ('}
                <span className="font-semibold text-gray-800">{correo || 'del usuario'}</span>
                {registro?.estadoCuenta === 'activo'
                  ? ') para que el usuario establezca una contraseña nueva.'
                  : ') para que el usuario establezca una contraseña y active su cuenta.'}
              </p>
            )}

            {errorGenerarContrasena && (
              <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {errorGenerarContrasena}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={generandoContrasena}
                onClick={cerrarModalGenerarContrasena}
                className="rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-gray-50 cursor-pointer disabled:opacity-50"
              >
                {exitoGenerarContrasena ? 'Cerrar' : 'Cancelar'}
              </button>
              {!exitoGenerarContrasena && (
                <button
                  type="button"
                  disabled={generandoContrasena}
                  onClick={handleConfirmarGenerarContrasena}
                  className="rounded-xl bg-[#050758] hover:bg-[#090c7a] px-4 py-2.5 text-xs font-bold text-white transition cursor-pointer disabled:opacity-50"
                >
                  {generandoContrasena ? 'Enviando...' : 'Enviar enlace'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};