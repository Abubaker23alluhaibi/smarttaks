import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Header } from '../components/Header';
import { TaskItem } from '../components/TaskItem';
import { FAB } from '../components/FAB';
import { EmptyState } from '../components/EmptyState';
import { useTasks } from '../context/TasksContext';
import { useTheme } from '../theme/ThemeContext';
import type { AppPalette } from '../theme/palettes';
import type { StatusFilter, Task } from '../types';
import type { TasksStackParamList } from '../navigation/types';
import {
  SECTION_HEADER_HEIGHT,
  TASK_ROW_HEIGHT,
  STATUS_FILTERS,
} from '../constants';

const ROW_GAP = 12;

type ListRow =
  | { type: 'header'; key: string; title: string }
  | { type: 'task'; key: string; task: Task };

type Nav = NativeStackNavigationProp<TasksStackParamList, 'TaskList'>;

function buildRowsAndLayout(
  high: Task[],
  medium: Task[],
  low: Task[],
  completed: Task[],
): {
  data: ListRow[];
  lengths: number[];
  getItemLayout: (
    _data: ArrayLike<ListRow> | null | undefined,
    index: number,
  ) => { length: number; offset: number; index: number };
} {
  const data: ListRow[] = [];

  if (high.length > 0) {
    data.push({ type: 'header', key: 'hdr-high', title: 'High priority' });
    for (const t of high) data.push({ type: 'task', key: t.id, task: t });
  }

  if (medium.length > 0) {
    data.push({ type: 'header', key: 'hdr-med', title: 'Medium priority' });
    for (const t of medium) data.push({ type: 'task', key: t.id, task: t });
  }

  if (low.length > 0) {
    data.push({ type: 'header', key: 'hdr-low', title: 'Low priority' });
    for (const t of low) data.push({ type: 'task', key: t.id, task: t });
  }

  if (completed.length > 0) {
    data.push({ type: 'header', key: 'hdr-done', title: 'Completed' });
    for (const t of completed) data.push({ type: 'task', key: t.id, task: t });
  }

  const baseHeights = data.map((row) =>
    row.type === 'header' ? SECTION_HEADER_HEIGHT : TASK_ROW_HEIGHT,
  );
  const lengths = baseHeights.map((h, i) =>
    i < baseHeights.length - 1 ? h + ROW_GAP : h,
  );

  const offsets: number[] = [];
  let acc = 0;
  for (let i = 0; i < lengths.length; i++) {
    offsets.push(acc);
    acc += lengths[i];
  }

  const getItemLayout = (
    _d: ArrayLike<ListRow> | null | undefined,
    index: number,
  ) => ({
    length: lengths[index],
    offset: offsets[index],
    index,
  });

  return { data, lengths, getItemLayout };
}

