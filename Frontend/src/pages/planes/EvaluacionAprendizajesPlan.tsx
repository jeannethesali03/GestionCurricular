import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Save, BookOpen, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ModalReferencia } from '../../components/modals/ModalReferencia';
import { ModalAlertaSalida } from '../../components/modals/ModalAlertaSalida';

interface ItemEvaluacion {
  id: string;
  titulo: string;
  descripcion: string;
}

export const EvaluacionAprendizajesPlan: React.FC = () => {
  const { planId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Inicia con un ítem vacío para que el usuario redacte desde cero
  const [items, setItems] = useState<ItemEvaluacion[]>([
    { id: '1', titulo: '', descripcion: '' },
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

  const handleAgregarItem = () => {
    setItems([...items, { id: Date.now().toString(), titulo: '', descripcion: '' }]);
  };

  const handleEliminarItem = (id: string) => {
    if (items.length > 1) setItems(items.filter(i => i.id !== id));
  };

  const handleCambiarItem = (id: string, campo: 'titulo' | 'descripcion', valor: string) => {
    setItems(items.map(i => i.id === id ? { ...i, [campo]: valor } : i));
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    setGuardadoExitoso(true);
    setTimeout(() => setGuardadoExitoso(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
            Evaluación de los aprendizajes
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
          <h3 className="text-base font-bold text-gray-900">Evaluación de los aprendizajes</h3>
          <p className="text-xs text-gray-500 mt-0.5">Criterios, tipologías e instrumentos de evaluación institucional.</p>
        </div>

        <form onSubmit={handleGuardar} className="space-y-6">
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    ÍTEM {String(index + 1).padStart(2, '0')} · TÍTULO
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleEliminarItem(item.id)}
                      className="text-gray-400 hover:text-red-600 transition p-1 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="border border-gray-200 rounded-xl p-3 bg-white focus-within:border-[#050758] transition">
                  <input
                    type="text"
                    value={item.titulo}
                    onChange={(e) => handleCambiarItem(item.id, 'titulo', e.target.value)}
                    placeholder="Escribe acá el título de la evaluación..."
                    className="w-full text-xs font-semibold text-gray-900 bg-transparent focus:outline-none placeholder:text-gray-400"
                  />
                </div>

                <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/50 focus-within:border-[#050758] transition space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Descripción</label>
                  <textarea
                    rows={2}
                    value={item.descripcion}
                    onChange={(e) => handleCambiarItem(item.id, 'descripcion', e.target.value)}
                    placeholder="Escribe acá la descripción..."
                    className="w-full text-xs text-gray-800 bg-transparent focus:outline-none resize-none leading-relaxed placeholder:text-gray-400"
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <button
              type="button"
              onClick={handleAgregarItem}
              className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:border-[#050758] text-[#050758] text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Agregar ítem
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
        <span className="font-semibold text-gray-500">12 / 17</span>
      </div>

      <ModalReferencia isOpen={modalReferenciarAbierto} onClose={() => setModalReferenciarAbierto(false)} />

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