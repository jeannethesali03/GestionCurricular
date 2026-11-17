import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Info, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ModalAlertaSalida } from '../../components/modals/ModalAlertaSalida';

export const GeneralidadesAsignatura: React.FC = () => {
  const { asignaturaId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Estados para los campos de generalidades
  const [nombre, setNombre] = useState('Programación I');
  const [codigo, setCodigo] = useState('PRG101');
  const [prerrequisito, setPrerrequisito] = useState('Sin prerrequisito');
  const [ciclo, setCiclo] = useState('I');
  const [horasCiclo, setHorasCiclo] = useState('80');
  const [horasTeoricas, setHorasTeoricas] = useState('3');
  const [duracionSemanas, setDuracionSemanas] = useState('20');
  const [duracionClase, setDuracionClase] = useState('50 minutos');
  const [cantidadUv, setCantidadUv] = useState('4');

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
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Encabezado y Botón Volver */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
            Generalidades
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

      {/* Alerta de Cambios Guardados con Éxito */}
      {guardadoExitoso && (
        <div className="bg-[#8CB83C]/20 border border-[#8CB83C] text-[#2D5A1E] rounded-xl px-4 py-3.5 flex items-center gap-3 transition-all">
          <CheckCircle2 className="w-5 h-5 text-[#4C8C23] shrink-0" />
          <p className="text-xs font-bold">Cambios guardados con éxito</p>
        </div>
      )}

      {/* Contenedor Principal de Generalidades */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-6">
        <div>
          <h3 className="text-base font-bold text-gray-900">Generalidades</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Información estructural, horas y valor académico de la asignatura.
          </p>
        </div>

        <form onSubmit={handleGuardar} className="space-y-5">
          {/* Fila 1: Nombre y Código */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#050758] transition">
              <label className="text-[10px] font-medium text-gray-400 block mb-0.5">Nombre *</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full text-xs font-medium text-gray-800 bg-transparent focus:outline-none"
              />
            </div>
            <div className="border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#050758] transition">
              <label className="text-[10px] font-medium text-gray-400 block mb-0.5">Código *</label>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="w-full text-xs font-medium text-gray-800 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* Fila 2: Prerrequisito y Ciclo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#050758] transition">
              <label className="text-[10px] font-medium text-gray-400 block mb-0.5">Prerrequisito *</label>
              <select
                value={prerrequisito}
                onChange={(e) => setPrerrequisito(e.target.value)}
                className="w-full text-xs font-medium text-gray-800 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="Sin prerrequisito">Sin prerrequisito</option>
                <option value="Fundamentos de Informática">Fundamentos de Informática</option>
                <option value="Matemática I">Matemática I</option>
              </select>
            </div>
            <div className="border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#050758] transition">
              <label className="text-[10px] font-medium text-gray-400 block mb-0.5">Ciclo *</label>
              <select
                value={ciclo}
                onChange={(e) => setCiclo(e.target.value)}
                className="w-full text-xs font-medium text-gray-800 bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="I">I</option>
                <option value="II">II</option>
                <option value="III">III</option>
                <option value="IV">IV</option>
                <option value="V">V</option>
                <option value="VI">VI</option>
                <option value="VII">VII</option>
                <option value="VIII">VIII</option>
              </select>
            </div>
          </div>

          {/* Fila 3: Horas por ciclo y Horas teóricas por semana */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#050758] transition">
              <label className="text-[10px] font-medium text-gray-400 block mb-0.5">Horas por ciclo *</label>
              <input
                type="text"
                value={horasCiclo}
                onChange={(e) => setHorasCiclo(e.target.value)}
                className="w-full text-xs font-medium text-gray-800 bg-transparent focus:outline-none"
              />
            </div>
            <div className="border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#050758] transition">
              <label className="text-[10px] font-medium text-gray-400 block mb-0.5">Horas teóricas por semana *</label>
              <input
                type="text"
                value={horasTeoricas}
                onChange={(e) => setHorasTeoricas(e.target.value)}
                className="w-full text-xs font-medium text-gray-800 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* Fila 4: Duración del ciclo en semanas y Duración de la hora clase */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#050758] transition">
              <label className="text-[10px] font-medium text-gray-400 block mb-0.5">Duración del ciclo en semanas *</label>
              <input
                type="text"
                value={duracionSemanas}
                onChange={(e) => setDuracionSemanas(e.target.value)}
                className="w-full text-xs font-medium text-gray-800 bg-transparent focus:outline-none"
              />
            </div>
            <div className="border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#050758] transition">
              <label className="text-[10px] font-medium text-gray-400 block mb-0.5">Duración de la hora clase *</label>
              <input
                type="text"
                value={duracionClase}
                onChange={(e) => setDuracionClase(e.target.value)}
                className="w-full text-xs font-medium text-gray-800 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* Fila 5: Cantidad de UV y Facultad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-xl px-3.5 py-2.5 focus-within:border-[#050758] transition">
              <label className="text-[10px] font-medium text-gray-400 block mb-0.5">Cantidad de UV *</label>
              <input
                type="text"
                value={cantidadUv}
                onChange={(e) => setCantidadUv(e.target.value)}
                className="w-full text-xs font-medium text-gray-800 bg-transparent focus:outline-none"
              />
            </div>
            <div className="border border-gray-200 rounded-xl px-3.5 py-2.5 bg-gray-50/50">
              <label className="text-[10px] font-medium text-gray-400 block mb-0.5">Facultad</label>
              <input
                type="text"
                disabled
                value={user.facultadNombre || 'Ingeniería y Tecnología'}
                className="w-full text-xs font-medium text-gray-500 bg-transparent focus:outline-none cursor-not-allowed"
              />
            </div>
          </div>

          {/* Banner Informativo Inferior */}
          <div className="bg-[#F2F4FB] border border-[#050758]/10 rounded-xl px-4 py-3.5 flex items-center gap-3">
            <Info className="w-4 h-4 text-[#050758] shrink-0" />
            <p className="text-xs font-semibold text-[#050758]">
              Carga semanal: 3 horas teóricas y 1 hora práctica. Total: 80 horas por ciclo.
            </p>
          </div>

          {/* Pie de Formulario: Estado, Botón Salir y Botón Guardar */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-400">
              Cambios sin guardar · visibles en esta versión de trabajo
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