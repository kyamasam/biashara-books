import { AuthHeroLayout } from "@/components/auth/auth-hero-layout";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <AuthHeroLayout
      heading="Locked out?"
      subheading="We'll email you a code so you can choose a new password."
    >
      <ForgotPasswordForm />
    </AuthHeroLayout>
  );
}
