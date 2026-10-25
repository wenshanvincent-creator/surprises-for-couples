# 用 Codex 或 Claude 定制 / Customize with Codex or Claude

本应用不依赖 AI。以下方法用于你希望改样式、整理自己写好的文字或扩展源码时。先保留备份，优先在虚构示例上调试；把真实回忆交给外部 AI 服务前，先了解该服务的数据政策。

## 打开源码项目

先按 [README](../README.zh-CN.md) 运行应用。已安装并登录的 Codex 用户可以在应用里打开这个项目目录，或在项目终端运行 `codex`。已安装并登录的 Claude Code 用户可以在同一目录运行 `claude`。账号、订阅、安装与权限设置以各自官方文档为准：[Codex quickstart](https://learn.chatgpt.com/docs/quickstart)、[Claude Code quickstart](https://code.claude.com/docs/en/quickstart)。

无需为本应用填写 OpenAI 或 Anthropic API key，也无需添加模型依赖。

## 修改外观

将下面提示粘贴给任一工具，并把颜色与意图替换为你的偏好：

```text
先读取 DESIGN.md 和当前编辑器、收礼页面、离线构建代码。
我想把主色改为深蓝，保留当前布局、中文界面和媒体功能。
请在职责正确的样式文件修改，确保收礼页面与离线纪念馆一致。
不要添加远程字体、CDN、账号或 API，不修改示例人物为真实个人。
完成后运行 typecheck 和 build，检查手机宽度截图，说明实际验证范围。
```

完成后自己检查预览并重新导出成品。旧的 ZIP 是旧快照，不会随代码更新。

## 整理回忆文字

先自己提供真实事件，再让助手编辑文字。不要让它填补没有发生过的细节：

```text
下面是我写的回忆，请保留事实、时间、称呼和语气，改得自然、简短。
不要编造对话、地点、感受或承诺。信息不清楚时保留原文并指出疑问。
只返回建议文本，不操作仓库或浏览器数据。

[在这里粘贴你愿意提供的文字]
```

核对后再手动粘贴进编辑器。浏览器中的项目没有自动暴露给终端助手；直接改演示源码也不会修改你已经保存的项目。

## 增加功能

```text
请先阅读 src/domain/types.ts、src/storage、src/export 和收礼页面。
我希望增加一个可选的回忆地点字段；先说明 schema、旧备份与导出的影响。
保持现有备份可恢复，用户文字只能当文本渲染。
方案明确后完成代码与必要的迁移和验证，并更新文档。
不要部署、发布、上传私人素材或连接外部服务。
```

涉及数据格式时先讨论兼容策略。检查最终 diff，实际走一遍编辑、备份恢复、离线打开，再使用真实回忆。

## English prompts

Open the repository in Codex or run `codex` from its directory. For Claude Code, run `claude` there after installation and sign-in. The official quickstarts above cover setup; this app itself does not need an AI account or API key.

```text
Read DESIGN.md and the editor, recipient renderer, and offline build first.
Change the accent to deep blue while preserving layout, Chinese UI, and media.
Keep the preview and museum export consistent. Add no remote assets or services.
Run typecheck and build, inspect a mobile screenshot, and report what was verified.
```

```text
Edit the memory below for natural, concise wording. Preserve facts, dates,
names, and voice. Invent no dialogue or events. Flag uncertainty instead of
guessing. Return suggested prose only; do not change code or stored data.
```

Review every change, use fictional projects for code work, and export a new museum after customization. Existing downloaded gifts do not update automatically.
