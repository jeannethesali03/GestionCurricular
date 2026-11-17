import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ModalAlertaSalida } from '../../components/modals/ModalAlertaSalida';

export const DescripcionAsignatura: React.FC = () => {
  const { asignaturaId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [descripcion, setDescripcion] = useState('');
  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  // Estados para el modal de confirmación de salida
  const [modalSalidaAbierto, setModalSalidaAbierto] = useState(false);
  const [rutaDestinoPendiente, setRutaDestinoPendiente] = useState<string | null>(null);

  if (!user) return null;

  const intentarSalir = (destino: string) => {
    setRutaDestinoPendiente(destino);
    setModalSalidaAbierto(true);
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
            Descripción
          </h2>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Programación I · PRG101 · Ingeniería en Sistemas · Ingeniería y Tecnología
          </p>
        </div>

        <button
          type="button"
          onClick={() => intentarSalir(`/asignaturas/${asignaturaId || 'PRG101'}`)}
          className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-[#050758] text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al programa
        </button>
      </div>

      {/* Estado del Documento / Metadatos */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium">
        <span className="inline-flex items-center gap-1.5 text-gray-700">
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          Asignada
        </span>
        <span>·</span>
        <span>ISI-2027</span>
        <span>·</span>
        <span>Edición de programa académico</span>
        <span>·</span>
        <span>{user.nombre} · Tu sesión</span>
      </div>

      {/* Contenedor Principal */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
        <div>
          <h3 className="text-base font-bold text-gray-900">Descripción</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Enfoque, alcance y propósito académico de la asignatura.
          </p>
        </div>

        <form onSubmit={handleGuardar} className="space-y-6">
          <div className="border border-gray-200 rounded-xl p-4 bg-white focus-within:border-[#050758] transition">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
              Descripción de la asignatura *
            </label>
            <textarea
              rows={12}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Escribe acá la descripción de la asignatura..."
              className="w-full text-xs text-gray-800 bg-transparent focus:outline-none resize-y leading-relaxed placeholder:text-gray-400"
            />
            <div className="text-right text-[10px] text-gray-400 mt-2">
              {descripcion.length} caracteres
            </div>
          </div>

          {/* Pie de Formulario: Mensaje de éxito, Botón Salir y Botón Guardar */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              {guardadoExitoso ? (
                <span className="inline-flex items-center gap-1.5 text-[#2D5A1E] font-bold bg-[#8CB83C]/20 px-3 py-1.5 rounded-lg transition-all animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-[#4C8C23]" />
                  ¡Cambios guardados con éxito!
                </span>
              ) : (
                'Cambios sin guardar · visibles en esta versión de trabajo'
              )}
            </p>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => intentarSalir(`/asignaturas/${asignaturaId || 'PRG101'}`)}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold px-5 py-3 rounded-xl shadow-sm transition cursor-pointer"
              >
                Salir
              </button>

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

      {/* Nota Inferior Institucional */}
      <div className="text-xs text-gray-400 px-1">
        <p>Los cambios de esta asignatura se reflejarán en los programas vinculados a los planes de estudio correspondientes.</p>
      </div>

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