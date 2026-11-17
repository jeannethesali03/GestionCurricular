export type UserRole = 'SUPER_USUARIO' | 'ADMINISTRADOR' | 'USUARIO';

export interface UserSession {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  facultadId?: string;
  facultadNombre?: string;
  planesAsignadosIds?: string[];      // Planes con acceso de lectura/edición para rol USUARIO
  asignaturasAsignadasIds?: string[]; // Asignaturas con acceso de edición para rol USUARIO
}