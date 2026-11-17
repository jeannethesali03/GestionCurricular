import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginPage } from '../pages/auth/LoginPage';
import { MainLayout } from '../components/MainLayout';


/* USUARIO */
import { Perfil } from '../pages/Perfil';

/* ASIGNATURA */

import { AsignaturasUsuario } from '../pages/asignaturas/AsignaturasUsuario';
import { CatalogoAsignaturasUsuario } from '../pages/asignaturas/CatalogoAsignaturasUsuario';
import { DetalleAsignatura } from '../pages/asignaturas/DetalleAsignatura';
import { ObjetivosAsignatura } from '../pages/asignaturas/ObjetivosAsignatura';
import { GeneralidadesAsignatura } from '../pages/asignaturas/GeneralidadesAsignatura';
import { DescripcionAsignatura } from '../pages/asignaturas/DescripcionAsignatura';
import { UnidadesDidacticas } from '../pages/asignaturas/UnidadesDidacticas';
import { EstrategiaMetodologica } from '../pages/asignaturas/EstrategiaMetodologica';
import { EvaluacionAsignatura } from '../pages/asignaturas/EvaluacionAsignatura';
import { ReferenciasAsignatura } from '../pages/asignaturas/ReferenciasAsignatura';

/* PLAN */

import { Planes } from '../pages/planes/Planes';
import { DetallePlan } from '../pages/planes/DetallePlan';
import { GeneralidadesPlan } from '../pages/planes/GeneralidadesPlan';
import { FundamentacionPlan } from '../pages/planes/FundamentacionPlan';
import { JustificacionPlan } from '../pages/planes/JustificacionPlan';
import { ObjetivosPlan } from '../pages/planes/ObjetivosPlan';
import { PerfilIngresoPlan } from '../pages/planes/PerfilIngresoPlan';
import { PerfilProfesionalPlan } from '../pages/planes/PerfilProfesionalPlan';
import { MaterialesDidacticosPlan } from '../pages/planes/MaterialesDidacticosPlan';
import { EstructuraCurricularPlan } from '../pages/planes/EstructuraCurricularPlan';
import { PlanAbsorcionPlan } from '../pages/planes/PlanAbsorcionPlan';
import { ProgramasAsignaturaPlan } from '../pages/planes/ProgramasAsignaturaPlan';
import { ServicioSocialPlan } from '../pages/planes/ServicioSocialPlan';
import { EvaluacionAprendizajesPlan } from '../pages/planes/EvaluacionAprendizajesPlan';
import { TematicaLeyPlan } from '../pages/planes/TematicaLeyPlan';
import { OrientacionMetodologica } from '../pages/planes/OrientacionMetodologica'; 
import { CondicionesPermanencia } from '../pages/planes/CondicionesPermanencia';
import { ProgramacionActividades } from '../pages/planes/ProgramacionActividades';
import { MatrizCongruencia } from '../pages/planes/MatrizCongruencia';


const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Vistas protegidas dentro del diseño institucional con barra lateral por rol */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
        /* USUARIO */
          <Route path="/perfil" element={<Perfil />} />

        /* ASIGNATURA */
          <Route path="/asignaturas" element={<AsignaturasUsuario />} />
          <Route path="/catalogo" element={<CatalogoAsignaturasUsuario />} />
          <Route path="/asignaturas/:asignaturaId" element={<DetalleAsignatura />} />
          <Route path="/asignaturas/:asignaturaId/objetivos" element={<ObjetivosAsignatura />} />
          <Route path="/asignaturas/:asignaturaId/generalidades" element={<GeneralidadesAsignatura />} />
          <Route path="/asignaturas/:asignaturaId/descripcion" element={<DescripcionAsignatura />} />
          <Route path="/asignaturas/:asignaturaId/unidades" element={<UnidadesDidacticas />} />
          <Route path="/asignaturas/:asignaturaId/estrategia" element={<EstrategiaMetodologica />} />
          <Route path="/asignaturas/:asignaturaId/evaluacion" element={<EvaluacionAsignatura />} />
          <Route path="/asignaturas/:asignaturaId/referencias" element={<ReferenciasAsignatura />} />
          <Route path="/planes/:planId" element={<DetallePlan />} />

        /* PLAN */
          <Route path="/planes" element={<Planes />} />
          <Route path="/planes/:planId/generalidades-carrera" element={<GeneralidadesPlan />} />
          <Route path="/planes/:planId/fundamentacion" element={<FundamentacionPlan />} />
          <Route path="/planes/:planId/justificacion" element={<JustificacionPlan />} />
          <Route path="/planes/:planId/objetivos-carrera" element={<ObjetivosPlan />} />
          <Route path="/planes/:planId/perfil-ingreso" element={<PerfilIngresoPlan />} />
          <Route path="/planes/:planId/perfil-profesional" element={<PerfilProfesionalPlan />} />
          <Route path="/planes/:planId/materiales" element={<MaterialesDidacticosPlan />} />
          <Route path="/planes/:planId/estructura-curricular" element={<EstructuraCurricularPlan />} />
          <Route path="/planes/:planId/plan-absorcion" element={<PlanAbsorcionPlan />} />
          <Route path="/planes/:planId/programas-asignatura" element={<ProgramasAsignaturaPlan />} />
          <Route path="/planes/:planId/practicas" element={<ServicioSocialPlan />} />
          <Route path="/planes/:planId/evaluacion-aprendizajes" element={<EvaluacionAprendizajesPlan />} />
          <Route path="/planes/:planId/tematica-ley" element={<TematicaLeyPlan />} />
          <Route path="/planes/:planId/orientaciones" element={<OrientacionMetodologica />} />
          <Route path="/planes/:planId/permanencia" element={<CondicionesPermanencia />} />
          <Route path="/planes/:planId/programacion-actividades" element={<ProgramacionActividades />} />
          <Route path="/planes/:planId/matriz-congruencia" element={<MatrizCongruencia />} />
          

          {/* Ruta provisional para expediente de plan */}
          <Route
            path="/planes/:planId"
            element={<div className="p-4 text-sm text-gray-600">Vista de expediente del plan (próxima pantalla)</div>}
          />
        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/planes" replace />} />
      </Routes>
    </BrowserRouter>
  );
};