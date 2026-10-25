# Third-party notices

This review covers the installed `package-lock.json` dependency tree and example source on 2026-10-25. Dependency licenses remain separate from the project's MIT license. See [the full lockfile inventory](docs/dependency-licenses.md) for development and optional platform packages. Recheck it when changing the lockfile.

## Runtime dependencies

| Package | Version | License | Source |
| --- | --- | --- | --- |
| React | 19.3.1 | MIT | https://github.com/facebook/react |
| React DOM | 19.3.1 | MIT | https://github.com/facebook/react |
| scheduler | 0.28.0 | MIT | https://github.com/facebook/react |
| fflate | 0.8.3 | MIT | https://github.com/101arrowz/fflate |

React, React DOM, and scheduler are bundled into recipient/runtime output. fflate is used by the editor for archive handling. Distributions must retain the applicable copyright and permission notices, including when redistributing a generated offline runtime.

### React, React DOM, and scheduler

The installed `LICENSE` files for these three packages contain the following terms:

```text
MIT License

Copyright (c) Meta Platforms, Inc. and affiliates.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### fflate

From the installed `fflate/LICENSE`:

```text
MIT License

Copyright (c) 2026 Arjun Barrett

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Development dependencies

Vite, Vitest, the React Vite plugin, and React type declarations declare MIT licenses. TypeScript and Playwright declare Apache-2.0. The lockfile also contains Lightning CSS under MPL-2.0, picocolors under ISC, and source-map-js under BSD-3-Clause. These are build/test tooling, not an assertion that every dependency is MIT. Keep each installed package's license and NOTICE files when redistributing that package; the inventory records package declarations rather than a legal opinion about derivative works.

## Fictional example and other assets

The names 林予 and 陈安, their story text, and the three SVG keepsakes in `src/domain/project.ts` are original fictional example content authored for this project and covered by the repository's MIT license. The illustrations depict coffee and a note, the sea, and a dinner table. They are not downloaded photographs. No external image, font, music, or video collection is included as demo media.

The site uses system fonts. Referenced design skills and documentation websites informed implementation and are not product assets. The local `.taste-skill/` reference checkout is excluded from repository distribution and does not become MIT-licensed merely by being present in a developer workspace.

Browser tests include an original one-second VP8 test pattern, a generated PCM sine tone, and a one-pixel PNG. The test pattern is generated from FFmpeg's `testsrc` filter, with no third-party footage. The fixture and test source are covered by this repository's MIT license. FFmpeg is not distributed with the app; regeneration instructions are in `tests/e2e/fixtures/README.md`.

User-uploaded media and personal stories retain their respective rights. The application does not verify redistribution permission or apply its code license to them.
