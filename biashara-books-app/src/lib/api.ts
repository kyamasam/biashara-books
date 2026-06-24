import { ApiError } from './api-error';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';

type RequestBody = Record<string, unknown>;

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
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw parseApiError(data);
  }

  return data as T;
}

export function post<T>(path: string, body: RequestBody): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

export function authPost<T>(path: string, body: RequestBody, token: string): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { Authorization: `Bearer ${token}` },
  });
}

export function authGet<T>(path: string, token: string): Promise<T> {
  return request<T>(path, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
}
