import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Save, BookOpen, Upload, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ModalReferencia } from '../../components/modals/ModalReferencia';
import { ModalAlertaSalida } from '../../components/modals/ModalAlertaSalida';

interface MaterialItem {
  id: string;
  titulo: string;
  descripcion: string;
  imagenes: { id: string; url: string; nombre: string; tamano: string }[];
}

export const MaterialesDidacticosPlan: React.FC = () => {
  const { planId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [materiales, setMateriales] = useState<MaterialItem[]>([
    {
      id: '1',
      titulo: '',
      descripcion: '',
      imagenes: [],
    },
  ]);

  const [guardadoExitoso, setGuardadoExitoso] = useState(false);
  const [modalReferenciarAbierto, setModalReferenciarAbierto] = useState(false);

  // Estados para el modal de confirmación de salida
  const [modalSalidaAbierto, setModalSalidaAbierto] = useState(false);
  const [rutaDestinoPendiente, setRutaDestinoPendiente] = useState<string | null>(null);

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  if (!user) return null;

  const intentarSalir = (destino: string) => {
    setRutaDestinoPendiente(destino);
    setModalSalidaAbierto(true);
  };

  const handleAgregarMaterial = () => {
    setMateriales([
      ...materiales,
      {
        id: Date.now().toString(),
        titulo: '',
        descripcion: '',
        imagenes: [],
      },
    ]);
  };

  const handleEliminarMaterial = (id: string) => {
    if (materiales.length > 1) {
      setMateriales(materiales.filter((mat) => mat.id !== id));
    }
  };

  const handleCambiarMaterial = (id: string, campo: 'titulo' | 'descripcion', valor: string) => {
    setMateriales(
      materiales.map((mat) => (mat.id === id ? { ...mat, [campo]: valor } : mat))
    );
  };

  const handleSeleccionarImagenes = (materialId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const nuevaImagen = {
          id: `${Date.now()}-${Math.random()}`,
          url: uploadEvent.target?.result as string,
          nombre: file.name,
          tamano: `${Math.round(file.size / 1024)} KB`,
        };

        setMateriales((prev) =>
          prev.map((mat) =>
            mat.id === materialId
              ? { ...mat, imagenes: [...mat.imagenes, nuevaImagen] }
              : mat
          )
        );
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRefs.current[materialId]) {
      fileInputRefs.current[materialId]!.value = '';
    }
  };

  const handleQuitarImagen = (materialId: string, imgId: string) => {
    setMateriales(
      materiales.map((mat) =>
        mat.id === materialId
          ? { ...mat, imagenes: mat.imagenes.filter((img) => img.id !== imgId) }
          : mat
      )
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
            Materiales didácticos
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

      {/* Contenedor Principal */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 sm:p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
        <div>
          <h3 className="text-base font-bold text-gray-900">Materiales didácticos</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Recursos bibliográficos, guías de laboratorio y apoyo visual para el aprendizaje.
          </p>
        </div>

        <form onSubmit={handleGuardar} className="space-y-8">
          <div className="space-y-6">
            {materiales.map((mat, index) => {
              const numeroStr = String(index + 1).padStart(2, '0');
              return (
                <div
                  key={mat.id}
                  className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      MATERIAL DIDÁCTICO {numeroStr}
                    </span>
                    {materiales.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleEliminarMaterial(mat.id)}
                        className="text-gray-400 hover:text-red-600 transition p-1 cursor-pointer"
                        title="Eliminar material"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Título */}
                  <div className="border border-gray-200 rounded-xl p-3.5 bg-white focus-within:border-[#050758] transition">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Título del material *
                    </label>
                    <input
                      type="text"
                      value={mat.titulo}
                      onChange={(e) => handleCambiarMaterial(mat.id, 'titulo', e.target.value)}
                      placeholder="Escribe acá el título del material..."
                      className="w-full text-xs font-semibold text-gray-900 bg-transparent focus:outline-none placeholder:text-gray-400"
                    />
                  </div>

                  {/* Descripción */}
                  <div className="border border-gray-200 rounded-xl p-3.5 bg-white focus-within:border-[#050758] transition">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Descripción *
                    </label>
                    <textarea
                      rows={4}
                      value={mat.descripcion}
                      onChange={(e) => handleCambiarMaterial(mat.id, 'descripcion', e.target.value)}
                      placeholder="Escribe acá la descripción del material didáctico..."
                      className="w-full text-xs text-gray-800 bg-transparent focus:outline-none resize-y leading-relaxed placeholder:text-gray-400"
                    />
                  </div>

                  {/* Sección de Imágenes múltiples */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">Imágenes del material</h4>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          PNG o JPG · Máximo 5 MB · Puedes agregar una o varias fotos
                        </p>
                      </div>

                      <input
                        ref={(el) => {
                          fileInputRefs.current[mat.id] = el;
                        }}
                        type="file"
                        accept="image/png, image/jpeg"
                        multiple
                        onChange={(e) => handleSeleccionarImagenes(mat.id, e)}
                        className="hidden"
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[mat.id]?.click()}
                        className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:border-[#050758] text-[#050758] text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        Agregar fotos
                      </button>
                    </div>

                    {/* Galería de Vistas Previas */}
                    {mat.imagenes.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                        {mat.imagenes.map((img) => (
                          <div
                            key={img.id}
                            className="group relative rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 aspect-[3/4] flex flex-col justify-end shadow-xs"
                          >
                            <img
                              src={img.url}
                              alt={img.nombre}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-3 flex items-end justify-between">
                              <span className="text-[10px] text-white font-medium truncate max-w-[100px]">
                                {img.nombre}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQuitarImagen(mat.id, img.id)}
                                className="bg-white/90 hover:bg-white text-red-600 p-1.5 rounded-lg transition cursor-pointer shadow-sm"
                                title="Quitar imagen"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botón Agregar más materiales */}
          <div>
            <button
              type="button"
              onClick={handleAgregarMaterial}
              className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:border-[#050758] text-[#050758] text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Agregar material didáctico
            </button>
          </div>

          {/* Pie de Formulario */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              {guardadoExitoso ? (
                <span className="inline-flex items-center gap-1.5 text-[#2D5A1E] font-bold bg-[#8CB83C]/20 px-3 py-1.5 rounded-lg transition-all">
                  <CheckCircle2 className="w-4 h-4 text-[#4C8C23]" />
                  ¡Materiales didácticos guardados con éxito!
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
        <span className="font-semibold text-gray-500">09 / 17</span>
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