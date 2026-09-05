# 参与贡献

感谢你帮助改进 Typesetter。

提交改动前请先搜索已有 Issue，并让每个提案保持聚焦。代码、公式、元数据、URL 或 Markdown 语法中的误转换，比漏掉排版转换更严重。

开发环境需要 Node.js 24 与 npm 11：

```bash
npm ci
npm run check
```

新增规则时应补充纯引擎测试，修改适配层时应补充安全测试。最后在 Obsidian 的源码模式、实时预览、阅读视图和原生 PDF 导出中使用 `fixtures/typography-test.md` 手工验收，并确认样例文件字节级不变。

不得加入自动文档替换、笔记写入、前置元数据修改、剪贴板改写、CodeMirror 5 API 或未受保护的 DOM 改写。请保持 [ARCHITECTURE.zh-CN.md](ARCHITECTURE.zh-CN.md) 中的分层边界。

Pull Request 应说明用户可见行为、安全影响、已运行测试和手工测试过的 Obsidian 版本。不得提交生成的 `main.js`、覆盖率输出、本地库或临时发布说明文件。
