import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, Edit3, Trash2, Eye, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usuariosApi, type CatalogosUsuario, type Usuario } from '../../services/usuariosApi';
import { universidadApi, type FacultadApi } from '../../services/universidadApi';

export interface UsuarioItem {
  id: string;
  nombres: string;
  apellidos: string;
  email: string;
  facultad: string;
  sede: string;
  rol: string;
  rolCrudo: string;
  estado: 'Activo' | 'Inactivo';
}

type ObjetoConCamposSede = Record<string, unknown>;

type FacultadCatalogo = CatalogosUsuario['facultades'][number] & ObjetoConCamposSede;
type FacultadUniversidad = FacultadApi & ObjetoConCamposSede;
type UsuarioConSede = Usuario & ObjetoConCamposSede;

const CLAVES_SEDE_STRING = [
  'nombreSede',
  'sede',
  'nombreCampus',
  'campus',
  'sucursal',
  'nombreSucursal',
  'region',
  'ubicacion',
];

function extraerTextoSede(obj?: ObjetoConCamposSede | null): string {
  if (!obj) return '';
  for (const clave of CLAVES_SEDE_STRING) {
    const val = obj[clave];
    if (typeof val === 'string' && val.trim()) {
      return val.trim();
    }
  }
  return '';
}

function extraerIdSede(obj?: ObjetoConCamposSede | null): string {
  if (!obj) return '';
  const candidatos = [obj.idSede, obj.sedeId, obj.IdSede, obj.SedeId];
  for (const val of candidatos) {
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      return String(val).trim();
    }
  }
  return '';
}

function esRolEstandar(rolCrudo?: string | null): boolean {
  if (!rolCrudo) return false;
  const normalizado = rolCrudo.toUpperCase().trim();
  return normalizado === 'USUARIO' || normalizado === 'USUARIO_ESTANDAR' || normalizado === 'USUARIO ESTÁNDAR';
}

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

