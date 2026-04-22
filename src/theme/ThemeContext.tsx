import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkPalette, lightPalette, type AppPalette } from './palettes';

export type ThemeMode = 'light' | 'dark';

const STORAGE_THEME_KEY = 'smart_task_planner_theme_v1';

type ThemeContextValue = {
  mode: ThemeMode;
  isDark: boolean;
  colors: AppPalette;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

async function loadThemeMode(): Promise<ThemeMode> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_THEME_KEY);
    if (raw === 'dark' || raw === 'light') return raw;
  } catch {
    /* default */
  }
  return 'light';
}

async function saveThemeMode(mode: ThemeMode): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_THEME_KEY, mode);
  } catch {
    /* ignore */
  }
}

/**
 * Global theme (light/dark) persisted with AsyncStorage so the choice survives restarts.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    let cancelled = false;
    loadThemeMode().then((m) => {
      if (!cancelled) setModeState(m);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    void saveThemeMode(m);
  }, []);

  const toggleTheme = useCallback(() => {
    setModeState((prev) => {
      const next: ThemeMode = prev === 'light' ? 'dark' : 'light';
      void saveThemeMode(next);
      return next;
    });
  }, []);

  const isDark = mode === 'dark';
  const colors = useMemo(
    (): AppPalette =>
      isDark ? darkPalette : (lightPalette as unknown as AppPalette),
    [isDark],
  );

  const value = useMemo(
    () => ({
      mode,
      isDark,
      colors,
      setMode,
      toggleTheme,
    }),
    [mode, isDark, colors, setMode, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
