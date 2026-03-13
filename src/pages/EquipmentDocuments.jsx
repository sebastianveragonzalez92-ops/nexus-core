import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Upload, FileText, Search, AlertTriangle, Calendar, TrendingUp,
  FolderOpen, ArrowLeft
} from 'lucide-react';
import DocumentUploader from '@/components/documents/DocumentUploader';
import DocumentList from '@/components/documents/DocumentList';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function EquipmentDocuments() {
  const [searchEquipment, setSearchEquipment] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [uploaderOpen, setUploaderOpen] = useState(false);

  const { data: equipment = [], isLoading: loadingEquipment } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => base44.entities.Equipment.list(),
  });

  const { data: allDocuments = [], refetch: refetchDocs } = useQuery({
    queryKey: ['equipment-documents'],
    queryFn: () => base44.entities.EquipmentDocument.list(),
  });

  const filteredEquipment = equipment.filter(eq =>
    !searchEquipment ||
    eq.nombre?.toLowerCase().includes(searchEquipment.toLowerCase()) ||
    eq.numero_interno?.toLowerCase().includes(searchEquipment.toLowerCase()) ||
    eq.tipo_equipo?.toLowerCase().includes(searchEquipment.toLowerCase())
  );

  const selectedEquipmentDocs = selectedEquipment
    ? allDocuments.filter(doc => doc.equipment_id === selectedEquipment.id && doc.is_active)
    : [];

  const getEquipmentDocCount = (equipmentId) => {
    return allDocuments.filter(d => d.equipment_id === equipmentId && d.is_active).length;
  };

  const getExpiringDocs = () => {
    return allDocuments.filter(doc => {
      if (!doc.expiry_date || !doc.is_active) return false;
      const expiryDate = new Date(doc.expiry_date);
      const daysUntil = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
      return daysUntil <= 30 && daysUntil >= 0;
    });
  };

  const getExpiredDocs = () => {
    return allDocuments.filter(doc => {
      if (!doc.expiry_date || !doc.is_active) return false;
      return new Date(doc.expiry_date) < new Date();
    });
  };

  const expiringDocs = getExpiringDocs();
  const expiredDocs = getExpiredDocs();

  if (loadingEquipment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Repositorio de Documentos</h1>
            <p className="text-slate-600 mt-1">
              Gestión centralizada de manuales, planos, garantías y certificados por equipo
            </p>
          </div>
        </div>

        {/* Stats */}
        {!selectedEquipment && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      {allDocuments.filter(d => d.is_active).length}
                    </p>
                    <p className="text-sm text-slate-600">Documentos Totales</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{equipment.length}</p>
                    <p className="text-sm text-slate-600">Equipos con Documentos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{expiringDocs.length}</p>
                    <p className="text-sm text-slate-600">Por Vencer (30 días)</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{expiredDocs.length}</p>
                    <p className="text-sm text-slate-600">Documentos Vencidos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Vista de lista de equipos */}
        {!selectedEquipment ? (
          <Card>
            <CardHeader>
              <CardTitle>Selecciona un Equipo</CardTitle>
              <CardDescription>
                Elige el equipo para gestionar sus documentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre, número interno o tipo de equipo..."
                  value={searchEquipment}
                  onChange={(e) => setSearchEquipment(e.target.value)}
                  className="pl-9"
                />
              </div>

              {filteredEquipment.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-slate-600">No se encontraron equipos</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEquipment.map(eq => {
                    const docCount = getEquipmentDocCount(eq.id);
                    return (
                      <button
                        key={eq.id}
                        onClick={() => setSelectedEquipment(eq)}
                        className="text-left border border-slate-200 rounded-xl p-4 hover:border-cyan-500 hover:shadow-md transition bg-white"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 truncate">{eq.nombre}</h3>
                            <p className="text-sm text-slate-600 truncate">{eq.tipo_equipo}</p>
                          </div>
                          {docCount > 0 && (
                            <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200">
                              {docCount} docs
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">N° Interno: {eq.numero_interno}</p>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          /* Vista de documentos del equipo seleccionado */
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedEquipment(null)}
                      className="mb-2 -ml-2"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Volver a equipos
                    </Button>
                    <CardTitle className="text-2xl">{selectedEquipment.nombre}</CardTitle>
                    <CardDescription className="mt-1">
                      {selectedEquipment.tipo_equipo} · N° Interno: {selectedEquipment.numero_interno}
                    </CardDescription>
                  </div>
                  <Button onClick={() => setUploaderOpen(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Subir Documento
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DocumentList
                  documents={selectedEquipmentDocs}
                  onRefresh={refetchDocs}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Uploader Modal */}
      <DocumentUploader
        equipment={selectedEquipment}
        open={uploaderOpen}
        onClose={() => setUploaderOpen(false)}
        onSuccess={refetchDocs}
      />
    </div>
  );
}