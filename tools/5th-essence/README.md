# 5TH Essence Forge Rack V2.1 · Audio Fix

Fixes in V2.1:
- Connects the processed (wet) signal to every module output. V2 omitted this essential connection, so full-wet settings could be silent.
- Uses linear dry/wet mixing for predictable amplitude of correlated paths.
- Normalizes stereo reverb impulse energy so wet signal does not overload the chain.
- Retains V2 visual rack design, drag-and-drop and preset architecture.
- Verified offline audio output (nonzero RMS) for the full rack and each module at 100% wet, plus WAV export in Chromium.

# Chrysasynth · 5TH Essence V2 / Forge Rack

A local, dependency-free modular audio effect rack inspired by the editing workflow of multi-FX tools. Extract the archive and open `index.html` directly in a modern browser. No local web server required.

## Workflow
1. Load audio with Browse or drop an audio file anywhere in the page (or use Try demo).
2. Add modules from the library; change the three modes within each module.
3. Drag a module by its card to move it to another position; arrow buttons are an accessible alternative.
4. Adjust the three controls per module, bypass or remove modules, or load a complete factory chain preset.
5. Preview and export a stereo 16-bit WAV with effect tail. The offline render uses the same `EssenceEngine.build` function as real-time preview.

## Modules
- Air: LP/BP/HP filter, frequency curve preview, resonance, mix.
- Fire: distinct Tube, Tape, Fuzz waveshaping transfer curves, oversampling, tone and output compensation.
- Water: stereo Chorus, Flanger and Vibrato with safe LFO excursions.
- Earth: synthetic Room, Plate and Hall convolution reverb, with pre-delay and damping.
- Aether: signal-derived spectral texture, not standalone noise, so it cannot swamp the mix when input is silent.

Presets are in `audio/presets.js`; DSP and WAV encoder in `audio/engine.js`; interaction in `ui/app.js`, design in `ui/style.css`.

## Audio limitations
- The input is a **serial DSP rack**; disabled modules are removed from the active path. Reverb last is the default for most presets but can be moved freely.
- A crossfade replaces the live graph on edits, avoiding sustained double routing. Abrupt structural edits may still produce short audible transitions; use modest monitor volume.
- Convolution IRs are procedurally generated with a deterministic seed, so live and offline processing use the same IR shape at the same sample rate.
- Browser decoding depends on codec support. WebM is an audio/video container; WebP is an image format and is not an audio format. WAV, MP3, OGG, FLAC, M4A, AAC, WebM/Opus may work depending on the browser.
- WAV export renders the entire file plus a tail and needs memory. Export is limited to 12 minutes including tail. Waveform is clipped to PCM 16-bit bounds when necessary; **no certified true-peak limiter** is included. This is creative sound design, not a mastering suite.
- The three-mode UI and visual plots are controls/characteristic sketches; the Air graph approximates the filter magnitude, not a calibrated analyzer.
