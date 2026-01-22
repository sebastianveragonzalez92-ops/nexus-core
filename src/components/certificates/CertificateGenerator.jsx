import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const generateCertificatePDF = async (certificate, user, course, template) => {
  const certificateElement = document.getElementById('certificate-preview');
  if (!certificateElement) return null;

  const canvas = await html2canvas(certificateElement, {
    scale: 2,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  
  return pdf;
};

export default function CertificateTemplate({ certificate, user, course, template = 'default' }) {
  const certificateDate = certificate?.issued_date 
    ? format(new Date(certificate.issued_date), "d 'de' MMMM 'de' yyyy", { locale: es })
    : format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es });

  if (template === 'modern') {
    return (
      <div id="certificate-preview" className="w-[1123px] h-[794px] bg-gradient-to-br from-slate-50 to-slate-100 p-16 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-200/30 to-violet-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl" />
        
        <div className="relative bg-white rounded-3xl shadow-2xl h-full p-16 border-4 border-indigo-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block px-6 py-2 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full mb-4">
              <span className="text-white font-bold text-sm tracking-wider">CERTIFICADO DE FINALIZACIÓN</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-2">
              Certificado
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-indigo-500 to-violet-500 mx-auto rounded-full" />
          </div>

          {/* Body */}
          <div className="text-center space-y-6 mb-8">
            <p className="text-xl text-slate-600">Se otorga el presente certificado a</p>
            <h2 className="text-4xl font-bold text-slate-900 py-4">
              {user?.full_name || user?.email}
            </h2>
            <p className="text-xl text-slate-600">
              Por completar exitosamente el curso
            </p>
            <h3 className="text-3xl font-semibold text-indigo-600 px-8">
              {course?.title}
            </h3>
            
            {certificate?.score && (
              <div className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border-2 border-emerald-200">
                <p className="text-emerald-700 font-semibold">
                  Calificación: <span className="text-2xl font-bold">{certificate.score}%</span>
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t-2 border-slate-200">
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-2">Fecha de emisión</p>
              <p className="font-semibold text-slate-700">{certificateDate}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-500 mb-2">Certificado N°</p>
              <p className="font-mono font-semibold text-slate-700">{certificate?.certificate_number}</p>
            </div>
          </div>

          {/* Corner decorations */}
          <div className="absolute top-8 left-8 w-16 h-16 border-l-4 border-t-4 border-indigo-300 rounded-tl-2xl" />
          <div className="absolute top-8 right-8 w-16 h-16 border-r-4 border-t-4 border-indigo-300 rounded-tr-2xl" />
          <div className="absolute bottom-8 left-8 w-16 h-16 border-l-4 border-b-4 border-indigo-300 rounded-bl-2xl" />
          <div className="absolute bottom-8 right-8 w-16 h-16 border-r-4 border-b-4 border-indigo-300 rounded-br-2xl" />
        </div>
      </div>
    );
  }

  // Default classic template
  return (
    <div id="certificate-preview" className="w-[1123px] h-[794px] bg-white p-16 relative" style={{ 
      backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"%3E%3Cpath d="M 20 0 L 0 0 0 20" fill="none" stroke="%23f1f5f9" stroke-width="0.5"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100" height="100" fill="url(%23grid)"/%3E%3C/svg%3E")',
      backgroundSize: '40px 40px'
    }}>
      <div className="border-8 border-double border-amber-600 h-full p-12 relative">
        {/* Seal/Badge */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-xl border-4 border-white">
          <div className="text-center text-white">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>

        <div className="text-center h-full flex flex-col justify-between pt-8">
          {/* Header */}
          <div>
            <h1 className="text-6xl font-serif font-bold text-amber-700 mb-2">Certificado</h1>
            <p className="text-lg text-slate-600 uppercase tracking-widest">de finalización</p>
            <div className="w-48 h-1 bg-amber-600 mx-auto my-4" />
          </div>

          {/* Body */}
          <div className="space-y-6">
            <p className="text-2xl text-slate-700 font-light">Se certifica que</p>
            <h2 className="text-5xl font-serif font-bold text-slate-900 border-b-2 border-slate-300 inline-block pb-2 px-12">
              {user?.full_name || user?.email}
            </h2>
            <p className="text-2xl text-slate-700 font-light">ha completado satisfactoriamente</p>
            <h3 className="text-3xl font-semibold text-amber-700 px-16 leading-tight">
              {course?.title}
            </h3>
            
            {certificate?.score && (
              <p className="text-xl text-slate-600">
                con una calificación de <span className="font-bold text-2xl text-amber-700">{certificate.score}%</span>
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="grid grid-cols-2 gap-12 px-16">
            <div className="text-center border-t-2 border-slate-400 pt-4">
              <p className="text-slate-600 text-sm mb-1">Fecha</p>
              <p className="font-semibold text-slate-800">{certificateDate}</p>
            </div>
            <div className="text-center border-t-2 border-slate-400 pt-4">
              <p className="text-slate-600 text-sm mb-1">Certificado N°</p>
              <p className="font-mono font-semibold text-slate-800">{certificate?.certificate_number}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}