# AURA Sampler · Forge V3

Standalone web sampler, redesigned with the pixelTone visual language.

## Open

Open `index.html` in a modern Chromium/Firefox browser. No external library required. An audio file must be loaded before playing. For production hosting serve over HTTPS, embedded in Forge iframe.

## Files
- `index.html`: semantic interface, SVG control icons
- `css/main.css`: responsive design
- `js/audio-engine.js`: Web Audio graph, voice playback, FX and WAV export
- `js/app.js`: input handling, sample view, presets, note keyboard
- `js/forge-bridge.js`: `FORGE_READY`, `FORGE_RESIZE`, `FORGE_PING`, `FORGE_STOP`
- `legacy-original.html`: untouched supplied source for reference and comparison

## Audio corrections
- LFO modulates around a fixed filter frequency, no cumulative feedback drift.
- Delay is a real dry/wet send with subdued feedback.
- Reverb size rebuilds the impulse response (debounced); the previous slider was disconnected.
- Reverse playback translates region coordinates correctly into the reversed buffer.
- Voice envelopes use rate-aware playback durations. Voice nodes are cleaned up on end.
- UI offers distinct Reverse, Loop, Preview, Stop and Record states.
- Browser WAV capture follows the Web Audio output, decoded from MediaRecorder then encoded as PCM16.

## Test checklist
1. Load WAV, MP3 and a stereo file; test reverse with a partial region.
2. Trigger keys at various transpose/speed values; preview with and without loop.
3. Run Fray, Veil, Rift and adjust LFO, reverb size and delay.
4. Record for several seconds; use Stop recording and verify exported WAV.
5. Rapidly switch Forge tabs and verify `FORGE_STOP` leaves no sound.

## Caveats
- No pitch-preserving time stretch: transposition and speed both change sample playback rate, as in the original.
- Recording relies on the browser's MediaRecorder/decoding support and is not an offline deterministic render.
- Large convolution impulse rebuilding can briefly consume CPU on slower devices.
- The sampler is a creative texture instrument, not a multisampled keyboard.
