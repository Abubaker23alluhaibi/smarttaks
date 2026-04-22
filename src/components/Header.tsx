import { View, Text, StyleSheet } from 'react-native';
import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import type { AppPalette } from '../theme/palettes';

/**
 * Welcoming header with a fixed English date line (consistent UI copy).
 */
export function Header({ title }: { title: string }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const dateLabel = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }).format(new Date());
  }, []);

  return (
    <View style={[styles.wrap, { paddingTop: Math.max(insets.top, 12) + 8 }]}>
      <Text style={styles.eyebrow}>{dateLabel}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    wrap: {
      paddingHorizontal: 24,
      paddingBottom: 16,
      backgroundColor: colors.surface,
    },
    eyebrow: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.onSurfaceVariant,
      marginBottom: 8,
    },
    title: {
      fontSize: 34,
      fontWeight: '900',
      letterSpacing: -0.5,
      color: colors.primary,
    },
  });
}
