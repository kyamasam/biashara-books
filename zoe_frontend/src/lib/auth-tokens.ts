/**
 * Single place that reads/writes JWTs. Tokens live in localStorage, so every
 * accessor is guarded for SSR (no window on the server).
 */

const ACCESS_KEY = "authToken";
const REFRESH_KEY = "refreshToken";

const isBrowser = () => typeof window !== "undefined";

export const getAccessToken = (): string | null =>
  isBrowser() ? localStorage.getItem(ACCESS_KEY) : null;

export const getRefreshToken = (): string | null =>
  isBrowser() ? localStorage.getItem(REFRESH_KEY) : null;

export const hasAccessToken = (): boolean => !!getAccessToken();

export const setTokens = (access: string, refresh?: string | null) => {
  if (!isBrowser()) return;
  localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
};

export const clearTokens = () => {
  if (!isBrowser()) return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
};
