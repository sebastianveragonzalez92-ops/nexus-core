import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  FileText, Download, Eye, Trash2, Search, Calendar,
  FileSpreadsheet, FileImage, Filter, AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import DocumentViewer from './DocumentViewer';

const CATEGORY_LABELS = {
  manual_tecnico: 'Manual Técnico',
  plano: 'Plano',
  garantia: 'Garantía',
  certificado_seguridad: 'Certificado de Seguridad',
  hoja_datos: 'Hoja de Datos',
  protocolo_mantenimiento: 'Protocolo de Mantenimiento',
  otro: 'Otro',
};

const CATEGORY_COLORS = {
  manual_tecnico: 'bg-blue-100 text-blue-700 border-blue-200',
  plano: 'bg-purple-100 text-purple-700 border-purple-200',
  garantia: 'bg-green-100 text-green-700 border-green-200',
  certificado_seguridad: 'bg-red-100 text-red-700 border-red-200',
  hoja_datos: 'bg-amber-100 text-amber-700 border-amber-200',
  protocolo_mantenimiento: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  otro: 'bg-slate-100 text-slate-700 border-slate-200',
};

function getFileIcon(fileType) {
  if (!fileType) return FileText;
  if (fileType.includes('pdf')) return FileText;
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) return FileSpreadsheet;
  if (fileType.includes('image')) return FileImage;
  return FileText;
}

export default function DocumentList({ documents, onDelete, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewerDoc, setViewerDoc] = useState(null);

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = !searchTerm || 
      doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory && doc.is_active;
  });

  const handleDelete = async (doc) => {
    if (!confirm(`¿Eliminar "${doc.title}"?`)) return;
    try {
      await base44.entities.EquipmentDocument.delete(doc.id);
      toast.success('Documento eliminado');
      onRefresh?.();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Error al eliminar el documento');
    }
  };

  const handleDownload = (doc) => {
    window.open(doc.file_url, '_blank');
  };

  const isExpiringSoon = (doc) => {
    if (!doc.expiry_date) return false;
    const expiryDate = new Date(doc.expiry_date);
    const daysUntilExpiry = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (doc) => {
    if (!doc.expiry_date) return false;
    return new Date(doc.expiry_date) < new Date();
  };

  return (
    <>
      <div className="space-y-4">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por título, descripción o etiquetas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista de documentos */}
        {filteredDocs.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-300 rounded-xl">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600">
              {searchTerm || categoryFilter !== 'all' 
                ? 'No se encontraron documentos con esos filtros'
                : 'No hay documentos subidos aún'}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredDocs.map(doc => {
              const Icon = getFileIcon(doc.file_type);
              const expired = isExpired(doc);
              const expiringSoon = isExpiringSoon(doc);

              return (
                <div
                  key={doc.id}
                  className={`border rounded-xl p-4 hover:shadow-md transition ${
                    expired ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                      expired ? 'bg-red-100' : 'bg-slate-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${expired ? 'text-red-600' : 'text-slate-600'}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate">{doc.title}</h3>
                          {doc.description && (
                            <p className="text-sm text-slate-600 mt-1 line-clamp-2">{doc.description}</p>
                          )}
                        </div>
                        <Badge className={CATEGORY_COLORS[doc.category] || CATEGORY_COLORS.otro}>
                          {CATEGORY_LABELS[doc.category]}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                        <span>{doc.file_name}</span>
                        <span>{(doc.file_size / 1024 / 1024).toFixed(2)} MB</span>
                        {doc.version && <span>Versión: {doc.version}</span>}
                        {doc.expiry_date && (
                          <span className={`flex items-center gap-1 ${
                            expired ? 'text-red-600 font-medium' : expiringSoon ? 'text-amber-600 font-medium' : ''
                          }`}>
                            <Calendar className="w-3 h-3" />
                            {expired ? 'Vencido: ' : 'Vence: '}
                            {format(new Date(doc.expiry_date), 'dd MMM yyyy', { locale: es })}
                            {expiringSoon && !expired && <AlertTriangle className="w-3 h-3 ml-1" />}
                          </span>
                        )}
                      </div>

                      {doc.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {doc.tags.map((tag, i) => (
                            <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {doc.file_type?.includes('pdf') && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setViewerDoc(doc)}
                          title="Previsualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownload(doc)}
                        title="Descargar"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(doc)}
                        title="Eliminar"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Viewer modal */}
      {viewerDoc && (
        <DocumentViewer
          document={viewerDoc}
          open={!!viewerDoc}
          onClose={() => setViewerDoc(null)}
        />
      )}
    </>
  );
}