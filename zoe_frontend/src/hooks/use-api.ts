// src/hooks/use-api.ts
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";
import toast from "react-hot-toast";
import { renderToast } from "./toast-renderer";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "@/lib/auth-tokens";
import type { RefreshResponse } from "@/types/auth";

/**
 * Per-request flags read by the interceptors.
 * - `skipAuth`: public endpoint. No Authorization header is sent and a 401
 *   never triggers a token refresh or the redirect to /login.
 * - `silent`: no automatic success/error toasts. Handle errors inline.
 */
interface RequestFlags {
  skipAuth?: boolean;
  silent?: boolean;
}

declare module "axios" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AxiosRequestConfig extends RequestFlags {}
}

/* ================================
   AXIOS INSTANCE
================================ */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

const TOKEN_URL = "/token/";
const REFRESH_URL = "/token/refresh/";

const isAuthEndpoint = (url?: string) =>
  !!url && (url.includes(TOKEN_URL) || url.includes(REFRESH_URL));

/* ================================
   REQUEST INTERCEPTOR
================================ */

axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token && !config.skipAuth && !isAuthEndpoint(config.url)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ================================
   HELPER: Format text professionally
================================ */

const formatText = (text: string): string => {
  let formatted = text.replace(/[_-]+/g, " ");
  formatted = formatted
    .split(" ")
    .map((word) =>
      word.length === 0
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join(" ");

  const specialCases: Record<string, string> = {
    Id: "ID",
    Url: "URL",
    Api: "API",
    Uuid: "UUID",
  };

  for (const [key, value] of Object.entries(specialCases)) {
    formatted = formatted.replace(new RegExp(`\\b${key}\\b`, "g"), value);
  }

  return formatted;
};

/* ================================
   HELPER: Get success message
================================ */

const getSuccessMessage = (method: string, url: string): string => {
  const methodLower = method.toLowerCase();

  if (url.includes(TOKEN_URL) && methodLower === "post")
    return "Signed in successfully";

  const urlParts = url.split("/").filter((part) => part && !part.includes("?"));
  let resource = "";

  if (urlParts.length > 0) {
    const lastPart = urlParts[urlParts.length - 1];
    const isId =
      /^\d+$/.test(lastPart) ||
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        lastPart,
      );
    if (!isId) {
      resource = formatText(lastPart);
    } else if (urlParts.length > 1) {
      resource = formatText(urlParts[urlParts.length - 2]);
    }
  }

  const actionMap: Record<string, string> = {
    post: "created",
    put: "updated",
    patch: "updated",
    delete: "deleted",
  };

  const action = actionMap[methodLower];
  if (resource && action) return `${resource} ${action} successfully`;

  const fallbackMap: Record<string, string> = {
    post: "Created successfully",
    put: "Updated successfully",
    patch: "Updated successfully",
    delete: "Deleted successfully",
  };

  return fallbackMap[methodLower] || "Action completed successfully";
};

/* ================================
   HELPER: Parse Django Error Responses
   Handles drf-standardized-errors ({ type, errors: [{ attr, detail }] })
   as well as plain DRF error shapes.
================================ */

interface ParsedError {
  field: string;
  message: string;
}

type ErrorLike = {
  message?: string;
  response?: { data?: unknown };
};

const parseDjangoErrors = (error: ErrorLike): ParsedError[] => {
  const data = error?.response?.data as
    | Record<string, unknown>
    | string
    | undefined;
  const errors: ParsedError[] = [];

  if (!data) {
    errors.push({
      field: "error",
      message: error?.message || "Something went wrong",
    });
    return errors;
  }

  if (typeof data === "string") {
    errors.push({ field: "error", message: data });
    return errors;
  }

  if (Array.isArray(data.errors)) {
    (
      data.errors as Array<{ attr?: string; detail?: string; message?: string }>
    ).forEach((err) => {
      errors.push({
        field: err.attr || "error",
        message: err.detail || err.message || "Invalid value",
      });
    });
    return errors;
  }

  if ("detail" in data) {
    errors.push({ field: "error", message: String(data.detail) });
    return errors;
  }

  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      value.forEach((errMsg) =>
        errors.push({ field: key, message: String(errMsg) }),
      );
    } else if (typeof value === "string") {
      errors.push({ field: key, message: value });
    } else if (typeof value === "object" && value !== null) {
      errors.push(...parseDjangoErrors({ response: { data: value } }));
    }
  }

  if (errors.length === 0) {
    errors.push({ field: "error", message: "An unexpected error occurred" });
  }

  return errors;
};

/** First human-readable error message from an API error. */
const getErrorMessage = (error: unknown, fallback = "Something went wrong") =>
  parseDjangoErrors(error as ErrorLike)[0]?.message || fallback;

/* ================================
   HELPER: Show toasts
================================ */

const toastStyle = (type: "success" | "error" | "loading") => {
  const base = {
    backdropFilter: "blur(10px)",
    borderRadius: "12px",
    padding: "10px 16px",
    fontFamily: "var(--font-jost)",
    color: "#ffffff",
    minWidth: "260px",
    maxWidth: "420px",
  };

  const variants = {
    success: {
      background: "rgba(34, 197, 94, 0.85)",
      border: "1px solid rgba(34, 197, 94, 0.3)",
    },
    error: {
      background: "rgba(239, 68, 68, 0.85)",
      border: "1px solid rgba(239, 68, 68, 0.3)",
    },
    loading: {
      background: "rgba(128, 128, 128, 0.85)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
    },
  };

  return { ...base, ...variants[type] };
};

