/**
 * 契約 Contract
 * すべてのプラン/権限はこのインターフェース(事前・事後条件)を満たす必要がある
 */
export interface PermissionPolicy {
  canDeleteUser(targetUserId: string, currentUserId: string): boolean;
  canViewAuditLog(): boolean;
}

/**
 * Admin(管理者)は権限的にsuper
 */
export class AdminPolicy implements PermissionPolicy {
  canDeleteUser(targetUserId: string, currentUserId: string): boolean {
    return true;
  }
  canViewAuditLog(): boolean {
    return true;
  }
}

/**
 * Memberは権限が限定的
 */
export class MemberPolicy implements PermissionPolicy {
  canDeleteUser(targetUserId: string, currentUserId: string): boolean {
    return targetUserId === currentUserId;
  }
  canViewAuditLog(): boolean {
    return false;
  }
}
