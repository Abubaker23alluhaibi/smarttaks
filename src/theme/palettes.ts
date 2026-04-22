/**
 * Light / dark palettes consumed by `ThemeContext` for global appearance.
 */
export const lightPalette = {
  primary: '#24389c',
  primaryContainer: '#3F51B5',
  onPrimary: '#ffffff',
  surface: '#F5F5F5',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f3f3f3',
  surfaceContainerHigh: '#e8e8e8',
  surfaceContainerHighest: '#e2e2e2',
  onSurface: '#1a1c1c',
  onSurfaceVariant: '#454652',
  outlineVariant: '#c5c5d4',
  tertiary: '#6c3400',
  success: '#2E7D32',
  chartTrack: '#e0e0e0',
} as const;

type PaletteShape = typeof lightPalette;
/** Same keys as the light palette; values are any CSS color string (light + dark). */
export type AppPalette = { [K in keyof PaletteShape]: string };

export const darkPalette: AppPalette = {
  primary: '#9fa8da',
  primaryContainer: '#5c6bc0',
  onPrimary: '#0d1117',
  surface: '#0d1117',
  surfaceContainerLowest: '#161b22',
  surfaceContainerLow: '#21262d',
  surfaceContainerHigh: '#30363d',
  surfaceContainerHighest: '#484f58',
  onSurface: '#f0f6fc',
  onSurfaceVariant: '#8b949e',
  outlineVariant: '#484f58',
  tertiary: '#ffa657',
  success: '#56d364',
  chartTrack: '#30363d',
};
