import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowUpRight, ShieldCheck, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface PlanEstudio {
  id: string;
  nombre: string;
  codigo: string;
  version: string;
  facultad: string;
  coordinacion: string;
  porcentaje: number;
  seccionesCompletas: number;
  seccionesTotal: number;
  estado: 'Borrador' | 'En Revisión' | 'Aprobado';
  asignaturasVinculadas: number;
}

export const Planes: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [planes, setPlanes] = useState<PlanEstudio[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [busqueda, setBusqueda] = useState('');
  const [facultadFiltro, setFacultadFiltro] = useState('Todas');
  const [estadoFiltro, setEstadoFiltro] = useState('Todos');

  useEffect(() => {
    if (!user) return;
    if (user.facultadNombre) {
      setFacultadFiltro(user.facultadNombre);
    }

    const obtenerPlanes = async () => {
      try {
        setCargando(true);
        const respuesta = await fetch(`http://localhost:5000/api/planes?usuarioId=${user.id}`);
        if (respuesta.ok) {
          const datos: PlanEstudio[] = await respuesta.json();
          setPlanes(datos);
        }
      } catch (error) {
        console.error('Error al cargar los planes de estudio:', error);
      } finally {
        setCargando(false);
      }
    };

    obtenerPlanes();
  }, [user]);

  const planesFiltrados = useMemo(() => {
    return planes.filter((plan) => {
      const coincideTexto =
        plan.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        plan.codigo.toLowerCase().includes(busqueda.toLowerCase());

      const coincideFacultad =
        facultadFiltro === 'Todas' || plan.facultad === facultadFiltro;

      const coincideEstado =
        estadoFiltro === 'Todos' || plan.estado === estadoFiltro;

      return coincideTexto && coincideFacultad && coincideEstado;
    });
  }, [planes, busqueda, facultadFiltro, estadoFiltro]);

  if (!user) return null;

  const planPrincipal = planes[0];

  const obtenerEncabezado = () => {
    if (user.rol === 'USUARIO') {
      return {
        titulo: 'Mis Planes Asignados',
        subtitulo: `${user.facultadNombre ?? ''} · Acceso de edición únicamente a los planes que te han asignado.`,
      };
    }
    if (user.rol === 'ADMINISTRADOR') {
      return {
        rutaMiga: 'A · ADMINISTRADOR DE FACULTAD / GESTIÓN',
        titulo: 'Planes de Estudio de Facultad',
        subtitulo: `${user.facultadNombre ?? ''} · Administración integral de planes, asignaciones y revisiones.`,
      };
    }
    return {
      rutaMiga: 'S · SUPERUSUARIO / ADMINISTRACIÓN GLOBAL',
      titulo: 'Todos los Planes de Estudio',
      subtitulo: 'Acceso global a todas las facultades, configuraciones y expedientes curriculares.',
    };
  };

  const encabezado = obtenerEncabezado();

  const renderizarEstado = (estado: PlanEstudio['estado']) => {
    if (estado === 'Borrador') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <span className="w-2 h-2 rounded-full bg-gray-400" />
          Borrador
        </span>
      );
    }
    if (estado === 'En Revisión') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs text-amber-800 font-medium">
          <span className="w-2 h-2 rounded-full bg-amber-600" />
          En Revisión
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
        <span className="w-2 h-2 rounded-full bg-emerald-600" />
        Aprobado
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Encabezado de Página */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#050758] mb-1">
            {encabezado.rutaMiga}
          </p>
          <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
            {encabezado.titulo}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{encabezado.subtitulo}</p>
        </div>

        {user.rol !== 'USUARIO' && (
          <button
            type="button"
            onClick={() => navigate('/planes/nuevo')}
            className="inline-flex items-center gap-2 bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Crear nuevo plan
          </button>
        )}
      </div>

      {/* 3 Tarjetas Indicadoras */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-3xl font-extrabold text-[#050758]">
            {planes.length}
          </p>
          <p className="text-sm font-bold text-gray-800 mt-2">
            {user.rol === 'USUARIO' ? 'Planes asignados' : 'Planes registrados'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {user.facultadNombre || 'Todas las facultades'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-3xl font-extrabold text-[#050758]">
            {planPrincipal ? `${planPrincipal.porcentaje}%` : '0%'}
          </p>
          <p className="text-sm font-bold text-gray-800 mt-2">
            Avance de {planPrincipal ? planPrincipal.codigo : '—'}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {planPrincipal
              ? `${planPrincipal.seccionesCompletas} de ${planPrincipal.seccionesTotal} secciones completas`
              : 'Sin secciones registradas'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-3xl font-extrabold text-[#050758]">
            {planPrincipal ? planPrincipal.asignaturasVinculadas : 0}
          </p>
          <p className="text-sm font-bold text-gray-800 mt-2">
            Asignaturas vinculadas
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {planPrincipal ? `Plan de ${planPrincipal.nombre}` : 'Sin plan seleccionado'}
          </p>
        </div>
      </div>

      {/* Tarjeta Principal de Tabla y Filtros */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Planes de estudio</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Consulta la información, revisa el avance y accede al expediente curricular.
          </p>
        </div>

        {/* Barra de Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center">
            <label className="text-[10px] font-medium text-gray-400">Buscar</label>
            <div className="flex items-center gap-2 mt-0.5">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Nombre o código del plan"
                className="w-full text-xs text-gray-800 placeholder-gray-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="md:col-span-3 border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center">
            <label className="text-[10px] font-medium text-gray-400">Facultad</label>
            <select
              value={facultadFiltro}
              onChange={(e) => setFacultadFiltro(e.target.value)}
              disabled={user.rol !== 'SUPER_USUARIO'}
              className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none disabled:opacity-90"
            >
              {user.rol === 'SUPER_USUARIO' && <option value="Todas">Todas las facultades</option>}
              {user.facultadNombre && (
                <option value={user.facultadNombre}>{user.facultadNombre}</option>
              )}
            </select>
          </div>

          <div className="md:col-span-3 border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center">
            <label className="text-[10px] font-medium text-gray-400">Estado</label>
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none cursor-pointer"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Borrador">Borrador</option>
              <option value="En Revisión">En Revisión</option>
              <option value="Aprobado">Aprobado</option>
            </select>
          </div>
        </div>

        {/* Tabla de Planes */}
        <div className="overflow-x-auto border border-gray-200/80 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F3F4F8] text-gray-500 text-[11px] font-semibold border-b border-gray-200/80">
                <th className="py-3.5 px-5">Plan de estudio</th>
                <th className="py-3.5 px-4">Coordinación</th>
                <th className="py-3.5 px-4">Completitud</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-5">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {cargando ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    Cargando planes de estudio...
                  </td>
                </tr>
              ) : planesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No hay planes de estudio disponibles para mostrar.
                  </td>
                </tr>
              ) : (
                planesFiltrados.map((plan) => (
                  <tr key={plan.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-4 px-5">
                      <p className="font-bold text-gray-900">{plan.nombre}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {plan.codigo} · {plan.version}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{plan.coordinacion}</td>
                    <td className="py-4 px-4 text-gray-700 font-medium">
                      {plan.porcentaje}% · {plan.seccionesCompletas}/{plan.seccionesTotal}
                    </td>
                    <td className="py-4 px-4">{renderizarEstado(plan.estado)}</td>
                    <td className="py-4 px-5">
                      <button
                        type="button"
                        onClick={() => navigate(`/planes/${plan.id}`)}
                        className="inline-flex items-center gap-1 text-[#050758] hover:underline font-semibold cursor-pointer"
                      >
                        <span>Abrir plan</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pie de Tabla / Paginación */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <p className="text-xs text-gray-400">
            Mostrando {planesFiltrados.length} de {planes.length} registros
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

      {/* Nota Informativa Inferior */}
      {user.rol === 'USUARIO' && (
        <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
          <ShieldCheck className="w-4 h-4 text-gray-400 shrink-0" />
          <p>
            Tu espacio muestra solo asignaciones vigentes. La creación de planes y asignaturas está reservada a Administración.
          </p>
        </div>
      )}
    </div>
  );
};