import { AuthHeroLayout } from "@/components/auth/auth-hero-layout";
import { RegisterCard } from "@/components/auth/register-card";

export const metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <AuthHeroLayout
      heading="Insurance, simplified."
      subheading="Create an account to get quotes, buy cover and manage your policies."
    >
      <RegisterCard />
    </AuthHeroLayout>
  );
}
