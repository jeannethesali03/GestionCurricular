import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  X,
  Building2,
  GraduationCap,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface CarreraItem {
  id: string;
  nombre: string;
  facultad: string;
  estado: 'Activa' | 'Inactiva';
}

export const GestionCarreras: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const rolActual = (user?.rol as string) || '';
  const esSuperUsuario = rolActual === 'SUPER_USUARIO';

  // Si no es superusuario, muestra la pantalla limpia de Página no encontrada (404)
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

  // Lista simulada inicial de carreras
  const [carreras, setCarreras] = useState<CarreraItem[]>([
    {
      id: '1',
      nombre: 'Ingeniería en Desarrollo de Software',
      facultad: 'Ingeniería y Tecnología',
      estado: 'Activa',
    },
    {
      id: '2',
      nombre: 'Licenciatura en Administración de Empresas',
      facultad: 'Ciencias Económicas',
      estado: 'Activa',
    },
    {
      id: '3',
      nombre: 'Ingeniería Industrial',
      facultad: 'Ingeniería y Tecnología',
      estado: 'Inactiva',
    },
  ]);

  // Estados de filtros
  const [busqueda, setBusqueda] = useState('');
  const [facultadFiltro, setFacultadFiltro] = useState('Todas');
  const [estadoFiltro, setEstadoFiltro] = useState('Todas');

  // Estados del Modal de Creación
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaFacultad, setNuevaFacultad] = useState('Ingeniería y Tecnología');

  // Estados del Modal de Edición
  const [carreraEditando, setCarreraEditando] = useState<CarreraItem | null>(null);
  const [editNombre, setEditNombre] = useState('');
  const [editFacultad, setEditFacultad] = useState('');

  // Estado del Modal de Desactivación / Reactivación
  const [carreraEstadoModal, setCarreraEstadoModal] = useState<CarreraItem | null>(null);

  const facultadesDisponibles = [
    'Ingeniería y Tecnología',
    'Ciencias Económicas',
    'Jurisprudencia y Ciencias Sociales',
    'Ciencias de la Salud',
    'Humanidades',
  ];

  // Crear nueva carrera
  const handleCrearCarrera = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;

    const nuevaCarreraObj: CarreraItem = {
      id: Date.now().toString(),
      nombre: nuevoNombre.trim(),
      facultad: nuevaFacultad,
      estado: 'Activa',
    };

    setCarreras([nuevaCarreraObj, ...carreras]);
    setNuevoNombre('');
    setNuevaFacultad('Ingeniería y Tecnología');
    setModalCrearAbierto(false);
  };

  // Abrir modal de edición precargando los datos de la carrera
  const abrirModalEditar = (carrera: CarreraItem) => {
    setCarreraEditando(carrera);
    setEditNombre(carrera.nombre);
    setEditFacultad(carrera.facultad);
  };

  // Guardar cambios de edición
  const handleGuardarEdicion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!carreraEditando || !editNombre.trim()) return;

    setCarreras(
      carreras.map((c) =>
        c.id === carreraEditando.id
          ? { ...c, nombre: editNombre.trim(), facultad: editFacultad }
          : c
      )
    );
    setCarreraEditando(null);
  };

  // Confirmar desactivación o reactivación desde su modal
  const handleConfirmarCambioEstado = () => {
    if (!carreraEstadoModal) return;

    setCarreras(
      carreras.map((c) =>
        c.id === carreraEstadoModal.id
          ? { ...c, estado: c.estado === 'Activa' ? 'Inactiva' : 'Activa' }
          : c
      )
    );
    setCarreraEstadoModal(null);
  };

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    setBusqueda('');
    setFacultadFiltro('Todas');
    setEstadoFiltro('Todas');
  };

  // Filtrado y ordenamiento automático (Activas primero, Inactivas al fondo)
  const carrerasFiltradas = useMemo(() => {
    const filtradas = carreras.filter((item) => {
      const texto = busqueda.toLowerCase().trim();
      const coincideTexto = !texto || item.nombre.toLowerCase().includes(texto);
      const coincideFacultad = facultadFiltro === 'Todas' || item.facultad === facultadFiltro;
      const coincideEstado = estadoFiltro === 'Todas' || item.estado === estadoFiltro;

      return coincideTexto && coincideFacultad && coincideEstado;
    });

    return filtradas.sort((a, b) => {
      if (a.estado === 'Activa' && b.estado === 'Inactiva') return -1;
      if (a.estado === 'Inactiva' && b.estado === 'Activa') return 1;
      return 0;
    });
  }, [carreras, busqueda, facultadFiltro, estadoFiltro]);

  const totalActivas = carreras.filter((c) => c.estado === 'Activa').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 relative">
      {/* Encabezado Superior */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
            Gestión de Carreras
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Administra el catálogo general de carreras universitarias y su vinculación institucional.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalCrearAbierto(true)}
          className="inline-flex items-center gap-2 bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Crear carrera
        </button>
      </div>

      {/* 3 Tarjetas Indicadoras */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-3xl font-extrabold text-[#050758]">{totalActivas}</p>
          <p className="text-sm font-bold text-gray-800 mt-2">Carreras activas</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-3xl font-extrabold text-[#050758]">{carreras.length}</p>
          <p className="text-sm font-bold text-gray-800 mt-2">Total registradas</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-3xl font-extrabold text-[#050758]">{facultadesDisponibles.length}</p>
          <p className="text-sm font-bold text-gray-800 mt-2">Facultades institucionales</p>
        </div>
      </div>

      {/* Tarjeta Principal de Listado */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Listado de carreras</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Las carreras desactivadas se muestran automáticamente al final del listado.
          </p>
        </div>

        {/* Barra de Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-5 border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center">
            <label className="text-[10px] font-medium text-gray-400">Buscar por nombre</label>
            <div className="flex items-center gap-2 mt-0.5">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Ej. Ingeniería en Sistemas..."
                className="w-full text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-3 border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center">
            <label className="text-[10px] font-medium text-gray-400">Facultad</label>
            <select
              value={facultadFiltro}
              onChange={(e) => setFacultadFiltro(e.target.value)}
              className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none cursor-pointer"
            >
              <option value="Todas">Todas las facultades</option>
              {facultadesDisponibles.map((fac) => (
                <option key={fac} value={fac}>
                  {fac}
                </option>
              ))}
            </select>
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

        {/* Tabla */}
        <div className="overflow-x-auto border border-gray-200/80 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F3F4F8] text-gray-500 text-[11px] font-semibold border-b border-gray-200/80">
                <th className="py-3.5 px-5">Nombre de la carrera</th>
                <th className="py-3.5 px-4">Facultad</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {carrerasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    No se encontraron carreras con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                carrerasFiltradas.map((item) => (
                  <tr
                    key={item.id}
                    className={`transition ${
                      item.estado === 'Inactiva' ? 'bg-gray-50/50 opacity-75' : 'hover:bg-gray-50/70'
                    }`}
                  >
                    <td className="py-4 px-5 font-bold text-gray-900 flex items-center gap-2.5">
                      <GraduationCap
                        className={`w-4 h-4 shrink-0 ${
                          item.estado === 'Activa' ? 'text-[#050758]' : 'text-gray-400'
                        }`}
                      />
                      <span className={item.estado === 'Inactiva' ? 'text-gray-500' : ''}>
                        {item.nombre}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{item.facultad}</td>
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
                          title="Editar carrera"
                          className="text-amber-600 hover:text-amber-800 transition cursor-pointer p-1"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCarreraEstadoModal(item)}
                          title={item.estado === 'Activa' ? 'Desactivar carrera' : 'Reactivar carrera'}
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

      {/* 1. MODAL: CREAR NUEVA CARRERA */}
      {modalCrearAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-lg p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Registrar Nueva Carrera</h3>
                <p className="text-xs text-gray-500">
                  Ingresa los datos generales para el catálogo académico.
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

            <form onSubmit={handleCrearCarrera} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Nombre de la carrera <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Ej. Ingeniería en Inteligencia Artificial"
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium placeholder:text-gray-400 focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Facultad de adscripción <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <select
                    value={nuevaFacultad}
                    onChange={(e) => setNuevaFacultad(e.target.value)}
                    className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl pl-10 pr-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition cursor-pointer"
                  >
                    {facultadesDisponibles.map((fac) => (
                      <option key={fac} value={fac}>
                        {fac}
                      </option>
                    ))}
                  </select>
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
                  className="bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
                >
                  Guardar carrera
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. MODAL: EDITAR CARRERA */}
      {carreraEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-lg p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Editar Carrera</h3>
                <p className="text-xs text-gray-500">
                  Actualiza el nombre o la facultad a la que pertenece la carrera.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCarreraEditando(null)}
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarEdicion} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Nombre de la carrera <span className="text-red-500">*</span>
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
                  Facultad de adscripción <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
                  <select
                    value={editFacultad}
                    onChange={(e) => setEditFacultad(e.target.value)}
                    className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl pl-10 pr-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition cursor-pointer"
                  >
                    {facultadesDisponibles.map((fac) => (
                      <option key={fac} value={fac}>
                        {fac}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCarreraEditando(null)}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MODAL: DESACTIVAR / REACTIVAR CARRERA */}
      {carreraEstadoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-md p-6 shadow-xl space-y-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    carreraEstadoModal.estado === 'Activa'
                      ? 'bg-red-50 text-red-600'
                      : 'bg-emerald-50 text-emerald-600'
                  }`}
                >
                  {carreraEstadoModal.estado === 'Activa' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <RotateCcw className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {carreraEstadoModal.estado === 'Activa'
                      ? 'Desactivar Carrera'
                      : 'Reactivar Carrera'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Confirma el cambio de estado en el catálogo.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCarreraEstadoModal(null)}
                className="text-gray-400 hover:text-gray-600 transition cursor-pointer p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gray-50 border border-gray-200/80 rounded-xl p-4 space-y-1">
              <p className="text-xs font-bold text-gray-900">{carreraEstadoModal.nombre}</p>
              <p className="text-[11px] text-gray-500">{carreraEstadoModal.facultad}</p>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              {carreraEstadoModal.estado === 'Activa'
                ? 'Al desactivar esta carrera, dejará de estar disponible para nuevos planes de estudio y pasará al final del listado.'
                : 'Al reactivar esta carrera, volverá a estar disponible en el catálogo activo de la facultad.'}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setCarreraEstadoModal(null)}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarCambioEstado}
                className={`text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm transition cursor-pointer ${
                  carreraEstadoModal.estado === 'Activa'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {carreraEstadoModal.estado === 'Activa'
                  ? 'Sí, desactivar'
                  : 'Sí, reactivar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};