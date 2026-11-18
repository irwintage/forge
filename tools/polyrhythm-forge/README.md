# Polyrhythm · Forge Edition

Standalone module. Open `index.html` directly, including via `file://`, with no external dependencies.

- `index.html`: semantic controls and layout
- `style.css`: scoped visual design
- `app.js`: presets, balls, responsive canvas, controls
- `audio/engine.js`: Web Audio FM voices, stereo-safe output, compressor, convolution reverb, lookahead note scheduling

**Rhythm convention:** all lanes share a four-quarter-note cycle. A 3:4 preset plays 3 evenly spaced hits against 4 within this cycle. This is more conventional and responsive than the original LCM-beats interpretation, which could make 5:7 last many seconds.

**Timing:** the audio engine schedules note onsets ahead using `AudioContext.currentTime`. The visual positions use the same audio clock, though screen refresh timing still limits visual accuracy. New playback restarts at step zero. Changing BPM or preset resets the cycle.

**Forge lifecycle:** `window.ForgePolyrhythm.stop()` fades audio and stops animation; `window.ForgePolyrhythm.destroy()` also closes the AudioContext and disconnects resize listeners. Embed using isolated iframe initially or implement its equivalent module-loader lifecycle before inline injecting scripts.

**Audio safety:** start at 22% Master with a dynamic compressor. Do not assume headphones or speakers provide a safe sound level; begin at low volume.

**Limitations:** browser listening tests are required to assess timbre and perceived reverb. UI animation and copy are fully local; no network or CDN required.


## V1.1 bug fixes
- The first Play now starts the visual render loop immediately, without needing to change the poly-rhythm preset.
- Reduced stage and canvas heights to remove unused empty space underneath the bouncing balls while keeping responsive layouts.
