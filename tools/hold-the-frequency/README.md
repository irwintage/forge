# Hold the Frequency · Chrysasynth Forge Edition V1

## Two independent editions
- `/forge/index.html`: Forge-ready responsive edition with unchanged 7-stage hold instrument, binaural engine, and local-only Save / Restore / Reset.
- `/pwa/index.html`: Original standalone PWA (provided by author), with corrected icon paths and offline icon caching.

## Deployment
Serve these files via localhost or HTTPS (rather than double-clicking index files), e.g. from this directory `python -m http.server 8000`. Browse `/forge/` or `/pwa/`. For PWA installation, HTTPS (or localhost) is required. The standalone service worker is registered only within `/pwa/`, and does not control Forge.

## Integration notes
- Original Tone.js 14.8.49 included locally, no external audio library CDN required. The Google Fonts import needs network; local fallback works offline.
- Forge session data is stored in browser localStorage only, when user clicks Save. There is no user account, cloud sync, or backend yet.
- Base DSP and stage logic remain from supplied source. The main Forge look differs in its outer shell; the sonic interaction and the Chakra-specific colors are intentionally preserved.
- The proposed Cloudflare Library API is not implemented; wire the local save to an authenticated Worker endpoint later.
- No audio playback test has been completed across browsers.
