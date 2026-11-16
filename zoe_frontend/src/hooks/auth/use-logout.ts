"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { clearTokens } from "@/lib/auth-tokens";

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const logout = () => {
    clearTokens();
    queryClient.clear();
    router.replace("/login");
  };

  return { logout };
};
