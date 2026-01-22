import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BookOpen, Award, Clock, CheckCircle, TrendingUp, Download, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import CertificateTemplate from '@/components/certificates/CertificateGenerator';

export default function MyCourses() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: enrollments = [] } = useQuery({
    queryKey: ['myEnrollments', user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ user_email: user?.email }),
    enabled: !!user,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: certificates = [] } = useQuery({
    queryKey: ['certificates', user?.email],
    queryFn: () => base44.entities.Certificate.filter({ user_email: user?.email }),
    enabled: !!user,
  });

  const enrolledCourses = enrollments.map(enrollment => {
    const course = courses.find(c => c.id === enrollment.course_id);
    return { ...enrollment, course };
  }).filter(e => e.course);

  const inProgress = enrolledCourses.filter(e => e.status === 'in_progress');
  const completed = enrolledCourses.filter(e => e.status === 'completed');

  const avgProgress = enrolledCourses.length > 0
    ? Math.round(enrolledCourses.reduce((sum, e) => sum + (e.progress_percent || 0), 0) / enrolledCourses.length)
    : 0;

  // Eliminar certificados duplicados
  const uniqueCertificates = certificates.reduce((acc, cert) => {
    const exists = acc.find(c => c.course_id === cert.course_id && c.user_email === cert.user_email);
    if (!exists) acc.push(cert);
    return acc;
  }, []);

  const handleDownloadCertificate = async (certificate) => {
    const course = courses.find(c => c.id === certificate.course_id);
    if (!course) {
      toast.error('Curso no encontrado');
      return;
    }

    setDownloading(certificate.id);
    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // Dimensiones del PDF
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Fondo blanco
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');

      // Borde decorativo
      pdf.setLineWidth(1.5);
      pdf.setDrawColor(180, 83, 9);
      pdf.rect(10, 10, pageWidth - 20, pageHeight - 20);

      // Encabezado
      const startY = 40;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(42);
      pdf.setTextColor(146, 64, 14);
      pdf.text('Certificado', pageWidth / 2, startY, { align: 'center' });

      pdf.setFontSize(14);
      pdf.setTextColor(71, 85, 105);
      pdf.text('de finalización', pageWidth / 2, startY + 12, { align: 'center' });

      // Línea decorativa
      pdf.setDrawColor(146, 64, 14);
      pdf.setLineWidth(0.5);
      pdf.line(pageWidth / 2 - 40, startY + 18, pageWidth / 2 + 40, startY + 18);

      // Cuerpo del certificado
      const bodyStartY = startY + 35;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(16);
      pdf.setTextColor(71, 85, 105);
      pdf.text('Se certifica que', pageWidth / 2, bodyStartY, { align: 'center' });

      // Nombre del usuario
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(28);
      pdf.setTextColor(30, 41, 59);
      pdf.text(user?.full_name || user?.email, pageWidth / 2, bodyStartY + 18, { align: 'center' });

      // Línea bajo nombre
      pdf.setDrawColor(203, 213, 225);
      pdf.setLineWidth(0.3);
      pdf.line(pageWidth / 2 - 50, bodyStartY + 22, pageWidth / 2 + 50, bodyStartY + 22);

      // Texto de finalización
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(16);
      pdf.setTextColor(71, 85, 105);
      pdf.text('ha completado satisfactoriamente', pageWidth / 2, bodyStartY + 32, { align: 'center' });

      // Nombre del curso
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(20);
      pdf.setTextColor(146, 64, 14);
      const courseTitle = pdf.splitTextToSize(course.title, 140);
      pdf.text(courseTitle, pageWidth / 2, bodyStartY + 45, { align: 'center' });

      // Puntaje (si existe)
      let scoreY = bodyStartY + 60;
      if (certificate.score) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(14);
        pdf.setTextColor(71, 85, 105);
        pdf.text(`con una calificación de ${certificate.score}%`, pageWidth / 2, scoreY, { align: 'center' });
        scoreY += 15;
      }

      // Pie de página
      const footerY = pageHeight - 35;
      pdf.setFontSize(11);
      pdf.setTextColor(100, 116, 139);
      
      // Fecha
      pdf.text('Fecha', pageWidth / 4, footerY, { align: 'center' });
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(30, 41, 59);
      const issueDate = new Date(certificate.issued_date).toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      pdf.text(issueDate, pageWidth / 4, footerY + 8, { align: 'center' });

      // Número de certificado
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(100, 116, 139);
      pdf.text('Certificado N°', (pageWidth * 3) / 4, footerY, { align: 'center' });
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(30, 41, 59);
      pdf.text(certificate.certificate_number, (pageWidth * 3) / 4, footerY + 8, { align: 'center' });

      pdf.save(`certificado-${certificate.certificate_number}.pdf`);
      toast.success('Certificado descargado');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al generar el PDF');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Mis Capacitaciones</h1>
          <p className="text-slate-500">Seguimiento de tu progreso y certificaciones</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-50">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{enrolledCourses.length}</p>
                  <p className="text-xs text-slate-500">Cursos Inscritos</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-50">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{inProgress.length}</p>
                  <p className="text-xs text-slate-500">En Progreso</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-50">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{completed.length}</p>
                  <p className="text-xs text-slate-500">Completados</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-violet-50">
                   <Award className="w-5 h-5 text-violet-600" />
                 </div>
                 <div>
                   <p className="text-2xl font-bold">{uniqueCertificates.length}</p>
                   <p className="text-xs text-slate-500">Certificados</p>
                 </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* In Progress Courses */}
        {inProgress.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-4">En Progreso</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {inProgress.map((enrollment, index) => (
                <motion.div
                  key={enrollment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-lg">{enrollment.course.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-600">Progreso</span>
                          <span className="font-semibold">{enrollment.progress_percent}%</span>
                        </div>
                        <Progress value={enrollment.progress_percent} className="h-2" />
                      </div>

                      <Button 
                        className="w-full"
                        onClick={() => navigate(createPageUrl('CourseDetail') + `?id=${enrollment.course_id}`)}
                      >
                        Continuar
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Completed Courses */}
        {completed.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Completados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {completed.map((enrollment, index) => (
                <motion.div
                  key={enrollment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Card className="border-emerald-200 bg-emerald-50/30">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg flex-1">{enrollment.course.title}</CardTitle>
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {enrollment.score && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Puntaje:</span>
                          <span className="font-semibold">{enrollment.score}%</span>
                        </div>
                      )}
                      <Button 
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate(createPageUrl('CourseDetail') + `?id=${enrollment.course_id}`)}
                      >
                        Ver Detalles
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Certificates */}
        {uniqueCertificates.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Certificados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {uniqueCertificates.map((cert, index) => {
                const course = courses.find(c => c.id === cert.course_id);
                return (
                  <motion.div
                    key={cert.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Card className="border-purple-200 bg-purple-50/30">
                      <CardHeader>
                        <div className="flex items-center gap-2 mb-2">
                          <Award className="w-5 h-5 text-purple-600" />
                          <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                            Certificado
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{course?.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-600">N°:</span>
                            <span className="font-mono text-xs">{cert.certificate_number}</span>
                          </div>
                          {cert.score && (
                            <div className="flex justify-between">
                              <span className="text-slate-600">Puntaje:</span>
                              <span className="font-semibold">{cert.score}%</span>
                            </div>
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleDownloadCertificate(cert)}
                          disabled={downloading === cert.id}
                        >
                          {downloading === cert.id ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Generando...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Descargar Certificado
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {enrolledCourses.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-700 mb-2">No hay capacitaciones</h3>
            <p className="text-slate-500 mb-6">Comienza inscribiéndote en un curso</p>
            <Button onClick={() => navigate(createPageUrl('Courses'))}>
              Explorar Cursos
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}