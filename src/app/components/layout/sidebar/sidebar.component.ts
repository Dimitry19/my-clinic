import { CommonService } from './../../../core/services/common.services';
import {
  Component,
  input,
  output,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../../core/services/auth/auth.service';
import { ApiResponse } from '../../../core/models/response/api-response.model';
import { ErrorType } from '../../../core/models/all/all.model';
import { environment } from '../../../../environments/environment.prod';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'clnt-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    ButtonModule,
    TooltipModule,
  ],

  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  collapsed = input(false);
  toggleCollapse = output();
  auth = inject(AuthService);
  commonService = inject(CommonService);
  router = inject(Router);

  errorType = signal<ErrorType>(null);
  errorMsg = signal('');

  visibleNavItems = computed(() => {
    const role = this.auth.currentUser()?.role;
    if (!role) return [];

    return this.navItems.filter(
      (item) => !item.roles || item.roles.includes(role),
    );
  });

  visibleAdminNavItems = computed(() => {
    const role = this.auth.currentUser()?.role;

    if (!role) return [];

    const roles = this.adminItems.filter(
      (item) => !item.roles || item.roles.includes(role),
    );

    return roles;
  });

  get initiales() {
    const u = this.auth.currentUser();
    return u ? this.commonService.getInitiales(u.prenom, u.nom) : 'DR';
  }

  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      route: '/dashboard',
      roles: environment.dashboardRoles,
    },
    {
      label: 'Patients',
      icon: 'pi pi-users',
      route: '/patients',
      roles: environment.patientsRoles,
    },
    {
      label: 'Agenda',
      icon: 'pi pi-calendar',
      route: '/agenda',
      roles: environment.agendaRoles,
    },
    {
      label: 'Laboratoire',
      icon: 'pi pi-filter-fill',
      route: '/examens-labo',
      roles: environment.laboratoireRoles,
    },
    {
      label: 'Pharmacie',
      icon: 'pi pi-shopping-cart',
      route: '/pharmacie',
      roles: environment.pharmacieRoles,
    },
  ];

  adminItems: NavItem[] = [
    {
      label: 'Facturation',
      icon: 'pi pi-receipt',
      route: '/factures',
      roles: environment.facturationRoles,
    },
    {
      label: 'RH',
      icon: 'pi pi-users',
      route: '/employes',
      roles: environment.ressourcesHumainesRoles,
    },
    {
      label: 'Paramètres',
      icon: 'pi pi-cog',
      route: '/settings',
      roles: environment.adminRoles,
    },
  ];

  logout() {
    this.auth.logout().subscribe({
      next: (response: ApiResponse<boolean>) => {
        if (this.commonService.isSuccessResponse(response)) {
          setTimeout(() => this.router.navigate(['/login']), 800);
        } else {
          this.errorType.set('network');
          this.errorMsg.set(
            response.message ??
              'Une erreur est survenue. Réessayez dans quelques instants.',
          );
        }
      },
      error: (err) => {
        const status = err?.status;
        if (status === 0 || status === 503) {
          this.errorType.set('network');
          this.errorMsg.set(
            'Impossible de contacter le serveur. Vérifiez votre connexion internet.',
          );
        } else if (status >= 500) {
          this.errorType.set('server');
          this.errorMsg.set(
            'Une erreur serveur est survenue. Réessayez dans quelques instants.',
          );
        } else {
          this.errorType.set('server');
          this.errorMsg.set(
            err?.error?.message ?? 'Une erreur inattendue est survenue.',
          );
        }
      },
    });
  }

  autorizedAdmin() {
    return this.commonService.hasRole(environment.adminRoles);
  }
}
