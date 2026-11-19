# Mindshift V3.3 — Fluid Edition / Forge

Mindshift V3.1 audio engine with a new full-bleed fluid visual synthesis canvas.

## Run
Open `index.html` in a modern browser or host via a static HTTPS web server. No CDN or dependencies. Click Play to enable audio.

## File layout
- `index.html`: interface.
- `style.css`: compact Sonic Laboratory styling.
- `app.js`: UI, XY control, transport, modes, recording.
- `audio/presets.js`: sound parameters / default values and visual colors per mode.
- `audio/engine.js`: stereo Web Audio DSP and WAV recording.
- `visual/fluid.js`: full-surface flow field, audio-reactive strands and constrained feedback.

## Visual modes
Calm: slow open soft strands. Focus: thin precise motion. Dream: diffuse deep trails. Flow: energetic currents. KO: turbulent interruptions.

Hold and Auto Motion remain. The visual receives the same XY state as the sound engine and an analyser RMS measurement. `destroy()` cancels animation and closes audio.

## Test caveat
No local hardware headphone evaluation; verify output stereo balance and audio headroom by ear.

## V3.3 visual fidelity update
The approved cyan/violet Hydra-style prototype is the rendering reference. The Canvas now includes dual-pass bloom, violet atmospheric depth, distinct wave phases, increased light energy and video feedback. Audio engine unchanged.

## V3.4 — Depth & XY refinement
- Deep background without a global bright haze; screen feedback is attenuated before reuse.
- Three distinct depth strata: soft distant waves, crisp middle strands, nearer luminous foreground accents.
- Per-strand glow, no detached white fog.
- XY causes localized wave displacement rather than just an overlaid cursor.
- Audio engine, five mood presets and WAV export unchanged.

Note: visual tuning should be reviewed in a browser on the target display.
