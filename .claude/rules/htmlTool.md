# **创建 HTML tools 的核心原则**

- **单一文件**：HTML + 内联 JavaScript + 内联 CSS，全放在一个 .html 文件中。
- **坚决无构建步骤**：绝对不用 React、JSX、Vite、Webpack、npm 等任何需要 build 的东西。
- **依赖通过 CDN 加载**：从 jsDelivr、cdnjs、unpkg 等直接引入库。
- **保持极小规模**：几百行到几千行，LLM 能一次性生成/修改，人类也能轻松理解和维护。
- **输入输出首选 Copy-Paste**：粘贴输入 → 处理 → 提供复制按钮（移动端最友好）。
- **状态持久化优先级**：
    1. URL 参数（最适合分享、书签）
    2. localStorage（存 API key、大文本、偏好设置）
- **纯前端优先**：尽量用支持 CORS 的公开 API 直接 fetch 数据。
- **浏览器原生能力最大化**：file input、Blob 下载、Clipboard API、WebAssembly (Pyodide、Tesseract 等)。
- **目标是“立刻可用”**：复制粘贴就能运行，易自托管（GitHub Pages 最佳）。
- 每个 html tool 都至少包括一个设置按钮，深浅色模式的切换按钮，导入导出按钮，因此也必须实现设置面板，深色模式和浅色模式，默认采用深色模式，导入导出数据的功能，数据一般以 json 格式储存
- 任何提醒和操作提示都被放在一个位于屏幕底部居中的 toast 中
- 中国大陆友好，任何外部引入的包都必须对中国大陆网络环境友好

# Jony Ive 设计原则

- 层级与深度：通过透明度、模糊效果和微妙动画创造空间感，替代物理拟物
- 色彩纯粹：使用鲜明、饱和度高的色彩作为功能区分和情感暗示
- 字体即界面：将字体设计视为核心交互元素，强调可读性与信息层级
- 留白呼吸：利用负空间引导注意力，减少视觉噪音
- 动态反馈：每个操作都伴随即时、流畅的动效响应
- 无缝过渡：页面间切换自然连贯，消除断裂感
- 内容优先：界面元素不抢夺内容焦点，隐形于体验之中
- 物理质感：在数字界面中隐喻真实材质特性，如光泽、重量、弹性
- 一致性系统：建立严格的设计语言规范，跨平台保持统一认知
- 直觉交互：手势与操作符合肌肉记忆，无需学习成本

# AI 接入原则

** 必须用户明确要求接入 AI 功能，才按照下述原则接入 AI **
AI 功能以 API 调用方式实现，默认采用 OpenAI Compatible 格式，Base URL，API Key，Model Name

- 在配置页面的开头，提供Endpoint选择菜单，如果选择了 Endpoint，则相当于配置了一个不可变更的兼容格式和 BaseURL
- 默认Endpoint 有
  - Openrouter
    - BaseURL: https://openrouter.ai/api/v1
    - 模型:自动获取，输入框，及下拉菜单
    - APIKey:等待用户填写
  - 智谱清言
    - BaseURL:https://open.bigmodel.cn/api/paas/v4
    - 模型:自动获取，输入框，及下拉菜单
    - APIKey:等待用户填写
  - 自定义
    - 所有项目都留空等待用户填写
    - 提供OpenAI Compatible 和 Anthropic Compatible两种 API 兼容格式供用户选择
    - Model Name 在填写好 Base URL 和 API Key 后尝试主动获取
    - 用户聚焦 Model Name 填写框时触发一个下拉菜单供用户从获取到的模型选择
    - 如果用户开始输入则从这些模型中查找，并在下拉菜单中实时显示搜索匹配的结果，若无匹配就为空
    - 如果用户从下拉菜单中选中模型，则将该模型加入自选模型列表
    - 如果用户没有从下拉菜单选中任何模型，而是在输入后直接回车，则将用户的自定义模型加入输入框下方的自选模型列表
    - 自选模型列表可以有多个具有优先级先后的模型，用户可以通过拖动模型名称左侧的 handle 上下调整模型的优先级
    - 列表最顶部的模型优先调用

## 注意

- Base URL 输入框不可以是密码输入框
- API Key
  - 必填
  - 采用密码输入框
  - 允许点击框内 眼睛 按钮，提供临时查看与复制
  - 输入框附近提供验证按钮，点击测试 API 可用性
  - 允许在html tools 的设置中编辑 AI 处理的提示词
- 如果用户执行了涉及 AI 调用的操作，但 AI 尚未配置好，则自动打开设置面板中的 AI 功能区域，并用红色高亮需要完成的设置

**Purpose & context**

