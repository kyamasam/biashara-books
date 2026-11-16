"use client";

import { useMemo } from "react";
import { Info } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePublicVehicleModels } from "@/hooks/motor/use-quote-comparison";
import type { VehicleMake } from "@/types/motor";
import type { QuoteFormValues } from "./schema";

interface Props {
  vehicleMakes: VehicleMake[];
  isLoadingMakes: boolean;
}

const YEARS_BACK = 30;

export function StepVehicle({ vehicleMakes, isLoadingMakes }: Props) {
  const { control, setValue } = useFormContext<QuoteFormValues>();
  const makeId = useWatch({ control, name: "vehicle_make_id" });
  const { data: models = [], isLoading: isLoadingModels } = usePublicVehicleModels(
    makeId || undefined,
  );

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: YEARS_BACK + 1 }, (_, i) => String(current - i));
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FormField
          control={control}
          name="vehicle_make_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Make</FormLabel>
              <Select
                value={field.value}
                onValueChange={(v) => {
                  field.onChange(v);
                  setValue("vehicle_model_id", "");
                }}
                disabled={isLoadingMakes}
              >
                <FormControl>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder={isLoadingMakes ? "Loading…" : "e.g. Toyota"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent position="popper">
                  {vehicleMakes.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="vehicle_model_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!makeId || isLoadingModels}
              >
                <FormControl>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue
                      placeholder={
                        !makeId ? "Pick a make first" : isLoadingModels ? "Loading…" : "e.g. Axio"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent position="popper">
                  {models.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="year_of_manufacture"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year of manufacture</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Pick a year" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent position="popper" className="max-h-64">
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="registration_no"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Number plate <span className="font-normal text-muted-foreground">(optional)</span>
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  placeholder="KDA 123A"
                  maxLength={20}
                  autoComplete="off"
                  className="h-11 rounded-md border-2 border-foreground/80 bg-primary text-center font-mono text-lg font-bold tracking-[0.2em] text-primary-foreground uppercase placeholder:text-primary-foreground/40 dark:bg-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="rounded-xl border border-dashed p-4">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="size-4 shrink-0" />
          Some insurers price by seats or tonnage. Add them for more quotes.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FormField
            control={control}
            name="seats"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seats</FormLabel>
                <FormControl>
                  <Input {...field} inputMode="numeric" placeholder="e.g. 5" className="h-11" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="tonnage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tonnage</FormLabel>
                <FormControl>
                  <Input {...field} inputMode="decimal" placeholder="e.g. 3.5" className="h-11" />
                </FormControl>
                <FormDescription>For trucks and commercial vehicles.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
