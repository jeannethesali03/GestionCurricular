import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usuariosApi, type CatalogosUsuario } from '../../services/usuariosApi';
import { universidadApi, type FacultadApi } from '../../services/universidadApi';

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

export const CrearUsuario: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const rolActual = (user?.rol as string) || '';
  const esSuperUsuario = rolActual === 'SUPER_USUARIO';
  const esAdministrador = rolActual === 'ADMINISTRADOR';

  // Estados funcionales de catálogos y API
  const [catalogos, setCatalogos] = useState<CatalogosConSedes | null>(null);
  const [facultadesUni, setFacultadesUni] = useState<FacultadUniConSede[]>([]);
  const [idRol, setIdRol] = useState('');
  const [sedeSeleccionada, setSedeSeleccionada] = useState('');
  const [idFacultad, setIdFacultad] = useState('');

  // Estados de los campos del formulario
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [correo, setCorreo] = useState('');
  const [gradoAcademico, setGradoAcademico] = useState('');
  const [experiencia, setExperiencia] = useState(0);

  // Controles visuales
  const [errorValidacion, setErrorValidacion] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(false);

  // Cargar catálogos reales y facultades al montar el componente
  useEffect(() => {
    if (!user || (!esSuperUsuario && !esAdministrador)) return;

    let vigente = true;
    Promise.all([
      usuariosApi.catalogos(),
      universidadApi.listarFacultades().catch(() => [] as FacultadApi[]),
    ])
      .then(([resultado, listaFacultadesUni]) => {
        if (!vigente) return;
        const opcionesConSede = resultado as CatalogosConSedes;
        const facUni = (listaFacultadesUni ?? []) as FacultadUniConSede[];

        setCatalogos(opcionesConSede);
        setFacultadesUni(facUni);

        const rolUsuario = opcionesConSede.roles.find(
          (rol) => rol.nombreRol.toUpperCase() === 'USUARIO',
        );
        setIdRol(rolUsuario ? String(rolUsuario.idRol) : '');

        if (!esSuperUsuario) {
          setIdFacultad(user?.facultadId ? String(user.facultadId) : '');
        }
      })
      .catch((err: unknown) =>
        setErrorValidacion(
          err instanceof Error ? err.message : 'No se pudieron cargar los catálogos.',
        ),
      );
    return () => { vigente = false; };
  }, [user, esSuperUsuario, esAdministrador]);

  // Sedes disponibles para el filtro del Superusuario
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
      const sede = obtenerSedeDeObjeto(fac);
      if (sede) conjunto.add(sede);
    });

    catalogos?.facultades.forEach((fac) => {
      const sede = obtenerSedeDeObjeto(fac);
      if (sede) conjunto.add(sede);
    });

    return Array.from(conjunto).sort((a, b) => a.localeCompare(b, 'es'));
  }, [catalogos, facultadesUni]);

  // Filtrado de roles según permisos
  const rolesDisponibles =
    catalogos?.roles.filter((rol) => {
      const nombre = rol.nombreRol.toUpperCase();
      return esSuperUsuario || nombre === 'USUARIO' || nombre === 'USUARIO_ESTANDAR';
    }) ?? [];

  // Facultades filtradas según sede elegida (vacías si el Superusuario no ha elegido sede)
  const facultadesDisponibles = useMemo(() => {
    if (!catalogos) return [];

    if (!esSuperUsuario) {
      return catalogos.facultades.filter(
        (facultad) => facultad.idFacultad === user?.facultadId,
      );
    }

    if (!sedeSeleccionada) return [];

    const base =
      catalogos.facultades.length > 0 ? catalogos.facultades : facultadesUni;

    return base.filter((facultad) => {
      const facUniMatch = facultadesUni.find(
        (fu) => String(fu.idFacultad) === String(facultad.idFacultad),
      );
      const sedeFac = obtenerSedeDeObjeto(facUniMatch) || obtenerSedeDeObjeto(facultad);
      return sedeFac === sedeSeleccionada;
    });
  }, [catalogos, facultadesUni, esSuperUsuario, sedeSeleccionada, user?.facultadId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorValidacion('');

    if (!nombreCompleto.trim()) {
      setErrorValidacion('Debes ingresar el nombre completo.');
      return;
    }
    if (!correo.trim()) {
      setErrorValidacion('Debes ingresar el correo electrónico.');
      return;
    }
    if (!gradoAcademico.trim()) {
      setErrorValidacion('Debes ingresar el grado académico.');
      return;
    }
    if (!idRol) {
      setErrorValidacion('Debes seleccionar un rol de usuario.');
      return;
    }
    if (esSuperUsuario && !sedeSeleccionada.trim()) {
      setErrorValidacion('Debes seleccionar una sede.');
      return;
    }
    if (esSuperUsuario && !idFacultad.trim()) {
      setErrorValidacion('Debes seleccionar una facultad.');
      return;
    }

    setGuardando(true);

    try {
      await usuariosApi.crear({
        idRol: Number(idRol),
        idFacultad: idFacultad ? Number(idFacultad) : null,
        nombreCompleto: nombreCompleto.trim(),
        gradoAcademico: gradoAcademico.trim(),
        experienciaEducacionSuperior: experiencia,
        correo: correo.trim(),
      });

      setExito(true);
    } catch (err) {
      setErrorValidacion(err instanceof Error ? err.message : 'No se pudo crear el usuario.');
    } finally {
      setGuardando(false);
    }
  };

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

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-3xl font-bold text-[#050758] tracking-tight">Crear usuario</h2>
        <p className="text-xs text-gray-500 mt-1">
          {esSuperUsuario
            ? 'Superusuario · Creación y asignación global de roles y facultades.'
            : `Administrador de Facultad · Creación de usuarios para ${user.facultadNombre || 'tu facultad'}.`}
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
            placeholder="Ej. Mariana López"
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
            placeholder="Ej. mariana.lopez@unicaes.edu.sv"
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
              placeholder="Ej. Licenciada en Ciencias de la Educación"
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

        {/* ROL, SEDE (Superusuario) y FACULTAD */}
        <div className={`grid grid-cols-1 ${esSuperUsuario ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">Rol de usuario *</label>
            <select
              required
              value={idRol}
              onChange={(e) => setIdRol(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 font-medium bg-white focus:outline-none focus:border-[#050758] cursor-pointer"
            >
              <option value="">Selecciona un rol</option>
              {rolesDisponibles.map((rol) => (
                <option key={rol.idRol} value={rol.idRol}>
                  {formatearRol(rol.nombreRol)}
                </option>
              ))}
            </select>
          </div>

          {esSuperUsuario && (
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
                <option value="">Selecciona una sede</option>
                {sedesDisponibles.map((sede) => (
                  <option key={sede} value={sede}>
                    {sede}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700">
              Facultad {esSuperUsuario ? '*' : ''}
            </label>
            <select
              required={esSuperUsuario}
              disabled={esSuperUsuario && !sedeSeleccionada}
              value={idFacultad}
              onChange={(e) => setIdFacultad(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-800 font-medium bg-white focus:outline-none focus:border-[#050758] cursor-pointer disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {esSuperUsuario ? (
                <option value="">
                  {sedeSeleccionada ? 'Selecciona una facultad' : 'Elige primero una sede'}
                </option>
              ) : (
                <option value="">Sin facultad (Global)</option>
              )}
              {facultadesDisponibles.map((facultad) => (
                <option key={facultad.idFacultad} value={facultad.idFacultad}>
                  {facultad.nombreFacultad}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cuadro informativo exclusivo para Admin */}
        {esAdministrador && (
          <div className="bg-[#050758]/5 border border-[#050758]/15 rounded-xl p-4 flex items-center gap-3">
            <Info className="w-4 h-4 text-[#050758] shrink-0" />
            <p className="text-xs text-[#050758] font-medium">
              Se asignará automáticamente la facultad de tu sesión y el rol estándar.
            </p>
          </div>
        )}

        {/* Mensaje informativo */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
            Se enviará al correo del usuario un enlace de activación de un solo uso, válido por 24 horas. Deberá elegir su contraseña para activar la cuenta.
          </p>
        </div>

        {/* Indicador de carga de catálogos */}
        {!catalogos && !errorValidacion && (
          <p className="text-xs text-gray-500 italic">Cargando catálogos del sistema...</p>
        )}

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
            <p className="text-xs font-bold">¡Usuario creado! Se envió el enlace de activación a su correo.</p>
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
            disabled={guardando || !catalogos || exito}
            type="submit"
            className="bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-6 py-3 rounded-xl transition cursor-pointer shadow-sm disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : 'Crear usuario'}
          </button>
        </div>
      </form>
    </div>
  );
};