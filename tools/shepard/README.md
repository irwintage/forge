# Chrysasynth Forge — Shepard Ambient V1

Original source: user-provided `Chrysasynth • Shepard Ambient` single-file HTML.

## Files
- `index.html` — interface
- `style.css` — Forge visual design
- `app.js` — UI, presets, animated ribbon, transport and recording controls
- `audio/engine.js` — independent Web Audio synthesis and capture

## Features
- 10 sine oscillators implementing the original continuous Shepard-style octave glide
- Rising / falling, speed, octave depth, speed warp, filter brightness and convolution reverb
- Four new motion seeds
- Master volume and stop/pause transport
- Live MediaRecorder capture and browser decoding to stereo or mono PCM WAV 16-bit
- Responsive UI for desktop and mobile

## Notes
- Open `index.html` from an HTTP(S) web server (e.g. `python -m http.server 8000`) for best cross-browser recording support. Chrome/Edge recommended for initial testing.
- Audio must be started by clicking Play. There is no Tone.js dependency; the sound engine uses native Web Audio.
- Record captures the master audio signal while active. Export WAV needs MediaRecorder support and a browser decoder for the chosen recording codec; an unsupported browser will show an error.
- This is an audio illusion with gliding frequencies, not a true chromatic pitch-stepped sequencer.
- An export captures browser-encoded intermediate audio before conversion to PCM WAV, so it is not lossless end-to-end.
- `source-original.html` preserves the supplied original source unchanged for reference.
- Not yet connected to Forge Library / authentication / remote presets.
