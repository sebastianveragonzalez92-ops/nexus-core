import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Download, Award, Calendar, FileCheck, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import CertificateTemplate from './CertificateGenerator';

export default function CertificateViewer() {
  const [user, setUser] = useState(null);
  const [previewCert, setPreviewCert] = useState(null);
  const [downloading, setDownloading] = useState(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ['certificates', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return base44.entities.Certificate.filter({ user_email: user.email }, '-issued_date');
    },
    enabled: !!user,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list(),
  });

  const getCourse = (courseId) => courses.find(c => c.id === courseId);

  const handleDownload = async (certificate) => {
    const course = getCourse(certificate.course_id);
    if (!course) {
      toast.error('Curso no encontrado');
      return;
    }

    setDownloading(certificate.id);
    setPreviewCert({ certificate, course });

    // Wait for render
    setTimeout(async () => {
      try {
        const certificateElement = document.getElementById('certificate-preview');
        if (!certificateElement) {
          toast.error('No se pudo cargar el certificado');
          setDownloading(null);
          setPreviewCert(null);
          return;
        }

        const canvas = await html2canvas(certificateElement, {
          scale: 2,
          backgroundColor: '#ffffff',
          useCORS: true,
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
        pdf.save(`certificado-${certificate.certificate_number}.pdf`);
        
        toast.success('Certificado descargado');
        setDownloading(null);
        setPreviewCert(null);
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al generar el PDF');
        setDownloading(null);
        setPreviewCert(null);
      }
    }, 800);
  };

  const handlePreview = (certificate) => {
    const course = getCourse(certificate.course_id);
    if (!course) {
      toast.error('Curso no encontrado');
      return;
    }
    setPreviewCert({ certificate, course });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            <Award className="w-7 h-7 text-amber-500" />
            Mis Certificados
          </h2>
          <p className="text-slate-600 mt-1">Descarga y comparte tus logros</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {certificates.length} {certificates.length === 1 ? 'certificado' : 'certificados'}
        </Badge>
      </div>

      {certificates.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="text-center py-12">
            <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">No tienes certificados aún</h3>
            <p className="text-slate-500">Completa cursos para obtener certificados</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {certificates.map((cert, index) => {
            const course = getCourse(cert.course_id);
            const isExpired = cert.expiry_date && new Date(cert.expiry_date) < new Date();
            
            return (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`hover:shadow-lg transition-all ${isExpired ? 'border-amber-200 bg-amber-50/30' : 'border-emerald-200 bg-emerald-50/30'}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{course?.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(cert.issued_date), "d 'de' MMMM, yyyy", { locale: es })}
                        </CardDescription>
                      </div>
                      <Badge variant={cert.status === 'active' ? 'default' : 'secondary'} className={
                        cert.status === 'active' ? 'bg-emerald-500' : ''
                      }>
                        {cert.status === 'active' ? 'Vigente' : cert.status === 'expired' ? 'Vencido' : 'Revocado'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Certificado N°</p>
                        <p className="font-mono font-semibold text-slate-900">{cert.certificate_number}</p>
                      </div>
                      {cert.score && (
                        <div>
                          <p className="text-slate-500">Calificación</p>
                          <p className="font-semibold text-emerald-600">{cert.score}%</p>
                        </div>
                      )}
                    </div>

                    {cert.expiry_date && (
                      <div className={`p-3 rounded-lg ${isExpired ? 'bg-amber-100' : 'bg-blue-50'}`}>
                        <p className="text-xs text-slate-600">
                          {isExpired ? 'Venció el' : 'Válido hasta'}{' '}
                          <span className="font-semibold">
                            {format(new Date(cert.expiry_date), "d 'de' MMMM, yyyy", { locale: es })}
                          </span>
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handlePreview(cert)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver
                      </Button>
                      <Button
                        onClick={() => handleDownload(cert)}
                        disabled={downloading === cert.id}
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-indigo-500 to-violet-500"
                      >
                        {downloading === cert.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generando...
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-2" />
                            Descargar
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewCert && !downloading} onOpenChange={() => setPreviewCert(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Vista Previa del Certificado</DialogTitle>
          </DialogHeader>
          {previewCert && (
            <div className="flex justify-center p-4 bg-slate-50 rounded-lg overflow-auto">
              <div className="transform scale-75 origin-top">
                <CertificateTemplate
                  certificate={previewCert.certificate}
                  user={user}
                  course={previewCert.course}
                  template="modern"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Hidden certificate for PDF generation */}
      {downloading && previewCert && (
        <div style={{ position: 'fixed', left: '-10000px', top: '-10000px', width: '1123px', height: '794px' }}>
          <CertificateTemplate
            certificate={previewCert.certificate}
            user={user}
            course={previewCert.course}
            template="modern"
          />
        </div>
      )}
    </div>
  );
}