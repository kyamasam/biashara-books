import { Suspense } from "react";
import { AuthHeroLayout } from "@/components/auth/auth-hero-layout";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata = { title: "Reset password" };

export default function ResetPasswordPage() {
  return (
    <AuthHeroLayout
      heading="Almost there."
      subheading="Enter the code we emailed you and pick a new password."
    >
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthHeroLayout>
  );
}
