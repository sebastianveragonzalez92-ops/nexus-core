import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function GPSLocation({ location, onLocationChange }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError('GPS no disponible en este dispositivo');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onLocationChange({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy)
        });
        setLoading(false);
      },
      (err) => {
        setError('No se pudo obtener la ubicación. Verifica los permisos.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        onClick={getLocation}
        disabled={loading}
        className="gap-2"
      >
        {loading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <MapPin className="w-4 h-4" />
        }
        {location ? 'Actualizar ubicación' : 'Capturar GPS'}
      </Button>

      {location && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>
            Lat: {location.lat.toFixed(5)}, Lng: {location.lng.toFixed(5)}
            {location.accuracy && <span className="text-green-500 ml-1">(±{location.accuracy}m)</span>}
          </span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}