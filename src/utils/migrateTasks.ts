import type { Category, Priority, Task, TaskStatus } from '../types';

type LegacyCategory = 'Work' | 'Personal' | 'Shopping' | 'Productivity';
type LegacyPriority = 'High' | 'Normal' | 'Later';

type LegacyTask = {
  id: string;
  title: string;
  description?: string;
  category: LegacyCategory | Category;
  isCompleted: boolean;
  priority: LegacyPriority | Priority;
  startTime?: string;
  createdAt: number;
};

function mapLegacyCategory(c: string): Category {
  switch (c) {
    case 'Study':
    case 'Work':
    case 'Health':
    case 'Personal':
      return c;
    case 'Productivity':
      return 'Study';
    case 'Shopping':
      return 'Personal';
    default:
      return 'Personal';
  }
}

function mapLegacyPriority(p: string): Priority {
  if (p === 'High') return 'High';
  if (p === 'Later') return 'Low';
  if (p === 'Medium') return 'Medium';
  return 'Medium';
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

/**
 * Normalizes persisted JSON into the current `Task` shape.
 * Supports the previous schema (`isCompleted`, old categories/priorities).
 */
export function normalizeStoredTask(raw: unknown): Task | null {
  if (!isRecord(raw)) return null;
  const id = typeof raw.id === 'string' ? raw.id : null;
  const title = typeof raw.title === 'string' ? raw.title : null;
  if (!id || !title) return null;

  const createdAt =
    typeof raw.createdAt === 'number' ? raw.createdAt : Date.now();

  const hasNewShape = typeof raw.status === 'string';

  let status: TaskStatus = 'Pending';
  let priority: Priority = 'Medium';
  let category: Category = 'Personal';

  if (hasNewShape) {
    const s = raw.status as string;
    if (s === 'Pending' || s === 'InProgress' || s === 'Completed') {
      status = s;
    }
    const pr = raw.priority as string;
    if (pr === 'High' || pr === 'Medium' || pr === 'Low') {
      priority = pr;
    }
    const cat = raw.category as string;
    if (cat === 'Study' || cat === 'Work' || cat === 'Health' || cat === 'Personal') {
      category = cat;
    } else if (cat) {
      category = mapLegacyCategory(cat);
    }
  } else {
    const legacy = raw as LegacyTask;
    status = legacy.isCompleted ? 'Completed' : 'Pending';
    category = mapLegacyCategory(String(legacy.category));
    priority = mapLegacyPriority(String(legacy.priority));
  }

  const description =
    typeof raw.description === 'string' ? raw.description : undefined;
  const startTime =
    typeof raw.startTime === 'string' ? raw.startTime : undefined;

  const completedAt =
    typeof raw.completedAt === 'number' ? raw.completedAt : undefined;

  return {
    id,
    title,
    description,
    category,
    status,
    priority,
    startTime,
    createdAt,
    completedAt,
  };
}

export function normalizeTaskList(raw: unknown): Task[] {
  if (!Array.isArray(raw)) return [];
  const out: Task[] = [];
  for (const item of raw) {
    const t = normalizeStoredTask(item);
    if (t) out.push(t);
  }
  return out;
}
