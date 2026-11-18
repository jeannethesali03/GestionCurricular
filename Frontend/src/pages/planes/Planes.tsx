import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShieldCheck, Plus, Edit3, RefreshCw, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface PlanEstudio {
  id: string;
  nombre: string;
  codigo: string;
  version: string;
  facultad: string;
  asignadoANombre?: string; // Nombre de la persona asignada (o vacío/undefined)
  asignadoAUsuarioId?: string; // ID para filtrar asignaciones del usuario normal
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

  // Estados para el Modal de cambio de estado
  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [planSeleccionado, setPlanSeleccionado] = useState<PlanEstudio | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState<'Borrador' | 'En Revisión' | 'Aprobado'>('Borrador');

  const rolActual = (user?.rol as string) || '';

  useEffect(() => {
    if (!user) return;
    if (rolActual !== 'SUPER_USUARIO' && user.facultadNombre) {
      setFacultadFiltro(user.facultadNombre);
    }

    // Inyección de planes mock con asignaciones variadas (algunos sin asignar)
    const obtenerPlanesMock = () => {
      try {
        setCargando(true);
        const planesInyectados: PlanEstudio[] = [
          {
            id: 'plan-01',
            nombre: 'Ingeniería en Desarrollo de Software',
            codigo: 'IDS-2026',
            version: 'v1.0',
            facultad: 'Ingeniería y Tecnología',
            asignadoANombre: 'Lucía Méndez',
            asignadoAUsuarioId: user.id, // Asignado al usuario actual
            porcentaje: 85,
            seccionesCompletas: 17,
            seccionesTotal: 20,
            estado: 'En Revisión',
            asignaturasVinculadas: 42,
          },
          {
            id: 'plan-02',
            nombre: 'Licenciatura en Administración de Empresas',
            codigo: 'LAE-2025',
            version: 'v2.1',
            facultad: 'Ciencias Económicas',
            asignadoANombre: 'Carlos Ruiz',
            asignadoAUsuarioId: 'otro-id',
            porcentaje: 100,
            seccionesCompletas: 20,
            seccionesTotal: 20,
            estado: 'Aprobado',
            asignaturasVinculadas: 38,
          },
          {
            id: 'plan-03',
            nombre: 'Ingeniería Industrial',
            codigo: 'IIN-2026',
            version: 'v1.0',
            facultad: 'Ingeniería y Tecnología',
            asignadoANombre: undefined, // Sin asignar (mostrará guion - y NO le aparecerá al usuario normal)
            asignadoAUsuarioId: undefined,
            porcentaje: 45,
            seccionesCompletas: 9,
            seccionesTotal: 20,
            estado: 'Borrador',
            asignaturasVinculadas: 35,
          },
          {
            id: 'plan-04',
            nombre: 'Licenciatura en Ciencias Jurídicas',
            codigo: 'DER-2025',
            version: 'v1.2',
            facultad: 'Jurisprudencia y Ciencias Sociales',
            asignadoANombre: 'María Elena Flores',
            asignadoAUsuarioId: 'otro-id',
            porcentaje: 90,
            seccionesCompletas: 18,
            seccionesTotal: 20,
            estado: 'En Revisión',
            asignaturasVinculadas: 50,
          },
          {
            id: 'plan-05',
            nombre: 'Técnico en Enfermería',
            codigo: 'ENF-2026',
            version: 'v1.0',
            facultad: 'Ciencias de la Salud',
            asignadoANombre: undefined, // Sin asignar (sin dueño)
            asignadoAUsuarioId: undefined,
            porcentaje: 20,
            seccionesCompletas: 4,
            seccionesTotal: 20,
            estado: 'Borrador',
            asignaturasVinculadas: 24,
          },
        ];
        setPlanes(planesInyectados);
      } catch (error) {
        console.error('Error al cargar los planes:', error);
      } finally {
        setCargando(false);
      }
    };

    obtenerPlanesMock();
  }, [user, rolActual]);

  const planesFiltrados = useMemo(() => {
    return planes.filter((plan) => {
      const coincideTexto =
        plan.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        plan.codigo.toLowerCase().includes(busqueda.toLowerCase());

      let coincideRolYFacultad = true;

      // 1. Usuario normal: Solo los planes que le han sido asignados explícitamente (ignora los que no tienen asignación)
      if (rolActual === 'USUARIO_ESTANDAR' || rolActual === 'USUARIO') {
        coincideRolYFacultad = Boolean(plan.asignadoAUsuarioId && plan.asignadoAUsuarioId === user?.id);
      } 
      // 2. Administrador: Todos los planes de su facultad (incluyendo los sin asignar)
      else if (rolActual === 'ADMINISTRADOR') {
        coincideRolYFacultad = plan.facultad === user?.facultadNombre;
      } 
      // 3. Superusuario: Todos los planes (respeta el filtro visual superior de facultad)
      else if (rolActual === 'SUPER_USUARIO') {
        coincideRolYFacultad = facultadFiltro === 'Todas' || plan.facultad === facultadFiltro;
      }

      const coincideEstado =
        estadoFiltro === 'Todos' || plan.estado === estadoFiltro;

      return coincideTexto && coincideRolYFacultad && coincideEstado;
    });
  }, [planes, busqueda, facultadFiltro, estadoFiltro, user, rolActual]);

  if (!user) return null;

  const planPrincipal = planesFiltrados[0];

  const obtenerEncabezado = () => {
    if (rolActual === 'USUARIO_ESTANDAR' || rolActual === 'USUARIO') {
      return {
        titulo: 'Mis Planes Asignados',
        subtitulo: `${user.facultadNombre ?? ''} · Acceso de edición únicamente a los planes que te han asignado.`,
      };
    }
    if (rolActual === 'ADMINISTRADOR') {
      return {
        titulo: 'Planes de Estudio de Facultad',
        subtitulo: `${user.facultadNombre ?? ''} · Administración integral de planes, asignaciones y revisiones.`,
      };
    }
    return {
      titulo: 'Todos los Planes de Estudio',
      subtitulo: 'Acceso global a todas las facultades, configuraciones y expedientes curriculares.',
    };
  };

  const encabezado = obtenerEncabezado();

  const abrirModalEstado = (plan: PlanEstudio) => {
    setPlanSeleccionado(plan);
    setNuevoEstado(plan.estado);
    setModalAbierto(true);
  };

  const guardarCambioEstado = async () => {
    if (!planSeleccionado) return;
    try {
      setPlanes(
        planes.map((p) => (p.id === planSeleccionado.id ? { ...p, estado: nuevoEstado } : p))
      );
      setModalAbierto(false);
      setPlanSeleccionado(null);
    } catch (error) {
      console.error('Error al actualizar el estado:', error);
    }
  };

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
          <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
            {encabezado.titulo}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{encabezado.subtitulo}</p>
        </div>

        {rolActual !== 'USUARIO_ESTANDAR' && rolActual !== 'USUARIO' && (
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
            {planesFiltrados.length}
          </p>
          <p className="text-sm font-bold text-gray-800 mt-2">
            {rolActual === 'USUARIO_ESTANDAR' || rolActual === 'USUARIO' ? 'Planes asignados' : 'Planes registrados'}
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
              disabled={rolActual !== 'SUPER_USUARIO'}
              className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none disabled:opacity-90 cursor-pointer"
            >
              {rolActual === 'SUPER_USUARIO' && <option value="Todas">Todas las facultades</option>}
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
                <th className="py-3.5 px-4">Asignación</th>
                <th className="py-3.5 px-4">Facultad</th>
                <th className="py-3.5 px-4">Completitud</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-5">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {cargando ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    Cargando planes de estudio...
                  </td>
                </tr>
              ) : planesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
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
                    <td className="py-4 px-4 font-medium text-gray-800">
                      {plan.asignadoANombre ? plan.asignadoANombre : <span className="text-gray-400">-</span>}
                    </td>
                    <td className="py-4 px-4 text-gray-600">{plan.facultad}</td>
                    <td className="py-4 px-4 text-gray-700 font-medium">
                      {plan.porcentaje}% · {plan.seccionesCompletas}/{plan.seccionesTotal}
                    </td>
                    <td className="py-4 px-4">{renderizarEstado(plan.estado)}</td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        {/* Editar contenido: Visible para TODOS */}
                        <button
                          type="button"
                          onClick={() => navigate(`/planes/${plan.id}`)}
                          title="Modificar contenido del plan"
                          className="inline-flex items-center gap-1 text-[#050758] hover:text-[#090c7a] font-semibold cursor-pointer p-1 rounded-lg hover:bg-gray-100 transition"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span className="text-[11px]">Editar</span>
                        </button>

                        {/* Cambiar estado: EXCLUSIVO para SUPER_USUARIO */}
                        {rolActual === 'SUPER_USUARIO' && (
                          <button
                            type="button"
                            onClick={() => abrirModalEstado(plan)}
                            title="Cambiar estado del plan"
                            className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 font-semibold cursor-pointer p-1 rounded-lg hover:bg-amber-50 transition"
                          >
                            <RefreshCw className="w-4 h-4" />
                            <span className="text-[11px]">Estado</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para cambiar estado del plan */}
      {modalAbierto && planSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#050758]">Cambiar Estado del Plan</h3>
                <p className="text-xs text-gray-500 mt-0.5">{planSeleccionado.nombre} ({planSeleccionado.codigo})</p>
              </div>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-700">Seleccione el nuevo estado:</label>
              <div className="grid grid-cols-1 gap-2">
                {(['Borrador', 'En Revisión', 'Aprobado'] as const).map((est) => (
                  <label
                    key={est}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                      nuevoEstado === est
                        ? 'border-[#050758] bg-[#050758]/5 font-bold text-[#050758]'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xs">{est}</span>
                    <input
                      type="radio"
                      name="estadoPlan"
                      checked={nuevoEstado === est}
                      onChange={() => setNuevoEstado(est)}
                      className="text-[#050758] focus:ring-[#050758]"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-100 cursor-pointer transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={guardarCambioEstado}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#050758] hover:bg-[#090c7a] shadow-sm cursor-pointer transition"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nota Informativa Inferior */}
      {(rolActual === 'USUARIO_ESTANDAR' || rolActual === 'USUARIO') && (
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