import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CheckCircle2, Save, Info, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { asignacionesApi } from '../../services/asignacionesApi';

export interface DocenteItem {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  facultad: string;
}

export interface PlanItem {
  id: string;
  codigo: string;
  nombre: string;
  facultad: string;
}

export interface AsignaturaItem {
  id: string;
  codigo: string;
  nombre: string;
  facultad: string;
}

export const CrearAsignacion: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const rolActual = (user?.rol as string) || '';
  const esSuperUsuario = rolActual === 'SUPER_USUARIO';
  const esAdministrador = rolActual === 'ADMINISTRADOR';

  // Filtro institucional de facultad para el superusuario
  const [facultadSeleccionadaGlobal, setFacultadSeleccionadaGlobal] = useState<string>('Todas');
  const [facultadesListado, setFacultadesListado] = useState<string[]>([]);
  const [docentesDisponibles, setDocentesDisponibles] = useState<DocenteItem[]>([]);
  const [planesDisponibles, setPlanesDisponibles] = useState<PlanItem[]>([]);
  const [asignaturasDisponibles, setAsignaturasDisponibles] = useState<AsignaturaItem[]>([]);
  const [errorFacultades, setErrorFacultades] = useState('');

  useEffect(() => {
    if (!user || (!esSuperUsuario && !esAdministrador)) {
      return;
    }

    let vigente = true;
    asignacionesApi.obtenerOpciones()
      .then((opciones) => {
        if (vigente) {
          setErrorFacultades('');
          const nombres = opciones.facultades.map((facultad) => facultad.nombreFacultad);
          setFacultadesListado(nombres);
          setFacultadSeleccionadaGlobal((actual) =>
            actual === 'Todas' || nombres.includes(actual) ? actual : 'Todas',
          );
          setDocentesDisponibles(opciones.usuarios.map((usuario) => {
            const partesNombre = usuario.nombreCompleto.trim().split(/\s+/);
            const nombre = partesNombre.shift() ?? '';
            return {
              id: String(usuario.idUsuario),
              nombre,
              apellido: partesNombre.join(' '),
              email: usuario.correo,
              facultad: usuario.nombreFacultad,
            };
          }));
          setPlanesDisponibles(opciones.planes.map((plan) => ({
            id: String(plan.idPlan),
            codigo: `${plan.cicloInicio}-${plan.cicloFin}`,
            nombre: plan.nombreCarrera,
            facultad: plan.nombreFacultad,
          })));
          setAsignaturasDisponibles(opciones.asignaturas.map((asignatura) => ({
            id: String(asignatura.idAsignatura),
            codigo: asignatura.codigoAsignatura,
            nombre: asignatura.nombreAsignatura,
            facultad: asignatura.nombreFacultad,
          })));
        }
      })
      .catch((error: unknown) => {
        if (vigente) {
          setErrorFacultades(error instanceof Error ? error.message : 'No se pudieron cargar las facultades.');
        }
      });
    return () => { vigente = false; };
  }, [esSuperUsuario, esAdministrador, user]);

  // 1. FACULTAD Y DOCENTES
  const [busquedaDocente, setBusquedaDocente] = useState('');
  const [docenteSeleccionTemporal, setDocenteSeleccionTemporal] = useState('');
  const [docentesSeleccionados, setDocentesSeleccionados] = useState<DocenteItem[]>([]);

  // 2. PLANES DE ESTUDIO
  const [busquedaPlan, setBusquedaPlan] = useState('');
  const [planSeleccionTemporal, setPlanSeleccionTemporal] = useState('');
  const [planesSeleccionados, setPlanesSeleccionados] = useState<PlanItem[]>([]);

  // 3. ASIGNATURAS
  const [busquedaAsignatura, setBusquedaAsignatura] = useState('');
  const [asignaturaSeleccionTemporal, setAsignaturaSeleccionTemporal] = useState('');
  const [asignaturasSeleccionadas, setAsignaturasSeleccionadas] = useState<AsignaturaItem[]>([]);

  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState('');

  const facultadUsuario = user?.facultadNombre || 'Ingeniería y Tecnología';

  // --- FILTRADOS POR ROL Y FACULTAD ---
  const docentesFiltrados = docentesDisponibles
    .filter((docente) => facultadesListado.includes(docente.facultad))
    .filter(d => {
      if (esSuperUsuario) {
        return facultadSeleccionadaGlobal === 'Todas' || d.facultad === facultadSeleccionadaGlobal;
      }
      return d.facultad === facultadUsuario;
    })
    .filter(d => !docentesSeleccionados.some(sel => sel.id === d.id))
    .filter(d =>
      d.nombre.toLowerCase().includes(busquedaDocente.toLowerCase()) ||
      d.apellido.toLowerCase().includes(busquedaDocente.toLowerCase()) ||
      d.email.toLowerCase().includes(busquedaDocente.toLowerCase())
    );

  const planesFiltrados = planesDisponibles
    .filter((plan) => facultadesListado.includes(plan.facultad))
    .filter(p => {
      if (esSuperUsuario) {
        return facultadSeleccionadaGlobal === 'Todas' || p.facultad === facultadSeleccionadaGlobal;
      }
      return p.facultad === facultadUsuario;
    })
    .filter(p => !planesSeleccionados.some(sel => sel.id === p.id))
    .filter(p =>
      p.nombre.toLowerCase().includes(busquedaPlan.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busquedaPlan.toLowerCase())
    );

  const asignaturasFiltradas = asignaturasDisponibles
    .filter((asignatura) => facultadesListado.includes(asignatura.facultad))
    .filter(a => {
      if (esSuperUsuario) {
        return facultadSeleccionadaGlobal === 'Todas' || a.facultad === facultadSeleccionadaGlobal;
      }
      return a.facultad === facultadUsuario;
    })
    .filter(a => !asignaturasSeleccionadas.some(sel => sel.id === a.id))
    .filter(a =>
      a.nombre.toLowerCase().includes(busquedaAsignatura.toLowerCase()) ||
      a.codigo.toLowerCase().includes(busquedaAsignatura.toLowerCase())
    );

  // --- MANEJADORES DE SELECCIÓN ---
  const handleSeleccionarDocente = () => {
    if (!docenteSeleccionTemporal) return;
    const doc = docentesDisponibles.find(d => d.id === docenteSeleccionTemporal);
    if (doc) {
      setDocentesSeleccionados([...docentesSeleccionados, doc]);
      setDocenteSeleccionTemporal('');
      setBusquedaDocente('');
    }
  };

  const handleEliminarDocente = (id: string) => {
    setDocentesSeleccionados(docentesSeleccionados.filter(d => d.id !== id));
  };

  const handleSeleccionarPlan = () => {
    if (!planSeleccionTemporal) return;
    const plan = planesDisponibles.find(p => p.id === planSeleccionTemporal);
    if (plan) {
      setPlanesSeleccionados([...planesSeleccionados, plan]);
      setPlanSeleccionTemporal('');
      setBusquedaPlan('');
    }
  };

  const handleEliminarPlan = (id: string) => {
    setPlanesSeleccionados(planesSeleccionados.filter(p => p.id !== id));
  };

  const handleSeleccionarAsignatura = () => {
    if (!asignaturaSeleccionTemporal) return;
    const asig = asignaturasDisponibles.find(a => a.id === asignaturaSeleccionTemporal);
    if (asig) {
      setAsignaturasSeleccionadas([...asignaturasSeleccionadas, asig]);
      setAsignaturaSeleccionTemporal('');
      setBusquedaAsignatura('');
    }
  };

  const handleEliminarAsignatura = (id: string) => {
    setAsignaturasSeleccionadas(asignaturasSeleccionadas.filter(a => a.id !== id));
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorGuardado('');
    setGuardadoExitoso(false);
    if (docentesSeleccionados.length === 0
      || (planesSeleccionados.length === 0 && asignaturasSeleccionadas.length === 0)) {
      setErrorGuardado('Selecciona al menos un usuario y un plan o una asignatura.');
      return;
    }

    setGuardando(true);
    try {
      await asignacionesApi.crear({
        idsUsuarios: docentesSeleccionados.map((docente) => Number(docente.id)),
        idsPlanes: planesSeleccionados.map((plan) => Number(plan.id)),
        idsAsignaturas: asignaturasSeleccionadas.map((asignatura) => Number(asignatura.id)),
      });
      setGuardadoExitoso(true);
      setTimeout(() => setGuardadoExitoso(false), 4000);
    } catch (error) {
      setErrorGuardado(error instanceof Error ? error.message : 'No se pudieron guardar las asignaciones.');
    } finally {
      setGuardando(false);
    }
  };

  const botonDocenteHabilitado = docenteSeleccionTemporal !== '';
  const botonPlanHabilitado = planSeleccionTemporal !== '';
  const botonAsignaturaHabilitado = asignaturaSeleccionTemporal !== '';

  const prevenirEnter = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
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
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      
      {/* ENCABEZADO DE LA VISTA */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
            Crear asignaciones de planes y asignaturas
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            {esSuperUsuario
              ? `Superusuario · Gestión global de asignaciones para todas las facultades de la institución.`
              : `${facultadUsuario} · Asigna planes y asignaturas a usuarios estándar de tu facultad.`}
          </p>
        </div>

        {/* SELECTOR GLOBAL DE FACULTAD (SIN ÍCONO) */}
        {esSuperUsuario && (
          <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 flex flex-col justify-center shadow-xs">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
              Filtrar facultad institucional
            </label>
            <select
              value={facultadSeleccionadaGlobal}
              onChange={(e) => {
                setFacultadSeleccionadaGlobal(e.target.value);
                setDocenteSeleccionTemporal('');
                setPlanSeleccionTemporal('');
                setAsignaturaSeleccionTemporal('');
              }}
              className="text-xs font-bold text-[#050758] bg-transparent mt-0.5 focus:outline-none cursor-pointer"
            >
              <option value="Todas">Todas las facultades (Global)</option>
              {facultadesListado.map((fac) => (
                <option key={fac} value={fac}>
                  Facultad de {fac}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {errorFacultades && <p role="alert" className="text-xs font-semibold text-red-600">{errorFacultades}</p>}

      <form onSubmit={handleGuardar} className="space-y-6">
        
        {/* SECCIÓN 1: USUARIO DESTINATARIO (DOCENTES) */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Usuarios destinatarios (Docentes)</h3>
            <p className="text-xs text-gray-500 mt-0.5">Busca por nombre o apellido, selecciona del listado y añade uno o varios usuarios.</p>
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
                <option value="">-- Selecciona un docente --</option>
                {docentesFiltrados.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.nombre} {doc.apellido} ({doc.facultad})
                  </option>
                ))}
              </select>
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
                Seleccionar
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 space-y-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Docentes seleccionados ({docentesSeleccionados.length})
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
                <p className="text-xs text-gray-400 italic">Ningún docente seleccionado todavía.</p>
              )}
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: PLANES DE ESTUDIO Y ASIGNATURAS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Columna Planes de Estudio */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900">Planes de estudio</h3>
              
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">Buscar por nombre o código</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Ej. ISI-2027, Sistemas..."
                    value={busquedaPlan}
                    onChange={(e) => setBusquedaPlan(e.target.value)}
                    onKeyDown={prevenirEnter}
                    className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl pl-10 pr-4 py-3 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700">Seleccionar plan</label>
                  <select
                    value={planSeleccionTemporal}
                    onChange={(e) => setPlanSeleccionTemporal(e.target.value)}
                    className="w-full bg-white border border-gray-300 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition cursor-pointer"
                  >
                    <option value="">-- Seleccionar plan --</option>
                    {planesFiltrados.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.codigo} · {plan.nombre} ({plan.facultad})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleSeleccionarPlan}
                  disabled={!botonPlanHabilitado}
                  className={`text-xs font-bold px-4 py-3 rounded-xl shadow-sm transition ${
                    botonPlanHabilitado
                      ? 'bg-[#050758] hover:bg-[#090c7a] text-white cursor-pointer'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Seleccionar
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Planes seleccionados ({planesSeleccionados.length})
              </span>
              <div className="space-y-2">
                {planesSeleccionados.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between bg-[#050758]/5 border border-[#050758]/20 px-3 py-2 rounded-xl text-xs font-medium text-[#050758]"
                  >
                    <span>{plan.codigo} · {plan.nombre}</span>
                    <button
                      type="button"
                      onClick={() => handleEliminarPlan(plan.id)}
                      className="text-gray-400 hover:text-red-600 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {planesSeleccionados.length === 0 && (
                  <p className="text-xs text-gray-400 italic">Ningún plan seleccionado.</p>
                )}
              </div>
            </div>
          </div>

          {/* Columna Asignaturas */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900">Asignaturas</h3>
              
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">Buscar por nombre o código</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Ej. PRG101, Programación..."
                    value={busquedaAsignatura}
                    onChange={(e) => setBusquedaAsignatura(e.target.value)}
                    onKeyDown={prevenirEnter}
                    className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl pl-10 pr-4 py-3 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1.5">
                  <label className="block text-xs font-bold text-gray-700">Seleccionar asignatura</label>
                  <select
                    value={asignaturaSeleccionTemporal}
                    onChange={(e) => setAsignaturaSeleccionTemporal(e.target.value)}
                    className="w-full bg-white border border-gray-300 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition cursor-pointer"
                  >
                    <option value="">-- Seleccionar asignatura --</option>
                    {asignaturasFiltradas.map((asig) => (
                      <option key={asig.id} value={asig.id}>
                        {asig.codigo} · {asig.nombre} ({asig.facultad})
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleSeleccionarAsignatura}
                  disabled={!botonAsignaturaHabilitado}
                  className={`text-xs font-bold px-4 py-3 rounded-xl shadow-sm transition ${
                    botonAsignaturaHabilitado
                      ? 'bg-[#050758] hover:bg-[#090c7a] text-white cursor-pointer'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Seleccionar
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 space-y-2">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                Asignaturas seleccionadas ({asignaturasSeleccionadas.length})
              </span>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {asignaturasSeleccionadas.map((asig) => (
                  <div
                    key={asig.id}
                    className="flex items-center justify-between bg-[#050758]/5 border border-[#050758]/20 px-3 py-2 rounded-xl text-xs font-medium text-[#050758]"
                  >
                    <span>{asig.codigo} · {asig.nombre}</span>
                    <button
                      type="button"
                      onClick={() => handleEliminarAsignatura(asig.id)}
                      className="text-gray-400 hover:text-red-600 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {asignaturasSeleccionadas.length === 0 && (
                  <p className="text-xs text-gray-400 italic">Ninguna asignatura seleccionada.</p>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* SECCIÓN 3: RESUMEN DE ASIGNACIÓN */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Resumen de asignación</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#050758] bg-[#050758]/10 px-3 py-1 rounded-full">
                {docentesSeleccionados.length} docentes
              </span>
              <ul className="text-xs text-gray-600 space-y-1 pl-1">
                {docentesSeleccionados.map(d => (
                  <li key={d.id}>• {d.nombre} {d.apellido}</li>
                ))}
                {docentesSeleccionados.length === 0 && <li className="text-gray-400 italic">Ningún docente</li>}
              </ul>
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#050758] bg-[#050758]/10 px-3 py-1 rounded-full">
                {planesSeleccionados.length} planes
              </span>
              <ul className="text-xs text-gray-600 space-y-1 pl-1">
                {planesSeleccionados.map(p => (
                  <li key={p.id}>• {p.nombre}</li>
                ))}
                {planesSeleccionados.length === 0 && <li className="text-gray-400 italic">Ningún plan</li>}
              </ul>
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#050758] bg-[#050758]/10 px-3 py-1 rounded-full">
                {asignaturasSeleccionadas.length} asignaturas
              </span>
              <ul className="text-xs text-gray-600 space-y-1 pl-1">
                {asignaturasSeleccionadas.map(a => (
                  <li key={a.id}>• {a.nombre}</li>
                ))}
                {asignaturasSeleccionadas.length === 0 && <li className="text-gray-400 italic">Ninguna asignatura</li>}
              </ul>
            </div>
          </div>

          <div className="bg-[#050758]/5 border border-[#050758]/15 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-[#050758] shrink-0 mt-0.5" />
            <p className="text-xs text-[#050758] font-medium leading-relaxed">
              Los docentes seleccionados tendrán permisos de edición sobre los planes y asignaturas indicados. El resto del catálogo permanecerá en solo lectura.
            </p>
          </div>

          {guardadoExitoso && (
            <div className="bg-[#8CB83C]/20 border border-[#8CB83C]/60 text-[#2D5A1E] rounded-xl px-4 py-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#4C8C23]" />
              <p className="text-xs font-bold">¡Asignaciones guardadas con éxito! Puedes seguir editando o salir cuando desees.</p>
            </div>
          )}
          {errorGuardado && <p role="alert" className="text-xs font-semibold text-red-600">{errorGuardado}</p>}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/app/operations/assign')}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold px-5 py-3 rounded-xl shadow-sm transition cursor-pointer"
            >
              Salir
            </button>

            <button
              type="submit"
              disabled={guardando}
              className="inline-flex items-center gap-2 bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-sm transition cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {guardando ? 'Guardando...' : 'Guardar asignaciones'}
            </button>
          </div>

        </div>

      </form>
    </div>
  );
};