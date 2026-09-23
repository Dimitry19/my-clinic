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
import { TranslatePipe } from '../../../core/pipe/i18n.pipe';

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
    TranslatePipe,
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
    const roles = this.auth.currentUser()?.roles;
    if (!roles) return [];

    return this.navItems.filter(
      (item) => !item.roles || this.hasRole(item.roles, roles),
    );
  });

  visibleAdminNavItems = computed(() => {
    const roles = this.auth.currentUser()?.roles;

    if (!roles) return [];

    const adminRoles = this.adminItems.filter(
      (item) => !item.roles || this.hasRole(item.roles, roles)
    );

    return adminRoles;
  });

  get initiales() {
    const u = this.auth.currentUser();
    return u ? this.commonService.getInitiales(u.prenom, u.nom) : 'DR';
  }

  navItems: NavItem[] = [
    {
      label: 'nav.dashboard',
      icon: 'pi pi-home',
      route: '/dashboard',
      roles: environment.dashboardRoles,
    },
    {
      label: 'nav.patients',
      icon: 'pi pi-users',
      route: '/patients',
      roles: environment.patientsRoles,
    },
    {
      label: 'nav.agenda',
      icon: 'pi pi-calendar',
      route: '/agenda',
      roles: environment.agendaRoles,
    },
    {
      label: 'nav.laboratory',
      icon: 'pi pi-filter-fill',
      route: '/examens-labo',
      roles: environment.laboratoireRoles,
    },
    {
      label: 'nav.pharmacy',
      icon: 'pi pi-building',
      route: '/pharmacie',
      roles: environment.pharmacieRoles,
    },
  ];

  adminItems: NavItem[] = [
    {
      label: 'nav.billing',
      icon: 'pi pi-receipt',
      route: '/factures',
      roles: environment.facturationRoles,
    },
    {
      label: 'nav.rh',
      icon: 'pi pi-users',
      route: '/employes',
      roles: environment.ressourcesHumainesRoles,
    },
    {
      label: 'nav.settings',
      icon: 'pi pi-cog',
      route: '/settings',
      roles: environment.adminRoles,
    },
  ];

  logout() {
    this.auth.logout();
  }

  autorizedAdmin() {
    return this.commonService.hasRole(environment.adminRoles);
  }

  autorizedRHs() {
    return this.commonService.hasRole(environment.ressourcesHumainesRoles);
  }

    hasRole(required: string[], roles:string[]): boolean {
    return required.some((r) => roles.includes(r));

   }
}
