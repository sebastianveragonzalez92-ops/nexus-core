/**
 * Permissions system based on user roles
 * Roles: admin, supervisor_mantenimiento, tecnico, admin_activos, user
 */

export const ROLES = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor_mantenimiento',
  TECNICO: 'tecnico',
  ADMIN_ACTIVOS: 'admin_activos',
  USER: 'user',
};

export const ROLE_LABELS = {
  admin: 'Administrador',
  supervisor_mantenimiento: 'Supervisor de Mantenimiento',
  tecnico: 'Técnico',
  admin_activos: 'Administrador de Activos',
  user: 'Usuario',
};

export const ROLE_COLORS = {
  admin: 'bg-red-100 text-red-700 border-red-200',
  supervisor_mantenimiento: 'bg-violet-100 text-violet-700 border-violet-200',
  tecnico: 'bg-blue-100 text-blue-700 border-blue-200',
  admin_activos: 'bg-amber-100 text-amber-700 border-amber-200',
  user: 'bg-slate-100 text-slate-700 border-slate-200',
};

// Define what each role can do
const PERMISSIONS = {
  'maintenance.view': ['admin', 'supervisor_mantenimiento', 'tecnico', 'admin_activos'],
  'maintenance.work_orders.create': ['admin', 'supervisor_mantenimiento'],
  'maintenance.work_orders.edit': ['admin', 'supervisor_mantenimiento'],
  'maintenance.work_orders.delete': ['admin'],
  'maintenance.work_orders.approve': ['admin', 'supervisor_mantenimiento'],
  'maintenance.work_orders.assign': ['admin', 'supervisor_mantenimiento'],
  'maintenance.reports.create': ['admin', 'supervisor_mantenimiento', 'tecnico'],
  'maintenance.reports.approve': ['admin', 'supervisor_mantenimiento'],
  'maintenance.history.view': ['admin', 'supervisor_mantenimiento', 'tecnico', 'admin_activos'],
  'maintenance.templates.manage': ['admin'],
  'maintenance.import': ['admin', 'supervisor_mantenimiento'],
  'assets.view': ['admin', 'supervisor_mantenimiento', 'tecnico', 'admin_activos'],
  'assets.create': ['admin', 'admin_activos'],
  'assets.edit': ['admin', 'admin_activos', 'supervisor_mantenimiento'],
  'assets.delete': ['admin', 'admin_activos'],
  'tasks.view': ['admin', 'supervisor_mantenimiento', 'tecnico'],
  'tasks.create': ['admin', 'supervisor_mantenimiento'],
  'tasks.edit': ['admin', 'supervisor_mantenimiento', 'tecnico'],
  'tasks.delete': ['admin', 'supervisor_mantenimiento'],
  'users.view': ['admin'],
  'users.invite': ['admin'],
  'users.change_role': ['admin'],
  'reports.view': ['admin', 'supervisor_mantenimiento', 'admin_activos'],
  'dashboard.maintenance': ['admin', 'supervisor_mantenimiento', 'tecnico', 'admin_activos'],
  'audit.view': ['admin', 'supervisor_mantenimiento'],
};

export function hasPermission(user, permission) {
  if (!user) return false;
  const role = user.role || 'user';
  const allowed = PERMISSIONS[permission];
  if (!allowed) return false;
  return allowed.includes(role);
}

export function isAdmin(user) {
  return user?.role === 'admin';
}

export function canManageMaintenance(user) {
  return hasPermission(user, 'maintenance.work_orders.create');
}