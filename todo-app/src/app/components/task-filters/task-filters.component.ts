import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filters-bar">
      <div class="search-wrap">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          class="search-input"
          placeholder="Search tasks..."
          [ngModel]="filter().search"
          (ngModelChange)="taskService.setFilter({ search: $event })"
        />
        <button
          class="clear-search"
          *ngIf="filter().search"
          (click)="taskService.setFilter({ search: '' })"
          title="Clear search"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div class="filter-chips">
        <div class="chip-group">
          <button
            class="chip"
            [class.active]="filter().status === 'all'"
            (click)="taskService.setFilter({ status: 'all' })"
          >All</button>
          <button
            class="chip status-backlog"
            [class.active]="filter().status === 'backlog'"
            (click)="taskService.setFilter({ status: 'backlog' })"
          >Backlog</button>
          <button
            class="chip status-planned"
            [class.active]="filter().status === 'planned'"
            (click)="taskService.setFilter({ status: 'planned' })"
          >Planned</button>
        </div>

        <div class="separator"></div>

        <div class="chip-group">
          <button
            class="chip type-all"
            [class.active]="filter().type === 'all'"
            (click)="taskService.setFilter({ type: 'all' })"
          >All Types</button>
          <button
            class="chip type-office"
            [class.active]="filter().type === 'office'"
            (click)="taskService.setFilter({ type: 'office' })"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
            Office
          </button>
          <button
            class="chip type-personal"
            [class.active]="filter().type === 'personal'"
            (click)="taskService.setFilter({ type: 'personal' })"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            Personal
          </button>
        </div>

        <div class="separator"></div>

        <button
          class="chip follow-up-chip"
          [class.active]="filter().followUp === true"
          (click)="toggleFollowUpFilter()"
          title="Show follow-up tasks only"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" [attr.fill]="filter().followUp ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          Follow Up
        </button>
      </div>
    </div>
  `,
  styles: [`
    .filters-bar {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .search-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }
    .search-icon {
      position: absolute;
      left: 12px;
      color: #9ca3af;
      pointer-events: none;
    }
    .search-input {
      width: 100%;
      padding: 10px 12px 10px 38px;
      border: 1.5px solid #e5e7eb;
      border-radius: 10px;
      font-size: 14px;
      background: #fff;
      color: #1a1a2e;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .search-input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
    }
    .search-input::placeholder { color: #9ca3af; }
    .clear-search {
      position: absolute;
      right: 10px;
      background: none;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      display: flex;
      transition: color 0.15s, background 0.15s;
    }
    .clear-search:hover { color: #374151; background: #f3f4f6; }

    .filter-chips {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
    }
    .chip-group { display: flex; gap: 4px; }
    .separator {
      width: 1px;
      height: 20px;
      background: #e5e7eb;
    }
    .chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      background: #fff;
      border: 1.5px solid #e5e7eb;
      color: #6b7280;
      transition: all 0.15s;
      white-space: nowrap;
    }
    .chip:hover { border-color: #d1d5db; background: #f9fafb; color: #374151; }
    .chip.active { border-color: transparent; }

    .chip.status-backlog.active { background: #f3f4f6; color: #374151; border-color: #d1d5db; }
    .chip.status-planned.active { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }
    .chip.type-office.active { background: #f5f3ff; color: #7c3aed; border-color: #ddd6fe; }
    .chip.type-personal.active { background: #ecfdf5; color: #059669; border-color: #a7f3d0; }
    .chip.follow-up-chip.active { background: #fffbeb; color: #b45309; border-color: #fde68a; }
    .chip:not([class*="status-"]):not([class*="type-"]):not(.follow-up-chip).active {
      background: #f3f4f6; color: #374151; border-color: #d1d5db;
    }
  `]
})
export class TaskFiltersComponent {
  taskService = inject(TaskService);
  filter = this.taskService.getFilter();

  toggleFollowUpFilter() {
    const current = this.filter().followUp;
    this.taskService.setFilter({ followUp: current === true ? null : true });
  }
}
