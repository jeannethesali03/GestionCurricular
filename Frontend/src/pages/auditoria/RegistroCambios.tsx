import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, RotateCcw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface RegistroItem {
  id: string;
  usuarioNombre: string;
  usuarioRol: string;
  cambio: string;
  detalle: string;
  tipoCambio: 'Inserción' | 'Edición' | 'Eliminación';
  facultad: string;
  fechaHora: string;
  planEstudio?: string;
  planAsignatura?: string;
}

export const RegistroCambios: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const rolActual = (user?.rol as string) || '';
  const esSuperUsuario = rolActual === 'SUPER_USUARIO';

  // Si no es Superusuario (es Admin o Usuario Estándar), muestra la pantalla 404
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

  // Lista simulada de registros basados en la interfaz de referencia
  const [registros] = useState<RegistroItem[]>([
    {
      id: 'reg-01',
      usuarioNombre: 'Lucía Méndez',
      usuarioRol: 'Usuario Estándar',
      cambio: 'Plan de estudio: Ing. en Sistemas',
      detalle: 'Justificación',
      tipoCambio: 'Inserción',
      facultad: 'Ingeniería y Tecnología',
      fechaHora: '10/02/2026:08:23',
      planEstudio: 'Ingeniería en Sistemas',
    },
    {
      id: 'reg-02',
      usuarioNombre: 'Diego Torres',
      usuarioRol: 'Usuario Estándar',
      cambio: 'Plan de Asignatura: Matemáticas',
      detalle: 'Objetivos',
      tipoCambio: 'Edición',
      facultad: 'Ingeniería y Tecnología',
      fechaHora: '10/02/2026:08:33',
      planAsignatura: 'Matemáticas',
    },
    {
      id: 'reg-03',
      usuarioNombre: 'Ana Beltrán',
      usuarioRol: 'Usuario Estándar',
      cambio: 'Edicion de su nombre de usuario',
      detalle: '-',
      tipoCambio: 'Edición',
      facultad: 'Ciencias Económicas',
      fechaHora: '10/02/2026:09:12',
    },
    {
      id: 'reg-04',
      usuarioNombre: 'Sofía Herrera',
      usuarioRol: 'Usuario Estándar',
      cambio: 'Cambio de contraseña',
      detalle: '-',
      tipoCambio: 'Edición',
      facultad: 'Jurisprudencia y Ciencias Sociales',
      fechaHora: '10/02/2026:10:26',
    },
  ]);

  const [busquedaUsuario, setBusquedaUsuario] = useState('');
  const [busquedaPlanEstudio, setBusquedaPlanEstudio] = useState('');
  const [busquedaPlanAsignatura, setBusquedaPlanAsignatura] = useState('');
  const [facultadFiltro, setFacultadFiltro] = useState('Todas las facultades');

  // Función para limpiar los filtros
  const limpiarFiltros = () => {
    setBusquedaUsuario('');
    setBusquedaPlanEstudio('');
    setBusquedaPlanAsignatura('');
    setFacultadFiltro('Todas las facultades');
  };

  // Filtrado de registros
  const registrosFiltrados = useMemo(() => {
    return registros.filter((item) => {
      const coincideUsuario =
        !busquedaUsuario.trim() ||
        item.usuarioNombre.toLowerCase().includes(busquedaUsuario.toLowerCase().trim());

      const coincidePlanEstudio =
        !busquedaPlanEstudio.trim() ||
        (item.planEstudio && item.planEstudio.toLowerCase().includes(busquedaPlanEstudio.toLowerCase().trim())) ||
        item.cambio.toLowerCase().includes(busquedaPlanEstudio.toLowerCase().trim());

      const coincidePlanAsignatura =
        !busquedaPlanAsignatura.trim() ||
        (item.planAsignatura && item.planAsignatura.toLowerCase().includes(busquedaPlanAsignatura.toLowerCase().trim())) ||
        item.cambio.toLowerCase().includes(busquedaPlanAsignatura.toLowerCase().trim());

      const coincideFacultad =
        facultadFiltro === 'Todas las facultades' || item.facultad === facultadFiltro;

      return coincideUsuario && coincidePlanEstudio && coincidePlanAsignatura && coincideFacultad;
    });
  }, [registros, busquedaUsuario, busquedaPlanEstudio, busquedaPlanAsignatura, facultadFiltro]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Encabezado Superior */}
      <div>
        <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
          Registro de cambios en el Sistema
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Detalle de las acciones de todos los usuarios
        </p>
      </div>

      {/* Tarjeta Principal de Responsabilidades / Filtros */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Responsabilidades vigentes</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Cada registro muestra el conjunto de recursos que un usuario puede editar.
            </p>
          </div>

          <button
            type="button"
            onClick={limpiarFiltros}
            className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpiar filtros
          </button>
        </div>

        {/* Barra de Filtros (4 Columnas) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Buscar usuario */}
          <div className="border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center">
            <label className="text-[10px] font-medium text-gray-400">Buscar usuario</label>
            <div className="flex items-center gap-2 mt-0.5">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={busquedaUsuario}
                onChange={(e) => setBusquedaUsuario(e.target.value)}
                placeholder="Nombre de usuario"
                className="w-full text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Buscar plan de estudio */}
          <div className="border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center">
            <label className="text-[10px] font-medium text-gray-400">Buscar plan de estudio</label>
            <div className="flex items-center gap-2 mt-0.5">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={busquedaPlanEstudio}
                onChange={(e) => setBusquedaPlanEstudio(e.target.value)}
                placeholder="Plan de estudio"
                className="w-full text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Buscar plan de asignatura */}
          <div className="border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center">
            <label className="text-[10px] font-medium text-gray-400">Buscar plan de asignatura</label>
            <div className="flex items-center gap-2 mt-0.5">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={busquedaPlanAsignatura}
                onChange={(e) => setBusquedaPlanAsignatura(e.target.value)}
                placeholder="Plan de asignatura"
                className="w-full text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Facultad */}
          <div className="border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center">
            <label className="text-[10px] font-medium text-gray-400">Facultad</label>
            <select
              value={facultadFiltro}
              onChange={(e) => setFacultadFiltro(e.target.value)}
              className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none cursor-pointer"
            >
              <option value="Todas las facultades">Todas las facultades</option>
              <option value="Ingeniería y Tecnología">Ingeniería y Tecnología</option>
              <option value="Ciencias Económicas">Ciencias Económicas</option>
              <option value="Jurisprudencia y Ciencias Sociales">Jurisprudencia y Ciencias Sociales</option>
            </select>
          </div>
        </div>

        {/* Tabla de Registros */}
        <div className="overflow-x-auto border border-gray-200/80 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F3F4F8] text-gray-500 text-[11px] font-semibold border-b border-gray-200/80">
                <th className="py-3.5 px-5">Usuario</th>
                <th className="py-3.5 px-4">Cambio</th>
                <th className="py-3.5 px-4">Detalle</th>
                <th className="py-3.5 px-4">Tipo de cambio</th>
                <th className="py-3.5 px-5">Fecha y hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {registrosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No se encontraron registros de cambios.
                  </td>
                </tr>
              ) : (
                registrosFiltrados.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-4 px-5">
                      <p className="font-bold text-gray-900">{item.usuarioNombre}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{item.usuarioRol}</p>
                    </td>
                    <td className="py-4 px-4 text-gray-800 font-medium">{item.cambio}</td>
                    <td className="py-4 px-4 text-gray-600">{item.detalle}</td>
                    <td className="py-4 px-4 text-gray-700 font-medium">{item.tipoCambio}</td>
                    <td className="py-4 px-5 text-gray-600 font-mono text-[11px]">{item.fechaHora}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pie de Tabla / Paginación */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <p className="text-xs text-gray-400">
            Mostrando {registrosFiltrados.length} de {registros.length} registros
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled
              className="px-3.5 py-2 rounded-lg bg-gray-200/80 text-gray-400 text-xs font-medium cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              type="button"
              className="w-8 h-8 rounded-lg bg-[#050758] text-white text-xs font-bold flex items-center justify-center"
            >
              1
            </button>
            <button
              type="button"
              disabled
              className="px-3.5 py-2 rounded-lg bg-gray-200/80 text-gray-400 text-xs font-medium cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};