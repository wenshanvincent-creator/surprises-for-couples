# Surprises for Couples — v0.1 implementation plan

Date: 2026-10-25
Repository: https://github.com/wenshanvincent-creator/surprises-for-couples
Stage: v0.1 implemented and published to the repository. Local production build, 33 data tests and two real-browser journeys passed, including extracted file:// offline media playback. Hosted CI status is available in GitHub Actions; public website deployment remains optional.

## Confirmed brief

Build an open-source tool anyone can personalize for their relationship: a website, an offline museum, and portable Markdown memories. No account or AI API is required for v0.1. Include practical Codex and Claude guides. Vincent explicitly prioritizes visual quality and requests parallel implementation using gpt-6.1-sol with high reasoning and fast service where supported.

The screenshot is inspiration, not a requirement to implement every suggestion. Messaging integrations, local model inference, ongoing AI agents, cloud synchronization and authentication are outside v0.1.

## Product and user journey

1. Open a complete fictional example or start a blank project.
2. Enter names, relationship start date, a dedication and an optional upcoming date.
3. Add memories with dates, titles, text, photos, audio or video; edit, reorder and remove them.
4. Preview the recipient-facing experience on mobile and desktop.
5. Download an offline museum, an editable backup or a Markdown memory vault.
6. Optionally host the exported museum using documented static hosting steps.

The editor and recipient experience have different layouts. The recipient sees a finished gift without editing controls. Public source/demo uses fictional content and original or properly licensed example assets.

## v0.1 scope

| Area | Deliverable | Acceptance |
| --- | --- | --- |
| Project setup | Names, start date, dedication, optional occasion | Changes appear in preview and survive refresh |
| Memory editor | Dated entries, captions, photos/audio/video, ordering | Create/edit/delete and media survive backup/restore |
| Recipient site | Personal cover, days together, next occasion, story timeline, gallery, letter | Works on narrow screens and with keyboard navigation |
| Small surprise | User-authored date-idea draw or revealable notes | Real interaction works in both preview and exported site |
| Local persistence | IndexedDB for structured data and media blobs | Save errors are visible; UI does not claim an unsaved edit is saved |
| Backup | Versioned ZIP with manifest, records and media | Import reproduces project; invalid imports do not overwrite current project |
| Offline museum | ZIP containing index.html and relative media assets | Extract and double-click index.html while network is disabled |
| Markdown vault | Overview, timeline, one file per memory, relative media links | Human-readable, stable filenames and Unicode preserved |
| Guides | Quick start, customization, hosting, backups, Codex/Claude prompts | A fresh clone can follow the documented commands |

Use one polished visual theme first, with a small selection of accent colors. Multi-theme infrastructure and broad customization are deferred until the primary experience is excellent. UI starts in Chinese; provide Chinese and English README files. Full runtime localization is a later enhancement.

## Design direction

Use the project's tangible output as its identity: an editable collection of memories that becomes a gift. Proposed direction is a contemporary photo album with letter-like typography, generous photographic space and a restrained berry/rose accent against clean light surfaces. Exact tokens and composition are decided in the design brief before component implementation.

Avoid relying on private photographs. Use authored SVG sample keepsakes or verified licensed assets and identify all sample people/events as fictional. Do not depend on remote fonts, CDN images or third-party scripts in exports.

Design workflow:

1. Compare open-source design skills and their actual source instructions.
2. Use the installed design-taste-frontend workflow for the public introduction/recipient visual direction; use frontend-design principles for the editor.
3. Save a single DESIGN.md defining typography, colors, spacing, components, responsive behavior, motion and example content before parallel UI implementation.
4. Review actual screenshots at 390, 768 and 1440 pixels; check a 320-pixel layout for overflow.
5. Check focus visibility, readable contrast, reduced-motion preference, empty states and error messages. Audio starts only through a user action.

Skill sources researched:
- https://github.com/anthropics/skills/tree/main/skills/frontend-design
- https://github.com/tasteskill/tasteskill
- https://www.skills.sh/

Skills guide the work; they are not evidence that the finished UI looks good. Screenshot review remains required. Do not copy third-party skill packages into the product repository without checking their licenses.

## Architecture

Use React, TypeScript and Vite for the editor; CSS variables and scoped component styles for the visual system. Choose current compatible dependency versions when scaffolding and commit the lockfile. Use IndexedDB through a small storage module, a ZIP library for archives and narrowly scoped validation at import boundaries. Keep the application static-hostable with no backend.

Suggested responsibilities:

