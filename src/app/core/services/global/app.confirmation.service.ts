import { Injectable, inject } from '@angular/core';
import { ConfirmationService, Confirmation } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class AppConfirmationService {
  private confirmation = inject(ConfirmationService);

  action(header: string, message: string, onAccept: () => void): void {
    this.confirmation.confirm({
      message,
      header,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
      accept: onAccept,
    });
  }

  confirm(message: string, header: string, onAccept: () => void): void {
    this.confirmation.confirm({
      message,
      header,
      icon: 'pi pi-question-circle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      acceptButtonStyleClass: 'p-button-primary',
      rejectButtonStyleClass: 'p-button-secondary p-button-outlined',
      accept: onAccept,
    });
  }
}
