"use client";

import { Bike, Bus, Car, CarFront, Check, Truck, type LucideIcon } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { CoverType, VehicleClass } from "@/types/motor";
import { prettyLabel } from "./format";
import type { QuoteFormValues } from "./schema";

interface Props {
  vehicleClasses: VehicleClass[];
  coverTypes: CoverType[];
  isLoading: boolean;
}

const ICON_MATCHERS: Array<[RegExp, LucideIcon]> = [
  [/motor ?cycle|bike|boda|tuk/i, Bike],
  [/truck|lorry|commercial|goods|tanker/i, Truck],
  [/psv|bus|matatu|passenger|shuttle/i, Bus],
  [/private|car|saloon|suv/i, Car],
];

const iconFor = (vc: VehicleClass): LucideIcon =>
  ICON_MATCHERS.find(([re]) => re.test(`${vc.name} ${vc.code}`))?.[1] ?? CarFront;

export function StepCover({ vehicleClasses, coverTypes, isLoading }: Props) {
  const { control } = useFormContext<QuoteFormValues>();

  return (
    <div className="space-y-8">
      <FormField
        control={control}
        name="vehicle_class_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">What are you insuring?</FormLabel>
            <FormControl>
              <div role="radiogroup" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {isLoading &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 rounded-xl" />
                  ))}
                {vehicleClasses.map((vc) => {
                  const Icon = iconFor(vc);
                  const selected = field.value === vc.id;
                  return (
                    <button
                      key={vc.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => field.onChange(vc.id)}
                      className={cn(
                        "group relative flex h-28 flex-col items-center justify-center gap-2 rounded-xl border-2 bg-card p-3 text-sm font-medium transition-all",
                        "hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
                        selected && "border-primary bg-primary/10 shadow-md",
                      )}
                    >
                      {selected && (
                        <Check className="absolute top-2 right-2 size-4 rounded-full bg-primary p-0.5 text-primary-foreground" />
                      )}
                      <Icon
                        className={cn(
                          "size-9 transition-transform group-hover:scale-110",
                          selected ? "text-foreground" : "text-muted-foreground",
                        )}
                      />
                      <span className="text-center leading-tight">{prettyLabel(vc.name)}</span>
                    </button>
                  );
                })}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="cover_type_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">How much cover?</FormLabel>
            <FormControl>
              <div role="radiogroup" className="flex flex-wrap gap-2">
                {isLoading && <Skeleton className="h-10 w-40 rounded-full" />}
                {coverTypes.map((ct) => {
                  const selected = field.value === ct.id;
                  return (
                    <button
                      key={ct.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => field.onChange(ct.id)}
                      className={cn(
                        "inline-flex h-10 items-center gap-1.5 rounded-full border-2 px-4 text-sm font-medium transition-all",
                        "hover:border-primary/60 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
                        selected && "border-primary bg-primary text-primary-foreground",
                      )}
                    >
                      {selected && <Check className="size-4" />}
                      {prettyLabel(ct.name)}
                    </button>
                  );
                })}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
