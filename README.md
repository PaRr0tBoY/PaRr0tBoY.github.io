# 前缀

看了一天 Claude 文档, 了解到三个有用的前缀

! 前缀, 手动执行 bash 指令并将输出添加到上下文, 此前我单独开一个新终端来执行 bash 指令,不然就要退出 Claude,现在看来还挺傻的

@ 前缀,手动选择新文件加入上下文

& 前缀,将对话发送到网页端 Claude 并行运行(仅限Pro以上用户)

? 前缀, 查看帮助

/ 前缀, 最常用的那个,可以调用 Claude 的各种扩展功能

---

# 常用快捷键

1. ⌃R(ctrl r), 搜索历史Prompt
2. ⎋⎋(double esc), 调出/rewind,快速回退
3. ⌃Z, 挂起当前 session, 执行 fg 以无延迟返回对话,比⌃C直接退出 Claude 要更方便,如果你还打算继续
4. ⇧⏎(shift return), 以在终端中换行,但需要提前执行/terminal-setup注册终端
5. ⇧⇥, 切换 Claude 的输出风格, 有 Default, Accept Edit, Plan Mode 可选

---

# Claude Code 的扩展功能

## Skills
## Mcp Server
## Memory
### ~/.claude/setting.json
### ~/.claude/rules
## agents
## commands
## hooks
