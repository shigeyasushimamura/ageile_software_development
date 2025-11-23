import { UserRepository } from "./infra/repository"; // ファイルパスは構成に合わせて調整してください
import { User } from "./domain/user";
import { AdminPolicy, MemberPolicy } from "./domain/policy";

async function main() {
  const repo = new UserRepository();

  console.log("=== 1. 新規ユーザー作成と保存 (Creation Phase) ===");
  // ファクトリを使わず、ここではユースケース層が新規作成を行っていると仮定してnewします
  // 初期データを作る際は、明示的にPolicyを注入します
  const adminUser = new User("u1", "Alice(Admin)", "admin", new AdminPolicy());
  const memberUser = new User(
    "u2",
    "Bob(Member)",
    "member",
    new MemberPolicy()
  );

  await repo.save(adminUser);
  await repo.save(memberUser);
  console.log("Save complete.\n");

  console.log("=== 2. DBから復元して振る舞いを確認 (Reconstitution Phase) ===");
  // ここで Repository.toDomain が走り、role の文字列から Policy が自動で再結合されます
  const loadedAdmin = await repo.findById("u1");
  const loadedMember = await repo.findById("u2");

  if (!loadedAdmin || !loadedMember) {
    console.error("User not found");
    return;
  }

  // ■ ケースA: 他人の削除 (LSPの確認)
  console.log("--- A. 他人の削除を試行 ---");
  // Admin Policy が適用されているので削除できるはず
  loadedAdmin.deleteUser("u99");

  // Member Policy が適用されているので拒否されるはず
  loadedMember.deleteUser("u99");

  // ■ ケースB: 自分の削除
  console.log("\n--- B. 自分の削除を試行 ---");
  // Member Policy のルール「自分ならOK」が適用されるはず
  loadedMember.deleteUser("u2");

  // ■ ケースC: 状態の確認 (おまけ)
  console.log("\n--- C. Role確認 ---");
  console.log(`User u1 is ${loadedAdmin.role}`); // admin
  console.log(`User u2 is ${loadedMember.role}`); // member
}

main().catch(console.error);
