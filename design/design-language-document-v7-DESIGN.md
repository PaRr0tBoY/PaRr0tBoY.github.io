---
---
---
---
---
---
---
# Design Language Document · v7

> Style codename: **Technical Editorial Minimalism + Tactile Motion**. Quiet structure, paper-like material, dispersed accents rather than concentrated decoration, invisible editing, and restrained but lively motion.

**Theme:** dark

## Tokens – Colors

| Name | Value | Token | Role |
|---|---|---|---|
| Background | `#20211f` | `--bg` | Global page background in dark mode |
| Surface | `#282925` | `--surface` | Opaque matte paper-card surface for floating navigation, menus, cards, and mobile menu panels |
| Surface 2 | `rgba(255,255,255,.035)` | `--surface-2` | Subtle raised surface for cards and media slots |
| Ink | `#e8e6de` | `--ink` | Primary text color in dark mode |
| Muted | `#aaa79e` | `--muted` | Secondary text and labels |
| Faint | `#77756e` | `--faint` | Tertiary text, placeholders, and tags |
| Line | `rgba(232,230,222,.14)` | `--line` | Default border and divider color |
| Line Strong | `rgba(232,230,222,.24)` | `--line-strong` | Stronger border for hover and emphasis |
| Grid | `rgba(232,230,222,.10)` | `--grid` | Background dot-matrix grid color |
| Accent | `#6aa99f` | `--accent` | Theme-color linework for Hero background curves and primary actions |
| Accent Soft | `rgba(106,169,159,.15)` | `--accent-soft` | Subtle accent tint for hover states and fills |
| Accent Ink | `#17201e` | `--accent-ink` | Text color on accent backgrounds |
| Shadow | `rgba(0,0,0,.18)` | `--shadow` | Restrained shadow for floating elements |

- Use off-black and off-white; neither mode uses pure `#000` or `#FFF`.
- Warm gray is the confirmed neutral foundation; do not shift it toward a cooler or more industrial tone.
- Theme palettes: Graphite, Cobalt, **Verdigris** (default), Amber, and Violet. Each must support both light and dark states.
- The default combination is Verdigris with dark mode.

## Tokens – Typography

### IBM Plex Sans — --font-sans
- **Substitute:** JetBrains Mono NF, a more engineering-oriented alternative
- **Weights:** 400, 500, 600, 700
- **Role:** English body copy and UI

### IBM Plex Mono — --font-mono
- **Substitute:** Not specified
- **Weights:** 400, 500, 600
- **Role:** Monospace text, code, and labels

### IBM Plex Sans SC — --font-sans-sc
- **Substitute:** Not specified
- **Weights:** 400, 500, 600, 700; avoid Light weights, which create a visually weak or “thin” impression
- **Role:** Chinese text

| Role | Size | Line Height | Letter Spacing | Token |
|---|---|---|---|---|
| Display / H1 | `clamp(38px, 4.6vw, 60px)` | `1.03` | `-0.05em` | `--type-display` |
| Lead / Body | `16px` | `1.8` | `0` | `--type-lead` |
| Body / Card | `13px` | `1.75` | `0` | `--type-body` |
| Card Title | `15px` | `1.2` | `0` | `--type-card-title` |
| UI / Small | `12px` | `1.4` | `0` | `--type-ui` |
| Label / Mono | `11px` | `1.4` | `0.02em` | `--type-label` |
| Eyebrow / Mono | `12px` | `1.4` | `0.08em` | `--type-eyebrow` |

## Tokens – Spacing & Shapes

### Spacing Scale

| Name | Value | Token |
|---|---|---|
| Background dot interval | `19px` | `--spacing-dot-grid` |
| Fold navigation safety spacing | `72px` | `--spacing-nav-safe` |
| Hero vertical padding | `12px` | `--spacing-hero-block` |
| Card padding | `22px` | `--spacing-card-padding` |
| Section gap | `76px` | `--spacing-section` |
| Bento gap | `12px` | `--spacing-bento-gap` |

