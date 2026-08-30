import {
  Component, Output, EventEmitter, Input, OnInit, inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task, TaskStatus, TaskType } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="overlay" (click)="onOverlayClick($event)">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editTask ? 'Edit Task' : 'New Task' }}</h2>
          <button class="close-btn" (click)="onCancel()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="field">
            <label>Task title <span class="required">*</span></label>
            <input
              type="text"
              [(ngModel)]="title"
              placeholder="What needs to be done?"
              class="input"
              [class.error]="titleError"
              autofocus
            />
            <span class="error-msg" *ngIf="titleError">Title is required</span>
          </div>

          <div class="field">
            <label>Notes</label>
            <textarea
              [(ngModel)]="notes"
              placeholder="Add any notes or details..."
              class="input textarea"
              rows="3"
            ></textarea>
          </div>

          <div class="field-row">
            <div class="field">
              <label>Status</label>
              <div class="toggle-group">
                <button
                  class="toggle-btn"
                  [class.active]="status === 'backlog'"
                  (click)="status = 'backlog'"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  Backlog
                </button>
                <button
                  class="toggle-btn"
                  [class.active]="status === 'planned'"
                  (click)="status = 'planned'"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  Planned
                </button>
              </div>
            </div>

            <div class="field">
              <label>Type</label>
              <div class="toggle-group">
                <button
                  class="toggle-btn type-office"
                  [class.active]="type === 'office'"
                  (click)="type = 'office'"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                  Office
                </button>
                <button
                  class="toggle-btn type-personal"
                  [class.active]="type === 'personal'"
                  (click)="type = 'personal'"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  Personal
                </button>
              </div>
            </div>
          </div>

          <div class="field">
            <label class="checkbox-label">
              <input type="checkbox" [(ngModel)]="followUp" class="checkbox" />
              <span class="checkbox-text">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
                Mark as Follow Up
              </span>
            </label>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-ghost" (click)="onCancel()">Cancel</button>
          <button class="btn btn-primary" (click)="onSubmit()">
            {{ editTask ? 'Save Changes' : 'Add Task' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.45);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 16px;
      animation: fadeIn 0.15s ease;
    }
    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }

    .modal {
      background: #fff;
      border-radius: 16px;
      width: 100%;
      max-width: 520px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      animation: slideUp 0.2s ease;
      overflow: hidden;
    }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px 0;
    }
    .modal-header h2 {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a2e;
    }
    .close-btn {
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      padding: 4px;
      border-radius: 6px;
      display: flex;
      transition: background 0.15s, color 0.15s;
    }
    .close-btn:hover { background: #f3f4f6; color: #1a1a2e; }

    .modal-body {
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }
    .field-row {
      display: flex;
      gap: 16px;
    }
    label {
      font-size: 13px;
      font-weight: 500;
      color: #374151;
    }
    .required { color: #ef4444; }

    .input {
      border: 1.5px solid #e5e7eb;
      border-radius: 8px;
      padding: 9px 12px;
      font-size: 14px;
      color: #1a1a2e;
      background: #fff;
      transition: border-color 0.15s, box-shadow 0.15s;
      width: 100%;
    }
    .input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
    .input.error { border-color: #ef4444; }
    .textarea { resize: vertical; min-height: 80px; }
    .error-msg { font-size: 12px; color: #ef4444; }

    .toggle-group {
      display: flex;
      gap: 6px;
    }
    .toggle-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 12px;
      border-radius: 8px;
      border: 1.5px solid #e5e7eb;
      background: #fff;
      color: #6b7280;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s;
      white-space: nowrap;
    }
    .toggle-btn:hover { border-color: #d1d5db; background: #f9fafb; }
    .toggle-btn.active {
      border-color: #3b82f6;
      background: #eff6ff;
      color: #2563eb;
    }
    .toggle-btn.type-office.active {
      border-color: #8b5cf6;
      background: #f5f3ff;
      color: #7c3aed;
    }
    .toggle-btn.type-personal.active {
      border-color: #10b981;
      background: #ecfdf5;
      color: #059669;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }
    .checkbox {
      width: 16px;
      height: 16px;
      accent-color: #f59e0b;
      cursor: pointer;
    }
    .checkbox-text {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      font-weight: 500;
      color: #374151;
    }
    .checkbox-text svg { color: #f59e0b; }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 16px 24px;
      border-top: 1px solid #f3f4f6;
      background: #fafafa;
    }
    .btn {
      padding: 9px 18px;
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
    .btn-ghost:hover { background: #f3f4f6; color: #374151; }
    .btn-primary {
      background: #3b82f6;
      border: 1.5px solid #3b82f6;
      color: #fff;
    }
    .btn-primary:hover { background: #2563eb; border-color: #2563eb; }
  `]
})
export class TaskFormComponent implements OnInit {
  @Input() editTask: Task | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private taskService = inject(TaskService);

  title = '';
  notes = '';
  status: TaskStatus = 'backlog';
  type: TaskType = 'personal';
  followUp = false;
  titleError = false;

  ngOnInit() {
    if (this.editTask) {
      this.title = this.editTask.title;
      this.notes = this.editTask.notes;
      this.status = this.editTask.status;
      this.type = this.editTask.type;
      this.followUp = this.editTask.followUp;
    }
  }

  onSubmit() {
    if (!this.title.trim()) {
      this.titleError = true;
      return;
    }
    this.titleError = false;

    const data = {
      title: this.title.trim(),
      notes: this.notes.trim(),
      status: this.status,
      type: this.type,
      followUp: this.followUp
    };

    if (this.editTask) {
      this.taskService.updateTask(this.editTask.id, data);
    } else {
      this.taskService.addTask(data);
    }

    this.saved.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }

  onOverlayClick(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('overlay')) {
      this.onCancel();
    }
  }
}
