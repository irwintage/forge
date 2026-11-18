# CLIMAX · Chrysasynth Forge V1

An offline WAV riser designer. Standalone HTML/CSS/JS with the Forge/Knot graphite/mint visual direction.

## Run

Open `index.html` in a modern browser. No third-party libraries, CDN, or server are required. Drag or browse for a WAV clip, choose an effect and envelope, then Play or Export WAV.

## Features

- Volume, filter, pitch, reverb, and speed automation.
- Start position, intensity, linear or eased-exponential envelope.
- Waveform view and overlay of the automation shape.
- OfflineAudioContext rendering and downloadable stereo 16-bit WAV.
- Processing stays local to the browser.

## Design/technical notes

Pitch and speed are intentionally tape-style: changing playback rate also changes pitch. The input loops for those two effects when necessary to sustain the original output duration; these loops may be audible on non-loopable material. Reverb is rendered within the source duration, so the tail is truncated at the end of the WAV. Automation is previewed after offline rendering, not live while playing.

`source-original.html` contains the user's original prototype.

No authentication or cloud save is integrated yet. Browser audio playback not verified in a real browser; static JS syntax and ZIP integrity have been checked.
