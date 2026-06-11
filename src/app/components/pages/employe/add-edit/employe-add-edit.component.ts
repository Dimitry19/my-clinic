import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'clnt-employe-add-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './employe-add-edit.component.html',
  styleUrls: ['./employe-add-edit.component.scss'],
})
export class EmployeAddEditComponent {}
