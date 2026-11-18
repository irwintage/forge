
const chakras = [
  { name:"Root",      freq:396, color:"#f97373", glow:"rgba(249,115,115,0.22)", binauralDiff:5.5, reverbDecay:2.5, reverbWet:0.22, gainComp:1.00, filterCeil:2200, fadeIn:0.7 },
  { name:"Sacral",    freq:417, color:"#fb923c", glow:"rgba(251,146,60,0.22)",  binauralDiff:5.0, reverbDecay:2.8, reverbWet:0.24, gainComp:0.98, filterCeil:2000, fadeIn:0.75 },
  { name:"Solar",     freq:528, color:"#facc15", glow:"rgba(250,204,21,0.20)",  binauralDiff:4.0, reverbDecay:3.0, reverbWet:0.26, gainComp:0.95, filterCeil:1800, fadeIn:0.8 },
  { name:"Heart",     freq:639, color:"#4ade80", glow:"rgba(74,222,128,0.20)",  binauralDiff:3.5, reverbDecay:3.2, reverbWet:0.28, gainComp:0.92, filterCeil:1600, fadeIn:0.85 },
  { name:"Throat",    freq:741, color:"#38bdf8", glow:"rgba(56,189,248,0.22)",  binauralDiff:2.5, reverbDecay:3.8, reverbWet:0.34, gainComp:0.88, filterCeil:1300, fadeIn:1.0 },
  { name:"Third Eye", freq:852, color:"#818cf8", glow:"rgba(129,140,248,0.22)", binauralDiff:2.0, reverbDecay:4.2, reverbWet:0.38, gainComp:0.84, filterCeil:1100, fadeIn:1.1 },
  { name:"Crown",     freq:963, color:"#c4b5fd", glow:"rgba(196,181,253,0.22)", binauralDiff:1.5, reverbDecay:4.8, reverbWet:0.42, gainComp:0.80, filterCeil:950,  fadeIn:1.2 }
];

const HOLD_DURATION_BASE  = 60000;
const HOLD_DURATION_DEBUG = 3000;
let DEBUG = false;
const getHoldDuration = () => DEBUG ? HOLD_DURATION_DEBUG : HOLD_DURATION_BASE;

let currentChakra = 0;
let completed = new Array(chakras.length).fill(false);
let holdStart  = null;
let holdRafId  = null;
let isHolding  = false;
let holdRequested = false;
let audioReady  = false;
let audioNodes  = null;
let volumeScalar = 0.05;
let toneScalar   = 0.6;
let audioPrimed = false;

const chipsContainer   = document.getElementById("chakraChips");
const flaskEl          = document.getElementById("flask");
const flaskLayers      = [...document.querySelectorAll(".flask-layer")];
const holdButton       = document.getElementById("holdButton");
const timerRing        = document.getElementById("timerRing");
const timerDisplay     = document.getElementById("timerDisplay");
const timerStatus      = document.getElementById("timerStatus");
const holdHint         = document.getElementById("holdHint");
const chakraNameEl     = document.getElementById("chakraName");
const chakraFreqEl     = document.getElementById("chakraFreq");
const sessionStatus    = document.getElementById("sessionStatus");
const sessionStatusTxt = document.getElementById("sessionStatusText");
const debugToggle      = document.getElementById("debugToggle");
const rootStyle        = document.documentElement.style;
const volumeSlider     = document.getElementById("volumeSlider");
const toneSlider       = document.getElementById("toneSlider");
const sessionBarEl     = document.getElementById("sessionBar");
const startScreen = document.getElementById("startScreen");
const enableAudioBtn = document.getElementById("enableAudioBtn");
function formatTime(ms) {
  const t = Math.floor(ms / 1000);
  return String(Math.floor(t/60)).padStart(2,"0") + ":" + String(t%60).padStart(2,"0");
}

function updateHoldHint() {
  holdHint.textContent = DEBUG ? "Debug · 3s" : "Hold for 60s";
}

function applyChakraTheme(index) {
  const c = chakras[index];
  rootStyle.setProperty("--chakra-color", c.color);
  rootStyle.setProperty("--chakra-glow",  c.glow);
}

function buildSessionBar() {
  sessionBarEl.innerHTML = "";
  chakras.forEach((c, i) => {
    const seg = document.createElement("div");
    seg.className = "session-seg";
    seg.dataset.index = i;
    seg.style.setProperty("--chakra-seg-color", c.color);
    sessionBarEl.appendChild(seg);
  });
}

