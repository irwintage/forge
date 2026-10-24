# Chrysasynth KNOT — V0.4 Audio Foundation

Open `index.html` in a modern browser. No build tools or server-side backend required for basic playback. MIDI requires a compatible browser and may require HTTPS or localhost. The interface uses Google Fonts when online.

## What's new
- `audio/master.js`: separate master bus, dynamic peak protection with switchable DynamicsCompressorNode, live output analyser. This is **not** a true-peak lookahead brickwall limiter.
- `audio/recorder.js`: post-master 16-bit stereo WAV recorder, browser-local, download when stopped. Uses ScriptProcessorNode for broad prototype compatibility; migrate to AudioWorklet for production-grade capture.
- `music/scales.js`: musical scales, mute / quantize / highlight modes. Quantization applies to piano, computer and MIDI note events.
- Responsive output meter and audio-reactive OSC A trace.
- UI refinement: numbered module headings, reduced decoration and brightness, `MAKE SOUND. MAKE SENSE.` signature.

## Important engineering notes
This is a **functional V0.4 prototype**, not a completed production DSP engine. The existing oscillator, filter, envelope, effects and voice management are still implemented in `app.js` and use native Web Audio nodes. The modular extraction begins with master, recorder and scales. The limiter uses a compressor with a fast attack, not guaranteed true-peak protection. WAV recording is live PCM capture; large/long recordings consume memory. For future versions, move audio capture and custom DSP to AudioWorklet, add anti-aliased oscillators, voice-accurate modulation and a more sophisticated limiter. In Scale Quantize mode, multiple input notes can map to the same pitch, and this prototype does not implement independent duplicate-pitch voice allocation.