### Border Radius

| Name | Value | Token |
|---|---|---|
| Unified floating-card radius | `14px` | `--radius-card` |
| Small control radius | `8px` | `--radius-small` |
| Pill radius | `999px` | `--radius-pill` |

### Shadows

| Name | Value | Token |
|---|---|---|
| Floating-card shadow | `0 4px 14px var(--shadow)` | `--shadow-card` |
| Dropdown shadow | `0 14px 35px var(--shadow)` | `--shadow-dropdown` |
| Mobile panel shadow | `0 16px 40px var(--shadow)` | `--shadow-panel` |

- **Density:** Fine dot matrix at approximately `0.85px` dots with low contrast; extremely light SVG turbulence noise at `opacity 0.035`.
- The confirmed paper texture values must not be changed.
- Floating elements use a solid `var(--surface)`, a `1px` border, a unified radius token, and a restrained shadow. They are opaque and unblurred.

## Components

组件规范与实现拆在 `references/components/` 下，按需读取（索引见 `components/README.md`）。
**页面结构由需求决定——组件文件里的示例布局是实例，不是规范。** 跨组件的动效系统保留在本章：

### Motion System
**Role:** Restrained, accessible interaction feedback

Icon morphing is shared across the site: `+` ⇄ `×`, hamburger ⇄ close, and search ⇄ close use the same transformation logic, instantiated separately by context.

Viewport reveal fades sections in as they enter the viewport using opacity plus `translateY`. It triggers once and does not repeat.

Loading uses a skeleton screen with structural placeholder stripes, not spinning indicators or ellipsis animation.

Floating-navigation visibility transitions use `transform`, not abrupt `display` switching.

All motion respects `prefers-reduced-motion`. Under `prefers-reduced-motion`, site-wide animation duration is reduced to near `0`.

#### Global Transition Softening
**Role:** Smoothing all instantaneous UI changes

Every instantaneous UI change—page transitions, background color shifts, state toggles, panel open/close, theme switching—must be softened with a CSS `transition`. Use `transition-all duration-200 ease-out` as the default, adjusting duration per context but never exceeding `400ms`.

- Apply transitions to `background-color`, `color`, `border-color`, `opacity`, and `transform` on interactive elements by default.
- Page-level or route transitions should use a brief crossfade (`opacity`) rather than abrupt replacements.
- All softened transitions must respect `prefers-reduced-motion`, collapsing to near-zero duration when the user prefers reduced motion.
- Use only `opacity` and `transform` for animated properties; avoid transitioning layout-triggering properties like `width`, `height`, `left`, or `margin`.

#### Tab Indicator Slider
**Role:** Smooth highlight transition between tab states

When the active tab changes, the background highlight indicator slides from the old position to the new position using `transform: translateX` with a CSS `transition`. The indicator is a single absolutely-positioned element whose `width` and `translateX` are updated to match the target tab's dimensions and offset.

- Use `transform` only; do not animate `left`, `width`, or `margin`, which trigger layout recalculations.
- Match the transition duration to the site's general motion pace—typically `200–300ms` with an ease-out curve.
- On mobile, the same slider logic applies to the bottom tab bar or segmented controls.

#### Lightweight Micro-Animations
**Role:** Adding liveliness without performance cost

Where the performance cost is low and no layout or paint recalculation is triggered, prefer `transform` and `opacity` to add micro-animations that make the page feel alive without drawing attention away from content.

- **Toggle switches:** A subtle `translateX` on the thumb with a background color transition.
- **Selection states:** A brief scale pulse (`transform: scale(0.96 → 1)`) on click or tap to provide tactile feedback.
- **Hover expansions:** Card or row hover states that slightly lift (`translateY(-2px)`) or scale, accompanied by a shadow change.
- **Accent reveals:** Decorative dots or curves that fade in with a staggered delay as their parent card enters the viewport.

These animations are supplementary, not structural. They must never block interaction, delay content display, or run continuously without user initiation.

### 组件索引

