import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Save, BookOpen, Upload, Trash2, Eye, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ModalReferencia } from '../../components/modals/ModalReferencia';
import { ModalAlertaSalida } from '../../components/modals/ModalAlertaSalida';

export const EstructuraCurricularPlan: React.FC = () => {
  const { planId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Pestaña activa
  const [pestanaActiva, setPestanaActiva] = useState<'imagen' | 'extraordinario' | 'equivalencias'>('imagen');

  // Estados de los campos de texto
  const [cicloExtraordinario, setCicloExtraordinario] = useState('');
  const [equivalenciasExtranjero, setEquivalenciasExtranjero] = useState('');

  // Estado de imagen / malla (Inicia en null, sin ninguna imagen previa)
  const [archivoMalla, setArchivoMalla] = useState<{ nombre: string; tamano: string; url: string } | null>(null);

  // Estado para el modal de vista previa ampliada (Lightbox)
  const [imagenAmpliadaAbierta, setImagenAmpliadaAbierta] = useState(false);

  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [modalReferenciarAbierto, setModalReferenciarAbierto] = useState(false);
  
  // Estados para el modal de confirmación de salida
  const [modalSalidaAbierto, setModalSalidaAbierto] = useState(false);
  const [rutaDestinoPendiente, setRutaDestinoPendiente] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!user) return null;

  const intentarSalir = (destino: string) => {
    setRutaDestinoPendiente(destino);
    setModalSalidaAbierto(true);
  };

  const handleSubirMalla = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setArchivoMalla({
        nombre: file.name,
        tamano: `${Math.round(file.size / (1024 * 1024))} MB`,
        url: uploadEvent.target?.result as string,
      });
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleQuitarMalla = () => {
    setArchivoMalla(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
            Estructura y normativa curricular
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
        
        {/* Sistema de Pestañas */}
        <div className="flex border-b border-gray-200 gap-8">
          <button
            type="button"
            onClick={() => setPestanaActiva('imagen')}
            className={`pb-3 text-xs font-bold transition cursor-pointer relative ${
              pestanaActiva === 'imagen'
                ? 'text-[#050758] border-b-2 border-[#050758]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Carga de Imagen
          </button>
          <button
            type="button"
            onClick={() => setPestanaActiva('extraordinario')}
            className={`pb-3 text-xs font-bold transition cursor-pointer relative ${
              pestanaActiva === 'extraordinario'
                ? 'text-[#050758] border-b-2 border-[#050758]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Ciclo extraordinario
          </button>
          <button
            type="button"
            onClick={() => setPestanaActiva('equivalencias')}
            className={`pb-3 text-xs font-bold transition cursor-pointer relative ${
              pestanaActiva === 'equivalencias'
                ? 'text-[#050758] border-b-2 border-[#050758]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Equivalencias extranjero
          </button>
        </div>

        <form onSubmit={handleGuardar} className="space-y-6">
          {pestanaActiva === 'imagen' && (
            <div className="space-y-6 animate-fadeIn">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleSubirMalla}
                className="hidden"
              />

              {!archivoMalla ? (
                /* Zona de carga inicial cuando no hay imagen */
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 hover:border-[#050758] rounded-2xl p-8 text-center bg-gray-50/50 cursor-pointer transition space-y-3"
                >
                  <div className="w-10 h-10 mx-auto rounded-full bg-white shadow-xs flex items-center justify-center text-[#050758]">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Arrastra la malla curricular o selecciona una imagen</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">PNG o JPG · Máximo 10 MB · Resolución recomendada 2400 px</p>
                  </div>
                </div>
              ) : (
                /* Vista previa real de la imagen cargada */
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">Malla curricular cargada</h4>
                      <p className="text-[11px] text-gray-400">{archivoMalla.nombre} · {archivoMalla.tamano}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 bg-white border border-gray-300 hover:border-[#050758] text-[#050758] text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Reemplazar imagen
                      </button>
                      <button
                        type="button"
                        onClick={handleQuitarMalla}
                        className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-red-600 text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer"
                        title="Eliminar imagen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Quitar
                      </button>
                    </div>
                  </div>

                  {/* Contenedor de miniatura con botón de ampliar */}
                  <div className="relative rounded-2xl border border-gray-200 overflow-hidden bg-gray-900 aspect-[16/9] flex items-center justify-center group shadow-xs">
                    <img
                      src={archivoMalla.url}
                      alt="Vista previa de la malla curricular"
                      className="absolute inset-0 w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setImagenAmpliadaAbierta(true)}
                        className="inline-flex items-center gap-2 bg-white/90 hover:bg-white text-gray-900 text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        Ampliar imagen
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {pestanaActiva === 'extraordinario' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border border-gray-200 rounded-xl p-4 bg-white focus-within:border-[#050758] transition space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Ciclo extraordinario *
                </label>
                <textarea
                  rows={8}
                  value={cicloExtraordinario}
                  onChange={(e) => setCicloExtraordinario(e.target.value)}
                  placeholder="Escribe acá las normativas del ciclo extraordinario..."
                  className="w-full text-xs text-gray-800 bg-transparent focus:outline-none resize-y leading-relaxed placeholder:text-gray-400"
                />
              </div>
            </div>
          )}

          {pestanaActiva === 'equivalencias' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border border-gray-200 rounded-xl p-4 bg-white focus-within:border-[#050758] transition space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Equivalencias extranjero *
                </label>
                <textarea
                  rows={8}
                  value={equivalenciasExtranjero}
                  onChange={(e) => setEquivalenciasExtranjero(e.target.value)}
                  placeholder="Escribe acá los lineamientos para equivalencias de estudios en el extranjero..."
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
                  ¡Cambios guardados con éxito!
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
        <span className="font-semibold text-gray-500">07 / 17</span>
      </div>

      {/* Modal Independiente de Referencias */}
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

      {/* Modal / Lightbox para Ampliar Imagen sin cambiar de página ni recargar */}
      {imagenAmpliadaAbierta && archivoMalla && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden max-w-5xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <p className="text-xs font-bold text-[#050758]">{archivoMalla.nombre}</p>
              <button
                type="button"
                onClick={() => setImagenAmpliadaAbierta(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1 flex items-center justify-center bg-gray-900">
              <img
                src={archivoMalla.url}
                alt="Malla curricular ampliada"
                className="max-w-full max-h-[75vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};