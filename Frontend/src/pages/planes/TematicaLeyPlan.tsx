import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Save, BookOpen, Search, Check, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ModalReferencia } from '../../components/modals/ModalReferencia';
import { ModalAlertaSalida } from '../../components/modals/ModalAlertaSalida';

interface BloqueTematicaLey {
  id: string;
  tematica: string;
  legislacion: string;
  estrategias: string;
  filtroAsignatura: string;
  asignaturasSeleccionadas: string[];
}

export const TematicaLeyPlan: React.FC = () => {
  const { planId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bloquesTematica, setBloquesTematica] = useState<BloqueTematicaLey[]>([
    {
      id: '1',
      tematica: '',
      legislacion: '',
      estrategias: '',
      filtroAsignatura: '',
      asignaturasSeleccionadas: []
    }
  ]);

  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [modalReferenciarAbierto, setModalReferenciarAbierto] = useState(false);
  
  // Estado para el modal de confirmación al salir
  const [modalSalidaAbierto, setModalSalidaAbierto] = useState(false);
  const [rutaDestinoPendiente, setRutaDestinoPendiente] = useState<string | null>(null);

  if (!user) return null;

  const todasLasAsignaturas = [
    'PRG101 · Programación I',
    'ALG101 · Álgebra Lineal',
    'FDI101 · Fundamentos de Informática',
    'BDD203 · Bases de Datos',
    'IDS301 · Ingeniería de Software',
    'ETI401 · Ética y Tecnología'
  ];

  // Intercepta siempre la salida para mostrar la confirmación
  const intentarSalir = (destino: string) => {
    setRutaDestinoPendiente(destino);
    setModalSalidaAbierto(true);
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    setGuardadoExitoso(true);
    setTimeout(() => setGuardadoExitoso(false), 4000);
  };

  const handleAgregarBloque = () => {
    setBloquesTematica([
      ...bloquesTematica,
      {
        id: Date.now().toString(),
        tematica: '',
        legislacion: '',
        estrategias: '',
        filtroAsignatura: '',
        asignaturasSeleccionadas: []
      }
    ]);
  };

  const handleEliminarBloque = (id: string) => {
    if (bloquesTematica.length > 1) {
      setBloquesTematica(bloquesTematica.filter(b => b.id !== id));
    }
  };

  const handleActualizarCampo = (id: string, campo: keyof BloqueTematicaLey, valor: any) => {
    setBloquesTematica(bloquesTematica.map(b => b.id === id ? { ...b, [campo]: valor } : b));
  };

  const handleVincularAsignatura = (idBloque: string, asignatura: string) => {
    setBloquesTematica(bloquesTematica.map(b => {
      if (b.id === idBloque && !b.asignaturasSeleccionadas.includes(asignatura)) {
        return {
          ...b,
          asignaturasSeleccionadas: [...b.asignaturasSeleccionadas, asignatura],
          filtroAsignatura: ''
        };
      }
      return b;
    }));
  };

  const handleQuitarAsignatura = (idBloque: string, asignatura: string) => {
    setBloquesTematica(bloquesTematica.map(b => {
      if (b.id === idBloque) {
        return {
          ...b,
          asignaturasSeleccionadas: b.asignaturasSeleccionadas.filter(a => a !== asignatura)
        };
      }
      return b;
    }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
            Abordaje de temática de ley
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Ingeniería en Sistemas · ISI-2027 · Ingeniería y Tecnología
          </p>
        </div>

        {/* Botón superior Volver al menú */}
        <button
          type="button"
          onClick={() => intentarSalir(`/planes/${planId || 'ISI-2027'}`)}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-[#050758] text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al menú del plan
        </button>
      </div>

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

      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
        <div>
          <h3 className="text-base font-bold text-gray-900">Abordaje de temática de ley</h3>
          <p className="text-xs text-gray-500 mt-0.5">Legislación transversal y cumplimiento normativo en el plan de estudio.</p>
        </div>

        <form onSubmit={handleGuardar} className="space-y-6">
          <div className="space-y-6">
            {bloquesTematica.map((bloque, index) => {
              const disponibles = todasLasAsignaturas.filter(a => !bloque.asignaturasSeleccionadas.includes(a));
              const filtradas = disponibles.filter(a => a.toLowerCase().includes(bloque.filtroAsignatura.toLowerCase()));

              return (
                <div key={bloque.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-4 relative">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <span className="text-xs font-bold text-[#050758] uppercase tracking-wider">
                      TEMÁTICA DE LEY {String(index + 1).padStart(2, '0')}
                    </span>
                    {bloquesTematica.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleEliminarBloque(bloque.id)}
                        className="text-gray-400 hover:text-red-600 transition p-1 rounded-lg cursor-pointer inline-flex items-center gap-1 text-xs font-semibold"
                        title="Eliminar temática"
                      >
                        <Trash2 className="w-4 h-4" /> Eliminar
                      </button>
                    )}
                  </div>

                  <div className="border border-gray-200 rounded-xl p-3.5 bg-white focus-within:border-[#050758] transition">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Temática *</label>
                    <input
                      type="text"
                      value={bloque.tematica}
                      onChange={(e) => handleActualizarCampo(bloque.id, 'tematica', e.target.value)}
                      placeholder="Escribe acá la temática..."
                      className="w-full text-xs font-semibold text-gray-900 bg-transparent focus:outline-none placeholder:text-gray-400"
                    />
                  </div>

                  <div className="border border-gray-200 rounded-xl p-3.5 bg-white focus-within:border-[#050758] transition">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Legislación aplicable *</label>
                    <input
                      type="text"
                      value={bloque.legislacion}
                      onChange={(e) => handleActualizarCampo(bloque.id, 'legislacion', e.target.value)}
                      placeholder="Escribe acá la legislación aplicable..."
                      className="w-full text-xs font-semibold text-gray-900 bg-transparent focus:outline-none placeholder:text-gray-400"
                    />
                  </div>

                  <div className="border border-gray-200 rounded-xl p-4 bg-white space-y-3 relative">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Asignaturas vinculadas *</label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={bloque.filtroAsignatura}
                        onChange={(e) => {
                          const val = e.target.value;
                          handleActualizarCampo(bloque.id, 'filtroAsignatura', val);
                          const match = disponibles.filter(a => a.toLowerCase().includes(val.toLowerCase()));
                          if (val.trim() !== '' && match.length === 1) {
                            handleVincularAsignatura(bloque.id, match[0]);
                          }
                        }}
                        placeholder="Escribe acá para buscar y vincular asignaturas..."
                        className="w-full text-xs bg-gray-50 border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#050758]"
                      />
                    </div>

                    {bloque.filtroAsignatura.trim() !== '' && (
                      <div className="absolute left-4 right-4 z-10 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-44 overflow-y-auto divide-y divide-gray-100">
                        {filtradas.length === 0 ? (
                          <div className="p-3 text-xs text-gray-400 text-center">No hay asignaturas disponibles.</div>
                        ) : (
                          filtradas.map((asig) => (
                            <div
                              key={asig}
                              onClick={() => handleVincularAsignatura(bloque.id, asig)}
                              className="p-3 text-xs hover:bg-gray-50 flex items-center justify-between cursor-pointer transition"
                            >
                              <span className="font-semibold text-[#050758]">{asig}</span>
                              <span className="text-[11px] text-[#2D5A1E] font-bold">Vincular +</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {bloque.asignaturasSeleccionadas.length > 0 && (
                      <div className="bg-[#F3F4F8] border border-gray-200/60 rounded-xl p-3.5 space-y-2">
                        {bloque.asignaturasSeleccionadas.map((asig) => (
                          <div key={asig} className="flex items-center justify-between text-xs text-gray-800 bg-white border border-gray-200/80 px-3 py-2 rounded-lg shadow-2xs">
                            <span className="inline-flex items-center gap-2 font-medium">
                              <Check className="w-3.5 h-3.5 text-[#2D5A1E]" />
                              {asig}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuitarAsignatura(bloque.id, asig)}
                              className="text-red-600 hover:text-red-800 text-xs font-bold cursor-pointer"
                            >
                              Quitar
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-[11px] text-gray-400">{bloque.asignaturasSeleccionadas.length} asignaturas seleccionadas.</p>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-4 bg-white focus-within:border-[#050758] transition space-y-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Estrategias de abordaje *</label>
                    <textarea
                      rows={3}
                      value={bloque.estrategias}
                      onChange={(e) => handleActualizarCampo(bloque.id, 'estrategias', e.target.value)}
                      placeholder="Escribe acá las estrategias de abordaje..."
                      className="w-full text-xs text-gray-800 bg-transparent focus:outline-none resize-y leading-relaxed placeholder:text-gray-400"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <button
              type="button"
              onClick={handleAgregarBloque}
              className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:border-[#050758] text-[#050758] text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Agregar otra temática de ley
            </button>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              {guardadoExitoso ? (
                <span className="inline-flex items-center gap-1.5 text-[#2D5A1E] font-bold bg-[#8CB83C]/20 px-3 py-1.5 rounded-lg transition-all">
                  <CheckCircle2 className="w-4 h-4 text-[#4C8C23]" />
                  ¡Guardado con éxito!
                </span>
              ) : (
                'Cambios sin guardar · visibles en esta versión de trabajo'
              )}
            </p>

            {/* Grupo inferior izquierdo: Botón Salir y Referenciar, y a la derecha el botón Guardar */}
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
        <span className="font-semibold text-gray-500">14 / 17</span>
      </div>

      <ModalReferencia isOpen={modalReferenciarAbierto} onClose={() => setModalReferenciarAbierto(false)} />

      {/* Modal de Confirmación de Salida (Pregunta si ya guardó) */}
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