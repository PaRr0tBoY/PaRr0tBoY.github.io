# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