export const GestionUsuario: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const rolActual = (user?.rol as string) || '';
  const esSuperUsuario = rolActual === 'SUPER_USUARIO';
  const esAdministrador = rolActual === 'ADMINISTRADOR';

  // Estados funcionales reales conectados a la API
  const [usuarios, setUsuarios] = useState<UsuarioItem[]>([]);
  const [facultadesCatalogo, setFacultadesCatalogo] = useState<FacultadCatalogo[]>([]);
  const [facultadesUniversidad, setFacultadesUniversidad] = useState<FacultadUniversidad[]>([]);
  const [sedesDesdeCatalogo, setSedesDesdeCatalogo] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioItem | null>(null);
  const [guardandoEstado, setGuardandoEstado] = useState(false);
  const [errorEstado, setErrorEstado] = useState('');
  const [mensajeEstado, setMensajeEstado] = useState('');

  const [busqueda, setBusqueda] = useState('');
  const [sedeFiltro, setSedeFiltro] = useState('Todas');
  const [facultadFiltro, setFacultadFiltro] = useState('Todas');
  const [estadoFiltro, setEstadoFiltro] = useState('Todos');

  // Cargar usuarios, catálogos y facultades al montar el componente
  useEffect(() => {
    if (!user || (!esSuperUsuario && !esAdministrador)) return;

    let vigente = true;
    Promise.all([
      usuariosApi.listar(true),
      usuariosApi.catalogos(),
      universidadApi.listarFacultades(true),
      universidadApi.listarSedes(),
    ])
      .then(([resultado, catalogos, facultadesUni, sedesActivas]) => {
        if (!vigente) return;

        const mapaIdSedeANombre = new Map<string, string>();
        sedesActivas.forEach((sede) => {
          mapaIdSedeANombre.set(String(sede.idSede), sede.nombreSede);
        });

        const listaFacUni = (facultadesUni ?? []) as FacultadUniversidad[];
        const listaFacCat = (catalogos.facultades ?? []) as FacultadCatalogo[];

        setSedesDesdeCatalogo(sedesActivas.map((sede) => sede.nombreSede));
        setFacultadesUniversidad(listaFacUni);
        setFacultadesCatalogo(listaFacCat);
        setUsuarios(
          (resultado as UsuarioConSede[]).map((u) =>
            mapearUsuario(u, listaFacCat, listaFacUni, mapaIdSedeANombre),
          ),
        );
        setError('');
      })
      .catch((err: unknown) => {
        if (vigente) setError(err instanceof Error ? err.message : 'No se pudieron cargar los usuarios.');
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => { vigente = false; };
  }, [user, esSuperUsuario, esAdministrador]);

  // Usuarios visibles según alcance del rol autenticado (Admin: solo usuarios estándar de su facultad)
  const usuariosEnAlcance = useMemo(() => {
    return usuarios.filter((item) => {
      if (esAdministrador) {
        const mismaFacultad = !user?.facultadNombre || item.facultad === user.facultadNombre;
        return mismaFacultad && esRolEstandar(item.rolCrudo);
      }
      return true;
    });
  }, [usuarios, esAdministrador, user]);

  // Sedes disponibles combinando catálogo de sedes, facultades y usuarios en alcance
  const sedesDisponibles = useMemo(() => {
    return [...sedesDesdeCatalogo].sort((a, b) => a.localeCompare(b, 'es'));
  }, [sedesDesdeCatalogo]);

  // Facultades filtradas según la sede elegida
  const facultadesFiltradasPorSede = useMemo(() => {
    return facultadesCatalogo
      .filter((facultad) => {
        if (sedeFiltro === 'Todas') return true;
        const facultadUniversidad = facultadesUniversidad.find(
          (item) => item.idFacultad === facultad.idFacultad,
        );
        return extraerTextoSede(facultadUniversidad) === sedeFiltro;
      })
      .map((facultad) => facultad.nombreFacultad);
  }, [facultadesCatalogo, facultadesUniversidad, sedeFiltro]);

  // Filtrado y ordenamiento automático: Activos primero, Inactivos al final
  const usuariosFiltrados = useMemo(() => {
    const filtrados = usuariosEnAlcance.filter((item) => {
      const texto = busqueda.toLowerCase().trim();
      const coincideTexto =
        !texto ||
        item.nombres.toLowerCase().includes(texto) ||
        item.apellidos.toLowerCase().includes(texto) ||
        item.email.toLowerCase().includes(texto);

      const coincideSede =
        sedeFiltro === 'Todas' || item.sede === sedeFiltro;

      const coincideFacultad =
        facultadFiltro === 'Todas' || item.facultad === facultadFiltro;

      const coincideEstado =
        estadoFiltro === 'Todos' ||
        (estadoFiltro === 'Activos' && item.estado === 'Activo') ||
        (estadoFiltro === 'Inactivos' && item.estado === 'Inactivo');

      return coincideTexto && coincideSede && coincideFacultad && coincideEstado;
    });

    return filtrados.sort((a, b) => {
      if (a.estado === 'Activo' && b.estado === 'Inactivo') return -1;
      if (a.estado === 'Inactivo' && b.estado === 'Activo') return 1;
      return 0;
    });
  }, [usuariosEnAlcance, busqueda, sedeFiltro, facultadFiltro, estadoFiltro]);

  const totalActivos = usuariosEnAlcance.filter((u) => u.estado === 'Activo').length;

  const handleCambiarEstado = async () => {
    if (!usuarioSeleccionado) return;

    const activar = usuarioSeleccionado.estado === 'Inactivo';
    setGuardandoEstado(true);
    setErrorEstado('');
    setMensajeEstado('');
    try {
      await usuariosApi.cambiarEstado(usuarioSeleccionado.id, activar);
      if (activar) {
        setMensajeEstado('Se envió el enlace de activación. La cuenta seguirá inactiva hasta que el usuario establezca una contraseña con ese enlace.');
      } else {
        setUsuarios((actuales) =>
          actuales.map((usuario) =>
            usuario.id === usuarioSeleccionado.id
              ? { ...usuario, estado: 'Inactivo' }
              : usuario,
          ),
        );
        setUsuarioSeleccionado(null);
      }
    } catch (err) {
      setErrorEstado(err instanceof Error ? err.message : 'No se pudo cambiar el estado del usuario.');
    } finally {
      setGuardandoEstado(false);
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Encabezado Superior */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
            {esSuperUsuario ? 'Gestión Global de Usuarios' : 'Usuarios de Facultad'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {esSuperUsuario
              ? 'Administra los usuarios del sistema de todas las facultades.'
              : `Crea y administra únicamente usuarios estándar de ${user.facultadNombre || 'tu facultad'}.`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/usuarios/nuevo')}
          className="inline-flex items-center gap-2 bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          + Crear usuario
        </button>
      </div>

      {/* 3 Tarjetas Indicadoras */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-3xl font-extrabold text-[#050758]">{totalActivos}</p>
          <p className="text-sm font-bold text-gray-800 mt-2">Usuarios activos</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-3xl font-extrabold text-[#050758]">{usuariosEnAlcance.length}</p>
          <p className="text-sm font-bold text-gray-800 mt-2">Total en directorio</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-3xl font-extrabold text-[#050758]">
            {esSuperUsuario ? 'Global' : '1'}
          </p>
          <p className="text-sm font-bold text-gray-800 mt-2">Alcance de facultad</p>
        </div>
      </div>

      {/* Mensaje de error si falla la API */}
      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700">
          {error}
        </div>
      )}

      {/* Tarjeta Principal de Directorio */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Directorio de usuarios</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Los usuarios desactivados se muestran automáticamente al final del listado.
          </p>
        </div>

        {/* Barra de Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4 border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center">
            <label className="text-[10px] font-medium text-gray-400">Buscar</label>
            <div className="flex items-center gap-2 mt-0.5">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Nombre, apellido o correo institucional"
                className="w-full text-xs text-gray-800 placeholder-gray-400 focus:outline-none bg-transparent"
              />
            </div>
          </div>

          <div className="md:col-span-2 border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center">
            <label className="text-[10px] font-medium text-gray-400">Sede</label>
            {esSuperUsuario ? (
              <select
                value={sedeFiltro}
                onChange={(e) => {
                  setSedeFiltro(e.target.value);
                  setFacultadFiltro('Todas');
                }}
                className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none cursor-pointer"
              >
                <option value="Todas">Todas las sedes</option>
                {sedesDisponibles.map((sede) => (
                  <option key={sede} value={sede}>{sede}</option>
                ))}
              </select>
            ) : (
              <span className="text-xs font-medium text-gray-800 mt-0.5 truncate">
                {sedesDisponibles[0] || 'Sede asignada'}
              </span>
            )}
          </div>

          <div className="md:col-span-3 border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center">
            <label className="text-[10px] font-medium text-gray-400">Facultad</label>
            {esSuperUsuario ? (
              <select
                value={facultadFiltro}
                onChange={(e) => setFacultadFiltro(e.target.value)}
                className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none cursor-pointer"
              >
                <option value="Todas">Todas las facultades</option>
                {facultadesFiltradasPorSede.map((fac) => (
                  <option key={fac} value={fac}>{fac}</option>
                ))}
              </select>
            ) : (
              <span className="text-xs font-medium text-gray-800 mt-0.5 truncate">
                {user.facultadNombre || 'Sin facultad asignada'}
              </span>
            )}
          </div>

          <div className="md:col-span-3 border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center">
            <label className="text-[10px] font-medium text-gray-400">Estado</label>
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none cursor-pointer"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Activos">Activos</option>
              <option value="Inactivos">Inactivos</option>
            </select>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto border border-gray-200/80 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F3F4F8] text-gray-500 text-[11px] font-semibold border-b border-gray-200/80">
                <th className="py-3.5 px-5">Usuario</th>
                <th className="py-3.5 px-4">Facultad</th>
                <th className="py-3.5 px-4">Rol</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {cargando ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    Cargando usuarios del sistema...
                  </td>
                </tr>
              ) : usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No se encontraron usuarios registrados.
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-4 px-5">
                      <p className="font-bold text-gray-900">{item.nombres}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{item.email}</p>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{item.facultad}</td>
                    <td className="py-4 px-4 text-gray-700 font-medium">{item.rol}</td>
                    <td className="py-4 px-4">
                      {item.estado === 'Activo' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
                          <span className="w-2 h-2 rounded-full bg-gray-300" />
                          Inactivo
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => navigate(`/usuarios/detalle/${item.id}`)}
                          title="Ver detalles"
                          className="text-[#050758] hover:text-[#090c7a] transition cursor-pointer p-1"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/usuarios/editar/${item.id}`)}
                          title="Editar usuario"
                          className="text-amber-600 hover:text-amber-800 transition cursor-pointer p-1"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setErrorEstado('');
                            setMensajeEstado('');
                            setUsuarioSeleccionado(item);
                          }}
                          title={item.estado === 'Activo' ? 'Desactivar usuario' : 'Activar usuario'}
                          aria-label={item.estado === 'Activo' ? 'Desactivar usuario' : 'Activar usuario'}
                          className={`${item.estado === 'Activo' ? 'text-red-500 hover:text-red-700' : 'text-emerald-600 hover:text-emerald-800'} transition cursor-pointer p-1`}
                        >
                          {item.estado === 'Activo'
                            ? <Trash2 className="w-4 h-4" />
                            : <RotateCcw className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {usuarioSeleccionado && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !guardandoEstado) {
              setUsuarioSeleccionado(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cambiar-estado-titulo"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h3 id="cambiar-estado-titulo" className="text-lg font-bold text-gray-900">
              {mensajeEstado
                ? 'Enlace de activación enviado'
                : usuarioSeleccionado.estado === 'Activo'
                  ? 'Desactivar usuario'
                  : 'Enviar activación al usuario'}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {mensajeEstado || (usuarioSeleccionado.estado === 'Activo'
                ? `¿Deseas desactivar a ${usuarioSeleccionado.nombres}? Se conservarán sus datos e historial.`
                : `Se enviará a ${usuarioSeleccionado.email} un enlace de un solo uso, válido por 24 horas. El usuario deberá establecer una nueva contraseña para volver a iniciar sesión.`)}
            </p>
            {mensajeEstado && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                Correo enviado correctamente.
              </div>
            )}
            {errorEstado && (
              <div role="alert" className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {errorEstado}
              </div>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={guardandoEstado}
                onClick={() => {
                  setUsuarioSeleccionado(null);
                  setMensajeEstado('');
                }}
                className="rounded-xl border border-gray-300 px-4 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                {mensajeEstado ? 'Cerrar' : 'Cancelar'}
              </button>
              <button
                type="button"
                disabled={guardandoEstado}
                onClick={mensajeEstado
                  ? () => {
                    setUsuarioSeleccionado(null);
                    setMensajeEstado('');
                  }
                  : handleCambiarEstado}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold text-white transition disabled:opacity-50 ${
                  mensajeEstado
                    ? 'bg-[#050758] hover:bg-[#090c7a]'
                    : usuarioSeleccionado.estado === 'Activo'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {mensajeEstado
                  ? 'Listo'
                  : guardandoEstado
                  ? 'Guardando...'
                  : usuarioSeleccionado.estado === 'Activo'
                    ? 'Desactivar'
                    : 'Enviar enlace'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function mapearUsuario(
  usuario: UsuarioConSede,
  facultadesCat: FacultadCatalogo[],
  facultadesUni: FacultadUniversidad[],
  mapaIdSedeANombre: Map<string, string>,
): UsuarioItem {
  const facUniMatch = facultadesUni.find(
    (f) => f.nombreFacultad === usuario.nombreFacultad,
  );
  const facCatMatch = facultadesCat.find(
    (f) => f.nombreFacultad === usuario.nombreFacultad,
  );

  const sedeUsuario =
    extraerTextoSede(usuario) ||
    (extraerIdSede(usuario) ? mapaIdSedeANombre.get(extraerIdSede(usuario)) ?? '' : '');
  const sedeFacUni =
    extraerTextoSede(facUniMatch) ||
    (extraerIdSede(facUniMatch) ? mapaIdSedeANombre.get(extraerIdSede(facUniMatch)) ?? '' : '');
  const sedeFacCat =
    extraerTextoSede(facCatMatch) ||
    (extraerIdSede(facCatMatch) ? mapaIdSedeANombre.get(extraerIdSede(facCatMatch)) ?? '' : '');

  return {
    id: String(usuario.idUsuario),
    nombres: usuario.nombreCompleto,
    apellidos: '',
    email: usuario.correo,
    facultad: usuario.nombreFacultad ?? 'Sin facultad',
    sede: sedeUsuario || sedeFacUni || sedeFacCat || 'Sin sede',
    rol: formatearRol(usuario.nombreRol),
    rolCrudo: usuario.nombreRol ?? '',
    estado: usuario.estadoCuenta === 'activo' ? 'Activo' : 'Inactivo',
  };
}