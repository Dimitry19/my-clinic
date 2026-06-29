import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

import type { ButtonSeverity } from 'primeng/button';
import { BehaviorSubject, Observable } from 'rxjs';

import { ApiResponseService } from '../models/response/api.service';
import { ApiResponse } from '../models/response/api-response.model';
import {
  Entite,
  StatutConge,
  StatutEmploye,
  StatutExamenLabo,
  StatutFacture,
  StatutRendezVous,
} from '../models/enums/enums.model';
import { RDV_STATUT_CONFIG } from '../models/agenda/agenda.model';
import {
  CONS_STATUT_CONFIG,
  StatutConsultation,
} from '../models/patient/consultation.model';
import { EXAMEN_STATUT_CONFIG } from '../models/laboratoire/laboratoire.model';
import {
  CONGE_STATUT_CONFIG,
  EMLOYE_STATUT_CONFIG,
} from '../models/employe/employe.model';
import { AuthService } from './auth/auth.service';
import { ErrorService } from './error.service';
import { FACTURE_STATUT_CONFIG } from '../models/facture/facture.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  private authService = inject(AuthService);
  private errorService = inject(ErrorService);
  menuRoles: string = '/assets/json/menu-roles.json';
  delivery: string = '/assets/mock/delivery.json';

  private menuSubject = new BehaviorSubject(false);
  menuSubject$ = this.menuSubject.asObservable();

  currentDate = signal(new Date());

  constructor(
    public router: Router,
    public httpClient: HttpClient,

    public apiService: ApiResponseService,
  ) {}

  public getCurrentMonth(): number {
    return this.currentDate().getMonth();
  }
  public getCurrentYear(): number {
    return this.currentDate().getFullYear();
  }

  formatDateLocaleDateString(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  formatHeure(iso: string) {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  formatDate(iso: string) {
    if (!iso) return '—';
    const d = new Date(iso);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  }

  formatDatetime(iso: string | null): string {
    if (!iso) return '—';
    return `${this.formatDate(iso)} à ${this.formatHeure(iso)}`;
  }

  formatDateToLocalDatetimeInput(date: string | Date): string {
    const d = new Date(date);

    const pad = (n: number) => n.toString().padStart(2, '0');

    return (
      d.getFullYear() +
      '-' +
      pad(d.getMonth() + 1) +
      '-' +
      pad(d.getDate()) +
      'T' +
      pad(d.getHours()) +
      ':' +
      pad(d.getMinutes())
    );
  }

  public getInitiales(prenom?: string | null, nom?: string | null): string {
    const initialePrenom = prenom?.charAt(0) ?? '';
    const initialeNom = nom?.charAt(0) ?? '';

    return `${initialePrenom}${initialeNom}`.toUpperCase();
  }

  getStatutLabel(s: string, entite: Entite): string {
    if (entite === Entite.AGENDA) {
      return RDV_STATUT_CONFIG[s as StatutRendezVous]?.label ?? 'Planifié';
    }

    if (entite === Entite.CONSULTATION) {
      return CONS_STATUT_CONFIG[s as StatutConsultation]?.label ?? 'Planifiée';
    }
    if (entite === Entite.LABORATOIRE) {
      return EXAMEN_STATUT_CONFIG[s as StatutExamenLabo]?.label ?? 'En attente';
    }

    if (entite === Entite.EMPLOYE) {
      return EMLOYE_STATUT_CONFIG[s as StatutEmploye]?.label ?? '-';
    }
    if (entite === Entite.FACTURATION) {
      return FACTURE_STATUT_CONFIG[s as StatutFacture]?.label ?? '-';
    }

    if (entite === Entite.CONGE) {
      return CONGE_STATUT_CONFIG[s as StatutConge]?.label ?? '-';
    }
    return '-';
  }

  getStatutSeverity(s: string, entite: Entite) {
    if (entite === Entite.AGENDA) {
      return RDV_STATUT_CONFIG[s as StatutRendezVous]?.severity ?? 'secondary';
    }

    if (entite === Entite.CONSULTATION) {
      return (
        CONS_STATUT_CONFIG[s as StatutConsultation]?.severity ?? 'secondary'
      );
    }
    if (entite === Entite.LABORATOIRE) {
      return EXAMEN_STATUT_CONFIG[s as StatutExamenLabo]?.severity ?? 'info';
    }

    if (entite === Entite.EMPLOYE) {
      return EMLOYE_STATUT_CONFIG[s as StatutEmploye]?.severity ?? 'secondary';
    }
    if (entite === Entite.FACTURATION) {
      return FACTURE_STATUT_CONFIG[s as StatutFacture]?.severity ?? 'secondary';
    }
    if (entite === Entite.CONGE) {
      return CONGE_STATUT_CONFIG[s as StatutConge]?.severity ?? 'secondary';
    }
    return 'secondary';
  }

  getStatutIcon(s: string, entite: Entite) {
    if (entite === Entite.AGENDA) {
      return RDV_STATUT_CONFIG[s as StatutRendezVous]?.icon ?? 'pi-clock';
    }

    if (entite === Entite.CONSULTATION) {
      return CONS_STATUT_CONFIG[s as StatutConsultation]?.icon ?? 'pi-clock';
    }

    if (entite === Entite.LABORATOIRE) {
      return EXAMEN_STATUT_CONFIG[s as StatutExamenLabo]?.icon ?? 'pi-clock';
    }
    if (entite === Entite.EMPLOYE) {
      return (
        EMLOYE_STATUT_CONFIG[s as StatutEmploye]?.icon ?? 'pi pi-check-circle'
      );
    }
    if (entite === Entite.FACTURATION) {
      return (
        FACTURE_STATUT_CONFIG[s as StatutFacture]?.icon ?? 'pi pi-check-circle'
      );
    }

    if (entite === Entite.CONGE) {
      return (
        CONGE_STATUT_CONFIG[s as StatutConge]?.icon ?? 'pi pi-times-circle'
      );
    }
    return 'pi-clock';
  }

  getStatutButtonSeverity(s: string, entite: Entite): ButtonSeverity {
    if (entite === Entite.CONSULTATION) {
      return (
        (CONS_STATUT_CONFIG[s as StatutConsultation]
          ?.severity as ButtonSeverity) ?? 'secondary'
      );
    }
    if (entite === Entite.AGENDA) {
      return (
        (RDV_STATUT_CONFIG[s as StatutRendezVous]
          ?.severity as ButtonSeverity) ?? 'info'
      );
    }

    return 'secondary';
  }

  getSexeLabel(s: string) {
    return s === 'M' ? 'Homme' : s === 'F' ? 'Femme' : 'Autre';
  }

  deviseMonnetaire(): string {
    return `${environment.deviseMonnetaire}`;
  }

  getStatutColorClass(statut: string): string {
    return (
      {
        TERMINE: 'sc-green',
        EN_COURS: 'sc-blue',
        EN_ATTENTE: 'sc-amber',
        ANNULE: 'sc-red',
      }[statut] ?? 'sc-blue'
    );
  }

  public isSuccessResponse(response: ApiResponse): boolean {
    return this.apiService.isSuccessResponse(response);
  }

  public isErrorResponse(response: ApiResponse): boolean {
    return !this.apiService.isSuccessResponse(response);
  }

  details = (path: string, id: string) => {
    this.router.navigate([path, id]);
  };

  /**
   *Actualise le composant en accédant à un nouvel itinéraire tout en préservant l'URL actuelle et en ignorant le changement d'emplacement.
   * @param param - Le paramètre à transmettre à la route.
   * @param routes - Les itinéraires vers lesquels naviguer(max 2).
   */
  refreshSelfComponent(param?: any, ...routes: string[]): void {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      const routeParams = param ? [param] : [];
      const finalRoutes = routes.slice(0, 2).concat(routeParams);
      this.router.navigate(finalRoutes);
    });
  }

  public handleError(
    err: HttpErrorResponse,
    entite: Entite,
  ): Observable<never> {
    return this.errorService.handleError(err, entite);
  }

  public globalErrorHandler(error: any): Observable<any> {
    return this.errorService.globalErrorHandler(error);
  }

  public globalStatusErrorHandler(error: HttpErrorResponse) {
    return this.errorService.globalStatusErrorHandler(error);
  }

  hasRole(requiredRoles: string[]): boolean {
    const user = this.authService.currentUser();
    if (!user || !user.role) {
      return false;
    }
    return requiredRoles.some((role) => user.role.includes(role));
  }
}
