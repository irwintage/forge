# STRUCTURA Forge V2.4 · Final

Standalone browser tool. Open `index.html` in a modern browser. No build system or CDN needed.

## Export

- **Structure MIDI** (default): Standard MIDI File Type 1, 7 tracks: tempo and section markers; a **Sections** guide note lane; Drums, Bass, Chords, Lead, FX guide note lanes. Notes are sustained for the exact duration of each section where each layer is active. Velocity encodes the section energy. Pitches on these lanes are arbitrary labels, **not** composed melodies or playable drum rhythms. Mute guide tracks when importing them into your DAW.
- **Musical MIDI**: existing 6-track export with section markers, drum hits, bass, chord, lead and FX note events from editable 16-step patterns.

**Compatibility:** MIDI is DAW-independent, but not every DAW imports marker meta-events as visible timeline markers or turns sustained notes into separate clips. The guide-note lanes remain visible in piano rolls even if markers are ignored. Importing MIDI will not recreate Structura's graphical Energy Curve or its internal editor.

## Other functions

Editable sections and bar ruler, track matrix with miniature patterns, pattern editor, energy curve, genre presets, browser-only audio preview. Sounds are not embedded in MIDI. Project saving is intentionally not included. Export your work before closing the page.
