# pixelTone Bloom / Warp · Forge V1.3

Two distinct image-to-sound instruments inside one compact Forge interface.

## V1.3 changes
- User-selected **Bloom** pink/lilac and **Warp** neon-green glitch artwork behind the *Import Image* control, only until an image is imported. These background assets do not affect image exports.
- Separate artwork files in `assets/`, bundled locally (WebP, no third-party dependencies).
- `Export Sound` wording on both instruments; exported file remains a genuine 16-bit PCM WAV.
- Working `Duration` selector: 10, 20, or 30 seconds for WAV recording.
- Preserves separate Bloom and Warp effect engines, UI settings, Replace Image, image format buttons, and the compact layout from V1.2.

## Use
Open `index.html` in a modern browser, select Bloom or Warp, import a JPG/PNG/WebP, adjust linked effects, press Play or Export Sound. Audio output requires browser audio permissions / user interaction.

## Testing
JavaScript syntax and ZIP integrity checked. Browser rendering and audio playback require a real browser test.

# pixelTone · Forge V1.1 (Bloom / Warp)

Two independent original sound/visual engines in a single two-page interface.

## Changes
- Bloom: pastel pink/lilac light interface with dark plum text and visible dark-filled range tracks.
- Warp: black/forest-green dark interface with bright acid-green accents.
- Play/Pause + Stop, image and WAV export grouped under image as in CLIMAX.
- Removed large bright white inner panels and dynamic iframe height feedback loop on desktop.
- Compact desktop 2-column layout; mobile stacks layout and adjusts iframe height.
- All range inputs use a single thick battery-style filled track with integrated rounded thumb.
- Each instrument preserves its existing source-specific Web Audio and image FX processing.
- Independent engine state and images when switching pages.

Run `python -m http.server 8000` in this directory and open http://localhost:8000. Opening index.html directly should also work in compatible browsers.

Recording uses MediaRecorder -> decoded PCM -> WAV16; browser must support MediaRecorder and decode its own recording format. Exports 10 seconds, in real time.

Files in `originals/` are the supplied original source versions.


## V1.2 updates
- More breathing room above the plugin on desktop.
- Higher contrast for Bloom: stronger plum text, borders and filled range tracks.
- Identical 1:1, 4:5, 16:9 PNG export options in both instruments.
- Always-visible Replace image button, plus drag/drop replacement on the preview after first load.
- Bloom PNG export now renders at the selected output dimensions.
- Both audio engines preserved from V1.1.
