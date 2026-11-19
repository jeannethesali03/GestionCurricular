import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  X,
  MapPin,
  AlertTriangle,
  RotateCcw,
  Phone,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { universidadApi, type SedeApi } from '../../services/universidadApi';

export interface SedeItem {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  estado: 'Activa' | 'Inactiva';
}

const convertirSede = (sede: SedeApi): SedeItem => ({
  id: String(sede.idSede),
  nombre: sede.nombreSede,
  direccion: sede.direccion ?? '',
  telefono: sede.telefono ?? '',
  estado: sede.estado === 'activo' ? 'Activa' : 'Inactiva',
});

export const GestionSedes: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const rolActual = (user?.rol as string) || '';
  const esSuperUsuario = rolActual === 'SUPER_USUARIO';

  const [sedes, setSedes] = useState<SedeItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const cargarSedes = useCallback(async () => {
    if (!esSuperUsuario) return;
    try {
      const resultado = await universidadApi.listarSedes(true);
      setSedes(resultado.map(convertirSede));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar las sedes.');
    } finally {
      setCargando(false);
    }
  }, [esSuperUsuario]);

  useEffect(() => {
    const cargarAlIniciar = async () => {
      await cargarSedes();
    };
    void cargarAlIniciar();
  }, [cargarSedes]);

  // Estados de filtros
  const [busqueda, setBusqueda] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('Todas');

  // Estados del Modal de Creación
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaDireccion, setNuevaDireccion] = useState('');
  const [nuevoTelefono, setNuevoTelefono] = useState('');

  // Estados del Modal de Edición
  const [sedeEditando, setSedeEditando] = useState<SedeItem | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editDireccion, setEditDireccion] = useState('');
  const [editTelefono, setEditTelefono] = useState('');

  // Estado del Modal de Desactivación / Reactivación
  const [sedeEstadoModal, setSedeEstadoModal] = useState<SedeItem | null>(null);
  const [codigoEnviado, setCodigoEnviado] = useState(false);
  const [codigoConfirmacion, setCodigoConfirmacion] = useState('');

  const abrirModalEstado = (sede: SedeItem) => {
    setSedeEstadoModal(sede);
    setCodigoEnviado(false);
    setCodigoConfirmacion('');
    setError('');
  };

  const cerrarModalEstado = () => {
    setSedeEstadoModal(null);
    setCodigoEnviado(false);
    setCodigoConfirmacion('');
  };

  // Crear nueva sede
  const handleCrearSede = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim() || !nuevaDireccion.trim()) return;

    setGuardando(true);
    setError('');
    try {
      await universidadApi.crearSede({
        nombreSede: nuevoNombre.trim(),
        direccion: nuevaDireccion.trim(),
        telefono: nuevoTelefono.trim(),
      });
      await cargarSedes();
      setNuevoNombre('');
      setNuevaDireccion('');
      setNuevoTelefono('');
      setModalCrearAbierto(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar la sede.');
    } finally {
      setGuardando(false);
    }
  };

  // Abrir modal de edición precargando datos
  const abrirModalEditar = (sede: SedeItem) => {
    setSedeEditando(sede);
    setEditNombre(sede.nombre);
    setEditDireccion(sede.direccion);
    setEditTelefono(sede.telefono);
  };

  // Guardar cambios de edición
  const handleGuardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sedeEditando || !editNombre.trim()) return;

    setGuardando(true);
    setError('');
    try {
      await universidadApi.actualizarSede(Number(sedeEditando.id), {
        nombreSede: editNombre.trim(),
        direccion: editDireccion.trim(),
        telefono: editTelefono.trim(),
      });
      await cargarSedes();
      setSedeEditando(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar la sede.');
    } finally {
      setGuardando(false);
    }
  };

  const handleEnviarCodigo = async () => {
    if (!sedeEstadoModal || !user) return;
    setGuardando(true);
    setError('');
    try {
      await universidadApi.solicitarCodigo('sede', Number(sedeEstadoModal.id), Number(user.id));
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
    if (!sedeEstadoModal || !user) return;
    setGuardando(true);
    setError('');
    try {
      if (sedeEstadoModal.estado === 'Activa') {
        await universidadApi.desactivar(
          'sede',
          Number(sedeEstadoModal.id),
          Number(user.id),
          codigoConfirmacion,
        );
      } else {
        await universidadApi.activar('sede', Number(sedeEstadoModal.id), Number(user.id));
      }
      await cargarSedes();
      cerrarModalEstado();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cambiar el estado de la sede.');
    } finally {
      setGuardando(false);
    }
  };

  // Limpiar filtros
  const limpiarFiltros = () => {
    setBusqueda('');
    setEstadoFiltro('Todas');
  };

  // Filtrado y ordenamiento (Activas primero, Inactivas al fondo)
  const sedesFiltradas = useMemo(() => {
    const filtradas = sedes.filter((item) => {
      const texto = busqueda.toLowerCase().trim();
      const coincideTexto =
        !texto ||
        item.nombre.toLowerCase().includes(texto) ||
        item.direccion.toLowerCase().includes(texto) ||
        item.telefono.toLowerCase().includes(texto);
      const coincideEstado = estadoFiltro === 'Todas' || item.estado === estadoFiltro;

      return coincideTexto && coincideEstado;
    });

    return filtradas.sort((a, b) => {
      if (a.estado === 'Activa' && b.estado === 'Inactiva') return -1;
      if (a.estado === 'Inactiva' && b.estado === 'Activa') return 1;
      return 0;
    });
  }, [sedes, busqueda, estadoFiltro]);

  const totalActivas = sedes.filter((s) => s.estado === 'Activa').length;

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
            Gestión de Sedes
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Administra los campus regionales, ubicaciones físicas y centros de atención de la universidad.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalCrearAbierto(true)}
          className="inline-flex items-center gap-2 bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Crear sede
        </button>
      </div>

      {/* 3 Tarjetas Indicadoras */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-3xl font-extrabold text-[#050758]">{totalActivas}</p>
          <p className="text-sm font-bold text-gray-800 mt-2">Sedes activas</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-3xl font-extrabold text-[#050758]">{sedes.length}</p>
          <p className="text-sm font-bold text-gray-800 mt-2">Total registradas</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-3xl font-extrabold text-[#050758]">Infraestructura</p>
          <p className="text-sm font-bold text-gray-800 mt-2">Red institucional</p>
        </div>
      </div>

      {/* Tarjeta Principal de Listado */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Listado de sedes</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Las sedes desactivadas se muestran automáticamente al final del listado.
          </p>
        </div>

        {/* Barra de Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-7 border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center">
            <label className="text-[10px] font-medium text-gray-400">Buscar por nombre, dirección o teléfono</label>
            <div className="flex items-center gap-2 mt-0.5">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Ej. Campus Central, Santa Ana..."
                className="w-full text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
              />
            </div>
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
                <th className="py-3.5 px-5">Sede</th>
                <th className="py-3.5 px-4">Dirección</th>
                <th className="py-3.5 px-4">Teléfono</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {cargando ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">Cargando sedes...</td>
                </tr>
              ) : sedesFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No se encontraron sedes con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                sedesFiltradas.map((item) => (
                  <tr
                    key={item.id}
                    className={`transition ${
                      item.estado === 'Inactiva' ? 'bg-gray-50/50 opacity-75' : 'hover:bg-gray-50/70'
                    }`}
                  >
                    <td className="py-4 px-5 font-bold text-gray-900 flex items-center gap-2.5">
                      <MapPin
                        className={`w-4 h-4 shrink-0 ${
                          item.estado === 'Activa' ? 'text-[#050758]' : 'text-gray-400'
                        }`}
                      />
                      <span className={item.estado === 'Inactiva' ? 'text-gray-500' : ''}>
                        {item.nombre}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{item.direccion || 'No especificada'}</td>
                    <td className="py-4 px-4 text-gray-600 font-medium">{item.telefono || 'No especificado'}</td>
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
                          title="Editar sede"
                          className="text-amber-600 hover:text-amber-800 transition cursor-pointer p-1"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => abrirModalEstado(item)}
                          title={item.estado === 'Activa' ? 'Desactivar sede' : 'Reactivar sede'}
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

      {/* 1. MODAL: CREAR NUEVA SEDE */}
      {modalCrearAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-lg p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Registrar Nueva Sede</h3>
                <p className="text-xs text-gray-500">
                  Ingresa la información del campus o centro regional.
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

            <form onSubmit={handleCrearSede} className="space-y-4">
              {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Nombre de la sede <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Ej. Sede Regional Occidente"
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium placeholder:text-gray-400 focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Dirección física <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nuevaDireccion}
                  onChange={(e) => setNuevaDireccion(e.target.value)}
                  placeholder="Ej. Km. 45 Carretera Panamericana"
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium placeholder:text-gray-400 focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Teléfono de contacto
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={nuevoTelefono}
                    onChange={(e) => setNuevoTelefono(e.target.value)}
                    placeholder="Ej. 2440-1111"
                    className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl pl-10 pr-4 py-3 text-xs text-gray-800 font-medium placeholder:text-gray-400 focus:outline-none transition"
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
                  disabled={guardando}
                  className="bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
                >
                  Guardar sede
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. MODAL: EDITAR SEDE */}
      {sedeEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-lg p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Editar Sede</h3>
                <p className="text-xs text-gray-500">
                  Actualiza los datos de ubicación y contacto de la sede.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSedeEditando(null)}
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarEdicion} className="space-y-4">
              {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Nombre de la sede <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Dirección física <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editDireccion}
                  onChange={(e) => setEditDireccion(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Teléfono de contacto
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={editTelefono}
                    onChange={(e) => setEditTelefono(e.target.value)}
                    className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl pl-10 pr-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSedeEditando(null)}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MODAL: DESACTIVAR / REACTIVAR SEDE */}
      {sedeEstadoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md p-6 shadow-xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    sedeEstadoModal.estado === 'Activa'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-emerald-50 text-emerald-600'
                  }`}
                >
                  {sedeEstadoModal.estado === 'Activa' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <RotateCcw className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {sedeEstadoModal.estado === 'Activa'
                      ? 'Desactivar Sede'
                      : 'Reactivar Sede'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Confirma el cambio de estado de la sede.
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
              <p className="text-xs font-bold text-gray-900">{sedeEstadoModal.nombre}</p>
              <p className="text-[11px] text-gray-500">{sedeEstadoModal.direccion}</p>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              {sedeEstadoModal.estado === 'Activa'
                ? 'Al desactivar esta sede, también se desactivarán sus facultades, carreras, planes de estudio, asignaturas y usuarios asignados a sus facultades. Se enviará un código de confirmación al correo del superusuario.'
                : 'Al reactivar esta sede, sus facultades, carreras, planes, asignaturas y usuarios seguirán inactivos. Deberás activarlos manualmente, uno por uno, comenzando por las facultades.'}
            </p>

            {error && <p role="alert" className="text-xs text-red-600">{error}</p>}

            {sedeEstadoModal.estado === 'Activa' && codigoEnviado && (
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
                  sedeEstadoModal.estado === 'Activa' && !codigoEnviado
                    ? handleEnviarCodigo
                    : handleConfirmarCambioEstado
                }
                disabled={
                  guardando
                  || (sedeEstadoModal.estado === 'Activa' && codigoEnviado && codigoConfirmacion.length !== 6)
                }
                className={`text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition cursor-pointer ${
                  sedeEstadoModal.estado === 'Activa'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {sedeEstadoModal.estado === 'Activa'
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