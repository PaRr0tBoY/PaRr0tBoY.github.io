# Parrot Design References

设计档案由外部工具导出，按 Profile 管理：

```text
profiles/<scheme>/
├── manifest.json
├── source/       # 外部工具 ZIP 的解压内容，只读上游
└── adapters/     # 本技能的组件适配规则
```

当前 Profile：

- `profiles/polaris/` — Technical Editorial Minimalism + Tactile Motion，来源为 Polaris 外部工具导出包

`source/` 是上游发布内容，不要手改；同步时替换解压后的 `source/`，保留 `adapters/`。未指定 Profile 时必须询问，不得自动选用或混用。
