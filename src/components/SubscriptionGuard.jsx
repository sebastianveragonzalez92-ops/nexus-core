import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { isSubscriptionActive, getUserSubscription } from '@/components/subscriptionHelpers';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SubscriptionGuard({ children, userEmail }) {
  const [subscription, setSubscription] = useState(null);
  const [isExpired, setIsExpired] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSubscription = async () => {
      const sub = await getUserSubscription(userEmail);
      setSubscription(sub);
      
      // Si es usuario premium pero suscripción expiró
      if (sub && !isSubscriptionActive(sub)) {
        setIsExpired(true);
      }
    };

    checkSubscription();
  }, [userEmail]);

  const handleUpgrade = () => {
    navigate(createPageUrl('Pricing'));
  };

  // Si no hay suscripción o es plan free, permitir acceso normal
  if (!subscription || subscription.plan === 'free') {
    return children;
  }

  // Si suscripción expiró, mostrar modal de bloqueo
  if (isExpired) {
    return (
      <>
        {children}
        <Dialog open={isExpired} onOpenChange={setIsExpired}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                Tu suscripción ha expirado
              </DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Tu acceso a funcionalidades premium ha finalizado. 
              Renueva tu suscripción para continuar.
            </DialogDescription>
            <div className="flex gap-3 justify-end mt-4">
              <Button variant="outline" onClick={() => setIsExpired(false)}>
                Más tarde
              </Button>
              <Button onClick={handleUpgrade} className="bg-indigo-600">
                Renovar ahora
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return children;
}