import type { Category, Priority, StatusFilter } from './types';

export const STORAGE_KEY = 'smart_task_planner_tasks_v2';

export const PROFILE_STORAGE_KEY = 'smart_task_planner_profile_v1';

export const CATEGORIES: {
  value: Category;
  label: string;
  /** Ionicons glyph name */
  icon: string;
  color: string;
  softBg: string;
}[] = [
  {
    value: 'Study',
    label: 'Study',
    icon: 'school-outline',
    color: '#1565C0',
    softBg: '#E3F2FD',
  },
  {
    value: 'Work',
    label: 'Work',
    icon: 'briefcase-outline',
    color: '#6A1B9A',
    softBg: '#F3E5F5',
  },
  {
    value: 'Health',
    label: 'Health',
    icon: 'heart-outline',
    color: '#2E7D32',
    softBg: '#E8F5E9',
  },
  {
    value: 'Personal',
    label: 'Personal',
    icon: 'person-outline',
    color: '#EF6C00',
    softBg: '#FFF3E0',
  },
];

export function getCategoryMeta(category: Category) {
  return CATEGORIES.find((c) => c.value === category) ?? CATEGORIES[0];
}

export const PRIORITIES: { value: Priority; label: string }[] = [
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
];

export const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'All', label: 'All' },
  { value: 'Pending', label: 'Pending' },
  { value: 'InProgress', label: 'In progress' },
  { value: 'Completed', label: 'Completed' },
];

/** FlatList row heights (8px grid). */
export const SECTION_HEADER_HEIGHT = 40;
export const TASK_ROW_HEIGHT = 144;
