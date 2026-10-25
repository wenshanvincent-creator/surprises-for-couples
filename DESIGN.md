# 两人之间 — design brief

## Idea and real material

On this page, a couple's editable collection of memories becomes an open album: the cover remains beside the reading while each memory becomes a dated print. The working editor shows the actual gift while it is written. The live thing is opening a user-authored surprise, with a different note on each draw.

Inventory: two names, a shared start date, days together, a first meeting, a saved ticket, a seaside walk, a kitchen ritual, dated prints, a letter, a future occasion, portable media and a gift that opens without an account. All example people and events are fictional. Sample artwork is original SVG provided by the data module, explicitly described as illustration rather than photography.

## Direction

Applied installed design-taste-frontend and frontend-design skills. Draw: **The split stage**, seed **715876178**. Chosen because the album cover can remain present while the recipient reads. No redraws. Adaptations required by the approved brief: rose/berry instead of dealt walnut, system Chinese serif/sans instead of remotely fetched Gambarino/General Sans. Use the proportions and composition, not CDN typography. The imposed four-photo and moving-video floor does not fit a fictional, private-data-free sample; do not add unrelated stock photos or decorative video to satisfy it. Report that limitation honestly in critique.

## Tokens

- Ground `#f4f4f1`; paper `#ffffff`; ink `#282a28`; secondary `#656860`; accent berry `#A84458`; soft rose `#f1e2e5`.
- Accent choices: berry `#A84458`, forest `#386253`, ocean `#355e78`. All support white button text.
- Reading display: `"Noto Serif CJK SC", "Songti SC", SimSun, serif`; interface: `"Microsoft YaHei", "PingFang SC", system-ui, sans-serif`. No downloads.
- Interface sizes: 13, 15, 18, 26, 40px. Gift display title scales to 64px, constrained to two lines for the supplied copy; user-written long titles wrap safely.
- Space unit: 8px; desktop page margin 32px; phone 20px. Tone changes separate surfaces. Forms may use borders; no decorative rules, gradients, glass or resting shadows.
- Controls: filled primary, plain secondary, 4px corner radius, 44px minimum interactive height. Clearly visible focus outline.

## Composition

Editor: full-width quiet header, 220px chapter navigation, 480px editing column, flexible preview stage. Real recipient preview uses the same component as the export. On tablet, hide the embedded preview in favor of the explicit full preview. On phone, chapter navigation becomes a wrapping row and forms use one column. No horizontal page scrolling at 320px.

Recipient: broad cover on one half, title/dedication on the other; cover becomes sticky beside the story on large screens. Story prints use big images and dated text. Gallery is a compact contact sheet with image opening. Letter is a calm paper field with generous reading measure. Surprise is a full accent field with a real reveal control. Navigation points to story, album and letter. Empty projects invite the author to add memories without fake content.

## Copy deck and argument

- Editor: “把日子，写成礼物。” — a real complete example and working preview prove what is being made. Actions: “从空白开始”, “导入备份”, “预览礼物”, “导出礼物”.
- Cover: project title and names — specific names, start date and dedication make it theirs. Action: “翻开我们的故事”.
- Story: “一起走过” — dated entries, attachments and full authored text.
- Album: “留住这一刻” — actual uploaded images, expandable to full size.
- Letter: “写给你” — full authored letter, preserving paragraphs.
- Surprise: “下一次，和你” — one user-authored idea per draw; never blocks reading.
- Close: names and start date; sample projects visibly identify fictional illustration.

## Behavior and quality

All text renders as React text. User uploads receive visible errors for unsupported MIME types and size limits; audio/video use native controls, never autoplay. Reordering uses accessible up/down buttons. Destructive replacement is a named confirmation dialog. Import validates before replacement. Save status follows the actual async persistence result; failures remain visible and exports are available from in-memory content. Object URLs are revoked when their blobs leave the preview. Native form labels, keyboard navigation, focus trapping in modal dialogs and Escape handling. Reduced motion disables nonessential transitions. Download menus describe each archive and preserve the editable backup as a separate action.

Inspect desktop 1440, tablet 768, phone 390 and overflow at 320. Review recipient and editor screenshots. Run focused type/build checks and the meaningful browser journey, not additional superficial tests.
