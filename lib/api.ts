const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

import { getToken } from "./auth";

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const token = getToken();

  const headers: HeadersInit = {
    ...(fetchOptions.body
      ? { "Content-Type": "application/json" }
      : {}),
    ...fetchOptions.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    let errorMessage = "Something went wrong.";

    try {
      const error = await response.json();
      errorMessage =
        error.detail || error.message || errorMessage;
    } catch {}

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  get: <T>(
    endpoint: string,
    options?: RequestOptions
  ) =>
    request<T>(endpoint, {
      ...options,
      method: "GET",
    }),

  post: <T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: <T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    }),

  patch: <T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ) =>
    request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: <T>(
    endpoint: string,
    options?: RequestOptions
  ) =>
    request<T>(endpoint, {
      ...options,
      method: "DELETE",
    }),

  upload: async <T>(endpoint: string, formData: FormData): Promise<T> => {
    const token = getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = "File upload failed.";
      try {
        const error = await response.json();
        errorMessage = error.detail || error.message || errorMessage;
      } catch {}
      throw new Error(errorMessage);
    }

    return response.json();
  },
};