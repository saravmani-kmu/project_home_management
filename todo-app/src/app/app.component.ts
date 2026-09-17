import { Component, inject, signal, HostListener } from '@angular/core';
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
    <!-- Mobile header -->
    <header class="mobile-header">
      <div class="mob-logo">
        <div class="mob-logo-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="2"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
        </div>
        <span class="mob-logo-text">My Tasks</span>
      </div>
      <button class="mob-menu-btn" (click)="drawerOpen.set(true)" aria-label="Open menu">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
    </header>

    <!-- Drawer overlay -->
    <div class="drawer-overlay" [class.open]="drawerOpen()" (click)="drawerOpen.set(false)"></div>

    <div class="app-layout">
      <!-- Sidebar / Drawer -->
      <aside class="sidebar" [class.open]="drawerOpen()">
        <div class="sidebar-header">
          <div class="logo">
            <div class="logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="2"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <span class="logo-text">My Tasks</span>
          </div>
          <button class="sidebar-close-btn" (click)="drawerOpen.set(false)" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
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
        <!-- Mobile stats strip -->
        <div class="mobile-stats">
          <div class="mstat"><span class="mstat-val">{{ stats().total }}</span><span class="mstat-lbl">All</span></div>
          <div class="mstat"><span class="mstat-val">{{ stats().backlog }}</span><span class="mstat-lbl">Backlog</span></div>
          <div class="mstat"><span class="mstat-val">{{ stats().planned }}</span><span class="mstat-lbl">Planned</span></div>
          <div class="mstat"><span class="mstat-val">{{ stats().office }}</span><span class="mstat-lbl">Office</span></div>
          <div class="mstat"><span class="mstat-val">{{ stats().personal }}</span><span class="mstat-lbl">Personal</span></div>
          <div class="mstat"><span class="mstat-val gold">{{ stats().followUp }}</span><span class="mstat-lbl">Follow Up</span></div>
        </div>

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

    <!-- FAB (mobile) -->
    <button class="fab" (click)="showForm.set(true)" aria-label="New task">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
      </svg>
    </button>

    <app-task-form
      *ngIf="showForm()"
      [editTask]="null"
      (saved)="showForm.set(false)"
      (cancelled)="showForm.set(false)"
    ></app-task-form>
  `,
  styles: [`
    /* ── Mobile header ── */
    .mobile-header {
      display: none;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      background: #080808;
      border-bottom: 1px solid #1f1f1f;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .mob-logo { display: flex; align-items: center; gap: 9px; }
    .mob-logo-icon {
      width: 30px; height: 30px;
      background: linear-gradient(135deg, #4c7cf4, #7c5cbf);
      border-radius: 8px; display: flex; align-items: center; justify-content: center;
    }
    .mob-logo-text { font-size: 15px; font-weight: 700; color: #f0f0f0; }
    .mob-menu-btn {
      background: rgba(255,255,255,0.06); border: none; border-radius: 8px;
      color: #f0f0f0; cursor: pointer; padding: 8px;
      display: flex; align-items: center; justify-content: center;
      min-width: 40px; min-height: 40px;
      -webkit-tap-highlight-color: transparent;
    }

    /* ── Drawer overlay ── */
    .drawer-overlay {
      display: none;
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.65);
      z-index: 200;
      backdrop-filter: blur(2px);
    }
    .drawer-overlay.open { display: block; }

    /* ── Layout ── */
    .app-layout {
      display: flex;
      min-height: 100vh;
      background: #000000;
    }

    /* ── Sidebar ── */
    .sidebar {
      width: 220px;
      background: #080808;
      color: #e2e8f0;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      position: sticky;
      top: 0;
      height: 100vh;
      border-right: 1px solid #1f1f1f;
      transition: transform 0.25s ease;
    }
    .sidebar-header {
      padding: 20px 16px 16px;
      border-bottom: 1px solid #1f1f1f;
      display: flex; align-items: center; justify-content: space-between;
    }
    .logo { display: flex; align-items: center; gap: 10px; }
    .logo-icon {
      width: 36px; height: 36px;
      background: linear-gradient(135deg, #4c7cf4, #7c5cbf);
      border-radius: 10px; display: flex; align-items: center; justify-content: center;
      color: #fff; flex-shrink: 0;
    }
    .logo-text { font-size: 16px; font-weight: 700; color: #f0f0f0; }
    .sidebar-close-btn {
      display: none; background: none; border: none;
      color: #888888; cursor: pointer; padding: 4px; border-radius: 6px;
    }

    .sidebar-nav {
      flex: 1; padding: 16px 12px;
      display: flex; flex-direction: column; gap: 20px; overflow-y: auto;
    }
    .nav-section { display: flex; flex-direction: column; gap: 2px; }
    .nav-label {
      font-size: 10px; font-weight: 600; text-transform: uppercase;
      letter-spacing: 0.08em; color: #444444; padding: 0 8px; margin-bottom: 4px;
    }
    .stat-item {
      display: flex; align-items: center; gap: 8px;
      padding: 7px 8px; border-radius: 8px; transition: background 0.15s;
    }
    .stat-item:hover { background: rgba(255,255,255,0.04); }
    .stat-item.highlight { background: rgba(245,166,35,0.07); }
    .stat-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .stat-dot.all      { background: #555555; }
    .stat-dot.backlog  { background: #444444; }
    .stat-dot.planned  { background: #4c7cf4; }
    .stat-dot.office   { background: #7c5cbf; }
    .stat-dot.personal { background: #1db88e; }
    .stat-dot.follow   { background: #f5a623; }
    .stat-name { flex: 1; font-size: 13px; color: #888888; font-weight: 400; }
    .stat-count {
      font-size: 12px; font-weight: 600; color: #444444;
      background: rgba(255,255,255,0.04); padding: 1px 7px; border-radius: 10px;
    }
    .stat-count.follow { color: #f5a623; background: rgba(245,166,35,0.12); }

    .sidebar-footer { padding: 12px 16px; border-top: 1px solid #1f1f1f; }
    .storage-note { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #444444; }

    /* ── Mobile stats strip ── */
    .mobile-stats {
      display: none;
      background: #0a0a0a;
      border-bottom: 1px solid #1f1f1f;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .mobile-stats::-webkit-scrollbar { display: none; }
    .mstat {
      display: flex; flex-direction: column; align-items: center;
      padding: 10px 16px; gap: 2px; flex-shrink: 0;
      border-right: 1px solid #1f1f1f;
    }
    .mstat:last-child { border-right: none; }
    .mstat-val { font-size: 17px; font-weight: 600; color: #f0f0f0; }
    .mstat-val.gold { color: #f5a623; }
    .mstat-lbl { font-size: 10px; color: #555555; white-space: nowrap; }

    /* ── Main content ── */
    .main-content {
      flex: 1; min-width: 0;
      display: flex; flex-direction: column; gap: 20px;
    }
    .top-bar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 28px 32px 0;
    }
    .page-title { display: flex; align-items: baseline; gap: 10px; }
    .page-title h1 { font-size: 26px; font-weight: 700; color: #f0f0f0; line-height: 1; }
    .task-count { font-size: 13px; color: #555555; font-weight: 400; }
    .add-btn {
      display: flex; align-items: center; gap: 7px;
      padding: 9px 18px; background: #4c7cf4; color: #fff;
      border: none; border-radius: 10px; font-size: 14px; font-weight: 600;
      cursor: pointer; box-shadow: 0 2px 12px rgba(76,124,244,0.35);
      transition: all 0.15s;
    }
    .add-btn:hover { background: #3a60d0; box-shadow: 0 4px 16px rgba(76,124,244,0.45); transform: translateY(-1px); }
    .add-btn:active { transform: translateY(0); }

    /* ── FAB ── */
    .fab {
      display: none;
      position: fixed; bottom: 24px; right: 20px;
      width: 54px; height: 54px;
      background: #4c7cf4; color: #fff;
      border: none; border-radius: 50%;
      box-shadow: 0 4px 20px rgba(76,124,244,0.5);
      cursor: pointer; align-items: center; justify-content: center;
      z-index: 90; transition: background 0.15s, transform 0.15s;
      -webkit-tap-highlight-color: transparent;
    }
    .fab:active { transform: scale(0.93); }

    /* ── Mobile breakpoint ── */
    @media (max-width: 640px) {
      .app-layout { flex-direction: column; min-height: unset; }

      .mobile-header { display: flex; }

      .sidebar {
        position: fixed; left: 0; top: 0; bottom: 0;
        width: 260px; height: 100%; z-index: 210;
        transform: translateX(-100%);
        box-shadow: 0 0 40px rgba(0,0,0,0.8);
      }
      .sidebar.open { transform: translateX(0); }
      .sidebar-close-btn { display: flex; }

      .mobile-stats { display: flex; }

      .top-bar { padding: 16px 16px 0; }
      .add-btn { display: none; }
      .fab { display: flex; }

      app-task-filters { padding: 0 16px; }
    }
  `]
})
export class AppComponent {
  private taskService = inject(TaskService);
  showForm = signal(false);
  drawerOpen = signal(false);
  readonly stats = this.taskService.stats;

  @HostListener('document:keydown.escape')
  onEscape() { this.drawerOpen.set(false); }
}
