"use client";

import { Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepperStep {
  label: string;
  /** Shown on small screens; defaults to `label`. */
  shortLabel?: string;
  /** Shown inside the circle; falls back to the step number. */
  icon?: LucideIcon;
}

interface Props {
  steps: StepperStep[];
  /** Index of the current step. */
  current: number;
  /** Called with a completed step's index; completed steps are clickable. */
  onSelect: (index: number) => void;
}

/**
 * Full-width step indicator shown at the top of every wizard step and of the results.
 * Circles are spread with equal columns; the track runs centre-to-centre and fills as
 * steps complete.
 */
export function Stepper({ steps, current, onSelect }: Props) {
  const n = steps.length;
  // Track spans from the first circle's centre to the last one's: inset half a column each side.
  const inset = `${50 / n}%`;
  const fill = n > 1 ? Math.min(current, n - 1) / (n - 1) : 0;

  return (
    <nav aria-label="Progress" className="mb-10">
      <ol
        className="relative grid"
        style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
      >
        <li
          aria-hidden
          className="absolute top-6 h-1 -translate-y-1/2 rounded-full bg-border md:top-7"
          style={{ left: inset, right: inset }}
        >
          <span
            className="block h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${fill * 100}%` }}
          />
        </li>

        {steps.map((step, i) => {
          const done = i < current;
          const active = i === current;
          const Icon = step.icon;
          return (
            <li key={step.label} className="relative flex justify-center">
              <button
                type="button"
                disabled={!done}
                onClick={() => onSelect(i)}
                aria-current={active ? "step" : undefined}
                aria-label={`Step ${i + 1}: ${step.label}${done ? " (completed)" : ""}`}
                className={cn(
                  "group flex flex-col items-center gap-2 rounded-xl px-1 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
                  done && "cursor-pointer",
                )}
              >
                <span
                  className={cn(
                    "relative flex size-12 items-center justify-center rounded-full border-2 bg-card text-base font-bold transition-all duration-300 md:size-14 md:text-lg",
                    done &&
                      "border-primary bg-primary text-primary-foreground group-hover:scale-110 group-hover:shadow-md",
                    active &&
                      "scale-110 border-primary bg-primary/15 text-foreground shadow-md ring-4 ring-primary/20",
                    !done && !active && "text-muted-foreground",
                  )}
                >
                  {Icon ? <Icon className="size-5 md:size-6" aria-hidden /> : i + 1}
                  {done && (
                    <span
                      aria-hidden
                      className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full border-2 border-card bg-green-600 text-white md:size-6"
                    >
                      <Check className="size-3 md:size-3.5" strokeWidth={3} />
                    </span>
                  )}
                </span>
                <span
                  className={cn(
                    "text-center text-xs font-semibold leading-tight md:text-sm",
                    active ? "text-foreground" : "text-muted-foreground",
                    done && "group-hover:text-foreground group-hover:underline",
                  )}
                >
                  <span className="md:hidden">{step.shortLabel ?? step.label}</span>
                  <span className="hidden md:inline">{step.label}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
