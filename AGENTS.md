# AGENTS.md

This file provides guidance to Codex (Codex.ai/code) when working with code in this repository.

## Project Overview

这是一个托管在 GitHub Pages 上的个人博客，使用 Jekyll 构建。核心内容是 `tools/` 目录下的独立 HTML 工具集。

## Architecture

- **博客框架**: Jekyll + minima 主题
- **工具定位**: 单一 HTML 文件，无构建步骤，通过 CDN 引入依赖
- **部署方式**: GitHub Pages 自动部署

## Tools Directory

`tools/` 目录包含多个独立的 HTML 工具：

| File           | Purpose                        |
| -------------- | ------------------------------ |
| linso.html     | 智能搜索引擎中间层（核心工具） |
| mathbank.html  | 数学题库工具                   |
| flowday.html   | 流程日工具                     |
| snippy.html    | 代码片段工具                   |
| chronos.html   | 时间工具                       |
| datecal.html   | 日期计算器                     |
| ganttlite.html | 甘特图工具                     |
| smartgoal.html | 目标管理工具                   |
| check.html     | 检查清单工具                   |
| techfeed.html  | 技术订阅源                     |

## Development Notes

- 所有工具为纯前端 HTML，单文件包含 CSS/JS
- 无需 npm/node 构建环境
- 修改后推送至 main 分支即可自动部署
- URL 格式: `https://parr0tboy.github.io/tools/{toolname}.html`

## Common Commands

```bash
# 本地预览博客（需要 Jekyll）
bundle exec jekyll serve

# 构建静态文件
bundle exec jekyll build
```

---

## check.html 开发总结

### 核心架构：分步表单

check.html 是一个纯前端分步问卷，每一步用 `innerHTML` 整体替换 card 内容，实现了"一次只展示一个板块"的体验。

**三大核心函数**：

| 函数                 | 职责                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------- |
| `saveCurrentStep()`  | 切换步骤前，将当前 DOM 中的表单值写入 `state` 对象                                    |
| `renderStep()`       | 渲染进度条、card 内容、导航按钮；最后用 `requestAnimationFrame` 调用 `restoreStepDOM` |
| `restoreStepDOM(id)` | 根据步骤 id 恢复所有视觉状态（`.on` 类、`value` 属性、滑块值）                        |
| `generate()`         | 读取 `state`（而非 DOM）拼接最终报告                                                  |

**为什么 `generate()` 必须读 `state` 而不是 DOM**：
每一步的 DOM 通过 `innerHTML` 整体替换，前一步的元素已被销毁。`generate()` 在最后一步调用，此时 DOM 中只有最后一步的内容，根本找不到前面步骤的输入框。解决方案是：所有表单值实时写入 `state`，`generate()` 从 `state` 读取。

**为什么 `restoreStepDOM` 必须用 `requestAnimationFrame`**：
`renderStep()` 中的 `innerHTML` 是同步操作，但浏览器的渲染流水线还没完成时，`offsetWidth` 等测量可能拿到旧值。`requestAnimationFrame` 确保 DOM 已稳定后再恢复视觉状态。

### Toast 的正确实现

Toast 隐藏用 `opacity: 0` + `visibility: hidden` + `translateY(-20px)`，显示用 `opacity: 1` + `visibility: visible` + `translateY(0)`，配合 `transition` 实现滑入动画。**不要用 `display:none`**（无法做过渡动画），也不要只用 `transform` 隐藏（元素仍可见）。

Toast 位置固定在 `top: 80px`，不用 `bottom`。

### 关键 Bug：最后一步 skip 导致数组越界

当 `SECTIONS` 最后一项标记为 `optional: true` 时，"跳过"按钮如果直接 `state.currentStep++` 会越界访问不存在的 `SECTIONS[length]`（返回 `undefined`），导致渲染出空 card 和空 nav，三个按钮全部失效。

**修复**：在 `skipSection()` 内部判断是否已是最后一步，是则调用 `generate()` 替代继续前进。

### 可复用模式

**分步表单的 state 字段设计**：每类输入对应一个 state 字段

- 复选/单选：数组或字符串（如 `exams: []`、`mood: ""`、`studyState: -1`）
- 滑块：`Number` 类型（如 `dur: 0`、`stress: 5`）
- 文本输入：字符串（如 `studyContent: ""`）
- 多级选项：`Array`（如 `distractLevels: ["", "", "", "", ""]`）

**可选板块的处理**：在 `SECTIONS` 定义中加入 `optional: true`，导航区根据此标志决定是否渲染"跳过"按钮。`skipSection()` 和 `nextStep()` 都需要在最后一步导向 `generate()`。

**防止越界的通用原则**：任何对 `state.currentStep` 的自增操作前，必须检查是否已达 `SECTIONS.length - 1`
