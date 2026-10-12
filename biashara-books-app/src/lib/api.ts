import { router } from 'expo-router';
import { ApiError } from './api-error';
import { deleteStoredToken, getStoredToken } from './token-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

type RequestBody = Record<string, unknown>;

let isHandlingUnauthorized = false;

async function handleUnauthorized() {
  if (isHandlingUnauthorized) return;
  isHandlingUnauthorized = true;

  try {
    await deleteStoredToken('access_token');
    await deleteStoredToken('refresh_token');
    router.replace('/login');
  } finally {
    // Keep isHandlingUnauthorized true while on the login screen
    // so subsequent failing requests during unmount don't trigger extra redirects.
  }
}

export function resetUnauthorizedState() {
  isHandlingUnauthorized = false;
}

function parseApiError(data: Record<string, unknown>): ApiError {
  if (data?.detail) return new ApiError(String(data.detail));
  if (data?.message) return new ApiError(String(data.message));

  const errors = data?.errors;
  if (errors && typeof errors === 'object' && !Array.isArray(errors)) {
    const fieldErrors = errors as Record<string, string[]>;
    const messages: string[] = [];

    if (Array.isArray(fieldErrors.non_field_errors)) {
      messages.push(...fieldErrors.non_field_errors);
    }
    for (const [field, msgs] of Object.entries(fieldErrors)) {
      if (field === 'non_field_errors') continue;
      if (Array.isArray(msgs)) {
        messages.push(...msgs.map((m) => `${field}: ${m}`));
      }
    }
    if (messages.length > 0) {
      return new ApiError(messages.join('\n'), fieldErrors);
    }
  }

  return new ApiError('Request failed');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
  const { headers: optHeaders, ...restOptions } = options;
  const token = await getStoredToken('access_token');
  const mergedHeaders: Record<string, string> = {
    ...(typeof restOptions.body === 'string' ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(optHeaders as Record<string, string> | undefined ?? {}),
  };

  console.log(`[API] ${options.method ?? 'GET'} ${url}`);
  console.log(`[API] Request headers:`, JSON.stringify(mergedHeaders, null, 2));
  if (restOptions.body) {
    try {
      console.log(`[API] Request body:`, JSON.stringify(JSON.parse(restOptions.body as string), null, 2));
    } catch {
      console.log(`[API] Request body (raw):`, restOptions.body);
    }
  }

  let response: Response;
  try {
    response = await fetch(url, { headers: mergedHeaders, ...restOptions });
  } catch (err) {
    console.error(`[API] Network error for ${url}:`, err);
    throw err;
  }

  console.log(`[API] Response status: ${response.status} ${response.statusText}`);
  const corsHeaders = ['access-control-allow-origin', 'access-control-allow-methods', 'access-control-allow-headers'];
  corsHeaders.forEach((h) => {
    const val = response.headers.get(h);
    if (val) console.log(`[API] ${h}: ${val}`);
  });

  if (response.status === 401) {
    console.error(`[API] 401 Unauthorized — logging out`);
    await handleUnauthorized();
    throw new Error('Unauthorized');
  }

  const text = await response.text();
  console.log(`[API] Response body (${response.status}):`, text);

  if (!response.ok) {
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(text);
    } catch {
      throw new ApiError(`Request failed with status ${response.status}`);
    }
    throw parseApiError(data);
  }

  return JSON.parse(text) as T;
}

export function get<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' });
}

export function post<T>(path: string, body: RequestBody): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

export function authPost<T>(path: string, body: RequestBody): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

export function authGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' });
}

export function authPut<T>(path: string, body: RequestBody): Promise<T> {
  return request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
}

export function authDelete<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}

export function authUpload<T>(path: string, formData: FormData): Promise<T> {
  return request<T>(path, { method: 'POST', body: formData });
}

export const API_BASE_URL = BASE_URL;