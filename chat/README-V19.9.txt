FORGE CHAT V19.9 — INLINE STARS + DEDICATED FEEDBACK

INSTALL (compatible with Forge V19.4)
1. Back up your current chat/ folder.
2. Replace it with the chat/ folder from this ZIP. No changes to Forge index.html.
3. Open Forge. Open a tool and click 1–5 stars; an explicit Confirm button appears.
4. Click Feedback / Bug to open a standalone view. Use ← to return to chat.
5. The chat is still fully local: all 37 tool guides and suggestions work offline.
6. In Explore (no tool open), stars are hidden but Feedback / Bug remains available.

SAFETY / STATUS
- This ZIP does NOT activate real rating and feedback submissions by itself.
- A working Cloudflare Worker, D1 binding/tables and Cloudflare Turnstile are required.
- Until BOTH apiBase and turnstileSiteKey are configured in chat/config.js,
  the confirm and feedback submit buttons are disabled. No false confirmations.
- Comments can contain literal HTML/JS as bug reports. NEVER render user
  comments with innerHTML in any future admin/dashboard interface. Use textContent.
- Worker must validate Turnstile tokens, inputs and use parameterized D1 SQL.
- Turnstile needs an HTTP(S) origin; for real submissions run Forge on localhost,
  not file://, and configure the origin/hostname for local testing.
- No freeform chat messages are sent to a server by this package.

NEW UX
- Five stars are visible at all times when a specific tool is open.
- Selecting stars never submits automatically; click Confirm to publish.
- Ratings reset when the active tool changes.
- Feedback/bug form is a separate view in the existing draggable popup.
- All prior FAQ content, suggestions, typing indicator and scroll remain.
