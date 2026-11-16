import Image from "next/image";
import Link from "next/link";
import { Car, FileCheck2, ShieldCheck, Users } from "lucide-react";
import { QuoteComparison } from "@/components/marketing/quote-comparison/quote-comparison";
import { Button } from "@/components/ui/button";

const FEATURES = [
  { icon: ShieldCheck, title: "Trusted cover", body: "Policies from licensed insurance providers." },
  { icon: Car, title: "Motor insurance", body: "Get valuations and quotes for your vehicle." },
  { icon: Users, title: "Group policies", body: "Cover your team or family under one plan." },
  { icon: FileCheck2, title: "Everything in one place", body: "Track policies and members from your dashboard." },
];

export default function HomePage() {
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <Image src="/hero.jpg" alt="" fill priority className="-z-10 object-cover" />
        <div className="absolute inset-0 -z-10 bg-black/60" />
        <div className="mx-auto max-w-6xl px-4 py-28 sm:px-6 sm:py-36">
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Insurance that&apos;s simple to buy and easy to manage.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/80">
            Compare cover, buy a policy and manage it online with Zoe Insurance.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="#compare">Compare quotes</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/register">Get started</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent text-white hover:bg-white/10 hover:text-white">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </div>
      </section>

      <QuoteComparison />

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Why Zoe</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border bg-card p-6">
              <Icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
