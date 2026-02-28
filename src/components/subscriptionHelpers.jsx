import { base44 } from '@/api/base44Client';

// Límites por plan
export const planLimits = {
  free: {
    max_users: 5,
    max_courses: 0,
    max_maintenance_records: 10,
    max_equipment: 5
  },
  pro: {
    max_users: 50,
    max_courses: 5,
    max_maintenance_records: null,
    max_equipment: null
  },
  enterprise: {
    max_users: null,
    max_courses: null,
    max_maintenance_records: null,
    max_equipment: null
  }
};

export const getUserSubscription = async (email) => {
  try {
    const subscriptions = await base44.entities.Subscription.filter(
      { user_email: email },
      '-created_date',
      1
    );
    return subscriptions?.[0] || null;
  } catch {
    return null;
  }
};

export const isSubscriptionActive = (subscription) => {
  if (!subscription) return false;
  if (subscription.status !== 'active') return false;
  const now = new Date();
  const endDate = new Date(subscription.ends_at);
  return endDate > now;
};

export const canUseFeature = (subscription, feature) => {
  if (!subscription) subscription = { plan: 'free' };
  const limits = planLimits[subscription.plan] || planLimits.free;
  const limit = limits[feature];
  if (limit === null) return true;
  return limit > 0;
};

export const getFeatureLimit = (subscription, feature) => {
  if (!subscription) subscription = { plan: 'free' };
  const limits = planLimits[subscription.plan] || planLimits.free;
  return limits[feature];
};

export const getUpgradeMessage = (feature, currentPlan) => {
  const messages = {
    max_users: 'Has alcanzado el límite de usuarios. Upgradea a PRO para agregar más.',
    max_courses: 'Los cursos están disponibles solo en plan PRO o superior.',
    max_maintenance_records: 'Has alcanzado tu límite mensual de registros. Upgradea a PRO.',
    max_equipment: 'Has alcanzado el límite de equipos. Upgradea a PRO.'
  };
  return messages[feature] || 'Esta funcionalidad requiere un plan superior.';
};