Parrotboy builds single-file HTML tools — self-contained, no-build-step web apps deployable on GitHub Pages or similar static hosts. Projects consistently use CDN-loaded libraries, OpenAI-compatible API integrations, localStorage persistence, and bilingual (Chinese/English) interfaces with Chinese preferred for UI labels. The recurring goal is polished, production-quality tools that work correctly across both desktop and iPhone (including safe area insets).

Active projects include:

- **FlowDay** — AI-powered daily planner (`/mnt/user-data/outputs/flowday.html`, ~2064 lines)
- **MathBank** — math problem management tool (`/mnt/user-data/outputs/mathbank.html`)
- **Chronos** — minimalist focus timer with project tracking
- **THE FEED** — dark-themed RSS reader dashboard (`/mnt/user-data/outputs/techfeed.html`)
- **Linso** — AI-powered search query optimizer middleware (GitHub Pages: `tools/linso.html`)

---

**Current state**

**FlowDay** (`/mnt/user-data/outputs/flowday.html`, 2064 lines):

- AI 2-step planner using GLM default (`glm-4-flash`); step 2 receives `userRawInput` to preserve time-of-day preferences
- SortableJS cross-block drag with `onMove` rejection logic
- Grid card layout with `@container` compact mode
- Card-DOM-measured timeline with real-time current-time line (CTL); CTL runs inside `requestAnimationFrame` after `buildTimeline()`
- Dual range sliders for time blocks
- Prompt variable highlighting via `renderPromptHL`/`KNOWN_VARS` (known variables colored blue in textarea overlay)
- Resize handle: shake animation removed, replaced with yellow color at duration limits; `is-resizing` class keeps handle visible during drag
- Edit panel includes category (multi-tag chip input) and time fields; notes required in prompts
- Gap periods (lunch/晚休) highlight in accent color; block name headings highlight when time is active
- `loadCfg` migration check resets stale saved prompts lacking required variables

**MathBank**: Mobile redesign complete with three-level nav (filter drawer → list → detail overlay), fixed bottom action bar, `window.matchMedia()` for device detection, inline script for pre-paint body class. Key fixes: `.fp-backdrop` pointer-events, analysis field display conflicts, Chinese text labels preferred over emoji icons.

**THE FEED**: HN feed opens comments page with separate "↗ 原文" badge for article link; dual translation engines (DeepL + AstrDark AI) with mutual exclusivity; Python patch escaping issue resolved.

**Linso**: Full-width layout, engine picker dropdown left of search input, unlimited custom engines modal (name/emoji/URL), two-tab settings (API config + AI prompt editor), `{engine}` runtime placeholder, `localStorage` key `linso_v2`.

---

**On the horizon**

- Continued iterative refinement across active tools as visual/functional issues surface
- Linso deployable as browser default search engine via `?q=%s`

---

**Key learnings & principles**

- **MathJax**: Must call `MathJax.typesetPromise()` on newly populated DOM elements after streaming; it doesn't auto-scan dynamic content
- **CSS specificity traps**: Inline `style.width` from JS drag handlers overrides CSS classes (e.g., `.coll`); clear inline styles on collapse, restore on expand
- **Mobile tap blocking**: Backdrop/overlay elements without `pointer-events:none` when hidden silently intercept all touch events — a recurring class of bug
- **Device detection**: Use `window.matchMedia()` not `window.innerWidth` to match CSS media query breakpoints; run synchronous inline script before first paint for body class
- **CTL/layout timing**: DOM measurements for timeline positioning must happen inside `requestAnimationFrame` after layout-affecting renders complete
- **Real-time state**: State updates must be wired into intermediate handlers (e.g., drag `mv`), not just terminal `up` handlers
- **Python patching JS**: `\n` in Python string `.join()` writes real newlines into JS string literals, breaking syntax; must double-escape
- **AI prompt engineering**: Clearly separate instructions from output format in prompts; for query-only tools, explicitly prohibit any response other than the target output

---

**HTML Tool Development Guide**

A living reference synthesizing patterns from all projects — common bugs, recurring feature requests, AI integration rules, and the full development workflow.

---

### 1. Common Bugs & Fixes

