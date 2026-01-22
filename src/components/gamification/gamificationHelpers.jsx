import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const POINTS = {
  LESSON_COMPLETE: 50,
  QUIZ_PASS: 100,
  QUIZ_PERFECT: 200,
  COURSE_COMPLETE: 500,
  SCENARIO_COMPLETE: 75
};

export async function awardPoints(userEmail, points, reason) {
  try {
    const stats = await base44.entities.UserGameStats.filter({ user_email: userEmail });
    
    if (stats.length === 0) {
      // Create new stats
      await base44.entities.UserGameStats.create({
        user_email: userEmail,
        total_points: points,
        level: 1,
        courses_completed: 0,
        lessons_completed: 0,
        quizzes_passed: 0,
        perfect_scores: 0,
        streak_days: 1,
        last_activity_date: new Date().toISOString().split('T')[0]
      });
    } else {
      const currentStats = stats[0];
      const newPoints = currentStats.total_points + points;
      const newLevel = Math.floor(newPoints / 1000) + 1;
      
      // Update streak
      const today = new Date().toISOString().split('T')[0];
      const lastActivity = currentStats.last_activity_date;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      let newStreak = currentStats.streak_days;
      if (lastActivity === yesterday) {
        newStreak += 1;
      } else if (lastActivity !== today) {
        newStreak = 1;
      }
      
      await base44.entities.UserGameStats.update(currentStats.id, {
        total_points: newPoints,
        level: newLevel,
        streak_days: newStreak,
        last_activity_date: today
      });

      // Show level up notification
      if (newLevel > currentStats.level) {
        toast.success(`🎉 ¡Nivel ${newLevel} alcanzado!`, {
          description: `Has subido de nivel. ¡Sigue así!`
        });
      }
    }

    // Show points notification
    toast.success(`+${points} puntos`, {
      description: reason,
      icon: '⚡'
    });
  } catch (error) {
    console.error('Error awarding points:', error);
  }
}

export async function incrementStat(userEmail, statName) {
  try {
    const stats = await base44.entities.UserGameStats.filter({ user_email: userEmail });
    if (stats.length > 0) {
      const current = stats[0];
      await base44.entities.UserGameStats.update(current.id, {
        [statName]: current[statName] + 1
      });
    }
  } catch (error) {
    console.error('Error incrementing stat:', error);
  }
}

export async function awardBadge(userEmail, badgeType, badgeName, description, icon = 'Award', color = 'indigo') {
  try {
    // Check if badge already exists
    const existing = await base44.entities.Badge.filter({
      user_email: userEmail,
      badge_type: badgeType
    });

    if (existing.length === 0) {
      await base44.entities.Badge.create({
        user_email: userEmail,
        badge_type: badgeType,
        badge_name: badgeName,
        badge_description: description,
        earned_date: new Date().toISOString(),
        icon,
        color
      });

      toast.success(`🏆 Nueva insignia desbloqueada: ${badgeName}`, {
        description: description
      });
    }
  } catch (error) {
    console.error('Error awarding badge:', error);
  }
}

export async function checkAndAwardBadges(userEmail) {
  try {
    const stats = await base44.entities.UserGameStats.filter({ user_email: userEmail });
    if (stats.length === 0) return;

    const stat = stats[0];

    // First course badge
    if (stat.courses_completed === 1) {
      await awardBadge(userEmail, 'first_course', 'Primer Paso', 'Completaste tu primer curso', 'BookOpen', 'blue');
    }

    // Course master badge
    if (stat.courses_completed >= 5) {
      await awardBadge(userEmail, 'course_master', 'Maestro', 'Completaste 5 cursos', 'Trophy', 'yellow');
    }

    // Perfect score badge
    if (stat.perfect_scores >= 1) {
      await awardBadge(userEmail, 'perfect_score', 'Perfección', 'Obtuviste 100% en un quiz', 'Star', 'purple');
    }

    // Consistent learner badge
    if (stat.streak_days >= 7) {
      await awardBadge(userEmail, 'consistent_learner', 'Constante', 'Mantuviste una racha de 7 días', 'Flame', 'orange');
    }

    // Quiz champion badge
    if (stat.quizzes_passed >= 20) {
      await awardBadge(userEmail, 'quiz_champion', 'Campeón', 'Aprobaste 20 quizzes', 'Brain', 'violet');
    }

    // Check leaderboard position
    const allStats = await base44.entities.UserGameStats.list('-total_points', 10);
    const position = allStats.findIndex(s => s.user_email === userEmail);
    if (position >= 0 && position < 10) {
      await awardBadge(userEmail, 'top_performer', 'Top 10', 'Entraste al top 10 del ranking', 'Award', 'indigo');
    }
  } catch (error) {
    console.error('Error checking badges:', error);
  }
}

export { POINTS };