export function TaskListScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { hydrated, tasks, setTaskStatus, quickToggleCompleted, deleteTask } =
    useTasks();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');

  const filteredTasks = useMemo(() => {
    let list = tasks;
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((t) => t.title.toLowerCase().includes(q));
    }
    if (statusFilter !== 'All') {
      list = list.filter((t) => t.status === statusFilter);
    }
    return list;
  }, [tasks, query, statusFilter]);

  const { high, medium, low, completed } = useMemo(() => {
    const high = filteredTasks.filter(
      (t) => t.priority === 'High' && t.status !== 'Completed',
    );
    const medium = filteredTasks.filter(
      (t) => t.priority === 'Medium' && t.status !== 'Completed',
    );
    const low = filteredTasks.filter(
      (t) => t.priority === 'Low' && t.status !== 'Completed',
    );
    const completed = filteredTasks.filter((t) => t.status === 'Completed');
    return { high, medium, low, completed };
  }, [filteredTasks]);

  const { data, lengths, getItemLayout } = useMemo(
    () => buildRowsAndLayout(high, medium, low, completed),
    [high, medium, low, completed],
  );

  const keyExtractor = useCallback((item: ListRow) => item.key, []);

  const renderItem: ListRenderItem<ListRow> = useCallback(
    ({ item, index }) => {
      const cellHeight = lengths[index];
      if (item.type === 'header') {
        return (
          <View style={{ height: cellHeight, justifyContent: 'flex-end' }}>
            <Text style={styles.section}>{item.title}</Text>
          </View>
        );
      }
      return (
        <View style={{ height: cellHeight, justifyContent: 'center' }}>
          <TaskItem
            task={item.task}
            onSetStatus={setTaskStatus}
            onQuickComplete={quickToggleCompleted}
            onDelete={deleteTask}
          />
        </View>
      );
    },
    [deleteTask, lengths, quickToggleCompleted, setTaskStatus, styles],
  );

  const listEmpty = useMemo(
    () => (
      <View style={styles.emptyFilter}>
        <Ionicons name="search-outline" size={40} color={colors.onSurfaceVariant} />
        <Text style={styles.emptyFilterTitle}>No matching tasks</Text>
        <Text style={styles.emptyFilterSub}>
          Try a different search or status filter (for example, show completed only).
        </Text>
      </View>
    ),
    [colors.onSurfaceVariant, styles],
  );

  if (!hydrated) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primaryContainer} />
      </View>
    );
  }

  if (tasks.length === 0) {
    return (
      <View style={styles.screen}>
        <Header title="Today" />
        <EmptyState />
        <FAB
          bottomInset={insets.bottom + 72}
          onPress={() => navigation.navigate('AddTask')}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Header title="Today" />
      <View style={styles.toolbar}>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={colors.onSurfaceVariant} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search tasks..."
            placeholderTextColor={`${colors.onSurfaceVariant}aa`}
            style={styles.search}
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={20} color={colors.onSurfaceVariant} />
            </Pressable>
          ) : null}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {STATUS_FILTERS.map((f) => {
            const active = statusFilter === f.value;
            return (
              <Pressable
                key={String(f.value)}
                onPress={() => setStatusFilter(f.value)}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                <Text style={[styles.filterText, active && styles.filterTextActive]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        ListEmptyComponent={listEmpty}
        contentContainerStyle={[
          styles.listContent,
          data.length === 0 ? styles.listContentEmpty : null,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
        initialNumToRender={12}
        windowSize={7}
        removeClippedSubviews
      />
      <FAB
        bottomInset={insets.bottom + 72}
        onPress={() => navigation.navigate('AddTask')}
      />
    </View>
  );
}

function createStyles(colors: AppPalette) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.surface,
      maxWidth: 520,
      width: '100%',
      alignSelf: 'center',
    },
    centered: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
    },
    toolbar: {
      paddingHorizontal: 24,
      paddingBottom: 8,
      gap: 10,
    },
    searchWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderRadius: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.outlineVariant,
      backgroundColor: colors.surfaceContainerLowest,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    search: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: colors.onSurface,
      paddingVertical: 0,
    },
    filtersRow: {
      gap: 8,
      paddingVertical: 4,
      flexDirection: 'row',
    },
    filterChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.outlineVariant,
      backgroundColor: colors.surfaceContainerLowest,
    },
    filterChipActive: {
      borderColor: colors.primaryContainer,
      backgroundColor: `${colors.primaryContainer}18`,
    },
    filterText: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.onSurfaceVariant,
    },
    filterTextActive: {
      color: colors.primaryContainer,
    },
    listContent: {
      paddingHorizontal: 24,
      paddingTop: 8,
    },
    listContentEmpty: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    section: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.onSurfaceVariant,
      paddingHorizontal: 4,
      height: SECTION_HEADER_HEIGHT,
      lineHeight: SECTION_HEADER_HEIGHT,
    },
    emptyFilter: {
      alignItems: 'center',
      paddingVertical: 48,
      paddingHorizontal: 16,
      gap: 10,
    },
    emptyFilterTitle: {
      fontSize: 18,
      fontWeight: '900',
      color: colors.onSurface,
    },
    emptyFilterSub: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.onSurfaceVariant,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
}
