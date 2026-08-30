import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { TaskFormComponent } from '../task-form/task-form.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, TaskFormComponent],
  template: `
    <div class="list-container">
      <div *ngIf="tasks().length === 0" class="empty-state">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="2"/>
            <line x1="9" y1="12" x2="15" y2="12"/>
            <line x1="9" y1="16" x2="13" y2="16"/>
          </svg>
        </div>
        <p class="empty-title">No tasks yet</p>
        <p class="empty-sub">Add a task to get started</p>
      </div>

      <div class="task-card" *ngFor="let task of tasks(); trackBy: trackById">
        <div class="card-left">
          <div class="task-badges">
            <span class="badge status-badge" [ngClass]="'status-' + task.status">
              {{ task.status | titlecase }}
            </span>
            <span class="badge type-badge" [ngClass]="'type-' + task.type">
              <svg *ngIf="task.type === 'office'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
              <svg *ngIf="task.type === 'personal'" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              {{ task.type | titlecase }}
            </span>
          </div>

          <h3 class="task-title">{{ task.title }}</h3>
          <p class="task-notes" *ngIf="task.notes">{{ task.notes }}</p>
          <span class="task-date">{{ task.createdAt | date:'MMM d, y' }}</span>
        </div>

        <div class="card-right">
          <button
            class="icon-btn follow-up-btn"
            [class.active]="task.followUp"
            (click)="toggleFollowUp(task)"
            [title]="task.followUp ? 'Remove follow-up flag' : 'Flag for follow-up'"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" [attr.fill]="task.followUp ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </button>

          <div class="action-group">
            <button class="icon-btn edit-btn" (click)="openEdit(task)" title="Edit task">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="icon-btn delete-btn" (click)="confirmDelete(task)" title="Delete task">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="follow-up-indicator" *ngIf="task.followUp" title="Follow-up flagged"></div>
      </div>
    </div>

    <app-task-form
      *ngIf="editingTask()"
      [editTask]="editingTask()"
      (saved)="onFormSaved()"
      (cancelled)="onFormCancelled()"
    ></app-task-form>

    <div class="confirm-overlay" *ngIf="deletingTask()" (click)="cancelDelete()">
      <div class="confirm-dialog" (click)="$event.stopPropagation()">
        <div class="confirm-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h3>Delete Task?</h3>
        <p>"{{ deletingTask()?.title }}" will be permanently removed.</p>
        <div class="confirm-actions">
          <button class="btn btn-ghost" (click)="cancelDelete()">Cancel</button>
          <button class="btn btn-danger" (click)="doDelete()">Delete</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .list-container {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 24px;
      color: #9ca3af;
      text-align: center;
      gap: 8px;
    }
    .empty-icon { color: #d1d5db; margin-bottom: 8px; }
    .empty-title { font-size: 16px; font-weight: 600; color: #6b7280; }
    .empty-sub { font-size: 14px; }

    .task-card {
      background: #fff;
      border-radius: 12px;
      padding: 16px 16px 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      border: 1px solid #f3f4f6;
      position: relative;
      overflow: hidden;
      transition: box-shadow 0.15s, transform 0.15s;
    }
    .task-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.09);
      transform: translateY(-1px);
    }

    .follow-up-indicator {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: linear-gradient(180deg, #f59e0b, #fbbf24);
      border-radius: 4px 0 0 4px;
    }

    .card-left {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
      min-width: 0;
    }

    .task-badges {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }
    .status-backlog { background: #f3f4f6; color: #6b7280; }
    .status-planned { background: #eff6ff; color: #3b82f6; }
    .type-office { background: #f5f3ff; color: #7c3aed; }
    .type-personal { background: #ecfdf5; color: #059669; }

    .task-title {
      font-size: 15px;
      font-weight: 600;
      color: #1a1a2e;
      line-height: 1.4;
      word-break: break-word;
    }
    .task-notes {
      font-size: 13px;
      color: #6b7280;
      line-height: 1.5;
      word-break: break-word;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .task-date {
      font-size: 11px;
      color: #9ca3af;
    }

    .card-right {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .icon-btn {
      background: none;
      border: none;
      padding: 6px;
      border-radius: 8px;
      color: #9ca3af;
      cursor: pointer;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon-btn:hover { background: #f3f4f6; color: #374151; }

    .follow-up-btn:hover { background: #fffbeb; color: #f59e0b; }
    .follow-up-btn.active { color: #f59e0b; }
    .follow-up-btn.active:hover { background: #fffbeb; }

    .action-group {
      display: flex;
      gap: 2px;
    }
    .edit-btn:hover { background: #eff6ff; color: #3b82f6; }
    .delete-btn:hover { background: #fef2f2; color: #ef4444; }

    /* Confirm Dialog */
    .confirm-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1100;
    }
    .confirm-dialog {
      background: #fff;
      border-radius: 16px;
      padding: 28px 28px 24px;
      max-width: 360px;
      width: 90%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      animation: slideUp 0.2s ease;
    }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
    .confirm-icon { margin-bottom: 12px; }
    .confirm-dialog h3 { font-size: 17px; font-weight: 600; margin-bottom: 8px; }
    .confirm-dialog p { font-size: 14px; color: #6b7280; margin-bottom: 20px; line-height: 1.5; }
    .confirm-actions { display: flex; gap: 8px; justify-content: center; }
    .btn {
      padding: 9px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-ghost {
      background: none;
      border: 1.5px solid #e5e7eb;
      color: #6b7280;
    }
    .btn-ghost:hover { background: #f3f4f6; }
    .btn-danger {
      background: #ef4444;
      border: 1.5px solid #ef4444;
      color: #fff;
    }
    .btn-danger:hover { background: #dc2626; border-color: #dc2626; }
  `]
})
export class TaskListComponent {
  private taskService = inject(TaskService);

  readonly tasks = this.taskService.filteredTasks;
  editingTask = signal<Task | null>(null);
  deletingTask = signal<Task | null>(null);

  trackById(_: number, task: Task) {
    return task.id;
  }

  toggleFollowUp(task: Task) {
    this.taskService.toggleFollowUp(task.id);
  }

  openEdit(task: Task) {
    this.editingTask.set(task);
  }

  onFormSaved() {
    this.editingTask.set(null);
  }

  onFormCancelled() {
    this.editingTask.set(null);
  }

  confirmDelete(task: Task) {
    this.deletingTask.set(task);
  }

  cancelDelete() {
    this.deletingTask.set(null);
  }

  doDelete() {
    const task = this.deletingTask();
    if (task) {
      this.taskService.deleteTask(task.id);
      this.deletingTask.set(null);
    }
  }
}
