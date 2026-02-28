import React, { useState } from 'react';
import { getFeatureLimit, getUpgradeMessage } from '@/lib/subscriptionHelpers';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function FeatureLimitGuard({ 
  children, 
  subscription, 
  feature, 
  currentCount = 0,
  onLimitReached 
}) {
  const [showLimitModal, setShowLimitModal] = useState(false);
  const navigate = useNavigate();

  const limit = getFeatureLimit(subscription, feature);
  const isLimited = limit !== null && currentCount >= limit;

  if (!isLimited) {
    return children;
  }

  const handleUpgrade = () => {
    navigate(createPageUrl('Pricing'));
  };

  return (
    <>
      <div 
        onClick={() => setShowLimitModal(true)}
        className="opacity-50 pointer-events-none cursor-not-allowed"
      >
        {children}
      </div>

      <Dialog open={showLimitModal} onOpenChange={setShowLimitModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-orange-600" />
              Límite alcanzado
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {getUpgradeMessage(feature, subscription?.plan)}
          </DialogDescription>
          <div className="bg-slate-100 p-3 rounded-lg text-sm">
            <p className="text-slate-700">
              <strong>Plan actual:</strong> {subscription?.plan || 'Gratuito'} ({currentCount}/{limit})
            </p>
          </div>
          <div className="flex gap-3 justify-end mt-4">
            <Button variant="outline" onClick={() => setShowLimitModal(false)}>
              Cerrar
            </Button>
            <Button onClick={handleUpgrade} className="bg-indigo-600">
              Upgradear ahora
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}