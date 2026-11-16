"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/hooks/use-api";
import { setTokens } from "@/lib/auth-tokens";
import type { LoginPayload, TokenPair } from "@/types/auth";
import { CURRENT_USER_KEY } from "./use-current-user";

export const useLogin = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useApiMutation<TokenPair, LoginPayload>({
    method: "POST",
    url: "/token/",
    onSuccess: async (data) => {
      setTokens(data.access, data.refresh);
      await queryClient.invalidateQueries({ queryKey: CURRENT_USER_KEY });
      onSuccess?.();
    },
  });
};
