import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTasks } from '../context/TasksContext';
import { useTheme } from '../theme/ThemeContext';
import type { AppPalette } from '../theme/palettes';

const WORK_SEC = 25 * 60;
const BREAK_SEC = 5 * 60;

type Phase = 'work' | 'break';

/**
 * Pomodoro: 25-minute work tied to the Active task, then a 5-minute break.
 * Intervals are owned in `useEffect` with cleanup; phase transitions use `Alert` as the bell.
 */
export function FocusScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { tasks, setTaskStatus } = useTasks();
  const [phase, setPhase] = useState<Phase>('work');
  const [seconds, setSeconds] = useState(WORK_SEC);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completionFiredRef = useRef(false);
  const prevActiveIdRef = useRef<string | undefined>(undefined);
  const skipActiveResetRef = useRef(false);

  const activeTask = useMemo(
    () => tasks.find((t) => t.status === 'InProgress'),
    [tasks],
  );

  const activeTaskId = activeTask?.id;
  const duration = phase === 'work' ? WORK_SEC : BREAK_SEC;
  const taskTitle =
    phase === 'work'
      ? (activeTask?.title ?? 'No active task')
      : 'Break time';

  useEffect(() => {
    if (phase !== 'work') return;
    if (skipActiveResetRef.current) {
      skipActiveResetRef.current = false;
      prevActiveIdRef.current = activeTaskId;
      return;
    }
    const prev = prevActiveIdRef.current;
    if (activeTaskId === prev) return;
    prevActiveIdRef.current = activeTaskId;

    if (activeTaskId && prev && activeTaskId !== prev) {
      setIsActive(false);
      setSeconds(WORK_SEC);
      completionFiredRef.current = false;
      return;
    }
    if (activeTaskId && !prev) {
      setIsActive(false);
      setSeconds(WORK_SEC);
      completionFiredRef.current = false;
    }
  }, [activeTaskId, phase]);

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }
    intervalRef.current = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isActive]);

  useEffect(() => {
    if (seconds !== 0) {
      completionFiredRef.current = false;
      return;
    }
    if (completionFiredRef.current) return;
    completionFiredRef.current = true;
    setIsActive(false);

    if (phase === 'work') {
      const active = tasks.find((t) => t.status === 'InProgress');
      if (active) {
        skipActiveResetRef.current = true;
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTaskStatus(active.id, 'Completed');
      }
      const title = active ? 'Work session complete' : 'Timer finished';
      const msg = active
        ? 'Great work. Take a 5-minute break.'
        : 'Start a break, or pick an Active task for the next focus round.';
      Alert.alert(title, msg, [
        {
          text: 'Start break',
          onPress: () => {
            setPhase('break');
            setSeconds(BREAK_SEC);
            completionFiredRef.current = false;
          },
        },
      ]);
    } else {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Break finished', 'Ready for another 25-minute focus round?', [
        {
          text: 'Start work',
          onPress: () => {
            setPhase('work');
            setSeconds(WORK_SEC);
            completionFiredRef.current = false;
          },
        },
      ]);
    }
  }, [seconds, phase, tasks, setTaskStatus]);

  const formatTime = useCallback((s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const reset = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsActive(false);
    setSeconds(phase === 'work' ? WORK_SEC : BREAK_SEC);
  }, [phase]);

  const toggleRun = useCallback(() => {
    if (phase === 'work' && !activeTask) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsActive((v) => !v);
  }, [activeTask, phase]);

  const finishEarly = useCallback(() => {
    if (phase === 'work') {
      if (!activeTask) return;
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setIsActive(false);
      setSeconds(0);
    } else {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setIsActive(false);
      setSeconds(0);
    }
  }, [activeTask, phase]);

  const progress = seconds / duration;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const ringTint = phase === 'work' ? colors.primaryContainer : colors.success;

  return (
    <View style={[styles.screen, { paddingTop: 16 + insets.top }]}>
      <View style={styles.phaseRow}>
        <View style={[styles.phaseChip, phase === 'work' && styles.phaseChipOn]}>
          <Text style={[styles.phaseTxt, phase === 'work' && styles.phaseTxtOn]}>Work 25</Text>
        </View>
        <View style={[styles.phaseChip, phase === 'break' && styles.phaseChipOnBr]}>
          <Text style={[styles.phaseTxt, phase === 'break' && styles.phaseTxtOnBr]}>Break 5</Text>
        </View>
      </View>

      <View style={styles.hero}>
        <View style={styles.pill}>
          <Ionicons name="locate-outline" size={14} color={colors.primary} />
          <Text style={styles.pillText}>
            {phase === 'work' ? 'CURRENT FOCUS' : 'REST'}
          </Text>
        </View>
        <Text style={styles.title}>{taskTitle}</Text>
        <Text style={styles.sub}>
          {phase === 'work'
            ? activeTask
              ? 'Stay present — one sprint at a time.'
              : 'On your task list, tap Active on the task you want here.'
            : 'Step away from the screen. The next work round starts after this break.'}
        </Text>
      </View>

      <View style={styles.timerCard}>
        <View style={[styles.ringTrack, { transform: [{ rotate: '-90deg' }] }]}>
          <View style={[styles.ringFill, { height: `${Math.max(progress, 0) * 100}%`, backgroundColor: ringTint }]} />
        </View>
        <View style={styles.timerInner}>
          <Text style={[styles.time, { color: ringTint }]}>{formatTime(seconds)}</Text>
          <Text style={styles.remain}>remaining</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable onPress={reset} style={styles.ctrl}>
          <Ionicons name="close" size={24} color={colors.onSurface} />
        </Pressable>
        <Pressable
          onPress={toggleRun}
          disabled={phase === 'work' && !activeTask}
          style={({ pressed }) => [
            styles.ctrlPrimary,
            phase === 'work' && !activeTask && styles.ctrlDisabled,
            pressed && (phase === 'break' || activeTask) && { opacity: 0.92 },
          ]}
        >
          <Ionicons
            name={isActive ? 'pause' : 'play'}
            size={34}
            color={colors.onPrimary}
          />
        </Pressable>
        <Pressable
          onPress={finishEarly}
          disabled={phase === 'work' && !activeTask}
          style={({ pressed }) => [
            styles.ctrl,
            phase === 'work' && !activeTask && styles.ctrlDisabled,
            pressed && (phase === 'break' || activeTask) && { opacity: 0.85 },
          ]}
        >
          <Ionicons name="checkmark" size={26} color={colors.onSurface} />
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.surface,
      paddingHorizontal: 24,
      alignItems: 'center',
    },
    phaseRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 12,
    },
    phaseChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: colors.surfaceContainerHighest,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
    },
    phaseChipOn: {
      borderColor: colors.primaryContainer,
      backgroundColor: `${colors.primaryContainer}18`,
    },
    phaseChipOnBr: {
      borderColor: colors.success,
      backgroundColor: `${colors.success}18`,
    },
    phaseTxt: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.onSurfaceVariant,
    },
    phaseTxtOn: { color: colors.primaryContainer },
    phaseTxtOnBr: { color: colors.success },
    hero: {
      alignItems: 'center',
      marginBottom: 24,
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: colors.surfaceContainerHighest,
      marginBottom: 12,
    },
    pillText: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.2,
      color: colors.onSurfaceVariant,
    },
    title: {
      fontSize: 30,
      fontWeight: '900',
      textAlign: 'center',
      color: colors.onSurface,
      letterSpacing: -0.4,
    },
    sub: {
      marginTop: 8,
      fontSize: 14,
      fontWeight: '600',
      color: colors.onSurfaceVariant,
      textAlign: 'center',
      paddingHorizontal: 8,
    },
    timerCard: {
      width: 280,
      height: 280,
      borderRadius: 140,
      backgroundColor: colors.surfaceContainerLowest,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 28,
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.outlineVariant,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOpacity: 0.08,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 14 },
        },
        android: { elevation: 4 },
      }),
    },
    ringTrack: {
      position: 'absolute',
      width: 280,
      height: 280,
      borderRadius: 140,
      borderWidth: 4,
      borderColor: `${colors.primary}22`,
      overflow: 'hidden',
      justifyContent: 'flex-end',
    },
    ringFill: {
      width: '100%',
      opacity: 0.35,
    },
    timerInner: {
      alignItems: 'center',
    },
    time: {
      fontSize: 52,
      fontWeight: '900',
      fontVariant: ['tabular-nums'],
    },
    remain: {
      marginTop: 6,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.4,
      color: colors.onSurfaceVariant,
    },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 22,
    },
    ctrl: {
      width: 56,
      height: 56,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceContainerHighest,
    },
    ctrlPrimary: {
      width: 76,
      height: 76,
      borderRadius: 38,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primaryContainer,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOpacity: 0.22,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 10 },
        },
        android: { elevation: 5 },
      }),
    },
    ctrlDisabled: {
      opacity: 0.38,
    },
  });
}
