# 安全政策

[English](SECURITY.md)

## 支持版本

安全修复面向 Typesetter 的最新已发布版本。报告前请确认问题可在最新版本复现。

## 报告漏洞

不要通过公开 GitHub Issue、Discussion 或 Pull Request 报告安全漏洞。

请使用 [GitHub 私密漏洞报告](https://github.com/ichenh/obsidian-typesetter/security/advisories/new)
提交机密报告，并包含：

- 受影响的 Typesetter 与 Obsidian 版本；
- 操作系统、设备类型及相关设置；
- 清晰的复现步骤或最小概念验证；
- 预期影响与已知缓解措施；
- 问题是否已在其他位置披露。

请删除私人仓库内容、凭据、令牌和无关个人数据。若私密报告不可用，请使用
[维护者 GitHub 主页](https://github.com/ichenh)公布的私密联系方式。

维护者会在可行时确认完整报告，根据严重程度调查并协调修复与披露。公开前请
预留修复时间。项目目前不提供漏洞赏金。

## 范围

Typesetter 源码、发布产物、更新行为、笔记内容的不安全处理、受保护上下文绕过，
以及意外网络或文件访问均在范围内。无安全影响的排版错误应使用公开 Issue。

Obsidian、CodeMirror、GitHub 或其他导出插件自身的漏洞应报告给对应维护者，
除非漏洞行为由 Typesetter 引入。
