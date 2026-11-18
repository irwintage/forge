# Sphère Natale V4 · PixelTone-inspired instrument

Open `index.html` through a local web server or an HTTPS server. Tone.js 14.8.49 loads from cdnjs and needs network access.

## Design
- Entirely new single-shell design inspired by the provided pixelTone `shell.css`, `warp.css` and `bloom.css`.
- Zodiac wheel stays the primary canvas; desktop has two columns; planets form a lower chord strip.
- No decorative emoji; planet icons are original SVG paths.
- Default date: 01 January 2000.

## Preserved
- Original planetary frequencies, date and sign mapping, Tone.js drone and planet accents.
- Independent drone gains/crossfade improvements from V3.1.
- Forge bridge and stop/resize messages.

## Notes
- The tool is an artistic planetary sonification, not a calculated astronomical birth chart.
- Requires listening tests on speakers/headphones and browser regression tests.
- The initial audio engine and Tone.js network dependency are unchanged; the design refactor does not claim to remove all audio defects.
