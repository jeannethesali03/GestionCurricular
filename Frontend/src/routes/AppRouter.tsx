import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginPage } from '../pages/auth/LoginPage';
import { MainLayout } from '../components/MainLayout';
import { LayoutEdicionPlan } from '../components/layout/LayoutEdicionPlan';

/* USUARIO */
import { Perfil } from '../pages/usuarios/Perfil';
import { GestionUsuario } from '../pages/usuarios/GestionUsuario';
import { CrearUsuario } from '../pages/usuarios/CrearUsuario';
import { EditarUsuario } from '../pages/usuarios/EditarUsuario';
import { DesactivarUsuario } from '../pages/usuarios/DesactivarUsuario';
import { DetalleUsuario } from '../pages/usuarios/DetalleUsuario';

/* ASIGNATURA */
import { AsignaturasUsuario } from '../pages/asignaturas/AsignaturasUsuario';
import { CrearAsignatura } from '../pages/asignaturas/CrearAsignatura';
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
import { CrearPlanEstudio } from '../pages/planes/CrearPlanEstudio';
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

/* ASIGNACION */
import { ListadoAsignaciones } from '../pages/asignacion/ListadoAsignaciones';
import { CrearAsignacion } from '../pages/asignacion/CrearAsignacion';
import { EditarAsignacion } from '../pages/asignacion/EditarAsignacion';

/* AUDITORIA */
import { RegistroCambios } from '../pages/auditoria/RegistroCambios';

/* GESTIÓN UNIVERSIDAD */
import { GestionUniversidad } from '../pages/universidad/GestionUniversidad';
import { GestionCarreras } from '../pages/universidad/GestionCarreras';
import { GestionFacultades } from '../pages/universidad/GestionFacultades';
import { GestionSedes } from '../pages/universidad/GestionSedes';

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
          {/* USUARIO & PERFIL */}
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/usuarios" element={<GestionUsuario />} />
          <Route path="/usuarios/nuevo" element={<CrearUsuario />} />
          <Route path="/usuarios/editar/:id" element={<EditarUsuario />} />
          <Route path="/usuarios/desactivar/:id" element={<DesactivarUsuario />} />
          <Route path="/usuarios/detalle/:id" element={<DetalleUsuario />} />

          {/* ASIGNATURAS */}
          <Route path="/asignaturas" element={<AsignaturasUsuario />} />
          <Route path="/asignaturas/nuevo" element={<CrearAsignatura />} />
          <Route path="/asignaturas/:asignaturaId" element={<DetalleAsignatura />} />

          {/* Subvistas de edición de asignaturas protegidas con el layout */}
          <Route element={<LayoutEdicionPlan />}>
            <Route path="/asignaturas/:asignaturaId/objetivos" element={<ObjetivosAsignatura />} />
            <Route path="/asignaturas/:asignaturaId/generalidades" element={<GeneralidadesAsignatura />} />
            <Route path="/asignaturas/:asignaturaId/descripcion" element={<DescripcionAsignatura />} />
            <Route path="/asignaturas/:asignaturaId/unidades" element={<UnidadesDidacticas />} />
            <Route path="/asignaturas/:asignaturaId/estrategia" element={<EstrategiaMetodologica />} />
            <Route path="/asignaturas/:asignaturaId/evaluacion" element={<EvaluacionAsignatura />} />
            <Route path="/asignaturas/:asignaturaId/referencias" element={<ReferenciasAsignatura />} />          
          </Route>

          {/* PLANES */}
          <Route path="/planes" element={<Planes />} />
          <Route path="/planes/nuevo" element={<CrearPlanEstudio />} />
          <Route path="/planes/:planId" element={<DetallePlan />} />

          {/* Vistas de edición de planes protegidas con el layout */}
          <Route element={<LayoutEdicionPlan />}>
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
          </Route>

          {/* ASIGNACIONES */}
          <Route path="/app/operations/assign" element={<ListadoAsignaciones />} />
          <Route path="/app/operations/assign/nuevo" element={<CrearAsignacion />} />
          <Route path="/app/operations/assign/editar/:id" element={<EditarAsignacion />} />

          {/* AUDITORÍA / REGISTRO DE CAMBIOS */}
          <Route path="/registro-cambios" element={<RegistroCambios />} />

          {/* GESTIÓN DE UNIVERSIDAD (Exclusivo Superusuario) */}
          <Route path="/app/university" element={<GestionUniversidad />} />
          <Route path="/app/university/carreras" element={<GestionCarreras />} />
          <Route path="/app/university/facultades" element={<GestionFacultades />} />
          <Route path="/app/university/sedes" element={<GestionSedes />} />

        </Route>

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/planes" replace />} />
      </Routes>
    </BrowserRouter>
  );
};