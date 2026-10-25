# Surprises for Couples

[简体中文](README.zh-CN.md)

Turn your shared memories into a personal website, an offline keepsake, and a folder of readable Markdown files.

This is a local-first, static web app with a Chinese editor. Start with a fictional example or a blank project, write your story, add media, and prepare a gift. No account, backend, or AI API is required. Codex and Claude are optional tools for customizing the source.

![Editor and live gift preview using fictional content](docs/screenshots/editor-desktop.png)

[Desktop recipient preview](docs/screenshots/recipient-desktop.png) · [Mobile recipient preview](docs/screenshots/recipient-mobile.png)

## Run locally

Use Node.js 22.12+ or a newer supported LTS release, npm, and a current desktop browser.

```sh
git clone https://github.com/wenshanvincent-creator/surprises-for-couples.git
cd surprises-for-couples
npm ci
npm run dev
```

Open the local address printed by Vite. Keep using the same browser and address to return to your locally saved project.

## Make a gift

1. Explore the fictional example or start blank.
2. Enter your names, start date, dedication, letter, and optional upcoming occasion.
3. Add dated memories and image, audio, or video attachments; arrange your story.
4. Preview the recipient experience and try the surprise interaction.
5. Download an editable backup, then export the offline museum for your recipient.

| Download | Use it for | How to open it |
| --- | --- | --- |
| Editable backup ZIP | Move or recover your project, including media | Import it into the editor |
| Offline museum ZIP | Give someone the finished experience | Extract the entire ZIP, then open `index.html` |
| Markdown vault ZIP | Keep readable memories alongside original media | Extract it and open the Markdown files |

The editor URL does not carry your memories. Send the exported museum to share the finished gift. Browser storage can be cleared: keep separate backup copies. Exports contain personal content and are not encrypted; a publicly hosted gift is publicly accessible.

## Guides

- [Getting started / 开始制作](docs/getting-started.md)
- [Backups, offline gifts, and Markdown / 备份与离线使用](docs/portability.md)
- [Optional hosting / 可选部署](docs/deployment.md)
- [Customize with Codex or Claude / AI 辅助修改](docs/ai-workflows.md)
- [Contributing](CONTRIBUTING.md) · [Security and privacy](SECURITY.md)
- [License and third-party notices](THIRD_PARTY_NOTICES.md)

## Development

```sh
npm run typecheck
npm run build
npm test
npx playwright install chromium
npm run test:e2e
```

The browser tests serve the production build, so run `npm run build` first. To use installed Chrome instead of downloading Chromium, set `PLAYWRIGHT_CHANNEL=chrome` in your shell. See [contributing](CONTRIBUTING.md) for Windows commands and the test scope.

GitHub Actions checks code and browser journeys. The Pages workflow is manual and optional; including it does not deploy a website. The application currently has one visual theme and a Chinese interface. Authentication, cloud sync, messaging integrations, and AI inference are outside this version.

## License

Original code, documentation, and original fictional example assets are available under the [MIT license](LICENSE). Your own memories and uploads remain yours; adding a file does not grant permission to redistribute it. Third-party dependencies retain their own licenses.
