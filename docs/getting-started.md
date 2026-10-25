# 开始制作 / Getting started

## 先把编辑器跑起来

按照 [README](../README.zh-CN.md) 安装并启动。开发服务器地址通常是 `http://127.0.0.1:5173`，以终端实际输出为准。开发服务器启动前会构建离线纪念馆的独立运行文件。

初次打开先体验虚构示例，了解收礼页面的组成；正式制作时点击「从空白开始」，确认替换后填写「我们的封面」。在「回忆与相册」添加日期、标题、故事和附件，用上下箭头调整顺序；在「一封信」与「小惊喜」完成文字。封面使用故事顺序中的第一张照片。

「故事开始的那天」当天显示为第 0 天，之后按本地日历经过的天数计算。可选的「期待一个特别的日子」对应某个具体日期，不会自动按年重复。

保存提示表示当前内容已写入这个浏览器的本地数据库。若出现保存错误，保留当前页面并先尝试下载备份；不要直接清除站点数据。换浏览器或设备时，通过备份 ZIP 迁移。

## 选什么媒体

优先选择浏览器普遍支持的图片、MP3/WAV 音频，以及 MP4（H.264/AAC）视频。浏览器是否支持播放取决于容器与编解码器；文件扩展名正确不保证可播放。HEIC、部分 MOV 和特殊编码可能需要先转换。应用不会自动转码。

用短片段和压缩照片控制体积，保留原件在其他位置。导出和导入会在内存中处理 ZIP，长视频较多时容易受设备内存、浏览器配额或下载空间限制。实际限制见[备份与离线使用](portability.md)。

音频和视频由收礼人主动播放。交付前在对方将使用的浏览器中试播，确认方向、声音和字幕都合适。

## 预览并交付

点击「预览礼物」检查姓名、日期、回忆顺序、图片和长信，可切换手机宽度，再「返回编辑」。通过「导出礼物」选择「可编辑备份」自己保存，再选择「离线回忆馆」给对方。「Markdown 记忆库」用于普通文件阅读。发送整个 ZIP；只发送 `index.html` 会遗漏脚本、样式和媒体。

不要把真实回忆放入开源仓库。若希望发送链接，先阅读[部署指南](deployment.md)并确认内容可以公开。

## English quick path

Run the commands in the [English README](../README.md), open the address printed by Vite, then explore the fictional sample. Start blank for your own gift, enter the couple's details, add memories and attachments, and preview the result. Keep an editable backup before sharing a museum export.

Extract the entire museum ZIP and open `index.html`. Keep all sibling runtime and media files together. Test it on the recipient's intended browser; audio/video codec support varies, and this app does not transcode files. See [portability](portability.md) for recovery and offline checks.
