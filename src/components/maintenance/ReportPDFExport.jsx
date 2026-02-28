import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Loader2, FileText } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import jsPDF from 'jspdf';
import { ALL_ITEMS } from './ComponentChecklist';

async function loadImageAsBase64(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function ReportPDFExport({ report }) {
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');

  const generatePDF = async () => {
    setLoading(true);
    setShowDialog(false);

    // Load template + all images in parallel
    const [templateResult, ...imageResults] = await Promise.allSettled([
      base44.entities.ReportTemplate.filter({ is_default: true }, '-created_date', 1),
      ...( report.photo_entries?.map(e => loadImageAsBase64(e.url)) || [] ),
      report.signature_url ? loadImageAsBase64(report.signature_url) : Promise.resolve(null),
      report.company_logo_url ? loadImageAsBase64(report.company_logo_url) : Promise.resolve(null),
    ]);

    let template = null;
    if (templateResult.status === 'fulfilled' && templateResult.value?.length > 0) {
      template = templateResult.value[0];
    }

    // Pre-loaded images map
    const photoCount = report.photo_entries?.length || 0;
    const photoImages = imageResults.slice(0, photoCount).map(r => r.status === 'fulfilled' ? r.value : null);
    const signatureImage = imageResults[photoCount]?.status === 'fulfilled' ? imageResults[photoCount].value : null;
    const logoUrl = template?.company_logo_url || '';
    let logoImage = null;
    if (logoUrl) {
      try { logoImage = await loadImageAsBase64(logoUrl); } catch {}
    }

    const headerColor = template?.header_color || '#2563eb';
    const reportTitle = template?.report_title || 'MineProtect CAS10 FMS - Mantención Equipos Pesados';
    const companyName = template?.company_name || '';
    const division = template?.division || '';
    const documentCode = template?.document_code || '';

    const hexToRgb = (hex) => [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ];
    const [hr, hg, hb] = hexToRgb(headerColor);

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = 210;
    const pageH = 297;
    const margin = 14;
    const contentW = pageW - margin * 2;
    const footerH = 12;
    const maxY = pageH - footerH - 6;
    let y = 0;

    // ── Draw Header ──────────────────────────────────────────────
    const drawHeader = () => {
      const headerBgH = 30;
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageW, headerBgH + 10, 'F');
      doc.setDrawColor(hr, hg, hb);
      doc.setLineWidth(1.2);
      doc.line(0, 0, pageW, 0);

      if (logoImage) {
        doc.addImage(logoImage, 'JPEG', margin, 4, 35, 18);
      } else if (companyName) {
        doc.setFontSize(13);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text(companyName, margin, 14);
      }

      if (division || documentCode) {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        if (division) doc.text(division, pageW - margin, 10, { align: 'right' });
        if (documentCode) doc.text(documentCode, pageW - margin, 17, { align: 'right' });
      }

      y = headerBgH;
      doc.setDrawColor(hr, hg, hb);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageW - margin, y);
      y += 6;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(hr, hg, hb);
      doc.text(reportTitle, margin, y);
      y += 10;
    };

    // ── Draw Footer ──────────────────────────────────────────────
    const drawFooter = (pageNum, totalPages) => {
      const fy = pageH - footerH;
      doc.setDrawColor(200, 210, 220);
      doc.setLineWidth(0.3);
      doc.line(margin, fy, pageW - margin, fy);

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(140, 140, 140);
      doc.text(`Generado: ${new Date().toLocaleDateString('es-CL')}`, margin, fy + 5);
      doc.text(`Página ${pageNum} de ${totalPages}`, pageW / 2, fy + 5, { align: 'center' });
      if (companyName) doc.text(companyName, pageW - margin, fy + 5, { align: 'right' });
    };

    const addPageIfNeeded = (neededHeight = 20) => {
      if (y + neededHeight > maxY) {
        doc.addPage();
        drawHeader();
      }
    };

    // ── Section title ─────────────────────────────────────────────
    const sectionTitle = (title) => {
      addPageIfNeeded(12);
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(hr, hg, hb);
      doc.text(title, margin, y);
      y += 2;
      doc.setDrawColor(hr, hg, hb);
      doc.setLineWidth(0.4);
      doc.line(margin, y, margin + contentW, y);
      y += 5;
      doc.setTextColor(30, 30, 30);
    };

    // ── Info rows ─────────────────────────────────────────────────
    const labelColW = 65;
    const valueColX = margin + labelColW;
    const rowH = 8;
    let rowIndex = 0;
    const resetRowIndex = () => { rowIndex = 0; };

    const infoRow = (label, value) => {
      if (!value) return;
      addPageIfNeeded(rowH + 2);
      doc.setFillColor(rowIndex % 2 === 0 ? 245 : 255, rowIndex % 2 === 0 ? 247 : 255, rowIndex % 2 === 0 ? 250 : 255);
      doc.setDrawColor(200, 210, 220);
      doc.setLineWidth(0.2);
      doc.rect(margin, y, contentW, rowH, 'FD');
      doc.line(valueColX, y, valueColX, y + rowH);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(50, 50, 50);
      doc.text(label, margin + 2, y + 5.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(20, 20, 20);
      const lines = doc.splitTextToSize(String(value), contentW - labelColW - 4);
      doc.text(lines, valueColX + 3, y + 5.5);
      y += rowH;
      rowIndex++;
    };

    // ── Component table ───────────────────────────────────────────
    const componentTable = (values = {}, title) => {
      const hasAny = ALL_ITEMS.some(item => values[item] !== undefined);
      if (!hasAny) return;
      addPageIfNeeded(20);
      sectionTitle(title);
      const lblW = contentW - 25;
      const valX = margin + lblW + 2;
      ALL_ITEMS.forEach((item) => {
        const val = values[item];
        const llines = doc.splitTextToSize(item, lblW - 4);
        const rH = llines.length * 4.5 + 2;
        addPageIfNeeded(rH + 2);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(220, 220, 230);
        doc.setLineWidth(0.2);
        doc.rect(margin, y - 3.5, contentW, rH, 'FD');
        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 40, 40);
        doc.text(llines, margin + 2, y);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(val ? 22 : 220, val ? 163 : 38, val ? 74 : 38);
        doc.text(val ? 'Yes' : 'No', valX, y);
        y += rH;
      });
      y += 5;
    };

    // ══ BUILD PDF ═════════════════════════════════════════════════
    drawHeader();

    sectionTitle('Información General');
    resetRowIndex();
    infoRow('Empresa', report.empresa);
    infoRow('División', report.division);
    infoRow('Tipo de mantención', report.type);
    infoRow('Tipo de equipo', report.tipo_equipo);
    infoRow('N° interno equipo', report.numero_interno_equipo);
    infoRow('Fecha mantención', report.report_date);
    infoRow('Fecha próxima mantención', report.fecha_proxima_mantencion);
    infoRow('Hora inicio', report.hora_inicio);
    infoRow('Hora fin', report.hora_fin);
    infoRow('Responsable', report.responsable);
    y += 4;

    if (report.cas_series?.antena_qc1000 || report.cas_series?.pantalla_qd1400) {
      sectionTitle('CAS Números de Series');
      resetRowIndex();
      infoRow('Antena QC1000', report.cas_series?.antena_qc1000);
      infoRow('Pantalla QD1400/QD200', report.cas_series?.pantalla_qd1400);
      y += 4;
    }

    if (report.fms_series?.core_lp || report.fms_series?.pantalla || report.fms_series?.gps1) {
      sectionTitle('FMS Números de Series');
      resetRowIndex();
      infoRow('Core LP', report.fms_series?.core_lp);
      infoRow('Pantalla', report.fms_series?.pantalla);
      infoRow('GPS 1', report.fms_series?.gps1);
      y += 4;
    }

    componentTable(report.componentes_pre, 'Componentes Operativos Pre-mantención');
    componentTable(report.componentes_post, 'Componentes Operativos Post-mantención');

    // Photos (pre-loaded)
    if (report.photo_entries?.length > 0) {
      addPageIfNeeded(20);
      sectionTitle('Fotografía de Componentes');
      report.photo_entries.forEach((entry, i) => {
        addPageIfNeeded(65);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 40, 40);
        doc.text(entry.label, margin, y);
        y += 3;
        if (photoImages[i]) {
          doc.addImage(photoImages[i], 'JPEG', margin, y, 80, 55);
        } else {
          doc.setFontSize(8);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(150, 150, 150);
          doc.text('[Imagen no disponible]', margin, y + 10);
        }
        y += 60;
      });
      y += 4;
    }

    if (report.location) {
      addPageIfNeeded(15);
      sectionTitle('Ubicación GPS');
      resetRowIndex();
      infoRow('Coordenadas', `${report.location.lat?.toFixed(5)}, ${report.location.lng?.toFixed(5)}`);
      if (report.location.accuracy) infoRow('Precisión', `${Math.round(report.location.accuracy)} m`);
      y += 4;
    }

    if (report.observations) {
      addPageIfNeeded(15);
      sectionTitle('Observaciones');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);
      const obsLines = doc.splitTextToSize(report.observations, contentW);
      doc.text(obsLines, margin, y);
      y += obsLines.length * 5 + 4;
    }

    // Additional Notes (custom field)
    if (additionalNotes.trim()) {
      addPageIfNeeded(15);
      sectionTitle('Notas Adicionales');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);
      const noteLines = doc.splitTextToSize(additionalNotes.trim(), contentW);
      doc.text(noteLines, margin, y);
      y += noteLines.length * 5 + 4;
    }

    if (signatureImage) {
      addPageIfNeeded(40);
      sectionTitle('Firma Digital');
      doc.addImage(signatureImage, 'PNG', margin, y, 70, 28);
      y += 32;
    }

    // Add footers to all pages
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      drawFooter(i, totalPages);
    }

    const filename = `informe_${report.tipo_equipo || 'mantencion'}_${report.numero_interno_equipo || ''}_${report.report_date || ''}.pdf`.replace(/\s+/g, '_');
    doc.save(filename);
    setLoading(false);
  };

  return (
    <>
      <Button onClick={() => setShowDialog(true)} disabled={loading} variant="outline" className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        {loading ? 'Generando PDF...' : 'Descargar PDF'}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Exportar PDF
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-slate-700">Notas Adicionales (opcional)</Label>
              <Textarea
                placeholder="Añade notas adicionales que aparecerán al final del informe..."
                value={additionalNotes}
                onChange={e => setAdditionalNotes(e.target.value)}
                className="mt-1.5 h-28 resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
              <Button onClick={generatePDF} className="bg-blue-600 hover:bg-blue-700 gap-2">
                <Download className="w-4 h-4" /> Generar PDF
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}