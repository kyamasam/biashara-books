import type { NextConfig } from "next";

const getRemotePattern = (protocol: "http" | "https", hostname: string) => ({
  protocol,
  hostname,
  port: "",
  pathname: "/**",
});

const nextConfig: NextConfig = {
 images: {
    remotePatterns: [
      getRemotePattern("https", "techcommunity.microsoft.com"),
      // Remove the wildcard pattern as it's too permissive and might cause issues
      // getRemotePattern("https", "*"),
      ...(process.env.NODE_ENV === "development"
        ? [
            getRemotePattern("http", "localhost"),
            getRemotePattern("http", "127.0.0.1"),
          ]
        : []),
    ],
    minimumCacheTTL: 10,
  },
};

export default nextConfig;
