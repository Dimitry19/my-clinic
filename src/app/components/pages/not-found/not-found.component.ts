import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { SkeletonModule } from 'primeng/skeleton';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'clnt-not-found',
  standalone: true,
  imports: [CommonModule, ConfirmDialogModule, ToastModule, SkeletonModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
})
export class NotFoundComponent implements OnInit {
  ngOnInit() {}
}
