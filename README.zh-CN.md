<h1 align="center">Typesetter for Obsidian</h1>

<p align="center"><strong>不改写 Markdown 源文的出版级排版渲染层。</strong></p>
<p align="center"><a href="README.md">English</a></p>

<p align="center">
  <a href="LICENSE"><img alt="MIT 许可证" src="https://img.shields.io/github/license/ichenh/obsidian-typesetter"></a>
  <img alt="Obsidian 1.7.2 或更高版本" src="https://img.shields.io/badge/Obsidian-1.7.2%2B-7c3aed?logo=obsidian">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript">
  <a href="https://github.com/ichenh/obsidian-typesetter/releases"><img alt="最新版本" src="https://img.shields.io/github/v/release/ichenh/obsidian-typesetter?display_name=tag&sort=semver"></a>
  <a href="https://github.com/ichenh/obsidian-typesetter/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/ichenh/obsidian-typesetter/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://github.com/ichenh/obsidian-typesetter/actions/workflows/release.yml"><img alt="发布" src="https://github.com/ichenh/obsidian-typesetter/actions/workflows/release.yml/badge.svg"></a>
</p>

当前版本：v0.1.3

需要 Obsidian **1.7.2 或更高版本**。

Typesetter 是面向学术写作、科学笔记和多语言正文的免费、开源、本地优先
Obsidian 插件。它为源码模式、实时预览、阅读视图以及打印/PDF 输出提供
非破坏性的排版层；每一种渲染表面和每一条排版规则都能分别配置。

> **本插件不会修改底层 Markdown 源文件。**

~~~text
源文：
The result----although unexpected----was obtained in 2025-2026.

渲染：
The result—although unexpected—was obtained in 2025–2026.
~~~

## 目录

