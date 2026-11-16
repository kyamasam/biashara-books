"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, CircleSlash, ReceiptText, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { QuoteComparisonResult } from "@/types/motor";
import { formatKESWhole, toAmount } from "./format";
import { ProviderLogo } from "./provider-logo";
import { QuoteBreakdown } from "./quote-breakdown";

interface Props {
  result: QuoteComparisonResult;
  isBest: boolean;
  lowestTotal: number;
  highestTotal: number;
  /** Position in the list, used to stagger the entrance animation. */
  index: number;
}

export function QuoteCard({ result, isBest, lowestTotal, highestTotal, index }: Props) {
  const [open, setOpen] = useState(true);
  const total = toAmount(result.total_payable);
  const diff = total - lowestTotal;
  const barWidth = highestTotal > 0 ? Math.max(8, (total / highestTotal) * 100) : 100;

  return (
    <article
      className={cn(
        "@container relative flex h-full flex-col rounded-2xl border-2 bg-card p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5",
        "animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-500",
        isBest ? "border-primary ring-4 ring-primary/15" : "border-border",
      )}
      style={{ animationDelay: `${index * 90}ms` }}
    >
      {isBest && (
        <Badge className="absolute -top-3 left-4 gap-1 shadow-sm">
          <Trophy className="size-3.5" />
          Best price
        </Badge>
      )}

      <div className="flex items-start gap-3">
        <ProviderLogo provider={result.provider} className="size-12" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{result.provider.name}</p>
          {result.product_name && (
            <p className="truncate text-sm text-muted-foreground">{result.product_name}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-xl font-bold tabular-nums sm:text-2xl">
            {formatKESWhole(result.total_payable)}
          </p>
          <p
            className={cn(
              "text-xs font-medium",
              isBest ? "text-green-600 dark:text-green-400" : "text-muted-foreground",
            )}
          >
            {isBest ? "Cheapest option" : `+${formatKESWhole(diff)} vs cheapest`}
          </p>
        </div>
      </div>

      {result.unavailable_benefits.length > 0 && (
        <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-800 dark:text-amber-300">
          <CircleSlash className="mt-px size-3.5 shrink-0" />
          <span>
            <span className="font-semibold">Doesn&apos;t offer:</span>{" "}
            {result.unavailable_benefits.join(", ")}
          </span>
        </p>
      )}

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-700",
            isBest ? "bg-primary" : "bg-foreground/30",
          )}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      {open && (
        <div className="mt-4 rounded-xl bg-muted/50 p-4">
          <QuoteBreakdown result={result} />
        </div>
      )}

      {/* mt-auto pins the actions to the bottom so they line up across the grid. */}
      <div className="mt-auto pt-4">
        <div className="flex flex-col-reverse gap-2 border-t pt-4 @md:flex-row @md:items-center @md:justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="w-full font-semibold @md:w-auto"
          >
            <ReceiptText className="size-4" />
            {open ? "Hide breakdown" : "Show breakdown"}
            <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
          </Button>
          <Button
            asChild
            size="lg"
            variant={isBest ? "default" : "outline"}
            className={cn(
              // `!` beats antd's unlayered global `a` colour, which otherwise turns this blue.
              "w-full font-bold @md:w-auto",
              isBest
                ? "text-primary-foreground! shadow-md hover:text-primary-foreground!"
                : "border-2 border-foreground text-foreground! hover:bg-primary hover:border-primary hover:text-primary-foreground!",
            )}
          >
            <Link href="/register">
              Get this cover
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
