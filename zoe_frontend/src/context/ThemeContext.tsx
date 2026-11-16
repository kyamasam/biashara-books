"use client";

import { App, ConfigProvider, theme as antdTheme } from "antd";
import type { ThemeConfig } from "antd";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type AppThemeMode = "light" | "dark";

const fontFamily = "var(--font-jost), -apple-system, system-ui, sans-serif";

const appThemes: Record<AppThemeMode, ThemeConfig> = {
  light: {
    algorithm: antdTheme.defaultAlgorithm,
    token: { colorPrimary: "#16a2a2", borderRadius: 8, fontFamily },
    components: {
      Layout: { siderBg: "#ffffff", headerBg: "#ffffff", bodyBg: "#f5f7f9" },
    },
  },
  dark: {
    algorithm: antdTheme.darkAlgorithm,
    token: { colorPrimary: "#20A67A", borderRadius: 8, fontFamily },
    components: {
      Layout: { siderBg: "#141414", headerBg: "#141414", bodyBg: "#000000" },
    },
  },
};

interface ThemeContextValue {
  mode: AppThemeMode;
  setMode: (mode: AppThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AppThemeMode>("light");
  const toggleMode = useCallback(
    () => setMode((m) => (m === "light" ? "dark" : "light")),
    [],
  );
  const value = useMemo(
    () => ({ mode, setMode, toggleMode }),
    [mode, toggleMode],
  );

  return (
    <ThemeContext.Provider value={value}>
      <ConfigProvider theme={appThemes[mode]}>
        <App>{children}</App>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
