import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';

@Component({
  selector: 'clnt-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="shell" [class.sidebar-collapsed]="sidebarCollapsed()">
      <clnt-sidebar
        [collapsed]="sidebarCollapsed()"
        (toggleCollapse)="sidebarCollapsed.set(!sidebarCollapsed())"
      />
      <div class="shell-right">
        <clnt-topbar
          (toggleSidebar)="sidebarCollapsed.set(!sidebarCollapsed())"
        />
        <main class="shell-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .shell {
        display: flex;
        height: 100vh;
        overflow: hidden;
        background: var(--p-surface-50);
      }
      .shell-right {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .shell-content {
        flex: 1;
        overflow-y: auto;
        padding: 1.5rem;
      }
    `,
  ],
})
export class ShellComponent {
  auth = inject(AuthService);
  sidebarCollapsed = signal(false);
}
