import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTasks } from '../context/TasksContext';
import { useTheme } from '../theme/ThemeContext';
import type { AppPalette } from '../theme/palettes';
import { ProgressRing } from '../components/ProgressRing';
import { startOfLocalWeekMs } from '../utils/dateRange';

/**
 * Aggregates AsyncStorage-backed tasks in-memory to surface completion ratios and weekly throughput.
 */
export function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { tasks } = useTasks();

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    const open = tasks.filter(
      (t) => t.status === 'Pending' || t.status === 'InProgress',
    ).length;
    const completedRatio = total > 0 ? completed / total : 0;
    const openRatio = total > 0 ? open / total : 0;

    const weekStart = startOfLocalWeekMs();
    const completedThisWeek = tasks.filter(
      (t) =>
        t.status === 'Completed' &&
        typeof t.completedAt === 'number' &&
        t.completedAt >= weekStart,
    ).length;

    return {
      total,
      completed,
      open,
      completedRatio,
      openRatio,
      completedThisWeek,
    };
  }, [tasks]);

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ScrollView
      style={[styles.screen, { paddingTop: 16 + insets.top }]}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.headline}>Insights</Text>
      <Text style={styles.lead}>
        Derived from your stored tasks — same data AsyncStorage persists after each change.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Overview</Text>
        <View style={styles.row}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{stats.total}</Text>
            <Text style={styles.statLab}>Total tasks</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{stats.completed}</Text>
            <Text style={styles.statLab}>Completed</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{stats.open}</Text>
            <Text style={styles.statLab}>Open</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Completion mix</Text>
        <View style={styles.rings}>
          <ProgressRing
            progress={stats.completedRatio}
            label={`${Math.round(stats.completedRatio * 100)}%`}
            caption="Completed share"
            colors={colors}
            accentColor={colors.success}
          />
          <ProgressRing
            progress={stats.openRatio}
            label={`${Math.round(stats.openRatio * 100)}%`}
            caption="Pending + active"
            colors={colors}
            accentColor={colors.primaryContainer}
          />
        </View>
        {stats.total === 0 ? (
          <Text style={styles.hint}>Add tasks on the Home tab to populate this dashboard.</Text>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>This week</Text>
        <Text style={styles.weekBig}>{stats.completedThisWeek}</Text>
        <Text style={styles.weekSub}>tasks marked completed since Monday (local time)</Text>
        <Text style={styles.hint}>
          Only completions with a recorded time are counted (new completions from this build
          onward).
        </Text>
      </View>
    </ScrollView>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    content: {
      paddingHorizontal: 24,
      paddingBottom: 32,
    },
    headline: {
      fontSize: 32,
      fontWeight: '900',
      color: colors.primary,
      letterSpacing: -0.5,
    },
    lead: {
      marginTop: 8,
      fontSize: 14,
      fontWeight: '600',
      color: colors.onSurfaceVariant,
      lineHeight: 20,
      marginBottom: 20,
    },
    card: {
      backgroundColor: colors.surfaceContainerLowest,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.outlineVariant,
    },
    cardTitle: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1,
      color: colors.onSurfaceVariant,
      marginBottom: 12,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    stat: { flex: 1, alignItems: 'center' },
    statVal: {
      fontSize: 26,
      fontWeight: '900',
      color: colors.onSurface,
    },
    statLab: {
      marginTop: 4,
      fontSize: 11,
      fontWeight: '700',
      color: colors.onSurfaceVariant,
    },
    rings: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: 8,
    },
    weekBig: {
      fontSize: 48,
      fontWeight: '900',
      color: colors.primaryContainer,
    },
    weekSub: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.onSurfaceVariant,
      marginBottom: 8,
    },
    hint: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.onSurfaceVariant,
      fontStyle: 'italic',
    },
  });
}
