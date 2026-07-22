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
  const { headers: optHeaders, ...restOptions } = options;
  const mergedHeaders = {
    'Content-Type': 'application/json',
    ...(optHeaders ?? {}),
  };

  console.log(`[API] ${options.method ?? 'GET'} ${url}`);
  console.log(`[API] Request headers:`, JSON.stringify(mergedHeaders, null, 2));

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

  const data = await response.json();

  if (!response.ok) {
    console.error(`[API] Error response body:`, JSON.stringify(data, null, 2));
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
