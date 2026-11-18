
    // =========================
    //    STATE & VISUAL
    // =========================
    const canvas = document.getElementById('ptb-canvas');
    const ctx = canvas.getContext('2d');
    const canvasWrapper = document.getElementById('canvas-wrapper');

    const dropOverlay = document.getElementById('drop-overlay');
    const fileInput = document.getElementById('file-input');

    const exportImageBtn = document.getElementById('export-image-btn');
    const exportAudioBtn = document.getElementById('export-audio-btn');
    const randomFxBtn = document.getElementById('random-fx-btn');

    let baseImage = null;
    let exportFormat = '1:1';
    document.querySelectorAll('.format-pill').forEach(button => button.addEventListener('click', () => {
      exportFormat = button.dataset.format;
      document.querySelectorAll('.format-pill').forEach(b => {b.classList.toggle('active', b === button);b.setAttribute('aria-pressed', String(b === button));});
    }));
    let baseCanvas = null;
    let baseCtx = null;

    let noiseCanvas = null;
    let noiseCtx = null;

    const state = {
      masterIntensity: 0.7,
      effects: {
        mirrorH:    { enabled: true,  intensity: 1.0 },
        mirrorV:    { enabled: false, intensity: 0.0 },
        liquidWarp: { enabled: true,  intensity: 0.5 },
        blurBloom:  { enabled: true,  intensity: 0.4 },
        colorShift: { enabled: true,  intensity: 0.5 },
        vibration:  { enabled: true,  intensity: 0.5 }, // audio only
        noise:      { enabled: true,  intensity: 0.4 }
      }
    };

    function resizeCanvas() {
      const rect = canvasWrapper.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      if (baseImage) {
        createBaseCanvas();
        renderImage();
      }
    }

    function createBaseCanvas() {
      if (!baseImage) return;
      baseCanvas = document.createElement('canvas');
      baseCanvas.width = canvas.width;
      baseCanvas.height = canvas.height;
      baseCtx = baseCanvas.getContext('2d');

      baseCtx.fillStyle = '#020617';
      baseCtx.fillRect(0, 0, baseCanvas.width, baseCanvas.height);

      const iw = baseImage.width;
      const ih = baseImage.height;
      const cw = baseCanvas.width;
      const ch = baseCanvas.height;
      const scale = Math.min(cw / iw, ch / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;

      baseCtx.drawImage(baseImage, dx, dy, dw, dh);
    }

    function createNoiseTexture() {
      noiseCanvas = document.createElement('canvas');
      noiseCanvas.width = 256;
      noiseCanvas.height = 256;
      noiseCtx = noiseCanvas.getContext('2d');

      const imgData = noiseCtx.createImageData(256, 256);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const v = 150 + Math.random() * 80;
        data[i] = v;
        data[i+1] = v;
        data[i+2] = v;
        data[i+3] = 255;
      }
      noiseCtx.putImageData(imgData, 0, 0);
    }

    function renderImage() {
      if (!baseCanvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }

      const w = canvas.width;
      const h = canvas.height;
      ctx.setTransform(1,0,0,1,0,0);
      ctx.clearRect(0,0,w,h);

      const fx = state.effects;
      const global = state.masterIntensity;

      const workCanvas = document.createElement('canvas');
      workCanvas.width = w;
      workCanvas.height = h;
      const wctx = workCanvas.getContext('2d');

      wctx.drawImage(baseCanvas, 0, 0);

      // Horizontal mirror: overlay full flipped copy
      if (fx.mirrorH.enabled && fx.mirrorH.intensity > 0.01) {
        const amount = fx.mirrorH.intensity * global;
        wctx.save();
        wctx.globalAlpha = amount;
        wctx.translate(w, 0);
        wctx.scale(-1, 1);
        wctx.drawImage(baseCanvas, 0, 0);
        wctx.restore();
      }

      // Vertical mirror: overlay flipped vertically
      if (fx.mirrorV.enabled && fx.mirrorV.intensity > 0.01) {
        const amount = fx.mirrorV.intensity * global;
        wctx.save();
        wctx.globalAlpha = amount;
        wctx.translate(0, h);
        wctx.scale(1, -1);
        wctx.drawImage(baseCanvas, 0, 0);
        wctx.restore();
      }

      const liquidOn = fx.liquidWarp.enabled ? fx.liquidWarp.intensity * global : 0;
      const blurOn   = fx.blurBloom.enabled ? fx.blurBloom.intensity * global : 0;
      const colorOn  = fx.colorShift.enabled ? fx.colorShift.intensity * global : 0;
      const noiseOn  = fx.noise.enabled ? fx.noise.intensity * global : 0;

      const blurPx = blurOn * 10;
      const hueDeg = colorOn * 80;
      const sat    = 1 + colorOn * 0.6;
      const bright = 1 + blurOn * 0.25;

      ctx.filter =
        `blur(${blurPx.toFixed(2)}px) ` +
        `hue-rotate(${hueDeg.toFixed(1)}deg) ` +
        `saturate(${sat.toFixed(2)}) ` +
        `brightness(${bright.toFixed(2)})`;

      const freq = 0.06;
      const maxAmp = 30;
      const amp = maxAmp * liquidOn;

      for (let y = 0; y < h; y++) {
        const offsetX = Math.sin(y * freq) * amp;
        ctx.drawImage(
          workCanvas,
          0, y, w, 1,
          offsetX, y, w, 1
        );
      }

      ctx.filter = 'none';

      if (noiseOn > 0.01 && noiseCanvas) {
        ctx.save();
        ctx.globalAlpha = 0.06 + noiseOn * 0.12; // softer noise
        ctx.globalCompositeOperation = 'overlay';
        ctx.drawImage(noiseCanvas, 0, 0, w, h);
        ctx.restore();
      }
    }

    // =========================
    //    DRAG & DROP
    // =========================
    function handleFiles(files) {
      if (!files || !files.length) return;
      const file = files[0];
      if (!file.type.startsWith('image/')) return;

      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        baseImage = img;
        createBaseCanvas();
        renderImage();
        dropOverlay.style.display = 'none';
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }

    function setupDragAndDrop() {
      function prevent(e) {
        e.preventDefault();
        e.stopPropagation();
      }

      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
        dropOverlay.addEventListener(evt, prevent);
      });

      dropOverlay.addEventListener('dragenter', () => {
        dropOverlay.classList.add('dragover');
      });
      dropOverlay.addEventListener('dragleave', () => {
        dropOverlay.classList.remove('dragover');
      });
      dropOverlay.addEventListener('drop', e => {
        dropOverlay.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
      });

      dropOverlay.addEventListener('click', () => fileInput.click());
      document.getElementById('replace-image-btn').addEventListener('click', () => { fileInput.value = ''; fileInput.click(); });
      // Allow dropping a replacement image even after the initial overlay disappears.
      canvasWrapper.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
      canvasWrapper.addEventListener('drop', e => { if (e.target.closest('.drop-overlay') && dropOverlay.style.display !== 'none') return; e.preventDefault(); handleFiles(e.dataTransfer.files); });
      fileInput.addEventListener('change', () => handleFiles(fileInput.files));
    }

    // =========================
    //    AUDIO – WebAudio
    // =========================
    let audioCtx = null;
    let oscNode = null;
    let tremoloLFO = null;
    let tremoloDepth = null;
    let tremoloOffset = null;
    let tremoloGainNode = null;
    let vibratoLFO = null;
    let vibratoGain = null;
    let filterNode = null;
    let pannerNode = null;
    let reverbNode = null;
    let reverbGain = null;
    let dryGain = null;
    let noiseSource = null;
    let noiseGain = null;
    let masterGain = null;

    let mediaDest = null;
    let mediaRecorder = null;

    let audioReady = false;
    let audioEnabled = false;

    const waveformSelect = document.getElementById('waveform-select');
    const masterIntensityEl = document.getElementById('master-intensity');
    const masterIntensityLabel = document.getElementById('master-intensity-label');

    const audioToggleBtn = document.getElementById('audio-toggle');
    const audioToggleLabel = document.getElementById('audio-toggle-label');
    const audioStatusDot = document.getElementById('audio-status-dot');
    const audioStatusText = document.getElementById('audio-status-text');

    function createReverbImpulse(ctx, duration = 2.5, decay = 2.0) {
      const rate = ctx.sampleRate;
      const length = rate * duration;
      const impulse = ctx.createBuffer(2, length, rate);
      for (let c = 0; c < 2; c++) {
        const chData = impulse.getChannelData(c);
        for (let i = 0; i < length; i++) {
          chData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
        }
      }
      return impulse;
    }

    async function initAudio() {
      if (audioReady) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) {
        audioStatusText.textContent = "Web Audio is not supported in this browser.";
        return;
      }
      audioCtx = new AC();
      await audioCtx.resume();

      // Oscillator
      oscNode = audioCtx.createOscillator();
      oscNode.type = waveformSelect.value;
      oscNode.frequency.value = 220;

      // Tremolo: (LFO -> depth -> gain, plus constant offset)
      tremoloLFO = audioCtx.createOscillator();
      tremoloLFO.frequency.value = 4;

      tremoloDepth = audioCtx.createGain();
      tremoloDepth.gain.value = 0; // depth will be set from slider

      tremoloOffset = audioCtx.createConstantSource();
      tremoloOffset.offset.value = 1; // base gain

      tremoloGainNode = audioCtx.createGain();
      tremoloGainNode.gain.value = 1;

      tremoloLFO.connect(tremoloDepth);
      tremoloDepth.connect(tremoloGainNode.gain);
      tremoloOffset.connect(tremoloGainNode.gain);

      // Vibrato
      vibratoLFO = audioCtx.createOscillator();
      vibratoLFO.frequency.value = 5;
      vibratoGain = audioCtx.createGain();
      vibratoGain.gain.value = 0; // 0Hz by default (no vibrato)
      vibratoLFO.connect(vibratoGain).connect(oscNode.frequency);

      // Filter
      filterNode = audioCtx.createBiquadFilter();
      filterNode.type = 'lowpass';
      filterNode.frequency.value = 4000;
      filterNode.Q.value = 0.7;

      // Panner
      pannerNode = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : audioCtx.createPanner();
      if (pannerNode.pan) pannerNode.pan.value = 0;

      // Reverb
      reverbNode = audioCtx.createConvolver();
      reverbNode.buffer = createReverbImpulse(audioCtx, 2.5, 2.0);
      reverbGain = audioCtx.createGain();
      reverbGain.gain.value = 0.0; // 0 at base

      // Dry / noise / master
      dryGain = audioCtx.createGain();
      dryGain.gain.value = 1.0;

      noiseGain = audioCtx.createGain();
      noiseGain.gain.value = 0.0;

      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.0; // muted until enabled

      // Noise
      const bufferSize = 2 * audioCtx.sampleRate;
      const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      noiseSource = audioCtx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      // Connect graph
      oscNode.connect(tremoloGainNode);
      tremoloGainNode.connect(filterNode);
      filterNode.connect(pannerNode);

      pannerNode.connect(dryGain);
      dryGain.connect(masterGain);

      pannerNode.connect(reverbNode);
      reverbNode.connect(reverbGain);
      reverbGain.connect(masterGain);

      noiseSource.connect(noiseGain);
      noiseGain.connect(masterGain);

      // Output
      masterGain.connect(audioCtx.destination);

      // MediaRecorder
      if (audioCtx.createMediaStreamDestination) {
        mediaDest = audioCtx.createMediaStreamDestination();
        masterGain.connect(mediaDest);
        mediaRecorder = new MediaRecorder(mediaDest.stream);
      }

      oscNode.start();
      tremoloLFO.start();
      tremoloOffset.start();
      vibratoLFO.start();
      noiseSource.start();

      audioReady = true;
      audioStatusText.textContent = 'Audio ready · click to enable / mute.';
    }

    function setAudioEnabled(enabled) {
      audioEnabled = enabled;
      if (masterGain) {
        masterGain.gain.value = enabled ? (0.2 + state.masterIntensity * 0.8) : 0.0;
      }
      if (enabled) {
        audioStatusDot.classList.add('on');
        audioStatusText.textContent = 'Audio on';
        audioToggleLabel.textContent = 'Disable audio';
      } else {
        audioStatusDot.classList.remove('on');
        audioStatusText.textContent = 'Audio off';
        audioToggleLabel.textContent = 'Enable audio';
      }
    }

    function updateAudioFromState() {
      if (!audioReady) return;

      const global = state.masterIntensity;
      const fx = state.effects;

      if (oscNode) {
        oscNode.type = waveformSelect.value;
      }

      // Mirror → pan
      const mirrorLR = fx.mirrorH.enabled ? fx.mirrorH.intensity : 0;
      const mirrorTB = fx.mirrorV.enabled ? fx.mirrorV.intensity : 0;
      const panAmount = (mirrorLR - mirrorTB) * global;
      if (pannerNode && pannerNode.pan) {
        pannerNode.pan.value = Math.max(-1, Math.min(1, panAmount * 0.8));
      }

      // Liquid warp → vibrato
      if (vibratoGain && vibratoLFO) {
        const depth = (fx.liquidWarp.enabled ? fx.liquidWarp.intensity : 0) * global;
        vibratoGain.gain.value = depth * 10; // Hz
        vibratoLFO.frequency.value = 4 + depth * 4;
      }

      // Blur → reverb
      if (reverbGain) {
        const blurAmount = (fx.blurBloom.enabled ? fx.blurBloom.intensity : 0) * global;
        reverbGain.gain.value = blurAmount * 0.7; // 0..0.7
      }

      // Color shift → filter
      if (filterNode) {
        const colAmount = (fx.colorShift.enabled ? fx.colorShift.intensity : 0) * global;
        const baseFreq = 400;
        const range = 4200 * colAmount;
        filterNode.frequency.value = baseFreq + range;
        filterNode.Q.value = 0.5 + colAmount * 0.8;
      }

      // Vibration → tremolo depth
      if (tremoloDepth && tremoloLFO) {
        const vibAmount = (fx.vibration.enabled ? fx.vibration.intensity : 0) * global;
        tremoloDepth.gain.value = vibAmount * 0.7; // 0..0.7
        tremoloLFO.frequency.value = 3 + vibAmount * 5;
      }

      // Noise → audio noise level (softer than before)
      if (noiseGain) {
        const nAmount = (fx.noise.enabled ? fx.noise.intensity : 0) * global;
        noiseGain.gain.value = nAmount * 0.18;
      }

      if (masterGain) {
        masterGain.gain.value = audioEnabled ? (0.2 + global * 0.8) : 0.0;
      }
    }

    async function exportAudio() {
      const button = document.getElementById('export-audio-btn');
      const previous = audioEnabled;
      if(button.disabled)return;
      button.disabled = true;
      const seconds = Math.max(10, Math.min(30, Number(document.getElementById('duration-select')?.value || 10)));
      button.textContent = `Recording ${seconds}s…`;
      try {
        if(!audioReady) await initAudio();
        if(!mediaRecorder) throw new Error('MediaRecorder unsupported in this browser.');
        setAudioEnabled(true);
        await window.pixelToneRecordWav(mediaRecorder, audioCtx, `pixelTone-bloom-${seconds}s.wav`, seconds);
      } catch (error) {
        console.error(error);
        alert('Unable to export WAV: ' + error.message);
      } finally {
        setAudioEnabled(previous);
        button.disabled = false;
        button.textContent = 'Export Sound';
      }
    }

    function setupUI() {
      const updateMaster = () => {
        const v = parseFloat(masterIntensityEl.value);
        state.masterIntensity = v;
        masterIntensityLabel.textContent = `${Math.round(v * 100)}%`;
        updateAudioFromState();
        renderImage();
      };
      masterIntensityEl.addEventListener('input', updateMaster);
      updateMaster();

      waveformSelect.addEventListener('change', () => {
        updateAudioFromState();
      });

      document.querySelectorAll('.toggle').forEach(toggle => {
        const key = toggle.dataset.toggle;
        toggle.addEventListener('click', () => {
          const current = toggle.getAttribute('data-checked') === 'true';
          const next = !current;
          toggle.setAttribute('data-checked', String(next));
          if (state.effects[key]) state.effects[key].enabled = next;
          renderImage();
          updateAudioFromState();
        });
      });

      document.querySelectorAll('input[type="range"][data-slider]').forEach(sl => {
        const key = sl.dataset.slider;
        const label = document.querySelector(`[data-slider-label="${key}"]`);
        const update = () => {
          const v = parseFloat(sl.value);
          if (state.effects[key]) state.effects[key].intensity = v;
          if (label) label.textContent = `${Math.round(v * 100)}%`;
          renderImage();
          updateAudioFromState();
        };
        sl.addEventListener('input', update);
        update();
      });

      audioToggleBtn.addEventListener('click', async () => {
        await initAudio();
        if (!audioReady) {
          audioStatusText.textContent = "Audio error · check Web Audio support.";
          return;
        }
        setAudioEnabled(!audioEnabled);
        updateAudioFromState();
      });

      exportImageBtn.addEventListener('click', () => {
        if (!baseImage) return;
        const sizes = {'1:1':[1200,1200], '4:5':[1080,1350], '16:9':[1920,1080]};
        const [w,h] = sizes[exportFormat];
        const oldW = canvas.width, oldH = canvas.height;
        try {
          canvas.width = w; canvas.height = h; createBaseCanvas(); renderImage();
          const a = document.createElement('a');
          a.href = canvas.toDataURL('image/png');
          a.download = `pixelToneBloom-${exportFormat.replace(':','x')}.png`;
          document.body.appendChild(a); a.click(); a.remove();
        } finally {
          canvas.width = oldW; canvas.height = oldH; createBaseCanvas(); renderImage();
        }
      });

      exportAudioBtn.addEventListener('click', exportAudio);

      randomFxBtn.addEventListener('click', () => {
        document.querySelectorAll('input[type="range"][data-slider]').forEach(sl => {
          const key = sl.dataset.slider;
          const v = Math.random();
          sl.value = v.toFixed(2);
          const label = document.querySelector(`[data-slider-label="${key}"]`);
          if (state.effects[key]) state.effects[key].intensity = v;
          if (label) label.textContent = `${Math.round(v * 100)}%`;
        });

        document.querySelectorAll('.toggle').forEach(toggle => {
          const key = toggle.dataset.toggle;
          const on = Math.random() > 0.25;
          toggle.setAttribute('data-checked', String(on));
          if (state.effects[key]) state.effects[key].enabled = on;
        });

        renderImage();
        updateAudioFromState();
      });
    }

    // =========================
    //    INIT
    // =========================
    window.addEventListener('load', () => {
      createNoiseTexture();
      resizeCanvas();
      setupDragAndDrop();
      setupUI();
    });

    window.addEventListener('resize', () => {
      resizeCanvas();
    });
  
// Forge V1.1: reliable mute from parent tab selection.
window.addEventListener("message", (event) => {
  if(event.source !== window.parent || event.data?.type !== "pixeltone-activate") return;
  if(event.data.mode !== "bloom" && typeof audioReady !== "undefined" && audioReady) setAudioEnabled(false);
});
