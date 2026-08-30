import { Injectable, signal, computed } from '@angular/core';
import { Task, TaskStatus, TaskType, TaskFilter } from '../models/task.model';

const STORAGE_KEY = 'todo_tasks';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasks = signal<Task[]>(this.loadFromStorage());
  private filter = signal<TaskFilter>({
    status: 'all',
    type: 'all',
    followUp: null,
    search: ''
  });

  readonly filteredTasks = computed(() => {
    const f = this.filter();
    return this.tasks().filter(t => {
      if (f.status !== 'all' && t.status !== f.status) return false;
      if (f.type !== 'all' && t.type !== f.type) return false;
      if (f.followUp !== null && t.followUp !== f.followUp) return false;
      if (f.search && !t.title.toLowerCase().includes(f.search.toLowerCase())) return false;
      return true;
    });
  });

  readonly stats = computed(() => {
    const all = this.tasks();
    return {
      total: all.length,
      backlog: all.filter(t => t.status === 'backlog').length,
      planned: all.filter(t => t.status === 'planned').length,
      office: all.filter(t => t.type === 'office').length,
      personal: all.filter(t => t.type === 'personal').length,
      followUp: all.filter(t => t.followUp).length
    };
  });

  getFilter() {
    return this.filter;
  }

  setFilter(partial: Partial<TaskFilter>) {
    this.filter.update(f => ({ ...f, ...partial }));
  }

  addTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const now = new Date().toISOString();
    const task: Task = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now
    };
    this.tasks.update(tasks => [task, ...tasks]);
    this.saveToStorage();
    return task;
  }

  updateTask(id: string, changes: Partial<Omit<Task, 'id' | 'createdAt'>>): void {
    this.tasks.update(tasks =>
      tasks.map(t =>
        t.id === id ? { ...t, ...changes, updatedAt: new Date().toISOString() } : t
      )
    );
    this.saveToStorage();
  }

  deleteTask(id: string): void {
    this.tasks.update(tasks => tasks.filter(t => t.id !== id));
    this.saveToStorage();
  }

  toggleFollowUp(id: string): void {
    const task = this.tasks().find(t => t.id === id);
    if (task) {
      this.updateTask(id, { followUp: !task.followUp });
    }
  }

  private loadFromStorage(): Task[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tasks()));
    } catch (e) {
      console.error('Failed to save tasks', e);
    }
  }
}
