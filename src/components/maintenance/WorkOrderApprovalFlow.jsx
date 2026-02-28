import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CheckCircle, XCircle, SendHorizonal, UserCheck, Loader2 } from 'lucide-react';

const STATUS_LABELS = {
  pendiente: { label: 'Pendiente', color: 'bg-slate-100 text-slate-700' },
  asignada: { label: 'Asignada', color: 'bg-blue-100 text-blue-700' },
  en_progreso: { label: 'En progreso', color: 'bg-indigo-100 text-indigo-700' },
  en_aprobacion: { label: 'En aprobación', color: 'bg-amber-100 text-amber-800' },
  completada: { label: 'Completada', color: 'bg-green-100 text-green-700' },
  cancelada: { label: 'Cancelada', color: 'bg-gray-100 text-gray-600' },
};

export default function WorkOrderApprovalFlow({ wo, user, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [assignEmail, setAssignEmail] = useState(wo.assigned_to || '');

  const isAdmin = user?.role === 'admin';
  const isOwner = wo.created_by === user?.email || wo.assigned_to === user?.email;

  const call = async (action, extra = {}) => {
    setLoading(true);
    try {
      await base44.functions.invoke('maintenanceWorkflow', { action, work_order_id: wo.id, ...extra });
      toast.success(
        action === 'submit_for_approval' ? 'Enviado a aprobación' :
        action === 'approve' ? 'OT aprobada' :
        action === 'reject' ? 'OT rechazada' :
        'Asignación guardada'
      );
      onRefresh?.();
    } catch (e) {
      toast.error(e.message || 'Error en la operación');
    } finally {
      setLoading(false);
    }
  };

  const st = STATUS_LABELS[wo.status] || STATUS_LABELS.pendiente;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Badge className={`${st.color} text-xs font-medium`}>{st.label}</Badge>

      {/* Technician: submit for approval */}
      {!isAdmin && isOwner && wo.status === 'en_progreso' && (
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" disabled={loading} onClick={() => call('submit_for_approval')}>
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <SendHorizonal className="w-3 h-3" />}
          Enviar a aprobación
        </Button>
      )}

      {/* Admin: approve / reject */}
      {isAdmin && wo.status === 'en_aprobacion' && (
        <>
          <Button size="sm" className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700" disabled={loading} onClick={() => call('approve')}>
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
            Aprobar
          </Button>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-red-600 border-red-200" disabled={loading} onClick={() => setShowRejectDialog(true)}>
            <XCircle className="w-3 h-3" /> Rechazar
          </Button>
        </>
      )}

      {/* Admin: assign */}
      {isAdmin && (wo.status === 'pendiente' || wo.status === 'asignada') && (
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1" disabled={loading} onClick={() => setShowAssignDialog(true)}>
          <UserCheck className="w-3 h-3" /> Asignar
        </Button>
      )}

      {/* Reject dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rechazar Orden de Trabajo</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-slate-600">Indica el motivo del rechazo para notificar al técnico.</p>
            <Textarea
              placeholder="Motivo del rechazo..."
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancelar</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={() => {
              setShowRejectDialog(false);
              call('reject', { rejection_reason: rejectReason });
            }}>Rechazar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Asignar Técnico</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <Label>Email del técnico</Label>
            <Input
              placeholder="tecnico@empresa.com"
              value={assignEmail}
              onChange={e => setAssignEmail(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignDialog(false)}>Cancelar</Button>
            <Button onClick={() => {
              setShowAssignDialog(false);
              call('assign', { assigned_to: assignEmail });
            }}>Asignar y notificar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}