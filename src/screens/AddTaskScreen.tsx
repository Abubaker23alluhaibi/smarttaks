import { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTasks } from '../context/TasksContext';
import { useTheme } from '../theme/ThemeContext';
import type { AppPalette } from '../theme/palettes';
import type { Category, Priority } from '../types';
import { CATEGORIES, PRIORITIES } from '../constants';

/**
 * Create flow: title validation, category (visual chips), and priority (High/Medium/Low).
 * New tasks start in `Pending` status by default inside the context layer.
 */
export function AddTaskScreen() {
  const navigation = useNavigation();
  const { addTask } = useTasks();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Study');
  const [priority, setPriority] = useState<Priority>('Medium');

  const submit = useCallback(() => {
    const trimmed = title.trim();
    if (!trimmed) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addTask(trimmed, category, priority);
    setTitle('');
    navigation.goBack();
  }, [addTask, category, navigation, priority, title]);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Task title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="What do you want to get done?"
          placeholderTextColor={`${colors.onSurfaceVariant}99`}
          style={styles.input}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={submit}
        />

        <Text style={styles.sectionLabel}>Category</Text>
        <View style={styles.chips}>
          {CATEGORIES.map((c) => {
            const active = category === c.value;
            return (
              <Pressable
                key={c.value}
                onPress={() => setCategory(c.value)}
                style={[
                  styles.catChip,
                  { borderColor: active ? c.color : colors.outlineVariant },
                  active && { backgroundColor: c.softBg },
                ]}
              >
                <Ionicons
                  name={c.icon as keyof typeof Ionicons.glyphMap}
                  size={18}
                  color={c.color}
                />
                <Text style={[styles.catChipText, { color: c.color }]}>{c.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Priority</Text>
        <View style={styles.rowPri}>
          {PRIORITIES.map((p) => {
            const active = priority === p.value;
            return (
              <Pressable
                key={p.value}
                onPress={() => setPriority(p.value)}
                style={[styles.priChip, active && styles.priChipActive]}
              >
                <Text style={[styles.priText, active && styles.priTextActive]}>
                  {p.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={submit}
          disabled={!title.trim()}
          style={({ pressed }) => [
            styles.save,
            !title.trim() && styles.saveDisabled,
            pressed && title.trim() && { opacity: 0.92, transform: [{ scale: 0.99 }] },
          ]}
        >
          <Text style={styles.saveText}>Save task</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.surface },
    content: {
      padding: 24,
      gap: 16,
    },
    label: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1,
      color: colors.onSurfaceVariant,
    },
    input: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.outlineVariant,
      paddingVertical: 12,
      fontSize: 18,
      fontWeight: '600',
      color: colors.onSurface,
    },
    sectionLabel: {
      marginTop: 8,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 1,
      color: colors.onSurfaceVariant,
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    catChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      backgroundColor: colors.surfaceContainerLowest,
    },
    catChipText: {
      fontSize: 14,
      fontWeight: '800',
    },
    rowPri: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    priChip: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.outlineVariant,
      backgroundColor: colors.surfaceContainerLowest,
    },
    priChipActive: {
      backgroundColor: colors.primaryContainer,
      borderColor: colors.primaryContainer,
    },
    priText: {
      fontSize: 13,
      fontWeight: '800',
      color: colors.onSurfaceVariant,
    },
    priTextActive: {
      color: colors.onPrimary,
    },
    save: {
      marginTop: 16,
      backgroundColor: colors.primaryContainer,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    saveDisabled: {
      opacity: 0.45,
    },
    saveText: {
      color: colors.onPrimary,
      fontSize: 16,
      fontWeight: '800',
    },
  });
}
