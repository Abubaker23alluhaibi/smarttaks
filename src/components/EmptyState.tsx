import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../theme/ThemeContext';
import type { AppPalette } from '../theme/palettes';

/**
 * Empty list illustration state when there are zero tasks.
 */
export function EmptyState() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.wrap} accessibilityRole="summary">
      <View style={styles.art}>
        <Ionicons name="clipboard-outline" size={56} color={colors.primaryContainer} />
      </View>
      <Text style={styles.title}>No tasks yet</Text>
      <Text style={styles.subtitle}>
        Tap + to add a task with category, priority, and a clear status.
      </Text>
    </View>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    wrap: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingVertical: 40,
    },
    art: {
      width: 160,
      height: 160,
      borderRadius: 24,
      backgroundColor: colors.surfaceContainerLowest,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.outlineVariant,
    },
    title: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.onSurface,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '500',
      color: colors.onSurfaceVariant,
      textAlign: 'center',
      maxWidth: 300,
    },
  });
}
