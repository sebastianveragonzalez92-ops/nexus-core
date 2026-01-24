import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ImportFromSheets({ onImportComplete }) {
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [range, setRange] = useState('Sheet1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleImport = async () => {
    if (!spreadsheetId.trim()) {
      setResult({ error: 'Por favor ingresa el ID de la hoja' });
      return;
    }

    setLoading(true);
    try {
      const response = await base44.functions.invoke('importWorkOrdersFromSheets', {
        spreadsheetId: spreadsheetId.trim(),
        range: range.trim() || 'Sheet1'
      });

      setResult(response.data);
      if (response.data.success && onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      setResult({ error: error.message || 'Error al importar' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Importar desde Google Sheets
          </CardTitle>
          <CardDescription>
            Importa órdenes de trabajo desde una hoja de cálculo de Google Sheets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              ID de la Hoja de Google Sheets
            </label>
            <Input
              placeholder="ej: 1BxiMVs0XRA5nFMoon9pFQhO..."
              value={spreadsheetId}
              onChange={(e) => setSpreadsheetId(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-slate-500 mt-1">
              Puedes encontrarlo en la URL de tu hoja (entre /d/ y /edit)
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Nombre de la Hoja (opcional)
            </label>
            <Input
              placeholder="Sheet1"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-900">
              <strong>Formato esperado:</strong> La hoja debe tener columnas: asset_id, type, priority, description, estimated_hours, assigned_to (opcional)
            </p>
          </div>

          <Button
            onClick={handleImport}
            disabled={loading || !spreadsheetId.trim()}
            className="w-full"
          >
            {loading ? 'Importando...' : 'Importar Órdenes'}
          </Button>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg flex gap-3 ${
                result.error
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-green-50 border border-green-200'
              }`}
            >
              {result.error ? (
                <>
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Error</p>
                    <p className="text-sm text-red-800">{result.error}</p>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">
                      ¡Importación exitosa!
                    </p>
                    <p className="text-sm text-green-800">
                      Se importaron {result.imported} de {result.total} órdenes de trabajo
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}