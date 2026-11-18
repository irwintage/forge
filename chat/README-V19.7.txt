FORGE CHAT V19.7 — TOOL KNOWLEDGE EDITION
========================================

INSTALLATION
1. Make a backup of your current Forge/chat folder.
2. Extract this ZIP, which contains one top-level chat/ folder.
3. Replace your existing Forge/chat folder with the extracted chat/ folder.
4. Open Forge and test a few instruments. No root index.html, Forge JS,
   instrument code, Hostinger or Cloudflare settings need to be changed.

CHANGES
- 37/37 instruments now have authored, contextual tool knowledge.
- 211 tool-specific FAQ answers + 16 general Forge/music questions.
- Each instrument starts with an overview, getting started, and creative idea;
  additional questions explain controls and recording/export where supported.
- Suggested questions are clickable and update after each conversation turn,
  making more specific topics discoverable.
- Free-form English phrases like "How to record my session?" and
  "How can I build tension before a drop?" route to relevant verified articles.
- Three-dot response animation, readable UI, tool name highlighted in green,
  and auto-scroll from V19.6.3 are preserved.
- File:// fallback bundle updated with the exact same FAQ data as faq.json.
- Footer simplified: Tool guides · Creative ideas · Local FAQ.

SCOPE / LIMITS
- This is an OFFLINE/LOCAL FAQ, not a generative AI or a trained model.
- FAQ coverage has been drafted from the supplied Tools(1).zip and its source
  documentation; listen/test in your browser and report any inaccurate labels.
- The existing chat/backend/ folder is unchanged: Cloudflare Worker and D1
  integration, feedback submissions and public ratings remain unconfigured.
- FAQ is local to Forge. No SEO pages or public documentation are created.

EDITING CONTENT
Edit chat/knowledge/faq.json. If you preview Forge by double-clicking
index.html (file://), update faq.bundle.js as well because browsers may block
loading a local JSON file. Prefer hosting via local HTTP for development.

Run `node --check chat/chat.js` to check syntax if Node is available.
