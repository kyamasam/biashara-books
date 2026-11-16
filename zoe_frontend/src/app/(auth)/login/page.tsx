"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthHeroLayout } from "@/components/auth/auth-hero-layout";
import { ManualForm } from "@/components/auth/manual-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCurrentUser } from "@/hooks/auth/use-current-user";

/** Only allow same-origin relative redirects. */
const safeNext = (next: string | null) =>
  next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNext(searchParams.get("next"));
  const registered = searchParams.get("registered") === "1";
  const { isAuthenticated } = useCurrentUser();

  useEffect(() => {
    if (isAuthenticated) router.replace(next);
  }, [isAuthenticated, next, router]);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back. Sign in to continue.
        </p>
      </div>
      {registered && (
        <Alert>
          <AlertDescription>Account created. You can sign in now.</AlertDescription>
        </Alert>
      )}
      <ManualForm onSuccess={() => router.replace(next)} />
      <p className="text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthHeroLayout
      heading="Cover that keeps up with you."
      subheading="Manage policies, members and claims from one place."
    >
      <Suspense>
        <LoginContent />
      </Suspense>
    </AuthHeroLayout>
  );
}
