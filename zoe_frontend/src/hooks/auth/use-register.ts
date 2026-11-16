"use client";

import { useApiMutation } from "@/hooks/use-api";
import type { CurrentUser, RegisterPayload } from "@/types/auth";

export const useRegister = (onSuccess?: () => void) =>
  useApiMutation<CurrentUser, RegisterPayload>({
    method: "POST",
    url: "/users/",
    onSuccess: () => onSuccess?.(),
  });
