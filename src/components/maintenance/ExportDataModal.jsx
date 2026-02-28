import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Database, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function ExportDataModal({ open, onOpenChange }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleExport = async (type) => {
    setLoading(true);
    setResult(null);

    try {
      const response = await base44.functions.invoke('exportToGoogleSheets', { type });
      
      setResult({
        success: true,
        message: response.data.message,
        url: response.data.spreadsheetUrl,
      });

      // Abrir en nueva pestaña
      if (response.data.spreadsheetUrl) {
        window.open(response.data.spreadsheetUrl, '_blank');
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar Datos</DialogTitle>
          <DialogDescription>Exporta reportes e inventario a Google Sheets</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="maintenance" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
            <TabsTrigger value="inventory">Inventario</TabsTrigger>
          </TabsList>

          <TabsContent value="maintenance" className="space-y-4 mt-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900 mb-4">
                Exporta todos los reportes de mantenimiento a una hoja de cálculo en Google Sheets.
              </p>
              <Button
                onClick={() => handleExport('maintenance')}
                disabled={loading}
                className="w-full gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Exportar Reportes
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4 mt-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-900 mb-4">
                Exporta el inventario de repuestos a una hoja de cálculo en Google Sheets.
              </p>
              <Button
                onClick={() => handleExport('inventory')}
                disabled={loading}
                className="w-full gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4" />
                    Exportar Inventario
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {result && (
          <div className={`p-4 rounded-lg border ${result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex gap-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`text-sm ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                  {result.message}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-slate-500 p-3 bg-slate-50 rounded border border-slate-200">
          <p className="font-semibold mb-1">📌 Nota sobre OneDrive:</p>
          <p>OneDrive no está disponible actualmente. Los archivos se exportan a Google Drive. Puedes descargarlos y subirlos manualmente a OneDrive si lo necesitas.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}