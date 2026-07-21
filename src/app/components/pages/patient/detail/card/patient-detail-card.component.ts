﻿import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TimelineModule } from 'primeng/timeline';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'clnt-patient-detail-card',
  standalone: true,
  imports: [CommonModule],
  providers: [],
  templateUrl: './patient-detail-card.component.html',
  styleUrls: ['./patient-detail-card.component.scss'],
})
export class PatientDetailCardComponent {
  displayValue = input<number>(0);
  label = input<string>('');
  iconClass = input<string>('');
  scClass = input<string>('');
}
