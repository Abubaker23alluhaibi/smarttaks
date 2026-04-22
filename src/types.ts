/** Study, work, health, personal — each has icon + color in `constants.ts`. */
export type Category = 'Study' | 'Work' | 'Health' | 'Personal';

/** Dynamic workflow state shown on each card and used in filters. */
export type TaskStatus = 'Pending' | 'InProgress' | 'Completed';

/** Three-level priority used for grouping and ordering logic. */
export type Priority = 'High' | 'Medium' | 'Low';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: Category;
  status: TaskStatus;
  priority: Priority;
  startTime?: string;
  createdAt: number;
  /** Set when the task becomes Completed — powers weekly analytics. */
  completedAt?: number;
}

/** Filter chip on the list screen (`All` uses null). */
export type StatusFilter = TaskStatus | 'All';
