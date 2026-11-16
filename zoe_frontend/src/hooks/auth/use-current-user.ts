"use client";

import { useSyncExternalStore } from "react";
import { useApiQuery } from "@/hooks/use-api";
import { hasAccessToken } from "@/lib/auth-tokens";
import type { CurrentUser } from "@/types/auth";

export const CURRENT_USER_KEY = ["current-user"] as const;

const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
};

/** null on the server / first hydration pass, so SSR markup matches. */
const useHasToken = () =>
  useSyncExternalStore<boolean | null>(subscribe, hasAccessToken, () => null);

export const useCurrentUser = () => {
  const hasToken = useHasToken();

  const query = useApiQuery<CurrentUser>("/users/get-current-user/", {
    queryKey: CURRENT_USER_KEY,
    enabled: !!hasToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    isLoading: hasToken === null || (!!hasToken && query.isLoading),
    isAuthenticated: !!hasToken && !!query.data,
  };
};
