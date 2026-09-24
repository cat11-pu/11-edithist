// edithist：编辑历史状态机（基线：全量重放、不合并、无上限）
(function (root) {
  function createHistory() {
    return { ops: [], cursor: 0, dropped: 0, coalesced: 0 };
  }

  function apply(history, op) {
    history.ops = history.ops.slice(0, history.cursor);
    history.ops.push(op);
    history.cursor = history.ops.length;
    return history;
  }

  function undo(history) {
    if (history.cursor > 0) { history.cursor -= 1; }
    return history;
  }

  function redo(history) {
    if (history.cursor < history.ops.length) { history.cursor += 1; }
    return history;
  }

  function current(history) {
    const out = {};
    for (const op of history.ops.slice(0, history.cursor)) { out[op.key] = op.value; }
    return out;
  }

  function saveState(history, store) {
    if (store) { store.setItem("edithist", JSON.stringify(history)); }
    return history;
  }

  function loadState(store) {
    if (!store) { return createHistory(); }
    const raw = store.getItem("edithist");
    if (!raw) { return createHistory(); }
    const parsed = JSON.parse(raw);
    return { ops: parsed.ops || [], cursor: parsed.cursor || 0, dropped: parsed.dropped || 0, coalesced: parsed.coalesced || 0 };
  }

  function coalesce(history, windowMs) {
    throw new Error("合并还没实现");
  }

  function enforceLimit(history, limit) {
    throw new Error("上限还没实现");
  }

  function report(spec) {
    let history = createHistory();
    for (const op of spec.ops) { history = apply(history, op); }
    return { summary: "操作 " + history.ops.length, columns: ["key", "value"], rows: Object.entries(current(history)) };
  }

  const App = { createHistory, apply, undo, redo, current, saveState, loadState, coalesce, enforceLimit, report };
  if (typeof module !== "undefined") { module.exports = App; }
  root.App = App;
})(typeof window !== "undefined" ? window : globalThis);