| 组件 | 文件 |
|---|---|
| 页面基座（token/纸面/焦点/reveal） | `components/00-base.md` |
| 导航（浮动顶栏 / 侧栏变体） | `components/01-nav.md` |
| Bento 网格 + 纸卡 + 配图占位 | `components/02-bento.md` |
| Hero 首屏 | `components/03-hero.md` |
| 图标变形（+⇄× / 汉堡⇄关闭 / 搜索⇄关闭） | `components/04-icon-morph.md` |
| 搜索胶囊 | `components/05-search-pill.md` |
| 纯图标按钮 | `components/06-icon-buttons.md` |
| 下拉菜单 / 移动端浮层菜单 | `components/07-menus.md` |
| 五主题 × 明暗切换 | `components/08-theme-mode.md` |
| 中英双语 + ARIA | `components/09-i18n.md` |
| 就地编辑（contenteditable） | `components/10-editable.md` |
| Tab 栏 / 分段滑动指示器 | `components/11-tabs.md` |
| 骨架屏加载 | `components/12-skeleton.md` |
| 底部弹性下拉（可选） | `components/13-elastic-pull.md` |
| 分散装饰系统 | `components/14-decorative.md` |
| Footer | `components/15-footer.md` |

## Do's and Don'ts

### Do

- Use containers as controls, with `contenteditable` for in-place editing.
- Keep editing geometry unchanged before and after editing; only the caret and selection should visibly change.
- Let interaction itself provide discoverability through double-click, focus, and Enter.
- Use off-black, off-white, and warm-gray neutral foundations rather than pure black or white.
- Use the five theme palettes—Graphite, Cobalt, Verdigris, Amber, and Violet—in both light and dark states.
- Keep floating navigation, menus, cards, and mobile panels matte, opaque, bordered, rounded, and lightly shadowed.
- Distribute decorative curves, dots, dashed folded corners, and rounded small squares across the system rather than concentrating them in one Hero illustration.
- Draw Hero curves as continuous, slightly irregular theme-color strokes using `var(--accent)`.
- Use `justify-content: space-between` on the navigation container to preserve two-ended alignment responsively.
- Collapse open navigation child panels when the floating navigation hides.
- Use a unified rounded pill when the search control expands.
- Use icon morphing consistently for `+` ⇄ `×`, hamburger ⇄ close, and search ⇄ close.
- Reveal viewport content once with opacity and `translateY`.
- Use structural skeleton stripes for loading.
- Use `transform` transitions for floating-navigation visibility.
- Respect `prefers-reduced-motion` throughout the site.
- Make mobile menus floating layers with a bento-style `2×2` card grid.
- Explicitly set `overflow-y:hidden` and `touch-action:pan-x` on horizontal touch-scroll containers.
- Use `hidden` for bilingual-content switching and retain user-customized names outside translation wrappers.
- Provide `aria-label` and `title` for icon-only buttons, updating them with language changes.
- Prefer spacing, grouping, and surface-level differences to distinguish regions over visible dividers. Let whitespace do the work that lines would otherwise do.
- Use `transform: translateX` for tab indicator slider animations; do not animate layout-triggering properties.
- Add lightweight micro-animations—toggle thumb slides, selection pulses, hover lifts—using only `transform` and `opacity` to keep the page feeling alive without performance cost.
- Soften all instantaneous UI changes—page transitions, background color shifts, state toggles—with CSS transitions using `opacity` and `transform`.
- When a functional button's action can be clearly expressed by an icon, use the icon alone without a text label; provide `title` and `aria-label` for accessibility.
- For content-heavy pages or short-input forms, constrain the main content area to roughly one-third of the full page width, centered, with generous side margins to improve readability, match user expectations, and leave room for future components.

### Don't

