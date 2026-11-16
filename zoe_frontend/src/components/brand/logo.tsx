import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  white?: boolean;
  collapsed?: boolean;
  href?: string;
  className?: string;
}

export function Logo({ white = false, collapsed = false, href = "/", className }: Props) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 w-fit", className)}>
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          white ? "bg-white/15 text-white" : "bg-primary text-primary-foreground",
        )}
      >
        <ShieldCheck className="h-4 w-4" />
      </span>
      {!collapsed && (
        <span
          className={cn(
            "text-lg font-bold tracking-tight",
            white ? "text-white" : "text-foreground",
          )}
        >
          Zoe<span className={white ? "text-white/70" : "text-primary"}> Insurance</span>
        </span>
      )}
    </Link>
  );
}
