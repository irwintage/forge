# Chrysasynth Reverb · Forge Edition

Minimal stereo reverb processor, designed alongside Chorus / Flanger V1.2.

## Open

Open `index.html` directly in Chrome, Edge or Firefox, or host the folder on a static server. All scripts are classic scripts so `file://` opening works without ES module/CORS restrictions. No external dependencies.

## Use

Load or drag in an audio file, or click **Try demo**. Press Play. Choose Room, Chamber, Plate, Hall or Cathedral. Adjust Mix, Decay, Pre-delay, Damping, Width and Diffusion. Bypass switches to dry without restarting. Click **↓ WAV** to render a stereo 16-bit PCM file with the full reverb tail.

## DSP architecture

- `audio/presets.js`: editable sonic presets.
- `audio/engine.js`: stereo convolution engine, deterministically generated impulse responses, safe wet/dry gain, working stereo mid/side width matrix, parameter smoothing, WAV export, demo audio.
- `visual/display.js`: compact decay response display and energy meter; visualization has no effect on audio.
- `app.js`: controls, audio import, playback, pause, bypass, drag/drop, export.
- `style.css`: Forge FX minimal instrument layout.

To preserve tail continuity, impulse updates use a crossfade. The decay/damping/diffusion impulse updates are debounced during slider drag. Very long uploads may consume considerable RAM during offline WAV export.
