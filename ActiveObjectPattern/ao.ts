interface Command {
  execute(): void;
}

class ActiveObjectEngine {
  private commands: Command[] = [];

  addCommand(c: Command): void {
    this.commands.push(c);
  }

  run(): void {
    while (this.commands.length > 0) {
      const c = this.commands.shift();
      if (c) {
        c.execute();
      }
    }
  }
}

class SleepCommand implements Command {
  private engine: ActiveObjectEngine;
  private sleepTime: number;
  private startTime: number;
  private started: boolean = false;

  constructor(delay: number, e: ActiveObjectEngine) {
    this.sleepTime = delay;
    this.engine = e;
    this.startTime = 0;
  }

  execute(): void {
    const currentTime = Date.now();
    if (!this.started) {
      this.started = true;
      this.startTime = currentTime;
      this.engine.addCommand(this);
    } else if (currentTime - this.startTime < this.sleepTime) {
      // 待機する
      this.engine.addCommand(this);
    } else {
      // 時間経過
      console.log(`Command Executed! (Waited ${this.sleepTime}ms)`);

      // ここで次の動作（コールバックなど）を呼ぶことも可能
    }
  }
}

const engine = new ActiveObjectEngine();

// 1秒待つコマンド
engine.addCommand(new SleepCommand(1000, engine));

// 3秒待つコマンド
engine.addCommand(new SleepCommand(3000, engine));

console.log("スタート");
engine.run(); // ここでループが回り始める
console.log("すべて完了");

// // 現代的なTypeScriptでの書き方（非同期処理）
// async function main() {
//   console.log("スタート");

//   // 同時に走らせる
//   const task1 = new Promise(resolve => setTimeout(() => {
//       console.log("1秒経過");
//       resolve(true);
//   }, 1000));

//   const task2 = new Promise(resolve => setTimeout(() => {
//       console.log("3秒経過");
//       resolve(true);
//   }, 3000));

//   await Promise.all([task1, task2]);
//   console.log("すべて完了");
// }
