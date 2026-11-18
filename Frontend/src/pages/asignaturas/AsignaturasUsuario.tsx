import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Info, ArrowUpRight, Plus, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface AsignaturaPrograma {
  id: string;
  nombre: string;
  codigo: string;
  ciclo: string;
  unidadesValorativas: number;
  responsable: string;
  facultad: string;
  asignadoAUsuarioId?: string;
  seccionesCompletas: number;
  seccionesTotal: number;
}

export const AsignaturasUsuario: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [asignaturas, setAsignaturas] = useState<AsignaturaPrograma[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [busqueda, setBusqueda] = useState('');
  const [cicloFiltro, setCicloFiltro] = useState('Todos');
  const [facultadFiltro, setFacultadFiltro] = useState('Todas');

  const rolActual = (user?.rol as string) || '';

  useEffect(() => {
    if (!user) return;
    if (rolActual !== 'SUPER_USUARIO' && user.facultadNombre) {
      setFacultadFiltro(user.facultadNombre);
    }

    const obtenerAsignaturas = async () => {
      try {
        setCargando(true);
        const endpoint = `http://localhost:5000/api/asignaturas`;
        const respuesta = await fetch(endpoint);
        
        if (respuesta.ok) {
          const datos: AsignaturaPrograma[] = await respuesta.json();
          setAsignaturas(datos);
        } else {
          throw new Error('Error al conectar con el servidor');
        }
      } catch (error) {
        const datosMock: AsignaturaPrograma[] = [
          {
            id: 'asig-01',
            nombre: 'Programación I',
            codigo: 'PRG101',
            ciclo: 'Ciclo I',
            unidadesValorativas: 4,
            responsable: 'Lucía Méndez',
            facultad: 'Ingeniería y Tecnología',
            asignadoAUsuarioId: user.id,
            seccionesCompletas: 4,
            seccionesTotal: 4,
          },
          {
            id: 'asig-02',
            nombre: 'Fundamentos de Informática',
            codigo: 'FIN102',
            ciclo: 'Ciclo I',
            unidadesValorativas: 3,
            responsable: 'Carlos Ruiz',
            facultad: 'Ingeniería y Tecnología',
            asignadoAUsuarioId: 'otro-id-docente',
            seccionesCompletas: 2,
            seccionesTotal: 4,
          },
          {
            id: 'asig-03',
            nombre: 'Base de Datos I',
            codigo: 'BDV201',
            ciclo: 'Ciclo III',
            unidadesValorativas: 4,
            responsable: 'Eyleen Salinas',
            facultad: 'Ingeniería y Tecnología',
            asignadoAUsuarioId: user.id,
            seccionesCompletas: 3,
            seccionesTotal: 3,
          },
          {
            id: 'asig-04',
            nombre: 'Contabilidad General',
            codigo: 'CGA101',
            ciclo: 'Ciclo I',
            unidadesValorativas: 4,
            responsable: 'Ana Martínez',
            facultad: 'Ciencias Económicas',
            asignadoAUsuarioId: 'otro-id-docente',
            seccionesCompletas: 4,
            seccionesTotal: 4,
          },
        ];
        setAsignaturas(datosMock);
      } finally {
        setCargando(false);
      }
    };

    obtenerAsignaturas();
  }, [user, rolActual]);

  const facultadesDisponibles = useMemo(() => {
    return Array.from(new Set(asignaturas.map((a) => a.facultad)));
  }, [asignaturas]);

  const asignaturasFiltradas = useMemo(() => {
    const facultadUsuario = user?.facultadNombre || 'Ingeniería y Tecnología';

    return asignaturas.filter((item) => {
      const coincideTexto =
        item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        item.codigo.toLowerCase().includes(busqueda.toLowerCase());

      const coincideCiclo =
        cicloFiltro === 'Todos' || item.ciclo === cicloFiltro;

      let coincidePermisoYAlcance = true;

      if (rolActual === 'SUPER_USUARIO') {
        coincidePermisoYAlcance = facultadFiltro === 'Todas' || item.facultad === facultadFiltro;
      } else if (rolActual === 'ADMINISTRADOR') {
        coincidePermisoYAlcance = item.facultad === facultadUsuario;
      } else {
        coincidePermisoYAlcance =
          item.facultad === facultadUsuario && item.asignadoAUsuarioId === user?.id;
      }

      return coincideTexto && coincideCiclo && coincidePermisoYAlcance;
    });
  }, [asignaturas, busqueda, cicloFiltro, facultadFiltro, user, rolActual]);

  if (!user) return null;

  const asignaturaPrincipal = asignaturasFiltradas[0];

  const ciclosDisponibles = useMemo(() => {
    return Array.from(new Set(asignaturas.map((a) => a.ciclo)));
  }, [asignaturas]);

  const obtenerEncabezado = () => {
    if (rolActual === 'USUARIO_ESTANDAR' || rolActual === 'USUARIO') {
      return {
        titulo: 'Mis Asignaturas Asignadas',
        subtitulo: `${user.facultadNombre ?? ''} · Listado exclusivo de programas bajo tu responsabilidad con permisos de edición.`,
      };
    }
    if (rolActual === 'ADMINISTRADOR') {
      return {
        titulo: 'Asignaturas de Facultad',
        subtitulo: `${user.facultadNombre ?? ''} · Administración integral, consulta y edición de todos los programas de la facultad.`,
      };
    }
    return {
      titulo: 'Todas las Asignaturas del Sistema',
      subtitulo: 'Acceso global a catálogos, programas y edición de asignaturas de todas las facultades.',
    };
  };

  const encabezado = obtenerEncabezado();

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
            onClick={() => navigate('/asignaturas/nuevo')}
            className="inline-flex items-center gap-2 bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Crear nueva asignatura
          </button>
        )}
      </div>

      {/* Banner Informativo Superior */}
      <div className="bg-[#F2F4FB] border border-[#050758]/10 rounded-xl px-4 py-3.5 flex items-center gap-3">
        <Info className="w-4 h-4 text-[#050758] shrink-0" />
        <p className="text-xs font-semibold text-[#050758]">
          {rolActual === 'USUARIO_ESTANDAR' || rolActual === 'USUARIO'
            ? `Se muestran únicamente las ${asignaturasFiltradas.length} asignaturas que te han sido asignadas en tu facultad.`
            : `Visualizando catálogo completo con permisos de edición habilitados.`}
        </p>
      </div>

      {/* 3 Tarjetas Indicadoras */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-3xl font-extrabold text-[#050758]">
            {asignaturasFiltradas.length}
          </p>
          <p className="text-xs font-bold text-gray-800 mt-3">
            {rolActual === 'USUARIO_ESTANDAR' || rolActual === 'USUARIO' ? 'Asignaturas a tu cargo' : 'Asignaturas registradas'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-3xl font-extrabold text-[#050758]">
            {facultadFiltro === 'Todas' ? facultadesDisponibles.length : 1}
          </p>
          <p className="text-xs font-bold text-gray-800 mt-3">
            {facultadFiltro === 'Todas' ? 'Facultades en sistema' : `Facultad de ${facultadFiltro}`}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <p className="text-3xl font-extrabold text-[#050758]">
            {asignaturaPrincipal
              ? `${asignaturaPrincipal.seccionesCompletas}/${asignaturaPrincipal.seccionesTotal}`
              : '0/0'}
          </p>
          <p className="text-xs font-bold text-gray-800 mt-3">
            {asignaturaPrincipal
              ? `Secciones de ${asignaturaPrincipal.nombre}`
              : 'Secciones de asignatura'}
          </p>
        </div>
      </div>

      {/* Tarjeta Principal de Tabla y Filtros */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {rolActual === 'USUARIO_ESTANDAR' || rolActual === 'USUARIO' ? 'Mis programas asignados' : 'Catálogo de asignaturas'}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Datos académicos, responsables y acceso directo a la edición de programas.
          </p>
        </div>

        {/* Barra de Filtros con selector de facultad para Superusuario */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center">
            <label className="text-[10px] font-medium text-gray-400">
              Buscar asignatura
            </label>
            <div className="flex items-center gap-2 mt-0.5">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Nombre o código de la asignatura"
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
              {facultadesDisponibles.map((fac) => (
                <option key={fac} value={fac}>
                  {fac}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 border border-gray-200 rounded-xl px-3.5 py-2 flex flex-col justify-center">
            <label className="text-[10px] font-medium text-gray-400">Ciclo</label>
            <select
              value={cicloFiltro}
              onChange={(e) => setCicloFiltro(e.target.value)}
              className="w-full text-xs font-medium text-gray-800 bg-transparent mt-0.5 focus:outline-none cursor-pointer"
            >
              <option value="Todos">Todos los ciclos</option>
              {ciclosDisponibles.map((ciclo) => (
                <option key={ciclo} value={ciclo}>
                  {ciclo}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla de Asignaturas */}
        <div className="overflow-x-auto border border-gray-200/80 rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F3F4F8] text-gray-500 text-[11px] font-semibold border-b border-gray-200/80">
                <th className="py-3.5 px-5">Asignatura</th>
                <th className="py-3.5 px-4">Ciclo</th>
                <th className="py-3.5 px-4">Unidades</th>
                <th className="py-3.5 px-4">Responsable</th>
                <th className="py-3.5 px-4">Facultad</th>
                <th className="py-3.5 px-5">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {cargando ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    Cargando asignaturas...
                  </td>
                </tr>
              ) : asignaturasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No hay asignaturas disponibles para mostrar.
                  </td>
                </tr>
              ) : (
                asignaturasFiltradas.map((asig) => (
                  <tr key={asig.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-4 px-5">
                      <p className="font-bold text-gray-900">{asig.nombre}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{asig.codigo}</p>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{asig.ciclo}</td>
                    <td className="py-4 px-4 text-gray-600">
                      {asig.unidadesValorativas} UV
                    </td>
                    <td className="py-4 px-4 text-gray-600">{asig.responsable}</td>
                    <td className="py-4 px-4 text-gray-600">{asig.facultad}</td>
                    <td className="py-4 px-5">
                      <button
                        type="button"
                        onClick={() => navigate(`/asignaturas/${asig.id}`)}
                        className="inline-flex items-center gap-1 text-[#050758] hover:underline font-semibold cursor-pointer"
                      >
                        <span>Editar programa</span>
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
            Mostrando {asignaturasFiltradas.length} de {asignaturas.length} registros
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
      {(rolActual === 'USUARIO_ESTANDAR' || rolActual === 'USUARIO') && (
        <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
          <ShieldCheck className="w-4 h-4 text-gray-400 shrink-0" />
          <p>
            Tu espacio muestra únicamente las asignaturas que te han sido asignadas. La creación de nuevas asignaturas está reservada a Administración.
          </p>
        </div>
      )}
    </div>
  );
};