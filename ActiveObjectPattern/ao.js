var ActiveObjectEngine = /** @class */ (function () {
    function ActiveObjectEngine() {
        this.commands = [];
    }
    ActiveObjectEngine.prototype.addCommand = function (c) {
        this.commands.push(c);
    };
    ActiveObjectEngine.prototype.run = function () {
        while (this.commands.length > 0) {
            var c = this.commands.shift();
            if (c) {
                c.execute();
            }
        }
    };
    return ActiveObjectEngine;
}());
var SleepCommand = /** @class */ (function () {
    function SleepCommand(delay, e) {
        this.started = false;
        this.sleepTime = delay;
        this.engine = e;
        this.startTime = 0;
    }
    SleepCommand.prototype.execute = function () {
        var currentTime = Date.now();
        if (!this.started) {
            this.started = true;
            this.startTime = currentTime;
            this.engine.addCommand(this);
        }
        else if (currentTime - this.startTime < this.sleepTime) {
            // 待機する
            this.engine.addCommand(this);
        }
        else {
            // 時間経過
            console.log("Command Executed! (Waited ".concat(this.sleepTime, "ms)"));
            // ここで次の動作（コールバックなど）を呼ぶことも可能
        }
    };
    return SleepCommand;
}());
var engine = new ActiveObjectEngine();
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
