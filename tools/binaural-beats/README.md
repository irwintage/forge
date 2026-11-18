# Binaural Beats • Forge Edition

Static module, ready to open locally by double-clicking `index.html` (no build or CDN needed).

## Files
- `index.html`: accessible, compact UI
- `style.css`: namespaced `#bb-app` styling, Forge-compatible
- `app.js`: controls, timer, visuals, module lifecycle
- `audio/engine.js`: native Web Audio engine, isolated left and right sine/other oscillators, pink-noise generator, graceful fade

## Audio
The left channel uses `carrier − beat/2` and the right uses `carrier + beat/2`. **Headphones are required** for binaural separation. Volume starts at a cautious 22%. Pink noise is off by default and mixed quietly into both channels. No external dependencies.

## Integration
Mount the module into Forge's page or isolated module container. Ensure scripts load in order (`audio/engine.js` before `app.js`); when switching tools call `await window.ForgeBinaural.destroy()`. The implementation is standalone but does not include a Forge dashboard router registration yet.

## Notes
The two wave traces are a slowed, illustrative stereo animation, **not** literal high-frequency oscilloscope output. Frequency presets are numerical examples and do not establish health or brainwave effects. Keep listening levels comfortable.

## Visual fix v1.1
Removed decorative header dot, improved title gradient clipping and line-height. Audio engine unchanged.
