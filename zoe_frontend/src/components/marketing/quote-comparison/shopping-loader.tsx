"use client";

import { ShoppingBag } from "lucide-react";
import type { InsuranceProvider } from "@/types/insurance";
import { ProviderLogo } from "./provider-logo";

interface Props {
  providers: InsuranceProvider[];
}

export function ShoppingLoader({ providers }: Props) {
  const shown = providers.slice(0, 6);

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-6 py-16 text-center animate-in fade-in duration-300"
    >
      <div className="flex h-14 items-end gap-3">
        {shown.length > 0 ? (
          shown.map((p, i) => (
            <span
              key={p.id}
              className="animate-bounce"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <ProviderLogo provider={p} className="size-12 shadow-md" />
            </span>
          ))
        ) : (
          <ShoppingBag className="size-12 animate-bounce text-primary" />
        )}
      </div>
      <div>
        <p className="text-lg font-semibold">Shopping around for you…</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Asking every insurer for their best price.
        </p>
      </div>
    </div>
  );
}
