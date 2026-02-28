import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Download, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ExportDataModal from './ExportDataModal';

export default function ExportButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('exportMaintenanceLogs', {});
      setResult(response.data);
    } catch (error) {
      setResult({ error: error.message || 'Error al exportar' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-3">
        <div className="flex gap-2">
          <Button
            onClick={handleExport}
            disabled={loading}
            variant="outline"
            className="gap-2"
          >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Exportando...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Exportar a Google Drive
          </>
          )}
        </Button>
        <Button
          onClick={() => setModalOpen(true)}
          variant="outline"
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Exportar a Google Sheets
        </Button>
        </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg text-sm flex gap-2 ${
            result.error
              ? 'bg-red-50 border border-red-200'
              : 'bg-green-50 border border-green-200'
          }`}
        >
          {result.error ? (
            <>
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <p className="text-red-800">{result.error}</p>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-green-900 font-medium">{result.message}</p>
                <a
                  href={result.driveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-700 hover:underline text-xs"
                >
                  Abrir en Google Drive →
                </a>
              </div>
            </>
          )}
        </motion.div>
      )}
      </div>

      <ExportDataModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}