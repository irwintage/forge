# Forge V19 · Contextual Chat (local preview)

## What's in the archive

V19 starts from Forge V18 and preserves all instrument folders. Changes to the host are narrowly scoped:
- `index.html`: loads `chat/chat.css`, `chat/config.js`, `chat/chat.js` and mounts a drawer, while renaming the sidebar Sign In entry to Forge Chat.
- `forge.js`: the former Sign In navigation handler is disabled; the remaining routing and dashboard are unchanged.
- `chat/chat.css`: chat presentation, animations and responsive behaviour.
- `chat/chat.js`: context detection via `#instrument/<id>`, keyword scoring, conversation UI, feedback and ratings adapter.
- `chat/knowledge/faq.json`: editable answers and suggestions for the featured instruments; safe generic fallback for others.
- `chat/config.js`: empty `apiBase`, meaning no public submissions.
- `chat/backend/`: optional Cloudflare Worker/D1 draft, not deployed. See its README.

## Try locally

Run `python -m http.server 8000` in this folder and open `http://localhost:8000` in a browser. Open Subdive or Vocalis, then click **Forge Chat**. It should show the current instrument and contextual suggestions. Typing `how do I export` or `robot` should match curated help. Close with Escape or the close icon. The instrument remains open in the background.

The reply animation uses the same green moving-dot SVG language already found in the **Your Space / In development** area. It is not a network indicator and doesn't imply an AI service is connected.

## How local replies work

A query is normalized to lowercase, stripped of diacritics and punctuation, then checked against keywords. Tool-specific entries are ranked alongside general entries; if none matches, it says it doesn't know. The FAQ is *not* a generative model, it does not understand arbitrary language, and it never claims a feature exists when not documented. No personal data leaves the browser from the chat itself, and messages are not saved between sessions.

## About ratings and feedback

The public back end is optional and NOT enabled by default. The rating and feedback panels are visible to demonstrate the planned UX, but submissions are disabled until a real API is configured and verified. There are no fake reviews and no fake totals. The supplied backend requires Turnstile verification and the frontend challenge hookup is a future step. Any public ratings will need abuse protection and moderation.

## Subsequent edits

FAQ correction? Edit only `chat/knowledge/faq.json`. Styling? `chat/chat.css`. Matching or behaviour? `chat/chat.js`. Changing the backend? `chat/backend/`. The 37 instrument folders need not be regenerated just to update chat files. For release, upload only the changed files to the existing Forge site, rather than replacing the entire site.


## V19.4 — refined card
- The original `forge-lab.png` artwork is unchanged.
- Removed redundant Forge / Creative Audio Laboratory overlay from the sidebar artwork card.
- Increased the card slightly and integrated a single cleaner Chat CTA at the foot.
- Living Line is unframed within the CTA; the collapsed sidebar trigger remains available.
- Chat popup position and FAQ functionality are unchanged from V19.3.
