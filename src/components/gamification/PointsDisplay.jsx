import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingUp, Award, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PointsDisplay({ userEmail, compact = false }) {
  const { data: gameStats } = useQuery({
    queryKey: ['user-game-stats', userEmail],
    queryFn: async () => {
      const stats = await base44.entities.UserGameStats.filter({ user_email: userEmail });
      return stats[0] || null;
    },
    enabled: !!userEmail
  });

  if (!gameStats) {
    return null;
  }

  const pointsToNextLevel = (gameStats.level * 1000);
  const currentLevelPoints = gameStats.total_points % 1000;
  const progress = (currentLevelPoints / pointsToNextLevel) * 100;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="gap-1">
          <Zap className="w-3 h-3 text-amber-500" />
          {gameStats.total_points.toLocaleString()} pts
        </Badge>
        <Badge variant="outline" className="gap-1">
          <TrendingUp className="w-3 h-3 text-indigo-500" />
          Nivel {gameStats.level}
        </Badge>
        {gameStats.streak_days > 0 && (
          <Badge variant="outline" className="gap-1">
            <Flame className="w-3 h-3 text-orange-500" />
            {gameStats.streak_days} días
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-0">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-indigo-100 text-sm mb-1">Total de Puntos</p>
            <motion.p 
              className="text-4xl font-bold"
              key={gameStats.total_points}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
            >
              {gameStats.total_points.toLocaleString()}
            </motion.p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="font-bold">Nivel {gameStats.level}</span>
            </div>
            {gameStats.streak_days > 0 && (
              <div className="flex items-center gap-1 text-orange-300 text-sm">
                <Flame className="w-4 h-4" />
                <span>{gameStats.streak_days} días de racha</span>
              </div>
            )}
          </div>
        </div>

        {/* Progress to next level */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-indigo-100">
            <span>Progreso al Nivel {gameStats.level + 1}</span>
            <span>{currentLevelPoints} / {pointsToNextLevel}</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/20">
          <div className="text-center">
            <p className="text-2xl font-bold">{gameStats.courses_completed}</p>
            <p className="text-xs text-indigo-100">Cursos</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{gameStats.lessons_completed}</p>
            <p className="text-xs text-indigo-100">Lecciones</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{gameStats.quizzes_passed}</p>
            <p className="text-xs text-indigo-100">Quizzes</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}