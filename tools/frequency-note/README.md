# Frequency ⇆ Note · Chrysasynth Forge

Standalone static tool using HTML, CSS, and JavaScript. No CDN, bundler or external libraries. Open `index.html` directly or serve from your Forge hosting.

## Features
- Frequency → nearest equal-temperament note (A4=440 Hz), cents and exact note frequency.
- Note → frequency, 20 Hz to 20 kHz logarithmic sweep, snap to nearest note.
- 3-second Web Audio reference tone (sine/triangle/soft square), volume-controlled Master, Stop.
- Responsive compact interface following Synth Knot design principles in neutral graphite/silver palette.
- Exposes `window.ForgeFrequencyNote.stop()` and `.destroy()` for transition into Forge's dynamic module loader.

## Integration notes
- All CSS rules are scoped under `#fn-app` to avoid styling Forge navigation.
- `app.js` expects the `#fn-app` markup already present.
- When swapping modules, call `ForgeFrequencyNote.destroy()` before removing the DOM to release the audio context.
- Do not insert HTML containing `<script>` via `innerHTML` and expect it to execute. Load `app.js` explicitly after mounting, or isolate in an iframe.
- No Tone.js needed; avoids sharing or cancelling Forge's global Tone.Transport.
- Audio is limited to a short tone and low initial Master setting. Browser audio requires user interaction.
- The note selector may show pitches outside the sweep range: frequency will clamp to 20–20,000 Hz and the display will update accordingly.
