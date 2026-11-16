"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Drawer, Layout, theme } from "antd";
import { DashboardHeader } from "./dashboard-header";
import { SidebarContent } from "./sidebar-content";

const { Sider, Content } = Layout;
const MOBILE_BREAKPOINT = 1024;

export function DashboardShell({ children }: { children: ReactNode }) {
  const { token } = theme.useToken();
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      setSidebarCollapsed(mobile);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const toggleSidebar = () => setSidebarCollapsed((c) => !c);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {isMobile ? (
        <Drawer
          placement="left"
          closable={false}
          open={!sidebarCollapsed}
          onClose={toggleSidebar}
          width={280}
          styles={{ body: { padding: 0 } }}
        >
          <SidebarContent onNavigate={toggleSidebar} />
        </Drawer>
      ) : (
        <Sider
          trigger={null}
          collapsible
          collapsed={sidebarCollapsed}
          width={248}
          collapsedWidth={76}
          style={{
            borderRight: `1px solid ${token.colorBorderSecondary}`,
            position: "sticky",
            top: 0,
            height: "100vh",
          }}
        >
          <SidebarContent collapsed={sidebarCollapsed} />
        </Sider>
      )}
      <Layout>
        <DashboardHeader onToggleSidebar={toggleSidebar} />
        <Content style={{ padding: 24 }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
