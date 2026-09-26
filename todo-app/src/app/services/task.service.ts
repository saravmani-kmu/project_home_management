import { Injectable, signal, computed } from '@angular/core';
import { Task, TaskStatus, TaskType, TaskFilter } from '../models/task.model';
import { supabase } from '../supabase.client';

type DbTask = {
  id: string;
  title: string;
  notes: string;
  status: string;
  type: string;
  follow_up: boolean;
  created_at: string;
  updated_at: string;
};

function fromDb(row: DbTask): Task {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    status: row.status as TaskStatus,
    type: row.type as TaskType,
    followUp: row.follow_up,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private tasks = signal<Task[]>([]);
  private filter = signal<TaskFilter>({
    status: 'all',
    type: 'all',
    followUp: null,
    search: ''
  });

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

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

  constructor() {
    this.loadTasks();
  }

  private async loadTasks() {
    this.loading.set(true);
    this.error.set(null);
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      this.error.set('Failed to load tasks. Check your connection.');
    } else {
      this.tasks.set((data as DbTask[]).map(fromDb));
    }
    this.loading.set(false);
  }

  getFilter() {
    return this.filter;
  }

  setFilter(partial: Partial<TaskFilter>) {
    this.filter.update(f => ({ ...f, ...partial }));
  }

  async addTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const { data: row, error } = await supabase
      .from('tasks')
      .insert({
        title: data.title,
        notes: data.notes,
        status: data.status,
        type: data.type,
        follow_up: data.followUp
      })
      .select()
      .single();

    if (error) {
      this.error.set('Failed to add task.');
      return;
    }
    this.tasks.update(tasks => [fromDb(row as DbTask), ...tasks]);
  }

  async updateTask(id: string, changes: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<void> {
    const dbChanges: Partial<DbTask> = {};
    if (changes.title !== undefined) dbChanges.title = changes.title;
    if (changes.notes !== undefined) dbChanges.notes = changes.notes;
    if (changes.status !== undefined) dbChanges.status = changes.status;
    if (changes.type !== undefined) dbChanges.type = changes.type;
    if (changes.followUp !== undefined) dbChanges.follow_up = changes.followUp;
    dbChanges.updated_at = new Date().toISOString();

    // Optimistic update
    this.tasks.update(tasks =>
      tasks.map(t => t.id === id ? { ...t, ...changes, updatedAt: dbChanges.updated_at! } : t)
    );

    const { error } = await supabase.from('tasks').update(dbChanges).eq('id', id);
    if (error) {
      this.error.set('Failed to update task.');
      await this.loadTasks(); // revert on error
    }
  }

  async deleteTask(id: string): Promise<void> {
    // Optimistic delete
    this.tasks.update(tasks => tasks.filter(t => t.id !== id));

    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      this.error.set('Failed to delete task.');
      await this.loadTasks(); // revert on error
    }
  }

  async toggleFollowUp(id: string): Promise<void> {
    const task = this.tasks().find(t => t.id === id);
    if (task) {
      await this.updateTask(id, { followUp: !task.followUp });
    }
  }

  clearError() {
    this.error.set(null);
  }
}
