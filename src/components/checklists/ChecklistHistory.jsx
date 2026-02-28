import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ChevronDown, Download } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ChecklistHistory({ executions, canReview }) {
  const [expandedId, setExpandedId] = useState(null);

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-slate-100 text-slate-700',
      submitted: 'bg-blue-100 text-blue-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    return colors[status] || colors.draft;
  };

  const getComplianceColor = (rate) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      {executions.length > 0 ? (
        executions.map((execution, idx) => (
          <motion.div
            key={execution.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card>
              <CardHeader
                className="cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() =>
                  setExpandedId(expandedId === execution.id ? null : execution.id)
                }
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900">
                        {execution.template_name}
                      </h3>
                      <Badge className={getStatusColor(execution.status)}>
                        {execution.status}
                      </Badge>
                      <Badge variant="outline">
                        Turno: {execution.shift || 'N/A'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">
                      {format(
                        new Date(execution.execution_date),
                        'dd MMM yyyy, HH:mm',
                        { locale: es }
                      )}
                      {' · '}
                      <span className="font-medium">{execution.user_name}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getComplianceColor(execution.compliance_rate)}`}>
                        {execution.compliance_rate}%
                      </div>
                      <p className="text-xs text-slate-600">Cumplimiento</p>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        expandedId === execution.id ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>
              </CardHeader>

              {expandedId === execution.id && (
                <CardContent className="border-t border-slate-200 pt-6 space-y-6">
                  {/* Items Responses */}
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-4">Respuestas</h4>
                    <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                      {execution.responses?.map((response, ridx) => (
                        <motion.div
                          key={ridx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: ridx * 0.05 }}
                          className="flex items-start justify-between pb-3 border-b border-slate-200 last:border-0 last:pb-0"
                        >
                          <div>
                            <p className="font-medium text-slate-900">
                              {response.item_name}
                            </p>
                            {response.notes && (
                              <p className="text-sm text-slate-600 mt-1">
                                {response.notes}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            {typeof response.response === 'boolean' ? (
                              <Badge
                                variant={
                                  response.response ? 'default' : 'destructive'
                                }
                              >
                                {response.response ? '✓ OK' : '✗ No'}
                              </Badge>
                            ) : (
                              <span className="text-sm font-medium text-slate-700">
                                {response.response}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Failures */}
                  {execution.failures?.length > 0 && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-900 mb-2">
                        ⚠️ Items que no cumplieron:
                      </h4>
                      <ul className="space-y-1">
                        {execution.failures.map((failure, fidx) => (
                          <li key={fidx} className="text-sm text-red-700">
                            • {failure}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Observations */}
                  {execution.observations && (
                    <div>
                      <h4 className="font-semibold text-slate-900 mb-2">
                        Observaciones
                      </h4>
                      <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg">
                        {execution.observations}
                      </p>
                    </div>
                  )}

                  {/* Review Section */}
                  {canReview && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-3">
                        🔍 Revisión del Supervisor
                      </h4>
                      <div className="flex gap-3">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                        >
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Export Button */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-slate-700 hover:bg-slate-100"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar PDF
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        ))
      ) : (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-slate-500">
              No hay checklists completados aún
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}