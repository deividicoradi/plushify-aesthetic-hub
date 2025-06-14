
import React, { useEffect } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ComponentProps } from "react";

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  useEffect(() => {
    // Force a re-render after hydration to ensure theme is applied
    const timer = setTimeout(() => {
      document.documentElement.classList.toggle('theme-loaded', true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <NextThemesProvider 
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      disableTransitionOnChange={false}
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
