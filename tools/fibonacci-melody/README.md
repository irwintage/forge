# Fibonacci Melody v2.2 · Chrysasynth Forge

## Launch
Extract the ZIP, leave all three application files in the same directory, and open `index.html` with a modern browser. No local server required. Web Audio starts when you press Play.

## Changes in v2.2
- Fibonacci geometry is no longer limited to nine terms. Squares F(1) through the current term are generated in exact sizes and placed contiguously in a classic growing Fibonacci tiling.
- The camera automatically follows the 10 newest squares to keep the growing construction legible even at F(40) and beyond. Earlier terms are retained mathematically, but may leave the view as the camera zooms.
- The spiral consists of connected quarter-circle arcs inscribed in the squares, no detached overlay.
- The Geometry canvas sits directly on the Forge panel without another card border.
- Clicking a Fibonacci term at the bottom jumps the geometry and musical mapping to that step.
- The unrelated metronome toggle was removed. **Rhythm Model** is unchanged.
- Piano Roll, key, scale, steps, starting index, audio engine and MIDI export are retained.

## Important mathematical note
F(0)=0 has no square with positive area. The first two 1×1 squares represent F(1)=1 and F(2)=1, followed by F(3)=2, F(4)=3, etc. Growth is exponential: the camera focuses on a recent window rather than trying to show every square at equal apparent size.

## Files
`index.html`: structure. `style.css`: styles. `app.js`: audio / MIDI / visualizations. No external JS libraries required; web fonts require network.

## Integration
As in v2.1, `window.ForgeFibonacci.destroy()` shuts down audio on module change. Do not directly inject the entire standalone document into Forge; use the Forge module loader and CSS isolation when integrating later.


### 2.2.1 — Sequence strip
- Fibonacci chips now grow with the length of their numeric values.
- Horizontal scrolling remains available for long sequences; values no longer escape their buttons.
- No changes to geometry, rhythm model, audio, or MIDI generation.
