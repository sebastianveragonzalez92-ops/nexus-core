import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink } from 'lucide-react';

export default function DocumentViewer({ document, open, onClose }) {
  if (!document) return null;

  const isPDF = document.file_type?.includes('pdf');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate">{document.title}</span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(document.file_url, '_blank')}
              >
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(document.file_url, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir en nueva pestaña
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden bg-slate-100">
          {isPDF ? (
            <iframe
              src={document.file_url}
              className="w-full h-full border-0"
              title={document.title}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-slate-600 mb-4">
                  La previsualización solo está disponible para archivos PDF
                </p>
                <Button onClick={() => window.open(document.file_url, '_blank')}>
                  <Download className="w-4 h-4 mr-2" />
                  Descargar archivo
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}