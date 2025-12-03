import type { PermissionPolicy } from "./policy.js";

/**
 * 権限
 * Union型でroleを表現
 */
export type UserRole = "admin" | "member";

export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly role: UserRole,
    // strategy的に権限を利用
    // ポリシーは値オブジェクトとして利用しているのがポイント
    // もしポリシーがUserの情報を必要とすると、循環依存が発生してしまう
    private _policy: PermissionPolicy
  ) {}

  // OCP・SRP的に振る舞いの詳細は委譲(delegate)させる
  deleteUser(targetUserId: string): void {
    if (this._policy.canDeleteUser(targetUserId, this.id)) {
      console.log(`[Success] User ${this.name} deleted user ${targetUserId}.`);
    } else {
      console.log(
        `[Deny] User ${this.name} is NOT allowed to delete user ${targetUserId}.`
      );
      // 実際のアプリではここで throw Error する場合も多い
    }
  }
}
