import { useMemo } from 'react';
import { Pressable, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../theme/ThemeContext';
import type { AppPalette } from '../theme/palettes';

type Props = {
  onPress: () => void;
  bottomInset: number;
};

/**
 * Primary floating action for creating a task (opens the Add Task screen).
 */
export function FAB({ onPress, bottomInset }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      onPress={() => {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      style={({ pressed }) => [
        styles.fab,
        { bottom: 24 + bottomInset },
        pressed && styles.fabPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Add task"
    >
      <Ionicons name="add" size={30} color={colors.onPrimary} />
    </Pressable>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    fab: {
      position: 'absolute',
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryContainer,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOpacity: 0.25,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 12 },
        },
        android: { elevation: 6 },
      }),
    },
    fabPressed: {
      transform: [{ scale: 0.96 }],
      opacity: 0.95,
    },
  });
}
