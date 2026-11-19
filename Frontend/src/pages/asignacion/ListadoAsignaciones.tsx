import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  X,
  AlertTriangle,
  RotateCcw,
  Users,
  BookOpen,
  Layers,
  Eye,
  CheckCircle2,
  Save,
  Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { universidadApi } from '../../services/universidadApi';
import { usuariosApi } from '../../services/usuariosApi';

export interface AgrupacionAsignacionItem {
  id: string;
  elementoNombre: string;
  codigoElemento: string;
  facultad: string;
  docentesAsociados: { id: string; nombre: string; estado: 'Activa' | 'Inactiva' }[];
  estado: 'Activa' | 'Inactiva';
  tipo: 'plan' | 'asignatura';
}

export interface DocenteItem {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  facultad: string;
}

// ==========================================
// 1. VISTA DE LISTADO DE ASIGNACIONES
// ==========================================
export const ListadoAsignaciones: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const rolActual = (user?.rol as string) || '';
  const esSuperUsuario = rolActual === 'SUPER_USUARIO';
  const esAdministrador = rolActual === 'ADMINISTRADOR';

  const [tabActiva, setTabActiva] = useState<'planes' | 'asignaturas'>('planes');
  const [facultadesDisponibles, setFacultadesDisponibles] = useState<string[]>([]);
  const [errorCatalogos, setErrorCatalogos] = useState('');

  const [asignaciones, setAsignaciones] = useState<AgrupacionAsignacionItem[]>([
    {
      id: 'p1',
      codigoElemento: 'ISI-2027',
      elementoNombre: 'Ingeniería en Sistemas',
      facultad: 'Ingeniería y Tecnología',
      tipo: 'plan',
      docentesAsociados: [
        { id: '1', nombre: 'Lucía Méndez', estado: 'Activa' },
        { id: '2', nombre: 'Carlos Ruiz', estado: 'Activa' },
      ],
      estado: 'Activa',
    },
    {
      id: 'p2',
      codigoElemento: 'IND-2027',
      elementoNombre: 'Ingeniería Industrial',
      facultad: 'Ingeniería y Tecnología',
      tipo: 'plan',
      docentesAsociados: [{ id: '2', nombre: 'Carlos Ruiz', estado: 'Inactiva' }],
      estado: 'Inactiva',
    },
    {
      id: 'a1',
      codigoElemento: 'PRG101',
      elementoNombre: 'Programación I',
      facultad: 'Ingeniería y Tecnología',
      tipo: 'asignatura',
      docentesAsociados: [
        { id: '1', nombre: 'Lucía Méndez', estado: 'Activa' },
        { id: '2', nombre: 'Carlos Ruiz', estado: 'Activa' },
      ],
      estado: 'Activa',
    },
  ]);

  const [busqueda, setBusqueda] = useState('');
  const [facultadFiltro, setFacultadFiltro] = useState('Todas');
  const [estadoFiltro, setEstadoFiltro] = useState('Todas');

  const [asignacionEstadoModal, setAsignacionEstadoModal] = useState<AgrupacionAsignacionItem | null>(null);
  const [asignacionDetalleModal, setAsignacionDetalleModal] = useState<AgrupacionAsignacionItem | null>(null);

  useEffect(() => {
    if (!user || (!esSuperUsuario && !esAdministrador)) return;

    let vigente = true;
    universidadApi.listarFacultades()
      .then((facultades) => {
        if (!vigente) return;
        const nombresFacultades = facultades.map((facultad) => facultad.nombreFacultad);
        setFacultadesDisponibles(nombresFacultades);
        setFacultadFiltro((actual) =>
          actual === 'Todas' || nombresFacultades.includes(actual) ? actual : 'Todas',
        );
        setErrorCatalogos('');
      })
      .catch((error: unknown) => {
        if (vigente) {
          setErrorCatalogos(error instanceof Error ? error.message : 'No se pudieron cargar facultades y usuarios.');
        }
      });
    return () => { vigente = false; };
  }, [user, esSuperUsuario, esAdministrador]);

  const handleConfirmarCambioEstado = () => {
    if (!asignacionEstadoModal) return;

    setAsignaciones(
      asignaciones.map((item) =>
        item.id === asignacionEstadoModal.id
          ? { ...item, estado: item.estado === 'Activa' ? 'Inactiva' : 'Activa' }
          : item
      )
    );
    setAsignacionEstadoModal(null);
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setFacultadFiltro('Todas');
    setEstadoFiltro('Todas');
  };

  const asignacionesFiltradas = useMemo(() => {
    const filtradas = asignaciones.filter((item) => {
      if (tabActiva === 'planes' && item.tipo !== 'plan') return false;
      if (tabActiva === 'asignaturas' && item.tipo !== 'asignatura') return false;

      if (esAdministrador && user?.facultadNombre && item.facultad !== user.facultadNombre) {
        return false;
      }

      const texto = busqueda.toLowerCase().trim();
      const coincideTexto =
        !texto ||
        item.elementoNombre.toLowerCase().includes(texto) ||
        item.codigoElemento.toLowerCase().includes(texto) ||
        item.docentesAsociados.some((d) => d.nombre.toLowerCase().includes(texto));

      const coincideFacultad =
        facultadFiltro === 'Todas' || item.facultad === facultadFiltro;

      const coincideEstado =
        estadoFiltro === 'Todas' || item.estado === estadoFiltro;

      return coincideTexto && coincideFacultad && coincideEstado;
    });

    return filtradas.sort((a, b) => {
      if (a.estado === 'Activa' && b.estado === 'Inactiva') return -1;
      if (a.estado === 'Inactiva' && b.estado === 'Activa') return 1;
      return 0;
    });
  }, [asignaciones, tabActiva, busqueda, facultadFiltro, estadoFiltro, user, esAdministrador]);

  const totalActivas = asignaciones.filter((a) => a.estado === 'Activa').length;

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
    <div className="space-y-6 max-w-7xl mx-auto pb-12 relative">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
            Gestión de Asignaciones
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {esSuperUsuario
              ? 'Administra la vinculación institucional organizada por planes de estudio y asignaturas.'
              : `Administra las asignaciones para la facultad de ${user.facultadNombre || 'Ingeniería y Tecnología'}.`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/app/operations/assign/nuevo')}
          className="inline-flex items-center gap-2 bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Crear nueva asignación
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-3xl font-extrabold text-[#050758]">{totalActivas}</p>
          <p className="text-sm font-bold text-gray-800 mt-2">Registros activos</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-3xl font-extrabold text-[#050758]">{asignaciones.length}</p>
          <p className="text-sm font-bold text-gray-800 mt-2">Total en registros</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-3xl font-extrabold text-[#050758]">
            {esSuperUsuario ? 'Global' : '1'}
          </p>
          <p className="text-sm font-bold text-gray-800 mt-2">Alcance institucional</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
        <div className="flex border-b border-gray-200 gap-8">
          <button
            type="button"
            onClick={() => setTabActiva('planes')}
            className={`pb-3 text-sm font-bold transition cursor-pointer relative ${
              tabActiva === 'planes'
                ? 'text-[#050758] border-b-2 border-[#050758]'
                : 'text-gray-400 hover:text-gray-600 border-b-2 border-transparent'
            }`}
          >
            Asignaciones de planes de estudio
          </button>
          <button
            type="button"
            onClick={() => setTabActiva('asignaturas')}
            className={`pb-3 text-sm font-bold transition cursor-pointer relative ${
              tabActiva === 'asignaturas'
                ? 'text-[#050758] border-b-2 border-[#050758]'
                : 'text-gray-400 hover:text-gray-600 border-b-2 border-transparent'
            }`}
          >
            Asignaciones de asignaturas
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-2">
          <div className="md:col-span-5 border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center">
            <label className="text-[10px] font-medium text-gray-400">Buscar por nombre, código o docente</label>
            <div className="flex items-center gap-2 mt-0.5">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Ej. Sistemas, PRG101, Lucía..."
                className="w-full text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-3 border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center">
            <label className="text-[10px] font-medium text-gray-400">Facultad</label>
            {esSuperUsuario ? (
              <>
                <select
                  value={facultadFiltro}
                  onChange={(e) => setFacultadFiltro(e.target.value)}
                  className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none cursor-pointer"
                >
                  <option value="Todas">Todas las facultades</option>
                  {facultadesDisponibles.map((fac) => (
                    <option key={fac} value={fac}>{fac}</option>
                  ))}
                </select>
                {errorCatalogos && (
                  <p role="alert" className="mt-1 text-xs text-red-600">{errorCatalogos}</p>
                )}
              </>
            ) : (
              <span className="text-xs font-medium text-gray-800 mt-0.5 truncate">
                {user.facultadNombre || 'Ingeniería y Tecnología'}
              </span>
            )}
          </div>

          <div className="md:col-span-2 border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center">
            <label className="text-[10px] font-medium text-gray-400">Estado</label>
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none cursor-pointer"
            >
              <option value="Todas">Todos</option>
              <option value="Activa">Activas</option>
              <option value="Inactiva">Inactivas</option>
            </select>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              type="button"
              onClick={limpiarFiltros}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-3 px-4 rounded-xl transition cursor-pointer"
            >
              Borrar filtros
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-gray-200/80 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F3F4F8] text-gray-500 text-[11px] font-semibold border-b border-gray-200/80">
                <th className="py-3.5 px-5">
                  {tabActiva === 'planes' ? 'Plan de estudio' : 'Asignatura'}
                </th>
                <th className="py-3.5 px-4">Facultad</th>
                <th className="py-3.5 px-4">Usuarios / Docentes asignados</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {asignacionesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No se encontraron registros en este apartado.
                  </td>
                </tr>
              ) : (
                asignacionesFiltradas.map((item) => (
                  <tr
                    key={item.id}
                    className={`transition ${
                      item.estado === 'Inactiva' ? 'bg-gray-50/50 opacity-75' : 'hover:bg-gray-50/70'
                    }`}
                  >
                    <td className="py-4 px-5 font-bold text-gray-900 flex items-center gap-2.5">
                      {tabActiva === 'planes' ? (
                        <Layers
                          className={`w-4 h-4 shrink-0 ${
                            item.estado === 'Activa' ? 'text-[#050758]' : 'text-gray-400'
                          }`}
                        />
                      ) : (
                        <BookOpen
                          className={`w-4 h-4 shrink-0 ${
                            item.estado === 'Activa' ? 'text-[#050758]' : 'text-gray-400'
                          }`}
                        />
                      )}
                      <div>
                        <span className={item.estado === 'Inactiva' ? 'text-gray-500' : ''}>
                          {item.codigoElemento} · {item.elementoNombre}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{item.facultad}</td>
                    <td className="py-4 px-4 text-gray-600">
                      <ul className="space-y-1">
                        {item.docentesAsociados.map((doc, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 font-medium">
                            <Users className="w-3.5 h-3.5 text-[#050758]/60 shrink-0" />
                            {doc.nombre}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="py-4 px-4">
                      {item.estado === 'Activa' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          Activa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
                          <span className="w-2 h-2 rounded-full bg-gray-300" />
                          Inactiva
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => setAsignacionDetalleModal(item)}
                          title="Ver detalle completo"
                          className="text-[#050758] hover:text-[#090c7a] transition cursor-pointer p-1"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/app/operations/assign/editar/${item.id}`)}
                          title="Editar asignación"
                          className="text-amber-600 hover:text-amber-800 transition cursor-pointer p-1"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setAsignacionEstadoModal(item)}
                          title={item.estado === 'Activa' ? 'Desactivar' : 'Reactivar'}
                          className={`transition cursor-pointer p-1 ${
                            item.estado === 'Activa'
                              ? 'text-red-500 hover:text-red-700'
                              : 'text-emerald-600 hover:text-emerald-800'
                          }`}
                        >
                          {item.estado === 'Activa' ? (
                            <Trash2 className="w-4 h-4" />
                          ) : (
                            <RotateCcw className="w-4 h-4" />
                          )}
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

      {/* MODAL DETALLE (OJITO) */}
      {asignacionDetalleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-lg p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Detalle de Asignación por {asignacionDetalleModal.tipo === 'plan' ? 'Plan' : 'Asignatura'}
                </h3>
                <p className="text-xs text-gray-500">Listado de docentes vinculados a este elemento.</p>
              </div>
              <button
                type="button"
                onClick={() => setAsignacionDetalleModal(null)}
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-4 space-y-1">
              <p className="text-xs font-bold text-gray-900">
                {asignacionDetalleModal.codigoElemento} · {asignacionDetalleModal.elementoNombre}
              </p>
              <p className="text-[11px] text-gray-500">Facultad: {asignacionDetalleModal.facultad}</p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#050758] uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4" /> Docentes / Usuarios Asignados ({asignacionDetalleModal.docentesAsociados.length})
              </h4>
              <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {asignacionDetalleModal.docentesAsociados.map((doc, idx) => (
                  <li
                    key={idx}
                    className="text-xs p-2.5 rounded-lg border bg-white border-gray-200 text-gray-800 font-medium flex items-center justify-between"
                  >
                    <span>{doc.nombre}</span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded">
                      Vinculado
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setAsignacionDetalleModal(null)}
                className="bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
              >
                Cerrar detalle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DESACTIVAR / REACTIVAR */}
      {asignacionEstadoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md p-6 shadow-xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    asignacionEstadoModal.estado === 'Activa'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-emerald-50 text-emerald-600'
                  }`}
                >
                  {asignacionEstadoModal.estado === 'Activa' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <RotateCcw className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {asignacionEstadoModal.estado === 'Activa' ? 'Desactivar Registro' : 'Reactivar Registro'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">Confirma el cambio de estado en el listado.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAsignacionEstadoModal(null)}
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-4 space-y-1">
              <p className="text-xs font-bold text-gray-900">{asignacionEstadoModal.elementoNombre}</p>
              <p className="text-[11px] text-gray-500">Facultad: {asignacionEstadoModal.facultad}</p>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              {asignacionEstadoModal.estado === 'Activa'
                ? 'Al desactivar este registro, pasará automáticamente al final del listado.'
                : 'Al reactivar este registro, volverá a ubicarse entre los elementos activos.'}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setAsignacionEstadoModal(null)}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarCambioEstado}
                className={`text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition cursor-pointer ${
                  asignacionEstadoModal.estado === 'Activa'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {asignacionEstadoModal.estado === 'Activa' ? 'Sí, desactivar' : 'Sí, reactivar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// ==========================================
// 2. VISTA DE EDITAR ASIGNACIÓN
// ==========================================
export const EditarAsignacion: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const rolActual = (user?.rol as string) || '';
  const esSuperUsuario = rolActual === 'SUPER_USUARIO';
  const esAdministrador = rolActual === 'ADMINISTRADOR';

  const [elementoActual] = useState({
    id: id || '1',
    tipo: 'Plan de Estudio',
    codigo: 'ISI-2027',
    nombre: 'Ingeniería en Sistemas y Redes Informáticas',
    facultad: 'Ingeniería y Tecnología',
  });

  const [docentesDisponibles, setDocentesDisponibles] = useState<DocenteItem[]>([]);
  const [errorDocentes, setErrorDocentes] = useState('');
  useEffect(() => {
    if (!user || (!esSuperUsuario && !esAdministrador)) return;

    let vigente = true;
    usuariosApi.listar()
      .then((usuarios) => {
        if (!vigente) return;
        setDocentesDisponibles(usuarios
          .filter((usuario) =>
            ['USUARIO', 'USUARIO_ESTANDAR', 'USUARIO ESTANDAR', 'USUARIO ESTÁNDAR'].includes(
              (usuario.nombreRol ?? '').toUpperCase(),
            )
            && usuario.nombreFacultad !== null,
          )
          .map((usuario) => {
            const partesNombre = usuario.nombreCompleto.trim().split(/\s+/);
            const nombre = partesNombre.shift() ?? '';
            return {
              id: String(usuario.idUsuario),
              nombre,
              apellido: partesNombre.join(' '),
              email: usuario.correo,
              facultad: usuario.nombreFacultad ?? '',
            };
          }));
      })
      .catch((error: unknown) => {
        if (vigente) setErrorDocentes(error instanceof Error ? error.message : 'No se pudieron cargar los usuarios.');
      });
    return () => { vigente = false; };
  }, [user, esSuperUsuario, esAdministrador]);

  const [docentesSeleccionados, setDocentesSeleccionados] = useState<DocenteItem[]>([
    { id: '1', nombre: 'Lucía', apellido: 'Méndez', email: 'lucia.mendez@unicaes.edu.sv', facultad: 'Ingeniería y Tecnología' },
  ]);

  const [busquedaDocente, setBusquedaDocente] = useState('');
  const [docenteSeleccionTemporal, setDocenteSeleccionTemporal] = useState('');
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  const facultadUsuario = user?.facultadNombre || 'Ingeniería y Tecnología';

  const docentesFiltrados = docentesDisponibles
    .filter(d => {
      if (esSuperUsuario) return true;
      return d.facultad === facultadUsuario;
    })
    .filter(d => !docentesSeleccionados.some(sel => sel.id === d.id))
    .filter(d =>
      d.nombre.toLowerCase().includes(busquedaDocente.toLowerCase()) ||
      d.apellido.toLowerCase().includes(busquedaDocente.toLowerCase()) ||
      d.email.toLowerCase().includes(busquedaDocente.toLowerCase())
    );

  const handleSeleccionarDocente = () => {
    if (!docenteSeleccionTemporal) return;
    const doc = docentesDisponibles.find(d => d.id === docenteSeleccionTemporal);
    if (doc) {
      setDocentesSeleccionados([...docentesSeleccionados, doc]);
      setDocenteSeleccionTemporal('');
      setBusquedaDocente('');
    }
  };

  const handleEliminarDocente = (idDocente: string) => {
    setDocentesSeleccionados(docentesSeleccionados.filter(d => d.id !== idDocente));
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    setGuardadoExitoso(true);
    setTimeout(() => {
      setGuardadoExitoso(false);
      navigate('/app/operations/assign');
    }, 2000);
  };

  const botonDocenteHabilitado = docenteSeleccionTemporal !== '';

  const prevenirEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

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
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
            Editar asignación de usuarios
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Modifica los docentes o usuarios asignados a este elemento institucional. El elemento principal no puede ser modificado.
          </p>
        </div>
      </div>

      <form onSubmit={handleGuardar} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Elemento académico (Fijo)</h3>
            <p className="text-xs text-gray-500 mt-0.5">Este apartado define el plan o asignatura que se está administrando.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 border border-gray-200/80 rounded-xl p-4">
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase">Tipo de elemento</span>
              <span className="text-xs font-bold text-[#050758]">{elementoActual.tipo}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase">Código y Nombre</span>
              <span className="text-xs font-bold text-gray-800">{elementoActual.codigo} · {elementoActual.nombre}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-gray-400 uppercase">Facultad de adscripción</span>
              <span className="text-xs font-medium text-gray-600">{elementoActual.facultad}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Usuarios destinatarios vinculados</h3>
            <p className="text-xs text-gray-500 mt-0.5">Puedes quitar a los usuarios actuales o agregar nuevos desde el buscador.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5 space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                1. Buscar docente por nombre o apellido
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Ej. Lucía, Méndez..."
                  value={busquedaDocente}
                  onChange={(e) => setBusquedaDocente(e.target.value)}
                  onKeyDown={prevenirEnter}
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl pl-10 pr-4 py-3 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none transition"
                />
              </div>
            </div>

            <div className="md:col-span-5 space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                2. Seleccionar de la lista <span className="text-red-500">*</span>
              </label>
              <select
                value={docenteSeleccionTemporal}
                onChange={(e) => setDocenteSeleccionTemporal(e.target.value)}
                className="w-full bg-white border border-gray-300 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition cursor-pointer"
              >
                <option value="">-- Selecciona un docente para agregar --</option>
                {docentesFiltrados.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.nombre} {doc.apellido} ({doc.facultad})
                  </option>
                ))}
              </select>
              {errorDocentes && (
                <p role="alert" className="mt-1 text-xs text-red-600">{errorDocentes}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <button
                type="button"
                onClick={handleSeleccionarDocente}
                disabled={!botonDocenteHabilitado}
                className={`w-full flex items-center justify-center gap-1.5 text-xs font-bold px-4 py-3 rounded-xl shadow-sm transition ${
                  botonDocenteHabilitado
                    ? 'bg-[#050758] hover:bg-[#090c7a] text-white cursor-pointer'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 space-y-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Docentes actualmente asignados ({docentesSeleccionados.length})
            </span>
            <div className="flex flex-wrap gap-2">
              {docentesSeleccionados.map((doc) => (
                <div
                  key={doc.id}
                  className="inline-flex items-center gap-2 bg-[#050758]/5 border border-[#050758]/20 px-3 py-1.5 rounded-xl text-xs font-medium text-[#050758]"
                >
                  <span>{doc.nombre} {doc.apellido} ({doc.facultad})</span>
                  <button
                    type="button"
                    onClick={() => handleEliminarDocente(doc.id)}
                    className="text-gray-400 hover:text-red-600 transition cursor-pointer"
                    title="Remover docente"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {docentesSeleccionados.length === 0 && (
                <p className="text-xs text-red-500 italic">Advertencia: Debes mantener al menos un docente asignado.</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
          <div className="bg-[#050758]/5 border border-[#050758]/15 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-[#050758] shrink-0 mt-0.5" />
            <p className="text-xs text-[#050758] font-medium leading-relaxed">
              Al guardar los cambios, se actualizarán los permisos de edición para los docentes seleccionados sobre este elemento.
            </p>
          </div>

          {guardadoExitoso && (
            <div className="bg-[#8CB83C]/20 border border-[#8CB83C]/60 text-[#2D5A1E] rounded-xl px-4 py-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#4C8C23]" />
              <p className="text-xs font-bold">¡Asignación actualizada con éxito! Redirigiendo al listado...</p>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/app/operations/assign')}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold px-5 py-3 rounded-xl shadow-sm transition cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={docentesSeleccionados.length === 0}
              className={`inline-flex items-center gap-2 text-xs font-bold px-6 py-3 rounded-xl shadow-sm transition ${
                docentesSeleccionados.length > 0
                  ? 'bg-[#050758] hover:bg-[#090c7a] text-white cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              Guardar cambios
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};