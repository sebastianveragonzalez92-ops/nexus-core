/**
 * Permissions system based on user roles
 * Roles: admin, supervisor_mantenimiento, tecnico, admin_activos, user
 */

export const ROLES = {
  ADMIN: 'admin',
  SUPERVISOR: 'supervisor',
  TECNICO: 'tecnico',
};

export const ROLE_LABELS = {
  admin: 'Administrador',
  supervisor: 'Supervisor',
  tecnico: 'Técnico',
};

export const ROLE_COLORS = {
  admin: 'bg-red-100 text-red-700 border-red-200',
  supervisor: 'bg-violet-100 text-violet-700 border-violet-200',
  tecnico: 'bg-blue-100 text-blue-700 border-blue-200',
};

// Define what each role can do
const PERMISSIONS = {
  'maintenance.view': ['admin', 'supervisor', 'tecnico'],
  'maintenance.work_orders.create': ['admin', 'supervisor'],
  'maintenance.work_orders.edit': ['admin', 'supervisor'],
  'maintenance.work_orders.delete': ['admin'],
  'maintenance.work_orders.approve': ['admin', 'supervisor'],
  'maintenance.work_orders.assign': ['admin', 'supervisor'],
  'maintenance.reports.create': ['admin', 'supervisor', 'tecnico'],
  'maintenance.reports.approve': ['admin', 'supervisor'],
  'maintenance.history.view': ['admin', 'supervisor', 'tecnico'],
  'maintenance.templates.manage': ['admin', 'supervisor'],
  'maintenance.import': ['admin', 'supervisor'],
  'assets.view': ['admin', 'supervisor', 'tecnico'],
  'assets.create': ['admin', 'supervisor'],
  'assets.edit': ['admin', 'supervisor'],
  'assets.delete': ['admin'],
  'tasks.view': ['admin', 'supervisor', 'tecnico'],
  'tasks.create': ['admin', 'supervisor'],
  'tasks.edit': ['admin', 'supervisor', 'tecnico'],
  'tasks.delete': ['admin', 'supervisor'],
  'users.view': ['admin'],
  'users.invite': ['admin'],
  'users.change_role': ['admin'],
  'reports.view': ['admin', 'supervisor'],
  'dashboard.maintenance': ['admin', 'supervisor', 'tecnico'],
  'audit.view': ['admin', 'supervisor'],
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