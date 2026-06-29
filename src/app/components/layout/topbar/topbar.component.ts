import { Component, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../core/services/auth/auth.service';
import { TooltipModule } from 'primeng/tooltip';
import { CommonService } from '../../../core/services/common.services';
import { ApiResponse } from '../../../core/models/response/api-response.model';
import { Router } from '@angular/router';

@Component({
  selector: 'clnt-topbar',
  standalone: true,
  imports: [CommonModule, ButtonModule, BadgeModule, MenuModule, TooltipModule],
  template: `
    <header class="topbar">
      <div class="topbar-left">
        <p-button
          icon="pi pi-bars"
          [text]="true"
          (onClick)="toggleSidebar.emit()"
          severity="secondary"
        />
        <div class="breadcrumb">
          <span class="clinic-name">Centre Médical la Trinité</span>
        </div>
      </div>
      <div class="topbar-right">
        <!-- Thème clair/sombre -->
        <p-button
          [icon]="darkMode ? 'pi pi-sun' : 'pi pi-moon'"
          [text]="true"
          severity="secondary"
          (onClick)="toggleTheme()"
          pTooltip="Changer le thème"
          tooltipPosition="bottom"
        />
        <!-- Notifications -->
        <div class="notif-wrap">
          <p-button icon="pi pi-bell" [text]="true" severity="secondary" />
          <span class="notif-badge">3</span>
        </div>
        <!-- User menu -->
        <div class="user-chip" (click)="userMenu.toggle($event)">
          <div class="avatar">{{ initiales }}</div>
          <span class="user-name"
            >{{ label }} {{ auth.currentUser()?.nom }}</span
          >
          <i class="pi pi-chevron-down"></i>
        </div>
        <p-menu #userMenu [popup]="true" [model]="userMenuItems" />
      </div>
    </header>
  `,
  styles: [
    `
      .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 1rem;
        height: 56px;
        background: var(--p-surface-0);
        border-bottom: 1px solid var(--p-surface-100);
        flex-shrink: 0;
      }
      .topbar-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .clinic-name {
        font-size: 15px;
        font-weight: 500;
        color: var(--p-text-color);
      }
      .topbar-right {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .notif-wrap {
        position: relative;
      }
      .notif-badge {
        position: absolute;
        top: 0;
        right: 0;
        width: 16px;
        height: 16px;
        background: #e24b4a;
        color: #fff;
        border-radius: 50%;
        font-size: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--p-surface-0);
      }
      .user-chip {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        border-radius: 20px;
        cursor: pointer;
        border: 1px solid var(--p-surface-100);
        background: var(--p-surface-50);
        &:hover {
          background: var(--p-surface-100);
        }
      }
      .avatar {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #e6f1fb;
        color: #0c447c;
        font-size: 11px;
        font-weight: 500;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .user-name {
        font-size: 13px;
        color: var(--p-text-color);
      }
      i.ti {
        font-size: 14px;
        color: var(--p-text-muted-color);
      }
    `,
  ],
})
export class TopbarComponent {
  toggleSidebar = output();
  auth = inject(AuthService);
  commonService = inject(CommonService);

  router = inject(Router);

  label = this.auth.currentUser()?.role === 'MEDECIN' ? 'Dr.' : '';

  darkMode = false;

  get initiales() {
    const u = this.auth.currentUser();
    return u ? this.commonService.getInitiales(u.prenom, u.nom) : 'DR';
  }

  toggleTheme() {
    this.darkMode = !this.darkMode;
    document.documentElement.classList.toggle('dark-mode', this.darkMode);
  }

  userMenuItems: MenuItem[] = [
    { label: 'Mon profil', icon: 'pi pi-user', command: () => this.profil() },
    // { label: 'Paramètres', icon: 'pi pi-cog', command: () => {} },
    { separator: true },
    {
      label: 'Déconnexion',
      icon: 'pi pi-sign-out',
      command: () => this.logout(),
    },
  ];

  profil() {
    this.router.navigate(['/employes', this.auth.currentUser()?.employeId]);
  }

  logout() {
    this.auth.logout().subscribe({
      next: (response: ApiResponse<boolean>) => {
        if (this.commonService.isSuccessResponse(response)) {
          setTimeout(() => this.router.navigate(['/login']), 800);
        }
      },
      error: (err) => {},
    });
  }
}
