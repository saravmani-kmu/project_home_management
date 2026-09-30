export type TaskStatus = 'backlog' | 'planned';
export type TaskType = 'office' | 'personal';

export interface Task {
  id: string;
  title: string;
  notes: string;
  status: TaskStatus;
  type: TaskType;
  followUp: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilter {
  status: TaskStatus | 'all';
  type: TaskType | 'all';
  followUp: boolean | null;
  search: string;
}
