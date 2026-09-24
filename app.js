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
    const ops = parsed.ops || [];
    return {
      ops: ops,
      cursor: typeof parsed.cursor === "number" ? parsed.cursor : ops.length,
      dropped: parsed.dropped || 0,
      coalesced: parsed.coalesced || 0,
    };
  }

  function coalesce(history, windowMs) {
    const ops = [];
    let merged = 0;
    for (const op of history.ops) {
      const last = ops[ops.length - 1];
      if (last && last.key === op.key && last.kind === op.kind &&
          typeof last.at === "number" && typeof op.at === "number" &&
          op.at - last.at <= windowMs) {
        ops[ops.length - 1] = op;
        merged += 1;
      } else {
        ops.push(op);
      }
    }
    return { ops: ops, cursor: ops.length, dropped: history.dropped, coalesced: history.coalesced + merged };
  }

  function enforceLimit(history, limit) {
    const overflow = Math.max(0, history.ops.length - limit);
    const ops = overflow ? history.ops.slice(overflow) : history.ops.slice();
    return { ops: ops, cursor: ops.length, dropped: history.dropped + overflow, coalesced: history.coalesced };
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
