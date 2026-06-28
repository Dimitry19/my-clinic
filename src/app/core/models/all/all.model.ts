import { ButtonProps } from 'primeng/button';

export interface ServiceError {
  code:
    | 'NOT_FOUND'
    | 'CONFLICT'
    | 'NETWORK'
    | 'SERVER'
    | 'FORBIDDEN'
    | 'UNKNOWN';
  message: string;
  field?: string;
}

export interface StatDashboard {
  patientsAujourdhui: number;
  enAttente: number;
  rdvRestants: number;
  consultationsTerminees: number;
}

export interface Paginator {
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
export interface Page<T> {
  content: T[];
  page: Paginator;
}

export type LoginStep = 'idle' | 'loading' | 'success' | 'error';
export type ErrorType = 'credentials' | 'network' | 'locked' | 'server' | null;

export const ORDONNANCE_STEPS = [
  { label: 'Médecin & Patient', icon: 'pi-users' },
  { label: 'Consultation', icon: 'pi-stethoscope' },
  { label: 'Médicaments', icon: 'pi-pills' },
  { label: 'Récapitulatif', icon: 'pi-list-check' },
];

export const EXAMEN_LABO_STEPS = [
  { label: 'Médecin & Patient', icon: 'pi-users' },
  { label: 'Consultation', icon: 'pi-stethoscope' },
  { label: 'Détails examen', icon: 'pi-flask' },
  { label: 'Récapitulatif', icon: 'pi-list-check' },
];

export const CONS_STEPS = [
  { label: 'Médecin & Patient', icon: 'pi-users' },
  { label: 'Rendez-vous', icon: 'pi-calendar' },
  { label: 'Examen clinique', icon: 'pi-heart-rate-monitor' },
  { label: 'Diagnostic', icon: 'pi-clipboard' },
  { label: 'Récapitulatif', icon: 'pi-list-check' },
];
