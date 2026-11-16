"use client";

import {
  Car,
  CarFront,
  Check,
  Gift,
  HeartPulse,
  LifeBuoy,
  Plus,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useFormContext } from "react-hook-form";
import { FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Benefit, BenefitCode } from "@/types/motor";
import { formatThousands } from "./format";
import type { QuoteFormValues } from "./schema";

interface Props {
  benefits: Benefit[];
  isLoading: boolean;
}

const BENEFIT_META: Record<BenefitCode, { icon: LucideIcon; blurb: string }> = {
  WINDSCREEN: { icon: Car, blurb: "Cracked windscreen or window glass." },
  ENTERTAINMENT: { icon: Radio, blurb: "Your radio and in-car entertainment." },
  EXCESS_PROTECTOR_OD: { icon: ShieldCheck, blurb: "Pay no excess when you claim for damage." },
  PVT: { icon: ShieldAlert, blurb: "Damage from riots, political violence or terrorism." },
  COURTESY_CAR: { icon: CarFront, blurb: "A car to drive while yours is being repaired." },
  AA_ROAD_RESCUE: { icon: LifeBuoy, blurb: "Towing and roadside help when you break down." },
  PLL: { icon: Users, blurb: "Covers your liability to passengers." },
  PA_DRIVER: { icon: HeartPulse, blurb: "Personal accident cover for the driver." },
};

export function StepExtras({ benefits, isLoading }: Props) {
  const { control } = useFormContext<QuoteFormValues>();

  return (
    <FormField
      control={control}
      name="selected_benefits"
      render={({ field }) => {
        const selected = field.value;
        const find = (id: string) => selected.find((b) => b.benefit_id === id);
        const toggle = (id: string) =>
          field.onChange(
            find(id)
              ? selected.filter((b) => b.benefit_id !== id)
              : [...selected, { benefit_id: id, extra_limit: "" }],
          );
        const setExtra = (id: string, digits: string) =>
          field.onChange(
            selected.map((b) => (b.benefit_id === id ? { ...b, extra_limit: digits } : b)),
          );

        return (
          <FormItem>
            {!isLoading && benefits.length === 0 && (
              <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                No extras available right now. Hit compare to see your prices.
              </p>
            )}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {isLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              {benefits.map((benefit) => {
                const meta = BENEFIT_META[benefit.code] ?? { icon: Gift, blurb: "" };
                const Icon = meta.icon;
                const chosen = find(benefit.id);
                return (
                  <div
                    key={benefit.id}
                    className={cn(
                      "rounded-xl border-2 bg-card transition-all",
                      chosen ? "border-primary bg-primary/10 shadow-md" : "hover:border-primary/60",
                    )}
                  >
                    <button
                      type="button"
                      aria-pressed={!!chosen}
                      onClick={() => toggle(benefit.id)}
                      className="flex w-full items-start gap-3 rounded-xl p-4 text-left focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      <span
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-full transition-transform",
                          chosen ? "scale-110 bg-primary text-primary-foreground" : "bg-muted",
                        )}
                      >
                        <Icon className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">{benefit.name}</span>
                        {meta.blurb && (
                          <span className="block text-xs text-muted-foreground">{meta.blurb}</span>
                        )}
                      </span>
                      {chosen ? (
                        <Check className="size-5 shrink-0 text-foreground" />
                      ) : (
                        <Plus className="size-5 shrink-0 text-muted-foreground" />
                      )}
                    </button>

                    {chosen && (
                      <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-1 duration-200">
                        <label
                          htmlFor={`extra-${benefit.id}`}
                          className="text-xs font-medium text-muted-foreground"
                        >
                          Extra cover on top of the free limit (optional)
                        </label>
                        <div className="relative mt-1">
                          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs font-semibold text-muted-foreground">
                            KES
                          </span>
                          <Input
                            id={`extra-${benefit.id}`}
                            inputMode="numeric"
                            placeholder="e.g. 50,000"
                            value={formatThousands(chosen.extra_limit)}
                            onChange={(e) =>
                              setExtra(benefit.id, e.target.value.replace(/\D/g, "").slice(0, 12))
                            }
                            className="h-10 bg-background pl-12"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
