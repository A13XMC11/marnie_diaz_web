/**
 * Role-based access control (RBAC) system
 */

export enum UserRole {
  ADMIN = 'admin',
  DENTISTA = 'dentista',
  RECEPCIONISTA = 'recepcionista',
  PACIENTE = 'paciente',
}

export interface UserWithRole {
  id: string
  email: string
  role: UserRole
  clinic_id?: string
}

/**
 * Permission matrix: which roles can perform which actions
 */
type PermissionMatrix = Record<UserRole, Set<string>>

const permissions: PermissionMatrix = {
  [UserRole.ADMIN]: new Set([
    'view_all_patients',
    'edit_all_patients',
    'delete_all_patients',
    'view_all_appointments',
    'edit_all_appointments',
    'delete_all_appointments',
    'view_all_payments',
    'edit_all_payments',
    'view_audit_logs',
    'manage_users',
    'manage_roles',
  ]),
  [UserRole.DENTISTA]: new Set([
    'view_own_patients',
    'edit_own_patients',
    'view_own_appointments',
    'create_appointment',
    'edit_own_appointments',
    'create_clinical_record',
    'view_own_clinical_records',
    'edit_own_clinical_records',
    'view_own_payments',
  ]),
  [UserRole.RECEPCIONISTA]: new Set([
    'view_own_patients',
    'view_own_appointments',
    'create_appointment',
    'edit_own_appointments',
    'view_own_payments',
    'create_payment',
  ]),
  [UserRole.PACIENTE]: new Set([
    'view_own_profile',
    'view_own_appointments',
    'view_own_clinical_records',
  ]),
}

/**
 * Check if user has permission
 */
export const hasPermission = (role: UserRole, permission: string): boolean => {
  return permissions[role]?.has(permission) ?? false
}

/**
 * Check if user has any of the given permissions
 */
export const hasAnyPermission = (role: UserRole, permissionList: string[]): boolean => {
  return permissionList.some((permission) => hasPermission(role, permission))
}

/**
 * Check if user has all of the given permissions
 */
export const hasAllPermissions = (role: UserRole, permissionList: string[]): boolean => {
  return permissionList.every((permission) => hasPermission(role, permission))
}

/**
 * Get all permissions for a role
 */
export const getRolePermissions = (role: UserRole): string[] => {
  return Array.from(permissions[role] ?? [])
}

/**
 * Check if a role can be assigned by another role
 * (admin can assign all, dentista cannot assign anyone, etc.)
 */
export const canAssignRole = (assignerRole: UserRole, targetRole: UserRole): boolean => {
  const roleHierarchy: Record<UserRole, number> = {
    [UserRole.ADMIN]: 4,
    [UserRole.DENTISTA]: 2,
    [UserRole.RECEPCIONISTA]: 1,
    [UserRole.PACIENTE]: 0,
  }

  return roleHierarchy[assignerRole] > roleHierarchy[targetRole]
}

/**
 * Get role display name (translated)
 */
export const getRoleDisplayName = (role: UserRole): string => {
  const names: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Administrador',
    [UserRole.DENTISTA]: 'Dentista',
    [UserRole.RECEPCIONISTA]: 'Recepcionista',
    [UserRole.PACIENTE]: 'Paciente',
  }

  return names[role] ?? role
}

/**
 * Check access to patient data
 * - Admin sees all
 * - Dentista sees own patients
 * - Recepcionista sees own clinic's patients
 * - Paciente sees only themselves
 */
export const canAccessPatient = (
  userRole: UserRole,
  userId: string,
  patientId: string,
  patientOwnerId?: string,
  clinicId?: string,
  userClinicId?: string
): boolean => {
  switch (userRole) {
    case UserRole.ADMIN:
      return true
    case UserRole.DENTISTA:
      return patientOwnerId === userId // Only own patients
    case UserRole.RECEPCIONISTA:
      return clinicId === userClinicId // Only same clinic
    case UserRole.PACIENTE:
      return patientId === userId // Only themselves
    default:
      return false
  }
}

/**
 * Check access to appointment
 */
export const canAccessAppointment = (
  userRole: UserRole,
  userId: string,
  dentystaId?: string,
  clinicId?: string,
  userClinicId?: string
): boolean => {
  switch (userRole) {
    case UserRole.ADMIN:
      return true
    case UserRole.DENTISTA:
      return dentystaId === userId
    case UserRole.RECEPCIONISTA:
      return clinicId === userClinicId
    case UserRole.PACIENTE:
      return false // Pacientes can't directly access appointments in admin
    default:
      return false
  }
}

/**
 * Determine redirect path based on role
 */
export const getRoleDefaultPath = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN:
      return '/dashboard/pacientes'
    case UserRole.DENTISTA:
      return '/dashboard/pacientes'
    case UserRole.RECEPCIONISTA:
      return '/dashboard/citas'
    case UserRole.PACIENTE:
      return '/patient/dashboard'
    default:
      return '/'
  }
}
