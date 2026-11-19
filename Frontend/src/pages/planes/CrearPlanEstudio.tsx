import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { universidadApi } from '../../services/universidadApi';

export const CrearPlanEstudio: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const rolActual = (user?.rol as string) || '';
  const esSuperUsuario = rolActual === 'SUPER_USUARIO';
  const esAdministrador = rolActual === 'ADMINISTRADOR';

  // Estados del formulario para el nuevo plan
  const [nombreCarrera, setNombreCarrera] = useState('');
  const [codigoPlan, setCodigoPlan] = useState('');
  const [tituloOtorgar, setTituloOtorgar] = useState('');
  const [anioInicio, setAnioInicio] = useState('2028');
  const [anioFinalizacion, setAnioFinalizacion] = useState('2032');
  const [vigenciaCiclos, setVigenciaCiclos] = useState('10 ciclos');
  const [duracionCiclo, setDuracionCiclo] = useState('20 semanas');
  const [modalidadEntrega, setModalidadEntrega] = useState('Presencial');
  
  // Superusuario puede elegir facultad; el admin tiene fija la suya
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

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Encabezado Superior */}
      <div>
        <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
          Crear Nuevo Plan de Estudio
        </h2>
        <p className="text-xs text-gray-500 mt-1 font-medium">
          {esSuperUsuario
            ? 'Superusuario · Creación y asignación global de planes de estudio.'
            : `${user.facultadNombre || 'Ingeniería y Tecnología'} · Completa los datos para incorporar un nuevo recurso académico.`}
        </p>
      </div>

      {/* Alerta Informativa Superior */}
      <div className="bg-[#050758]/5 border border-[#050758]/15 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-[#050758] shrink-0 mt-0.5" />
        <p className="text-xs text-[#050758] font-medium leading-relaxed">
          El nuevo plan se registrará en estado Borrador. Sus 17 secciones estarán disponibles para completar.
        </p>
      </div>

      {/* Estructura Principal de Dos Columnas */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Columna Izquierda: Formulario (8 columnas) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200/80 p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Identificación del plan</h3>
            <p className="text-xs text-gray-500 mt-0.5">Los campos marcados con * son obligatorios.</p>
          </div>

          <div className="space-y-5">
            {/* Nombre de la carrera */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Nombre de la carrera <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Ingeniería en Inteligencia Artificial"
                value={nombreCarrera}
                onChange={(e) => setNombreCarrera(e.target.value)}
                className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium placeholder:text-gray-400 focus:outline-none transition"
              />
            </div>

            {/* Código del plan y Facultad (Selector para superusuario, input bloqueado para admin) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Código del plan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. IIA-2028"
                  value={codigoPlan}
                  onChange={(e) => setCodigoPlan(e.target.value)}
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

            {/* Título a otorgar */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Título a otorgar <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Ingeniero/a en Inteligencia Artificial"
                value={tituloOtorgar}
                onChange={(e) => setTituloOtorgar(e.target.value)}
                className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium placeholder:text-gray-400 focus:outline-none transition"
              />
            </div>

            {/* Años de inicio y finalización */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Año de inicio <span className="text-red-500">*</span>
                </label>
                <select
                  value={anioInicio}
                  onChange={(e) => setAnioInicio(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition cursor-pointer"
                >
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                  <option value="2028">2028</option>
                  <option value="2029">2029</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Año de finalización <span className="text-red-500">*</span>
                </label>
                <select
                  value={anioFinalizacion}
                  onChange={(e) => setAnioFinalizacion(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition cursor-pointer"
                >
                  <option value="2030">2030</option>
                  <option value="2031">2031</option>
                  <option value="2032">2032</option>
                  <option value="2033">2033</option>
                </select>
              </div>
            </div>

            {/* Vigencia en ciclos y Duración del ciclo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Vigencia en ciclos <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={vigenciaCiclos}
                  onChange={(e) => setVigenciaCiclos(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700">
                  Duración del ciclo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={duracionCiclo}
                  onChange={(e) => setDuracionCiclo(e.target.value)}
                  className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition"
                />
              </div>
            </div>

            {/* Modalidad de entrega */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Modalidad de entrega <span className="text-red-500">*</span>
              </label>
              <select
                value={modalidadEntrega}
                onChange={(e) => setModalidadEntrega(e.target.value)}
                className="w-full bg-white border border-gray-200 focus:border-[#050758] rounded-xl px-4 py-3 text-xs text-gray-800 font-medium focus:outline-none transition cursor-pointer"
              >
                <option value="Presencial">Presencial</option>
                <option value="Virtual">Virtual</option>
                <option value="Híbrida">Híbrida</option>
              </select>
            </div>
          </div>

          {/* Mensaje de éxito */}
          {guardadoExitoso && (
            <div className="bg-[#8CB83C]/20 border border-[#8CB83C]/60 text-[#2D5A1E] rounded-xl px-4 py-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#4C8C23]" />
              <p className="text-xs font-bold">¡Plan de estudio creado con éxito! Puedes seguir editando o salir cuando desees.</p>
            </div>
          )}

          {/* Botones inferiores de acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate('/planes')}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold px-5 py-3 rounded-xl shadow-sm transition cursor-pointer"
            >
              {guardadoExitoso ? 'Salir' : 'Cancelar'}
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-sm transition cursor-pointer"
            >
              Crear plan de estudio
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
              <p className="text-xs font-bold text-gray-900">
                {esSuperUsuario ? facultadSeleccionada : (user.facultadNombre || 'Ingeniería y Tecnología')}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Estado Inicial</span>
              <p className="text-xs font-bold text-emerald-700">Borrador</p>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};