const App = require("./app.js");
const spec = require("./sample/ops.json");

let history = App.createHistory();
for (const op of spec.ops) { history = App.apply(history, op); }
const beforeMerge = history.ops.length;
const merged = App.coalesce(history, spec.coalesceMs);
console.log("合并前操作数 =", beforeMerge);
console.log("合并后操作数 =", merged.ops.length);
console.log("合并掉的操作数 =", beforeMerge - merged.ops.length);
const limited = App.enforceLimit(merged, spec.limit);
console.log("超上限丢弃数 =", limited.dropped);
console.log("最终操作数 =", limited.ops.length);
console.log("重做栈是否被清空 =", limited.cursor === limited.ops.length);
const legacy = { ops: spec.legacy, cursor: spec.legacy.length };
App.saveState(legacy, { setItem() {}, getItem() { return JSON.stringify({ ops: spec.legacy }); } });
console.log("旧格式载入条数 =", App.loadState({ getItem() { return JSON.stringify({ ops: spec.legacy }); } }).ops.length);
console.log("当前状态 =", JSON.stringify(App.current(limited)));
