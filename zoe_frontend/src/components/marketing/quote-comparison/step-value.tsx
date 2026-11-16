"use client";

import { Check, Sparkles } from "lucide-react";
import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { InsuranceProvider } from "@/types/insurance";
import { formatThousands } from "./format";
import { ProviderLogo } from "./provider-logo";
import { defaultCoverEnd, type QuoteFormValues } from "./schema";

interface Props {
  providers: InsuranceProvider[];
}

const QUICK_PICKS = [
  { label: "500K", value: "500000" },
  { label: "1M", value: "1000000" },
  { label: "1.5M", value: "1500000" },
  { label: "2M", value: "2000000" },
  { label: "3M", value: "3000000" },
];

const chipClass = (selected: boolean) =>
  cn(
    "inline-flex h-9 items-center gap-1.5 rounded-full border-2 px-3 text-sm font-medium transition-all",
    "hover:border-primary/60 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
    selected && "border-primary bg-primary text-primary-foreground",
  );

export function StepValue({ providers }: Props) {
  const { control, setValue } = useFormContext<QuoteFormValues>();

  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="sum_insured"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Value of your vehicle</FormLabel>
            <FormControl>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-semibold text-muted-foreground">
                  KES
                </span>
                <Input
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={formatThousands(field.value)}
                  onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
                  inputMode="numeric"
                  placeholder="1,500,000"
                  className="h-14 pl-14 text-2xl font-bold md:text-2xl"
                />
              </div>
            </FormControl>
            <div className="flex flex-wrap gap-2 pt-1">
              {QUICK_PICKS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setValue("sum_insured", p.value, { shouldValidate: true })}
                  className={chipClass(field.value === p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="cover_start"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover starts</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="date"
                  className="h-11"
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    setValue("cover_end", defaultCoverEnd(e.target.value), {
                      shouldValidate: true,
                    });
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="cover_end"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover ends</FormLabel>
              <FormControl>
                <Input {...field} type="date" className="h-11" />
              </FormControl>
              <FormDescription>Defaults to one full year.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="provider_ids"
        render={({ field }) => {
          const selected = field.value;
          const toggle = (id: number) =>
            field.onChange(
              selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id],
            );
          return (
            <FormItem>
              <FormLabel>Which insurers?</FormLabel>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  aria-pressed={selected.length === 0}
                  onClick={() => field.onChange([])}
                  className={chipClass(selected.length === 0)}
                >
                  <Sparkles className="size-4" />
                  All insurers
                </button>
                {providers.map((p) => {
                  const isOn = selected.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={isOn}
                      onClick={() => toggle(p.id)}
                      className={cn(chipClass(isOn), "pl-1")}
                    >
                      <ProviderLogo provider={p} className="size-7" />
                      {p.name}
                      {isOn && <Check className="size-4" />}
                    </button>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          );
        }}
      />
    </div>
  );
}
