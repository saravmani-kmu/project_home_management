import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskListComponent } from './components/task-list/task-list.component';
import { TaskFormComponent } from './components/task-form/task-form.component';
import { TaskFiltersComponent } from './components/task-filters/task-filters.component';
import { TaskService } from './services/task.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, TaskListComponent, TaskFormComponent, TaskFiltersComponent],
  template: `
    <div class="app-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <div class="logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="2"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <span class="logo-text">My Tasks</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section">
            <p class="nav-label">Overview</p>
            <div class="stat-item">
              <span class="stat-dot all"></span>
              <span class="stat-name">All Tasks</span>
              <span class="stat-count">{{ stats().total }}</span>
            </div>
            <div class="stat-item highlight" *ngIf="stats().followUp > 0">
              <span class="stat-dot follow"></span>
              <span class="stat-name">Follow Up</span>
              <span class="stat-count follow">{{ stats().followUp }}</span>
            </div>
          </div>

          <div class="nav-section">
            <p class="nav-label">By Status</p>
            <div class="stat-item">
              <span class="stat-dot backlog"></span>
              <span class="stat-name">Backlog</span>
              <span class="stat-count">{{ stats().backlog }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-dot planned"></span>
              <span class="stat-name">Planned</span>
              <span class="stat-count">{{ stats().planned }}</span>
            </div>
          </div>

          <div class="nav-section">
            <p class="nav-label">By Type</p>
            <div class="stat-item">
              <span class="stat-dot office"></span>
              <span class="stat-name">Office</span>
              <span class="stat-count">{{ stats().office }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-dot personal"></span>
              <span class="stat-name">Personal</span>
              <span class="stat-count">{{ stats().personal }}</span>
            </div>
          </div>
        </nav>

        <div class="sidebar-footer">
          <p class="storage-note">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
              <line x1="6" y1="6" x2="6.01" y2="6"/>
              <line x1="6" y1="18" x2="6.01" y2="18"/>
            </svg>
            Saved in browser
          </p>
        </div>
      </aside>

      <!-- Main content -->
      <main class="main-content">
        <div class="top-bar">
          <div class="page-title">
            <h1>Tasks</h1>
            <span class="task-count">{{ stats().total }} total</span>
          </div>
          <button class="add-btn" (click)="showForm.set(true)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Task
          </button>
        </div>

        <app-task-filters></app-task-filters>

        <app-task-list></app-task-list>
      </main>
    </div>

    <app-task-form
      *ngIf="showForm()"
      [editTask]="null"
      (saved)="showForm.set(false)"
      (cancelled)="showForm.set(false)"
    ></app-task-form>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      background: #f8f9fc;
    }

    /* Sidebar */
    .sidebar {
      width: 220px;
      background: #1e1e2e;
      color: #e2e8f0;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      position: sticky;
      top: 0;
      height: 100vh;
    }
    .sidebar-header {
      padding: 20px 16px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #3b82f6, #6366f1);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      flex-shrink: 0;
    }
    .logo-text {
      font-size: 16px;
      font-weight: 700;
      color: #f1f5f9;
    }

    .sidebar-nav {
      flex: 1;
      padding: 16px 12px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      overflow-y: auto;
    }
    .nav-section { display: flex; flex-direction: column; gap: 2px; }
    .nav-label {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #64748b;
      padding: 0 8px;
      margin-bottom: 4px;
    }
    .stat-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 8px;
      border-radius: 8px;
      transition: background 0.15s;
    }
    .stat-item:hover { background: rgba(255,255,255,0.05); }
    .stat-item.highlight { background: rgba(245,158,11,0.08); }
    .stat-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .stat-dot.all { background: #94a3b8; }
    .stat-dot.backlog { background: #6b7280; }
    .stat-dot.planned { background: #3b82f6; }
    .stat-dot.office { background: #8b5cf6; }
    .stat-dot.personal { background: #10b981; }
    .stat-dot.follow { background: #f59e0b; }
    .stat-name {
      flex: 1;
      font-size: 13px;
      color: #cbd5e1;
      font-weight: 400;
    }
    .stat-count {
      font-size: 12px;
      font-weight: 600;
      color: #475569;
      background: rgba(255,255,255,0.06);
      padding: 1px 7px;
      border-radius: 10px;
    }
    .stat-count.follow { color: #f59e0b; background: rgba(245,158,11,0.15); }

    .sidebar-footer {
      padding: 12px 16px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }
    .storage-note {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: #475569;
    }

    /* Main content */
    .main-content {
      flex: 1;
      padding: 28px 32px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      max-width: 820px;
      min-width: 0;
    }
    .top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .page-title {
      display: flex;
      align-items: baseline;
      gap: 10px;
    }
    .page-title h1 {
      font-size: 26px;
      font-weight: 700;
      color: #1a1a2e;
      line-height: 1;
    }
    .task-count {
      font-size: 13px;
      color: #9ca3af;
      font-weight: 400;
    }
    .add-btn {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 9px 18px;
      background: #3b82f6;
      color: #fff;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(59,130,246,0.35);
      transition: all 0.15s;
    }
    .add-btn:hover {
      background: #2563eb;
      box-shadow: 0 4px 12px rgba(59,130,246,0.45);
      transform: translateY(-1px);
    }
    .add-btn:active { transform: translateY(0); }

    @media (max-width: 768px) {
      .app-layout { flex-direction: column; }
      .sidebar { width: 100%; height: auto; position: static; }
      .sidebar-nav { flex-direction: row; flex-wrap: wrap; gap: 10px; }
      .nav-section { flex-direction: row; flex-wrap: wrap; gap: 4px; }
      .nav-label { display: none; }
      .main-content { padding: 16px; }
    }
  `]
})
export class AppComponent {
  private taskService = inject(TaskService);
  showForm = signal(false);
  readonly stats = this.taskService.stats;
}
