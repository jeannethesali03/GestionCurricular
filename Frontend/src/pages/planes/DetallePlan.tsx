import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export interface SeccionPlan {
  id: string;
  numero: string;
  titulo: string;
  descripcion: string;
  estado: 'Completa' | 'Pendiente';
  ruta: string;
}

export const DetallePlan: React.FC = () => {
  const { planId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // 17 secciones del plan de estudio sin íconos
  const [secciones, setSecciones] = useState<SeccionPlan[]>([
    { id: '01', numero: 'SECCIÓN 01', titulo: 'Generalidades de la carrera', descripcion: '6 campos · Datos académicos', estado: 'Completa', ruta: 'generalidades-carrera' },
    { id: '02', numero: 'SECCIÓN 02', titulo: 'Fundamentación de la carrera', descripcion: 'Marco institucional y pedagógico', estado: 'Completa', ruta: 'fundamentacion' },
    { id: '03', numero: 'SECCIÓN 03', titulo: 'Justificación de la carrera', descripcion: 'Pertinencia social y profesional', estado: 'Completa', ruta: 'justificacion' },
    { id: '04', numero: 'SECCIÓN 04', titulo: 'Objetivos de la carrera', descripcion: 'Objetivo general y 3 específicos', estado: 'Completa', ruta: 'objetivos-carrera' },
    { id: '05', numero: 'SECCIÓN 05', titulo: 'Perfil de ingreso', descripcion: '3 capacidades de ingreso', estado: 'Completa', ruta: 'perfil-ingreso' },
    { id: '06', numero: 'SECCIÓN 06', titulo: 'Perfil profesional', descripcion: '3 ámbitos profesionales', estado: 'Completa', ruta: 'perfil-profesional' },
    { id: '07', numero: 'SECCIÓN 07', titulo: 'Estructura y normativa curricular', descripcion: 'Malla, ciclo y equivalencias', estado: 'Completa', ruta: 'estructura-curricular' },
    { id: '08', numero: 'SECCIÓN 08', titulo: 'Programas de cada asignatura', descripcion: '6 programas vinculados', estado: 'Completa', ruta: 'programas-asignatura' },
    { id: '09', numero: 'SECCIÓN 09', titulo: 'Materiales didácticos', descripcion: 'Recursos para el aprendizaje', estado: 'Completa', ruta: 'materiales' },
    { id: '10', numero: 'SECCIÓN 10', titulo: 'Servicio social y prácticas profesionales', descripcion: 'Vinculación y práctica profesional', estado: 'Completa', ruta: 'practicas' },
    { id: '11', numero: 'SECCIÓN 11', titulo: 'Orientaciones metodológicas', descripcion: 'Enfoque y orientaciones', estado: 'Completa', ruta: 'orientaciones' },
    { id: '12', numero: 'SECCIÓN 12', titulo: 'Evaluación de los aprendizajes', descripcion: 'Criterios e instrumentos', estado: 'Completa', ruta: 'evaluacion-aprendizajes' },
    { id: '13', numero: 'SECCIÓN 13', titulo: 'Condiciones y requisitos de permanencia y graduación', descripcion: 'Trayectoria y titulación', estado: 'Completa', ruta: 'permanencia' },
    { id: '14', numero: 'SECCIÓN 14', titulo: 'Abordaje de temática de ley', descripcion: 'Legislación y transversalidad', estado: 'Completa', ruta: 'tematica-ley' },
    { id: '15', numero: 'SECCIÓN 15', titulo: 'Plan de absorción', descripcion: 'Políticas y equivalencias internas', estado: 'Completa', ruta: 'plan-absorcion' },
    { id: '16', numero: 'SECCIÓN 16', titulo: 'Programación de actividades', descripcion: '2 áreas · 5 actividades', estado: 'Completa', ruta: 'programacion-actividades' },
    { id: '17', numero: 'SECCIÓN 17', titulo: 'Matriz de congruencia', descripcion: '3 objetivos · 6 asignaturas', estado: 'Pendiente', ruta: 'matriz-congruencia' },
  ]);

  if (!user) return null;

  // Cálculo de completitud
  const totalSecciones = secciones.length;
  const completadas = secciones.filter((s) => s.estado === 'Completa').length;
  const porcentaje = Math.round((completadas / totalSecciones) * 100);
  const es100Porciento = porcentaje === 100;

  const handleCardClick = (ruta: string) => {
    navigate(`/planes/${planId || 'ISI-2027'}/${ruta}`);
  };

  const handleDescargarReporte = () => {
    if (!es100Porciento) return;
    alert('Generando e iniciando descarga del reporte institucional en formato Word (.docx)...');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Encabezado del Plan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
              Ingeniería en Sistemas
            </h2>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-gray-500" />
              Borrador
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            Ingeniería y Tecnología · ISI-2027 · Versión 2027–2031
          </p>
        </div>
      </div>

      {/* Tarjeta de Completitud del Plan y Barra de Progreso */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              ESTADO DEL EXPEDIENTE
            </p>
            <h3 className="text-sm font-bold text-gray-900">Completitud del plan</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-extrabold text-[#050758]">{porcentaje}%</span>
            <span className="text-xs font-medium text-gray-500">
              {completadas} de {totalSecciones} secciones completas · {totalSecciones - completadas} sección pendiente
            </span>
          </div>
        </div>

        {/* Barra de Progreso Dinámica */}
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-[#8CB83C] h-full rounded-full transition-all duration-500"
            style={{ width: `${porcentaje}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
          <span>Coordinación Académica: <strong>Carlos Ruiz</strong> (Colaboradores: Lucía, Diego y Ana)</span>
          <span className="font-semibold text-[#050758]">Módulo Planes / Expediente Curricular</span>
        </div>
      </div>

      {/* Listado de Secciones del Plan de Estudio (Sin Íconos) */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Secciones del plan de estudio
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {totalSecciones} secciones · Selecciona una para editar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {secciones.map((sec) => {
            const esCompleta = sec.estado === 'Completa';
            return (
              <div
                key={sec.id}
                onClick={() => handleCardClick(sec.ruta)}
                className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-4 hover:border-[#050758] hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{sec.numero}</span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#050758] transition">
                    {sec.titulo}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">{sec.descripcion}</p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${esCompleta ? 'text-emerald-700' : 'text-amber-700'}`}>
                    <span className={`w-2 h-2 rounded-full ${esCompleta ? 'bg-emerald-600' : 'bg-amber-500'}`} />
                    {sec.estado}
                  </span>

                  <span className="text-xs text-[#050758] font-semibold group-hover:underline">
                    Abrir sección →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN INFERIOR: REPORTE INSTITUCIONAL */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">Reporte institucional</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Completa las 17 secciones para habilitar el reporte institucional.
          </p>
        </div>

        {!es100Porciento && (
          <div className="bg-[#050758] text-white rounded-xl px-4 py-3.5 flex items-center justify-between">
            <p className="text-xs font-medium">
              Falta sección 17: Matriz de congruencia. Asigna materias a los objetivos específicos 2 y 3 para habilitar la descarga.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-400">
            {es100Porciento 
              ? 'El expediente está completo y listo para exportación.' 
              : 'El botón de descarga se habilitará automáticamente al alcanzar el 100%.'}
          </p>

          <button
            type="button"
            disabled={!es100Porciento}
            onClick={handleDescargarReporte}
            className={`text-xs font-bold px-6 py-3 rounded-xl shadow-sm transition ${
              es100Porciento
                ? 'bg-[#050758] hover:bg-[#090c7a] text-white cursor-pointer'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Descargar Reporte Word
          </button>
        </div>
      </div>
    </div>
  );
};