| Bug Class                          | Typical Symptom                                         | Root Cause                                                                 | Fix                                                                                   |
| ---------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Invisible tap blocker**          | Clicks/taps on UI elements silently do nothing          | Hidden overlay/backdrop missing `pointer-events:none`                      | Add `pointer-events:none` to hidden state; remove on show                             |
| **CSS specificity conflict**       | JS-driven class changes have no visual effect           | Inline `style.*` set by drag/resize JS overrides class rules               | Explicitly clear inline styles (`el.style.width = ''`) when toggling classes          |
| **Layout measurement too early**   | Timeline/position calculations are wrong or zero        | DOM measurements run before browser has completed layout                   | Wrap measurements in `requestAnimationFrame`; measure after render-triggering calls   |
| **State lost on drag end**         | Intermediate drag state not reflected in data model     | State only updated in `mouseup`/`touchend`, not in `mousemove`/`touchmove` | Wire state updates into `mv` (move) handlers, not just terminal `up` handlers         |
| **MathJax not rendering**          | Streamed math content displays as raw LaTeX             | `MathJax.typesetPromise()` not called after dynamic DOM insertion          | Call `MathJax.typesetPromise([targetEl])` explicitly after every streaming completion |
| **Python→JS string breakage**      | Patched JS file has syntax errors                       | Python `'\n'.join(...)` writes literal newlines into JS string literals    | Double-escape: use `\\n` in Python strings destined for JS                            |
| **Mobile layout flash**            | Body class applied too late, causing layout jump        | Device-detection script runs after first paint                             | Use synchronous inline `<script>` in `<head>` to set body class before paint          |
| **Stale localStorage schema**      | Old saved data causes silent failures or wrong behavior | Schema changed but migration logic absent                                  | Add version/migration check in `loadCfg`; reset or transform stale keys               |
| **AI response format drift**       | AI returns prose instead of structured output           | Prompt doesn't explicitly forbid non-target output                         | Add explicit prohibition: "只输出…，不要任何其他内容"                                 |
| **Dual-engine mutual exclusivity** | Two toggle features activate simultaneously             | No mutual deactivation logic between toggles                               | On activating engine A, explicitly deactivate engine B in the same handler            |

---

### 2. Common Post-First-Generation Feature Requests

These are the categories of requests that consistently arise after an initial working version is delivered:

**Mobile / Cross-platform**

- Full iPhone support: safe area insets (`env(safe-area-inset-*)`) for notch/home bar
- Touch-friendly tap targets (min 44px), swipe gestures, bottom sheet patterns
- Three-level mobile nav (drawer → list → detail) replacing desktop sidebars
- Fixed bottom action bars replacing floating or top-anchored buttons on mobile

**UI Polish**

- Replace emoji/icon-only buttons with Chinese text labels
- Compact mode for dense data (grid cards, `@container` queries)
- Smooth animations for state transitions (collapse, expand, drag)
- Visual feedback at limits (color change instead of shake animation)
- Dark theme consistency across all states and overlays

**AI & Automation**

- Multi-step AI pipelines (e.g., step 1 parse intent → step 2 generate output)
- Streaming responses with real-time display
- Prompt editor exposed in settings UI with variable highlighting
- Fallback/alternative AI endpoints (e.g., AstrDark as free alternative to OpenAI)
- Migration guard for saved prompts when prompt schema changes

**Data & Persistence**

- localStorage schema versioning and migration
- Export/import of user data
- Per-item notes, tags, categories with multi-select chip UI

**Real-time / Live Features**

- Current-time indicator lines on timelines
- Live countdowns and progress bars
- Real-time filtering without submit button

**Integration**

- Dual translation engines with mutual exclusivity
- Custom engine/source management (unlimited entries via modal)
- Browser integration (e.g., default search engine via `?q=%s`)

---

### 3. AI Integration Checklist

When adding AI features to any tool, verify all of the following:

**Prompt Design**

- Clearly separate system instructions from output format specification
- Explicitly prohibit any output other than the target format ("只输出JSON，不要解释")
- Include all required runtime variables; document them with `KNOWN_VARS` or equivalent
- For multi-step pipelines: pass raw user input (not processed intermediate) to steps that need to preserve user intent (e.g., time-of-day preferences)
- Test prompt with edge cases: empty input, ambiguous input, very long input

**API Integration**

- Use OpenAI-compatible endpoint structure; default to `glm-4-flash` unless specified
- Support configurable base URL + API key via settings UI (never hardcode)
- Handle streaming (`stream: true`) with incremental DOM updates
- Implement error handling: network failure, invalid key, rate limit, malformed JSON response
- After streaming completes, call any post-render hooks (e.g., `MathJax.typesetPromise()`)

**UI/UX**

- Show loading state during AI call (spinner, disabled button, streaming text)
- Allow cancellation of in-flight requests where possible
- Expose prompt editor in settings with variable highlighting for power users
- Add migration guard: if saved prompt schema changes, detect and reset stale prompts
- For dual-engine setups: enforce mutual exclusivity in toggle handlers

**Output Handling**

