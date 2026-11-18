# Etheremin · Forge V1.3

Gesture-based theremin, optimized for playing in seconds. The interface is in English.

## Launch

Run on **HTTPS or localhost** (webcam permission and MediaPipe). Example: `python -m http.server 8000` from this project folder, then open http://localhost:8000 in Chrome / Edge with an internet connection.

Click **Start Playing** once; this initializes sound, requests webcam access and loads hand tracking automatically. Choose **Allow** when the browser asks. MediaPipe requires CDN access. The first load may be slower. If camera permission is blocked, use browser site settings.

## Playing

- Default: one hand, pentatonic scale, mid C3-C5 range, vocal theremin voice, 40-cent vibrato, 120 ms glide.
- One hand: X = pitch, Y = expression (level + brightness).
- Two hands: **right hand** = pitch on X; **left hand** = volume/brightness on Y. Hand roles are shown by labels on the video. Both hands must be visible for sound.
- Chromatic and free/continuous tuning live under Advanced options. Minor and low/high ranges are available in the main controls. Mirror camera lives under Advanced options.
- Silence immediately mutes the synth, Resume Playing restores it; Esc also mutes.
- Record audio as WAV or video+audio as WebM (browser support required).

## Project files

- `index.html`: UI
- `style.css`: appearance
- `app.js`: startup, hand-to-sound mapping and recording
- `audio/engine.js`: WebAudio synth, vibrato, filter, reverb, limiter
- `tracking/hands.js`: camera and MediaPipe Hands
- `visual/display.js`: tracking overlay

## Notes

Requires MediaPipe from jsDelivr and webcam browser permission. Audio performance, camera permissions and recordings need testing on target devices. WAV capture uses ScriptProcessor for PCM recording (not synth DSP), and should be migrated to AudioWorklet for production.

## Audio refinements in V1.3

- Fundamental oscillator uses a low-order harmonic periodic wave for a warmer, singing quality; quiet sub-octave adds body without detuned beating.
- Adjustable vibrato blooms smoothly at note onset; the UI keeps its familiar 0–40 cent control.
- Frequency-following lowpass and mild midrange resonance soften high notes.
- Amplitude smoothing, quieter gain staging and downstream compressor reduce harsh edges.
- Same post-limiter audio bus powers live listening and recording.

Real-world listening and webcam tracking are not validated by automated syntax checks.
