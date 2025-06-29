import { authService } from './auth';

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  const token = authService.getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `Request failed: ${response.status}`);
  }

  return response;
}

export async function fetchAPI<T>(url: string): Promise<T> {
  const response = await apiRequest('GET', url);
  return response.json();
}

export async function postAPI<T>(url: string, data: unknown): Promise<T> {
  const response = await apiRequest('POST', url, data);
  return response.json();
}
