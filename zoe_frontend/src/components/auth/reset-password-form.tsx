"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorMessage, useApiMutation } from "@/hooks/use-api";
import type { ResetPasswordPayload } from "@/types/auth";
import { PasswordInput } from "./password-input";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    email: searchParams.get("email") ?? "",
    password_reset_code: searchParams.get("code") ?? "",
    password: "",
    confirm_password: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  const { mutate, isPending, isSuccess, error } = useApiMutation<
    { data: string },
    ResetPasswordPayload
  >({ method: "POST", url: "/users/reset-password/" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError(null);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) return setFormError("Password must be at least 8 characters.");
    if (form.password !== form.confirm_password) return setFormError("Passwords do not match.");
    mutate({
      email: form.email,
      password_reset_code: form.password_reset_code.trim(),
      password: form.password,
    });
  };

  if (isSuccess) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
        <h1 className="text-xl font-semibold">Password updated</h1>
        <p className="text-sm text-muted-foreground">
          You can now sign in with your new password.
        </p>
        <Button asChild className="w-full">
          <Link href="/login">Go to sign in</Link>
        </Button>
      </div>
    );
  }

  const message = formError ?? (error ? getErrorMessage(error, "Failed to reset password") : null);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Choose a new password</h1>
        <p className="text-sm text-muted-foreground">
          Enter the code from your email and a new password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password_reset_code">Reset code</Label>
          <Input id="password_reset_code" name="password_reset_code" autoComplete="one-time-code" value={form.password_reset_code} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <PasswordInput id="password" name="password" autoComplete="new-password" placeholder="Min. 8 characters" value={form.password} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm_password">Confirm new password</Label>
          <PasswordInput id="confirm_password" name="confirm_password" autoComplete="new-password" value={form.confirm_password} onChange={handleChange} required />
        </div>

        {message && (
          <Alert variant="destructive">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Reset password
        </Button>
      </form>
    </div>
  );
}
