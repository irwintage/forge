# Chord Bloom V6 · Knot-aligned Forge UI + Oscilloscope

## Files

- `index.html`: standalone tool entry point
- `style.css`: fully scoped Knot-inspired Chord Bloom design system
- `app.js`: composition / playback / MIDI / sharing / visualizer
- `audio/engine.js`: self-contained Tone.js synth / DSP / recording engine

## Features preserved

Five seeds with original SVG symbols, harmony selection, modal progressions, seventh chords, loop, playback, BPM, strum, synthesizer presets, independent Master in the top-right header, parallel chorus and convolution reverb, high-DPI waveform, recording and MIDI export, compressed share links.

The visual organization is aligned with the *supplied* Knot source (glass panels, subtle borders, Syne headings, DM Sans controls, restrained slider style and 10px spacing). The violet / cyan accent remains unique to Chord Bloom.

### Forge integration

Styles are scoped to `#cb-app` so they will not override Forge's sidebar or other tools. The full-width page can adapt when mounted inside the Forge content area. `window.ForgeChordBloom.destroy()` stops playback, clears animation callbacks and disposes its audio nodes before a tool swap. The future Forge router still has to mount and unmount this tool.

A standalone local HTML file requires network access to load the CDN-hosted Tone.js, LZ-String and Google fonts. For offline/production Forge deployment, these dependencies should be bundled/localized. Do not run multiple tools that share Tone.Transport simultaneously without explicitly stopping the prior one.

Mobile and genuinely small viewports allow natural scrolling instead of hiding controls. Typical desktop Forge viewports use a compact layout to avoid unnecessary scrolling.

### Audio note

The V4 sound engine is deliberately unchanged in V5; sound quality / reverb is still subject to listening tests on real output hardware. Browser recording uses the format provided by MediaRecorder, not guaranteed native WAV. This file was rebuilt to align visual UX with Knot, not to redesign sound DSP.

## V6 oscilloscope enhancement

- Visual auto-gain scales only the drawn waveform. It never changes audio level or exports.
- Uses a zero-crossing-triggered, continuous high-DPI trace with restrained phosphor glow.
- Visible grid and center line before playback, with an independent tiny energy meter.
- Auto-gain is labelled explicitly so the display cannot be mistaken for an absolute loudness meter.
- The oscilloscope canvas remains the same compact height, preserving Forge layout without extra desktop scrolling.
- Test on actual audio output: this patch changes visualization, not DSP.
