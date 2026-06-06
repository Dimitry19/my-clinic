import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { AvatarModule } from 'primeng/avatar';
import { ConfirmationService, MessageService } from 'primeng/api';

import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { PatientService } from '../../../core/services/patient/patient.service';
import { Patient, Page } from '../../../core/models/all/all.model';

@Component({
  selector: 'clnt-patients',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
    SkeletonModule,
    AvatarModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './patients.component.html',
  styleUrls: ['./patients.component.scss'],
})
export class PatientsComponent implements OnInit {
  private patientService = inject(PatientService);
  private confirmService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  patients = signal<Patient[]>([]);
  page = signal<Page<Patient> | null>(null);
  loading = signal(true);
  searchQuery = '';
  pageSize = 20;

  private search$ = new Subject<string>();

  ngOnInit() {
    this.load(0);
    this.search$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q) => this.patientService.findAll(0, this.pageSize, q)),
      )
      .subscribe((p) => {
        this.page.set(p);
        this.patients.set(p.content);
        this.loading.set(false);
      });
  }

  load(page: number, search = '') {
    this.loading.set(true);
    this.patientService.findAll(page, this.pageSize, search).subscribe((p) => {
      this.page.set(p);
      this.patients.set(p.content);
      this.loading.set(false);
    });
  }

  onLazyLoad(event: any) {
    this.load(event.first / this.pageSize, this.searchQuery);
  }
  onSearch(q: string) {
    this.search$.next(q);
  }
  clearSearch() {
    this.searchQuery = '';
    this.load(0);
  }

  confirmerSuppression(patient: Patient) {
    this.confirmService.confirm({
      message: `Supprimer le patient ${patient.prenom} ${patient.nom} ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.patientService.supprimer(patient.id).subscribe(() => {
          this.messageService.add({
            severity: 'success',
            summary: 'Supprimé',
            detail: 'Patient supprimé.',
          });
          this.load(0, this.searchQuery);
        });
      },
    });
  }

  getStatutSeverity(s: string) {
    return (
      {
        EN_ATTENTE: 'warn',
        EN_COURS: 'info',
        TERMINE: 'success',
        ANNULE: 'danger',
      }[s] ?? 'secondary'
    );
  }

  getAvatarStyle(sexe: string) {
    return sexe === 'M'
      ? { background: '#E6F1FB', color: '#0C447C' }
      : sexe === 'F'
        ? { background: '#FAEEDA', color: '#633806' }
        : { background: '#EEEDFE', color: '#26215C' };
  }
}
