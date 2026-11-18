# BRTH4 | Chrysasynth Forge V1

Standalone breathing guide with optional procedural audio. Open `index.html` directly in a modern browser; no server, external scripts or installation needed.

## Features
- Breathing patterns: Box 4-4-4-4, Relax 4-7-8 (no extra hold after exhale), Focus 5-5-5-5, and editable Custom.
- Visual marker follows the four sides of the square. Countdown and guide remain synced with a monotonic clock (performance.now).
- Session durations: 1, 3, 5, 10 minutes or unlimited; stops automatically at the requested time.
- Optional brown noise or stereo 8 Hz binaural tone. Headphones are needed to perceive separate left/right binaural signals. This is a sound texture, not a medical treatment or proven brainwave effect.
- Volume control, fades on sound toggle, responsive layout, no network dependencies.

## Implementation
- `index.html`: markup
- `style.css`: theme
- `app.js`: UI and phase scheduler
- `visual/display.js`: square-path positioning
- `audio/engine.js`: Web Audio signal routing

Audio starts only after the user enables Sound. It does not depend on the breathing session being active. The guide runs silently by default.

## Notes
Browsers may suspend audio until a user gesture. Try latest Chromium/Firefox for best support. The engine has been statically validated but audio playback must be listened to on a real browser and speaker/headphone setup.