const showSuccessToast = (message: string) => {
  toast((t) => renderToast(t, message, "success"), {
    duration: 3000,
    position: "top-center",
    style: toastStyle("success"),
  });
};

const showErrorToasts = (errors: ParsedError[]) => {
  errors.forEach((error) => {
    let message = error.message;
    if (message.length > 0)
      message = message.charAt(0).toUpperCase() + message.slice(1);
    if (!/[.!?]$/.test(message)) message += ".";

    toast((t) => renderToast(t, message, "error"), {
      duration: 5000,
      position: "top-center",
      style: toastStyle("error"),
    });
  });
};

/* ================================
   TOKEN REFRESH (single-flight)
================================ */

let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = (): Promise<string> => {
  if (refreshPromise) return refreshPromise;

  const refresh = getRefreshToken();
  if (!refresh) return Promise.reject(new Error("No refresh token"));

  refreshPromise = axios
    .post<RefreshResponse>(`${API_BASE_URL}${REFRESH_URL}`, { refresh })
    .then(({ data }) => {
      setTokens(data.access, data.refresh);
      return data.access;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

const redirectToLogin = () => {
  clearTokens();
  if (typeof window === "undefined") return;
  const { pathname, search } = window.location;
  if (pathname.startsWith("/login")) return;
  const next = encodeURIComponent(`${pathname}${search}`);
  window.location.href = `/login?next=${next}`;
};

/* ================================
   RESPONSE INTERCEPTOR
================================ */

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

axiosInstance.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toLowerCase();
    const url = response.config.url ?? "";
    if (
      method &&
      method !== "get" &&
      !response.config.silent &&
      !url.includes(REFRESH_URL)
    ) {
      showSuccessToast(getSuccessMessage(method, url));
    }
    return response;
  },
  async (error: AxiosError) => {
    const status = error.response?.status;
    const original = error.config as RetriableConfig | undefined;

    // Try a silent refresh once for protected requests.
    if (
      status === 401 &&
      original &&
      !original._retry &&
      !original.skipAuth &&
      !isAuthEndpoint(original.url)
    ) {
      original._retry = true;
      try {
        const access = await refreshAccessToken();
        original.headers.Authorization = `Bearer ${access}`;
        return axiosInstance(original);
      } catch {
        redirectToLogin();
        return Promise.reject(error);
      }
    }

    const method = original?.method?.toLowerCase();
    if (method && method !== "get" && !original?.silent) {
      showErrorToasts(parseDjangoErrors(error));
    }

    return Promise.reject(error);
  },
);

/* ================================
   BASE REQUEST
================================ */

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

const request = async <T>(
  url: string,
  method: HttpMethod = "GET",
  data?: unknown,
  params?: Record<string, unknown>,
  flags?: RequestFlags,
) => {
  const { data: response } = await axiosInstance({
    url,
    method,
    data,
    params,
    ...flags,
  });
  return response as T;
};

export const useApi = () => ({ request, axiosInstance });

/* ================================
   QUERY HOOK
================================ */

type ApiQueryOptions<T> = Omit<
  UseQueryOptions<T, AxiosError, T, readonly unknown[]>,
  "queryKey" | "queryFn"
> & {
  queryKey?: readonly unknown[];
  params?: Record<string, unknown>;
  /** Public endpoint: send no auth header, never redirect to /login on 401. */
  skipAuth?: boolean;
};

export const useApiQuery = <T>(url: string, options?: ApiQueryOptions<T>) => {
  const { params, queryKey, skipAuth, ...rest } = options ?? {};
  const key = queryKey ?? (params ? [url, params] : [url]);

  return useQuery<T, AxiosError, T, readonly unknown[]>({
    queryKey: key,
    queryFn: () =>
      request<T>(url, "GET", undefined, params, { skipAuth }),
    ...rest,
  });
};

/* ================================
   MUTATION HOOK
================================ */

type ApiMutationOptions<TData, TVariables, TContext = unknown> = {
  method: "POST" | "PUT" | "PATCH" | "DELETE";
  url: string | ((variables: TVariables) => string);
  invalidateQueries?: (string | readonly unknown[])[];
} & RequestFlags &
  Omit<
  UseMutationOptions<TData, AxiosError, TVariables, TContext>,
  "mutationFn"
>;

export const useApiMutation = <
  TData,
  TVariables = unknown,
  TContext = unknown,
>({
  method,
  url,
  invalidateQueries,
  onSuccess,
  skipAuth,
  silent,
  ...options
}: ApiMutationOptions<TData, TVariables, TContext>) => {
  const queryClient = useQueryClient();

  return useMutation<TData, AxiosError, TVariables, TContext>({
    ...options,
    mutationFn: async (variables: TVariables) => {
      const finalUrl = typeof url === "function" ? url(variables) : url;
      return request<TData>(finalUrl, method, variables, undefined, {
        skipAuth,
        silent,
      });
    },
    onSuccess: (...args) => {
      invalidateQueries?.forEach((queryKey) => {
        queryClient.invalidateQueries({
          queryKey: typeof queryKey === "string" ? [queryKey] : queryKey,
        });
      });
      return onSuccess?.(...args);
    },
  });
};

export {
  axiosInstance,
  formatText,
  getErrorMessage,
  getSuccessMessage,
  parseDjangoErrors,
};
