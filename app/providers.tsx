"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "next-auth/react";
import { useState, useEffect } from "react";

function LazyQueryDevtools() {
  const [Devtools, setDevtools] = useState<React.ComponentType<{ initialIsOpen?: boolean }> | null>(null);
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    import("@tanstack/react-query-devtools")
      .then((mod) => setDevtools(() => mod.ReactQueryDevtools))
      .catch(() => {});
  }, []);
  return Devtools ? <Devtools initialIsOpen={false} /> : null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <SessionProvider basePath="/api/auth">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        <LazyQueryDevtools />
      </QueryClientProvider>
    </SessionProvider>
  );
}
