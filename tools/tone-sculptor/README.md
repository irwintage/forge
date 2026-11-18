# Chrysasynth Tone Sculptor · Forge V1

Open `index.html` in a modern desktop browser. No dependencies or server are needed.

## Files
- `index.html`: semantic plugin interface
- `style.css`: dark Forge / Knot-inspired styling
- `app.js`: UI, interactive EQ graph, waveform, transport and file handling
- `audio/engine.js`: Web Audio filter chain, exact Biquad frequency response, offline render and 16-bit PCM WAV export
- `source-original.html`: untouched original supplied source

## Features
Three filter bands: lowshelf 120 Hz, peaking 1000 Hz (Q=1), highshelf 8000 Hz. Changes update the live preview in real time. Graph displays the actual composite Web Audio Biquad response (via getFrequencyResponse), not an illustrative piecewise line. Grab the three points to adjust gains. Double-click a slider to zero that band.

Seven presets: Flat, Warmth, Clarity, Soft Focus, Vocal Presence, Bass Lift, Air. Presets are starting points; customize them freely. Audio stays in the browser. WAV export uses OfflineAudioContext and is 16-bit PCM, preserving mono or stereo input (maximum two output channels).

AudioContext creation can start suspended; playing resumes it after user interaction. Browser decoder support varies by file codec. Up to 10 minutes is supported subject to available memory.

## Validation
JavaScript syntax and archive structure checked. Audio, drag-and-drop and visuals still require browser testing.


## V1.1 · Response and preset fixes
- EQ handles now sit on the true combined response curve at their fixed filter center/shelf frequencies. Their positions are not the individual band gains, which could diverge when filters overlap.
- Dragging computes the matching gain by inverting the actual Web Audio frequency response, bounded by ±12 dB. At extremes, the handle may not reach the pointer because gain is limited.
- Presets use wider, more audible contrasts; the audible result remains dependent on source material.
- A/B Bypass allows direct comparison with the original file, including bypass when rendering a WAV.
- Response display range widened to ±18 dB to accommodate interacting bands; sliders remain ±12 dB.
- Mid filter is now 1.4 kHz, Q 0.78; high shelf is 6.5 kHz.
