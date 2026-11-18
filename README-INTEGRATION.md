# Forge V14 · Seamless Workspace (local test build)

Built from Forge V13 and the supplied tools. No live GitHub files were changed.

## Changes
- The instrument route hides Forge’s large page title/search header. The catalogue retains its original design and search.
- A single thin toolbar provides Back, instrument name, category and Reload.
- The extra dark frame border/background is removed; the iframe fills the remaining workspace.
- Forge attempts to make native scrollbars dark or invisible while preserving scroll behavior.
- `pixelTone` is now **one** catalogue entry, opening `tools/pixeltone/index.html`, which contains Bloom and Warp tabs.
- The instruments themselves and their sound engines have not been rewritten.

## Test
Serve this directory over HTTP, e.g. run `python -m http.server 8000` from this folder, and visit `http://localhost:8000/`. Avoid relying on `file://` for microphone and module/API behavior.

Test: pixelTone Bloom ↔ Warp, Knot, SUBDIVE, Chord Bloom, Vocalis, changing instruments and going back to All Tools. Also check exports and imports in a modern browser.

Known limitation: instruments differ in their own fixed heights and internal layouts. A long tool may still need scroll *inside its content*. This build removes the redundant Forge frame chrome, not the intrinsic height constraints of each individual instrument. Actual playback/visual browser QA is still required.


## V15: targeted UX corrections
- Forge-green thin scrollbars for the dashboard and same-origin instruments (including nested iframes).
- Dark neutral document backdrops for Nodes, Tap Tempo, Frequency ⇆ Note, BPM ⇆ Milliseconds.
- All Tools sidebar chevron now expands/collapses category links without navigating away.
- Instrument toolbar reduced to a 32px navigation strip, not a separate page header.
- The established visual designs of SUBDIVE, Axis, Mystic Drums, pixelTone, etc. are unchanged.
- About Forge copy and Sign In/chat are *not* changed yet: future content and chat provider requirements remain to be decided.
- Production check: serve via local HTTP server or deploy to staging, not file://; inspect embedded scrolling and browser APIs in Chrome/Firefox.


## V16 — Explore cards and document backgrounds
- Featured Axis, pixelTone and Hold The Frequency now open internal instrument routes. Studio stays external.
- pixelTone featured as one unified tool, opening its root entry with Bloom and Warp tabs.
- Dark background applied in each affected CSS file: Tap Tempo, BPM/Milliseconds, Nodes and Frequency/Note.
- Forge-green scrollbar CSS placed in the individual documents, including Structura's own scrollbar.
- CSS and JS paths left unchanged; no audio engine modifications.
- Test in browser over localhost; reload with cache disabled when comparing to V15.


## V18 - Unified instrument scrollbars
- Shared `tools/forge-scrollbars.css` and `tools/forge-scrollbars.js` included in each HTML entry point, including pixelTone submodes and Hold the Frequency.
- 5px dark-green scrollbar thumb with transparent track, across tools and their internal editors.
- Suppresses document scrollbars when there is less than 5px of actual scrolling; does not disable necessary scroll areas.
- Frequency ⇆ Note: removes the redundant outer background layer while preserving its internal cards.
- Does not change the sidebar behavior or tool audio engines.
