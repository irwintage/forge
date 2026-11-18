# Soft Glue Bus · Chrysasynth Forge V2

Open `index.html` in a modern browser. No server and no external dependencies are required.

## Features
- Drag-and-drop WAV/MP3 and other decodable browser audio files (first 60 seconds, mono/stereo).
- Live bus compressor with Threshold, Ratio, Attack, Release and Makeup Gain.
- Soft Glue, Punch and Calm presets.
- Waveform preview with playhead, loop switch and live gain-reduction meter.
- Offline 16-bit PCM WAV export with current settings.
- `forge-bridge.js`: listens for `forge-deactivate`, `forge-stop`, `chrysasynth-tool-deactivate`, `softglue-stop` and `{type:'forge-activate',active:false}` messages from the parent page.

## Important
Compression is based on the browser's `DynamicsCompressorNode`. The meter reports this node's live `reduction` value. Make-up gain can exceed 0 dBFS; avoid excessive levels to prevent clipping. No hard limiter is added to preserve the original compressor behavior.

File structure: `index.html`, `css/main.css`, `js/audio-engine.js`, `js/app.js`, `js/forge-bridge.js`.
