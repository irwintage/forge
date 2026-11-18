# NeuroFlow / Forge

Standalone binaural-tone studio, migrated from the original Chrysasynth NeuroFlow v1.3.

## Start

Open `index.html` directly in a modern browser. No external library, build step, or server is required. Audio starts only after a Play gesture. Stereo headphones are needed to hear a binaural difference.

## Files

- `index.html`: interface
- `style.css`: scoped Forge-style layout
- `app.js`: UI, waveform, timer and lifecycle
- `audio/engine.js`: Web Audio stereo synthesis

## Forge integration

Scripts are ordinary (non-module) scripts. Styles are scoped under `#neuroflow`. The global `window.ForgeNeuroFlow.stop()` stops playback. Call `await window.ForgeNeuroFlow.destroy()` before removing the tool to release its AudioContext and animation frame. A future Forge loader must mount the markup and load dependencies in the correct order; this ZIP does not implement routing.

## Audio

Each ear receives a different sine tone: left = carrier; right = carrier + beat. Output fades in/out. The Master range is intentionally conservative. Preset frequency labels are conventional descriptions of frequency bands; the program does not claim to induce a particular mental state.

## Notable fixes versus original

- Independent left/right channel routing via ChannelMergerNode (rather than relying on panners or stereo downmix).
- Only one animation loop, with high-DPI canvas sizes changed only when needed.
- Timer is cleared/restarted cleanly; no repeated animation loops on Play.
- Standalone fullscreen targets the tool panel rather than the entire document.
- No decorative glowing brand dot or broad CSS rules affecting a parent dashboard.
