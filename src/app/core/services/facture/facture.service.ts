import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.prod';

import { ApiResponse } from '../../models/response/api-response.model';
import { CommonService } from '../common.services';
import { Entite, StatutFacture } from '../../models/enums/enums.model';
import { Page } from '../../models/all/all.model';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  FactureRequest,
  PaiementRequest,
  FACTURE_STATUT_CONFIG,
  MODE_PAIEMENT_CONFIG,
  Facture,
} from '../../models/facture/facture.model';

@Injectable({ providedIn: 'root' })
export class FactureService {
  private http = inject(HttpClient);
  private commonSvc = inject(CommonService);
  private readonly base = `${environment.apiUrl}/factures`;

  findAll(
    page = 0,
    size = 20,
    statut?: StatutFacture,
  ): Observable<Page<Facture>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (statut) params = params.set('statut', statut);
    return this.http
      .get<ApiResponse<Page<Facture>>>(this.base, { params })
      .pipe(
        map((r) => r.data),
        catchError((e) => this.commonSvc.handleError(e, Entite.FACTURATION)),
      );
  }

  findByPatient(patientId: string, page = 0, size = 20) {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http
      .get<
        ApiResponse<Page<Facture>>
      >(`${this.base}/patient/${patientId}`, { params })
      .pipe(
        map((r) => r.data),
        catchError((e) => this.commonSvc.handleError(e, Entite.FACTURATION)),
      );
  }

  findById(id: string): Observable<Facture> {
    return this.http.get<ApiResponse<Facture>>(`${this.base}/${id}`).pipe(
      map((r) => r.data),
      catchError((e) => this.commonSvc.handleError(e, Entite.FACTURATION)),
    );
  }

  create(req: FactureRequest): Observable<Facture> {
    return this.http.post<ApiResponse<Facture>>(this.base, req).pipe(
      map((r) => r.data),
      catchError((e) => this.commonSvc.handleError(e, Entite.FACTURATION)),
    );
  }

  edit(id: string, req: FactureRequest): Observable<Facture> {
    return this.http.put<ApiResponse<Facture>>(`${this.base}/${id}`, req).pipe(
      map((r) => r.data),
      catchError((e) => this.commonSvc.handleError(e, Entite.FACTURATION)),
    );
  }

  changeStatut(id: string, statut: StatutFacture): Observable<Facture> {
    return this.http
      .patch<ApiResponse<Facture>>(`${this.base}/${id}/statut`, { statut })
      .pipe(
        map((r) => r.data),
        catchError((e) => this.commonSvc.handleError(e, Entite.FACTURATION)),
      );
  }

  ajouterPaiement(req: PaiementRequest): Observable<Facture> {
    return this.http
      .post<ApiResponse<Facture>>(`${this.base}/paiements`, req)
      .pipe(
        map((r) => r.data),
        catchError((e) => this.commonSvc.handleError(e, Entite.FACTURATION)),
      );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/${id}`).pipe(
      map((r) => r.data),
      catchError((e) => this.commonSvc.handleError(e, Entite.FACTURATION)),
    );
  }

  // ── Génération PDF ────────────────────────────────────────
  genererPdf(facture: Facture): void {
    const doc = new jsPDF();
    const primaryColor: [number, number, number] = [24, 95, 165];
    const successColor: [number, number, number] = [15, 110, 86];
    const dangerColor: [number, number, number] = [163, 45, 45];
    const textMuted: [number, number, number] = [95, 94, 90];
    const borderColor: [number, number, number] = [211, 209, 199];
    const pageWidth = doc.internal.pageSize.getWidth();
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
    doc.text('Centre Médical — Service de Facturation', 14, 19);

    doc.setFontSize(8);
    doc.text(
      `Imprimé le ${new Date().toLocaleDateString('fr-FR')}`,
      pageWidth - 14,
      19,
      { align: 'right' },
    );

    // ── Titre + numéro facture ────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...primaryColor);
    doc.text('FACTURE', pageWidth / 2, 40, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...textMuted);
    doc.text(facture.numeroFacture, pageWidth / 2, 47, { align: 'center' });

    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(14, 51, pageWidth - 14, 51);

    // ── Bloc patient + dates ──────────────────────────────
    let y = 59;
    doc.setFillColor(241, 239, 232);
    doc.roundedRect(14, y, pageWidth - 28, 30, 3, 3, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    doc.text('PATIENT', 18, y + 7);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(44, 44, 42);
    doc.text(facture.patientNom ?? '—', 18, y + 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...textMuted);
    doc.text(`N° patient : ${facture.patientId}`, 18, y + 24);

    // Droite — dates + statut
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    doc.text('FACTURATION', pageWidth / 2, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(44, 44, 42);
    doc.text(
      `Date : ${this.commonSvc.formatDate(facture.dateEmission)}`,
      pageWidth / 2,
      y + 14,
    );
    doc.text(
      `Statut : ${FACTURE_STATUT_CONFIG[facture.statut]?.label ?? facture.statut}`,
      pageWidth / 2,
      y + 21,
    );

    // ── Lignes de facture ─────────────────────────────────
    y += 38;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.text('DÉTAIL DES PRESTATIONS', 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      margin: { left: 14, right: 14 },
      head: [['Description', 'Qté', 'Prix unitaire', 'Total']],
      body: facture.lignes.map((l) => [
        l.description,
        l.quantite.toString(),
        `${l.prixUnitaire.toLocaleString('fr-FR')} FCFA`,
        `${l.total.toLocaleString('fr-FR')} FCFA`,
      ]),
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 85 },
        1: { halign: 'center', cellWidth: 15 },
        2: { halign: 'right', cellWidth: 40 },
        3: { halign: 'right', fontStyle: 'bold', cellWidth: 40 },
      },
      styles: {
        fontSize: 9,
        cellPadding: { top: 4, bottom: 4, left: 5, right: 5 },
        lineColor: borderColor,
        lineWidth: 0.3,
      },
      theme: 'grid',
    });

    // ── Totaux ────────────────────────────────────────────
    y = (doc as any).lastAutoTable.finalY + 4;

    const totauxData: [string, string][] = [
      ['Montant total', `${facture.montantTotal.toLocaleString('fr-FR')} FCFA`],
      ['Montant payé', `${facture.montantPaye.toLocaleString('fr-FR')} FCFA`],
      ['Reste à payer', `${facture.resteAPayer.toLocaleString('fr-FR')} FCFA`],
    ];

    autoTable(doc, {
      startY: y,
      margin: { left: pageWidth / 2, right: 14 },
      head: [],
      body: totauxData,
      columnStyles: {
        0: {
          fontStyle: 'bold',
          fillColor: [241, 239, 232],
          textColor: textMuted,
          cellWidth: 45,
        },
        1: { halign: 'right', fontStyle: 'bold', textColor: [44, 44, 42] },
      },
      didParseCell: (data: any) => {
        // Mettre le reste à payer en rouge si > 0
        if (
          data.row.index === 2 &&
          facture.resteAPayer > 0 &&
          data.column.index === 1
        ) {
          data.cell.styles.textColor = dangerColor;
        }
        // Mettre le total en vert si payé
        if (
          data.row.index === 2 &&
          facture.resteAPayer === 0 &&
          data.column.index === 1
        ) {
          data.cell.styles.textColor = successColor;
        }
      },
      styles: {
        fontSize: 9,
        cellPadding: { top: 4, bottom: 4, left: 6, right: 6 },
        lineColor: borderColor,
        lineWidth: 0.3,
      },
      theme: 'grid',
    });

    // ── Paiements ─────────────────────────────────────────
    if (facture.paiements?.length) {
      y = (doc as any).lastAutoTable.finalY + 10;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...primaryColor);
      doc.text('HISTORIQUE DES PAIEMENTS', 14, y);
      y += 4;

      autoTable(doc, {
        startY: y,
        margin: { left: 14, right: 14 },
        head: [['Date', 'Mode', 'Référence', 'Montant', 'Encaissé par']],
        body: facture.paiements.map((p) => [
          this.commonSvc.formatDate(p.datePaiement),
          MODE_PAIEMENT_CONFIG[p.modePaiement]?.label ?? p.modePaiement,
          p.reference || '—',
          `${p.montant.toLocaleString('fr-FR')} FCFA`,
          p.encaisseParNom || '—',
        ]),
        headStyles: {
          fillColor: successColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 9,
        },
        styles: {
          fontSize: 9,
          cellPadding: { top: 4, bottom: 4, left: 5, right: 5 },
          lineColor: borderColor,
          lineWidth: 0.3,
        },
        theme: 'grid',
      });
    }

    // ── Notes ─────────────────────────────────────────────
    if (facture.notes) {
      y = (doc as any).lastAutoTable.finalY + 8;
      autoTable(doc, {
        startY: y,
        margin: { left: 14, right: 14 },
        head: [['Notes']],
        body: [[facture.notes]],
        headStyles: {
          fillColor: [241, 239, 232],
          textColor: textMuted,
          fontSize: 8,
        },
        styles: {
          fontSize: 9,
          fontStyle: 'italic',
          cellPadding: { top: 4, bottom: 4, left: 6, right: 6 },
          lineColor: borderColor,
          lineWidth: 0.3,
        },
        theme: 'grid',
      });
    }

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

    doc.save(
      `facture-${facture.numeroFacture}-${new Date().toISOString().slice(0, 10)}.pdf`,
    );
  }
}
