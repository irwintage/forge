
    const canvas = document.getElementById('ptw-canvas');
    const ctx = canvas.getContext('2d');
    const canvasWrapper = document.getElementById('canvas-wrapper');
    const dropOverlay = document.getElementById('drop-overlay');
    const fileInput = document.getElementById('file-input');
    const exportImageBtn = document.getElementById('export-image-btn');
    const exportAudioBtn = document.getElementById('export-audio-btn');
    const randomFxBtn = document.getElementById('random-fx-btn');

    let baseImage = null, baseCanvas = null, baseCtx = null, noiseCanvas = null;
    let exportFormat = '1:1';

    const state = {
      masterIntensity: 0.7,
      effects: {
        pixelate:     { enabled: true,  intensity: 0.5 },
        rgbShift:     { enabled: true,  intensity: 0.4 },
        scanline:     { enabled: true,  intensity: 0.3 },
        warpSlice:    { enabled: true,  intensity: 0.4 },
        noiseSpray:   { enabled: true,  intensity: 0.5 },
        warpFlow:     { enabled: true,  intensity: 0.5 },
        dataMelt:     { enabled: true,  intensity: 0.4 },
        pixelCorrupt: { enabled: false, intensity: 0.3 }
      }
    };

    document.querySelectorAll('.format-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.format-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        exportFormat = pill.dataset.format;
      });
    });

    function resizeCanvas() {
      const rect = canvasWrapper.getBoundingClientRect();
      canvas.width = Math.round(rect.width);
      canvas.height = Math.round(rect.height);
      if (baseImage) { createBaseCanvas(); renderImage(); }
    }

    function createBaseCanvas() {
      if (!baseImage) return;
      baseCanvas = document.createElement('canvas');
      baseCanvas.width = canvas.width; baseCanvas.height = canvas.height;
      baseCtx = baseCanvas.getContext('2d');
      baseCtx.fillStyle = '#020617';
      baseCtx.fillRect(0, 0, baseCanvas.width, baseCanvas.height);
      const iw = baseImage.width, ih = baseImage.height;
      const cw = baseCanvas.width, ch = baseCanvas.height;
      const scale = Math.min(cw / iw, ch / ih);
      const dw = iw * scale, dh = ih * scale;
      baseCtx.drawImage(baseImage, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    }

    function createNoiseTexture() {
      noiseCanvas = document.createElement('canvas');
      noiseCanvas.width = 256; noiseCanvas.height = 256;
      const nctx = noiseCanvas.getContext('2d');
      const imgData = nctx.createImageData(256, 256);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = 120 + Math.random() * 100;
        d[i] = v; d[i+1] = v; d[i+2] = v; d[i+3] = 255;
      }
      nctx.putImageData(imgData, 0, 0);
    }

    function applyPixelCorrupt(src, amount) {
      const w = src.width, h = src.height;
      const out = document.createElement('canvas'); out.width = w; out.height = h;
      const octx = out.getContext('2d'); octx.drawImage(src, 0, 0);
      const imgData = octx.getImageData(0, 0, w, h); const data = imgData.data;
      const blockCount = Math.floor(amount * 40);
      for (let b = 0; b < blockCount; b++) {
        const bx = Math.floor(Math.random() * w), by = Math.floor(Math.random() * h);
        const bw = Math.floor(10 + Math.random() * 60 * amount), bh2 = Math.floor(2 + Math.random() * 20 * amount);
        const mode = Math.floor(Math.random() * 3);
        for (let y = by; y < Math.min(by + bh2, h); y++) {
          for (let x = bx; x < Math.min(bx + bw, w); x++) {
            const i = (y * w + x) * 4;
            if (mode === 0) { const t = data[i]; data[i] = data[i+1]; data[i+1] = t; }
            else if (mode === 1) { const t = data[i+1]; data[i+1] = data[i+2]; data[i+2] = t; }
            else { const t = data[i]; data[i] = data[i+2]; data[i+2] = t; }
          }
        }
      }
      const rowCount = Math.floor(amount * 15);
      for (let r = 0; r < rowCount; r++) {
        const sr = Math.floor(Math.random() * h), dr = Math.floor(Math.random() * h);
        const shift = Math.floor((Math.random() - 0.5) * w * 0.3);
        for (let x = 0; x < w; x++) {
          const sx = ((x - shift) + w) % w;
          const si = (sr * w + sx) * 4, di = (dr * w + x) * 4;
          data[di] = data[si]; data[di+1] = data[si+1]; data[di+2] = data[si+2];
        }
      }
      octx.putImageData(imgData, 0, 0);
      return out;
    }

    function renderImage() {
      if (!baseCanvas) { ctx.clearRect(0, 0, canvas.width, canvas.height); return; }
      const w = canvas.width, h = canvas.height;
      ctx.setTransform(1,0,0,1,0,0); ctx.clearRect(0,0,w,h);
      const fx = state.effects, global = state.masterIntensity;

      let src = baseCanvas;
      if (fx.pixelate.enabled && fx.pixelate.intensity > 0.01) {
        const amt = fx.pixelate.intensity * global, bs = 2 + Math.floor(amt * 30);
        const sw = Math.max(1, Math.floor(w / bs)), sh = Math.max(1, Math.floor(h / bs));
        const pix = document.createElement('canvas'); pix.width = sw; pix.height = sh;
        const pctx = pix.getContext('2d'); pctx.imageSmoothingEnabled = false;
        pctx.drawImage(baseCanvas, 0, 0, sw, sh);
        const up = document.createElement('canvas'); up.width = w; up.height = h;
        const upctx = up.getContext('2d'); upctx.imageSmoothingEnabled = false;
        upctx.drawImage(pix, 0, 0, sw, sh, 0, 0, w, h); src = up;
      }

      if (fx.pixelCorrupt.enabled && fx.pixelCorrupt.intensity > 0.01)
        src = applyPixelCorrupt(src, fx.pixelCorrupt.intensity * global);

      const wc = document.createElement('canvas'); wc.width = w; wc.height = h;
      const wctx = wc.getContext('2d');
      const warpAmt = fx.warpFlow.enabled ? fx.warpFlow.intensity * global : 0;
      const sliceAmt = fx.warpSlice.enabled ? fx.warpSlice.intensity * global : 0;
      const stripeH = 8 + Math.floor(sliceAmt * 24);
      for (let y = 0; y < h; y += stripeH) {
        const sh = Math.min(stripeH, h - y);
        const ox = Math.sin(y * 0.05) * 35 * warpAmt + (Math.floor(y / stripeH) % 2 === 0 ? 1 : -1) * 25 * sliceAmt;
        wctx.drawImage(src, 0, y, w, sh, ox, y, w, sh);
      }

      let melt = wc;
      if (fx.dataMelt.enabled && fx.dataMelt.intensity > 0.01) {
        const amt = fx.dataMelt.intensity * global;
        const m = document.createElement('canvas'); m.width = w; m.height = h;
        const mctx = m.getContext('2d'); mctx.drawImage(wc, 0, 0);
        const mh = h * (0.2 + amt * 0.6), sy = h - mh;
        mctx.save(); mctx.globalAlpha = 0.8;
        mctx.drawImage(wc, 0, sy, w, mh, 0, sy, w, mh * (1 + amt * 0.7));
        mctx.restore(); melt = m;
      }

      ctx.save();
      const sat = 1 + 0.4 * global, bright = 1 + 0.1 * global;
      ctx.filter = `saturate(${sat.toFixed(2)}) brightness(${bright.toFixed(2)})`;
      ctx.drawImage(melt, 0, 0, w, h);
      const rgbAmt = fx.rgbShift.enabled ? fx.rgbShift.intensity * global : 0;
      if (rgbAmt > 0.01) {
        const shift = 6 + rgbAmt * 18;
        ctx.globalAlpha = 0.65 * rgbAmt;
        ctx.filter = `hue-rotate(20deg)`; ctx.drawImage(melt, shift, 0, w, h);
        ctx.filter = `hue-rotate(-25deg)`; ctx.drawImage(melt, -shift, 0, w, h);
        ctx.filter = `saturate(${sat.toFixed(2)}) brightness(${bright.toFixed(2)})`; ctx.globalAlpha = 1;
      }
      ctx.restore();

      const scanAmt = fx.scanline.enabled ? fx.scanline.intensity * global : 0;
      if (scanAmt > 0.01) {
        const gap = 2 + Math.floor(8 - scanAmt * 6);
        ctx.save(); ctx.globalAlpha = 0.25 + scanAmt * 0.35; ctx.fillStyle = 'rgba(0,0,0,0.9)';
        for (let y = 0; y < h; y += gap * 2) ctx.fillRect(0, y, w, gap);
        ctx.restore();
      }

      const noiseAmt = fx.noiseSpray.enabled ? fx.noiseSpray.intensity * global : 0;
      if (noiseAmt > 0.01 && noiseCanvas) {
        ctx.save(); ctx.globalAlpha = 0.12 + noiseAmt * 0.18;
        ctx.globalCompositeOperation = 'overlay'; ctx.drawImage(noiseCanvas, 0, 0, w, h); ctx.restore();
      }
    }

    function exportImage() {
      if (!baseImage) return;
      const sizes = { '1:1': [1200,1200], '4:5': [1080,1350], '16:9': [1920,1080] };
      const [ew, eh] = sizes[exportFormat] || [1200,1200];
      const ec = document.createElement('canvas'); ec.width = ew; ec.height = eh;
      const ectx = ec.getContext('2d');
      const sw = canvas.width, sh = canvas.height;
      canvas.width = ew; canvas.height = eh; createBaseCanvas(); renderImage();
      ectx.drawImage(canvas, 0, 0);
      canvas.width = sw; canvas.height = sh; createBaseCanvas(); renderImage();
      const a = document.createElement('a');
      a.href = ec.toDataURL('image/png');
      a.download = `pixelToneWarp-${exportFormat.replace(':','x')}.png`;
      document.body.appendChild(a); a.click(); a.remove();
    }

    function handleFiles(files) {
      if (!files || !files.length) return;
      const file = files[0]; if (!file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        baseImage = img; createBaseCanvas(); renderImage();
        dropOverlay.style.display = 'none'; exportImageBtn.disabled = false;
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }

    function setupDragAndDrop() {
      const prevent = e => { e.preventDefault(); e.stopPropagation(); };
      ['dragenter','dragover','dragleave','drop'].forEach(e => dropOverlay.addEventListener(e, prevent));
      dropOverlay.addEventListener('dragenter', () => dropOverlay.classList.add('dragover'));
      dropOverlay.addEventListener('dragleave', () => dropOverlay.classList.remove('dragover'));
      dropOverlay.addEventListener('drop', e => { dropOverlay.classList.remove('dragover'); handleFiles(e.dataTransfer.files); });
      dropOverlay.addEventListener('click', () => fileInput.click());
      document.getElementById('replace-image-btn').addEventListener('click', () => { fileInput.value = ''; fileInput.click(); });
      // Allow dropping a replacement image even after the initial overlay disappears.
      canvasWrapper.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
      canvasWrapper.addEventListener('drop', e => { if (e.target.closest('.drop-overlay') && dropOverlay.style.display !== 'none') return; e.preventDefault(); handleFiles(e.dataTransfer.files); });
      fileInput.addEventListener('change', () => handleFiles(fileInput.files));
    }

    let audioCtx=null,oscNode=null,tremoloLFO=null,tremoloDepth=null,tremoloOffset=null,tremoloGainNode=null;
    let vibratoLFO=null,vibratoGain=null,filterNode=null,pannerNode=null,reverbNode=null,reverbGain=null;
    let dryGain=null,noiseSource=null,noiseGain=null,masterGain=null,distortionNode=null;
    let mediaDest=null,mediaRecorder=null,audioReady=false,audioEnabled=false;

    const waveformSelect = document.getElementById('waveform-select');
    const masterIntensityEl = document.getElementById('master-intensity');
    const masterIntensityLabel = document.getElementById('master-intensity-label');
    const audioToggleBtn = document.getElementById('audio-toggle');
    const audioToggleLabel = document.getElementById('audio-toggle-label');
    const audioStatusDot = document.getElementById('audio-status-dot');
    const audioStatusText = document.getElementById('audio-status-text');

    function createReverbImpulse(ac) {
      const len = ac.sampleRate * 2, buf = ac.createBuffer(2, len, ac.sampleRate);
      for (let c = 0; c < 2; c++) { const ch = buf.getChannelData(c); for (let i = 0; i < len; i++) ch[i] = (Math.random()*2-1)*Math.pow(1-i/len,1.6); }
      return buf;
    }
    function makeDistortionCurve(amount) {
      const k=amount*80,n=256,curve=new Float32Array(n),deg=Math.PI/180;
      for(let i=0;i<n;i++){const x=(i*2)/n-1;curve[i]=(3+k)*x*20*deg/(Math.PI+k*Math.abs(x));}
      return curve;
    }

    async function initAudio() {
      if (audioReady) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { audioStatusText.textContent = "Web Audio not supported."; return; }
      audioCtx = new AC(); await audioCtx.resume();
      oscNode = audioCtx.createOscillator(); oscNode.type = waveformSelect.value; oscNode.frequency.value = 220;
      tremoloLFO = audioCtx.createOscillator(); tremoloLFO.frequency.value = 4;
      tremoloDepth = audioCtx.createGain(); tremoloDepth.gain.value = 0;
      tremoloOffset = audioCtx.createConstantSource(); tremoloOffset.offset.value = 1;
      tremoloGainNode = audioCtx.createGain(); tremoloGainNode.gain.value = 1;
      tremoloLFO.connect(tremoloDepth); tremoloDepth.connect(tremoloGainNode.gain); tremoloOffset.connect(tremoloGainNode.gain);
      vibratoLFO = audioCtx.createOscillator(); vibratoLFO.frequency.value = 5;
      vibratoGain = audioCtx.createGain(); vibratoGain.gain.value = 0;
      vibratoLFO.connect(vibratoGain).connect(oscNode.frequency);
      distortionNode = audioCtx.createWaveShaper(); distortionNode.curve = makeDistortionCurve(0); distortionNode.oversample = '4x';
      filterNode = audioCtx.createBiquadFilter(); filterNode.type = 'lowpass'; filterNode.frequency.value = 4000; filterNode.Q.value = 0.7;
      pannerNode = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : audioCtx.createPanner();
      if (pannerNode.pan) pannerNode.pan.value = 0;
      reverbNode = audioCtx.createConvolver(); reverbNode.buffer = createReverbImpulse(audioCtx);
      reverbGain = audioCtx.createGain(); reverbGain.gain.value = 0;
      dryGain = audioCtx.createGain(); dryGain.gain.value = 1;
      noiseGain = audioCtx.createGain(); noiseGain.gain.value = 0;
      masterGain = audioCtx.createGain(); masterGain.gain.value = 0;
      const buf = audioCtx.createBuffer(1, 2*audioCtx.sampleRate, audioCtx.sampleRate);
      const d = buf.getChannelData(0); for (let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
      noiseSource = audioCtx.createBufferSource(); noiseSource.buffer = buf; noiseSource.loop = true;
      oscNode.connect(distortionNode).connect(tremoloGainNode).connect(filterNode).connect(pannerNode);
      pannerNode.connect(dryGain).connect(masterGain);
      pannerNode.connect(reverbNode).connect(reverbGain).connect(masterGain);
      noiseSource.connect(noiseGain).connect(masterGain);
      masterGain.connect(audioCtx.destination);
      if (audioCtx.createMediaStreamDestination) {
        mediaDest = audioCtx.createMediaStreamDestination();
        masterGain.connect(mediaDest); mediaRecorder = new MediaRecorder(mediaDest.stream);
      }
      oscNode.start(); tremoloLFO.start(); tremoloOffset.start(); vibratoLFO.start(); noiseSource.start();
      audioReady = true; audioStatusText.textContent = 'Audio ready · click to enable / mute.';
    }

    function setAudioEnabled(en) {
      audioEnabled = en;
      if (masterGain) masterGain.gain.value = en ? (0.2 + state.masterIntensity * 0.8) : 0;
      audioStatusDot.classList.toggle('on', en);
      audioStatusText.textContent = en ? 'Audio on' : 'Audio off';
      audioToggleLabel.textContent = en ? 'Disable audio' : 'Enable audio';
    }

    let audioTimer = null;
    function scheduleAudio() {
      if (audioTimer) return;
      audioTimer = setTimeout(() => { audioTimer = null; updateAudio(); }, 30);
    }

    function updateAudio() {
      if (!audioReady) return;
      const g = state.masterIntensity, fx = state.effects;
      if (oscNode) oscNode.type = waveformSelect.value;
      if (distortionNode && filterNode) { const a = fx.pixelate.enabled ? fx.pixelate.intensity*g : 0; distortionNode.curve = makeDistortionCurve(a); filterNode.frequency.value = 2000+a*2000; }
      if (pannerNode && vibratoGain) { const a = fx.rgbShift.enabled ? fx.rgbShift.intensity*g : 0; if(pannerNode.pan) pannerNode.pan.value=(a-0.5)*0.6; vibratoGain.gain.value=a*8; vibratoLFO.frequency.value=3+a*5; }
      if (tremoloDepth) { const a = fx.scanline.enabled ? fx.scanline.intensity*g : 0; tremoloDepth.gain.value=a*0.8; tremoloLFO.frequency.value=4+a*14; }
      if (noiseGain) noiseGain.gain.value = fx.noiseSpray.enabled ? fx.noiseSpray.intensity*g*0.25 : 0;
      if (vibratoGain) vibratoGain.gain.value = ((fx.rgbShift.enabled ? fx.rgbShift.intensity*g : 0)*8) + (fx.warpFlow.enabled ? fx.warpFlow.intensity*g*5 : 0);
      if (reverbGain && filterNode) { const a = fx.dataMelt.enabled ? fx.dataMelt.intensity*g : 0; reverbGain.gain.value=a*0.7; filterNode.frequency.value = Math.max(120, 2000 + (fx.pixelate.enabled ? fx.pixelate.intensity*g*2000 : 0) - a*1200); }
      if (masterGain) masterGain.gain.value = audioEnabled ? (0.2+g*0.8) : 0;
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
        await window.pixelToneRecordWav(mediaRecorder, audioCtx, `pixelTone-warp-${seconds}s.wav`, seconds);
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
        state.masterIntensity = v; masterIntensityLabel.textContent = `${Math.round(v*100)}%`;
        scheduleAudio(); renderImage();
      };
      masterIntensityEl.addEventListener('input', updateMaster); updateMaster();
      waveformSelect.addEventListener('change', scheduleAudio);

      document.querySelectorAll('.toggle').forEach(t => {
        t.addEventListener('click', () => {
          const next = t.getAttribute('data-checked') !== 'true';
          t.setAttribute('data-checked', String(next));
          if (state.effects[t.dataset.toggle]) state.effects[t.dataset.toggle].enabled = next;
          renderImage(); scheduleAudio();
        });
      });

      document.querySelectorAll('input[type="range"][data-slider]').forEach(sl => {
        const key = sl.dataset.slider, label = document.querySelector(`[data-slider-label="${key}"]`);
        const update = () => {
          const v = parseFloat(sl.value);
          if (state.effects[key]) state.effects[key].intensity = v;
          if (label) label.textContent = `${Math.round(v*100)}%`;
          renderImage(); scheduleAudio();
        };
        sl.addEventListener('input', update); update();
      });

      audioToggleBtn.addEventListener('click', async () => {
        await initAudio();
        if (!audioReady) { audioStatusText.textContent = "Audio error."; return; }
        setAudioEnabled(!audioEnabled); updateAudio();
      });

      exportImageBtn.addEventListener('click', exportImage);
      exportAudioBtn.addEventListener('click', exportAudio);

      randomFxBtn.addEventListener('click', () => {
        document.querySelectorAll('input[type="range"][data-slider]').forEach(sl => {
          const v = Math.random(); sl.value = v.toFixed(2);
          const label = document.querySelector(`[data-slider-label="${sl.dataset.slider}"]`);
          if (state.effects[sl.dataset.slider]) state.effects[sl.dataset.slider].intensity = v;
          if (label) label.textContent = `${Math.round(v*100)}%`;
        });
        document.querySelectorAll('.toggle').forEach(t => {
          const on = Math.random() > 0.25; t.setAttribute('data-checked', String(on));
          if (state.effects[t.dataset.toggle]) state.effects[t.dataset.toggle].enabled = on;
        });
        renderImage(); scheduleAudio();
      });
    }

    window.addEventListener('load', () => { createNoiseTexture(); resizeCanvas(); setupDragAndDrop(); setupUI(); });
    window.addEventListener('resize', resizeCanvas);
  
// Forge V1.1: reliable mute from parent tab selection.
window.addEventListener("message", (event) => {
  if(event.source !== window.parent || event.data?.type !== "pixeltone-activate") return;
  if(event.data.mode !== "warp" && typeof audioReady !== "undefined" && audioReady) setAudioEnabled(false);
});
