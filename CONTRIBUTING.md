# Contributing

Use fictional data when opening issues, recording screenshots, or submitting changes. Please keep real memories, exported gifts, backups, and credentials outside the repository.

## Set up and check a change

Use Node.js 22.12+ or a newer supported LTS release.

```sh
npm ci
npm run dev
```

Run checks appropriate to the change:

```sh
npm run typecheck
npm run build
npm test
npx playwright install chromium
npm run test:e2e
```

For system Chrome on PowerShell:

```powershell
$env:PLAYWRIGHT_CHANNEL = 'chrome'
npm run test:e2e
```

For a POSIX shell:

```sh
PLAYWRIGHT_CHANNEL=chrome npm run test:e2e
```

If the system browser is installed at a custom path or Playwright cannot discover it, set `PLAYWRIGHT_EXECUTABLE_PATH` to its full executable path instead of setting a channel. For example, on Windows:

```powershell
$env:PLAYWRIGHT_EXECUTABLE_PATH = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
npm run test:e2e
```

The Playwright configuration starts a local preview of `dist/`. Build first, and keep port 4173 free. CI installs Chromium explicitly. It does not upload browser screenshots or traces, which can contain project data.

## Keep the gift portable

The editor uses React, TypeScript, Vite, and IndexedDB. The recipient renderer is also bundled into a classic script for extracted `file://` exports. Changes to recipient content must work in both places. Do not introduce remote fonts, CDN media, scripts, runtime JSON fetches, or required browser storage into the offline museum.

Keep text as text. Validate imported archive paths, schema versions, and media references before accepting a replacement project. Preserve the existing project when an import fails. Calendar dates are `YYYY-MM-DD`; avoid introducing UTC shifts into relationship-day calculations.

## Submit useful changes

Explain the user-visible problem, the resulting behavior, and the checks you actually ran. Add a test when it catches a realistic regression; avoid tests that merely repeat implementation details. UI changes should include fictional-data screenshots at narrow and desktop widths, visible keyboard focus, and reduced-motion consideration.

Add attribution and license information for new dependencies or assets in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Do not add a real person's photographs or copyrighted songs as sample content without explicit redistribution rights. Contributions are provided under this repository's [MIT license](LICENSE).

Please report vulnerabilities through the route in [SECURITY.md](SECURITY.md).
