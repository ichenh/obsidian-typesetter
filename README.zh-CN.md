# Typesetter

[![CI](https://github.com/ichenh/obsidian-typesetter/actions/workflows/ci.yml/badge.svg)](https://github.com/ichenh/obsidian-typesetter/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/ichenh/obsidian-typesetter?display_name=tag&sort=semver)](https://github.com/ichenh/obsidian-typesetter/releases)
[![License](https://img.shields.io/github/license/ichenh/obsidian-typesetter)](LICENSE)

当前版本：v0.1.0

Typesetter 是一层非破坏性的出版级排版渲染器，可在源码模式、实时预览、阅读视图和 Obsidian 原生 PDF 输出中改善普通 Markdown 正文的标点与符号。四种渲染表面均可分别启用。

> 本插件不会修改底层 Markdown 源文件。

## 工作方式

Obsidian 先解析 Markdown，插件再只对确认安全的可见正文应用编辑器装饰或双层 DOM 标记。默认情况下源码模式保持字面显示；复制、保存和重新打开笔记时，原始字符完全不变。关闭插件会立即恢复字面渲染。

```text
源文：
The result----although unexpected----was obtained in 2025-2026.

渲染：
The result—although unexpected—was obtained in 2025–2026.
```

## 已支持规则

- `--` → `–`，`----` → `—`，且长标记优先；为避免与 Markdown 结构冲突，`---` 不作为简写。
- 保守识别 `2025-2027`、`pp. 15-23` 等数字范围并显示为 en dash。
- 省略号简写采用确定规则：`...` 显示为 `…`，`......` 显示为居中的中文省略号 `……`；引擎不再根据邻近文字猜测省略号体例。
- CJK 引号及标点以输入法写入的 Unicode 字符为权威。区域标点字形与共享弯引号字形使用两个独立的可选开关；弯引号不根据引号内的中英文判断，英文直引号保持原样。
- 保留简体中文、繁体中文、日文和韩文输入法的常见字符，包括 `．`、`｡`、`､`、`｢｣`、`＂`、`＇` 等全角或半角标点。
- 日文假名和韩文谚文可以可靠识别局部文字系统；统一汉字无法可靠区分中国大陆、台湾、香港、澳门或日文用法。渲染 HTML 中显式继承的 BCP 47 `lang` 信息优先。
- 句号、逗号、冒号、分号、问号和感叹号的视觉纠正仍分别作为高级可选功能保留，但默认全部关闭。默认行为完全尊重输入法标点。
- `->`、`<-`、`<->` 及长箭头默认启用；`=>`、`<=`、`<=>` 等容易与程序运算符冲突的双线箭头默认关闭。
- 每一条排版规则和每一种箭头映射都可单独开关，由用户决定。

插件界面自动跟随 Obsidian 的应用语言，完整内置英语、简体中文、繁体中文、日语和韩语翻译；香港、澳门语言代码使用繁体中文界面，其他语言可靠回退到英语。

## 渲染模式

- **源码模式**：使用 CodeMirror 装饰，默认关闭，不修改编辑器文档。
- **实时预览**：使用语法感知的 CodeMirror 装饰，默认开启。
- **阅读视图**：在渲染 DOM 中选择排版后的显示文本，同时保留字面源标记。
- **PDF 导出**：通过独立的打印媒体设置控制 Obsidian 原生打印/PDF 输出。

## 永久保护的上下文

YAML 前置元数据与 Properties、行内和围栏代码、缩进代码、LaTeX/MathJax、TikZ、HTML 源码、SVG、脚本与样式、URL、Markdown 链接目标、内部链接目标、嵌入、标签、块 ID 以及 Markdown 结构语法都不会被排版规则处理。标题、列表、引用、表格、Callout、脚注和链接显示文字中的安全正文仍可排版。

安全策略宁可漏掉一次转换，也不在技术内容中误转换。插件不写入笔记文件，不创建编辑器替换事务，不修改元数据或剪贴板。

## 安装发布版

从对应的 [GitHub Release](https://github.com/ichenh/obsidian-typesetter/releases) 下载 `main.js`、`manifest.json` 和 `styles.css`，放入 `<vault>/.obsidian/plugins/obsidian-publishing-typography/`，然后在“第三方插件”中启用 **Typesetter**。本插件尚未被 Obsidian 官方社区插件目录收录。

## 开发

1. 使用 Node.js 24，运行 `npm ci`。
2. 运行 `npm run check`。
3. 将 `main.js`、`manifest.json` 和 `styles.css` 复制到 `<vault>/.obsidian/plugins/obsidian-publishing-typography/`。
4. 重载 Obsidian 并启用插件。

手工验收样例位于 `fixtures/typography-test.md`。

## 设置

设置页包含“渲染”“破折号”“符号”“标点”和“安全”分区。简体中文、繁体中文、日文和韩文处理是彼此独立的开关，不再要求为整个文档选择单一地区。实时预览、阅读视图、原生 PDF、确定性简写规则和光标处显示源码默认开启；源码模式、区域标点字形、弯引号字形、类似程序运算符的双线箭头及启发式标点视觉纠正默认关闭。

## 已知限制

- 混合语言判断采用局部、保守启发式；纯汉字本身不足以判断大陆、台湾、香港、澳门或日文排印体例，需要依靠输入法字符或显式语言标记。
- 英文、简体中文和韩文都可能使用相同的弯引号码位（`U+2018`–`U+201D`）。若不同输入法写入了相同码位，插入后便无法还原其输入法来源；显式语言信息才是可靠的覆盖方式。
- PDF 支持面向 Obsidian 原生打印媒体流程；忽略打印 CSS 的第三方导出器可能需要后续专用适配器。
- 自动化测试覆盖纯排版引擎和安全策略，但 CodeMirror 语法节点名与导出时序受宿主版本影响，最终交互仍需在 Obsidian 中手工验收。

## 开源项目

Typesetter 是采用 MIT 许可证的免费、开源、本地优先项目；运行时行为仅限于 Obsidian 本地渲染与设置存储。参见 [SECURITY.zh-CN.md](SECURITY.zh-CN.md)、[CONTRIBUTING.zh-CN.md](CONTRIBUTING.zh-CN.md) 与 [ROADMAP.zh-CN.md](ROADMAP.zh-CN.md)。

English documentation: [README.md](README.md).
