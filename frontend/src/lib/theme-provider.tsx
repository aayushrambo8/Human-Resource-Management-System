'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  DEFAULT_PREFERENCES,
  THEMES,
  type AppearanceMode,
  type ThemeId,
  type WorkspacePreferences,
  type ThemeColors,
} from './theme-definitions';

const STORAGE_KEY = 'hrms_workspace_preferences_v2';

interface ThemeContextType {
  preferences: WorkspacePreferences;
  resolvedMode: 'light' | 'dark';
  currentColors: ThemeColors;
  setTheme: (theme: ThemeId) => void;
  setMode: (mode: AppearanceMode) => void;
  toggleTheme: () => void; // for backwards compatibility with test harness
  theme: 'light' | 'dark'; // for backwards compatibility with tests
  updatePreferences: (updates: Partial<WorkspacePreferences>) => void;
  resetDefaults: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function getSystemMode(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyThemeTokens(prefs: WorkspacePreferences, resolvedMode: 'light' | 'dark') {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const themeDef = THEMES[prefs.theme] || THEMES['desert-studio'];
  const baseColors = themeDef[resolvedMode];

  // Resolve custom accents if configured
  const custom = prefs.customAccents[resolvedMode];
  const primary = custom.primary || baseColors.primary;
  const secondary = custom.secondary || baseColors.secondary;

  // Toggle .dark class on html
  if (resolvedMode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Set CSS variables
  const workspaceMat = baseColors.workspaceMat || (resolvedMode === 'dark' ? baseColors.surface : '#F8F5EC');
  root.style.setProperty('--color-workspace-mat', workspaceMat);
  root.style.setProperty('--workspace-mat', workspaceMat);
  root.style.setProperty('--color-canvas', baseColors.canvas);
  root.style.setProperty('--color-canvas-secondary', baseColors.canvasSecondary);
  root.style.setProperty('--color-surface', baseColors.surface);
  root.style.setProperty('--color-surface-elevated', baseColors.surfaceElevated);
  root.style.setProperty('--color-primary', primary);
  root.style.setProperty('--color-primary-hover', baseColors.primaryHover);
  root.style.setProperty('--color-secondary', secondary);
  root.style.setProperty('--color-accent', baseColors.accent);
  root.style.setProperty('--color-supporting', baseColors.supporting);
  root.style.setProperty('--color-text', baseColors.text);
  root.style.setProperty('--color-text-muted', baseColors.textMuted);
  root.style.setProperty('--color-border', baseColors.border);

  // Dynamic Background Asset URL
  const bgPath = `/themes/${prefs.theme}/${resolvedMode}.svg`;
  root.style.setProperty('--background-art-url', `url("${bgPath}")`);
  root.style.setProperty('--background-art-opacity', `${prefs.backgroundIntensity / 100}`);
  root.style.setProperty('--contour-opacity', prefs.showContours ? '1' : '0');
  root.style.setProperty('--card-radius', `${prefs.cardRadius}px`);
  root.style.setProperty('--shadow-multiplier', `${prefs.shadowIntensity / 100}`);

  // Also bridge legacy variables so older UI components seamlessly inherit palette
  root.style.setProperty('--bg', baseColors.canvas);
  root.style.setProperty('--surface', baseColors.surface);
  root.style.setProperty('--surface-alt', baseColors.surfaceElevated);
  root.style.setProperty('--surface-hover', baseColors.canvasSecondary);
  root.style.setProperty('--text', baseColors.text);
  root.style.setProperty('--text-muted', baseColors.textMuted);
  root.style.setProperty('--border', baseColors.border);
  root.style.setProperty('--accent-solid', primary);
  root.style.setProperty('--accent-solid-hover', baseColors.primaryHover);
  root.style.setProperty('--sidebar-bg', baseColors.surface);
  root.style.setProperty('--sidebar-border', baseColors.border);
  root.style.setProperty('--sidebar-text', baseColors.textMuted);
  root.style.setProperty('--sidebar-text-active', baseColors.text);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<WorkspacePreferences>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
        }
      } catch {
        // Fallback to default
      }
    }
    return DEFAULT_PREFERENCES;
  });

  const [systemMode, setSystemMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setSystemMode(getSystemMode());
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemMode(e.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const resolvedMode: 'light' | 'dark' = useMemo(() => {
    if (preferences.mode === 'system') return systemMode;
    return preferences.mode;
  }, [preferences.mode, systemMode]);

  useEffect(() => {
    applyThemeTokens(preferences, resolvedMode);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // quota or private mode
    }
  }, [preferences, resolvedMode]);

  const setTheme = (theme: ThemeId) => {
    setPreferences((prev) => ({ ...prev, theme }));
  };

  const setMode = (mode: AppearanceMode) => {
    setPreferences((prev) => ({ ...prev, mode }));
  };

  const toggleTheme = () => {
    setPreferences((prev) => ({
      ...prev,
      mode: resolvedMode === 'dark' ? 'light' : 'dark',
    }));
  };

  const updatePreferences = (updates: Partial<WorkspacePreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  };

  const resetDefaults = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };

  const currentColors = useMemo(() => {
    const themeDef = THEMES[preferences.theme] || THEMES['desert-studio'];
    return themeDef[resolvedMode];
  }, [preferences.theme, resolvedMode]);

  return (
    <ThemeContext.Provider
      value={{
        preferences,
        resolvedMode,
        currentColors,
        setTheme,
        setMode,
        toggleTheme,
        theme: resolvedMode,
        updatePreferences,
        resetDefaults,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Anti-flicker pre-hydration script
export const themeInitScript = `
(function() {
  try {
    var raw = localStorage.getItem('${STORAGE_KEY}');
    var prefs = raw ? JSON.parse(raw) : null;
    var mode = (prefs && prefs.mode) || 'light';
    if (mode === 'system') {
      mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();
`;
