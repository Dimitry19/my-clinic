import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';

import { Page } from '../../models/all/all.model';
import { environment } from '../../../../environments/environment.prod';
import {
  ExamenLabo,
  ExamenLaboRequest,
} from '../../models/laboratoire/laboratoire.model';
import { Entite } from '../../models/enums/enums.model';
import { CommonService } from '../common.services';
import { ApiResponse } from '../../models/response/api-response.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ResultatLabo } from '../../models/laboratoire/resultat.labo.model';

@Injectable({ providedIn: 'root' })
export class ExamenLaboService {
  private http = inject(HttpClient);
  private commonService = inject(CommonService);
  private readonly base = `${environment.apiUrl}/laboratoire`;

  findAll(page = 0, size = 20) {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http
      .get<ApiResponse<Page<ExamenLabo>>>(`${this.base}/all`, { params })
      .pipe(
        map((r) => r.data),
        catchError((e) =>
          this.commonService.handleError(e, Entite.LABORATOIRE),
        ),
      );
  }
  findByPatient(patientId: string, page = 0, size = 20) {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http
      .get<
        ApiResponse<Page<ExamenLabo>>
      >(`${this.base}/patient/${patientId}`, { params })
      .pipe(
        map((r) => r.data),
        catchError((e) =>
          this.commonService.handleError(e, Entite.LABORATOIRE),
        ),
      );
  }

  findByConsultation(consultationId: string): Observable<ExamenLabo[]> {
    return this.http
      .get<
        ApiResponse<ExamenLabo[]>
      >(`${this.base}/consultation/${consultationId}`)
      .pipe(
        map((r) => r.data),
        catchError((e) =>
          this.commonService.handleError(e, Entite.LABORATOIRE),
        ),
      );
  }

  findById(id: string): Observable<ExamenLabo> {
    return this.http.get<ApiResponse<ExamenLabo>>(`${this.base}/${id}`).pipe(
      map((r) => r.data),
      catchError((e) => this.commonService.handleError(e, Entite.LABORATOIRE)),
    );
  }

  create(req: ExamenLaboRequest): Observable<ExamenLabo> {
    return this.http.post<ApiResponse<ExamenLabo>>(this.base, req).pipe(
      map((r) => r.data),
      catchError((e) => this.commonService.handleError(e, Entite.LABORATOIRE)),
    );
  }

  edit(id: string, req: ExamenLaboRequest): Observable<ExamenLabo> {
    return this.http
      .put<ApiResponse<ExamenLabo>>(`${this.base}/${id}`, req)
      .pipe(
        map((r) => r.data),
        catchError((e) =>
          this.commonService.handleError(e, Entite.LABORATOIRE),
        ),
      );
  }

