import React from 'react';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const LOGO_URL = 'https://media.base44.com/images/public/696eb833e2d4849e4ac7b478/6f22c9b3e_Imagen1.svg';

let cachedLogo = null;

// Load the Hexagon SVG logo, rasterize to PNG base64 via canvas
async function getLogoBase64() {
  if (cachedLogo) return cachedLogo;
  try {
    const res = await fetch(LOGO_URL);
    const svgText = await res.text();
    const blob = new Blob([svgText], { type: 'image/svg+xml' });
    const blobUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = blobUrl;
    });
    const targetW = 320;
    const ratio = (img.naturalHeight || 1) / (img.naturalWidth || 1) || 0.4;
    const targetH = Math.round(targetW * ratio);
    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, targetW, targetH);
    URL.revokeObjectURL(blobUrl);
    cachedLogo = canvas.toDataURL('image/png');
    return cachedLogo;
  } catch {
    return null;
  }
}

// Convert image URL to base64
async function urlToBase64(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// Draw page header with Hexagon branding
function drawHeader(doc, pageNum, logo) {
  // Top border line (teal/cyan)
  doc.setDrawColor(0, 174, 239);
  doc.setLineWidth(1.5);
  doc.line(0, 0, 210, 0);

  // Hexagon logo image
  if (logo) {
    try {
      const logoH = 10;
      const logoW = Math.round(logoH * (320 / 128));
      doc.addImage(logo, 'PNG', 10, 4, logoW, logoH);
    } catch {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);
      doc.text('HEXAGON', 20, 12);
    }
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text('HEXAGON', 20, 12);
    doc.setFillColor(30, 30, 30);
    doc.rect(10, 6, 4, 4, 'F');
    doc.setFillColor(255, 255, 255);
    doc.rect(11, 7, 2, 2, 'F');
  }

  // Bottom of header separator
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  doc.line(10, 17, 200, 17);

  // Page number
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Page | ${pageNum}`, 175, 12);
}

// Draw teal table header row
function drawTableHeader(doc, y, col1Width, col2Width, startX) {
  doc.setFillColor(58, 150, 160);
  doc.rect(startX, y, col1Width + col2Width, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text('DESCRIPCION', startX + 3, y + 5.5);
  doc.text('CANTIDAD', startX + col1Width + 3, y + 5.5);
  return y + 8;
}

// Draw a single table row
function drawTableRow(doc, y, desc, cant, col1Width, col2Width, startX, isAlt) {
  if (isAlt) {
    doc.setFillColor(248, 248, 248);
    doc.rect(startX, y, col1Width + col2Width, 8, 'F');
  }
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.2);
  doc.rect(startX, y, col1Width, 8);
  doc.rect(startX + col1Width, y, col2Width, 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(40, 40, 40);
  const lines = doc.splitTextToSize(desc, col1Width - 6);
  doc.text(lines, startX + 3, y + 5.5);
  doc.text(cant || '—', startX + col1Width + 3, y + 5.5);
  return y + (lines.length > 1 ? lines.length * 5 + 2 : 8);
}

// Section title
function drawSectionTitle(doc, y, num, title) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text(`${num}.  ${title}`, 105, y, { align: 'center' });
  return y + 10;
}

export default function InstallationReportPDF({ report }) {
  const handleExport = async () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageW = 210;
    const pageH = 297;
    const margin = 15;
    const contentW = pageW - margin * 2;
    let page = 1;

    // Pre-load Hexagon logo (used on cover and every header)
    const logo = await getLogoBase64();

    // ── PAGE 1: COVER ──────────────────────────────────────────────────────
    // Left white section with logo and title
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageW * 0.87, pageH * 0.52, 'F');

    // Teal diagonal accent (right side)
    doc.setFillColor(0, 174, 239);
    doc.triangle(pageW * 0.87, pageH * 0.30, pageW, pageH * 0.30, pageW, pageH * 0.52, 'F');
    doc.setFillColor(173, 216, 230);
    doc.triangle(pageW * 0.87, pageH * 0.40, pageW, pageH * 0.40, pageW, pageH * 0.55, 'F');

    // Hexagon logo on cover
    if (logo) {
      try {
        const coverLogoH = 14;
        const coverLogoW = Math.round(coverLogoH * (320 / 128));
        doc.addImage(logo, 'PNG', 28, 10, coverLogoW, coverLogoH);
      } catch {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(30, 30, 30);
        doc.text('HEXAGON', 28, 22);
      }
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(30, 30, 30);
      doc.text('HEXAGON', 28, 22);
      doc.setFillColor(30, 30, 30);
      doc.rect(18, 15, 5, 5, 'F');
      doc.setFillColor(255, 255, 255);
      doc.rect(19.5, 16.5, 2, 2, 'F');
    }

    // Main title
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(20, 20, 20);
    const titleText = report.tipo === 'preinstalacion' ? 'PREINSTALACION SISTEMA FMS' : 'POSTINSTALACION SISTEMA FMS';
    const titleLines = doc.splitTextToSize(titleText, pageW * 0.78);
    doc.text(titleLines, margin, pageH * 0.28);

    // Subtitle lines
    const subtitleY = pageH * 0.28 + titleLines.length * 14 + 8;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    const empresa = report.empresa || report.division || '';
    doc.text(empresa, margin, subtitleY);

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 130, 200);
    const equipoLine = [report.equipo_marca, report.equipo_modelo].filter(Boolean).join(' ') || report.equipo_numero || '';
    doc.text(equipoLine, margin, subtitleY + 8);

    // Bottom blue band
    doc.setFillColor(0, 174, 239);
    doc.rect(0, pageH * 0.52, pageW, 4, 'F');

    // Front photo in bottom half
    if (report.foto_frontal_url) {
      const imgData = await urlToBase64(report.foto_frontal_url);
      if (imgData) {
        doc.addImage(imgData, 'JPEG', 0, pageH * 0.524, pageW, pageH * 0.476);
      } else {
        doc.setFillColor(220, 220, 220);
        doc.rect(0, pageH * 0.524, pageW, pageH * 0.476, 'F');
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('Foto frontal del equipo', pageW / 2, pageH * 0.76, { align: 'center' });
      }
    } else {
      doc.setFillColor(210, 210, 210);
      doc.rect(0, pageH * 0.524, pageW, pageH * 0.476, 'F');
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('Sin foto frontal', pageW / 2, pageH * 0.76, { align: 'center' });
    }

    // ── PAGE 2: TABLA COMPONENTES FMS ─────────────────────────────────────
    doc.addPage();
    page++;
    drawHeader(doc, page, logo);

    let y = 26;
    y = drawSectionTitle(doc, y, '1', 'ESPECIFICACION DE COMPONENTES DEL SISTEMA FMS');
    y += 4;

    const col1 = 140, col2 = 40;
    y = drawTableHeader(doc, y, col1, col2, margin);
    (report.componentes_fms || []).forEach((c, i) => {
      y = drawTableRow(doc, y, c.descripcion, c.cantidad, col1, col2, margin, i % 2 === 0);
      if (y > pageH - 30) {
        doc.addPage(); page++;
        drawHeader(doc, page, logo);
        y = 26;
        y = drawTableHeader(doc, y, col1, col2, margin);
      }
    });

    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text('Tabla de componentes FMS.', 105, y, { align: 'center' });

    // ── PAGE 3: TABLA COMPONENTES CAS ─────────────────────────────────────
    doc.addPage();
    page++;
    drawHeader(doc, page, logo);

    y = 26;
    y = drawSectionTitle(doc, y, '2', 'ESPECIFICACION DE COMPONENTES DEL SISTEMA CAS');
    y += 4;

    y = drawTableHeader(doc, y, col1, col2, margin);
    (report.componentes_cas || []).forEach((c, i) => {
      y = drawTableRow(doc, y, c.descripcion, c.cantidad, col1, col2, margin, i % 2 === 0);
      if (y > pageH - 30) {
        doc.addPage(); page++;
        drawHeader(doc, page, logo);
        y = 26;
        y = drawTableHeader(doc, y, col1, col2, margin);
      }
    });

    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text('Tabla de componentes CAS.', 105, y, { align: 'center' });

    // ── PAGE 4+: SERIES (post only) + INFO GENERAL ────────────────────────
    if (report.tipo === 'postinstalacion') {
      doc.addPage();
      page++;
      drawHeader(doc, page, logo);
      y = 26;
      y = drawSectionTitle(doc, y, '3', 'NUMEROS DE SERIE — COMPONENTES INSTALADOS');
      y += 4;

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
      doc.addPage();
      page++;
      drawHeader(doc, page, logo);
      y = 26;
      y = drawSectionTitle(doc, y, report.tipo === 'postinstalacion' ? '4' : '3', 'CONEXION ELECTRICA DEL SISTEMA');
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      const elecLines = doc.splitTextToSize(report.conexion_electrica, contentW);
      doc.text(elecLines, margin, y);
      y += elecLines.length * 5 + 6;
    }

    // ── OBSERVACIONES ──────────────────────────────────────────────────────
    if (report.observaciones) {
      if (!report.conexion_electrica) {
        doc.addPage();
        page++;
        drawHeader(doc, page, logo);
        y = 26;
      } else {
        y += 10;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(30, 30, 30);
      doc.text('OBSERVACIONES GENERALES', margin, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const obsLines = doc.splitTextToSize(report.observaciones, contentW);
      doc.text(obsLines, margin, y);
    }

    // ── REGISTRO FOTOGRAFICO ──────────────────────────────────────────────
    if (report.fotos && report.fotos.length > 0) {
      doc.addPage();
      page++;
      drawHeader(doc, page, logo);
      y = 26;

      const secNum = report.tipo === 'postinstalacion' ? '5' : '4';
      y = drawSectionTitle(doc, y, secNum, 'INSTALACION Y UBICACION DE COMPONENTES');
      y += 4;

      for (let i = 0; i < report.fotos.length; i++) {
        const foto = report.fotos[i];

        // Section subtitle
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(30, 30, 30);
        doc.text(`${secNum}.${i + 1}  ${foto.label.toUpperCase()}`, margin, y);
        y += 5;

        const imgData = await urlToBase64(foto.url);
        const imgH = 70;
        const imgW = contentW * 0.7;
        const imgX = margin + (contentW - imgW) / 2;

        if (y + imgH + 16 > pageH - 20) {
          doc.addPage();
          page++;
          drawHeader(doc, page, logo);
          y = 26;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.setTextColor(30, 30, 30);
          doc.text(`${secNum}.${i + 1}  ${foto.label.toUpperCase()}`, margin, y);
          y += 5;
        }

        if (imgData) {
          doc.addImage(imgData, 'JPEG', imgX, y, imgW, imgH);
        } else {
          doc.setFillColor(220, 220, 220);
          doc.rect(imgX, y, imgW, imgH, 'F');
        }
        y += imgH + 4;

        // Caption
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        doc.text(`Imagen N°${i + 1} ${foto.label}.`, 105, y, { align: 'center' });
        y += 12;
      }
    }

    // ── APROBACION ────────────────────────────────────────────────────────
    doc.addPage();
    page++;
    drawHeader(doc, page, logo);

    y = 26;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(20, 20, 20);
    doc.text('APROBACION', margin, y + 4);
    y += 14;

    doc.setDrawColor(60, 60, 60);
    doc.setLineWidth(0.4);
    doc.line(margin, y, margin + contentW, y);
    y += 8;

    const introText = 'El documento contiene las posiciones de montaje, para cada componente del sistema. Además, indica las conexiones eléctricas requeridas para el buen funcionamiento del sistema. El documento se ha preparado para la organización, por lo que tienen aviso previo de la instalación propuesta y la oportunidad de acordar o proponer alternativas preferidas. Este documento debe ser leído y firmado por el personal designado y devuelto a Hexagon Mining, antes de que pueda comenzar cualquier actividad de instalación.';
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const introLines = doc.splitTextToSize(introText, contentW);
    doc.text(introLines, margin, y);
    y += introLines.length * 4.5 + 10;

    // Approval blocks
    const approvers = [];
    if (report.aprobacion_cliente_nombre) {
      approvers.push({ nombre: report.aprobacion_cliente_nombre, cargo: report.aprobacion_cliente_cargo, compania: report.aprobacion_cliente_compania });
    }
    if (report.aprobacion_proveedor_nombre) {
      approvers.push({ nombre: report.aprobacion_proveedor_nombre, cargo: report.aprobacion_proveedor_cargo, compania: report.aprobacion_proveedor_compania });
    }

    // Always draw 2 approval blocks minimum
    const totalBlocks = Math.max(approvers.length, 2);
    for (let i = 0; i < totalBlocks; i++) {
      const a = approvers[i] || {};
      if (y > pageH - 50) {
        doc.addPage(); page++;
        drawHeader(doc, page, logo);
        y = 26;
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(40, 40, 40);

      const dotLine = (label, value) => {
        doc.text(`${label}: `, margin, y);
        const lw = doc.getTextWidth(`${label}: `);
        if (value) {
          doc.setFont('helvetica', 'bold');
          doc.text(value, margin + lw, y);
          doc.setFont('helvetica', 'normal');
        } else {
          doc.setDrawColor(120, 120, 120);
          doc.setLineWidth(0.3);
          doc.line(margin + lw, y + 0.5, margin + contentW, y + 0.5);
        }
        y += 6;
      };

      dotLine('Nombre', a.nombre);
      dotLine('Firma', '');
      dotLine('Nombre de Compañía', a.compania);
      dotLine('Fecha', report.fecha ? format(new Date(report.fecha), 'dd/MM/yyyy', { locale: es }) : '');
      dotLine('Cargo', a.cargo);
      y += 6;
    }

    // ── LAST PAGE: Company info ────────────────────────────────────────────
    doc.addPage();
    page++;
    drawHeader(doc, page, logo);
    y = 30;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const companyText = 'Hexagon Mining es la única empresa que resuelve los desafíos de minería superficial y subterránea mediante la integración de tecnologías de diseño, planificación y operaciones para minas más seguras y productivas. Con sede en Tucson, Arizona, y más de 30 oficinas en cinco continentes.\n\nPara más información, visite: www.hexagonmining.com';
    const compLines = doc.splitTextToSize(companyText, contentW);
    doc.text(compLines, margin, y);

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