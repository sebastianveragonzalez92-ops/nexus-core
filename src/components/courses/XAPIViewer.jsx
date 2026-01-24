import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function XAPIViewer({ contentUrl, courseId, enrollment, onProgressUpdate }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [xapiData, setXapiData] = useState(null);
  const [statements, setStatements] = useState([]);
  const iframeRef = useRef(null);

  useEffect(() => {
    if (!contentUrl) {
      setError('No se ha configurado contenido xAPI para este curso');
      setLoading(false);
      return;
    }

    // Configurar listener para mensajes xAPI desde el iframe
    const handleMessage = (event) => {
      try {
        if (event.data && event.data.type === 'xapi') {
          handleXAPIStatement(event.data.statement);
        }
      } catch (err) {
        console.error('Error procesando mensaje xAPI:', err);
      }
    };

    window.addEventListener('message', handleMessage);
    setLoading(false);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [contentUrl]);

  const handleXAPIStatement = (statement) => {
    setStatements(prev => [...prev, statement]);

    // Analizar el tipo de statement
    const verb = statement.verb?.id || statement.verb;
    
    if (verb.includes('completed') || verb.includes('passed')) {
      // Curso completado
      if (onProgressUpdate) {
        onProgressUpdate(100);
      }
      toast.success('¡Contenido completado!');
    } else if (verb.includes('progressed')) {
      // Progreso intermedio
      const progress = statement.result?.extensions?.progress || statement.result?.score?.scaled;
      if (progress && onProgressUpdate) {
        onProgressUpdate(Math.round(progress * 100));
      }
    } else if (verb.includes('initialized')) {
      // Contenido iniciado
      if (onProgressUpdate && enrollment.progress_percent === 0) {
        onProgressUpdate(5);
      }
    }
  };

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-slate-600">Cargando contenido xAPI...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="border-b border-slate-200">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5 text-indigo-600" />
              Contenido Interactivo xAPI
            </CardTitle>
            {enrollment.progress_percent === 100 && (
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-semibold">Completado</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
            <iframe
              ref={iframeRef}
              src={contentUrl}
              className="absolute top-0 left-0 w-full h-full border-0"
              title="Contenido xAPI/cmi5"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-presentation"
            />
          </div>
        </CardContent>
      </Card>

      {enrollment.progress_percent > 0 && enrollment.progress_percent < 100 && (
        <Card className="bg-slate-50">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Progreso del contenido</span>
                <span className="font-semibold text-slate-900">{enrollment.progress_percent}%</span>
              </div>
              <Progress value={enrollment.progress_percent} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información xAPI */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Play className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-blue-900 mb-1">
                Formato xAPI/cmi5
              </h4>
              <p className="text-xs text-blue-700">
                Este contenido utiliza el estándar xAPI (Experience API) con soporte para paquetes cmi5.
                Tu progreso se rastrea automáticamente mientras interactúas con el contenido.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug: Statements recibidos (solo para desarrollo) */}
      {statements.length > 0 && process.env.NODE_ENV === 'development' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">xAPI Statements ({statements.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {statements.map((stmt, idx) => (
                <div key={idx} className="text-xs bg-slate-50 p-2 rounded">
                  <pre className="overflow-x-auto">
                    {JSON.stringify(stmt, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}