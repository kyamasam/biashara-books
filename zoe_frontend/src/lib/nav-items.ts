import { Car, ClipboardList, FileText, LayoutDashboard, Package, Settings, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Overview", path: "/dashboard", icon: LayoutDashboard },
  { label: "Vehicles", path: "/dashboard/vehicles", icon: Car },
  { label: "Products", path: "/dashboard/products", icon: Package },
  { label: "Quotes", path: "/dashboard/quotes", icon: ClipboardList },
  { label: "Policies", path: "/dashboard/policies", icon: FileText },
  { label: "Members", path: "/dashboard/members", icon: Users },
  { label: "Settings", path: "/dashboard/settings", icon: Settings },
];
