# Noise Generator — Chrysasynth Forge

Standalone HTML/CSS/JS utility. Open `index.html` directly or serve the directory as static files. No CDN, build step or external audio library is needed.

## Features
- White, pink and brown noise; three large one-click buttons.
- Native Web Audio with independent stereo noise sources. Stereo Width 0% = mono, 100% = fully independent stereo.
- LP, HP and BP filters with a real computed BiquadFilter frequency-response plot, logarithmic cutoff and resonance. Drag the graph to adjust cutoff.
- Air high-shelf, safe default Master of -18 dB, 110ms fade in and 90ms fade out.
- Oscilloscope using the *actual* output waveform. Display gain is visualization-only.

## Forge integration
The app exposes `window.ForgeNoiseGenerator.stop()` and `window.ForgeNoiseGenerator.destroy()` for the later dynamic loader. Stop before switching to another module and call destroy when unmounting. CSS uses `nz-` prefixed classes.

Audio has been exercised in headless Chromium, but listening quality should also be assessed on real speakers/headphones. Noise can be fatiguing at high volumes.
