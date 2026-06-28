import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';
import { Ordonnance, OrdonnanceRequest } from '../../models/ordonnance/ordonnance.model';
import { ApiResponse } from '../../models/response/api-response.model';
import { CommonService } from '../common.services';
import { Entite } from '../../models/enums/enums.model';
import { Page } from '../../models/all/all.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({ providedIn: 'root' })
export class OrdonnanceService {

  private http      = inject(HttpClient);
  private commonSvc = inject(CommonService);
  private readonly base = `${environment.apiUrl}/ordonnances`;

  findAll(page = 0, size = 20): Observable<Page<Ordonnance>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<ApiResponse<Page<Ordonnance>>>(this.base, { params }).pipe(
      map((r) => r.data),
      catchError((e) => this.commonSvc.handleError(e, Entite.ORDONNANCE)),
    );
  }

  findByPatient(patientId: string): Observable<Ordonnance[]> {
    return this.http
      .get<ApiResponse<Ordonnance[]>>(`${this.base}/patient/${patientId}`)
      .pipe(
        map((r) => r.data),
        catchError((e) => this.commonSvc.handleError(e, Entite.ORDONNANCE)),
      );
  }

  findByConsultation(consultationId: string): Observable<Ordonnance[]> {
    return this.http
      .get<ApiResponse<Ordonnance[]>>(`${this.base}/consultation/${consultationId}`)
      .pipe(
        map((r) => r.data),
        catchError((e) => this.commonSvc.handleError(e, Entite.ORDONNANCE)),
      );
  }

  findById(id: string): Observable<Ordonnance> {
    return this.http.get<ApiResponse<Ordonnance>>(`${this.base}/${id}`).pipe(
      map((r) => r.data),
      catchError((e) => this.commonSvc.handleError(e, Entite.ORDONNANCE)),
    );
  }

  create(req: OrdonnanceRequest): Observable<Ordonnance> {
    return this.http.post<ApiResponse<Ordonnance>>(this.base, req).pipe(
      map((r) => r.data),
      catchError((e) => this.commonSvc.handleError(e, Entite.ORDONNANCE)),
    );
  }

  edit(id: string, req: OrdonnanceRequest): Observable<Ordonnance> {
    return this.http.put<ApiResponse<Ordonnance>>(`${this.base}/${id}`, req).pipe(
      map((r) => r.data),
      catchError((e) => this.commonSvc.handleError(e, Entite.ORDONNANCE)),
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`).pipe(
      map((r) => r.data),
      catchError((e) => this.commonSvc.handleError(e, Entite.ORDONNANCE)),
    );
  }

  // ── Génération PDF ───────────────────────────────────────
  genererPdf(ordonnance: Ordonnance): void {
    const doc = new jsPDF();
    const primaryColor: [number, number, number] = [24, 95, 165];
    const successColor: [number, number, number] = [15, 110, 86];
    const textMuted:    [number, number, number] = [95, 94, 90];
    const borderColor:  [number, number, number] = [211, 209, 199];
    const dangerColor:  [number, number, number] = [163, 45, 45];
    const pageWidth  = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // ── En-tête ───────────────────────────────────────────
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 28, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('Clinique Trinité', 14, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(200, 220, 245);
    doc.text('Centre Médical — Service des Ordonnances', 14, 19);

    const datePrint = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
    doc.setFontSize(8);
    doc.text(`Imprimé le ${datePrint}`, pageWidth - 14, 19, { align: 'right' });

    // ── Titre ─────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text('ORDONNANCE MÉDICALE', pageWidth / 2, 40, { align: 'center' });

    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(14, 44, pageWidth - 14, 44);

    // ── Bloc patient + médecin ────────────────────────────
    let y = 52;
    doc.setFillColor(241, 239, 232);
    doc.roundedRect(14, y, pageWidth - 28, 32, 3, 3, 'F');

    // Colonne gauche — patient
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    doc.text('PATIENT', 18, y + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(44, 44, 42);
    doc.text(ordonnance.patientNom ?? '—', 18, y + 16);

    // Colonne droite — médecin
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    doc.text('MÉDECIN PRESCRIPTEUR', pageWidth / 2, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(44, 44, 42);
    doc.text(ordonnance.medecinNom ?? '—', pageWidth / 2, y + 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text(
      `Émise le ${this.commonSvc.formatDate(ordonnance.dateEmission)} — Valide ${ordonnance.validiteJours} jours`,
      pageWidth / 2, y + 23,
    );

    // ── Médicaments ───────────────────────────────────────
    y += 40;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.text('MÉDICAMENTS PRESCRITS', 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      head: [['Médicament', 'Dosage', 'Fréquence', 'Durée', 'Instructions']],
      body: ordonnance.medicaments.map((m) => [
        m.medicamentNom,
        m.dosage   || '—',
        m.frequence || '—',
        m.duree    || '—',
        m.instructions || '—',
      ]),
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 45 },
        4: { cellWidth: 40, fontSize: 8 },
      },
      styles: {
        fontSize: 9,
        cellPadding: { top: 4, bottom: 4, left: 5, right: 5 },
        lineColor: borderColor,
        lineWidth: 0.3,
      },
      theme: 'grid',
    });

    // ── Instructions générales ────────────────────────────
    if (ordonnance.instructions) {
      y = (doc as any).lastAutoTable.finalY + 8;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...primaryColor);
      doc.text('INSTRUCTIONS GÉNÉRALES', 14, y);
      y += 4;

      autoTable(doc, {
        startY: y,
        margin: { left: 14, right: 14 },
        head: [],
        body: [[ordonnance.instructions]],
        styles: {
          fontSize: 9,
          cellPadding: { top: 5, bottom: 5, left: 6, right: 6 },
          textColor: [44, 44, 42],
          fontStyle: 'italic',
          lineColor: borderColor,
          lineWidth: 0.3,
        },
        theme: 'grid',
      });
    }

    // ── Signature médecin ─────────────────────────────────
    y = (doc as any).lastAutoTable.finalY + 20;
    if (y > pageHeight - 50) { doc.addPage(); y = 20; }

    const sigWidth = 70;
    const sigX = pageWidth - 14 - sigWidth;

    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.line(sigX, y, sigX + sigWidth, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text('Signature et cachet du médecin', sigX + sigWidth / 2, y + 5, { align: 'center' });
    doc.text(ordonnance.medecinNom ?? '—', sigX + sigWidth / 2, y + 11, { align: 'center' });

    // ── Avertissement validité ────────────────────────────
    if (ordonnance.expiree) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...dangerColor);
      doc.text('⚠ Cette ordonnance est expirée', 14, y + 5);
    }

    // ── Pied de page ──────────────────────────────────────
    doc.setFillColor(...primaryColor);
    doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(
      'Clinique Trinité — Document confidentiel à usage médical uniquement',
      pageWidth / 2, pageHeight - 5,
      { align: 'center' },
    );

    const fileName = `ordonnance-${ordonnance.patientNom.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  }
}