function updateSessionBar() {
  const segs = sessionBarEl.querySelectorAll(".session-seg");
  segs.forEach((seg, i) => {
    seg.classList.remove("done","active");
    if (completed[i]) {
      seg.classList.add("done");
    } else if (i === currentChakra) {
      seg.classList.add("active");
    }
  });
}

function updateStatusPill() {
  const done = completed.filter(Boolean).length;
  if (done === chakras.length) {
    sessionStatus.classList.add("complete");
    sessionStatusTxt.innerHTML = '<span class="status-pill-dot"></span>Aligned';
  } else {
    sessionStatus.classList.remove("complete");
    sessionStatusTxt.textContent = done + "/7";
  }
}

function updateUIForChakra() {
  const chakra = chakras[currentChakra];
  applyChakraTheme(currentChakra);

  chipsContainer.querySelectorAll(".chip").forEach((chip, i) => {
    chip.classList.toggle("active", i === currentChakra);
    chip.classList.toggle("completed", completed[i]);
  });

  flaskLayers.forEach((layer, i) => {
    layer.classList.toggle("completed", completed[i]);
    layer.classList.remove("pulse");
    layer.style.background = `linear-gradient(to top, ${chakras[i].color} 0%, rgba(0,0,0,1) 100%)`;
    layer.style.opacity = completed[i] ? "0.92" : "0.14";
  });

  chakraNameEl.textContent = chakra.name;
  chakraFreqEl.textContent = chakra.freq + " Hz · binaural";
  updateStatusPill();
  updateSessionBar();
  window.dispatchEvent(new CustomEvent("chrysa:progress", {detail:{currentChakra,completed:[...completed]}}));
}

function resetTimerVisual() {
  holdStart = null;
  rootStyle.setProperty("--timer-progress", 0);
  timerDisplay.textContent = "00:00";
  timerRing.classList.add("idle");
  timerStatus.textContent = "Ready";
}

function startTimer() {
  holdStart = performance.now();
  timerRing.classList.remove("idle");

  const loop = () => {
    if (!isHolding || holdStart === null) return;
    const elapsed  = performance.now() - holdStart;
    const duration = getHoldDuration();
    const progress = Math.min(elapsed / duration, 1);
    rootStyle.setProperty("--timer-progress", progress);
    timerDisplay.textContent = formatTime(elapsed);
    updateSessionBar();

    if (elapsed >= duration) {
      completeCurrentHold();
    } else {
      holdRafId = requestAnimationFrame(loop);
    }
  };
  holdRafId = requestAnimationFrame(loop);
}

function stopTimer(reset) {
  if (holdRafId !== null) { cancelAnimationFrame(holdRafId); holdRafId = null; }
  if (reset) resetTimerVisual();
}

async function ensureAudio() {
  if (audioReady) return;
  try {
    await Tone.start();

    const limiter = new Tone.Limiter(-4).toDestination();
    const master = new Tone.Gain(0).connect(limiter);
    const filter = new Tone.Filter(800, "lowpass");
    const safetyLP = new Tone.Filter(8000, "lowpass");

    const chakra = chakras[currentChakra];
    const reverb = new Tone.Reverb({ decay: chakra.reverbDecay, wet: chakra.reverbWet });
    await reverb.ready;

    filter.connect(safetyLP);
    safetyLP.connect(reverb);
    reverb.connect(master);

    const leftOsc  = new Tone.Oscillator(chakra.freq - chakra.binauralDiff / 2, "sine");
    const rightOsc = new Tone.Oscillator(chakra.freq + chakra.binauralDiff / 2, "sine");

    const leftPan  = new Tone.Panner(-0.85);
    const rightPan = new Tone.Panner(0.85);
    const leftGain  = new Tone.Gain(0.5);
    const rightGain = new Tone.Gain(0.5);

    leftOsc.chain(leftPan, leftGain, filter);
    rightOsc.chain(rightPan, rightGain, filter);

    leftOsc.start();
    rightOsc.start();

    audioNodes = { master, filter, safetyLP, reverb, limiter, leftOsc, rightOsc, leftPan, rightPan, leftGain, rightGain };
    audioReady = true;

    applyChakraAudio(false);
  } catch (err) {
    console.error("Audio init error:", err);
    timerStatus.textContent = "Audio blocked";
  }
}

