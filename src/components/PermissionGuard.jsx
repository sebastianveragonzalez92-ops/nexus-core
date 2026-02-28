import React from 'react';
import { hasPermission, hasAnyPermission } from '@/components/lib/permissions';
import { AlertCircle } from 'lucide-react';

/**
 * Guard component to protect features based on user permissions
 * @param {string} permission - Single permission to check
 * @param {string[]} permissions - Multiple permissions (any match allows access)
 * @param {string} userRole - User's role
 * @param {React.ReactNode} children - Content to render if authorized
 * @param {React.ReactNode} fallback - Content to render if unauthorized
 */
export default function PermissionGuard({
  permission,
  permissions,
  userRole,
  children,
  fallback = null,
}) {
  const isAuthorized = permission
    ? hasPermission(userRole, permission)
    : hasAnyPermission(userRole, permissions || []);

  if (isAuthorized) {
    return children;
  }

  return fallback || (
    <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
      <AlertCircle className="w-4 h-4 shrink-0" />
      <p className="text-sm">No tienes permisos para acceder a esta funcionalidad.</p>
    </div>
  );
}