# Vocalis · Chrysasynth Forge V2

A voice texture instrument with four algorithms: Doubler, Pitch, Robot, and Space. UI is separated from the engine and uses no emoji. Includes file preview, dry/wet, output gain, A/B monitoring and processed 16-bit WAV offline export.

Open `index.html` in a browser with internet access: Tone.js 14.8.49 is loaded via its CDN. Modern Chrome/Edge recommended. Audio stays in the browser.

## Forge integration

The tool sends a `chrysasynth-tool-size` message (`tool: vocalis`, `height`) to the parent. The parent can send `{type:'forge-tool-activate',tool:'vocalis',active:false}` or `{type:'forge-tool-stop'}` to stop playback. Final Forge integration will need alignment on one canonical message protocol.

## Important

Tone.Offline processes the uploaded audio using the currently selected effect chain. Pitch mode uses Tone.PitchShift to avoid varying playback speed. Because effects like chorus, modulation and reverb can have tails, export includes an extra 1.5 seconds after the source. The A/B selector affects monitoring only: export always renders the processed signal using the current mode and Dry/Wet settings. Dynamic rebuilds after moving Character recreate the processing chain, but the audio player remains attached; audible transitions on rapid adjustments still require listening tests. Offline output was not browser-auditioned in this environment.

V2.1 UX: Transport Play/Stop on the left; A/B comparison on the right. Audio behavior unchanged.

## V2.2 layout fix
Transport buttons Play and Stop are on the left and A/B comparison on the right. The instrument panel is vertically centered when there is spare viewport height, while retaining natural scrolling on short screens. DSP and exports unchanged.
