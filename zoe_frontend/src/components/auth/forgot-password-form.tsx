"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage, useApiMutation } from "@/hooks/use-api";
import type { SendResetLinkPayload } from "@/types/auth";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const { mutate, isPending, isSuccess, error } = useApiMutation<
    { data: string },
    SendResetLinkPayload
  >({ method: "POST", url: "/users/send-reset-link/" });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutate({ email });
  };

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
        <h1 className="text-xl font-semibold">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          We sent a reset code to <strong>{email}</strong>. Use it to choose a
          new password.
        </p>
        <Button asChild className="w-full">
          <Link href={`/reset-password?email=${encodeURIComponent(email)}`}>
            Enter reset code
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset code.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isPending} />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{getErrorMessage(error, "Failed to send reset code")}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Send reset code
        </Button>
        <Button asChild variant="ghost" className="w-full">
          <Link href="/login">Back to sign in</Link>
        </Button>
      </form>
    </div>
  );
}
