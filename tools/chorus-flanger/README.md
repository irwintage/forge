# Chrysasynth Chorus / Flanger · Forge V1.2

Compact modulation FX, built for local `index.html` playback and hosting.

## Files
- `index.html` UI
- `style.css` styling
- `app.js` user interactions, transport, crossfades, minimal phase display and WAV export
- `audio/presets.js` modes/presets
- `audio/engine.js` native Web Audio DSP (shared for live and offline export)

## Changes
- Removed the large animated Fluid Field, kept a minimal LFO phase scope.
- Switching Chorus/Flanger and bypass now uses short output crossfades while the source continues, rather than stopping/restarting playback.
- Presets apply continuously with smoothed DSP parameters.
- No intentionally added UI transition sound. Flanger feedback/sweeps are part of the effect itself.

## Usage
Open `index.html`, load a local audio file by picker or drop, or use Try demo. Click Play. The audio is processed entirely in the browser. WAV renders the current selected effect and settings, not transitions made during playback.
