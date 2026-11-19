# Mystic Drums · Forge V2

Design Knot-inspired: graphite, mint accent, large central 16-step sequencer, minimal cards.

## Start
Open `index.html` in a recent browser. All scripts are local, including Tone.js. No server or installation required. Audio starts on user gesture (Play).

## Files
- `index.html`: HTML and layout
- `css/main.css`: design and responsive styling
- `js/app.js`: UI, pattern banks, presets, transport, export, links
- `js/audio-engine.js`: Tone.js voices and DSP
- `vendor/tone.min.js`: vendored Tone.js 14.8.49

Preserved from original: 5 synth voices (kick, snare, closed/open hats, bell); 16 steps, A/B, locks, Moon/Ash/Silver patterns, per-voice volume/decay/tone, mute, swing, warmth, reverb, pattern sharing, recording and WAV export. No audio sample files are required because all 5 voices are synthesized.

## Browser tests
Syntax and page load verified separately. Audio playback depends on an audio-enabled browser and a user interaction. The record function captures live playback for up to 60 seconds, so keep the tab active.

## V2.2
- Nuances par piste sur le séquenceur : Kick sombre, Snare intermédiaire, Closed/Open Hat plus clairs, Ritual Bell vert d’eau.
- Les étapes inactives restent sombres ; les étapes actives utilisent leur propre dégradé.
