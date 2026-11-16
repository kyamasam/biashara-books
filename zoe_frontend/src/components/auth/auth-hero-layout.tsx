import Image from "next/image";
import { Logo } from "@/components/brand/logo";

interface Props {
  children: React.ReactNode;
  heading: string;
  subheading: string;
  imageSrc?: string;
}

export function AuthHeroLayout({
  children,
  heading,
  subheading,
  imageSrc = "/hero.jpg",
}: Props) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[45%] relative shrink-0">
        <Image src={imageSrc} alt="" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          <Logo white />
          <div className="text-white">
            <h2 className="text-4xl font-bold mb-3 leading-tight">{heading}</h2>
            <p className="text-white/75 text-base leading-relaxed">{subheading}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-muted/40">
        <div className="p-6 lg:hidden">
          <Logo />
        </div>
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
