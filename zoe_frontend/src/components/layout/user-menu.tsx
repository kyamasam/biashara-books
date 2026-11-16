"use client";

import { Avatar, Dropdown, Flex, Typography } from "antd";
import type { MenuProps } from "antd";
import { LogOut, Moon, Sun } from "lucide-react";
import { useCurrentUser } from "@/hooks/auth/use-current-user";
import { useLogout } from "@/hooks/auth/use-logout";
import { useTheme } from "@/context/ThemeContext";
import { formatUserType, getUserDisplayName, getUserInitials } from "@/lib/utils";

const { Text } = Typography;

export function UserMenu() {
  const { data: user } = useCurrentUser();
  const { logout } = useLogout();
  const { mode, toggleMode } = useTheme();

  const items: MenuProps["items"] = [
    {
      key: "theme",
      icon: mode === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />,
      label: mode === "light" ? "Dark mode" : "Light mode",
      onClick: toggleMode,
    },
    { type: "divider" },
    {
      key: "logout",
      danger: true,
      icon: <LogOut className="h-4 w-4" />,
      label: "Log out",
      onClick: logout,
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
      <button type="button" className="flex items-center gap-3 rounded-lg px-2 py-1 cursor-pointer">
        <Avatar src={user?.profile?.profile_photo || undefined} style={{ flexShrink: 0 }}>
          {getUserInitials(user)}
        </Avatar>
        <Flex vertical className="hidden text-left sm:flex" style={{ lineHeight: 1.2 }}>
          <Text strong ellipsis style={{ maxWidth: 180 }}>
            {getUserDisplayName(user)}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {formatUserType(user?.user_type)}
          </Text>
        </Flex>
      </button>
    </Dropdown>
  );
}
