import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CurrentUser } from "@/types/auth";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type NameLike = Pick<CurrentUser, "first_name" | "last_name" | "username" | "email">;

export const getUserDisplayName = (user?: NameLike | null) => {
  if (!user) return "";
  const full = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
  return full || user.username || user.email;
};

export const getUserInitials = (user?: NameLike | null) => {
  if (!user) return "?";
  const first = user.first_name?.[0] ?? "";
  const last = user.last_name?.[0] ?? "";
  const initials = `${first}${last}`.toUpperCase();
  return initials || (user.username || user.email).slice(0, 2).toUpperCase();
};

export const formatUserType = (type?: string | null) =>
  type
    ? type
        .toLowerCase()
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "";
