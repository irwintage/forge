# Chrysasynth Duality Synth · Forge V1

A redesigned dual-character morphing arpeggiator based on the original Morph Ring.

## Run

Open `index.html` in a browser while connected to the Internet. The audio engine uses Tone.js 14.8.49 loaded from jsDelivr. No build tools or local server are required for the interface; Internet access **is required for sound**.

Press **Play** to unlock audio and start the arpeggiator. Click the 16 steps to edit the phrase; change Seed, Root, Scale, BPM, Master Volume. Drag or click the ring to blend sounds A/B. Enable Orbit for automatic morph movement. Space toggles play/pause when focus is not on a control.

## Architecture

- `index.html` — interface and SVG icons
- `style.css` — Forge graphite/mint visual system, responsive layout
- `app.js` — ring canvas, pointer input, state and sequencing UI
- `audio/presets.js` — 4 complete morph seeds, independent A/B timbres
- `audio/engine.js` — Tone.js engine using two synthesizers and two FX chains, blended with constant-power CrossFade; one scheduled note sequence

## Notes

This version intentionally preserves the original ring interaction and the four musical Seed identities. Morph now genuinely crossfades two individually configured synth/FX voices; it is not a per-animation-frame parameter mutation. The ring maps A to the top, B to the bottom, and 50/50 to either side. Tempo-synced 16-step sequencing is retained.

The oscillator and FX graphs are generated with Tone.js. There is no offline WAV export, since the source prototype did not include one. No audio assets or sample packs are bundled.

## Quality checks

JavaScript syntax validated with `node --check`; bundle structure validated. Browser playback and audio output should be verified in a real browser with audio enabled.

## V1.1 changes
- Refined morph ring: removed non-functional decorative tick marks; luminous interactive handle retained.
- Custom dark BPM +/- controls replace browser-native grey number steppers.
- Sound Character no longer stretches into a mostly empty full-height panel.
- Record & Export: lossless 16-bit stereo PCM WAV of the live synthesis, including A/B morph and effects. Start playback first, click Record, click Stop Rec, then Export WAV.
- V1.2 fix: recording uses Tone.Recorder / MediaRecorder followed by browser decoding and PCM WAV encoding. ScriptProcessor is no longer required. Recording requires browser MediaRecorder support and a compatible decoder for the captured format. The resulting file is genuine stereo 16-bit PCM WAV (audio was captured through the browser codec before PCM conversion, so it is not a lossless recording path). Verify in your browser; long captures consume memory.
