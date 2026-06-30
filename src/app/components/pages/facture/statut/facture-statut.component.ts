import {
  Component,
  computed,
  inject,
  signal,
  OnInit,
  input,
  model,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { CommonService } from '../../../../core/services/common.services';

import {
  Facture,
  ModePaiement,
  FACTURE_STATUT_CONFIG,
  MODE_PAIEMENT_CONFIG,
  StatutFactureRequest,
} from '../../../../core/models/facture/facture.model';

import { Patient } from '../../../../core/models/patient/patient.model';
import {
  Entite,
  StatutFacture,
} from '../../../../core/models/enums/enums.model';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TimelineModule } from 'primeng/timeline';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'clnt-facture-statut-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TabsModule,
    ButtonModule,
    TagModule,
    CardModule,
    SkeletonModule,
    TableModule,
    TimelineModule,
    AvatarModule,
    DividerModule,
    ToastModule,
    TooltipModule,
    DialogModule,
    InputNumberModule,
    SelectModule,
    ConfirmDialogModule,
  ],
  templateUrl: './facture-statut.component.html',
  styleUrls: ['./facture-statut.component.scss'],
})
export class FactureStatutComponent implements OnInit {
  // ───────────────────── inject ─────────────────────

  private commonService = inject(CommonService);

  devise = this.commonService.deviseMonnetaire();

  // ───────────────────── STATE ─────────────────────
  savingPaiement = signal(false);

  facture = input<Facture | null>(null);
  visible = model<boolean>(false);
  patient = input<Patient | null>(null);

  save = output<StatutFactureRequest>();
  selectedFacture = signal<Facture | null>(null);

  showDialog = signal(false);
  saving = signal(false);
  loading = signal(false);

  statutFactOptions = Object.entries(FACTURE_STATUT_CONFIG).map(([v, c]) => ({
    label: c.label,
    value: v,
  }));

  statutFactConfig = FACTURE_STATUT_CONFIG;

  // ───────────────────── COMPUTED ─────────────────────

  initiales = computed(() => {
    const p = this.patient();
    return p ? this.commonService.getInitiales(p.prenom, p.nom) : '??';
  });

  isEditable = computed(() => {
    const f = this.facture();
    return (
      !!f &&
      f.statut !== StatutFacture.PAYEE &&
      f.statut !== StatutFacture.ANNULEE
    );
  });

  // ───────────────────── INIT ─────────────────────
  ngOnInit() {}

  // ───────────────────── API ─────────────────────

  close() {
    this.visible.set(false);
  }

  // ───────────────────── UI ─────────────────────
  closeDialog() {
    this.showDialog.set(false);
    this.selectedFacture.set(null);
  }

  // ───────────────────── PAYMENT ─────────────────────
  changeFactureStatus(statut: StatutFacture) {
    this.saving.set(true);

    const req: StatutFactureRequest = {
      factureId: this.facture()!.id,
      statut: statut,
    };

    this.save.emit(req);
  }

  // ───────────────────── HELPERS ─────────────────────

  getSeverity(s: string) {
    return this.commonService.getStatutSeverity(s, Entite.FACTURATION);
  }

  formatDate(iso: string) {
    return this.commonService.formatDate(iso);
  }
  formatHeure(iso: string) {
    return this.commonService.formatHeure(iso);
  }

  formatMontant(v: number): string {
    return `${(v ?? 0).toLocaleString('fr-FR')} ${this.commonService.deviseMonnetaire()}`;
  }

  getFactureStatutSeverity(s: string) {
    return this.commonService.getStatutSeverity(s, Entite.FACTURATION);
  }
  getModePaiementIcon(mode: string): string {
    return MODE_PAIEMENT_CONFIG[mode as ModePaiement]?.icon ?? 'pi-credit-card';
  }
}
