import type { ApiResponse, AppData, AuthRole } from '../../shared/types';

export class ClientApiError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

export function getApiBase(): string {
  const raw = import.meta.env.VITE_API_URL as string | undefined;
  return (raw ?? 'http://127.0.0.1:8787').replace(/\/$/, '');
}

export function isCloudEnabled(): boolean {
  return Boolean(import.meta.env.VITE_API_URL) || import.meta.env.DEV;
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> | undefined),
  };

  const url = path.startsWith('http') ? path : `${getApiBase()}${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      ...options,
      headers,
      cache: 'no-store',
    });
  } catch {
    throw new ClientApiError('SERVER_ERROR', 'Cannot reach API server');
  }

  const body = (await res.json()) as ApiResponse<T>;
  if (!body.success) {
    throw new ClientApiError(body.error.code, body.error.message);
  }
  return body.data;
}

export async function loginApi(role: AuthRole, pin: string) {
  return apiFetch<{ authenticated: boolean; role: AuthRole }>('/api/auth', {
    method: 'POST',
    body: JSON.stringify({ role, pin }),
  });
}

export async function fetchCloudData(): Promise<AppData> {
  return apiFetch<AppData>('/api/data');
}

export async function pushCloudData(data: AppData): Promise<AppData> {
  return apiFetch<AppData>('/api/data', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function patchInventoryQuantities(
  quantities: { id: number; quantity: number }[],
): Promise<AppData> {
  return apiFetch<AppData>('/api/inventory', {
    method: 'PATCH',
    body: JSON.stringify({ quantities }),
  });
}

export async function postAttendance(record: {
  id?: number;
  employeeId: number;
  employeeName: string;
  date: string;
  clockIn: string;
  clockOut: string;
  hoursWorked?: number;
  notes?: string;
}): Promise<AppData> {
  return apiFetch<AppData>('/api/attendance', {
    method: 'POST',
    body: JSON.stringify(record),
  });
}

export async function deleteAttendanceRecord(id: number): Promise<AppData> {
  return apiFetch<AppData>(`/api/attendance/${id}`, {
    method: 'DELETE',
  });
}

export async function patchCloudSettings(settings: {
  bossPin?: string;
  staffPin?: string;
}): Promise<AppData> {
  return apiFetch<AppData>('/api/settings', {
    method: 'PATCH',
    body: JSON.stringify(settings),
  });
}
