interface User {
  readonly id: string;
  readonly name: string;

  canEdit(resourceId: string): boolean;
  greet(): string;
}

class AuthenticatedUser implements User {
  constructor(public readonly id: string, public readonly name: string) {}

  canEdit(resourceId: string): boolean {
    return true;
  }
  greet(): string {
    return `hello ${this.name}`;
  }
}

/**
 * Null Objectパターン
 */

class GuestUser implements User {
  readonly id = "GUEST";
  readonly name = "ゲスト";

  canEdit(resourceId: string): boolean {
    return false;
  }
  greet(): string {
    return "not logined";
  }
}

const NULL_USER = new GuestUser();

interface UserRepository {}

class UserDBRepository implements UserRepository {
  // DBのモック
  private db: Record<string, { name: string }> = {
    "123": { name: "山田太郎" },
    "456": { name: "鈴木花子" },
  };

  async findById(id: string): Promise<User> {
    const record = this.db[id];

    if (!record) {
      // ★ ここで null を返さず、Null Objectを返す
      // 画像の解説にある "DB.getEmployeeは...NullEmployeeを返す" に相当
      return NULL_USER;
    }

    return new AuthenticatedUser(id, record.name);
  }
}

// --- 3. アプリケーション/利用側 (Usage) ---

async function main() {
  const repo = new UserDBRepository();

  // ケースA: 存在するユーザー
  const user1 = await repo.findById("123");
  console.log("User 1:", user1.greet()); // -> こんにちは、山田太郎さん
  if (user1.canEdit("doc1")) {
    console.log("User 1 は編集可能です");
  }

  // ケースB: 存在しないユーザー
  const user2 = await repo.findById("999"); // DBにないID

  // ★ ポイント：nullチェック (if user2 === null) が不要！
  // そのままメソッドを呼んでも落ちないし、「ゲスト」として正しく振る舞う
  console.log("User 2:", user2.greet()); // -> ログインしていません

  if (!user2.canEdit("doc1")) {
    console.log("User 2 は編集できません（安全に判定されました）");
  }
}

main();

interface Notifier {
  send(message: string): void;
}

class EmailNotifier implements Notifier {
  constructor(private email: string) {}

  send(message: string): void {
    console.log(`📧 ${this.email} に送信: ${message}`);
  }
}

/**
 * 通知しない(ないこと)
 */
class SilentNotifier implements Notifier {
  send(message: string): void {
    // 意図的な沈黙。
    // 何もしないが、システムは落ちないし、呼び出し元は「相手が誰か」を気にする必要がない。
    // ログに「通知不要のためスキップ」と残すことさえ可能（＝無の観測）。
  }
}

class UserN {
  constructor(public name: string, private notifier: Notifier) {}

  completeTask(taskName: string) {
    this.notifier.send(`${taskName}が完了しました`);
  }
}

const activeUser = new UserN("Alice", new EmailNotifier("hogehoge@hoge.com"));
const quietUser = new UserN("Bob", new SilentNotifier());

activeUser.completeTask("レポート作成");

quietUser.completeTask("レポート作成");
