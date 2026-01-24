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
import { Plus, Calendar, AlertTriangle, CheckCircle, Clock, Edit, Trash2, Download } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export default function ExamManagement({ user, exams }) {
  const isAdmin = user?.role === 'admin';
  
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
  });

  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editingExam) {
        return await base44.entities.OccupationalExam.update(editingExam.id, data);
      } else {
        return await base44.entities.OccupationalExam.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      toast.success(editingExam ? 'Examen actualizado' : 'Examen registrado');
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || 'Error al guardar');
    },
  });

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

    const daysUntilExpiry = differenceInDays(new Date(formData.expiry_date), new Date());
    let status = 'vigente';
    if (daysUntilExpiry < 0) status = 'vencido';
    else if (daysUntilExpiry <= 30) status = 'proximo_vencer';

    const data = {
      exam_type: formData.exam_type,
      exam_name: formData.exam_name,
      exam_date: formData.exam_date || null,
      expiry_date: formData.expiry_date,
      status,
      user_email: user?.email,
      document_url: formData.document_url || '',
      notes: formData.notes || '',
    };

    saveMutation.mutate(data);
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
    });
  };

  const getStatusBadge = (exam) => {
    const daysUntilExpiry = differenceInDays(new Date(exam.expiry_date), new Date());
    
    if (exam.status === 'vencido' || daysUntilExpiry < 0) {
      return <Badge className="bg-red-50 text-red-700"><AlertTriangle className="w-3 h-3 mr-1" />Vencido</Badge>;
    } else if (exam.status === 'proximo_vencer' || daysUntilExpiry <= 30) {
      return <Badge className="bg-amber-50 text-amber-700"><Clock className="w-3 h-3 mr-1" />Por vencer</Badge>;
    } else {
      return <Badge className="bg-green-50 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Vigente</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Mis Exámenes Ocupacionales</h2>
          <p className="text-sm text-slate-500">Gestiona tus exámenes médicos</p>
        </div>
        {isAdmin && (
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? 'Cancelar' : 'Agregar Examen'}
          </Button>
        )}
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle>{editingExam ? 'Editar' : 'Nuevo'} Examen</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo *</Label>
                    <Select value={formData.exam_type} onValueChange={(value) => setFormData({ ...formData, exam_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="altura">Altura</SelectItem>
                        <SelectItem value="espacios_confinados">Espacios Confinados</SelectItem>
                        <SelectItem value="psicosensotecnico">Psicosensotécnico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Nombre *</Label>
                    <Input value={formData.exam_name} onChange={(e) => setFormData({ ...formData, exam_name: e.target.value })} placeholder="Nombre" />
                  </div>
                  <div>
                    <Label>Fecha del Examen</Label>
                    <Input type="date" value={formData.exam_date} onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })} />
                  </div>
                  <div>
                    <Label>Vencimiento *</Label>
                    <Input type="date" value={formData.expiry_date} onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })} />
                  </div>
                </div>
                <div>
                  <Label>URL Documento</Label>
                  <Input value={formData.document_url} onChange={(e) => setFormData({ ...formData, document_url: e.target.value })} placeholder="https://..." />
                </div>
                <div>
                  <Label>Notas</Label>
                  <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={saveMutation.isPending}>
                    {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
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

      {exams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500">Sin exámenes registrados</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => (
            <Card key={exam.id} className="border-l-4 border-l-indigo-500">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{exam.exam_name}</h3>
                    <p className="text-sm text-slate-500">{exam.exam_type}</p>
                  </div>
                  {getStatusBadge(exam)}
                </div>
                <div className="space-y-1 text-sm mb-3">
                  {exam.exam_date && <p>Realizado: {format(new Date(exam.exam_date), 'd MMM yyyy', { locale: es })}</p>}
                  <p>Vence: {format(new Date(exam.expiry_date), 'd MMM yyyy', { locale: es })}</p>
                </div>
                <div className="flex gap-2">
                  {exam.document_url && (
                    <Button size="sm" variant="outline" onClick={() => window.open(exam.document_url, '_blank')}>
                      <Download className="w-3 h-3 mr-1" />
                      Ver
                    </Button>
                  )}
                  {isAdmin && (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(exam)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(exam.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}