function applyChakraAudio(smooth) {
  if (!audioReady || !audioNodes) return;
  const chakra = chakras[currentChakra];
  const ramp = smooth ? 0.6 : 0.0;

  const diff = chakra.binauralDiff;
  audioNodes.leftOsc.frequency.rampTo(chakra.freq - diff / 2, ramp);
  audioNodes.rightOsc.frequency.rampTo(chakra.freq + diff / 2, ramp);

  const t      = toneScalar;
  const minMul = 0.55;
  const maxMul = 1.8;
  const mul    = minMul + (maxMul - minMul) * t;
  let cutoff   = chakra.freq * mul;
  cutoff = Math.max(120, Math.min(cutoff, chakra.filterCeil));
  audioNodes.filter.frequency.rampTo(cutoff, ramp > 0 ? ramp : 0.3);

  audioNodes.reverb.set({ decay: chakra.reverbDecay, wet: chakra.reverbWet });
}

function startSound() {
  if (!audioReady || !audioNodes) return;
  applyChakraAudio(true);
  const chakra = chakras[currentChakra];
  const target = volumeScalar * chakra.gainComp;
  const now = Tone.now();

  try { audioNodes.master.gain.cancelAndHoldAtTime(now); } catch(e) {
    audioNodes.master.gain.cancelScheduledValues(now);
  }
  audioNodes.master.gain.setValueAtTime(audioNodes.master.gain.value, now);
  audioNodes.master.gain.linearRampToValueAtTime(target, now + chakra.fadeIn);
}

function stopSound() {
  if (!audioReady || !audioNodes) return;
  const now = Tone.now();
  try { audioNodes.master.gain.cancelAndHoldAtTime(now); } catch(e) {
    audioNodes.master.gain.cancelScheduledValues(now);
  }
  audioNodes.master.gain.setValueAtTime(audioNodes.master.gain.value, now);
  audioNodes.master.gain.linearRampToValueAtTime(0, now + 0.7);
}

function applyVolumeFromSlider(smooth) {
  const val = parseInt(volumeSlider.value, 10) || 0;
  volumeScalar = (val / 100) * 0.11;
  if (!audioReady || !audioNodes) return;
  if (!isHolding) return;
  const chakra = chakras[currentChakra];
  const target = volumeScalar * chakra.gainComp;
  const now = Tone.now();
  try { audioNodes.master.gain.cancelAndHoldAtTime(now); } catch(e) {
    audioNodes.master.gain.cancelScheduledValues(now);
  }
  audioNodes.master.gain.setValueAtTime(audioNodes.master.gain.value, now);
  audioNodes.master.gain.linearRampToValueAtTime(target, now + (smooth ? 0.2 : 0));
}

function applyToneFromSlider() {
  toneScalar = (parseInt(toneSlider.value, 10) || 0) / 100;
  if (audioReady && audioNodes) applyChakraAudio(true);
}

volumeSlider.addEventListener("input", () => {
  applyVolumeFromSlider(true);
  try { localStorage.setItem("chrysasynth_vol", volumeSlider.value); } catch(e){}
});

toneSlider.addEventListener("input", () => {
  applyToneFromSlider();
  try { localStorage.setItem("chrysasynth_tone", toneSlider.value); } catch(e){}
});

function vibrate() {
  if ("vibrate" in navigator) navigator.vibrate(80);
}

function completeCurrentHold() {
holdRequested = false;
  isHolding = false;
  stopTimer(false);
  stopSound();

  completed[currentChakra] = true;
  const layer = flaskLayers[currentChakra];
  layer.classList.add("completed", "pulse");
  setTimeout(() => layer.classList.remove("pulse"), 900);

  vibrate();

  timerDisplay.textContent = formatTime(getHoldDuration());
  rootStyle.setProperty("--timer-progress", 1);
  holdButton.classList.remove("active");
  timerStatus.textContent = "Done";
  holdHint.textContent = "Next chakra";

  const allDone = completed.every(Boolean);
  if (allDone) {
    flaskEl.classList.add("glow-final");
    updateStatusPill();
  } else {
    const next = completed.findIndex((c, i) => !c && i > currentChakra);
    currentChakra = next !== -1 ? next : completed.findIndex(c => !c);
  }

  setTimeout(() => {
    if (!allDone) { resetTimerVisual(); updateHoldHint(); }
    updateUIForChakra();
  }, 800);
}

function cancelHold() {
  holdRequested = false;

  if (!isHolding) {
    timerStatus.textContent = "Released";
    updateHoldHint();
    return;
  }

  isHolding = false;
  stopTimer(true);
  stopSound();
  holdButton.classList.remove("active");
  timerStatus.textContent = "Released";
  updateHoldHint();
}

