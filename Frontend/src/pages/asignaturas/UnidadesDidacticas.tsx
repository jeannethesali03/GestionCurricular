import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Save, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ModalAlertaSalida } from '../../components/modals/ModalAlertaSalida';

export interface ContenidoItem {
  id: string;
  texto: string;
  descripcion: string;
}

export interface UnidadItem {
  id: string;
  titulo: string;
  objetivo: string;
  contenidos: ContenidoItem[];
}

export const UnidadesDidacticas: React.FC = () => {
  const { asignaturaId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [unidades, setUnidades] = useState<UnidadItem[]>([
    {
      id: '1',
      titulo: '',
      objetivo: '',
      contenidos: [
        {
          id: 'c1',
          texto: '',
          descripcion: '',
        },
      ],
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

  // Manejo de Unidades
  const handleAgregarUnidad = () => {
    const nuevaUnidad: UnidadItem = {
      id: Date.now().toString(),
      titulo: '',
      objetivo: '',
      contenidos: [
        {
          id: Date.now() + 'c',
          texto: '',
          descripcion: '',
        },
      ],
    };
    setUnidades([...unidades, nuevaUnidad]);
  };

  const handleEliminarUnidad = (id: string) => {
    setUnidades(unidades.filter((u) => u.id !== id));
  };

  const handleActualizarUnidad = (id: string, campo: 'titulo' | 'objetivo', valor: string) => {
    setUnidades(
      unidades.map((u) => (u.id === id ? { ...u, [campo]: valor } : u))
    );
  };

  // Manejo de Contenidos por Unidad
  const handleAgregarContenido = (unidadId: string) => {
    setUnidades(
      unidades.map((u) => {
        if (u.id === unidadId) {
          const nuevoContenido: ContenidoItem = {
            id: Date.now().toString(),
            texto: '',
            descripcion: '',
          };
          return { ...u, contenidos: [...u.contenidos, nuevoContenido] };
        }
        return u;
      })
    );
  };

  const handleEliminarContenido = (unidadId: string, contenidoId: string) => {
    setUnidades(
      unidades.map((u) => {
        if (u.id === unidadId) {
          return {
            ...u,
            contenidos: u.contenidos.filter((c) => c.id !== contenidoId),
          };
        }
        return u;
      })
    );
  };

  const handleActualizarContenido = (
    unidadId: string,
    contenidoId: string,
    campo: 'texto' | 'descripcion',
    valor: string
  ) => {
    setUnidades(
      unidades.map((u) => {
        if (u.id === unidadId) {
          const contenidosActualizados = u.contenidos.map((c) =>
            c.id === contenidoId ? { ...c, [campo]: valor } : c
          );
          return { ...u, contenidos: contenidosActualizados };
        }
        return u;
      })
    );
  };

  const handleGuardarPrincipal = (e: React.FormEvent) => {
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
            Unidades didácticas y contenido
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
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Unidades didácticas y contenido</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Estructura curricular dividida por unidades de aprendizaje y sus contenidos con descripción opcional.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAgregarUnidad}
            className="inline-flex items-center gap-2 bg-[#050758] hover:bg-[#090c7a] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Agregar unidad
          </button>
        </div>

        <form onSubmit={handleGuardarPrincipal} className="space-y-8">
          {/* Listado de Unidades */}
          <div className="space-y-6">
            {unidades.map((unidad, indexUnidad) => (
              <div
                key={unidad.id}
                className="border border-gray-200 rounded-2xl p-6 bg-gray-50/40 space-y-5 relative shadow-xs"
              >
                {/* Cabecera de la Unidad */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <h4 className="text-sm font-extrabold text-[#050758]">
                    Unidad {indexUnidad + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleEliminarUnidad(unidad.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar unidad
                  </button>
                </div>

                {/* Título de la Unidad */}
                <div className="border border-gray-200 rounded-xl p-3 bg-white focus-within:border-[#050758] transition">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={unidad.titulo}
                    onChange={(e) => handleActualizarUnidad(unidad.id, 'titulo', e.target.value)}
                    placeholder="Escribe acá el título de la unidad..."
                    className="w-full text-xs font-semibold text-gray-900 bg-transparent focus:outline-none placeholder:text-gray-400"
                  />
                </div>

                {/* Objetivo de la Unidad */}
                <div className="border border-gray-200 rounded-xl p-3 bg-white focus-within:border-[#050758] transition">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Objetivo *
                  </label>
                  <textarea
                    rows={2}
                    value={unidad.objetivo}
                    onChange={(e) => handleActualizarUnidad(unidad.id, 'objetivo', e.target.value)}
                    placeholder="Escribe acá el objetivo de la unidad..."
                    className="w-full text-xs text-gray-800 bg-transparent focus:outline-none resize-none leading-relaxed placeholder:text-gray-400"
                  />
                </div>

                {/* Sección de Contenidos */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      Contenidos y descripciones de la unidad
                    </label>
                    <button
                      type="button"
                      onClick={() => handleAgregarContenido(unidad.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#050758] bg-white border border-gray-200 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Agregar contenido
                    </button>
                  </div>

                  {unidad.contenidos.length === 0 ? (
                    <div className="p-4 border border-dashed border-gray-300 rounded-xl text-center text-xs text-gray-400 bg-white">
                      No hay contenidos en esta unidad. Haz clic en "Agregar contenido".
                    </div>
                  ) : (
                    unidad.contenidos.map((cont, indexContenido) => (
                      <div
                        key={cont.id}
                        className="border border-gray-200 rounded-xl p-4 bg-white space-y-3 shadow-2xs relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                            Contenido {indexContenido + 1} *
                          </span>
                          <button
                            type="button"
                            onClick={() => handleEliminarContenido(unidad.id, cont.id)}
                            className="text-gray-300 hover:text-red-600 transition p-1 cursor-pointer"
                            title="Eliminar contenido"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Campo de Contenido */}
                        <div className="border border-gray-200 rounded-xl p-3 bg-gray-50/40 focus-within:border-[#050758] transition">
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                            Contenido *
                          </label>
                          <textarea
                            rows={2}
                            value={cont.texto}
                            onChange={(e) =>
                              handleActualizarContenido(unidad.id, cont.id, 'texto', e.target.value)
                            }
                            placeholder="Escribe acá el contenido..."
                            className="w-full text-xs text-gray-800 bg-transparent focus:outline-none resize-none leading-relaxed placeholder:text-gray-400"
                          />
                        </div>

                        {/* Campo Opcional de Descripción */}
                        <div className="border border-gray-200 rounded-xl p-3 bg-white focus-within:border-[#050758] transition">
                          <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                            Descripción (Opcional)
                          </label>
                          <textarea
                            rows={2}
                            value={cont.descripcion}
                            onChange={(e) =>
                              handleActualizarContenido(unidad.id, cont.id, 'descripcion', e.target.value)
                            }
                            placeholder="Escribe acá la descripción o actividades opcionales..."
                            className="w-full text-xs text-gray-800 bg-transparent focus:outline-none resize-none leading-relaxed placeholder:text-gray-400"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pie de Formulario: Guardado y Botones */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              {guardadoExitoso ? (
                <span className="inline-flex items-center gap-1.5 text-[#2D5A1E] font-bold bg-[#8CB83C]/20 px-3 py-1.5 rounded-lg transition-all">
                  <CheckCircle2 className="w-4 h-4 text-[#4C8C23]" />
                  ¡Unidades didácticas guardadas con éxito!
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