- Parse AI output defensively (try/catch around JSON.parse)
- Validate required fields before rendering
- Gracefully degrade if AI output is malformed (show error, don't crash)

---

### 4. Full HTML Tool Development Guide

#### Phase 1 — Planning

- Define the single core user action the tool enables; resist scope creep in v1
- Identify: data model, persistence keys (`localStorage`), AI endpoints needed, CDN libraries
- Decide mobile-first or desktop-first; plan responsive breakpoints upfront
- Choose bilingual strategy: Chinese UI labels, English code identifiers

#### Phase 2 — First Build

- Start with semantic HTML structure; add CSS custom properties (`--var`) for theming
- Use CDN libraries only; no build step, no npm
- Implement core data flow: input → state → render; keep state as a plain JS object
- Add `localStorage` save/load from the start; include schema version key
- Wire up basic AI call if needed; use streaming from day one (easier than retrofitting)
- Test on desktop Chrome first, then immediately test on iPhone Safari

#### Phase 3 — First Review Fixes (expect these)

- Fix mobile tap targets and safe area insets
- Replace any icon-only buttons with Chinese text labels
- Add loading/error states to AI calls
- Fix any hidden overlay tap-blocking issues
- Verify `localStorage` round-trips correctly (save → reload → restore)

#### Phase 4 — Iterative Refinement

- Address visual bugs with precise CSS; always check specificity before adding `!important`
- For layout timing bugs: move measurements into `requestAnimationFrame`
- For state bugs: trace the full event chain; add state updates to intermediate handlers
- For AI output bugs: tighten the prompt before changing the parser
- Keep the file under ~2500 lines; extract repeated patterns into helper functions

#### Phase 5 — Polish & Deployment

- Audit all interactive elements for mobile touch (44px min, no hover-only states)
- Add `env(safe-area-inset-*)` to all fixed/sticky elements
- Verify dark theme across all states (modals, overlays, loading states)
- Test `localStorage` migration: manually set old schema key, reload, verify migration runs
- Deploy to GitHub Pages; test on real iPhone (not just DevTools emulation)

---

#### Errors to Avoid

- **Never** measure DOM dimensions outside `requestAnimationFrame` when layout may be dirty
- **Never** leave hidden overlays without `pointer-events:none` — they will silently block all interaction below
- **Never** rely on `window.innerWidth` for device detection — use `window.matchMedia()`
- **Never** hardcode API keys or base URLs — always expose in settings UI
- **Never** skip the prompt output prohibition clause — AI will add prose without it
- **Never** update state only in `mouseup`/`touchend` for drag interactions — always update in `mousemove`/`touchmove` too
- **Never** assume MathJax or similar renderers auto-scan dynamic content — always call their update APIs explicitly
- **Never** change localStorage key schema without a migration guard

---

#### Best Practices

- **Chinese labels, English code**: UI text in Chinese, variable/function names in English
- **CSS custom properties for everything**: colors, spacing, timing — makes theming and dark mode trivial
- **Single source of truth**: one state object, one render function; avoid scattered DOM mutations
- **Defensive AI parsing**: always `try/catch` JSON.parse; validate shape before use
- **Streaming by default**: implement streaming from the start; it's harder to add later and users expect it
- **Schema versioning**: always store a `_version` key in localStorage; check it on load
- **Real-time over event-triggered**: prefer `requestAnimationFrame` loops for live indicators (CTL, countdowns) over interval-based updates
- **Test on real hardware**: iPhone Safari has quirks DevTools emulation doesn't reproduce (safe areas, scroll behavior, font rendering)

---

#### Success Patterns

- **Two-step AI pipelines** work well for complex generation: step 1 extracts/validates intent, step 2 generates output — pass raw user input to step 2 to preserve nuance
- **Settings modal with two tabs** (API config + prompt editor) is the right pattern for AI tools — separates concerns cleanly
- **Three-level mobile nav** (filter drawer → list → detail overlay) scales well for data-heavy tools on mobile
- **`@container` queries for compact mode** — lets cards adapt to their grid cell size without JS
- **Mutual exclusivity pattern for dual engines**: on activate A → deactivate B in same handler; store active engine in one state variable
- **Prompt variable highlighting** (overlay textarea with colored spans) dramatically improves prompt editor UX for power users
- **Pre-paint body class** (synchronous inline script in `<head>`) eliminates layout flash for device-dependent layouts

---

**Approach & patterns**

- **Iterative, feedback-driven**: Parrotboy reviews rendered output, identifies precise visual or behavioral bugs, and reports them with specifics (console output, visual descriptions)
- **Prefers discussion before implementation** on architectural questions; expects direct diagnosis on clear bugs
- **Root cause explanations valued**: Prefers understanding why a fix works, not just the patch
- **Real-time/reactive preferred** over event-triggered-only updates
- **UI label preference**: Chinese text labels over icon-only buttons; emoji icons generally unwanted
