# E2E テストにおける「高階関数」と「デコレータパターン」を用いたログ機能の分離

## 1. 課題：テストコードの汚染

本来「仕様（何をするか）」だけを書くべきテストコードやヘルパー関数に、「ログ出力（記録）」や「エラーハンドリング」の記述が混入し、可読性と保守性が低下している状態。

Before: 汚染されたコード

```typescript
test("ログインテスト", async (t) => {
  logger.begin("ログインテスト開始"); // ノイズ
  try {
    logger.info("ユーザー名入力"); // ノイズ
    await t.typeText("#user", "admin");

    logger.info("ボタンクリック"); // ノイズ
    await t.click("#btn");
  } catch (e) {
    logger.error("エラー発生", e); // ノイズ
    throw e;
  }
});
```

## 2. 解決策：高階関数によるデコレータパターンの適用

「横断的関心事（ログ機能）」をビジネスロジック（テスト操作）から物理的に分離する。 高階関数（Higher-Order Function） を利用して、元の関数を書き換えることなく、外側からログ機能を「装飾（Decorate）」するラッパーを作成する。

```text

[Wrapper: テストケース全体 (withTestLog)]  <-- 開始/終了/エラーハンドリングを担当
      │
      └── [Test Code: テストシナリオ]       <-- 純粋な仕様のみ記述 (Clean!)
              │
              └── [Wrapper: 個別の操作 (withActionLog)] <-- 操作ごとのログを担当
                      │
                      └── [Logic: 操作関数] <-- 純粋なTestCafe操作
```

## 3. 実装例

A. ラッパー関数（高階関数）の定義
「関数を受け取り、ログ機能付きの関数を返す」ファクトリー関数を作成する

```typescript
// decorators.ts
import logger from "./utils/logger";

// 1. 個別の操作（ヘルパー）をラップする関数
export const withActionLog = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  actionName: string
) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    logger.info(`[Start] ${actionName}`);
    try {
      const result = await fn(...args); // 元の処理を実行（Delegate）
      logger.info(`[End] ${actionName}`);
      return result;
    } catch (error) {
      logger.error(`[Fail] ${actionName}`, error);
      throw error;
    }
  };
};

// 2. テストケース全体をラップする関数
export const withTestLog = (
  testName: string,
  testBody: (t: TestController) => Promise<void>
) => {
  return async (t: TestController) => {
    logger.begin(`[Test Start] ${testName}`);
    try {
      await testBody(t); // テスト本体を実行
      logger.success(`[Test Pass] ${testName}`);
    } catch (error) {
      logger.error(`[Test Fail] ${testName}`, error);
      throw error; // TestCafeに失敗を通知
    }
  };
};
```

B. ヘルパー側での適用
ヘルパー関数自体はログのことを知らなくて良い。エクスポート時や使用時にラップする。

```typescript
// helpers/auth.ts
// 純粋なロジックのみ
const loginRaw = async (t: TestController, user: string) => {
  await t.typeText("#user", user);
  await t.click("#login-btn");
};

// ログ機能でデコレートして公開
import { withActionLog } from "./decorators";
export const login = withActionLog(loginRaw, "ログイン操作");
```

C. テストコード（After）
驚くほどクリーンな状態 になる。

```typescript
import { withTestLog } from "./decorators";
import { login } from "./helpers/auth";

// テスト全体を withTestLog でラップ
test(
  "ログイン成功シナリオ",
  withTestLog("Login Success Test", async (t) => {
    // 中身は「操作」だけ。ログは勝手に出る。
    await login(t, "admin");

    // アサーションも同様にラップ可能
    // await verify.url(t, '/dashboard');
  })
);
```
