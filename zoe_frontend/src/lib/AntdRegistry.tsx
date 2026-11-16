"use client";

import { createCache, extractStyle, StyleProvider } from "@ant-design/cssinjs";
import type Entity from "@ant-design/cssinjs/es/Cache";
import { useServerInsertedHTML } from "next/navigation";
import { useMemo, useRef, type ReactNode } from "react";

/** Flushes antd CSS-in-JS styles into the SSR stream (App Router). */
export function AntdRegistry({ children }: { children: ReactNode }) {
  const cache = useMemo<Entity>(() => createCache(), []);
  const isServerInserted = useRef(false);

  useServerInsertedHTML(() => {
    if (isServerInserted.current) return null;
    isServerInserted.current = true;
    return (
      <style
        id="antd"
        dangerouslySetInnerHTML={{ __html: extractStyle(cache, true) }}
      />
    );
  });

  return <StyleProvider cache={cache}>{children}</StyleProvider>;
}
