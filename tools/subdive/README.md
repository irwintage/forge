# Subdive V5.2 · UI polish

Refinement of the approved V5.1 layout. No intentional changes to the sound engine, generative algorithms, or Forge bridge.

- Root note buttons: consistent dimensions, sharp-letter baseline, fully centered glyphs, higher active/inactive contrast.
- Play state follows active Tone.Transport; Stop returns idle state. Recording uses a restrained red LED and clearly changes to Stop & Save.
- Seed section gets a compact icon and clearer lock state. Drum Engine retains the drum icon and adds clearer ON/OFF treatment and muted state.
- Six original canvas animation algorithms preserved, recolored to the pixelTone-inspired green/lime palette with consistent backgrounds and borders.
- Slider hover and press feedback improved.
- Works with existing relative paths `css/main.css`, `js/app.js`, `vendor/Tone.js`, `js/forge-bridge.js`.

Open `index.html` in a modern browser. Audio starts after browser permission / user interaction. Recording exports WebM as before.
