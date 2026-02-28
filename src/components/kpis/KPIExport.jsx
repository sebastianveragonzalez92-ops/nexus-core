import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

export default function KPIExport({ kpis, kpiValues }) {
  const handleExport = () => {
    try {
      // Preparar datos para exportar
      const exportData = kpis.map(kpi => {
        const values = kpiValues.filter(v => v.kpi_id === kpi.id);
        return {
          nombre_kpi: kpi.name,
          descripcion: kpi.description || '',
          objetivo: kpi.target,
          unidad: kpi.unit,
          registros: values.length,
          ultimo_valor: values[values.length - 1]?.value || 'N/A',
          periodo_ultimo: values[values.length - 1]?.period || 'N/A',
        };
      });

      // Convertir a CSV
      const headers = Object.keys(exportData[0] || {});
      const csv = [
        headers.join(','),
        ...exportData.map(row => headers.map(h => `"${row[h]}"`).join(',')),
      ].join('\n');

      // Descargar
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `kpis_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.click();

      toast.success('KPIs exportados correctamente');
    } catch (error) {
      toast.error('Error al exportar KPIs');
    }
  };

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      className="rounded-lg"
    >
      <Download className="w-4 h-4 mr-2" />
      Exportar
    </Button>
  );
}