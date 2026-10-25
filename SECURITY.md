# Security and privacy

## Data boundaries

The application is a static editor with local browser persistence. Project text and media are stored in IndexedDB for the current browser profile and origin. Clearing site data or changing browsers, devices, hostnames, or ports can make that saved project unavailable. Keep editable backups separately.

Backups, Markdown vaults, and museums are ordinary unencrypted files. Anyone who receives them can read their contents and copy media. A publicly hosted museum is accessible to visitors; a reveal interaction does not provide access control. Use an authenticated hosting service or an encrypted delivery channel when that is necessary for your gift.

The app does not require an AI service. If you choose to use Codex, Claude, or another assistant, the files or text you provide are subject to that service's data policies. Prefer fictional content when customizing code.

## Handling files

User text must remain text in editor previews and exports. Backup import validates archive structure and project data before returning a replacement; a failed import must leave the saved project intact. File validation is not a malware scanner. Import backups from people you trust and do not run unrelated files found inside an archive.

Use media you have the right to share. Original files may contain location or other metadata; this app does not promise to remove it. Review the actual exported files before public hosting.

## Report a vulnerability

Use the repository's **Security → Report a vulnerability** option if GitHub private vulnerability reporting is enabled. If that option is unavailable, open a minimal issue asking the maintainer for a private reporting channel, without exploit details or private content. No dedicated security email or response-time guarantee is published.

A useful private report includes the affected version or commit, browser, a fictional reproduction project, expected and actual behavior, and the impact. Never attach a real couple's backup or private media. This early project has no supported-version matrix; report issues against the latest default-branch revision.
