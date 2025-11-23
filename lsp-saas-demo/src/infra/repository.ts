import { User, UserRole } from "../domain/user";
import { AdminPolicy, MemberPolicy, PermissionPolicy } from "../domain/policy";

// DBの型定義
type UserRecord = {
  id: string;
  name: string;
  role: string;
};

// 今回は簡略のため、IF介さずにユーザリポジトリを直接使う&インメモリDBのみを対象に設計
export class UserRepository {
  private db: Map<string, UserRecord> = new Map();

  async findById(id: string): Promise<User | null> {
    const record = this.db.get(id);
    if (!record) return null;

    // マッピング(DBの値をオブジェクトの詰め替える)
    return this.toDomain(record);
  }

  async save(user: User): Promise<void> {
    const record: UserRecord = {
      id: user.id,
      name: user.name,
      role: user.role,
    };
    this.db.set(user.id, record);
  }

  /**
   * マッピングロジック(Factory的な振る舞いだが、責務はインフラ
   */
  private toDomain(record: UserRecord): User {
    const role = record.role as UserRole;
    let policy: PermissionPolicy;

    // 識別子から振る舞いを選択する
    // 今回だとroleは静的なルールかつ、パターンも膨大に膨れ上がる危険性はまだないと考えたとして、
    // switchでポリシーを作成する。
    // ただし、この場合roleが増えるとこのロジックの修正が必要なのでOCP違反ではある(管理のしやすさとのトレードオフ)
    switch (role) {
      case "admin":
        policy = new AdminPolicy();
        break;
      case "member":
        policy = new MemberPolicy();
        break;
      default:
        throw new Error(`Unknown role: ${role}`);
    }
    return new User(record.id, record.name, role, policy);
  }
}
