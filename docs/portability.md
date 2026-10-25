# 备份与离线使用 / Backups and offline gifts

## 保存可编辑源文件

浏览器本地保存适合日常编辑；可编辑备份 ZIP 才适合迁移和恢复。每次完成一轮重要修改后下载备份，在另一个设备或存储位置保留副本。不要把浏览器缓存或一个 USB 盘当作唯一副本。

备份包含版本化项目记录和原始受支持媒体。导入会替换当前项目，所以先备份当前版本；取消替换时应保留原项目。错误或不受支持的备份会显示导入失败，当前项目应保持可用。备份 ZIP 与离线纪念馆 ZIP 用途不同，不能互相代替。

迁移时，在目标浏览器打开编辑器，选择导入备份，核对姓名、回忆数量和媒体播放，再继续编辑。不要手工改写 ZIP 内部路径或 schemaVersion；需要整理文字时使用 Markdown 导出。

## 送出离线纪念馆

1. 在编辑器导出离线纪念馆 ZIP。
2. 用系统解压工具完整解压到普通目录。
3. 打开目录中的 `index.html`。地址栏应为 `file://`。
4. 关闭网络，再刷新页面；检查回忆、图片、音视频、小惊喜和长信。
5. 将原始 ZIP 发送给收礼人，提醒先解压再打开。

成品使用本地脚本、样式和相对媒体地址，不需要登录、服务端、在线字体或本地数据库。请保留完整目录结构。某些手机文件预览器不会执行网页脚本；这种情况下用桌面浏览器打开，或选择静态托管。不要在压缩软件的临时预览窗口里测试。

离线纪念馆是只读成品。后续修改请导入可编辑备份，修改后重新导出。没有自动同步。

## 保留 Markdown 回忆库

Markdown 导出适合在文本编辑器或 Obsidian 等工具中阅读：概览、时间线和逐条回忆与媒体一起保留。相对链接依赖完整目录，移动时整包移动。Markdown 不是编辑器可恢复备份；本版不提供从 Markdown 反向导入。

将用户文字作为普通文本保留；不要通过允许任意 HTML 或运行脚本的插件打开不可信回忆库。

## Practical limits / 实际限制

当前数据边界是：单个媒体最多 50 MiB、媒体合计 250 MiB、ZIP 最多 256 MiB、最多 500 个媒体与 1,000 条回忆。备份中的 JSON 文件最多 5 MiB。文本字段和惊喜条数也有校验限制；超限会显示错误。

ZIP 导出在浏览器内存中生成。请留出额外空间；大文件较多时分批制作更小的项目。浏览器配额、可用内存、系统解压工具和媒体解码能力各不相同，低于上述限制也可能耗尽设备空间。长期保存时同时保留原始媒体、备份、成品和 Markdown，并定期实际打开验证。

## English recovery checklist

- Download an editable backup after important edits; keep a second copy elsewhere.
- Restore that backup in the editor when changing browsers or devices. Check memories and media before proceeding.
- Share the museum ZIP for viewing: extract every file, open `index.html`, disconnect the network, then check content and interactions.
- Keep the directory together. The museum is a finished snapshot; edit the source project and export again for updates.
- Markdown is readable archival content, not a restorable editor backup. Nothing in these exports is encrypted.
