import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Calendar, AlertTriangle, CheckCircle, Clock,
  Edit, Trash2, Upload, Download
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  notifyExamExpiring,
  notifyExamExpired,
  notifyExamScheduled
} from './notificationHelpers';

export default function ExamManagement({ user, exams }) {
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formData, setFormData] = useState({
    exam_type: 'general',
    exam_name: '',
    exam_date: '',
    expiry_date: '',
    status: 'vigente',
    document_url: '',
    notes: '',
    notification_email: '',
  });

  const queryClient = useQueryClient();

  // Create/Update exam mutation
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editingExam) {
        return await base44.entities.OccupationalExam.update(editingExam.id, {
          ...data,
          user_email: user.email,
        });
      } else {
        const exam = await base44.entities.OccupationalExam.create({
          ...data,
          user_email: user.email,
        });
        
        // Send notification
        await notifyExamScheduled(user.email, data.exam_name, data.exam_date);
        
        return exam;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success(editingExam ? 'Examen actualizado' : 'Examen registrado');
      resetForm();
    },
  });

  // Delete exam mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.OccupationalExam.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success('Examen eliminado');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.exam_name || !formData.expiry_date) {
      toast.error('Nombre y fecha de vencimiento son obligatorios');
      return;
    }

    // Auto-calculate status based on expiry date
    const daysUntilExpiry = differenceInDays(new Date(formData.expiry_date), new Date());
    let status = 'vigente';
    if (daysUntilExpiry < 0) {
      status = 'vencido';
    } else if (daysUntilExpiry <= 30) {
      status = 'proximo_vencer';
    }

    saveMutation.mutate({ ...formData, status });
  };

  const handleEdit = (exam) => {
    setEditingExam(exam);
    setFormData({
      exam_type: exam.exam_type,
      exam_name: exam.exam_name,
      exam_date: exam.exam_date || '',
      expiry_date: exam.expiry_date,
      status: exam.status,
      document_url: exam.document_url || '',
      notes: exam.notes || '',
      notification_email: exam.notification_email || '',
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingExam(null);
    setFormData({
      exam_type: 'general',
      exam_name: '',
      exam_date: '',
      expiry_date: '',
      status: 'vigente',
      document_url: '',
      notes: '',
      notification_email: '',
    });
  };

  const getStatusBadge = (exam) => {
    const daysUntilExpiry = differenceInDays(new Date(exam.expiry_date), new Date());
    
    if (exam.status === 'vencido' || daysUntilExpiry < 0) {
      return (
        <Badge className="bg-red-50 text-red-700 border-red-200">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Vencido
        </Badge>
      );
    } else if (exam.status === 'proximo_vencer' || daysUntilExpiry <= 30) {
      return (
        <Badge className="bg-amber-50 text-amber-700 border-amber-200">
          <Clock className="w-3 h-3 mr-1" />
          Por vencer ({daysUntilExpiry} días)
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Vigente
        </Badge>
      );
    }
  };

  const examTypeLabels = {
    altura: 'Trabajo en Altura',
    espacios_confinados: 'Espacios Confinados',
    psicosensotecnico: 'Psicosensotécnico',
    general: 'General',
    otro: 'Otro',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
       <div className="flex justify-between items-center">
         <div>
           <h2 className="text-xl font-bold text-slate-900">Mis Exámenes Ocupacionales</h2>
           <p className="text-sm text-slate-500">Gestiona y monitorea tus exámenes médicos</p>
         </div>
         {user && user.role === 'admin' && (
           <Button onClick={() => setShowForm(!showForm)}>
             <Plus className="w-4 h-4 mr-2" />
             {showForm ? 'Cancelar' : 'Agregar Examen'}
           </Button>
         )}
       </div>

      {/* Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{editingExam ? 'Editar' : 'Nuevo'} Examen Ocupacional</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de Examen *</Label>
                    <Select
                      value={formData.exam_type}
                      onValueChange={(value) => setFormData({ ...formData, exam_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(examTypeLabels).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Nombre del Examen *</Label>
                    <Input
                      value={formData.exam_name}
                      onChange={(e) => setFormData({ ...formData, exam_name: e.target.value })}
                      placeholder="Ej: Examen de Altura 2024"
                    />
                  </div>

                  <div>
                    <Label>Fecha del Examen</Label>
                    <Input
                      type="date"
                      value={formData.exam_date}
                      onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Fecha de Vencimiento *</Label>
                    <Input
                      type="date"
                      value={formData.expiry_date}
                      onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label>Email de Notificación</Label>
                  <Input
                    type="email"
                    value={formData.notification_email}
                    onChange={(e) => setFormData({ ...formData, notification_email: e.target.value })}
                    placeholder="email@ejemplo.com"
                  />
                  <p className="text-xs text-slate-500 mt-1">Email para enviar recordatorios de vencimiento</p>
                </div>

                <div>
                  <Label>URL del Documento</Label>
                  <Input
                    value={formData.document_url}
                    onChange={(e) => setFormData({ ...formData, document_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <Label>Notas</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notas adicionales..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? 'Guardando...' : (editingExam ? 'Actualizar' : 'Guardar')}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Exams List */}
      {exams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500">No tienes exámenes registrados</p>
            {user?.role === 'admin' && (
              <Button variant="link" onClick={() => setShowForm(true)} className="mt-2">
                Agregar tu primer examen
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-l-4 border-l-indigo-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {exam.exam_name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {examTypeLabels[exam.exam_type]}
                      </p>
                    </div>
                    {getStatusBadge(exam)}
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    {exam.exam_date && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-4 h-4" />
                        Realizado: {format(new Date(exam.exam_date), "d 'de' MMMM, yyyy", { locale: es })}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-4 h-4" />
                      Vence: {format(new Date(exam.expiry_date), "d 'de' MMMM, yyyy", { locale: es })}
                    </div>
                  </div>

                  {exam.notes && (
                    <p className="text-xs text-slate-500 mb-3 p-2 bg-slate-50 rounded">
                      {exam.notes}
                    </p>
                  )}

                  <div className="flex gap-2">
                    {exam.document_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(exam.document_url, '_blank')}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Ver Documento
                      </Button>
                    )}
                    {user?.role === 'admin' && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(exam)}
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(exam.id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Eliminar
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}