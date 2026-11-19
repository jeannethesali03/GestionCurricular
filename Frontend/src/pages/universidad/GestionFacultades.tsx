import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  X,
  Building2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  universidadApi,
  type FacultadApi,
  type SedeApi,
} from '../../services/universidadApi';

export interface FacultadItem {
  id: string;
  idSede: string;
  sede: string;
  nombre: string;
  descripcion: string;
  decano: string;
  estado: 'Activa' | 'Inactiva';
}

const convertirFacultad = (facultad: FacultadApi): FacultadItem => ({
  id: String(facultad.idFacultad),
  idSede: String(facultad.idSede),
  sede: facultad.nombreSede ?? 'Sede no disponible',
  nombre: facultad.nombreFacultad,
  descripcion: facultad.descripcionFacultad ?? '',
  decano: facultad.decano ?? '',
  estado: facultad.estado === 'activo' ? 'Activa' : 'Inactiva',
});

export const GestionFacultades: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const rolActual = (user?.rol as string) || '';
  const esSuperUsuario = rolActual === 'SUPER_USUARIO';

  const [facultades, setFacultades] = useState<FacultadItem[]>([]);
  const [sedes, setSedes] = useState<SedeApi[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargarDatos = useCallback(async () => {
    if (!esSuperUsuario) return;
    try {
      const [facultadesApi, sedesApi] = await Promise.all([
        universidadApi.listarFacultades(true),
        universidadApi.listarSedes(true),
      ]);
      setFacultades(facultadesApi.map(convertirFacultad));
      setSedes(sedesApi);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar las facultades.');
    } finally {
      setCargando(false);
    }
  }, [esSuperUsuario]);

  useEffect(() => {
    const cargarAlIniciar = async () => {
      await cargarDatos();
    };
    void cargarAlIniciar();
  }, [cargarDatos]);

  // Estados de filtros
  const [busqueda, setBusqueda] = useState('');
  const [sedeFiltro, setSedeFiltro] = useState('Todas');
  const [estadoFiltro, setEstadoFiltro] = useState('Todas');

  // Estados del Modal de Creación
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaSede, setNuevaSede] = useState('');
  const [nuevoDecano, setNuevoDecano] = useState('');

  // Estados del Modal de Edición
  const [facultadEditando, setFacultadEditando] = useState<FacultadItem | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editSede, setEditSede] = useState('');
  const [editDecano, setEditDecano] = useState('');

  // Estado del Modal de Desactivación / Reactivación
  const [facultadEstadoModal, setFacultadEstadoModal] = useState<FacultadItem | null>(null);
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [codigoConfirmacion, setCodigoConfirmacion] = useState('');

  const abrirModalEstado = (facultad: FacultadItem) => {
    setFacultadEstadoModal(facultad);
    setCodigoEnviado(false);
    setCodigoConfirmacion('');
    setError('');
  };

  const cerrarModalEstado = () => {
    setFacultadEstadoModal(null);
    setCodigoEnviado(false);
    setCodigoConfirmacion('');
  };

  const handleCrearFacultad = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim() || !nuevaSede) return;

    setGuardando(true);
    setError('');
    try {
      await universidadApi.crearFacultad({
        idSede: Number(nuevaSede),
        nombreFacultad: nuevoNombre.trim(),
        decano: nuevoDecano.trim(),
        descripcionFacultad: '',
      });
      await cargarDatos();
      setNuevoNombre('');
      setNuevaSede('');
      setNuevoDecano('');
      setModalCrearAbierto(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar la facultad.');
    } finally {
      setGuardando(false);
    }
  };

  // Abrir modal de edición precargando datos
  const abrirModalEditar = (facultad: FacultadItem) => {
    setFacultadEditando(facultad);
    setEditNombre(facultad.nombre);
    setEditSede(facultad.idSede);
    setEditDecano(facultad.decano);
  };

  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facultadEditando || !editNombre.trim() || !editSede) return;

    setGuardando(true);
    setError('');
    try {
      await universidadApi.actualizarFacultad(Number(facultadEditando.id), {
        idSede: Number(editSede),
        nombreFacultad: editNombre.trim(),
        decano: editDecano.trim(),
        descripcionFacultad: facultadEditando.descripcion,
      });
      await cargarDatos();
      setFacultadEditando(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar la facultad.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEnviarCodigo = async () => {
    if (!facultadEstadoModal || !user) return;
    setGuardando(true);
    setError('');
    try {
      await universidadApi.solicitarCodigo(
        'facultad',
        Number(facultadEstadoModal.id),
        Number(user.id),
      );
      setCodigoEnviado(true);
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : 'No se pudo enviar el código.';
      if (mensaje.includes('Ya se envió un código')) setCodigoEnviado(true);
      setError(mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const handleConfirmarCambioEstado = async () => {
    if (!facultadEstadoModal || !user) return;
    setGuardando(true);
    setError('');
    try {
      if (facultadEstadoModal.estado === 'Activa') {
        await universidadApi.desactivar(
          'facultad',
          Number(facultadEstadoModal.id),
          Number(user.id),
          codigoConfirmacion,
        );
      } else {
        await universidadApi.activar('facultad', Number(facultadEstadoModal.id), Number(user.id));
      }
      await cargarDatos();
      cerrarModalEstado();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cambiar el estado de la facultad.');
    } finally {
      setGuardando(false);
    }
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setBusqueda('');
    setSedeFiltro('Todas');
    setEstadoFiltro('Todas');
  };

  // Filtrado y ordenamiento (Activas primero, Inactivas al fondo)
  const facultadesFiltradas = useMemo(() => {
    const filtradas = facultades.filter((item) => {
      const texto = busqueda.toLowerCase().trim();
      const coincideTexto =
        !texto ||
        item.nombre.toLowerCase().includes(texto) ||
        item.decano.toLowerCase().includes(texto);
      const coincideSede = sedeFiltro === 'Todas' || item.idSede === sedeFiltro;
      const coincideEstado = estadoFiltro === 'Todas' || item.estado === estadoFiltro;

      return coincideTexto && coincideSede && coincideEstado;
    });

    return filtradas.sort((a, b) => {
      if (a.estado === 'Activa' && b.estado === 'Inactiva') return -1;
      if (a.estado === 'Inactiva' && b.estado === 'Activa') return 1;
      return 0;
    });
  }, [facultades, busqueda, sedeFiltro, estadoFiltro]);

  const totalActivas = facultades.filter((f) => f.estado === 'Activa').length;

  if (!user || !esSuperUsuario) {
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
      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {error}
        </p>
      )}
      {/* Encabezado Superior */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
            Gestión de Facultades
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Configura las facultades institucionales, decanatos y áreas académicas del sistema.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalCrearAbierto(true)}
          className="inline-flex items-center gap-2 bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Crear facultad
        </button>
      </div>

      {/* 3 Tarjetas Indicadoras */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-3xl font-extrabold text-[#050758]">{totalActivas}</p>
          <p className="text-sm font-bold text-gray-800 mt-2">Facultades activas</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-3xl font-extrabold text-[#050758]">{facultades.length}</p>
          <p className="text-sm font-bold text-gray-800 mt-2">Total registradas</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-3xl font-extrabold text-[#050758]">Global</p>
          <p className="text-sm font-bold text-gray-800 mt-2">Alcance institucional</p>
        </div>
      </div>

      {/* Tarjeta Principal de Listado */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Listado de facultades</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Las facultades desactivadas se muestran automáticamente al final del listado.
          </p>
        </div>

        {/* Barra de Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-5 border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center">
            <label className="text-[10px] font-medium text-gray-400">Buscar por nombre o decano</label>
            <div className="flex items-center gap-2 mt-0.5">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Ej. Ingeniería, Mendoza..."
                className="w-full text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-3 border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center">
            <label className="text-[10px] font-medium text-gray-400">Sede</label>
            <select
              value={sedeFiltro}
              onChange={(e) => setSedeFiltro(e.target.value)}
              className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none cursor-pointer"
            >
              <option value="Todas">Todas las sedes</option>
              {sedes.filter((sede) => sede.estado === 'activo').map((sede) => (
                <option key={sede.idSede} value={String(sede.idSede)}>{sede.nombreSede}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center">
            <label className="text-[10px] font-medium text-gray-400">Estado</label>
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none cursor-pointer"
            >
              <option value="Todas">Todos los estados</option>
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

        {/* Tabla */}
        <div className="overflow-x-auto border border-gray-200/80 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F3F4F8] text-gray-500 text-[11px] font-semibold border-b border-gray-200/80">
                <th className="py-3.5 px-5">Facultad</th>
                <th className="py-3.5 px-4">Sede</th>
                <th className="py-3.5 px-4">Decano / Autoridad</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {cargando ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">Cargando facultades...</td>
                </tr>
              ) : facultadesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No se encontraron facultades con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                facultadesFiltradas.map((item) => (
                  <tr
                    key={item.id}
                    className={`transition ${
                      item.estado === 'Inactiva' ? 'bg-gray-50/50 opacity-75' : 'hover:bg-gray-50/70'
                    }`}
                  >
                    <td className="py-4 px-5 font-bold text-gray-900 flex items-center gap-2.5">
                      <Building2
                        className={`w-4 h-4 shrink-0 ${
                          item.estado === 'Activa' ? 'text-[#050758]' : 'text-gray-400'
                        }`}
                      />
                      <span className={item.estado === 'Inactiva' ? 'text-gray-500' : ''}>
                        {item.nombre}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{item.sede}</td>
                    <td className="py-4 px-4 text-gray-700">{item.decano || 'Por asignar'}</td>
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
                          onClick={() => abrirModalEditar(item)}
                          title="Editar facultad"
                          className="text-amber-600 hover:text-amber-800 transition cursor-pointer p-1"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => abrirModalEstado(item)}
                          title={item.estado === 'Activa' ? 'Desactivar facultad' : 'Reactivar facultad'}
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

      {/* 1. MODAL: CREAR NUEVA FACULTAD */}
      {modalCrearAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-lg p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Registrar Nueva Facultad</h3>
                <p className="text-xs text-gray-500">
                  Ingresa los datos generales para la estructura institucional.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalCrearAbierto(false)}
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearFacultad} className="space-y-4">
              {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Nombre de la facultad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Ej. Facultad de Arquitectura y Diseño"
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium placeholder:text-gray-400 focus:outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700">
                    Sede <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={nuevaSede}
                    onChange={(e) => setNuevaSede(e.target.value)}
                    className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition cursor-pointer"
                  >
                    <option value="" disabled>Selecciona una sede</option>
                    {sedes.filter((sede) => sede.estado === 'activo').map((sede) => (
                      <option key={sede.idSede} value={String(sede.idSede)}>{sede.nombreSede}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700">
                    Decano / Autoridad a cargo
                  </label>
                  <input
                    type="text"
                    value={nuevoDecano}
                    onChange={(e) => setNuevoDecano(e.target.value)}
                    placeholder="Ej. Arq. Ana Gómez"
                    className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium placeholder:text-gray-400 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalCrearAbierto(false)}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando || sedes.every((sede) => sede.estado !== 'activo')}
                  className="bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Guardar facultad
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. MODAL: EDITAR FACULTAD */}
      {facultadEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-lg p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Editar Facultad</h3>
                <p className="text-xs text-gray-500">
                  Actualiza la información institucional de la facultad.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFacultadEditando(null)}
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarEdicion} className="space-y-4">
              {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Nombre de la facultad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700">
                    Sede <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={editSede}
                    onChange={(e) => setEditSede(e.target.value)}
                    className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition cursor-pointer"
                  >
                    {sedes.filter((sede) => sede.estado === 'activo').map((sede) => (
                      <option key={sede.idSede} value={String(sede.idSede)}>
                        {sede.nombreSede}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700">
                    Decano / Autoridad a cargo
                  </label>
                  <input
                    type="text"
                    value={editDecano}
                    onChange={(e) => setEditDecano(e.target.value)}
                    className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setFacultadEditando(null)}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MODAL: DESACTIVAR / REACTIVAR FACULTAD */}
      {facultadEstadoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md p-6 shadow-xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    facultadEstadoModal.estado === 'Activa'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-emerald-50 text-emerald-600'
                  }`}
                >
                  {facultadEstadoModal.estado === 'Activa' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <RotateCcw className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {facultadEstadoModal.estado === 'Activa'
                      ? 'Desactivar Facultad'
                      : 'Reactivar Facultad'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Confirma el cambio de estado institucional.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={cerrarModalEstado}
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-4 space-y-1">
              <p className="text-xs font-bold text-gray-900">{facultadEstadoModal.nombre}</p>
              <p className="text-[11px] text-gray-500">{facultadEstadoModal.sede}</p>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              {facultadEstadoModal.estado === 'Activa'
                ? 'Al desactivar esta facultad, también se desactivarán sus carreras, planes de estudio, asignaturas y usuarios asignados. Se enviará un código de confirmación al correo del superusuario.'
                : 'Al reactivar esta facultad, sus carreras, planes, asignaturas y usuarios seguirán inactivos. Deberás activarlos manualmente, uno por uno.'}
            </p>

            {error && <p role="alert" className="text-xs text-red-600">{error}</p>}

            {facultadEstadoModal.estado === 'Activa' && codigoEnviado && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Código de confirmación (6 dígitos)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  value={codigoConfirmacion}
                  onChange={(e) => {
                    setCodigoConfirmacion(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setError('');
                  }}
                  placeholder="000000"
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium tracking-widest focus:outline-none transition"
                />
                <p className="text-[11px] text-gray-500">El código vence en 10 minutos y solo puede utilizarse una vez.</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={cerrarModalEstado}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={
                  facultadEstadoModal.estado === 'Activa' && !codigoEnviado
                    ? handleEnviarCodigo
                    : handleConfirmarCambioEstado
                }
                disabled={
                  guardando
                  || (facultadEstadoModal.estado === 'Activa' && codigoEnviado && codigoConfirmacion.length !== 6)
                }
                className={`text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition cursor-pointer ${
                  facultadEstadoModal.estado === 'Activa'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {facultadEstadoModal.estado === 'Activa'
                  ? codigoEnviado ? 'Confirmar desactivación' : 'Enviar código'
                  : 'Sí, reactivar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};