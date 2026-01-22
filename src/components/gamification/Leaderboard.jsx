import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, TrendingUp, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Leaderboard() {
  const [timeFilter, setTimeFilter] = useState('all'); // all, month, week

  const { data: gameStats = [] } = useQuery({
    queryKey: ['game-stats'],
    queryFn: () => base44.entities.UserGameStats.list('-total_points', 100)
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const getUserName = (email) => {
    const user = users.find(u => u.email === email);
    return user?.full_name || email.split('@')[0];
  };

  const getRankIcon = (index) => {
    if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (index === 1) return <Medal className="w-5 h-5 text-slate-400" />;
    if (index === 2) return <Award className="w-5 h-5 text-amber-600" />;
    return null;
  };

  const getRankColor = (index) => {
    if (index === 0) return 'from-yellow-50 to-amber-50 border-yellow-200';
    if (index === 1) return 'from-slate-50 to-gray-50 border-slate-200';
    if (index === 2) return 'from-amber-50 to-orange-50 border-amber-200';
    return 'from-white to-slate-50 border-slate-100';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              Tabla de Clasificación
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              Top {gameStats.length} Estudiantes
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {gameStats.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">Aún no hay clasificaciones</p>
                <p className="text-sm text-slate-500 mt-2">
                  Completa lecciones y quizzes para aparecer aquí
                </p>
              </div>
            ) : (
              gameStats.map((stat, index) => (
                <div
                  key={stat.id}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl border-2 transition-all",
                    "bg-gradient-to-r",
                    getRankColor(index),
                    index < 3 && "shadow-md"
                  )}
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm font-bold text-lg">
                    {getRankIcon(index) || <span className="text-slate-600">#{index + 1}</span>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {getUserName(stat.user_email)}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Nivel {stat.level}
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-3 h-3" />
                        {stat.courses_completed} cursos
                      </span>
                      {stat.streak_days > 0 && (
                        <span className="flex items-center gap-1 text-orange-600">
                          <Flame className="w-3 h-3" />
                          {stat.streak_days} días
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-indigo-600">
                      {stat.total_points.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">puntos</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}