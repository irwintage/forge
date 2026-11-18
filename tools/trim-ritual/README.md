# Chrysasynth Forge · Trim Ritual V1

Compact WAV/MP3 trimming utility. Open `index.html` locally in a modern desktop browser (no build step, no dependencies).

## Features
- Drop or upload WAV/MP3 between 5 and 60 seconds.
- Drag directly over the waveform to create a selection; drag the end handles, or move the whole selection.
- Adjust precise start/end timestamps (seconds).
- Generate random selections with adjustable length (0.5–4 seconds).
- Preview selection with Play/Stop and micro-fades (max 6 ms).
- Export selected audio as 44.1 kHz, 16-bit PCM WAV (up to stereo), with 5 ms fades to reduce clicks.
- No uploads to any server. No external dependencies.

## Files
- `index.html`: interface structure
- `style.css`: Forge design
- `app.js`: waveform, trim controls, transport, file UI
- `engine/audio.js`: native Web Audio decode/preview/offline render/WAV encoder
- `source/original.html`: provided legacy source, untouched

## Limitations
- Only 5–60 s source files accepted (same as original tool).
- Does not preserve original sample rate or multichannel output; exports stereo or mono at 44.1 kHz.
- Audio fades slightly alter the first/last 5 ms to prevent hard-cut clicks.
- No full browser/audio regression test claimed; test using your own WAV/MP3 files before release.

## V1.1 import behavior
- Clicking the waveform import area (or pressing Enter/Space when focused) opens the file picker before a file is loaded.
- Dragging a WAV/MP3 onto the area continues to work.
- After a file is loaded, the import overlay is hidden completely and mouse/pointer interactions edit the waveform as intended.
- The top-right Upload Audio button remains available to replace the current file.
