"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { InsuranceProvider } from "@/types/insurance";

interface Props {
  provider: Pick<InsuranceProvider, "name" | "logo">;
  className?: string;
}

/** Insurer logo with an initials fallback when there is no logo or it fails to load. */
export function ProviderLogo({ provider, className }: Props) {
  const [failed, setFailed] = useState(false);
  const initials = provider.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-white text-xs font-bold text-gray-700",
        className,
      )}
    >
      {provider.logo && !failed ? (
        // Logos are served from the API's media host, which isn't in next/image remotePatterns.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={provider.logo}
          alt={`${provider.name} logo`}
          className="size-full object-contain p-1"
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-label={provider.name}>{initials}</span>
      )}
    </span>
  );
}