  changeStatut(id: string, statut: string): Observable<ExamenLabo> {
    return this.http
      .patch<ApiResponse<ExamenLabo>>(`${this.base}/${id}/statut`, { statut })
      .pipe(
        map((r) => r.data),
        catchError((e) =>
          this.commonService.handleError(e, Entite.LABORATOIRE),
        ),
      );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`).pipe(
      map((r) => r.data),
      catchError((e) => this.commonService.handleError(e, Entite.LABORATOIRE)),
    );
  }

  genererRapportPdf(
    examen: ExamenLabo & { resultat?: ResultatLabo | null },
  ): void {
   

    const doc = new jsPDF();
    const primaryColor: [number, number, number] = [24, 95, 165];
    const textMuted: [number, number, number] = [95, 94, 90];
    const borderColor: [number, number, number] = [211, 209, 199];
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // ── En-tête ────────────────────────────────────────────
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 28, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('Clinique Trinité', 14, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(200, 220, 245);
    doc.text('Centre Médical — Service de Laboratoire', 14, 19);

    doc.setFontSize(8);
    doc.setTextColor(200, 220, 245);
    const datePrint = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    doc.text(`Imprimé le ${datePrint}`, pageWidth - 14, 19, { align: 'right' });

    // ── Titre ──────────────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...primaryColor);
    doc.text("RAPPORT D'EXAMEN DE LABORATOIRE", pageWidth / 2, 40, {
      align: 'center',
    });

    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(14, 44, pageWidth - 14, 44);

    // ── Bloc Patient ───────────────────────────────────────
    let y = 52;

    doc.setFillColor(241, 239, 232);
    doc.roundedRect(14, y, pageWidth - 28, 28, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...primaryColor);
    doc.text('PATIENT', 18, y + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(44, 44, 42);
    doc.text(examen.patientNom ?? '—', 18, y + 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...textMuted);
    doc.text(`N° dossier : ${examen.patientId}`, pageWidth / 2, y + 7);
    doc.text(
      `Prescrit par : ${examen.prescritParNom ?? '—'}`,
      pageWidth / 2,
      y + 14,
    );
    doc.text(
      `Date prescription : ${this.commonService.formatDate(examen.datePrescription)}`,
      pageWidth / 2,
      y + 21,
    );

    // ── Bloc Examen ────────────────────────────────────────
    y += 36;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.text("INFORMATIONS DE L'EXAMEN", 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      head: [],
      body: [
        ["Type d'examen", examen.typeExamen ?? '—'],
        [
          'Statut',
          this.commonService.getStatutLabel(examen.statut, Entite.LABORATOIRE),
        ],
        [
          'Date de prescription',
          this.commonService.formatDate(examen.datePrescription),
        ],
        [
          'Date du résultat',
          examen.dateResultat
            ? this.commonService.formatDate(examen.dateResultat)
            : 'En attente',
        ],
        ['Prescrit par', examen.prescritParNom ?? '—'],
      ],
      columnStyles: {
        0: {
          fontStyle: 'bold',
          cellWidth: 55,
          fillColor: [241, 239, 232],
          textColor: textMuted,
        },
        1: { textColor: [44, 44, 42] },
      },
      styles: {
        fontSize: 9,
        cellPadding: { top: 4, bottom: 4, left: 6, right: 6 },
        lineColor: borderColor,
        lineWidth: 0.3,
      },
      theme: 'grid',
    });

    // ── Bloc Description ───────────────────────────────────
    y = (doc as any).lastAutoTable.finalY + 8;

    if (examen.description) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...primaryColor);
      doc.text('CONTEXTE CLINIQUE / DESCRIPTION', 14, y);
      y += 4;

      autoTable(doc, {
        startY: y,
        margin: { left: 14, right: 14 },
        head: [],
        body: [[examen.description]],
        styles: {
          fontSize: 9,
          cellPadding: { top: 5, bottom: 5, left: 6, right: 6 },
          textColor: [44, 44, 42],
          lineColor: borderColor,
          lineWidth: 0.3,
        },
        theme: 'grid',
      });

      y = (doc as any).lastAutoTable.finalY + 8;
    }

    // ── Bloc Résultats ─────────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.text('RÉSULTATS', 14, y);
    y += 4;

    if (examen.statut === 'TERMINE' && examen.resultat?.parametres?.length) {
      autoTable(doc, {
        startY: y,
        margin: { left: 14, right: 14 },
        head: [['Paramètre', 'Valeur', 'Unité', 'Norme', 'État']],
        body: examen.resultat.parametres.map((p) => [
          p.libelle,
          p.valeur,
          p.unite || '—',
          p.norme || '—',
          p.anormal ? 'ANORMAL' : 'Normal',
        ]),
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
        },
        bodyStyles: { fontSize: 9 },
        didParseCell: (data: any) => {
          if (data.section === 'body') {
            const param = examen.resultat!.parametres[data.row.index];
            if (param?.anormal) {
              data.cell.styles.textColor = [163, 45, 45]; // $danger
              data.cell.styles.fontStyle = 'bold';
            }
          }
        },
        styles: {
          cellPadding: { top: 4, bottom: 4, left: 6, right: 6 },
          lineColor: borderColor,
          lineWidth: 0.3,
        },
        theme: 'grid',
      });

      // Interprétation
      if (examen.resultat.interpretation) {
        y = (doc as any).lastAutoTable.finalY + 6;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...textMuted);
        doc.text('INTERPRÉTATION :', 14, y);
        y += 4;

        autoTable(doc, {
          startY: y,
          margin: { left: 14, right: 14 },
          head: [],
          body: [[examen.resultat.interpretation]],
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
    } else {
      autoTable(doc, {
        startY: y,
        margin: { left: 14, right: 14 },
        head: [],
        body: [['Résultats en attente — examen non encore terminé.']],
        styles: {
          fontSize: 9,
          cellPadding: { top: 6, bottom: 6, left: 6, right: 6 },
          textColor: textMuted,
          fontStyle: 'italic',
          lineColor: borderColor,
          lineWidth: 0.3,
        },
        theme: 'grid',
      });
    }

    // ── Zone de signature ──────────────────────────────────
    y = (doc as any).lastAutoTable.finalY + 16;

    if (y > pageHeight - 50) {
      doc.addPage();
      y = 20;
    }

    const sigWidth = 70;
    const sigX = pageWidth - 14 - sigWidth;

    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.line(sigX, y, sigX + sigWidth, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text('Signature et cachet du médecin', sigX + sigWidth / 2, y + 5, {
      align: 'center',
    });
    doc.text(examen.prescritParNom ?? '—', sigX + sigWidth / 2, y + 11, {
      align: 'center',
    });

    // ── Pied de page ──────────────────────────────────────
    doc.setFillColor(...primaryColor);
    doc.rect(0, pageHeight - 12, pageWidth, 12, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(
      'Clinique Trinité — Document confidentiel à usage médical uniquement',
      pageWidth / 2,
      pageHeight - 5,
      { align: 'center' },
    );

    // ── Téléchargement ─────────────────────────────────────
    const fileName = `rapport-examen-${examen.typeExamen.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  }
}