- [功能概览](#功能概览)
- [平台支持](#平台支持)
- [安装](#安装)
- [快速开始](#快速开始)
- [排版规则](#排版规则)
- [永久保护的上下文](#永久保护的上下文)
- [设置](#设置)
- [工作原理](#工作原理)
- [开发](#开发)
- [发布流程](#发布流程)
- [已知限制](#已知限制)
- [项目政策](#项目政策)

## 功能概览

| 范围 | 行为 |
| --- | --- |
| 非破坏性渲染 | 只改变显示，不改变 Markdown 文件、编辑器文档、前置元数据或剪贴板文本。 |
| 四类独立控制 | 源码模式、实时预览、阅读视图和打印/PDF 输出可分别启用。 |
| 语法感知安全 | 使用 CodeMirror 6 语法信息保护代码、公式、链接、元数据和 Markdown 结构。 |
| 安全的渲染 DOM | 阅读视图只处理可见正文文本节点，不修改属性或链接目标。 |
| 确定性引擎 | 独立规则返回文本范围，冲突按固定优先级和最长匹配处理。 |
| 多语言标点 | 默认尊重输入法 Unicode；CJK 字形塑形和文字系统纠正均为可选项。 |
| 便于编辑 | 默认在光标处显示原标记；从编辑器复制时仍得到源标记。 |
| 离线、本地优先 | 无账户、遥测、广告、远程服务或运行时下载。 |

## 平台支持

Typesetter 在清单中声明 `isDesktopOnly: false`，运行时只使用 Obsidian 与
CodeMirror 的跨平台 Web API，不使用 Node.js、Electron 或直接文件系统 API。
源码模式、实时预览、阅读视图、设置和命令均按桌面端与移动端兼容设计。

打印/PDF 是兼容性表面，不是插件内置的 PDF 生成器。当 Obsidian 或导出插件
捕获经过后处理的阅读视图 DOM，并保留打印 CSS 时，排版结果可以进入输出。
桌面 Obsidian 的原生打印/PDF 路径符合这一模式；移动端或第三方导出插件也可能
兼容，但若它自行重新解析 Markdown、跳过 Obsidian 后处理器或丢弃打印 CSS，
就需要专用适配器。

| 平台或工作流 | 状态 |
| --- | --- |
| Windows、macOS、Linux | 架构支持；仍需针对相关 Obsidian 版本实机验证。 |
| Android、iOS、iPadOS | 编辑器与阅读视图按移动端兼容设计。 |
| Obsidian 原生打印/PDF | 通过独立的打印/PDF 设置支持。 |
| 第三方导出插件 | 若使用 Obsidian 渲染 DOM 与打印样式则可兼容；需按具体导出器验证。 |

## 安装

### 社区插件

Typesetter 尚未被 Obsidian 社区插件目录收录。审核通过后，可从
**设置 → 第三方插件** 中直接安装。

### 手动安装发布版

1. 从对应的 [GitHub Release](https://github.com/ichenh/obsidian-typesetter/releases)
   下载 `main.js`、`manifest.json` 和 `styles.css`。
2. 创建 `<vault>/.obsidian/plugins/typesetter/`。
3. 将三个文件放入该目录。
4. 重载 Obsidian。
5. 打开 **设置 → 第三方插件** 并启用 **Typesetter**。

文件夹名必须与插件 ID 一致：`typesetter`。

### 从源码构建

~~~bash
git clone https://github.com/ichenh/obsidian-typesetter.git
cd obsidian-typesetter
npm ci
npm run build
~~~

将 `main.js`、`manifest.json` 和 `styles.css` 复制到
`<vault>/.obsidian/plugins/typesetter/`，然后重载 Obsidian。

## 快速开始

1. 启用 Typesetter。
2. 保持“实时预览”“阅读视图”和“打印与 PDF 输出”开启。
3. 若希望编辑时看到字面 Markdown，请保持“源码模式”关闭。
4. 在普通正文中输入 `--`、`----` 或 `...` 等简写。
5. 将光标移入已转换标记，即可看到原始源字符。
6. 若某条规则与当前仓库的写作规范冲突，可单独关闭。

全局开关、实时预览开关和阅读视图开关均提供命令；切换不会修改笔记内容。

## 排版规则

### 连接号、破折号与范围

| 源标记或上下文 | 显示结果 | 默认 | 说明 |
| --- | --- | --- | --- |
| `--` | en dash `–` | 开 | 仅普通正文。 |
| `----` | em dash `—` | 开 | 先于 `--` 处理；`---` 刻意不作为简写。 |
| `2025-2027`、`pp. 15-23` | 使用 `–` 的数字范围 | 开 | 保守识别；减法和科学计数法保持原样。 |

Markdown 分割线和前置元数据分隔符属于结构语法，绝不会按破折号简写处理。

嵌套列表中的安全正文同样支持破折号简写，包括带粗体或斜体的列表文字：

~~~markdown
- Drawing tangents:
    - The "long--line" principle----extend the tangent.
~~~

转换出的破折号继承周围正文的字体。区域 CJK 标点字体仅在标点规则明确选择时生效，
不会仅因界面语言而改变破折号简写的字体；具体字形仍取决于笔记字体和主题。

### 箭头

每种映射都有独立开关。单线箭头默认开启；类似运算符的双线箭头默认关闭，
因为 `<=`、`=>` 等标记常见于程序语言。

| 源标记 | 显示字符 | 默认 |
| --- | --- | --- |
| `->`、`<-`、`<->` | `→`、`←`、`↔` | 开 |
| `-->`、`<--`、`<-->` | `⟶`、`⟵`、`⟷` | 开 |
| `=>`、`<=`、`<=>` | `⇒`、`⇐`、`⇔` | 关 |
| `==>`、`<==`、`<==>` | `⟹`、`⟸`、`⟺` | 关 |

这些只是正文显示规则，绝不是源文本替换。即使启用对应箭头，代码和公式也
始终受到保护。

### 省略号

| 源标记 | 显示字符 | 默认 |
| --- | --- | --- |
| `...` | `…` | 开 |
| `......` | 居中的中文省略号 `……` | 开 |

引擎只按明确标记工作，不会根据文档主要语言猜测省略号体例。

### CJK 与拉丁文字标点

默认以输入法写入的 Unicode 字符为权威。Typesetter 保留简体中文、繁体中文、
日文和韩文输入法的常见标点，包括 `．`、`｡`、`､`、`｢｣`、`＂` 和 `＇`
等全角或半角形式。

区域标点字形与共享弯引号字形是独立的可选功能。句号、逗号、冒号、分号、
问号和感叹号纠正也是分别配置的高级规则，并且默认关闭，避免替作者或输入法
决定编辑体例。

渲染 HTML 中显式继承的 BCP 47 语言信息优先。日文假名和韩文谚文能够识别
局部文字系统，但仅凭统一汉字无法可靠区分中国大陆、台湾、香港、澳门或日文
排印习惯。

## 永久保护的上下文

Typesetter 始终排除：

- YAML 前置元数据和 Properties；
- 行内代码、围栏代码、缩进代码及 TikZ；
- 行内与显示 LaTeX、MathJax 输出及技术公式容器；
- HTML 源码、SVG、`script` 和 `style`；
- URL、Markdown 链接目标、内部链接目标和嵌入目标；
- 标签、块 ID 与 Markdown 结构语法；
- 无法确认是安全正文的插件技术 DOM。

标题、列表、引用、表格、Callout、脚注和链接显示文字中的安全正文仍可排版。
宁可漏掉一次转换，也不在技术内容或结构语法中误转换。

## 设置

设置界面跟随 Obsidian 应用语言，内置英语、简体中文、繁体中文、日语和韩语。
香港、澳门语言代码使用繁体中文界面；其他语言回退到英语。

设置项名称描述排版结果，源标记与显示字符分别放在说明中，避免使用容易混淆
的“字符转字符”式标题。

| 分区 | 控制项 | 默认 |
| --- | --- | --- |
| 渲染 | 总开关、源码模式、实时预览、阅读视图、打印/PDF 输出、光标处显示源标记 | 总开关开启；源码模式关闭；其余开启 |
| 破折号 | En dash 简写、em dash 简写、数字范围 | 开启 |
| 符号 | 六种单线箭头、六种类似运算符的双线箭头 | 单线开启；双线关闭 |
| 标点 | 两种省略号、CJK 字形与引号塑形、四种 CJK 体系、六类纠正 | 省略号与 CJK 体系开启；塑形和纠正关闭 |
| 安全 | 永久保护上下文的只读说明 | 始终执行 |

## 工作原理

~~~text
Obsidian 语法树或渲染 DOM
        ↓
确认安全的普通正文片段
        ↓
纯排版引擎
        ↓
CodeMirror 装饰或成对的渲染 DOM 标记
~~~

排版引擎不了解 Markdown、DOM 或 Obsidian。适配层先批准安全文本，引擎再收集
候选范围、确定性解决重叠，并返回显示替换。

源码模式和实时预览通过 CodeMirror 6 装饰处理可见范围；阅读视图使用 Obsidian
Markdown 后处理器，并且只改变可见文本节点。打印 CSS 选择成对 DOM 标记中的
排版结果。任何路径都不会写入笔记或发出源文本替换事务。

实现与信任边界参见 [ARCHITECTURE.zh-CN.md](ARCHITECTURE.zh-CN.md)。

## 开发

环境要求：Node.js 24、npm 11，以及用于运行时验收的 Obsidian 1.7.2 或更高版本。

~~~bash
npm ci                 # 按锁文件安装依赖
npm run dev            # 监听构建
npm run build          # 严格 TypeScript 与生产构建
npm run lint           # ESLint
npm test               # Vitest
npm run check:release  # 清单与发布元数据
npm run check          # 本地与 CI 完整门禁
~~~

使用 [`fixtures/typography-test.md`](fixtures/typography-test.md) 完成手工验收，并
确认文件哈希不变。不得提交生成的 `main.js`、本地库数据、`node_modules`、
覆盖率输出或临时发布说明。

## 发布流程

1. 同步 `package.json`、`package-lock.json`、`manifest.json`、
   `versions.json`、双语 README 与 `CHANGELOG.md`。
2. 运行 `npm run check`。
3. 创建与清单版本一致的纯语义化版本标签，例如 `0.1.0`。
4. 推送提交与标签。
5. GitHub Actions 从标签源码重新构建，并且只发布 `main.js`、
   `manifest.json` 和 `styles.css`。

自动化路径参见 [`.github/workflows/release.yml`](.github/workflows/release.yml)。

## 已知限制

- 移动兼容架构不能替代针对每个 Obsidian 移动版本的实机测试。
- 仅凭统一汉字无法推断地区中文或日文出版规范。
- 不同输入法可能写入相同的弯引号码位；显式语言信息才是可靠覆盖方式。
- 跳过 Obsidian 后处理 DOM 或打印 CSS 的导出器需要专用适配器。
- 语法节点名称和导出时序由宿主控制，除自动化测试外仍需 Obsidian 手工验收。

## 项目政策

Typesetter 是采用 [MIT 许可证](LICENSE)的独立社区项目。它没有付费版本、
许可证服务、遥测、广告或商业功能门槛。

- [参与贡献](CONTRIBUTING.zh-CN.md)
- [安全政策](SECURITY.zh-CN.md)
- [行为准则](CODE_OF_CONDUCT.zh-CN.md)
- [路线图](ROADMAP.zh-CN.md)
- [AI 辅助声明](AI-ASSISTANCE.zh-CN.md)
- [第三方声明](THIRD-PARTY-NOTICES.md)
