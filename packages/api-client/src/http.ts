import type { ApiError } from '@timesheet/types';

export class ApiRequestError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }

  static fromApiError(err: ApiError): ApiRequestError {
    return new ApiRequestError(err.code, err.message, err.statusCode);
  }

  get isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  get isNotFound(): boolean {
    return this.statusCode === 404;
  }
}

// Token stored in memory (not localStorage) — refreshed on page load from cookie/session
let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

export interface HttpClientConfig {
  baseUrl: string;
  /** Called when a 401 is received — use to redirect to login */
  onUnauthorized?: () => void;
}

// No default baseUrl — callers must invoke configureApiClient() before use.
// apps/web reads import.meta.env and passes it in; Node consumers use process.env.
let clientConfig: HttpClientConfig = {
  baseUrl: '',
};

export function configureApiClient(config: Partial<HttpClientConfig>): void {
  clientConfig = { ...clientConfig, ...config };
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  if (!clientConfig.baseUrl) {
    throw new Error(
      '[api-client] baseUrl is not set. Call configureApiClient({ baseUrl }) before making requests.',
    );
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${clientConfig.baseUrl}${path}`, {
    method,
    headers,
    ...(body !== undefined && { body: JSON.stringify(body) }),
    ...(signal !== undefined && { signal }),
  });

  if (!response.ok) {
    let apiErr: ApiError;
    try {
      apiErr = (await response.json()) as ApiError;
    } catch {
      apiErr = {
        message: response.statusText || 'Unknown error',
        code: 'UNKNOWN',
        statusCode: response.status,
      };
    }

    const err = ApiRequestError.fromApiError(apiErr);

    if (err.isUnauthorized) {
      clientConfig.onUnauthorized?.();
    }

    throw err;
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const http = {
  get<T>(path: string, signal?: AbortSignal): Promise<T> {
    return request<T>('GET', path, undefined, signal);
  },
  post<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
    return request<T>('POST', path, body, signal);
  },
  put<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
    return request<T>('PUT', path, body, signal);
  },
  patch<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
    return request<T>('PATCH', path, body, signal);
  },
  delete<T>(path: string, signal?: AbortSignal): Promise<T> {
    return request<T>('DELETE', path, undefined, signal);
  },
};