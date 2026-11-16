"use client";

import type { QuoteComparisonResult, QuoteLineType } from "@/types/motor";
import { formatKES, formatKESWhole, toAmount } from "./format";

interface Props {
  result: QuoteComparisonResult;
}

const GROUPS: Array<{
  type: QuoteLineType;
  label: string;
  subtotal: (r: QuoteComparisonResult) => string | null;
}> = [
  { type: "BASIC_PREMIUM", label: "Basic premium", subtotal: (r) => r.basic_premium },
  { type: "BENEFIT", label: "Benefits", subtotal: (r) => r.extra_benefits_total },
  { type: "EXTRA_CHARGE", label: "Levies & charges", subtotal: (r) => r.extra_charges_total },
];

export function QuoteBreakdown({ result }: Props) {
  return (
    <div className="space-y-4 text-sm animate-in fade-in slide-in-from-top-1 duration-200">
      {GROUPS.map((group) => {
        const lines = result.lines.filter((l) => l.line_type === group.type);
        if (lines.length === 0 && toAmount(group.subtotal(result)) === 0) return null;
        return (
          <div key={group.type}>
            <div className="flex items-center justify-between font-semibold">
              <span>{group.label}</span>
              <span>{formatKES(group.subtotal(result))}</span>
            </div>
            {lines.length > 0 && (
              <ul className="mt-1.5 space-y-1 border-l-2 pl-3 text-muted-foreground">
                {lines.map((line, i) => {
                  const isBenefit = line.line_type === "BENEFIT";
                  const included = isBenefit && toAmount(line.amount) === 0;
                  const freeLimit = toAmount(line.included_benefit_amount);
                  const extraLimit = toAmount(line.extra_benefit_amount);
                  return (
                    <li key={line.ref_id ?? `${group.type}-${i}`} className="flex justify-between gap-3">
                      <span>
                        {line.description}
                        {isBenefit && (freeLimit > 0 || extraLimit > 0) && (
                          <span className="block text-xs">
                            {freeLimit > 0 && `${formatKESWhole(freeLimit)} free`}
                            {freeLimit > 0 && extraLimit > 0 && " + "}
                            {extraLimit > 0 && `${formatKESWhole(extraLimit)} extra`}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 tabular-nums">
                        {included ? "Included" : formatKES(line.amount)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}

      <div className="flex items-center justify-between border-t pt-3 text-base font-bold">
        <span>Total payable</span>
        <span>{formatKES(result.total_payable)}</span>
      </div>
    </div>
  );
}
