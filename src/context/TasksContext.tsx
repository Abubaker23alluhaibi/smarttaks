import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Category, Priority, Task, TaskStatus } from '../types';
import { STORAGE_KEY, STORAGE_KEY_V1 } from '../constants';
import { normalizeTaskList } from '../utils/migrateTasks';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../config/env';

type TasksContextValue = {
  tasks: Task[];
  hydrated: boolean;
  addTask: (title: string, category: Category, priority: Priority) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  /** Checkbox: Completed ↔ Pending (used for quick “done” feedback). */
  quickToggleCompleted: (id: string) => void;
  deleteTask: (id: string) => void;
  /** Clears all tasks from memory and AsyncStorage (used from Settings). */
  clearAllTasks: () => void;
};

const TasksContext = createContext<TasksContextValue | null>(null);

function applyStatusPatch(task: Task, status: TaskStatus): Task {
  let next: Task = { ...task, status };
  if (status === 'Completed') {
    next = { ...next, completedAt: Date.now() };
  } else {
    next = { ...next, completedAt: undefined };
  }
  return next;
}

async function loadTasksFromStorage(): Promise<Task[]> {
  try {
    const v2 = await AsyncStorage.getItem(STORAGE_KEY);
    if (v2 !== null) {
      return normalizeTaskList(JSON.parse(v2) as unknown);
    }
    const v1 = await AsyncStorage.getItem(STORAGE_KEY_V1);
    if (v1 !== null) {
      const migrated = normalizeTaskList(JSON.parse(v1) as unknown);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      return migrated;
    }
    return [];
  } catch {
    return [];
  }
}

async function saveTasksToStorage(tasks: Task[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    /* ignore */
  }
}

function userStorageKey(uid: string) {
  return `${STORAGE_KEY}_${uid}`;
}

async function loadTasksForUser(uid: string): Promise<Task[]> {
  try {
    const raw = await AsyncStorage.getItem(userStorageKey(uid));
    if (!raw) return [];
    return normalizeTaskList(JSON.parse(raw) as unknown);
  } catch {
    return [];
  }
}

async function saveTasksForUser(uid: string, tasks: Task[]): Promise<void> {
  try {
    await AsyncStorage.setItem(userStorageKey(uid), JSON.stringify(tasks));
  } catch {
    /* ignore */
  }
}

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setHydrated(false);

    const load = async () => {
      if (!user) {
        setTasks([]);
        setHydrated(true);
        return;
      }
      const local = await loadTasksForUser(user.uid);
      if (!cancelled) setTasks(local);
      try {
        const token = await user.getIdToken();
        const res = await fetch(`${API_BASE_URL}/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const body = (await res.json()) as { tasks?: unknown };
          const remoteTasks = normalizeTaskList(body.tasks ?? []);
          if (!cancelled) setTasks(remoteTasks);
          await saveTasksForUser(user.uid, remoteTasks);
        }
      } catch {
        /* keep local cache if api unavailable */
      } finally {
        if (!cancelled) setHydrated(true);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      saveTasksToStorage(tasks);
      return;
    }
    const sync = async () => {
      await saveTasksForUser(user.uid, tasks);
      try {
        const token = await user.getIdToken();
        await fetch(`${API_BASE_URL}/tasks`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ tasks }),
        });
      } catch {
        /* ignore network errors, keep local cache */
      }
    };
    void sync();
  }, [tasks, hydrated, user]);

  const addTask = useCallback(
    (title: string, category: Category, priority: Priority) => {
      const trimmed = title.trim();
      if (!trimmed) return;
      const newTask: Task = {
        id: globalThis.crypto?.randomUUID?.() ?? String(Date.now()),
        title: trimmed,
        category,
        status: 'Pending',
        priority,
        createdAt: Date.now(),
      };
      setTasks((prev) => [newTask, ...prev]);
    },
    [],
  );

  /**
   * Updates status. Only one `InProgress` at a time. `Completed` stamps `completedAt` for analytics.
   */
  const setTaskStatus = useCallback((id: string, status: TaskStatus) => {
    setTasks((prev) => {
      if (status === 'InProgress') {
        return prev.map((task) => {
          if (task.id === id) return applyStatusPatch(task, 'InProgress');
          if (task.status === 'InProgress') {
            return { ...task, status: 'Pending' as TaskStatus, completedAt: undefined };
          }
          return task;
        });
      }
      return prev.map((task) =>
        task.id === id ? applyStatusPatch(task, status) : task,
      );
    });
  }, []);

  const quickToggleCompleted = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;
        if (task.status === 'Completed') {
          return { ...task, status: 'Pending' as TaskStatus, completedAt: undefined };
        }
        return {
          ...task,
          status: 'Completed' as TaskStatus,
          completedAt: Date.now(),
        };
      }),
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const clearAllTasks = useCallback(() => {
    setTasks([]);
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  }, []);

  const value = useMemo(
    () => ({
      tasks,
      hydrated,
      addTask,
      setTaskStatus,
      quickToggleCompleted,
      deleteTask,
      clearAllTasks,
    }),
    [
      tasks,
      hydrated,
      addTask,
      setTaskStatus,
      quickToggleCompleted,
      deleteTask,
      clearAllTasks,
    ],
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks(): TasksContextValue {
  const ctx = useContext(TasksContext);
  if (!ctx) {
    throw new Error('useTasks must be used within TasksProvider');
  }
  return ctx;
}
