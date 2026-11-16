"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  CarFront,
  Loader2,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  Wallet,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  usePublicBenefits,
  usePublicCoverTypes,
  usePublicInsuranceProviders,
  usePublicVehicleClasses,
  usePublicVehicleMakes,
  useQuoteComparison,
} from "@/hooks/motor/use-quote-comparison";
import { getErrorMessage } from "@/hooks/use-api";
import { cn } from "@/lib/utils";
import { ResultsBoard } from "./results-board";
import {
  getDefaultValues,
  quoteFormSchema,
  STEP_FIELDS,
  toComparisonPayload,
  type QuoteFormValues,
} from "./schema";
import { ShoppingLoader } from "./shopping-loader";
import { StepCover } from "./step-cover";
import { StepExtras } from "./step-extras";
import { StepValue } from "./step-value";
import { StepVehicle } from "./step-vehicle";
import { Stepper, type StepperStep } from "./stepper";

const STEPS: Array<StepperStep & { title: string; hint: string }> = [
  { label: "Cover", icon: ShieldCheck, title: "What are we covering?", hint: "Pick your vehicle type and level of cover." },
  { label: "Vehicle", icon: CarFront, title: "Tell us about your ride", hint: "Just the basics. No paperwork needed." },
  { label: "Value & dates", shortLabel: "Value", icon: Wallet, title: "Value & dates", hint: "The value of your vehicle, and when cover should start." },
  { label: "Extras", icon: Sparkles, title: "Want extras?", hint: "Optional. Tap any add-ons you'd like priced in, or skip straight to prices." },
];
const LAST_STEP = STEPS.length - 1;
const STEPPER_STEPS = [
  ...STEPS.map(({ label, shortLabel, icon }) => ({ label, shortLabel, icon })),
  { label: "Results", icon: Trophy },
];

type View = "wizard" | "results";

export function QuoteComparison() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [view, setView] = useState<View>("wizard");
  const sectionRef = useRef<HTMLElement>(null);

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: getDefaultValues(),
    mode: "onTouched",
  });

  const classes = usePublicVehicleClasses();
  const coverTypes = usePublicCoverTypes();
  const makes = usePublicVehicleMakes();
  const providers = usePublicInsuranceProviders();
  const benefits = usePublicBenefits();
  const compare = useQuoteComparison();

  const lookupError =
    classes.error ?? coverTypes.error ?? makes.error ?? providers.error ?? benefits.error;
  const selectedProviderIds = useWatch({ control: form.control, name: "provider_ids" });
  const allProviders = providers.data ?? [];
  const loaderProviders =
    selectedProviderIds.length > 0
      ? allProviders.filter((p) => selectedProviderIds.includes(p.id))
      : allProviders;

  // Bring the section top into view when switching between wizard and results.
  useEffect(() => {
    if (view === "results") {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [view]);

  const goTo = (next: number) => {
    setDirection(next > step ? "forward" : "back");
    setStep(next);
  };

  const runCompare = form.handleSubmit((values) => {
    setView("results");
    compare.mutate(toComparisonPayload(values));
  });

  // One submit handler so Enter advances a step, and compares on the last one.
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (step < LAST_STEP) {
      const ok = await form.trigger(STEP_FIELDS[step]);
      if (ok) goTo(step + 1);
      return;
    }
    await runCompare();
  };

  /** Jump back to a wizard step from the results, keeping every value. */
  const backToStep = (index: number) => {
    setView("wizard");
    setDirection("back");
    setStep(index);
    compare.reset();
  };

  const handleBack = () => backToStep(LAST_STEP);

  const handleStepSelect = (index: number) =>
    view === "results" ? backToStep(index) : goTo(index);

  return (
    <section
      id="compare"
      ref={sectionRef}
      className="flex min-h-[100dvh] scroll-mt-16 flex-col bg-gradient-to-b from-primary/10 via-background to-background"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold tracking-wide uppercase">
            <Search className="size-3.5" />
            Compare motor quotes
          </p>
          <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
            Find your cheapest car cover in under a minute
          </h2>
          <p className="mt-2 text-muted-foreground">
            A few quick steps. No sign up, no spam. Just prices.
          </p>
        </div>

        <div
          className={cn(
            // Fills the remaining viewport height and the full container width.
            "mt-8 flex w-full flex-1 flex-col rounded-3xl border bg-card p-5 shadow-xl sm:p-8 lg:p-10",
          )}
        >
          <Stepper
            steps={STEPPER_STEPS}
            current={view === "results" ? STEPS.length : step}
            onSelect={handleStepSelect}
          />

          {view === "results" ? (
            compare.isPending ? (
              <ShoppingLoader providers={loaderProviders} />
            ) : compare.isError ? (
              <div className="space-y-4 py-6">
                <Alert variant="destructive">
                  <AlertDescription>
                    {getErrorMessage(compare.error, "We couldn't fetch quotes right now.")}
                  </AlertDescription>
                </Alert>
                <div className="flex flex-wrap justify-center gap-2">
                  <Button type="button" variant="outline" onClick={handleBack}>
                    <ArrowLeft className="size-4" />
                    Back
                  </Button>
                  <Button type="button" onClick={() => runCompare()}>
                    Try again
                  </Button>
                </div>
              </div>
            ) : compare.data ? (
              <ResultsBoard data={compare.data} onBack={handleBack} />
            ) : null
          ) : (
            <Form {...form}>
              <form onSubmit={handleSubmit} noValidate className="flex flex-1 flex-col">
                <div
                  key={step}
                  className={cn(
                    "pb-8 animate-in fade-in duration-300",
                    direction === "forward" ? "slide-in-from-right-6" : "slide-in-from-left-6",
                  )}
                >
                  <h3 className="text-xl font-semibold">{STEPS[step].title}</h3>
                  <p className="mt-1 mb-6 text-sm text-muted-foreground">{STEPS[step].hint}</p>

                  {lookupError && (
                    <Alert variant="destructive" className="mb-6">
                      <AlertDescription>
                        {getErrorMessage(lookupError, "Couldn't load options. Please refresh.")}
                      </AlertDescription>
                    </Alert>
                  )}

                  {step === 0 && (
                    <StepCover
                      vehicleClasses={classes.data ?? []}
                      coverTypes={coverTypes.data ?? []}
                      isLoading={classes.isLoading || coverTypes.isLoading}
                    />
                  )}
                  {step === 1 && (
                    <StepVehicle vehicleMakes={makes.data ?? []} isLoadingMakes={makes.isLoading} />
                  )}
                  {step === 2 && <StepValue providers={allProviders} />}
                  {step === 3 && (
                    <StepExtras benefits={benefits.data ?? []} isLoading={benefits.isLoading} />
                  )}
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 border-t pt-6">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => goTo(step - 1)}
                    className={cn(step === 0 && "invisible")}
                  >
                    <ArrowLeft className="size-4" />
                    Back
                  </Button>
                  <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
                    {step < LAST_STEP ? (
                      <>
                        Next
                        <ArrowRight className="size-4" />
                      </>
                    ) : (
                      <>
                        Compare quotes
                        <Search className="size-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </div>
      </div>
    </section>
  );
}
