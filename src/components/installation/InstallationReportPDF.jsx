import React from 'react';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const LOGO_URL = 'https://media.base44.com/images/public/696eb833e2d4849e4ac7b478/6f22c9b3e_Imagen1.svg';
const TEAL = [0, 174, 239];
const DARK = [30, 40, 50];
const GRAY = [100, 110, 120];
const LIGHT_GRAY = [240, 242, 245];

let cachedLogo = null;

async function getLogoBase64() {
  if (cachedLogo) return cachedLogo;
  try {
    const res = await fetch(LOGO_URL);
    const svgText = await res.text();
    const blob = new Blob([svgText], { type: 'image/svg+xml' });
    const blobUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = blobUrl; });
    const targetW = 480;
    const ratio = (img.naturalHeight || 1) / (img.naturalWidth || 1) || 0.4;
    const targetH = Math.round(targetW * ratio);
    const canvas = document.createElement('canvas');
    canvas.width = targetW; canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, targetW, targetH);
    URL.revokeObjectURL(blobUrl);
    cachedLogo = canvas.toDataURL('image/png');
    return cachedLogo;
  } catch { return null; }
}

async function urlToBase64(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch { return null; }
}

// Header: logo left, page number right, teal top bar + gray separator
function drawHeader(doc, pageNum, logo, pageW) {
  // Top teal bar
  doc.setFillColor(...TEAL);
  doc.rect(0, 0, pageW, 1.5, 'F');

  // Logo
  if (logo) {
    try {
      const logoH = 9;
      const logoW = Math.round(logoH * (480 / 192));
      doc.addImage(logo, 'PNG', 12, 3.5, logoW, logoH);
    } catch {
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
      doc.setTextColor(...DARK); doc.text('HEXAGON', 12, 11);
    }
  }

  // Page number right
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text(`${pageNum}`, pageW - 12, 10, { align: 'right' });

  // Separator line
  doc.setDrawColor(210, 215, 220); doc.setLineWidth(0.3);
  doc.line(12, 15, pageW - 12, 15);
}

// Footer: thin teal bar at bottom + document reference
function drawFooter(doc, report, pageW, pageH) {
  doc.setFillColor(...TEAL);
  doc.rect(0, pageH - 1.5, pageW, 1.5, 'F');
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
  doc.setTextColor(...GRAY);
  const ref = `${report.tipo === 'preinstalacion' ? 'PRE' : 'POST'}-${report.equipo_numero || '—'}  |  ${report.empresa || ''}  |  ${report.fecha ? format(new Date(report.fecha), 'dd/MM/yyyy', { locale: es }) : ''}`;
  doc.text(ref, pageW / 2, pageH - 4, { align: 'center' });
}

