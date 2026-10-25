# 可选部署 / Optional hosting

公开托管前检查实际文件。纪念馆包含你导出的文字和媒体，知道地址的人可能访问；页面互动不提供身份验证。希望私密交付时，可以直接发送离线 ZIP，或自行选择带访问控制的托管服务。

## 选择要托管的内容

| 内容 | 文件来源 | 访问者看到什么 |
| --- | --- | --- |
| 通用编辑器 | 源码运行 `npm run build` 后的 `dist/` | 自己浏览器中的项目或虚构示例 |
| 某一份礼物 | 离线纪念馆 ZIP 的完整解压目录 | 你导出的故事与媒体 |

托管编辑器不会把你的 IndexedDB 项目上传给收礼人。公开仓库演示只应包含虚构数据。

## GitHub Pages：可选编辑器演示

仓库附带 `.github/workflows/pages.yml`，仅由 `workflow_dispatch` 手动触发。它构建并上传 `dist/`，不会读取浏览器中的项目。

1. 在自己的仓库中打开 **Settings → Pages**，将发布来源设为 **GitHub Actions**。
2. 在 **Actions** 中选择 **Deploy editor to Pages (manual)**，手动运行。
3. 等待部署成功，再打开工作流输出的 Pages 地址检查。

Vite 配置使用相对资源基址 `./`，适用于仓库路径下的静态资源。离线运行文件也随构建发布。部署流程成功前，不应把仓库地址称为已上线演示。

若要用 Pages 托管某一份礼物，在另一个专用仓库或发布分支中放入完整解压目录，确保 `index.html` 位于发布根目录。对不需要 Jekyll 的纯静态目录可添加空 `.nojekyll` 文件。公开仓库会把文件本身公开；先确认所有媒体的公开传播权限。

依据：[Vite 静态部署](https://vite.dev/guide/static-deploy)、[GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

## Cloudflare Pages：上传成品

使用 [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/) 可以上传已构建目录，无须将私密素材先放入 GitHub 仓库。

1. 完整解压纪念馆 ZIP，确认根目录有 `index.html`、运行脚本、样式和媒体。
2. 在 Cloudflare 的 **Workers & Pages** 中创建 Pages 项目，选择直接上传文件。
3. 上传完整目录或该目录的 ZIP，部署后检查生成的地址。

这仍然是在互联网发布内容。账号和平台文件大小限制适用，尤其需要检查视频体积。后续更新需要重新上传。直接上传与 Git 集成项目的切换限制见官方文档；不要把一次测试上传当作私密存储。

## 临时 Cloudflare Tunnel

只对准备好的纪念馆目录开隧道。先按照 [Cloudflare 官方 Quick Tunnel 指南](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/)安装 `cloudflared`。如果电脑有 Python 3，在解压目录打开终端：

```sh
python -m http.server 8080 --bind 127.0.0.1
```

保留终端运行，在第二个终端执行：

```sh
cloudflared tunnel --url http://127.0.0.1:8080
```

发送终端生成的临时地址。Quick Tunnel 没有永久地址或可用性承诺；停止隧道进程即可结束这个入口。Python 命令仅用于临时本地预览，不能作为生产部署方案。本项目没有替你启动隧道或部署网站。

## English summary

Choose the output first: `dist/` hosts the generic editor; the extracted museum directory hosts one finished gift. An editor URL never transfers local IndexedDB data. The included Pages workflow is manual. Enable Pages with GitHub Actions only when you want a public editor demo, then inspect the deployed address.

For a finished gift, upload the complete extracted museum directory through Cloudflare Pages Direct Upload or a dedicated static host. For a temporary preview, serve only that directory on localhost and run `cloudflared tunnel --url http://127.0.0.1:8080`. Quick Tunnel addresses are temporary. Hosting these files makes their contents accessible; arrange access control separately if required.
