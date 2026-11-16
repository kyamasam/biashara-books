"use client";

import { Button, Flex, Layout, theme } from "antd";
import { PanelLeft } from "lucide-react";
import { UserMenu } from "./user-menu";

const { Header } = Layout;

interface Props {
  onToggleSidebar: () => void;
}

export function DashboardHeader({ onToggleSidebar }: Props) {
  const { token } = theme.useToken();

  return (
    <Header
      style={{
        padding: "0 16px",
        position: "sticky",
        top: 0,
        zIndex: 10,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <Flex align="center" justify="space-between" style={{ height: "100%" }}>
        <Button
          type="text"
          aria-label="Toggle sidebar"
          icon={<PanelLeft className="h-4 w-4" />}
          onClick={onToggleSidebar}
        />
        <UserMenu />
      </Flex>
    </Header>
  );
}
