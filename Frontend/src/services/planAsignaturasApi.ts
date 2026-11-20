import { API_BASE_URL, authHeaders } from '../config/api';

export interface AsignaturasDePlanApi {
  idPlan: number;
  idCarrera: number;
  nombreCarrera: string;
  cicloInicio: string;
  cicloFin: string;
  opcionesAsignaturas: {
    idAsignatura: number;
    codigoAsignatura: string;
    nombreAsignatura: string;
    areaFormacion: string;
    unidadesValorativas: number;
  }[];
  asignaturas: {
    idAsignatura: number;
    codigoAsignatura: string;
    nombreAsignatura: string;
    areaFormacion: string;
    unidadesValorativas: number;
    numeroCiclo: number;
    numeroOrden: number;
    seccionesCompletas: number;
    seccionesTotal: number;
  }[];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      ...authHeaders(),
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
      // Some responses have no JSON body.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const planAsignaturasApi = {
  obtener: (idPlan: number) =>
    request<AsignaturasDePlanApi>(`/api/planes-estudio/${idPlan}/asignaturas`),
  guardar: (idPlan: number, idAsignatura: number, numeroCiclo: number, numeroOrden: number) =>
    request<void>(`/api/planes-estudio/${idPlan}/asignaturas/${idAsignatura}`, {
      method: 'PUT',
      body: JSON.stringify({ numeroCiclo, numeroOrden }),
    }),
  quitar: (idPlan: number, idAsignatura: number) =>
    request<void>(`/api/planes-estudio/${idPlan}/asignaturas/${idAsignatura}`, {
      method: 'DELETE',
    }),
};
