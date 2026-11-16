"use client";

import { AlertCircle, ArrowLeft, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QuoteComparisonResponse } from "@/types/motor";
import { formatKESWhole, toAmount } from "./format";
import { ProviderLogo } from "./provider-logo";
import { QuoteCard } from "./quote-card";

interface Props {
  data: QuoteComparisonResponse;
  /** Returns to the last wizard step with all values intact. */
  onBack: () => void;
}

export function ResultsBoard({ data, onBack }: Props) {
  // API sorts cheapest first, errored last — keep that order.
  const priced = data.results.filter((r) => !r.error && r.total_payable != null);
  const failed = data.results.filter((r) => r.error || r.total_payable == null);
  const totals = priced.map((r) => toAmount(r.total_payable));
  const lowest = data.lowest_total != null ? toAmount(data.lowest_total) : Math.min(...totals);
  const highest = Math.max(0, ...totals);

  const backButton = (
    <Button type="button" variant="outline" onClick={onBack}>
      <ArrowLeft className="size-4" />
      Back
    </Button>
  );

  if (data.results.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center animate-in fade-in duration-300">
        <SearchX className="size-12 text-muted-foreground" />
        <div>
          <p className="text-lg font-semibold">No insurers cover this combination yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different vehicle type or cover type.
          </p>
        </div>
        {backButton}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        {backButton}
        <div>
          {priced.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                {priced.length} {priced.length === 1 ? "quote" : "quotes"} found, from
              </p>
              <p className="text-3xl font-bold tracking-tight">{formatKESWhole(lowest)}</p>
            </>
          ) : (
            <p className="text-lg font-semibold">We couldn&apos;t price this one</p>
          )}
        </div>
      </div>

      {priced.length > 0 && (
        <div className="grid items-stretch gap-x-5 gap-y-8 pt-2 md:grid-cols-2 xl:grid-cols-3">
          {priced.map((r, i) => (
            <QuoteCard
              key={`${r.provider.id}-${r.product_id ?? i}`}
              result={r}
              index={i}
              isBest={i === 0}
              lowestTotal={lowest}
              highestTotal={highest}
            />
          ))}
        </div>
      )}

      {failed.length > 0 && (
        <details className="group rounded-2xl border border-dashed bg-muted/30 p-4" open={priced.length === 0}>
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-muted-foreground">
            <AlertCircle className="size-4" />
            Couldn&apos;t price {failed.length} {failed.length === 1 ? "insurer" : "insurers"}
            <span className="ml-auto text-xs group-open:hidden">Show</span>
            <span className="ml-auto hidden text-xs group-open:inline">Hide</span>
          </summary>
          <ul className="mt-3 space-y-2">
            {failed.map((r, i) => (
              <li
                key={`${r.provider.id}-${i}`}
                className="flex items-start gap-3 rounded-xl bg-card p-3 opacity-80"
              >
                <ProviderLogo provider={r.provider} className="size-9 grayscale" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{r.provider.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.error ?? "This insurer couldn't price your vehicle."}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
