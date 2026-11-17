import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Save, BookOpen, Plus, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ModalReferencia } from '../../components/modals/ModalReferencia';
import { ModalAlertaSalida } from '../../components/modals/ModalAlertaSalida';

interface ParAbsorcion {
  id: string;
  absorbe: string;
  absorbida: string;
  correspondencia: string;
}

export const PlanAbsorcionPlan: React.FC = () => {
  const { planId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Pestañas internas
  const [pestanaActiva, setPestanaActiva] = useState<'politicas' | 'buscador' | 'justificacion'>('politicas');

  // Estados de texto
  const [politicas, setPoliticas] = useState('');
  const [justificacion, setJustificacion] = useState('');

  // Estados para el buscador de asignaturas / pares de absorción
  const [asignaturaAbsorbeSeleccionada, setAsignaturaAbsorbeSeleccionada] = useState('');
  const [asignaturaAbsorbidaSeleccionada, setAsignaturaAbsorbidaSeleccionada] = useState('');
  const [filtroAbsorbe, setFiltroAbsorbe] = useState('');
  const [filtroAbsorbida, setFiltroAbsorbida] = useState('');
  const [mostrarTodasFacultad, setMostrarTodasFacultad] = useState(false);

  // Listado de pares registrados
  const [pares, setPares] = useState<ParAbsorcion[]>([
    { id: '1', absorbe: 'PRG101 · Programación I', absorbida: 'PRG100 · Introducción a la Programación (2022)', correspondencia: '90% · 4 UV' },
    { id: '2', absorbe: 'ALG101 · Álgebra Lineal', absorbida: 'MAT100 · Álgebra y Matrices (2022)', correspondencia: '85% · 4 UV' },
    { id: '3', absorbe: 'BDD203 · Bases de Datos', absorbida: 'BDD200 · Diseño de Bases de Datos (2022)', correspondencia: '90% · 4 UV' },
  ]);

  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [modalReferenciarAbierto, setModalReferenciarAbierto] = useState(false);

  // Estados para el modal de confirmación de salida
  const [modalSalidaAbierto, setModalSalidaAbierto] = useState(false);
  const [rutaDestinoPendiente, setRutaDestinoPendiente] = useState<string | null>(null);

  if (!user) return null;

  const intentarSalir = (destino: string) => {
    setRutaDestinoPendiente(destino);
    setModalSalidaAbierto(true);
  };

  // Catálogos completos
  const materiasPlanActual = [
    'PRG101 · Programación I',
    'ALG101 · Álgebra Lineal',
    'BDD203 · Bases de Datos',
    'ISI301 · Ingeniería de Software I',
    'RED202 · Redes I'
  ];

  const materiasPlanAnteriorISI2022 = [
    'PRG100 · Introducción a la Programación (2022)',
    'MAT100 · Álgebra y Matrices (2022)',
    'BDD200 · Diseño de Bases de Datos (2022)',
    'FIS100 · Física I (2022)'
  ];

  const materiasFacultadGeneral = [
    ...materiasPlanAnteriorISI2022,
    'MAT101 · Matemática Discreta (Facultad)',
    'QUI101 · Química General (Facultad)',
    'CONT101 · Contabilidad Básica (Facultad)'
  ];

  const catalogoAbsorbidasBase = mostrarTodasFacultad ? materiasFacultadGeneral : materiasPlanAnteriorISI2022;

  // Obtener los arrays de materias ya utilizadas en la tabla para excluirlas de los selectores
  const materiasAbsorbeOcupadas = pares.map(p => p.absorbe);
  const materiasAbsorbidasOcupadas = pares.map(p => p.absorbida);

  // Filtrar catálogos excluyendo las ya seleccionadas y aplicando el filtro de búsqueda por texto
  const materiasAbsorbeDisponibles = materiasPlanActual.filter(
    m => !materiasAbsorbeOcupadas.includes(m) && m.toLowerCase().includes(filtroAbsorbe.toLowerCase())
  );

  const materiasAbsorbidasDisponibles = catalogoAbsorbidasBase.filter(
    m => !materiasAbsorbidasOcupadas.includes(m) && m.toLowerCase().includes(filtroAbsorbida.toLowerCase())
  );

  const handleAgregarPar = () => {
    const absorbeFinal = asignaturaAbsorbeSeleccionada || materiasAbsorbeDisponibles[0];
    const absorbidaFinal = asignaturaAbsorbidaSeleccionada || materiasAbsorbidasDisponibles[0];

    if (!absorbeFinal || !absorbidaFinal) return;

    setPares([
      ...pares,
      {
        id: Date.now().toString(),
        absorbe: absorbeFinal,
        absorbida: absorbidaFinal,
        correspondencia: '90% · 4 UV'
      }
    ]);
    setAsignaturaAbsorbeSeleccionada('');
    setAsignaturaAbsorbidaSeleccionada('');
  };

  const handleEliminarPar = (id: string) => {
    setPares(pares.filter(p => p.id !== id));
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    setGuardadoExitoso(true);
    setTimeout(() => setGuardadoExitoso(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 relative">
      {/* Encabezado y Botón Volver */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
            Plan de absorción
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Ingeniería en Sistemas · ISI-2027 · Ingeniería y Tecnología
          </p>
        </div>

        <button
          type="button"
          onClick={() => intentarSalir(`/planes/${planId || 'ISI-2027'}`)}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-[#050758] text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al menú del plan
        </button>
      </div>

      {/* Metadatos */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium">
        <span className="inline-flex items-center gap-1.5 text-gray-700">
          <span className="w-2 h-2 rounded-full bg-gray-500" />
          Borrador
        </span>
        <span>·</span>
        <span>Versión 2027–2031</span>
        <span>·</span>
        <span>Edición por asignación</span>
        <span>·</span>
        <span>{user.nombre} · Tu sesión</span>
      </div>

      {/* Contenedor Principal con Pestañas */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
        
        {/* Pestañas */}
        <div className="flex border-b border-gray-200 gap-8">
          <button
            type="button"
            onClick={() => setPestanaActiva('politicas')}
            className={`pb-3 text-xs font-bold transition cursor-pointer relative ${
              pestanaActiva === 'politicas'
                ? 'text-[#050758] border-b-2 border-[#050758]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Políticas de absorción
          </button>
          <button
            type="button"
            onClick={() => setPestanaActiva('buscador')}
            className={`pb-3 text-xs font-bold transition cursor-pointer relative ${
              pestanaActiva === 'buscador'
                ? 'text-[#050758] border-b-2 border-[#050758]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Buscador de asignaturas de la facultad
          </button>
          <button
            type="button"
            onClick={() => setPestanaActiva('justificacion')}
            className={`pb-3 text-xs font-bold transition cursor-pointer relative ${
              pestanaActiva === 'justificacion'
                ? 'text-[#050758] border-b-2 border-[#050758]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Cambios/justificación
          </button>
        </div>

        <form onSubmit={handleGuardar} className="space-y-6">
          {pestanaActiva === 'politicas' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border border-gray-200 rounded-xl p-4 bg-white focus-within:border-[#050758] transition space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Políticas de absorción *
                </label>
                <textarea
                  rows={10}
                  value={politicas}
                  onChange={(e) => setPoliticas(e.target.value)}
                  placeholder="Escribe acá las políticas institucionales de absorción..."
                  className="w-full text-xs text-gray-800 bg-transparent focus:outline-none resize-y leading-relaxed placeholder:text-gray-400"
                />
              </div>
            </div>
          )}

          {pestanaActiva === 'buscador' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-[#F3F4F8] border border-gray-200/60 rounded-xl p-4 text-xs text-gray-700 font-medium">
                Selecciona pares de asignaturas. Las materias ya seleccionadas se ocultan automáticamente de las opciones para evitar duplicados.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Asignatura que absorbe */}
                <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-3">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Asignatura que absorbe (Plan actual) *
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={filtroAbsorbe}
                      onChange={(e) => setFiltroAbsorbe(e.target.value)}
                      placeholder="Buscar materia del plan actual..."
                      className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-[#050758]"
                    />
                  </div>
                  <select
                    size={4}
                    value={asignaturaAbsorbeSeleccionada}
                    onChange={(e) => setAsignaturaAbsorbeSeleccionada(e.target.value)}
                    className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#050758]"
                  >
                    {materiasAbsorbeDisponibles.length === 0 ? (
                      <option disabled className="text-gray-400 py-1">No hay materias disponibles</option>
                    ) : (
                      materiasAbsorbeDisponibles.map((mat, idx) => (
                        <option key={idx} value={mat} className="py-1 cursor-pointer">
                          {mat}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* Asignatura absorbida */}
                <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Asignatura absorbida (Plan anterior) *
                    </label>
                    <button
                      type="button"
                      onClick={() => setMostrarTodasFacultad(!mostrarTodasFacultad)}
                      className="text-[11px] text-[#050758] font-bold hover:underline cursor-pointer"
                    >
                      {mostrarTodasFacultad ? 'Ver solo plan anterior' : '+ Ver toda la facultad'}
                    </button>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={filtroAbsorbida}
                      onChange={(e) => setFiltroAbsorbida(e.target.value)}
                      placeholder="Buscar materia absorbida..."
                      className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-[#050758]"
                    />
                  </div>
                  <select
                    size={4}
                    value={asignaturaAbsorbidaSeleccionada}
                    onChange={(e) => setAsignaturaAbsorbidaSeleccionada(e.target.value)}
                    className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2 focus:outline-none focus:border-[#050758]"
                  >
                    {materiasAbsorbidasDisponibles.length === 0 ? (
                      <option disabled className="text-gray-400 py-1">No hay materias disponibles</option>
                    ) : (
                      materiasAbsorbidasDisponibles.map((mat, idx) => (
                        <option key={idx} value={mat} className="py-1 cursor-pointer">
                          {mat}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleAgregarPar}
                  className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:border-[#050758] text-[#050758] text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Agregar par de absorción
                </button>
              </div>

              {/* Tabla de Pares Registrados */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="p-3.5">Absorbe · Plan actual</th>
                      <th className="p-3.5">Absorbida · Plan anterior</th>
                      <th className="p-3.5">Correspondencia</th>
                      <th className="p-3.5 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs text-gray-800">
                    {pares.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-6 text-center text-gray-400">
                          No hay pares de absorción registrados.
                        </td>
                      </tr>
                    ) : (
                      pares.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50/50 transition">
                          <td className="p-3.5 font-semibold text-[#050758]">{p.absorbe}</td>
                          <td className="p-3.5 text-gray-600">{p.absorbida}</td>
                          <td className="p-3.5 text-gray-500">{p.correspondencia}</td>
                          <td className="p-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleEliminarPar(p.id)}
                              className="text-red-600 hover:text-red-800 font-semibold transition cursor-pointer"
                            >
                              Quitar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {pestanaActiva === 'justificacion' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border border-gray-200 rounded-xl p-4 bg-white focus-within:border-[#050758] transition space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Cambios / justificación *
                </label>
                <textarea
                  rows={10}
                  value={justificacion}
                  onChange={(e) => setJustificacion(e.target.value)}
                  placeholder="Escribe acá la justificación de los cambios y absorciones..."
                  className="w-full text-xs text-gray-800 bg-transparent focus:outline-none resize-y leading-relaxed placeholder:text-gray-400"
                />
              </div>
            </div>
          )}

          {/* Pie de Formulario Común */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              {guardadoExitoso ? (
                <span className="inline-flex items-center gap-1.5 text-[#2D5A1E] font-bold bg-[#8CB83C]/20 px-3 py-1.5 rounded-lg transition-all">
                  <CheckCircle2 className="w-4 h-4 text-[#4C8C23]" />
                  ¡Plan de absorción guardado con éxito!
                </span>
              ) : (
                'Cambios sin guardar · visibles en esta versión de trabajo'
              )}
            </p>

            {/* Grupo inferior izquierdo simétrico y botón Guardar a la derecha */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => intentarSalir(`/planes/${planId || 'ISI-2027'}`)}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold px-5 py-3 rounded-xl shadow-sm transition cursor-pointer"
                >
                  Salir
                </button>

                <button
                  type="button"
                  onClick={() => setModalReferenciarAbierto(true)}
                  className="inline-flex items-center gap-2 bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-5 py-3 rounded-xl shadow-sm transition cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  Referenciar
                </button>
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-2 bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-sm transition cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Guardar
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400 px-1">
        <p>Cada pestaña se guarda de forma independiente. Los cambios se incorporan al expediente curricular.</p>
        <span className="font-semibold text-gray-500">08 / 17</span>
      </div>

      <ModalReferencia
        isOpen={modalReferenciarAbierto}
        onClose={() => setModalReferenciarAbierto(false)}
      />

      {/* Modal de Confirmación de Salida */}
      <ModalAlertaSalida
        isOpen={modalSalidaAbierto}
        mensaje="¿Ya guardaste los cambios antes de salir?"
        onConfirmar={() => {
          setModalSalidaAbierto(false);
          if (rutaDestinoPendiente) navigate(rutaDestinoPendiente);
        }}
        onCancelar={() => {
          setModalSalidaAbierto(false);
          setRutaDestinoPendiente(null);
        }}
      />
    </div>
  );
};