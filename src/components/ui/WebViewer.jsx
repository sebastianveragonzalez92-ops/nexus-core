import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Maximize2, Minimize2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function WebViewer({ 
  url, 
  title = "Contenido Web",
  allowScripts = false,
  allowForms = true,
  allowPopups = false,
  className,
  onLoad,
  onError
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef(null);

  const sandboxPermissions = [
    'allow-same-origin',
    allowScripts && 'allow-scripts',
    allowForms && 'allow-forms',
    allowPopups && 'allow-popups',
    'allow-modals',
  ].filter(Boolean).join(' ');

  const handleLoad = () => {
    setIsLoading(false);
    setError(null);
    if (onLoad) onLoad();
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Error al cargar el contenido');
    if (onError) onError();
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    setIsLoading(true);
    setError(null);
  }, [url]);

  return (
    <Card className={cn(
      "relative overflow-hidden",
      isFullscreen && "fixed inset-0 z-50 rounded-none",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-slate-50">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className={cn(
            "w-2 h-2 rounded-full shrink-0",
            isLoading ? "bg-yellow-400 animate-pulse" : error ? "bg-red-400" : "bg-green-400"
          )} />
          <span className="text-sm font-medium text-slate-700 truncate">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="h-8 w-8"
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="h-8 w-8"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className={cn(
        "relative bg-white",
        isFullscreen ? "h-[calc(100vh-57px)]" : "h-[600px]"
      )}>
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Error al cargar</h3>
            <p className="text-sm text-slate-600 mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline">
              Intentar de nuevo
            </Button>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-slate-600">Cargando contenido...</p>
                </div>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={url}
              sandbox={sandboxPermissions}
              onLoad={handleLoad}
              onError={handleError}
              className="w-full h-full border-0"
              title={title}
            />
          </>
        )}
      </div>
    </Card>
  );
}