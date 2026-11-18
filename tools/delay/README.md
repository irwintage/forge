# Chrysasynth Delay · Forge FX V1

Open `index.html` directly in Chrome/Edge/Firefox, or serve the directory. No external dependencies or ES module loading required.

Audio engine is in `audio/engine.js`; presets are in `audio/presets.js`; visualization is in `visual/display.js`; interface logic is `app.js`.

## Features

Stereo and ping-pong delay modes, tempo sync, note division, five presets, live controls, bypass, audio drop/import, built-in demo and stereo 16-bit PCM WAV export with a calculated echo tail. The same DSP builder drives live processing and offline rendering. The display is a timing prediction, not an analyzer.

## Notes

WebM is an audio container format; WebP is an image format. Actual decoding depends on the browser's supported codecs. The signal is processed entirely on your computer. Tempo changes alter delay time and may produce pitch movement characteristic of live delay-time changes. The file is not intended as a VST/AU plugin.

## V1.1 playback corrections
- A new Web Audio delay graph is created for every playback. The old graph, including both feedback loops, is fully disconnected on stop, pause and natural completion. This prevents stale echo tails layering when pressing Play again.
- TIME stays interactive when Tempo Sync is enabled. Its thumb reflects the selected note length; dragging TIME switches automatically to free milliseconds.
- Demo Guitar Phrase uses click-free note envelopes (6 ms attack, 100 ms release) and a musical sequence with silence at the boundaries. It is an audition source, not a sound effect triggered by UI actions.
