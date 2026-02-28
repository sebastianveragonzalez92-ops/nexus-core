// Role definitions and permissions
export const ROLES = {
  admin: {
    label: 'Administrador',
    color: 'bg-red-100 text-red-800 border-red-300',
    permissions: [
      'manage_users',
      'invite_users',
      'change_roles',
      'manage_courses',
      'manage_equipment',
      'manage_spare_parts',
      'approve_work_orders',
      'view_reports',
      'access_settings',
      'manage_templates',
    ],
  },
  supervisor: {
    label: 'Supervisor',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    permissions: [
      'create_work_orders',
      'approve_work_orders',
      'manage_equipment',
      'view_reports',
      'manage_tasks',
      'create_courses',
    ],
  },
  tecnico: {
    label: 'Técnico',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    permissions: [
      'execute_work_orders',
      'create_maintenance_reports',
      'view_equipment',
      'view_courses',
      'take_courses',
    ],
  },
};

export const ROLE_LABELS = {
  admin: 'Administrador',
  supervisor: 'Supervisor',
  tecnico: 'Técnico',
};

export const ROLE_COLORS = {
  admin: 'bg-red-100 text-red-800 border-red-300',
  supervisor: 'bg-amber-100 text-amber-800 border-amber-300',
  tecnico: 'bg-blue-100 text-blue-800 border-blue-300',
};

// Check if user has specific permission
export const hasPermission = (userRole, permission) => {
  if (!userRole || !ROLES[userRole]) return false;
  return ROLES[userRole].permissions?.includes(permission) || false;
};

// Check if user has any of multiple permissions
export const hasAnyPermission = (userRole, permissions) => {
  return permissions.some(perm => hasPermission(userRole, perm));
};

// Get user's permissions
export const getUserPermissions = (userRole) => {
  if (!userRole || !ROLES[userRole]) return [];
  return ROLES[userRole].permissions || [];
};