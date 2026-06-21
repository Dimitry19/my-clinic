import { StatutExamenLabo } from '../enums/enums.model';

export interface ExamenLabo {
  id: string;
  consultationId: string;
  patientId: string;
  patientNom: string;
  prescritParId: string;
  prescritParNom: string;
  typeExamen: string;
  description: string;
  statut: StatutExamenLabo;
  datePrescription: string;
  dateResultat: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ExamenLaboRequest {
  consultationId: string;
  patientId: string;
  prescritPar: string;
  typeExamen: string;
  description: string;
  statut?: StatutExamenLabo;
  datePrescription?: string;
  dateResultat?: string | null;
}

export const EXAMEN_STATUT_CONFIG: Record<
  StatutExamenLabo,
  { label: string; severity: string; icon: string }
> = {
  EN_ATTENTE: { label: 'En attente', severity: 'info', icon: 'pi-clock' },
  EN_COURS: {
    label: 'En cours',
    severity: 'primary',
    icon: 'pi-spin pi-spinner',
  },

  TERMINE: { label: 'Terminé', severity: 'success', icon: 'pi-check-circle' },
  ANNULE: { label: 'Annulé', severity: 'danger', icon: 'pi-times-circle' },
};
