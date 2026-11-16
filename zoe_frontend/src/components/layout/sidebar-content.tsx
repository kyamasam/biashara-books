"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "antd";
import type { MenuProps } from "antd";
import { Logo } from "@/components/brand/logo";
import { NAV_ITEMS, type NavItem } from "@/lib/nav-items";

type MenuItem = Required<MenuProps>["items"][number];

const mapMenuItems = (items: NavItem[]): MenuItem[] =>
  items.map((item) => {
    const Icon = item.icon;
    return item.children
      ? {
          key: item.path,
          icon: <Icon className="h-4 w-4" />,
          label: item.label,
          children: mapMenuItems(item.children),
        }
      : {
          key: item.path,
          icon: <Icon className="h-4 w-4" />,
          label: <Link href={item.path}>{item.label}</Link>,
        };
  });

/** Longest nav path that prefixes the current route, so detail pages keep their parent highlighted. */
const activeKey = (pathname: string) =>
  NAV_ITEMS.map((i) => i.path)
    .filter((p) => pathname === p || pathname.startsWith(`${p}/`))
    .sort((a, b) => b.length - a.length)[0] ?? pathname;

interface Props {
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function SidebarContent({ collapsed = false, onNavigate }: Props) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Logo href="/dashboard" collapsed={collapsed} />
      </div>
      <Menu
        mode="inline"
        selectedKeys={[activeKey(pathname)]}
        items={mapMenuItems(NAV_ITEMS)}
        inlineIndent={20}
        onClick={onNavigate}
        style={{ borderRight: 0, background: "transparent" }}
      />
    </div>
  );
}
