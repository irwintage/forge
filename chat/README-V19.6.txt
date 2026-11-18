Forge Chat V19.6 - readable contextual companion (LOCAL prototype)

INSTALLATION
Replace only the existing chat/ folder in your local Forge V19.4 with the chat/ folder from this archive. Keep a backup first.
No change to index.html, Hostinger, GitHub, or Cloudflare is required for local testing.
FAQ loading also works via file:// using the included faq.bundle.js fallback.
When editing faq.json, regenerate faq.bundle.js or test through a local HTTP server to use the latest JSON.

IMPROVEMENTS
- Larger popup (up to 440 x 608 px), 14.5 px chat text; more legible buttons and labels.
- Three animated SVG-free CSS dots while a local FAQ reply is prepared.
- Friendly brief welcome and green highlighted current tool name.
- Clearly visible clickable suggested question chips, even after a response.
- Short and accurate instrument explanations; Shepard has real guidance for recording and sound controls.
- Simple first-class handling of What is Shepard? and What can I do?
- Short, honest fallback rather than a lengthy automated disclaimer.

IMPORTANT
This package only improves the frontend FAQ. No AI or chat-to-Worker API connection is installed.
Feedback and ratings still need a separate configured and secured backend, and remain disabled in local preview.
No other Forge or instrument source files are touched.

V19.6.1 visual refinement:
- No emoji in welcome messages.
- Current tool name has green color only: no bold, underline, badge or highlight background within responses.
- Short welcome, prompts, typing animation, and existing local FAQ remain.
- No Cloudflare API / Workers AI connection in this package.

V19.6.2 FAQ REPAIR:
- Fix exact-title FAQ matching. "How do I start?" now returns the AURA article.
- Understand common getting-started paraphrases before generic keyword matching.
- Add validated AURA Sampler steps from the actual instrument interface.
- Update both faq.json and the file:// FAQ fallback bundle.
- Keep existing UI, green-only tool emphasis, and no welcome emoji.
- This remains an offline FAQ prototype; no live AI connected yet.
