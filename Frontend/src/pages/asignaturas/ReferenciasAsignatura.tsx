import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Save, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ModalAlertaSalida } from '../../components/modals/ModalAlertaSalida';

export interface ItemReferencia {
  id: string;
  texto: string;
}

export const ReferenciasAsignatura: React.FC = () => {
  const { asignaturaId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estado para bibliografías en formato APA (inician vacías para que la usuaria escriba)
  const [bibliografias, setBibliografias] = useState<ItemReferencia[]>([
    {
      id: '1',
      texto: '',
    },
  ]);

  // Estado para fuentes electrónicas (inician vacías)
  const [fuentesElectronicas, setFuentesElectronicas] = useState<ItemReferencia[]>([
    {
      id: 'e1',
      texto: '',
    },
  ]);

  const [guardadoExitoso, setGuardadoExitoso] = useState(false);

  // Estados para el modal de confirmación de salida
  const [modalSalidaAbierto, setModalSalidaAbierto] = useState(false);
  const [rutaDestinoPendiente, setRutaDestinoPendiente] = useState<string | null>(null);

  if (!user) return null;

  const intentarSalir = (destino: string) => {
    setRutaDestinoPendiente(destino);
    setModalSalidaAbierto(true);
  };

  // Manejadores de Bibliografías
  const handleAgregarBiblio = () => {
    setBibliografias([...bibliografias, { id: Date.now().toString(), texto: '' }]);
  };

  const handleEliminarBiblio = (id: string) => {
    setBibliografias(bibliografias.filter((b) => b.id !== id));
  };

  const handleCambiarBiblio = (id: string, texto: string) => {
    setBibliografias(
      bibliografias.map((b) => (b.id === id ? { ...b, texto } : b))
    );
  };

  // Manejadores de Fuentes Electrónicas
  const handleAgregarFuente = () => {
    setFuentesElectronicas([...fuentesElectronicas, { id: Date.now().toString(), texto: '' }]);
  };

  const handleEliminarFuente = (id: string) => {
    setFuentesElectronicas(fuentesElectronicas.filter((f) => f.id !== id));
  };

  const handleCambiarFuente = (id: string, texto: string) => {
    setFuentesElectronicas(
      fuentesElectronicas.map((f) => (f.id === id ? { ...f, texto } : f))
    );
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
            Referencias y fuentes
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
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-8">
        <div>
          <h3 className="text-base font-bold text-gray-900">Referencias bibliográficas y electrónicas</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Registre cada fuente utilizada en el programa. Mantenga un formato bibliográfico consistente.
          </p>
        </div>

        <form onSubmit={handleGuardar} className="space-y-10">
          
          {/* SECCIÓN 1: BIBLIOGRAFÍAS (FORMATO APA) */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-[#050758] tracking-wider border-b border-gray-100 pb-2">
              1. Bibliografías (Formato APA)
            </h4>

            <div className="space-y-4">
              {bibliografias.map((biblio, index) => (
                <div
                  key={biblio.id}
                  className="border border-gray-200 rounded-xl p-4 bg-white focus-within:border-[#050758] transition space-y-2 relative shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider text-gray-400">
                      Bibliografía {index + 1} *
                    </span>
                    <button
                      type="button"
                      onClick={() => handleEliminarBiblio(biblio.id)}
                      className="text-gray-300 hover:text-red-600 transition p-1 cursor-pointer"
                      title="Eliminar bibliografía"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    value={biblio.texto}
                    onChange={(e) => handleCambiarBiblio(biblio.id, e.target.value)}
                    placeholder="Escribe acá la referencia en formato APA..."
                    className="w-full text-xs text-gray-800 bg-transparent focus:outline-none resize-none leading-relaxed placeholder:text-gray-400"
                  />
                </div>
              ))}
            </div>

            <div>
              <button
                type="button"
                onClick={handleAgregarBiblio}
                className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:border-[#050758] text-[#050758] text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Agregar bibliografía
              </button>
            </div>
          </div>

          {/* SECCIÓN 2: FUENTES ELECTRÓNICAS */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold text-[#050758] uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-1.5">
              2. Fuentes electrónicas y sitios Web
            </h4>

            <div className="space-y-4">
              {fuentesElectronicas.map((fuente, index) => (
                <div
                  key={fuente.id}
                  className="border border-gray-200 rounded-xl p-4 bg-white focus-within:border-[#050758] transition space-y-2 relative shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Fuente electrónica {index + 1} *
                    </span>
                    <button
                      type="button"
                      onClick={() => handleEliminarFuente(fuente.id)}
                      className="text-gray-300 hover:text-red-600 transition p-1 cursor-pointer"
                      title="Eliminar fuente electrónica"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <textarea
                    rows={2}
                    value={fuente.texto}
                    onChange={(e) => handleCambiarFuente(fuente.id, e.target.value)}
                    placeholder="Escribe acá el enlace, repositorio o sitio web oficial..."
                    className="w-full text-xs text-gray-800 bg-transparent focus:outline-none resize-none leading-relaxed placeholder:text-gray-400"
                  />
                </div>
              ))}
            </div>

            <div>
              <button
                type="button"
                onClick={handleAgregarFuente}
                className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:border-[#050758] text-[#050758] text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Agregar fuente electrónica
              </button>
            </div>
          </div>

          {/* Pie de Formulario: Mensaje de éxito, Botón Salir y Botón Guardar */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              {guardadoExitoso ? (
                <span className="inline-flex items-center gap-1.5 text-[#2D5A1E] font-bold bg-[#8CB83C]/20 px-3 py-1.5 rounded-lg transition-all animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-[#4C8C23]" />
                  ¡Referencias guardadas con éxito!
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
                className="inline-flex items-center gap-2 bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-sm transition cursor-pointer justify-center"
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

      {/* Modal de Confirmación de Salida (Llamado correctamente) */}
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