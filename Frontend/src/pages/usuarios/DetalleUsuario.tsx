import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Layers, Mail, Phone, GraduationCap, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DetalleUsuario: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  // Datos simulados del usuario consultado según el ID
  const usuarioConsultado = {
    id: id || '1',
    nombres: 'Lucía',
    apellidos: 'Méndez',
    email: 'lucia.mendez@catolica.edu.sv',
    telefono: '2224-0182',
    gradoAcademico: 'Licenciada en Ciencias de la Computación',
    experienciaEduSuperior: 5,
    facultad: 'Ingeniería y Tecnología',
    rol: 'Usuario Estándar',
    estado: 'Activo' as const,
    ultimoAcceso: '20 oct 2026, 09:18',
    planesAsignados: [
      { codigo: 'ING-2023', nombre: 'Ingeniería en Desarrollo de Software (Plan 2023)' },
      { codigo: 'SIS-2020', nombre: 'Ingeniería en Sistemas Informáticos (Plan 2020)' },
    ],
    asignaturasAsignadas: [
      { codigo: 'IDS-101', nombre: 'Introducción al Desarrollo de Software', ciclo: 'Ciclo I' },
      { codigo: 'POO-202', nombre: 'Programación Orientada a Objetos', ciclo: 'Ciclo III' },
    ],
  };

  if (!user) return null;

  const iniciales = `${usuarioConsultado.nombres[0]}${usuarioConsultado.apellidos[0]}`.toUpperCase();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Botón Volver y Encabezado */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/usuarios')}
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900 transition cursor-pointer bg-white border border-gray-200 px-3.5 py-2 rounded-xl shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al directorio
        </button>

        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          {usuarioConsultado.estado}
        </span>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-[#050758] tracking-tight">
          Detalle del Usuario
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Consulta de perfil institucional, datos académicos y asignaciones de planes y asignaturas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Tarjeta de Resumen */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] text-center space-y-4">
            <div className="w-20 h-20 bg-[#EEF0F8] text-[#050758] font-extrabold text-2xl rounded-full flex items-center justify-center mx-auto shadow-inner">
              {iniciales}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{usuarioConsultado.nombres} {usuarioConsultado.apellidos}</h3>
              <div className="inline-flex items-center gap-1.5 mt-1.5 px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-700">
                <span className="w-2 h-2 rounded-full bg-[#050758]" />
                {usuarioConsultado.rol}
              </div>
            </div>

            <div className="text-xs text-gray-500 pt-3 border-t border-gray-100 space-y-1.5 text-left">
              <div className="flex items-center gap-2 text-gray-700 font-medium">
                <GraduationCap className="w-4 h-4 text-[#050758] shrink-0" />
                <span>{usuarioConsultado.gradoAcademico}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{usuarioConsultado.experienciaEduSuperior} años de experiencia en educación superior</span>
              </div>
              <div className="pt-1 text-gray-600 font-medium">
                Facultad: <span className="text-gray-900">{usuarioConsultado.facultad}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-3">
            <h4 className="text-sm font-bold text-gray-900">Actividad de cuenta</h4>
            <div className="text-xs text-gray-600 space-y-2">
              <p className="text-[11px] text-gray-500">
                Último acceso al sistema: <span className="font-semibold text-gray-800">{usuarioConsultado.ultimoAcceso}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Información Completa y Asignaciones */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Datos Personales y de Contacto */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-5">
            <h3 className="text-base font-bold text-gray-900">Información de contacto e institucional</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 space-y-1">
                <span className="text-[10px] font-medium text-gray-400 block">Nombres</span>
                <p className="font-bold text-gray-800">{usuarioConsultado.nombres}</p>
              </div>

              <div className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 space-y-1">
                <span className="text-[10px] font-medium text-gray-400 block">Apellidos</span>
                <p className="font-bold text-gray-800">{usuarioConsultado.apellidos}</p>
              </div>

              <div className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 space-y-1">
                <span className="text-[10px] font-medium text-gray-400 block">Correo institucional</span>
                <div className="flex items-center gap-2 text-gray-800 font-bold">
                  <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>{usuarioConsultado.email}</span>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50 space-y-1">
                <span className="text-[10px] font-medium text-gray-400 block">Teléfono de contacto</span>
                <div className="flex items-center gap-2 text-gray-800 font-bold">
                  <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>{usuarioConsultado.telefono}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Asignaciones: Planes de Estudio */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#050758]" />
              <h3 className="text-base font-bold text-gray-900">Planes de estudio asignados ({usuarioConsultado.planesAsignados.length})</h3>
            </div>

            <div className="space-y-2.5">
              {usuarioConsultado.planesAsignados.map((plan, index) => (
                <div key={index} className="border border-gray-200/80 rounded-xl p-3.5 bg-gray-50/40 text-xs">
                  <span className="font-extrabold text-[#050758]">{plan.codigo}</span>
                  <p className="font-medium text-gray-800 mt-0.5">{plan.nombre}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Asignaciones: Asignaturas */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#050758]" />
              <h3 className="text-base font-bold text-gray-900">Asignaturas asignadas ({usuarioConsultado.asignaturasAsignadas.length})</h3>
            </div>

            <div className="space-y-2.5">
              {usuarioConsultado.asignaturasAsignadas.map((asig, index) => (
                <div key={index} className="border border-gray-200/80 rounded-xl p-3.5 flex items-center justify-between bg-gray-50/40 text-xs">
                  <div>
                    <span className="font-extrabold text-[#050758]">{asig.codigo}</span>
                    <p className="font-medium text-gray-800 mt-0.5">{asig.nombre}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-gray-600 font-semibold">
                    {asig.ciclo}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};