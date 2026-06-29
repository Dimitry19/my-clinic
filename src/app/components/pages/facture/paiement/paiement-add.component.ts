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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';

import { FactureService } from '../../../../core/services/facture/facture.service';
import { PatientService } from '../../../../core/services/patient/patient.service';

import { CommonService } from '../../../../core/services/common.services';

import {
  Facture,
  PaiementRequest,
  ModePaiement,
  FACTURE_STATUT_CONFIG,
  MODE_PAIEMENT_CONFIG,
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
  selector: 'clnt-paiement-dialog',
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
  templateUrl: './paiement-add.component.html',
  styleUrls: ['./paiement-add.component.scss'],
})
export class PaiementAddComponent implements OnInit {
  // ───────────────────── inject ─────────────────────
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);
  private factureSvc = inject(FactureService);
  private patientSvc = inject(PatientService);
  private msg = inject(MessageService);
  private commonService = inject(CommonService);

  // ───────────────────── STATE ─────────────────────
  savingPaiement = signal(false);

  modePaiementOptions = Object.entries(MODE_PAIEMENT_CONFIG).map(
    ([value, cfg]) => ({
      label: cfg.label,
      value,
    }),
  );
  facture = input<Facture | null>(null);
  visible = model<boolean>(false);
  patient = signal<Patient | null>(null);

  save = output<PaiementRequest>();
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
  // ───────────────────── FORM ─────────────────────
  paiementForm = this.fb.group({
    montant: this.fb.control<number | null>(null, {
      validators: [Validators.required, Validators.min(0.01)],
    }),
    modePaiement: this.fb.control<string>('', Validators.required),
    reference: this.fb.control<string>(''),
    datePaiement: this.fb.control<string>(
      new Date().toISOString().slice(0, 16),
    ),
  });

  // ───────────────────── INIT ─────────────────────
  ngOnInit() {}

  // ───────────────────── API ─────────────────────

  close() {
    this.visible.set(false);
  }

  setFullAmount() {
    const f = this.facture();
    if (!f) return;

    this.paiementForm.controls.montant.setValue(f.resteAPayer);
  }

  // ───────────────────── UI ─────────────────────
  closeDialog() {
    this.showDialog.set(false);
    this.selectedFacture.set(null);
  }

  // ───────────────────── PAYMENT ─────────────────────
  submitPaiement() {
    if (this.paiementForm.invalid) return;

    this.saving.set(true);

    const req: PaiementRequest = {
      factureId: this.facture()!.id,
      montant: this.paiementForm.value.montant!,
      modePaiement: this.paiementForm.value.modePaiement as ModePaiement,
      reference: this.paiementForm.value.reference || null,
      datePaiement: this.paiementForm.value.datePaiement ?? undefined,
    };

    this.paiementForm.reset({
      datePaiement: new Date().toISOString().slice(0, 16),
    });
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
  paiementHasError(name: string): boolean {
    const c = this.paiementForm.get(name);
    return !!(c && (c.dirty || c.touched) && c.invalid);
  }

  paiementFieldError(name: string): string {
    const c = this.paiementForm.get(name);
    if (!c || (!c.dirty && !c.touched)) return '';
    if (c.errors?.['required']) return 'Ce champ est obligatoire.';
    if (c.errors?.['min'])
      return `Montant minimum : ${c.errors['min'].min} FCFA.`;
    return '';
  }

  formatMontant(v: number): string {
    return `${(v ?? 0).toLocaleString('fr-FR')} FCFA`;
  }

  getModePaiementLabel(mode: string): string {
    return MODE_PAIEMENT_CONFIG[mode as ModePaiement]?.label ?? mode;
  }

  getModePaiementIcon(mode: string): string {
    return MODE_PAIEMENT_CONFIG[mode as ModePaiement]?.icon ?? 'pi-credit-card';
  }
}
