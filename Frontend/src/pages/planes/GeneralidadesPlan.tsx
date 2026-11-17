import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Save, Info, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ModalReferencia } from '../../components/modals/ModalReferencia';
import { ModalAlertaSalida } from '../../components/modals/ModalAlertaSalida';

export const GeneralidadesPlan: React.FC = () => {
  const { planId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados de los campos de generalidades del plan
  const [tituloOtorgar, setTituloOtorgar] = useState('Ingeniero/a en Sistemas');
  const [modalidad, setModalidad] = useState('Presencial');
  const [vigenciaCiclos, setVigenciaCiclos] = useState('10 ciclos');
  const [duracionSemanas, setDuracionSemanas] = useState('20 semanas');
  const [anioInicio, setAnioInicio] = useState('2027');
  const [anioFin, setAnioFin] = useState('2031');
  const [requisitosIngreso, setRequisitosIngreso] = useState(
    'Título de bachiller o equivalente reconocido por el Ministerio de Educación; aprobación del proceso institucional de admisión; presentación de documento de identidad y expediente académico completo.'
  );

  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  // Único estado necesario aquí: abrir o cerrar el modal de referencias
  const [modalReferenciarAbierto, setModalReferenciarAbierto] = useState(false);

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
      {/* Encabezado y Botón Volver al Menú del Plan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
            Generalidades de la carrera
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

      {/* Estado del Documento / Metadatos */}
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

      {/* Contenedor Principal */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
        <div>
          <h3 className="text-base font-bold text-gray-900">Generalidades de la carrera</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Datos académicos generales, vigencia y requisitos institucionales del plan de estudio.
          </p>
        </div>

        <form onSubmit={handleGuardar} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Título a otorgar */}
            <div className="border border-gray-200 rounded-xl p-3.5 bg-white focus-within:border-[#050758] transition">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Título a otorgar *
              </label>
              <input
                type="text"
                value={tituloOtorgar}
                onChange={(e) => setTituloOtorgar(e.target.value)}
                className="w-full text-xs font-semibold text-gray-900 bg-transparent focus:outline-none"
              />
            </div>

            {/* Modalidad de entrega */}
            <div className="border border-gray-200 rounded-xl p-3.5 bg-white focus-within:border-[#050758] transition">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Modalidad de entrega *
              </label>
              <select
                value={modalidad}
                onChange={(e) => setModalidad(e.target.value)}
                className="w-full text-xs font-semibold text-gray-900 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="Presencial">Presencial</option>
                <option value="Virtual">Virtual</option>
                <option value="Híbrida">Híbrida</option>
              </select>
            </div>

            {/* Vigencia en ciclos */}
            <div className="border border-gray-200 rounded-xl p-3.5 bg-white focus-within:border-[#050758] transition">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Vigencia en ciclos *
              </label>
              <input
                type="text"
                value={vigenciaCiclos}
                onChange={(e) => setVigenciaCiclos(e.target.value)}
                className="w-full text-xs font-semibold text-gray-900 bg-transparent focus:outline-none"
              />
            </div>

            {/* Duración de ciclo en semanas */}
            <div className="border border-gray-200 rounded-xl p-3.5 bg-white focus-within:border-[#050758] transition">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Duración de ciclo en semanas *
              </label>
              <input
                type="text"
                value={duracionSemanas}
                onChange={(e) => setDuracionSemanas(e.target.value)}
                className="w-full text-xs font-semibold text-gray-900 bg-transparent focus:outline-none"
              />
            </div>

            {/* Año de inicio */}
            <div className="border border-gray-200 rounded-xl p-3.5 bg-white focus-within:border-[#050758] transition">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Año de inicio *
              </label>
              <select
                value={anioInicio}
                onChange={(e) => setAnioInicio(e.target.value)}
                className="w-full text-xs font-semibold text-gray-900 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="2026">2026</option>
                <option value="2027">2027</option>
                <option value="2028">2028</option>
              </select>
            </div>

            {/* Año de finalización */}
            <div className="border border-gray-200 rounded-xl p-3.5 bg-white focus-within:border-[#050758] transition">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                Año de finalización *
              </label>
              <select
                value={anioFin}
                onChange={(e) => setAnioFin(e.target.value)}
                className="w-full text-xs font-semibold text-gray-900 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="2030">2030</option>
                <option value="2031">2031</option>
                <option value="2032">2032</option>
              </select>
            </div>

          </div>

          {/* Requisitos de ingreso */}
          <div className="border border-gray-200 rounded-xl p-4 bg-white focus-within:border-[#050758] transition">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
              Requisitos de ingreso *
            </label>
            <textarea
              rows={4}
              value={requisitosIngreso}
              onChange={(e) => setRequisitosIngreso(e.target.value)}
              className="w-full text-xs text-gray-800 bg-transparent focus:outline-none resize-y leading-relaxed"
            />
          </div>

          {/* Nota informativa institucional */}
          <div className="bg-[#F3F4F8] border border-gray-200/60 rounded-xl p-4 flex items-center gap-3 text-gray-700">
            <Info className="w-5 h-5 text-[#050758] shrink-0" />
            <p className="text-xs font-medium">
              Los datos generales se utilizarán en la portada del reporte institucional.
            </p>
          </div>

          {/* Pie de Formulario: Mensaje de éxito junto a los botones */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              {guardadoExitoso ? (
                <span className="inline-flex items-center gap-1.5 text-[#2D5A1E] font-bold bg-[#8CB83C]/20 px-3 py-1.5 rounded-lg transition-all">
                  <CheckCircle2 className="w-4 h-4 text-[#4C8C23]" />
                  ¡Generalidades guardadas con éxito!
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

      {/* Nota Inferior Institucional */}
      <div className="flex items-center justify-between text-xs text-gray-400 px-1">
        <p>Cada pestaña se guarda de forma independiente. Los cambios se incorporan al expediente curricular.</p>
        <span className="font-semibold text-gray-500">01 / 17</span>
      </div>

      {/* Llamada limpia al Modal de Referencias Independiente */}
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