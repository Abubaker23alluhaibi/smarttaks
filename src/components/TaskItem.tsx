import { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Task, TaskStatus } from '../types';
import { useTheme } from '../theme/ThemeContext';
import type { AppPalette } from '../theme/palettes';
import { PRIORITIES, TASK_ROW_HEIGHT, getCategoryMeta } from '../constants';

type Props = {
  task: Task;
  onSetStatus: (id: string, status: TaskStatus) => void;
  onQuickComplete: (id: string) => void;
  onDelete: (id: string) => void;
};

const STATUS_ORDER: TaskStatus[] = ['Pending', 'InProgress', 'Completed'];

const STATUS_LABEL: Record<TaskStatus, string> = {
  Pending: 'Pending',
  InProgress: 'Active',
  Completed: 'Done',
};

function priorityColors(p: Task['priority']) {
  switch (p) {
    case 'High':
      return { fg: '#B71C1C', bg: '#FFEBEE' };
    case 'Medium':
      return { fg: '#E65100', bg: '#FFF3E0' };
    default:
      return { fg: '#37474F', bg: '#ECEFF1' };
  }
}

/**
 * Task card: category strip (icon + color), priority badge, tri-state status controls,
 * quick completion checkbox, and destructive delete.
 */
export function TaskItem({
  task,
  onSetStatus,
  onQuickComplete,
  onDelete,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const cat = useMemo(() => getCategoryMeta(task.category), [task.category]);
  const pri = useMemo(() => priorityColors(task.priority), [task.priority]);
  const priorityLabel = useMemo(() => {
    return PRIORITIES.find((p) => p.value === task.priority)?.label ?? task.priority;
  }, [task.priority]);

  const confirmDelete = useCallback(() => {
    Alert.alert('Delete task', 'Remove this task permanently?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          onDelete(task.id);
        },
      },
    ]);
  }, [onDelete, task.id]);

  const onCheckbox = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onQuickComplete(task.id);
  }, [onQuickComplete, task.id]);

  const selectStatus = useCallback(
    (s: TaskStatus) => {
      if (s === task.status) return;
      void Haptics.selectionAsync();
      onSetStatus(task.id, s);
    },
    [onSetStatus, task.id, task.status],
  );

  const doneVisual = task.status === 'Completed';

  return (
    <View style={[styles.card, doneVisual && styles.cardDone]}>
      <View style={styles.rowTop}>
        <Pressable
          onPress={onCheckbox}
          style={({ pressed }) => [
            styles.checkbox,
            doneVisual && styles.checkboxOn,
            pressed && { opacity: 0.85 },
          ]}
          accessibilityLabel="Toggle completed"
        >
          {doneVisual ? (
            <Ionicons name="checkmark" size={16} color={colors.onPrimary} />
          ) : null}
        </Pressable>

        <View style={styles.body}>
          <Text
            style={[styles.title, doneVisual && styles.titleDone]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
          <View style={styles.metaRow}>
            <View style={[styles.catChip, { backgroundColor: cat.softBg }]}>
              <Ionicons
                name={cat.icon as keyof typeof Ionicons.glyphMap}
                size={14}
                color={cat.color}
              />
              <Text style={[styles.catLabel, { color: cat.color }]}>{cat.label}</Text>
            </View>
            <View style={[styles.priChip, { backgroundColor: pri.bg }]}>
              <Text style={[styles.priText, { color: pri.fg }]}>{priorityLabel}</Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={confirmDelete}
          hitSlop={12}
          style={({ pressed }) => [styles.trash, pressed && { opacity: 0.6 }]}
          accessibilityLabel="Delete task"
        >
          <Ionicons name="trash-outline" size={20} color={colors.onSurfaceVariant} />
        </Pressable>
      </View>

      <View style={styles.statusRow}>
        {STATUS_ORDER.map((s) => {
          const active = task.status === s;
          return (
            <Pressable
              key={s}
              onPress={() => selectStatus(s)}
              style={[
                styles.statusChip,
                active && styles.statusChipActive,
                active && s === 'InProgress' && { borderColor: colors.primaryContainer },
                active && s === 'Completed' && { borderColor: colors.success },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  active && styles.statusTextActive,
                  active && s === 'InProgress' && { color: colors.primaryContainer },
                  active && s === 'Completed' && { color: colors.success },
                ]}
                numberOfLines={1}
              >
                {STATUS_LABEL[s]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    card: {
      height: TASK_ROW_HEIGHT,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: 8,
      backgroundColor: colors.surfaceContainerLowest,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.outlineVariant,
      justifyContent: 'space-between',
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 10 },
        },
        android: { elevation: 3 },
      }),
    },
    cardDone: {
      opacity: 0.62,
    },
    rowTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.outlineVariant,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    checkboxOn: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    body: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.onSurface,
    },
    titleDone: {
      textDecorationLine: 'line-through',
      color: colors.onSurfaceVariant,
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 8,
      marginTop: 6,
    },
    catChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    catLabel: {
      fontSize: 11,
      fontWeight: '800',
    },
    priChip: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    priText: {
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 0.3,
    },
    trash: {
      padding: 6,
      marginTop: -2,
    },
    statusRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 4,
    },
    statusChip: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      backgroundColor: colors.surface,
      alignItems: 'center',
    },
    statusChipActive: {
      backgroundColor: colors.surfaceContainerLow,
      borderColor: colors.onSurfaceVariant,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.onSurfaceVariant,
    },
    statusTextActive: {
      color: colors.onSurface,
    },
  });
}
