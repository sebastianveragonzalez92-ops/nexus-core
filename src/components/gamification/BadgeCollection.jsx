import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Award, Trophy, Star, Zap, Target, Flame, 
  BookOpen, Brain, Users, Sparkles 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const badgeIcons = {
  first_course: BookOpen,
  course_master: Trophy,
  perfect_score: Star,
  speed_learner: Zap,
  consistent_learner: Flame,
  top_performer: Award,
  helpful_peer: Users,
  scenario_expert: Sparkles,
  quiz_champion: Brain
};

const badgeColors = {
  first_course: 'from-blue-500 to-cyan-500',
  course_master: 'from-yellow-500 to-amber-500',
  perfect_score: 'from-purple-500 to-pink-500',
  speed_learner: 'from-orange-500 to-red-500',
  consistent_learner: 'from-red-500 to-orange-500',
  top_performer: 'from-indigo-500 to-violet-500',
  helpful_peer: 'from-green-500 to-emerald-500',
  scenario_expert: 'from-cyan-500 to-blue-500',
  quiz_champion: 'from-violet-500 to-purple-500'
};

export default function BadgeCollection({ userEmail }) {
  const { data: badges = [] } = useQuery({
    queryKey: ['user-badges', userEmail],
    queryFn: () => base44.entities.Badge.filter({ user_email: userEmail }, '-earned_date')
  });

  const allBadgeTypes = [
    { type: 'first_course', name: 'Primer Paso', description: 'Completa tu primer curso' },
    { type: 'course_master', name: 'Maestro', description: 'Completa 5 cursos' },
    { type: 'perfect_score', name: 'Perfección', description: 'Obtén 100% en un quiz' },
    { type: 'speed_learner', name: 'Rápido', description: 'Completa un curso en 1 día' },
    { type: 'consistent_learner', name: 'Constante', description: '7 días de racha' },
    { type: 'top_performer', name: 'Top 10', description: 'Entra al top 10' },
    { type: 'helpful_peer', name: 'Colaborador', description: 'Ayuda en el foro' },
    { type: 'scenario_expert', name: 'Experto', description: 'Completa 10 escenarios' },
    { type: 'quiz_champion', name: 'Campeón', description: 'Aprueba 20 quizzes' }
  ];

  const earnedBadgeTypes = badges.map(b => b.badge_type);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-500" />
          Insignias
        </CardTitle>
        <p className="text-sm text-slate-600">
          {badges.length} de {allBadgeTypes.length} desbloqueadas
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {allBadgeTypes.map((badgeType) => {
            const earned = badges.find(b => b.badge_type === badgeType.type);
            const Icon = badgeIcons[badgeType.type] || Award;
            const colorClass = badgeColors[badgeType.type];
            
            return (
              <div
                key={badgeType.type}
                className={cn(
                  "relative group cursor-pointer",
                  !earned && "opacity-40 grayscale"
                )}
                title={badgeType.description}
              >
                <div className={cn(
                  "aspect-square rounded-2xl p-4 flex items-center justify-center transition-all",
                  earned 
                    ? `bg-gradient-to-br ${colorClass} shadow-lg group-hover:scale-105`
                    : 'bg-slate-100 border-2 border-dashed border-slate-300'
                )}>
                  <Icon className={cn(
                    "w-8 h-8",
                    earned ? "text-white" : "text-slate-400"
                  )} />
                </div>
                <p className={cn(
                  "text-xs text-center mt-2 font-medium",
                  earned ? "text-slate-900" : "text-slate-500"
                )}>
                  {badgeType.name}
                </p>
                {earned && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <Star className="w-3 h-3 text-white fill-white" />
                  </div>
                )}
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                    <p className="font-semibold">{badgeType.name}</p>
                    <p className="text-slate-300">{badgeType.description}</p>
                    {earned && (
                      <p className="text-green-400 mt-1">
                        {format(new Date(earned.earned_date), 'PP', { locale: es })}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}