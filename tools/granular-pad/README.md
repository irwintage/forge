# Chrysasynth Granular Pad · Forge Edition

Open `index.html` directly in a browser. All JavaScript uses classic scripts so `file://` works. External services are not required.

## Structure
- `audio/engine.js` — grain scheduling, DSP, offline renderer, WAV export, demo generator
- `audio/presets.js` — five sound presets
- `ui/app.js` — audio player, presets, waveform and file input
- `ui/style.css` — compact Forge interface

## Notes
- The grain engine has a real stereo signal path with a single envelope per grain and a separate dry source.
- Offline render uses the same grain-scheduling function as realtime.
- Click the waveform to change grain scan position. Slow Scan Speed down to zero to freeze the region.
- Browser-decoded formats depend on codecs supported by your browser, not solely on filename extension.
- Audio output is generated locally. Export is PCM 16-bit stereo WAV.
- Large files can take memory and time for offline rendering; offline rendering is limited to ten minutes of input.