- Do not create a “box inside a box” by nesting a complete input, border, or background inside a container. This applies universally: code blocks, media slots, and data panels must not be wrapped in an additional card when they already sit inside a surface container.
- Do not use `<input>` to simulate in-place editing; fixed widths and default styling cause geometry jumps and unwanted borders or highlights.
- Do not use pure black `#000` or pure white `#FFF`.
- Do not use Glassmorphism: `backdrop-filter: blur()` with translucent background and large shadow, including on floating elements. Floating does not mean glass.
- Do not use loading ellipsis animation, “Scroll to reveal” text, or dedicated graphical prompts such as a drawn downward-scroll arrow.
- Do not use words or graphics to explain UI when state itself can communicate the information.
- Do not create a standalone decorative Hero illustration that is detached from the content system.
- Do not use dashed lines for the main Hero background curve.
- Do not use neutral-gray lines for Hero curves when `var(--accent)` is required.
- Do not allow navigation layout to depend on `margin: auto` on a sibling that may be hidden responsively.
- Do not combine a circular icon background with a rectangular highlighted search input as competing forms.
- Do not apply the default square-cornered `:focus-visible` outline directly to the expanded search input.
- Do not push mobile dropdown navigation into document flow or expand page height.
- Do not make all bento cards the same size.
- Do not leave large areas of empty whitespace.
- Do not use interaction dimensions that conflict with content expectations or create disproportionate state changes.
- Do not omit `overflow-y` or `touch-action` from horizontal scroll containers, causing unintended vertical dragging.
- Do not let the Footer lose horizontal padding because it is outside `.shell`.
- Do not use `<hr>` or hard-border dividers to separate regions inside cards or between cards. Excessive lines make a design look cluttered and undermine the quiet, paper-like aesthetic.
- Do not animate `left`, `width`, `margin`, or any property that triggers layout recalculation for indicator sliders or micro-animations.
- Do not use arrow symbols (such as `→`, `↓`, `‹`, `›`) as interface elements; use icons, spacing, or state changes to convey direction instead.
- Do not use separator characters such as `·`, `\`, or `&` to join small text labels (e.g., "LOOKEY · SYSTEM INFO DASHBOARD"); use explicit words to describe relationships.

## Imagery

- The visual system does not use a concentrated illustration slot. Decorative content is a distributed system of small curves, dots, dashed folded corners, rounded small squares, and the geometric logo mark.
- The Hero includes one `4:3` image placeholder for future replacement with a real image or screenshot.
- The bento grid includes one `21:9` wide-banner image placeholder for future replacement with a real image or screenshot.
- Decorative opacity is generally between `0.2` and `0.55`.
- The global material texture uses a low-contrast fine dot matrix and extremely light SVG turbulence noise at `opacity 0.035`.

## Layout

- **Section gap:** The Fold reserves `72px` of top safety spacing for the floating navigation; Hero vertical padding is `12px`.
- **Card padding:** `22px`; floating cards use the shared matte surface language with a `1px` border, unified radius token, and restrained shadow.
- **Element gap:** The background dot matrix uses a `19px` interval.
- **Max content width:** The Footer declares its own `max-width` with `margin:auto` and independent padding; no numeric maximum width is specified.

### Content Width Constraint
**Role:** Improving readability and extensibility through constrained width

When a page section contains large amounts of reading content or input fields whose expected input is short, the main content area should occupy roughly one-third of the full page width, centered, with generous side margins.

- **Readability:** Narrower text columns reduce the distance the eye must travel across lines, improving reading comfort and speed.
- **Input expectations:** Short-input fields (e.g., name, email, search terms) do not need full-width space; a constrained width matches user expectations and prevents inputs from feeling disproportionately wide.
- **Extensibility:** Reserved side space leaves room for future components—sidebars, contextual panels, or auxiliary information—without requiring layout restructuring.
- **Responsive adaptation:** A centered, constrained-width layout naturally adapts to mobile viewports, where the content simply expands to fill the available width.

This constraint applies contextually, not universally. Dashboards, bento grids, and data-dense views may still use the full page width. The decision is content-driven: reading-heavy or short-input sections use constrained width; data-dense or card-grid sections use full width.
---
---
---
---
---
---
---