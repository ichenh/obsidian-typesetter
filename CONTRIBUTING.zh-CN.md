# 参与 Typesetter

[English](CONTRIBUTING.md)

贡献必须保持 Typesetter 的非破坏性渲染保证、Obsidian 兼容性和保守语法安全。
修改架构、规则、受保护上下文、生成文件、CI 或发布元数据前，请先阅读
[AGENTS.md](AGENTS.md)。

参与项目须遵守[行为准则](CODE_OF_CONDUCT.zh-CN.md)。安全漏洞应按照
[安全政策](SECURITY.zh-CN.md)私下报告，不要提交公开 Issue。

## 开发环境

使用 `package.json` 支持的 Node.js 版本：

~~~bash
npm ci
npm run check
~~~

完整门禁包含 ESLint、严格 TypeScript、生产构建、Vitest 和发布元数据校验。
CI 与发布任务都使用 `npm ci` 按锁文件安装。

不得提交生成的 `main.js`、`node_modules`、覆盖率输出、本地库数据或临时
发布说明。

## 修改要求

- 保持改动聚焦并保留无关工作。
- Markdown/DOM 知识留在适配层，纯转换留在 `src/typography/`。
- 每项新排版行为都必须是确定性规则，并有独立设置。
- 规则补充聚焦的引擎测试，适配层补充受保护上下文测试。
- 保持 `README.md` 与 `README.zh-CN.md` 的行为说明一致。
- 界面文字变化时保持五个语言包完整。
- 将重要的最终净变化记录到 `CHANGELOG.md` 的 `Unreleased`。
- 未经维护者授权，不修改版本字段。

不得加入笔记写入、编辑器源文本替换、前置元数据修改、剪贴板改写、
CodeMirror 5 API 或不安全的渲染 DOM 修改。宁可漏掉转换，也不能在代码、
公式、元数据、URL 或 Markdown 语法中误转换。

## 验证

提交前运行完整自动化门禁：

~~~bash
npm run check
~~~

涉及编辑器、DOM、CSS、设置、本地化或导出的改动，还应在 Obsidian 相应表面
中测试 `fixtures/typography-test.md`，记录 Obsidian 版本和平台，并确认样例
文件哈希不变。

移动端结论必须注明实测平台；导出结论必须注明宿主或导出插件，以及它是否
采用阅读视图后处理器和打印样式。

## Pull Request

说明问题、选定行为、安全影响、受影响表面和已完成验证，并指出兼容性或设置
迁移影响。未经测试的运行时行为不得写成已经确认。

若 AI 工具实质参与贡献，请披露并遵守
[AI-ASSISTANCE.zh-CN.md](AI-ASSISTANCE.zh-CN.md)。贡献者仍对正确性、许可证
兼容性、来源和机密信息负责。
