import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function ChecklistExecutor({ template, user }) {
  const [responses, setResponses] = useState({});
  const [shift, setShift] = useState('');
  const [observations, setObservations] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const queryClient = useQueryClient();

  const [validationData, setValidationData] = useState(null);
  const [validating, setValidating] = useState(false);

  const submitMutation = useMutation({
    mutationFn: async () => {
      const requiredItems = template.items.filter(item => item.required);
      const completedRequired = requiredItems.every(item => responses[item.id] !== undefined);

      if (!completedRequired) {
        throw new Error('Todos los items requeridos deben ser completados');
      }

      const failures = template.items
        .filter(item => item.type === 'checkbox' && responses[item.id] === false)
        .map(item => item.name);

      const complianceRate = failures.length === 0 ? 100 : Math.round(
        ((template.items.length - failures.length) / template.items.length) * 100
      );

      // Validar con IA antes de guardar
      setValidating(true);
      try {
        const validation = await base44.functions.invoke('validateChecklistEntry', {
          templateName: template.name,
          responses: Object.entries(responses).filter(([k, v]) => !k.endsWith('_notes')),
          failures,
        });
        setValidationData(validation.data);
      } catch (error) {
        console.error('Validation error:', error);
      } finally {
        setValidating(false);
      }

      const execution = await base44.entities.ChecklistExecution.create({
        template_id: template.id,
        template_name: template.name,
        user_email: user.email,
        user_name: user.full_name,
        team: user.department || 'Sin equipo',
        shift,
        execution_date: new Date().toISOString(),
        responses: template.items.map(item => ({
          item_id: item.id,
          item_name: item.name,
          response: responses[item.id],
          notes: responses[`${item.id}_notes`],
        })),
        all_completed: completedRequired && failures.length === 0,
        compliance_rate: complianceRate,
        failures,
        observations,
        status: 'submitted',
        ai_validation: validationData,
      });

      // Alerta si algo no cumple
      if (failures.length > 0 && template.alert_on_failure) {
        await base44.entities.Notification.create({
          user_email: user.email,
          type: 'checklist_failure',
          title: `⚠️ Checklist incompleto: ${template.name}`,
          message: `Fallos en: ${failures.join(', ')}`,
          action_url: `/Checklists?id=${execution.id}`,
        });
      }

      return execution;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklistExecutions'] });
      setSubmitted(true);
      setResponses({});
      setObservations('');
      setValidationData(null);
      toast.success('Checklist completado correctamente');
      setTimeout(() => setSubmitted(false), 3000);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleResponseChange = (itemId, value) => {
    setResponses(prev => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const requiredCount = template.items.filter(i => i.required).length;
  const completedCount = template.items.filter(i => responses[i.id] !== undefined).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{template.name}</CardTitle>
              <p className="text-sm text-slate-600 mt-1">{template.description}</p>
            </div>
            <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
              {completedCount}/{requiredCount} completados
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Shift Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Turno *
            </label>
            <Select value={shift} onValueChange={setShift}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu turno" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mañana">Turno Mañana</SelectItem>
                <SelectItem value="tarde">Turno Tarde</SelectItem>
                <SelectItem value="noche">Turno Noche</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Checklist Items */}
          <div className="space-y-4 bg-slate-50 p-4 rounded-lg">
            {template.items.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="pb-4 border-b border-slate-200 last:border-0 last:pb-0"
              >
                <div className="flex items-start gap-4">
                  {item.type === 'checkbox' && (
                    <div className="flex items-center gap-3 flex-1">
                      <Checkbox
                        checked={responses[item.id] === true}
                        onCheckedChange={(checked) =>
                          handleResponseChange(item.id, checked)
                        }
                        className="w-6 h-6"
                      />
                      <div className="flex-1">
                        <label className="font-medium text-slate-900">
                          {item.name}
                          {item.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {item.description && (
                          <p className="text-sm text-slate-600">{item.description}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {item.type === 'text' && (
                    <div className="flex-1">
                      <label className="block font-medium text-slate-900 mb-2">
                        {item.name}
                        {item.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <Input
                        placeholder="Ingresa tu respuesta"
                        value={responses[item.id] || ''}
                        onChange={(e) =>
                          handleResponseChange(item.id, e.target.value)
                        }
                      />
                    </div>
                  )}

                  {item.type === 'select' && (
                    <div className="flex-1">
                      <label className="block font-medium text-slate-900 mb-2">
                        {item.name}
                        {item.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <Select
                        value={responses[item.id] || ''}
                        onValueChange={(value) =>
                          handleResponseChange(item.id, value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                          {item.options?.map(opt => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Observations */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Observaciones
            </label>
            <textarea
              placeholder="Agrega observaciones o notas adicionales"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
            />
          </div>

          {/* Validation Alert */}
          {validationData && validationData.risk_level && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg border-l-4 ${
                validationData.risk_level === 'crítico' ? 'bg-red-50 border-red-400' :
                validationData.risk_level === 'alto' ? 'bg-orange-50 border-orange-400' :
                'bg-yellow-50 border-yellow-400'
              }`}
            >
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 mt-0.5 text-orange-600 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 mb-1">
                    Validación IA: Riesgo {validationData.risk_level}
                  </h4>
                  {validationData.pattern_alerts?.length > 0 && (
                    <ul className="text-sm text-slate-700 space-y-1">
                      {validationData.pattern_alerts.slice(0, 2).map((alert, idx) => (
                        <li key={idx}>• {alert}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Submit Button */}
          <Button
            onClick={() => submitMutation.mutate()}
            disabled={submitMutation.isPending || validating || !shift}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            {submitted ? (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Checklist Completado
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 mr-2" />
                {submitMutation.isPending || validating ? 'Validando...' : 'Enviar Checklist'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}