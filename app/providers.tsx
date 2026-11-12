"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Toaster } from "sonner";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              borderRadius: "1rem",
              background: "#080e1a",
              borderColor: "rgba(255, 255, 255, 0.1)",
              color: "#f8fafc",
              backdropFilter: "blur(16px)",
            },
          }}
        />
      </NextThemesProvider>
    </SessionProvider>
  );
}
