
import React, { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-accent"
      >
        <div className="h-4 w-4" />
        <span className="sr-only">Alternando tema...</span>
      </Button>
    );
  }

  const toggleTheme = () => {
    console.log('Current theme:', theme);
    console.log('Resolved theme:', resolvedTheme);
    
    const newTheme = resolvedTheme === "light" ? "dark" : "light";
    console.log('Setting theme to:', newTheme);
    setTheme(newTheme);
  };

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-8 w-8 p-0 hover:bg-accent"
    >
      <Sun className={`h-4 w-4 transition-all ${isDark ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
      <Moon className={`absolute h-4 w-4 transition-all ${isDark ? 'rotate-0 scale-100' : '-rotate-90 scale-0'}`} />
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
