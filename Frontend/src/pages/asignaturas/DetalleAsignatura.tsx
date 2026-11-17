import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, AlignLeft, Target, Layers, Compass, CheckSquare, BookOpen, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';


export const DetalleAsignatura: React.FC = () => {
  const { asignaturaId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const seccionesAsignatura = [
    {
      id: '01',
      titulo: 'Generalidades',
      descripcion: 'Datos, horas, UV y prerrequisitos',
      estado: 'Completa',
      icono: FileText,
      ruta: 'generalidades',
      
    },
    {
      id: '02',
      titulo: 'Descripción',
      descripcion: 'Enfoque y alcance de la asignatura',
      estado: 'Completa',
      icono: AlignLeft,
      ruta: 'descripcion',
    },
    {
      id: '03',
      titulo: 'Objetivos de la asignatura',
      descripcion: 'General y 3 objetivos específicos',
      estado: 'Completa',
      icono: Target,
      ruta: 'objetivos', // <--- Ruta asignada para Objetivos
    },
    {
      id: '04',
      titulo: 'Unidades didácticas y contenido',
      descripcion: '3 unidades de aprendizaje',
      estado: 'Completa',
      icono: Layers,
      ruta: 'unidades',
    },
    {
      id: '05',
      titulo: 'Estrategia metodológica',
      descripcion: 'Aprendizaje activo y laboratorio',
      estado: 'Completa',
      icono: Compass,
      ruta: 'estrategia',
    },
    {
      id: '06',
      titulo: 'Evaluación',
      descripcion: 'Criterios, instrumentos y ponderaciones',
      estado: 'Completa',
      icono: CheckSquare,
      ruta: 'evaluacion',
    },
    {
      id: '07',
      titulo: 'Referencias bibliográficas',
      descripcion: '3 referencias académicas',
      estado: 'Completa',
      icono: BookOpen,
      ruta: 'referencias',
    },
  ];

const handleCardClick = (ruta: string) => {
  if (ruta === 'generalidades') {
    navigate(`/asignaturas/${asignaturaId || 'PRG101'}/generalidades`);
  } else if (ruta === 'descripcion') {
    navigate(`/asignaturas/${asignaturaId || 'PRG101'}/descripcion`);
  } else if (ruta === 'objetivos') {
    navigate(`/asignaturas/${asignaturaId || 'PRG101'}/objetivos`);
  } else if (ruta === 'unidades') {
    navigate(`/asignaturas/${asignaturaId || 'PRG101'}/unidades`);
  } else if (ruta === 'estrategia') {
    navigate(`/asignaturas/${asignaturaId || 'PRG101'}/estrategia`);
  } else if (ruta === 'evaluacion') {
    navigate(`/asignaturas/${asignaturaId || 'PRG101'}/evaluacion`);
  } else if (ruta === 'referencias') {
    navigate(`/asignaturas/${asignaturaId || 'PRG101'}/referencias`);
  } else {
    alert(`Vista de ${ruta} en desarrollo`);
  }
};

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
            Programación I
          </h2>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            Asignada
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1 font-medium">
          PRG101 · Ciclo I · 4 UV · Ingeniería y Tecnología
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            PLAN VINCULADO
          </p>
          <h3 className="text-base font-bold text-gray-900">Ingeniería en Sistemas</h3>
          <p className="text-xs text-gray-500">
            ISI-2027 · Modalidad presencial
          </p>
        </div>

        <div className="space-y-1 md:border-x md:border-gray-200 md:px-8">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            RESPONSABLE DEL PROGRAMA
          </p>
          <h3 className="text-xs font-bold text-gray-900">Lucía Méndez</h3>
          <p className="text-[11px] text-gray-400">Actualizado: 19 oct 2026</p>
        </div>

        <div className="text-left md:text-right">
          <p className="text-3xl font-extrabold text-[#050758]">100%</p>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            7 de 7 completas
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Secciones del programa de asignatura
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Estructura curricular y contenidos evaluables del programa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {seccionesAsignatura.map((sec) => {
            const IconoComponente = sec.icono;
            return (
              <div
                key={sec.id}
                onClick={() => handleCardClick(sec.ruta)}
                className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-4 hover:border-[#050758] hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#F3F4F8] text-[#050758] flex items-center justify-center group-hover:bg-[#050758] group-hover:text-white transition">
                    <IconoComponente className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-gray-400">{sec.id}</span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#050758] transition">
                    {sec.titulo}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">{sec.descripcion}</p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    {sec.estado}
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs text-[#050758] font-semibold">
                    <span>Editar</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};