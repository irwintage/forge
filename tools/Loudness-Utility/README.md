# Chrysasynth · Loudness Utility (Forge)

Open `index.html` directly in a recent desktop browser. No CDN, build tools or server required.

## Operation
Load a mono/stereo audio file (click or drag), Analyze, choose target and ceiling, Normalize, Export WAV.

## What this utility does
- Measures estimated BS.1770-style K-weighted integrated loudness with 400 ms gating blocks (100 ms hop), an absolute -70 LUFS and relative -10 LU gating threshold.
- Reports the maximum momentary (400 ms) and short-term (3 seconds) loudness, and an estimated 4x oversampled true peak using windowed-sinc interpolation.
- Applies uniform linear gain only. It never compresses or limits. If a requested LUFS target would exceed the peak ceiling, the output is quieter than target.
- Exports an interleaved mono/stereo PCM 16-bit WAV with TPDF dither.

## Limitations
This is a browser utility, not a calibrated/broadcast-certified LUFS meter. K-weighting and oversampled dBTP are estimates. Streaming target presets are editable starting points, not universal platform requirements. The true-peak ceiling is based on a finite 4x interpolation estimate and is not a mathematical guarantee after quantization or subsequent codec encoding. Use a dedicated certified meter and limiter for compliance-critical mastering. Only mono and stereo inputs; browser decoding support depends on browser. Very long files require substantial memory.

## Files
- `index.html`, `style.css`: minimal Utility interface
- `audio/analysis.js`: analysis, gain planning, WAV encoding
- `app.js`: UI, file handling, workflow
