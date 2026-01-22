import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Award, TrendingUp } from 'lucide-react';
import Leaderboard from '../components/gamification/Leaderboard';
import BadgeCollection from '../components/gamification/BadgeCollection';
import PointsDisplay from '../components/gamification/PointsDisplay';

export default function Gamification() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6 flex items-center justify-center">
        <p className="text-slate-600">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Gamificación</h1>
            <p className="text-slate-600">Puntos, insignias y clasificación</p>
          </div>
        </div>

        {/* Points Display */}
        <PointsDisplay userEmail={user.email} />

        {/* Tabs */}
        <Tabs defaultValue="leaderboard" className="space-y-6">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="leaderboard">
              <Trophy className="w-4 h-4 mr-2" />
              Clasificación
            </TabsTrigger>
            <TabsTrigger value="badges">
              <Award className="w-4 h-4 mr-2" />
              Mis Insignias
            </TabsTrigger>
          </TabsList>

          <TabsContent value="leaderboard">
            <Leaderboard />
          </TabsContent>

          <TabsContent value="badges">
            <BadgeCollection userEmail={user.email} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}