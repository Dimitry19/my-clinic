import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { AuthService } from '../../../core/services/auth/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
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

  get initiales() {
    const u = this.auth.currentUser();
    return u ? `${u.prenom[0]}${u.nom[0]}`.toUpperCase() : 'DR';
  }

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard' },
    { label: 'Patients', icon: 'pi pi-users', route: '/patients' },
    { label: 'Agenda', icon: 'pi pi-calendar', route: '/agenda' },
    { label: 'Laboratoire', icon: 'pi pi-filter-fill', route: '/labo' },
    { label: 'Pharmacie', icon: 'pi pi-shopping-cart', route: '/pharmacie' },
  ];

  adminItems: NavItem[] = [
    { label: 'Facturation', icon: 'pi pi-receipt', route: '/facturation' },
    { label: 'RH', icon: 'pi pi-users', route: '/rh' },
    { label: 'Paramètres', icon: 'pi pi-cog', route: '/settings' },
  ];
}
