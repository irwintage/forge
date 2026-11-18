# Chrysasynth AXIS · Forge V2.2

Refines the approved V2.1 desktop design.

- **AXIS VOICE** appears above **MELODIC SEQUENCER**; the large 16-step grid still fills the remaining available vertical space at desktop sizes.
- **Seeds** dropdown uses a dark background, light text, and a green focus border, including native dropdown options.
- Share button and share popup are hidden until Axis is deployed on a hosted website. Sharing functionality remains in `app.js` for later reactivation.
- Transport, scales, presets, accent/slide flags, A/B chaining, drums, effects, recording and musical engine retained.
- Desktop viewports ≥981px wide and ≥650px tall aim to fit the entire interface without scrolling; narrower devices retain natural responsive scrolling.

Open `index.html` in a modern browser with an internet connection. Tone.js and LZ-String currently load from CDNs. Browser audio requires a user interaction.

Tests: syntax and DOM identifier consistency only; listening and cross-browser visual checks have not been performed.