```text
src/domain/       versioned schema, validation, date calculations, fictional sample
src/storage/      IndexedDB project and blob persistence
src/editor/       project and memory editing
src/recipient/    recipient experience and shared presentation
src/export/       museum, backup, Markdown and restore
src/styles/       tokens and responsive layout
docs/             setup, deployment, portability, AI-assisted workflows
tests/            focused data/export tests and browser journeys
```

Define the shared Project, Memory and Asset contracts before splitting work. Store calendar dates as YYYY-MM-DD and calculate days as calendar days, avoiding UTC date shifts. Media records reference stable asset IDs; filenames are generated safely rather than used as filesystem paths from user input.

The offline museum is a separate build target: bundled classic JavaScript and local CSS/assets, embedded serialized project content, no runtime fetch for project JSON, no module imports, no service-worker requirement and no dependency on file-origin browser storage. Reuse presentation logic where feasible so preview and export do not drift.

The editable backup is the durable source. Browser persistence is convenience, not the only copy. Export includes original supported media; surface unsupported formats and practical archive-size limits. Do not promise multi-decade media or USB compatibility.

User text is rendered as text. Imported archives are checked for schema/version, safe paths and referenced media before replacing data. Treat Markdown as portable content, not executable HTML. Publicly hosted exported content is public; a decorative unlock interaction is not authentication.

## Sharing and hosting

The editor URL alone does not share a user's local project. The export must contain the actual project and media before it can be hosted or sent.

Provide static hosting instructions for GitHub Pages and Cloudflare Pages, plus optional temporary Cloudflare Tunnel instructions. Start the tunnel against a prepared export directory rather than the private editor. Quick Tunnels are temporary previews, not permanent addresses.

Repository upload and public website deployment are separate milestones. Build CI and an optional Pages workflow; verify a public demo only if it is actually deployed. Never commit a user's private exported museum into the open-source demo by default.

Reference documentation:
- https://vite.dev/guide/static-deploy
- https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
- https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/

## Parallel implementation

First establish package scripts, shared types, a fictional sample, DESIGN.md and ownership rules. Then run three workers plus a coordinator:

| Owner | Work | Owned paths |
| --- | --- | --- |
| UI worker | Editor, recipient experience, responsive styles | src/editor, src/recipient, src/styles |
| Portability worker | Persistence, archives, Markdown, offline packaging | src/storage, src/export |
| Documentation/QA worker | User guides, licensing review, meaningful journey tests | docs, tests, README files |
| Coordinator | Shared contracts, integration, visual review, CI, final diff and upload | src/domain, root configuration, integration |

Use independent worktrees for overlapping Git work. Workers must not push or modify another owner's files; the coordinator integrates commits. Build sequencing explicitly accounts for the export worker depending on the recipient renderer contract. Avoid creating duplicate renderers simply to unblock a worker.

Set each worker to gpt-6.1-sol and high. The available chat-creation tool exposes model and reasoning but no fast/service-tier flag. Do not claim that fast mode was enabled through that tool. Parallel subagents advertise priority service but are not separate sidebar chats. Resolve the requested window arrangement using the supported app controls at execution time.

## Verification and release

Focused checks:
- Type checking and production build.
- Calendar calculations, including dates around timezone boundaries and leap dates.
- Backup/restore round trip with Chinese text and binary media.
- Import failure leaves the existing project intact.
- Exported HTML treats script-like user text as text.
- Browser journey: blank project -> add a memory and media -> refresh -> preview -> export -> restore.
- Open extracted museum via file:// with network disabled; verify navigation, images, supported audio/video and the surprise interaction.
- Verify app and exported site at mobile/tablet/desktop widths; inspect screenshots for composition and overflow.

Open-source package: MIT license for original code, third-party notices as applicable, bilingual README, screenshots, CONTRIBUTING.md, SECURITY.md, sample data, CI and deployment instructions. Validate dependency and asset licensing before release. Check the final diff and tracked files for private material, build junk or credentials.

Before upload, recheck the remote branch and latest commit. Push only this project's reviewed changes. Verify repository files and hosted CI after upload; distinguish local success, push success, CI success and any live demo verification in the delivery report.

## Discovery evidence and remaining defaults

Local workspace was empty and was not a Git repository. The GitHub connector reported the target public repository as size 0 with main as its default branch and write/admin permissions. Local gh initially reported no authentication; Vincent was given the official browser-login command. Recheck these time-sensitive facts before implementation/upload.

Defaults proposed for execution: MIT license, Chinese product UI, bilingual README, one curated theme, supported image/audio/video attachments with documented size limits, no cloud accounts. These choices are reversible and do not require additional personal data from Vincent.
