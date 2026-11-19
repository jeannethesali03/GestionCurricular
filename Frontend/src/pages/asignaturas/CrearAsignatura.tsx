import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { universidadApi } from '../../services/universidadApi';

export const CrearAsignatura: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const rolActual = (user?.rol as string) || '';
  const esSuperUsuario = rolActual === 'SUPER_USUARIO';
  const esAdministrador = rolActual === 'ADMINISTRADOR';

  // Estados del formulario para la nueva asignatura
  const [nombreAsignatura, setNombreAsignatura] = useState('');
  const [codigoAsignatura, setCodigoAsignatura] = useState('');
  const [prerrequisito, setPrerrequisito] = useState('PRG101 - Programación I');
  const [ciclo, setCiclo] = useState('VI');
  const [horasCiclo, setHorasCiclo] = useState('80');
  const [horasTeoricas, setHorasTeoricas] = useState('3');
  const [duracionSemanas, setDuracionSemanas] = useState('20');
  const [duracionClase, setDuracionClase] = useState('50 minutos');
  const [cantidadUV, setCantidadUV] = useState('4');
  const [planVinculado, setPlanVinculado] = useState('ISI-2027 · Ingeniería en Sistemas');

  // Solo el superusuario puede elegir facultad; el administrador tiene fija la suya por defecto
  const [facultadSeleccionada, setFacultadSeleccionada] = useState(
    user?.facultadNombre || 'Ingeniería y Tecnología'
  );

  const [facultadesDisponibles, setFacultadesDisponibles] = useState<string[]>([]);
  const [errorFacultades, setErrorFacultades] = useState('');

  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  useEffect(() => {
    if (!user || (!esSuperUsuario && !esAdministrador)) return;

    let vigente = true;
    universidadApi.listarFacultades()
      .then((facultades) => {
        if (!vigente) return;
        const nombres = facultades.map((facultad) => facultad.nombreFacultad);
        setFacultadesDisponibles(nombres);
        setFacultadSeleccionada((actual) =>
          actual && nombres.includes(actual) ? actual : nombres[0] ?? '',
        );
      })
      .catch((error: unknown) => {
        if (vigente) {
          setErrorFacultades(error instanceof Error ? error.message : 'No se pudieron cargar las facultades.');
        }
      });
    return () => { vigente = false; };
  }, [user, esSuperUsuario, esAdministrador]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGuardadoExitoso(true);
  };

  const facultadActual = esSuperUsuario ? facultadSeleccionada : (user?.facultadNombre || 'Ingeniería y Tecnología');

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Encabezado Superior */}
      <div>
        <h2 className="text-3xl font-bold text-[#050758] tracking-tight mt-0.5">
          Crear Nueva Asignatura
        </h2>
        <p className="text-xs text-gray-500 mt-1 font-medium">
          {esSuperUsuario
            ? 'Superusuario · Creación y asignación global de asignaturas.'
            : `${user.facultadNombre || 'Ingeniería y Tecnología'} · Completa los datos para incorporar un nuevo recurso académico.`}
        </p>
      </div>

      {/* Alerta Informativa Superior */}
      <div className="bg-[#050758]/5 border border-[#050758]/15 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-[#050758] shrink-0 mt-0.5" />
        <p className="text-xs text-[#050758] font-medium leading-relaxed">
          La asignatura se incorporará al catálogo de la facultad con 7 secciones de programa.
        </p>
      </div>

      {/* Estructura Principal de Dos Columnas */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Columna Izquierda: Formulario (8 columnas) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/80 p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Identificación de la asignatura</h3>
            <p className="text-xs text-gray-500 mt-0.5">Los campos marcados con * son obligatorios.</p>
          </div>

          <div className="space-y-5">
            {/* Nombre de la asignatura */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Nombre de la asignatura <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Introducción a la Inteligencia Artificial"
                value={nombreAsignatura}
                onChange={(e) => setNombreAsignatura(e.target.value)}
                className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium placeholder:text-gray-400 focus:outline-none transition"
              />
            </div>

            {/* Código de la asignatura y Facultad (Selector solo para superusuario, input fijo para admin) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Código de la asignatura <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. IAI302"
                  value={codigoAsignatura}
                  onChange={(e) => setCodigoAsignatura(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium placeholder:text-gray-400 focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Facultad <span className="text-red-500">*</span>
                </label>
                {esSuperUsuario ? (
                  <select
                    required
                    disabled={facultadesDisponibles.length === 0}
                    value={facultadSeleccionada}
                    onChange={(e) => setFacultadSeleccionada(e.target.value)}
                    className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition cursor-pointer"
                  >
                    <option value="" disabled>Selecciona una facultad</option>
                    {facultadesDisponibles.map((fac) => (
                      <option key={fac} value={fac}>{fac}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    disabled
                    value={user.facultadNombre || 'Ingeniería y Tecnología'}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs text-gray-500 font-medium cursor-not-allowed"
                  />
                )}
                {errorFacultades && (
                  <p role="alert" className="text-xs text-red-600">{errorFacultades}</p>
                )}
              </div>
            </div>

            {/* Prerrequisito y Ciclo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Prerrequisito <span className="text-red-500">*</span>
                </label>
                <select
                  value={prerrequisito}
                  onChange={(e) => setPrerrequisito(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition cursor-pointer"
                >
                  <option value="PRG101 - Programación I">PRG101 - Programación I</option>
                  <option value="MAT101 - Matemáticas I">MAT101 - Matemáticas I</option>
                  <option value="Ninguno">Ninguno</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Ciclo <span className="text-red-500">*</span>
                </label>
                <select
                  value={ciclo}
                  onChange={(e) => setCiclo(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition cursor-pointer"
                >
                  <option value="I">I</option>
                  <option value="II">II</option>
                  <option value="III">III</option>
                  <option value="IV">IV</option>
                  <option value="V">V</option>
                  <option value="VI">VI</option>
                </select>
              </div>
            </div>

            {/* Horas por ciclo y Horas teóricas por semana */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Horas por ciclo <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={horasCiclo}
                  onChange={(e) => setHorasCiclo(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Horas teóricas por semana <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={horasTeoricas}
                  onChange={(e) => setHorasTeoricas(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition"
                />
              </div>
            </div>

            {/* Duración del ciclo en semanas y Duración de la hora clase */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Duración del ciclo en semanas <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={duracionSemanas}
                  onChange={(e) => setDuracionSemanas(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Duración de la hora clase <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={duracionClase}
                  onChange={(e) => setDuracionClase(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition"
                />
              </div>
            </div>

            {/* Cantidad de UV y Plan vinculado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Cantidad de UV <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={cantidadUV}
                  onChange={(e) => setCantidadUV(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Plan vinculado <span className="text-red-500">*</span>
                </label>
                <select
                  value={planVinculado}
                  onChange={(e) => setPlanVinculado(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition cursor-pointer"
                >
                  <option value="ISI-2027 · Ingeniería en Sistemas">ISI-2027 · Ingeniería en Sistemas</option>
                  <option value="IND-2027 · Ingeniería Industrial">IND-2027 · Ingeniería Industrial</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mensaje de éxito */}
          {guardadoExitoso && (
            <div className="bg-[#8CB83C]/20 border border-[#8CB83C]/60 text-[#2D5A1E] rounded-xl px-4 py-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#4C8C23]" />
              <p className="text-xs font-bold">¡Asignatura creada con éxito! Puedes seguir editando o salir cuando desees.</p>
            </div>
          )}

          {/* Botones inferiores de acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/asignaturas')}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold px-5 py-3 rounded-xl shadow-sm transition cursor-pointer"
            >
              {guardadoExitoso ? 'Salir' : 'Cancelar'}
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-sm transition cursor-pointer"
            >
              Crear asignatura
            </button>
          </div>
        </div>

        {/* Columna Derecha: Tarjetas Informativas Laterales (4 columnas) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
            <h4 className="text-sm font-bold text-gray-900">Antes de continuar</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Verifica el nombre y el código institucional. El código debe ser único dentro de la facultad.
            </p>
            <p className="text-xs text-gray-500 leading-relaxed">
              Podrás completar los contenidos y asignar colaboradores después de la creación.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <h4 className="text-sm font-bold text-gray-900">Alcance del recurso</h4>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Facultad responsable</span>
              <p className="text-xs font-bold text-gray-900">{facultadActual}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Estado</span>
              <p className="text-xs font-bold text-gray-700">Disponible en el catálogo de facultad</p>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};