import { useAuthStore } from '@/stores/auth-store';

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  // When set, body is sent as multipart/form-data. The caller passes a FormData
  // instance directly here so the fetch layer can stream the file.
  formData?: FormData;
  query?: Record<string, string | number | boolean | undefined>;
  // Skip attaching the auth token (e.g. on login/register).
  unauthenticated?: boolean;
  // Override the fetch signal (timeouts, cancellation).
  signal?: AbortSignal;
};

const buildUrl = (path: string, query?: RequestOptions['query']) => {
  const url = `${process.env.EXPO_PUBLIC_API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  if (!query) return url;
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined) params.append(k, String(v));
  });
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
};

const extractMessage = (body: unknown, fallback: string): string => {
  if (!body || typeof body !== 'object') return fallback;
  const b = body as Record<string, unknown>;
  if (typeof b.message === 'string') return b.message;
  if (typeof b.detail === 'string') return b.detail;
  if (typeof b.title === 'string') return b.title;
  if (b.error && typeof b.error === 'object') {
    const e = b.error as Record<string, unknown>;
    if (typeof e.message === 'string') return e.message;
  }
  return fallback;
};

export async function apiRequest<T = unknown>(
  path: string,
  { method = 'GET', body, formData, query, unauthenticated, signal }: RequestOptions = {},
): Promise<T> {
  const url = buildUrl(path, query);
  const headers: Record<string, string> = { Accept: 'application/json' };
  // Let fetch set the multipart boundary itself — manually setting Content-Type
  // here would break the request body.
  if (body !== undefined && !formData) headers['Content-Type'] = 'application/json';

  if (!unauthenticated) {
    const token = useAuthStore.getState().token;
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  if (__DEV__) {
    const debug = formData ? '[multipart]' : body ? { body } : '';
    console.log(`[api] → ${method} ${url}`, debug);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
      signal,
    });
  } catch (e) {
    if (__DEV__) {
      console.log(`[api] ✗ ${method} ${url} (network error)`, e);
    }
    throw new ApiError(0, 'Network error. Please check your connection.', e);
  }

  const text = await response.text();
  const parsed: unknown = text ? safeJson(text) : null;

  if (__DEV__) {
    console.log(
      `[api] ← ${response.status} ${method} ${url}`,
      JSON.stringify(parsed ?? text, null, 2),
    );
  }

  if (!response.ok) {
    // Auto-logout on 401 — the token is expired or invalid, so kick the user
    // back to the auth flow. Skip for explicitly unauthenticated requests
    // (login, register, etc.) and for the logout endpoint itself, otherwise a
    // 401 from logout would call signOut → logout → signOut in a loop.
    if (response.status === 401 && !unauthenticated && path !== '/api/auth/logout') {
      void useAuthStore.getState().signOut();
    }

    throw new ApiError(response.status, extractMessage(parsed, response.statusText), parsed);
  }

  return parsed as T;
}

const safeJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};
