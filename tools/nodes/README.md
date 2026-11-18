# Nodes · Forge Edition

Two-page (A/B) 16-step arpeggiator.

## Run
Open `index.html` in a browser with internet access. Tone.js and LZ-String are loaded from CDN.

## Layout
- `index.html`: markup and tool controls
- `style.css`: locally scoped UI styles (under #nodes-app)
- `app.js`: sequencer, synthesis, share state, recording

## Integration
The tool is standalone. Forge can mount it in a page/iframe and call `window.ForgeNodes.stop()` or `await window.ForgeNodes.destroy()` on navigation. It is not yet wired into the Forge dashboard loader.

## Audio export
Tone.Recorder records the browser's supported format (typically WebM/Opus). The file extension follows the Blob MIME type, rather than claiming a WAV file.

## Notes
Changes include a clearer layout with centered sequencer, header transport and master output, less ornamentation, browser-aware recording filename and safer cleanup. Listen/test on your local audio device before distribution.