function drawSectionTitle(doc, y, num, title, pageW) {
  // Colored left accent bar
  doc.setFillColor(...TEAL);
  doc.rect(12, y - 1, 3, 8, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
  doc.setTextColor(...DARK);
  doc.text(`${num}.  ${title}`, 18, y + 5.5);
  return y + 14;
}

function drawTableHeader(doc, y, col1Width, col2Width, startX) {
  doc.setFillColor(...TEAL);
  doc.rect(startX, y, col1Width + col2Width, 8, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('DESCRIPCIÓN', startX + 4, y + 5.5);
  doc.text('CANT.', startX + col1Width + 4, y + 5.5);
  return y + 8;
}

function drawTableRow(doc, y, desc, cant, col1Width, col2Width, startX, isAlt) {
  const rowH = 8;
  if (isAlt) {
    doc.setFillColor(...LIGHT_GRAY);
    doc.rect(startX, y, col1Width + col2Width, rowH, 'F');
  }
  doc.setDrawColor(210, 215, 220); doc.setLineWidth(0.2);
  doc.rect(startX, y, col1Width, rowH);
  doc.rect(startX + col1Width, y, col2Width, rowH);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
  doc.setTextColor(...DARK);
  const lines = doc.splitTextToSize(desc, col1Width - 8);
  doc.text(lines, startX + 4, y + 5.5);
  doc.text(cant || '—', startX + col1Width + 4, y + 5.5);
  return y + (lines.length > 1 ? lines.length * 5 + 3 : rowH);
}

function drawInfoBlock(doc, y, margin, contentW, rows) {
  const rowH = 9;
  rows.forEach(([label, value], i) => {
    if (i % 2 === 0) {
      doc.setFillColor(...LIGHT_GRAY);
      doc.rect(margin, y, contentW, rowH, 'F');
    }
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5);
    doc.setTextColor(...GRAY);
    doc.text(label, margin + 4, y + 6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...DARK);
    doc.text(String(value || '—'), margin + 55, y + 6);
    doc.setDrawColor(210, 215, 220); doc.setLineWidth(0.15);
    doc.line(margin, y + rowH, margin + contentW, y + rowH);
    y += rowH;
  });
  return y;
}

export default function InstallationReportPDF({ report }) {
  const handleExport = async () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = 210;
    const pageH = 297;
    const margin = 15;
    const contentW = pageW - margin * 2;
    let page = 1;

    const logo = await getLogoBase64();

    // ── PAGE 1: COVER ──────────────────────────────────────────────────────
    // Background
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, pageW, pageH, 'F');

    // Top teal header band
    doc.setFillColor(...TEAL);
    doc.rect(0, 0, pageW, 38, 'F');

    // Logo on cover (white version: place on teal bg)
    if (logo) {
      try {
        const coverLogoH = 16;
        const coverLogoW = Math.round(coverLogoH * (480 / 192));
        doc.addImage(logo, 'PNG', margin, 11, coverLogoW, coverLogoH);
      } catch {}
    }

    // Document type badge top-right
    doc.setFillColor(255, 255, 255, 30);
    const badgeLabel = report.tipo === 'preinstalacion' ? 'PRE-INSTALACIÓN' : 'POST-INSTALACIÓN';
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(badgeLabel, pageW - margin, 22, { align: 'right' });

    // Main title area (white card)
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, 48, contentW, 72, 3, 3, 'F');
    doc.setDrawColor(...TEAL); doc.setLineWidth(0.6);
    doc.line(margin + 6, 48, margin + 6, 120);

    const titleText = report.tipo === 'preinstalacion'
      ? 'INFORME DE\nPREINSTALACIÓN\nSISTEMA FMS'
      : 'INFORME DE\nPOSTINSTALACIÓN\nSISTEMA FMS';
    doc.setFont('helvetica', 'bold'); doc.setFontSize(22);
    doc.setTextColor(...DARK);
    titleText.split('\n').forEach((line, i) => {
      doc.text(line, margin + 14, 62 + i * 11);
    });

    // Equipo info inside card
    const equipoLine = [report.equipo_marca, report.equipo_modelo].filter(Boolean).join(' ') || report.equipo_numero || '';
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
    doc.setTextColor(...GRAY);
    doc.text(equipoLine, margin + 14, 106);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    doc.setTextColor(...TEAL);
    doc.text(report.equipo_numero || '', margin + 14, 114);

    // Metadata grid below card
    const metaY = 128;
    const metaRows = [
      ['Empresa', report.empresa || '—'],
      ['División', report.division || '—'],
      ['Realizado por', report.realizado_por || '—'],
      ['Fecha', report.fecha ? format(new Date(report.fecha), "dd 'de' MMMM 'de' yyyy", { locale: es }) : '—'],
    ];
    const colW = contentW / 2;
    metaRows.forEach(([label, value], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = margin + col * colW;
      const y = metaY + row * 18;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5);
      doc.setTextColor(...TEAL);
      doc.text(label.toUpperCase(), x, y);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
      doc.setTextColor(...DARK);
      doc.text(value, x, y + 6);
    });

    // Thin divider
    doc.setDrawColor(210, 215, 220); doc.setLineWidth(0.3);
    doc.line(margin, metaY + 40, margin + contentW, metaY + 40);

    // Front photo
    const photoY = metaY + 44;
    const photoH = pageH - photoY - 18;
    if (report.foto_frontal_url) {
      const imgData = await urlToBase64(report.foto_frontal_url);
      if (imgData) {
        doc.setDrawColor(210, 215, 220); doc.setLineWidth(0.3);
        doc.rect(margin, photoY, contentW, photoH);
        doc.addImage(imgData, 'JPEG', margin, photoY, contentW, photoH, '', 'FAST');
      }
    }

    // Cover footer
    doc.setFillColor(...TEAL);
    doc.rect(0, pageH - 10, pageW, 10, 'F');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text('www.hexagonmining.com', pageW / 2, pageH - 3.5, { align: 'center' });

    // ── PAGE 2: INFO GENERAL ───────────────────────────────────────────────
    doc.addPage(); page++;
    drawHeader(doc, page, logo, pageW);
    drawFooter(doc, report, pageW, pageH);

    let y = 22;
    y = drawSectionTitle(doc, y, '0', 'INFORMACIÓN GENERAL', pageW);

    const infoRows = [
      ['Cliente', report.cliente],
      ['Empresa', report.empresa],
      ['División', report.division],
      ['Equipo Marca', report.equipo_marca],
      ['Equipo Modelo', report.equipo_modelo],
      ['N° Interno', report.equipo_numero],
      ['Fecha', report.fecha ? format(new Date(report.fecha), 'dd/MM/yyyy', { locale: es }) : ''],
      ['Realizado por', report.realizado_por],
      ['Validado por', report.validado_por],
    ].filter(([, v]) => v);
    y = drawInfoBlock(doc, y, margin, contentW, infoRows);

    if (report.objetivo) {
      y += 10;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5);
      doc.setTextColor(...GRAY);
      doc.text('OBJETIVO', margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5);
      doc.setTextColor(...DARK);
      const objLines = doc.splitTextToSize(report.objetivo, contentW);
      doc.text(objLines, margin, y);
    }

    // ── PAGE 3: TABLA COMPONENTES FMS ─────────────────────────────────────
    doc.addPage(); page++;
    drawHeader(doc, page, logo, pageW);
    drawFooter(doc, report, pageW, pageH);

    y = 22;
    y = drawSectionTitle(doc, y, '1', 'ESPECIFICACIÓN DE COMPONENTES — SISTEMA FMS', pageW);

    const col1 = 138, col2 = 42;
    y = drawTableHeader(doc, y, col1, col2, margin);
    (report.componentes_fms || []).forEach((c, i) => {
      y = drawTableRow(doc, y, c.descripcion, c.cantidad, col1, col2, margin, i % 2 === 0);
      if (y > pageH - 30) {
        doc.addPage(); page++;
        drawHeader(doc, page, logo, pageW);
        drawFooter(doc, report, pageW, pageH);
        y = 22;
        y = drawTableHeader(doc, y, col1, col2, margin);
      }
    });

    y += 6;
    doc.setFont('helvetica', 'italic'); doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text('Tabla 1 — Componentes Sistema FMS.', 105, y, { align: 'center' });

    // ── PAGE 4: TABLA COMPONENTES CAS ─────────────────────────────────────
    doc.addPage(); page++;
    drawHeader(doc, page, logo, pageW);
    drawFooter(doc, report, pageW, pageH);

    y = 22;
    y = drawSectionTitle(doc, y, '2', 'ESPECIFICACIÓN DE COMPONENTES — SISTEMA CAS', pageW);

    y = drawTableHeader(doc, y, col1, col2, margin);
    (report.componentes_cas || []).forEach((c, i) => {
      y = drawTableRow(doc, y, c.descripcion, c.cantidad, col1, col2, margin, i % 2 === 0);
      if (y > pageH - 30) {
        doc.addPage(); page++;
        drawHeader(doc, page, logo, pageW);
        drawFooter(doc, report, pageW, pageH);
        y = 22;
        y = drawTableHeader(doc, y, col1, col2, margin);
      }
    });

    y += 6;
    doc.setFont('helvetica', 'italic'); doc.setFontSize(8);
    doc.setTextColor(...GRAY);
    doc.text('Tabla 2 — Componentes Sistema CAS.', 105, y, { align: 'center' });

    // ── PAGE 5: NUMEROS DE SERIE (post only) ──────────────────────────────
    if (report.tipo === 'postinstalacion') {
      doc.addPage(); page++;
      drawHeader(doc, page, logo, pageW);
      drawFooter(doc, report, pageW, pageH);
      y = 22;
      y = drawSectionTitle(doc, y, '3', 'NÚMEROS DE SERIE — COMPONENTES INSTALADOS', pageW);

      const seriesData = [
        ['Módulo CORE', report.series_core],
        ['Display 9"', report.series_display],
        ['GPS', report.series_gps],
        ['QD1400/QD200', report.series_qd200],
        ['QC1000', report.series_qc1000],
        ['LTE SAR', report.series_lte_sar],
      ].filter(([, v]) => v);

      y = drawTableHeader(doc, y, col1, col2, margin);
      seriesData.forEach(([desc, serie], i) => {
        y = drawTableRow(doc, y, desc, serie, col1, col2, margin, i % 2 === 0);
      });
    }

    // ── CONEXION ELECTRICA ─────────────────────────────────────────────────
    if (report.conexion_electrica) {
      doc.addPage(); page++;
      drawHeader(doc, page, logo, pageW);
      drawFooter(doc, report, pageW, pageH);
      y = 22;
      const secN = report.tipo === 'postinstalacion' ? '4' : '3';
      y = drawSectionTitle(doc, y, secN, 'CONEXIÓN ELÉCTRICA DEL SISTEMA', pageW);

      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5);
      doc.setTextColor(...DARK);
      const elecLines = doc.splitTextToSize(report.conexion_electrica, contentW);
      doc.text(elecLines, margin, y);
      y += elecLines.length * 5 + 6;
    }

    // ── OBSERVACIONES ──────────────────────────────────────────────────────
    if (report.observaciones) {
      if (!report.conexion_electrica) {
        doc.addPage(); page++;
        drawHeader(doc, page, logo, pageW);
        drawFooter(doc, report, pageW, pageH);
        y = 22;
      } else {
        y += 10;
      }
      const obsSecN = report.tipo === 'postinstalacion'
        ? (report.conexion_electrica ? '5' : '4')
        : (report.conexion_electrica ? '4' : '3');
      y = drawSectionTitle(doc, y, obsSecN, 'OBSERVACIONES GENERALES', pageW);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5);
      doc.setTextColor(...DARK);
      const obsLines = doc.splitTextToSize(report.observaciones, contentW);
      doc.text(obsLines, margin, y);
    }

    // ── REGISTRO FOTOGRAFICO ──────────────────────────────────────────────
    if (report.fotos && report.fotos.length > 0) {
      doc.addPage(); page++;
      drawHeader(doc, page, logo, pageW);
      drawFooter(doc, report, pageW, pageH);
      y = 22;

      const photoSecN = report.tipo === 'postinstalacion' ? '6' : '5';
      y = drawSectionTitle(doc, y, photoSecN, 'INSTALACIÓN Y UBICACIÓN DE COMPONENTES', pageW);

      // 2-column photo grid
      const photoW = (contentW - 6) / 2;
      const photoH = 60;
      const captionH = 10;
      const cellH = photoH + captionH + 4;

      for (let i = 0; i < report.fotos.length; i++) {
        const col = i % 2;
        if (col === 0 && i > 0) y += cellH;

        if (y + cellH > pageH - 20) {
          doc.addPage(); page++;
          drawHeader(doc, page, logo, pageW);
          drawFooter(doc, report, pageW, pageH);
          y = 22;
        }

        const foto = report.fotos[i];
        const x = margin + col * (photoW + 6);

        const imgData = await urlToBase64(foto.url);

        // Photo frame
        doc.setFillColor(...LIGHT_GRAY);
        doc.rect(x, y, photoW, photoH, 'F');
        if (imgData) {
          doc.addImage(imgData, 'JPEG', x, y, photoW, photoH, '', 'FAST');
        }

        // Label bar
        doc.setFillColor(...TEAL);
        doc.rect(x, y + photoH, photoW, 8, 'F');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5);
        doc.setTextColor(255, 255, 255);
        const labelText = doc.splitTextToSize(`${i + 1}. ${foto.label}`, photoW - 6);
        doc.text(labelText[0], x + 3, y + photoH + 5.5);
      }
    }

    // ── APROBACION ────────────────────────────────────────────────────────
    doc.addPage(); page++;
    drawHeader(doc, page, logo, pageW);
    drawFooter(doc, report, pageW, pageH);

    y = 22;
    // Section header with background
    doc.setFillColor(...TEAL);
    doc.rect(margin, y, contentW, 14, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('APROBACIÓN', margin + 6, y + 10);
    y += 20;

    const introText = 'El documento contiene las posiciones de montaje para cada componente del sistema. Además, indica las conexiones eléctricas requeridas para el buen funcionamiento del sistema. Este documento debe ser leído y firmado por el personal designado y devuelto a Hexagon Mining antes de que pueda comenzar cualquier actividad de instalación.';
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
    doc.setTextColor(...GRAY);
    const introLines = doc.splitTextToSize(introText, contentW);
    doc.text(introLines, margin, y);
    y += introLines.length * 4.5 + 12;

    const approvers = [];
    if (report.aprobacion_cliente_nombre) {
      approvers.push({ label: 'CLIENTE', nombre: report.aprobacion_cliente_nombre, cargo: report.aprobacion_cliente_cargo, compania: report.aprobacion_cliente_compania });
    }
    if (report.aprobacion_proveedor_nombre) {
      approvers.push({ label: 'PROVEEDOR / HEXAGON', nombre: report.aprobacion_proveedor_nombre, cargo: report.aprobacion_proveedor_cargo, compania: report.aprobacion_proveedor_compania });
    }
    if (approvers.length === 0) {
      approvers.push({ label: 'CLIENTE', nombre: '', cargo: '', compania: '' });
      approvers.push({ label: 'PROVEEDOR / HEXAGON', nombre: '', cargo: '', compania: '' });
    }

    const blockW = (contentW - 8) / 2;
    approvers.forEach((a, i) => {
      if (y > pageH - 80) {
        doc.addPage(); page++;
        drawHeader(doc, page, logo, pageW);
        drawFooter(doc, report, pageW, pageH);
        y = 22;
      }
      const bx = margin + i * (blockW + 8);

      // Block header
      doc.setFillColor(...LIGHT_GRAY);
      doc.rect(bx, y, blockW, 8, 'F');
      doc.setFillColor(...TEAL);
      doc.rect(bx, y, 3, 8, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
      doc.setTextColor(...DARK);
      doc.text(a.label, bx + 6, y + 5.5);

      let by = y + 12;
      const field = (label, value, lineLine = false) => {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5);
        doc.setTextColor(...GRAY);
        doc.text(label, bx, by);
        by += 4;
        if (value) {
          doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
          doc.setTextColor(...DARK);
          doc.text(value, bx, by);
        } else {
          doc.setDrawColor(180, 185, 190); doc.setLineWidth(0.3);
          doc.line(bx, by + 0.5, bx + blockW, by + 0.5);
        }
        by += 8;
      };

      field('NOMBRE', a.nombre);
      field('CARGO', a.cargo);
      field('COMPAÑÍA', a.compania);
      field('FECHA', report.fecha ? format(new Date(report.fecha), 'dd/MM/yyyy', { locale: es }) : '');
      by += 4;
      field('FIRMA', '');
      by += 10;
    });

    // ── LAST PAGE: Company info ────────────────────────────────────────────
    doc.addPage(); page++;
    drawHeader(doc, page, logo, pageW);
    drawFooter(doc, report, pageW, pageH);
    y = 30;

    doc.setFillColor(...LIGHT_GRAY);
    doc.roundedRect(margin, y, contentW, 40, 2, 2, 'F');
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    doc.setTextColor(...DARK);
    const companyText = 'Hexagon Mining es la única empresa que resuelve los desafíos de minería superficial y subterránea mediante la integración de tecnologías de diseño, planificación y operaciones para minas más seguras y productivas. Con sede en Tucson, Arizona, y más de 30 oficinas en cinco continentes.';
    const compLines = doc.splitTextToSize(companyText, contentW - 10);
    doc.text(compLines, margin + 5, y + 8);
    y += 50;

    doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    doc.setTextColor(...TEAL);
    doc.text('www.hexagonmining.com', margin, y);

    // Save
    const tipoLabel = report.tipo === 'preinstalacion' ? 'Preinstalacion' : 'Postinstalacion';
    const fileName = `${tipoLabel}_${report.equipo_numero || 'Informe'}_${report.fecha || 'fecha'}.pdf`;
    doc.save(fileName);
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="gap-2 border-teal-300 text-teal-700 hover:bg-teal-50"
      onClick={handleExport}
    >
      <FileDown className="w-4 h-4" />
      Exportar PDF
    </Button>
  );
}