async function startHold() {
if (!audioPrimed) return;
  if (completed.every(Boolean)) return;
  if (holdRequested || isHolding) return;

  holdRequested = true;
  timerStatus.textContent = "Loading…";

  await ensureAudio();

  if (!holdRequested) {
    timerStatus.textContent = "Ready";
    updateHoldHint();
    return;
  }

  isHolding = true;
  holdButton.classList.add("active");
  timerStatus.textContent = "Holding";
  updateHoldHint();

  startSound();
  resetTimerVisual();
  startTimer();
}
async function enableAudio() {
  if (audioPrimed) return;

  enableAudioBtn.disabled = true;
  enableAudioBtn.textContent = "Loading…";

  await ensureAudio();

  if (!audioReady) {
    enableAudioBtn.disabled = false;
    enableAudioBtn.textContent = "Retry Audio";
    return;
  }
  audioPrimed = true;
  startScreen.style.display = "none";
}
function bindHoldEvents() {
  const endHold = (e) => {
    if (isHolding || holdRequested) cancelHold();

    try {
      if (e && e.pointerId != null && holdButton.hasPointerCapture?.(e.pointerId)) {
        holdButton.releasePointerCapture(e.pointerId);
      }
    } catch (err) {}
  };

  holdButton.addEventListener("pointerdown", async (e) => {
    e.preventDefault();

    try {
      holdButton.setPointerCapture(e.pointerId);
    } catch (err) {}

    if (!isHolding && !holdRequested) {
      await startHold();
    }
  });

  holdButton.addEventListener("pointerup", endHold);
  holdButton.addEventListener("pointercancel", endHold);
  holdButton.addEventListener("lostpointercapture", () => {
    if (isHolding || holdRequested) cancelHold();
  });

  window.addEventListener("blur", () => {
    if (isHolding || holdRequested) cancelHold();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && (isHolding || holdRequested)) cancelHold();
  });
}

function createChakraChips() {
  chakras.forEach((chakra, index) => {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.dataset.index = index;

    const dot = document.createElement("span");
    dot.className = "chip-dot";
    dot.style.background = chakra.color;

    const label = document.createElement("span");
    label.textContent = chakra.name;

    chip.append(dot, label);

    chip.addEventListener("click", () => {
      if (isHolding) cancelHold();
      currentChakra = index;
      updateUIForChakra();
      resetTimerVisual();
      updateHoldHint();
      if (audioReady) applyChakraAudio(true);
    });

    chipsContainer.appendChild(chip);
  });
}

function initFlaskColors() {
  flaskLayers.forEach((layer, i) => {
    layer.style.background = `linear-gradient(to top, ${chakras[i].color} 0%, rgba(0,0,0,1) 100%)`;
  });
}

function bindDebugToggle() {
  if (!debugToggle) return;
  debugToggle.addEventListener("click", e => {
    e.preventDefault();
    DEBUG = !DEBUG;
    debugToggle.classList.toggle("debug-on", DEBUG);
    timerStatus.textContent = DEBUG ? "Debug" : "Ready";
    stopTimer(true);
    updateHoldHint();
  });
  window.addEventListener("keydown", e => {
    if (e.key && e.key.toLowerCase() === "d") debugToggle.click();
  });
}

function restoreSliders() {
  try {
    const sv = localStorage.getItem("chrysasynth_vol");
    const st = localStorage.getItem("chrysasynth_tone");
    if (sv !== null) volumeSlider.value = sv;
    if (st !== null) toneSlider.value   = st;
  } catch(e) {}
  volumeScalar = ((parseInt(volumeSlider.value,10)||40) / 100) * 0.11;
  toneScalar   = (parseInt(toneSlider.value,10)||60) / 100;
}

function init() {
  restoreSliders();
  buildSessionBar();
  createChakraChips();
  initFlaskColors();
  bindHoldEvents();
  // Debug shortcut intentionally disabled in Forge production edition.
  resetTimerVisual();
  updateUIForChakra();
  updateHoldHint();
  if (enableAudioBtn) {
  enableAudioBtn.addEventListener("click", enableAudio);
}
}

document.addEventListener("DOMContentLoaded", init);

function reportHeight() {
  const h = document.body.scrollHeight;
  try {
    window.parent.postMessage({ type:"setHeight", height:h }, "*");
    window.parent.postMessage({ iframe:true, height:h }, "*");
    window.parent.postMessage("height:" + h, "*");
  } catch(e) {}
  
}
window.addEventListener("load", reportHeight);
if (window.ResizeObserver) {
  new ResizeObserver(reportHeight).observe(document.body);
} else {
  window.addEventListener("resize", reportHeight);
}
