import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "../domains/auth/components/AuthProvider";
import { ThemeProvider } from "../shared/theme/ThemeProvider";
import { LocaleProvider } from "../shared/i18n/LocaleProvider";
import { useThemeStore } from "../shared/theme/themeStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function ThemedToaster() {
  const resolved = useThemeStore((state) => state.resolved);
  return <Toaster position="top-center" richColors closeButton theme={resolved} />;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LocaleProvider>
        <BrowserRouter>
          <AuthProvider>{children}</AuthProvider>
        </BrowserRouter>
        <ThemedToaster />
        </LocaleProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
