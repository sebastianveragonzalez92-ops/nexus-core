import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import EquipmentManager from '../components/maintenance/EquipmentManager';

export default function Equipment() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <EquipmentManager user={user} />
    </div>
  );
}