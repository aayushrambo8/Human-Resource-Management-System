'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  /** null until mounted — the toggle renders nothing until the real value is known (avoids hydration mismatch). */
  theme: Theme | null;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used within ThemeProvider');
  return value;
}

/**
 * Applied before first paint (inlined in the root layout) so the correct theme
 * is present in the initial HTML paint — no flash and no hydration mismatch.
 * Must stay in sync with `applyTheme` below.
 */
export const themeInitScript = `(function(){try{var stored=localStorage.getItem('hrms-theme');var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var dark=stored==='dark'||(stored!=='light'&&prefersDark);var root=document.documentElement;root.classList.toggle('dark',dark);root.style.colorScheme=dark?'dark':'light';}catch(e){}})();`;

function applyTheme(next: Theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', next === 'dark');
  root.style.colorScheme = next;
  try {
    localStorage.setItem('hrms-theme', next);
  } catch {
    /* storage unavailable (private mode) — theme still applies for this page view */
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
