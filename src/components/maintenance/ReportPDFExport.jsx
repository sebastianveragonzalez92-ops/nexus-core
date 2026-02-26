import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import { ALL_ITEMS } from './ComponentChecklist';

export default function ReportPDFExport({ report }) {
  const [loading, setLoading] = useState(false);

  const generatePDF = async () => {
    setLoading(true);

    // Load default template if any
    let template = null;
    try {
      const templates = await base44.entities.ReportTemplate.filter({ is_default: true }, '-created_date', 1);
      if (templates.length > 0) template = templates[0];
    } catch {}

    const headerColor = template?.header_color || '#2563eb';
    const reportTitle = template?.report_title || 'MineProtect CAS10 FMS - Mantención Equipos Pesados';
    const companyName = template?.company_name || '';
    const division = template?.division || '';
    const documentCode = template?.document_code || '';
    const logoUrl = template?.company_logo_url || '';

    // Parse hex color to RGB
    const hexToRgb = (hex) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return [r, g, b];
    };
    const [hr, hg, hb] = hexToRgb(headerColor);

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = 210;
    const margin = 14;
    const contentW = pageW - margin * 2;
    let y = 14;

    const addPageIfNeeded = (neededHeight = 20) => {
      if (y + neededHeight > 280) {
        doc.addPage();
        y = 14;
      }
    };

    // Header - white background with logo on left, company info on right, title below
    const headerBgH = 28;
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageW, headerBgH + 12, 'F');

    // Top border line with header color
    doc.setDrawColor(hr, hg, hb);
    doc.setLineWidth(1);
    doc.line(0, 0, pageW, 0);

    // Logo or company name on the left
    if (logoUrl) {
      try {
        const logoData = await loadImageAsBase64(logoUrl);
        doc.addImage(logoData, 'JPEG', margin, 4, 35, 18);
      } catch {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text(companyName || 'Empresa', margin, 14);
      }
    } else if (companyName) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 30);
      doc.text(companyName, margin, 14);
    }

    // Right side: division + document code
    if (division || documentCode) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      if (division) doc.text(division, pageW - margin, 10, { align: 'right' });
      if (documentCode) doc.text(documentCode, pageW - margin, 16, { align: 'right' });
    }

    // Separator line
    y = headerBgH;
    doc.setDrawColor(hr, hg, hb);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += 6;

    // Report title in header color
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(hr, hg, hb);
    doc.text(reportTitle, margin, y);
    y += 10;

    // Section helper
    const sectionTitle = (title) => {
      addPageIfNeeded(12);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235);
      doc.text(title, margin, y);
      y += 2;
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.4);
      doc.line(margin, y, margin + contentW, y);
      y += 5;
      doc.setTextColor(30, 30, 30);
    };

    const infoRow = (label, value) => {
      if (!value) return;
      addPageIfNeeded(8);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 80);
      doc.text(label + ':', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(20, 20, 20);
      const lines = doc.splitTextToSize(String(value), contentW - 55);
      doc.text(lines, margin + 55, y);
      y += lines.length * 5 + 1;
    };

    // --- Info General ---
    sectionTitle('Información General');
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

    // --- CAS Series ---
    if (report.cas_series?.antena_qc1000 || report.cas_series?.pantalla_qd1400) {
      sectionTitle('CAS Números de Series');
      infoRow('Antena QC1000', report.cas_series?.antena_qc1000);
      infoRow('Pantalla QD1400/QD200', report.cas_series?.pantalla_qd1400);
      y += 4;
    }

    // --- FMS Series ---
    if (report.fms_series?.core_lp || report.fms_series?.pantalla || report.fms_series?.gps1) {
      sectionTitle('FMS Números de Series');
      infoRow('Core LP', report.fms_series?.core_lp);
      infoRow('Pantalla', report.fms_series?.pantalla);
      infoRow('GPS 1', report.fms_series?.gps1);
      y += 4;
    }

    // --- Component Tables ---
    const componentTable = (values = {}, title) => {
      const hasAny = ALL_ITEMS.some(item => values[item] !== undefined);
      if (!hasAny) return;
      addPageIfNeeded(20);
      sectionTitle(title);

      const labelColW = contentW - 25;
      const valueColX = margin + labelColW + 2;

      ALL_ITEMS.forEach((item) => {
        const val = values[item];
        const labelLines = doc.splitTextToSize(item, labelColW - 4);
        const rowH = labelLines.length * 4.5 + 2;
        addPageIfNeeded(rowH + 2);

        // Row background alternating
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y - 3.5, contentW, rowH, 'F');
        doc.setDrawColor(220, 220, 230);
        doc.setLineWidth(0.2);
        doc.rect(margin, y - 3.5, contentW, rowH, 'S');

        doc.setFontSize(8.5);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 40, 40);
        doc.text(labelLines, margin + 2, y);

        if (val) {
          doc.setTextColor(22, 163, 74);
          doc.setFont('helvetica', 'bold');
          doc.text('Yes', valueColX, y);
        } else {
          doc.setTextColor(220, 38, 38);
          doc.setFont('helvetica', 'bold');
          doc.text('No', valueColX, y);
        }
        doc.setTextColor(40, 40, 40);
        y += rowH;
      });
      y += 5;
    };

    componentTable(report.componentes_pre, 'Componentes Operativos Pre-mantención');
    componentTable(report.componentes_post, 'Componentes Operativos Post-mantención');

    // --- Photos ---
    if (report.photo_entries?.length > 0) {
      addPageIfNeeded(20);
      sectionTitle('Fotografía de Componentes');
      for (const entry of report.photo_entries) {
        addPageIfNeeded(65);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 40, 40);
        doc.text(entry.label, margin, y);
        y += 3;
        try {
          // Load image via canvas for cross-origin
          const imgData = await loadImageAsBase64(entry.url);
          doc.addImage(imgData, 'JPEG', margin, y, 80, 55);
        } catch {
          doc.setFontSize(8);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(150, 150, 150);
          doc.text('[Imagen no disponible]', margin, y + 10);
        }
        y += 60;
      }
      y += 4;
    }

    // --- GPS ---
    if (report.location) {
      addPageIfNeeded(15);
      sectionTitle('Ubicación GPS');
      infoRow('Coordenadas', `${report.location.lat?.toFixed(5)}, ${report.location.lng?.toFixed(5)}`);
      if (report.location.accuracy) infoRow('Precisión', `${Math.round(report.location.accuracy)} m`);
      y += 4;
    }

    // --- Observations ---
    if (report.observations) {
      addPageIfNeeded(15);
      sectionTitle('Observaciones');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);
      const lines = doc.splitTextToSize(report.observations, contentW);
      doc.text(lines, margin, y);
      y += lines.length * 5 + 4;
    }

    // --- Signature ---
    if (report.signature_url) {
      addPageIfNeeded(40);
      sectionTitle('Firma Digital');
      try {
        const sigData = await loadImageAsBase64(report.signature_url);
        doc.addImage(sigData, 'PNG', margin, y, 70, 28);
        y += 32;
      } catch {
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(150, 150, 150);
        doc.text('[Firma no disponible]', margin, y);
        y += 10;
      }
    }

    // Footer on each page
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(150, 150, 150);
      doc.text(`Página ${i} de ${totalPages}`, pageW / 2, 292, { align: 'center' });
      doc.text(`Generado: ${new Date().toLocaleDateString('es-CL')}`, margin, 292);
    }

    const filename = `informe_${report.tipo_equipo || 'mantencion'}_${report.numero_interno_equipo || ''}_${report.report_date || ''}.pdf`.replace(/\s+/g, '_');
    doc.save(filename);
    setLoading(false);
  };

  return (
    <Button onClick={generatePDF} disabled={loading} variant="outline" className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50">
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      {loading ? 'Generando PDF...' : 'Descargar PDF'}
    </Button>
  );
}

async function loadImageAsBase64(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = reject;
    img.src = url;
  });
}