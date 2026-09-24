# edithist

纯 JS 的 edithist（零依赖）。逻辑在 `app.js`，浏览器打开 `index.html` 看结果。

## 功能

- `coalesce(history, windowMs)`：同一键、同类型、相邻且间隔不超过窗口的操作合并为一条（保留最新值），合并条数计入 `coalesced`。
- `enforceLimit(history, limit)`：超过上限时丢弃最老的操作并计入 `dropped`，游标指向末尾（重做栈清空）。
- `saveState`/`loadState` 使用注入的存储；旧格式（只有 `ops`）载入时自动补 `cursor`/`dropped`/`coalesced` 默认值。

## 逻辑测试

    node tests/run.js

## 场景自检

    node check_sample.js
