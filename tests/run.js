const assert = require("assert");
const App = require("../app.js");

const cases = [
  ["撤销回退一步", () => {
    let history = App.createHistory();
    history = App.apply(history, { key: "a", value: 1, kind: "set" });
    history = App.apply(history, { key: "a", value: 2, kind: "set" });
    history = App.undo(history);
    assert.strictEqual(App.current(history).a, 1);
  }],
  ["重做恢复", () => {
    let history = App.createHistory();
    history = App.apply(history, { key: "a", value: 1, kind: "set" });
    history = App.undo(history);
    history = App.redo(history);
    assert.strictEqual(App.current(history).a, 1);
  }],
  ["新操作清空重做栈", () => {
    let history = App.createHistory();
    history = App.apply(history, { key: "a", value: 1, kind: "set" });
    history = App.undo(history);
    history = App.apply(history, { key: "b", value: 2, kind: "set" });
    assert.strictEqual(history.ops.length, 1);
  }],
  ["状态可存取", () => {
    const store = { data: {}, getItem(k) { return this.data[k]; }, setItem(k, v) { this.data[k] = v; } };
    let history = App.createHistory();
    history = App.apply(history, { key: "a", value: 1, kind: "set" });
    App.saveState(history, store);
    assert.strictEqual(App.loadState(store).ops.length, 1);
  }],
  ["report 结构稳定", () => {
    const out = App.report({ ops: [{ key: "a", value: 1, kind: "set" }] });
    assert.ok(Array.isArray(out.rows) && Array.isArray(out.columns));
  }],

];

let failed = 0;
for (const [name, fn] of cases) {
  try { fn(); console.log("ok   " + name); }
  catch (error) { failed += 1; console.log("FAIL " + name + " -> " + error.message); }
}
console.log(cases.length + " cases, " + failed + " failed");
process.exit(failed ? 1 : 0);
