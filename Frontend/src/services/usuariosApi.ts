import { API_BASE_URL } from '../config/api';

export interface Usuario {
  idUsuario: number;
  idRol: number;
  nombreRol: string | null;
  idFacultad: number | null;
  nombreFacultad: string | null;
  nombreCompleto: string;
  gradoAcademico: string;
  experienciaEducacionSuperior: number;
  correo: string;
  estadoCuenta: 'activo' | 'inactivo';
  fechaRegistro: string | null;
  ultimoAcceso: string | null;
}

export interface CatalogosUsuario {
  roles: { idRol: number; nombreRol: string; descripcion: string | null }[];
  facultades: { idFacultad: number; nombreFacultad: string }[];
}

export interface DetalleUsuario {
  usuario: Usuario;
  planesAsignados: {
    idPlan: number;
    nombreCarrera: string;
    cicloInicio: string;
    cicloFin: string;
    estadoPlan: string;
  }[];
  asignaturasAsignadas: {
    idAsignatura: number;
    codigoAsignatura: string;
    nombreAsignatura: string;
    cicloAcademico: string;
  }[];
  historialCambios: {
    idRegistroCambio: number;
    tituloCambio: string;
    detalleCambio: string | null;
    tipoCambio: string | null;
    fechaHora: string;
  }[];
}

export interface UsuarioInput {
  idRol: number;
  idFacultad: number | null;
  nombreCompleto: string;
  gradoAcademico: string;
  experienciaEducacionSuperior: number;
  correo: string;
}

export interface UsuarioUpdateInput extends UsuarioInput {
  password?: string;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    let message = `Error HTTP ${response.status}`;
    try {
      const problem = (await response.json()) as { title?: string; detail?: string };
      message = problem.detail || problem.title || message;
    } catch {
      // Some responses, such as 204, have no JSON body.
    }
    throw new Error(message);
  }

  if (response.status === 204 || response.status === 202) return undefined as T;
  return response.json() as Promise<T>;
}

export const usuariosApi = {
  listar: (incluirInactivos = false) =>
    request<Usuario[]>(`/api/usuarios?incluirInactivos=${incluirInactivos}`),
  obtener: (id: string | number) => request<Usuario>(`/api/usuarios/${id}`),
  obtenerDetalle: (id: string | number) =>
    request<DetalleUsuario>(`/api/usuarios/${id}/detalles`),
  catalogos: () => request<CatalogosUsuario>('/api/usuarios/catalogos'),
  crear: (usuario: UsuarioInput) =>
    request<Usuario>('/api/usuarios', {
      method: 'POST',
      body: JSON.stringify(usuario),
    }),
  actualizar: (id: string | number, usuario: UsuarioUpdateInput) =>
    request<Usuario>(`/api/usuarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(usuario),
    }),
  cambiarEstado: (id: string | number, activo: boolean) =>
    request<void>(`/api/usuarios/${id}${activo ? '/activar' : ''}`, {
      method: activo ? 'PUT' : 'DELETE',
    }),
  activarCuenta: (token: string, nuevaContrasena: string) =>
    request<void>('/api/auth/activar-cuenta', {
      method: 'POST',
      body: JSON.stringify({ token, nuevaContrasena }),
    }),
  solicitarRestablecimientoContrasena: (id: string | number) =>
    request<void>(`/api/usuarios/${id}/restablecer-contrasena`, { method: 'POST' }),
  restablecerContrasena: (token: string, nuevaContrasena: string) =>
    request<void>('/api/auth/restablecer-contrasena', {
      method: 'POST',
      body: JSON.stringify({ token, nuevaContrasena }),
    }),
  actualizarPerfil: (
    id: string | number,
    datos: Pick<UsuarioInput, 'nombreCompleto' | 'gradoAcademico' | 'experienciaEducacionSuperior'>,
  ) =>
    request<Usuario>(`/api/usuarios/${id}/perfil`, {
      method: 'PUT',
      body: JSON.stringify(datos),
    }),
  cambiarContrasena: (
    id: string | number,
    contrasenaActual: string,
    nuevaContrasena: string,
  ) =>
    request<void>(`/api/usuarios/${id}/contrasena`, {
      method: 'PUT',
      body: JSON.stringify({ contrasenaActual, nuevaContrasena }),
    }),
  iniciarSesion: (correo: string, password: string) =>
    request<{
      id: string;
      nombre: string;
      email: string;
      rol: 'SUPER_USUARIO' | 'ADMINISTRADOR' | 'USUARIO';
      facultadId: number | null;
      facultadNombre: string | null;
      gradoAcademico: string;
      experienciaEducacionSuperior: number;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ correo, password }),
    }),
};
