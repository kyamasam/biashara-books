import "@ant-design/v5-patch-for-react-19";
import "./globals.css";
import type { Metadata } from "next";
import { Jost } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Providers from "./providers";
import { AntdRegistry } from "@/lib/AntdRegistry";
import { ThemeProvider } from "@/context/ThemeContext";

const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jost",
});

export const metadata: Metadata = {
  title: { default: "Zoe Insurance", template: "%s | Zoe Insurance" },
  description: "Manage insurance policies, members and claims in one place.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jost.variable}>
      <body>
        <AntdRegistry>
          <ThemeProvider>
            <Providers>{children}</Providers>
          </ThemeProvider>
        </AntdRegistry>
        <Toaster
          position="top-center"
          gutter={8}
          containerStyle={{ zIndex: 9999 }}
        />
      </body>
    </html>
  );
}
