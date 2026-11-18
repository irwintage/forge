
/* =========================
   Seeded RNG
========================= */
function mulberry32(seed){
  let t = seed >>> 0;
  return function(){
    t += 0x6D2B79F5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));

/* =========================
   Notes / Scales
========================= */
const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
function midiToFreq(m){ return 440 * Math.pow(2, (m - 69) / 12); }
function buildScale(key, type){
  const root = NOTE_NAMES.indexOf(key);
  const intervals =
    type==="major" ? [0,2,4,5,7,9,11] :
    type==="pentatonic" ? [0,3,5,7,10] :
    type==="dorian" ? [0,2,3,5,7,9,10] :
    [0,2,3,5,7,8,10];
  return intervals.map(i => (root+i)%12);
}
function degreeToMidi(deg, octave, key, scaleType){
  const scale = buildScale(key, scaleType);
  const n = scale.length;
  const idx = ((deg % n) + n) % n;
  const extraOct = Math.floor(deg / n);
  const pc = scale[idx];
  const keyPc = NOTE_NAMES.indexOf(key);
  const base = (octave+1)*12 + keyPc;
  return base + ((pc - keyPc + 12) % 12) + extraOct*12;
}

/* =========================
   Seed Presets
   instrument: "pad" | "bass" | "bell" | "string"
========================= */
const SEEDS = {
  ionEssence:{
    label:"Brume Douce",
    instrument:"pad",
    music:{ tempo:96, key:"E", scale:"minor" },
    gen:{ seed:193842, lock:true, repeat:0.42, alternate:0.18, shift:0.22, harmony:0.35, density:0.48, chance:0.12 },
    drums:{ enabled:true, intensity:0.25, variation:0.20 }
  },
  mirageBloom:{
    label:"Éclat Verre",
    instrument:"bell",
    music:{ tempo:110, key:"A", scale:"dorian" },
    gen:{ seed:874221, lock:false, repeat:0.30, alternate:0.28, shift:0.10, harmony:0.22, density:0.62, chance:0.18 },
    drums:{ enabled:true, intensity:0.18, variation:0.35 }
  },
  shantiAscend:{
    label:"Fil Vivant",
    instrument:"string",
    music:{ tempo:88, key:"D", scale:"pentatonic" },
    gen:{ seed:554901, lock:true, repeat:0.55, alternate:0.12, shift:0.26, harmony:0.18, density:0.40, chance:0.10 },
    drums:{ enabled:true, intensity:0.30, variation:0.15 }
  },
  spectralDrift:{
    label:"Profond",
    instrument:"bass",
    music:{ tempo:105, key:"G", scale:"minor" },
    gen:{ seed:990112, lock:false, repeat:0.22, alternate:0.35, shift:0.34, harmony:0.44, density:0.55, chance:0.22 },
    drums:{ enabled:true, intensity:0.22, variation:0.40 }
  }
};

const state = {
  seedId:"ionEssence",
  preset: structuredClone(SEEDS.ionEssence),
  audioReady:false,
  recording:false
};

const $ = (id)=>document.getElementById(id);

/* =========================
   UI refs
========================= */
const seedSelect    = $("seedSelect");
const randomizeBtn  = $("randomizeBtn");
const lockBtn       = $("lockBtn");
const seedInfo      = $("seedInfo");
const audioBtn      = $("audioBtn");
const tempoEl       = $("tempo");
const tempoVal      = $("tempoVal");
const scaleSelect   = $("scaleSelect");
const keyRow        = $("keyRow");
const playBtn       = $("playBtn");
const stopBtn       = $("stopBtn");
const regenBtn      = $("regenBtn");
const recordBtn     = $("recordBtn");
const masterEl      = $("master");
const masterVal     = $("masterVal");
const drumToggle    = $("drumToggle");
const drumIntensity = $("drumIntensity");
const drumIntensityVal = $("drumIntensityVal");
const drumVariation = $("drumVariation");
const drumVariationVal = $("drumVariationVal");

const macros   = ["repeat","alternate","shift","harmony","density","chance"];
const macroEls = Object.fromEntries(macros.map(k=>[k,$(k)]));
const macroVals= Object.fromEntries(macros.map(k=>[k,$(k+"Val")]));

/* =========================
   Build selects / key dots
========================= */
function fillSeedSelect(){
  seedSelect.innerHTML = "";
  Object.entries(SEEDS).forEach(([id,p])=>{
    const opt = document.createElement("option");
    opt.value = id; opt.textContent = p.label;
    seedSelect.appendChild(opt);
  });
}
fillSeedSelect();

function buildKeyDots(){
  keyRow.innerHTML = "";
  NOTE_NAMES.forEach(k=>{
    const d = document.createElement("button");
    d.type = "button";
    d.setAttribute("aria-label", `Root note ${k}`);
    d.setAttribute("aria-pressed", String(state.preset.music.key===k));
    d.className = "keyDot" + (state.preset.music.key===k ? " active":"");
    const glyph = document.createElement("span");
    glyph.className = "note-glyph";
    glyph.appendChild(document.createTextNode(k.replace("#", "")));
    if(k.includes("#")){ const sharp = document.createElement("span"); sharp.className = "note-sharp"; sharp.textContent = "#"; glyph.appendChild(sharp); }
    d.appendChild(glyph);
    d.onclick = ()=>{ state.preset.music.key = k; buildKeyDots(); syncUI(); recompileAndApply(); };
    keyRow.appendChild(d);
  });
}

function syncUI(){
  seedSelect.value = state.seedId;
  const locked = !!state.preset.gen.lock;
  lockBtn.classList.toggle("active", locked);
  lockBtn.textContent = locked ? "Locked" : "Lock seed";
  lockBtn.setAttribute("aria-pressed", String(locked));
  if($("patternActionHint")) $("patternActionHint").textContent = locked ? "Seed locked · Replays the same pattern" : "New bass + drums · Same key & scale";
  if(regenBtn) { regenBtn.textContent = locked ? "↻ Replay Pattern" : "↻ New Pattern"; regenBtn.title = locked ? "Replay the same deterministic pattern (unlock seed for a new one)" : "Generate new bass and drum events without changing the key, scale or tempo"; }
  randomizeBtn.classList.toggle("disabled", locked);
  tempoEl.value = state.preset.music.tempo;
  tempoVal.textContent = `${state.preset.music.tempo} BPM`;
  scaleSelect.value = state.preset.music.scale;
  macros.forEach(k=>{ macroEls[k].value = state.preset.gen[k]; macroVals[k].textContent = state.preset.gen[k].toFixed(2); });
  drumToggle.classList.toggle("active", !!state.preset.drums.enabled);
  drumToggle.textContent = state.preset.drums.enabled ? "On" : "Off";
  drumToggle.setAttribute("aria-pressed", String(!!state.preset.drums.enabled));
  document.querySelector(".drums-panel")?.classList.toggle("is-muted", !state.preset.drums.enabled);
  drumIntensity.value = state.preset.drums.intensity;
  drumIntensityVal.textContent = state.preset.drums.intensity.toFixed(2);
  drumVariation.value = state.preset.drums.variation;
  drumVariationVal.textContent = state.preset.drums.variation.toFixed(2);
  masterEl.value = state.master ?? parseFloat(masterEl.value);
  masterVal.textContent = parseFloat(masterEl.value).toFixed(2);
  seedInfo.textContent =
    `Instrument: ${state.preset.instrument} · Seed: ${state.preset.gen.seed} · ` +
    `${state.preset.music.key} ${state.preset.music.scale} · ${state.preset.music.tempo} BPM · ` +
    `Randomize = seed + macros + drums (when unlocked)`;
}
buildKeyDots();
syncUI();

/* =========================
   SYNTH ENGINE — WebAudio / Tone
   4 voice types: pad, bass, bell, string
   No samples. Pitch-stable at all registers.
========================= */

let master, recorder;
let kick, snare, hat, drumGain;
let synthVoice = null;
let partMelody=null, partDrums=null;

/* ── Synth builders ────────────────────────────────────────────── */

function buildPad(){
  // Brume Douce: deux PolySynth légèrement désaccordés mixés ensemble
  // Pas de chorus sur le bus — évite l'accumulation chaotique en polyphonie
  const synthA = new Tone.PolySynth(Tone.Synth, {
    oscillator:{ type:"sine" },
    envelope:{ attack:0.30, decay:0.8, sustain:0.45, release:2.2 },
    volume:-11
  });
  const synthB = new Tone.PolySynth(Tone.Synth, {
    oscillator:{ type:"triangle" },
    envelope:{ attack:0.40, decay:1.0, sustain:0.35, release:2.5 },
    volume:-14
  });
  // Filtre doux pour couper le haut du spectre
  const filter = new Tone.Filter({ frequency:2200, type:"lowpass", rolloff:-24 });
  // Reverb généreux — c'est lui qui donne la largeur, pas un chorus
  const reverb = new Tone.Reverb({ decay:4.0, wet:0.55 });
  synthA.connect(filter); synthB.connect(filter);
  filter.connect(reverb);
  return {
    connect(dest){ reverb.connect(dest); return this; },
    triggerAttackRelease(freq, dur, time, vel=1){
      // Légère transposition du second oscillateur pour l'effet pad
      const detunedFreq = freq * 1.002;
      // Atténuation progressive dans les aigus
      const v = clamp(vel * (0.68 - Math.max(0, (freq - 500) / 5000) * 0.22), 0.04, 0.90);
      synthA.triggerAttackRelease(freq, dur, time, v);
      synthB.triggerAttackRelease(detunedFreq, dur, time, v * 0.55);
    },
    dispose(){ synthA.dispose(); synthB.dispose(); filter.dispose(); reverb.dispose(); }
  };
}

function buildBass(){
  // Profond: sine pur, filtre doux — pas de résonance à la coupure
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator:{ type:"sine" },
    envelope:{ attack:0.010, decay:0.30, sustain:0.28, release:0.80 },
    volume:-6
  });
  // Filtre plus haut et sans Q pour éviter la résonance perceptible
  const filter = new Tone.Filter({ frequency:700, type:"lowpass", rolloff:-12, Q:0.5 });
  const reverb = new Tone.Reverb({ decay:1.6, wet:0.18 });
  synth.connect(filter); filter.connect(reverb);
  return {
    connect(dest){ reverb.connect(dest); return this; },
    triggerAttackRelease(freq, dur, time, vel=1){
      const bassFreq = freq * 0.5;
      synth.triggerAttackRelease(bassFreq, dur, time, clamp(vel * 0.85, 0.05, 1));
    },
    dispose(){ synth.dispose(); filter.dispose(); reverb.dispose(); }
  };
}

function buildBell(){
  // Glass/bell: FM synthesis — carrier sine + modulator
  // Uses Tone.FMSynth under the hood for clean pitched bell tones
  const synth = new Tone.PolySynth(Tone.FMSynth, {
    harmonicity: 5.1,
    modulationIndex: 8,
    oscillator:{ type:"sine" },
    envelope:{ attack:0.001, decay:0.6, sustain:0.0, release:0.9 },
    modulation:{ type:"sine" },
    modulationEnvelope:{ attack:0.002, decay:0.3, sustain:0.0, release:0.6 },
    volume:-8
  });
  const reverb = new Tone.Reverb({ decay:2.5, wet:0.38 });
  synth.connect(reverb);
  return {
    connect(dest){ reverb.connect(dest); return this; },
    triggerAttackRelease(freq, dur, time, vel=1){
      synth.triggerAttackRelease(freq, dur, time, clamp(vel*0.75, 0.05, 1));
    },
    dispose(){ synth.dispose(); reverb.dispose(); }
  };
}

function buildString(){
  // Fil Vivant: Karplus musical — résonance restaurée, métal retiré chirurgicalement
  const filter = new Tone.Filter({ frequency:3800, type:"lowpass", rolloff:-12 });
  const reverb = new Tone.Reverb({ decay:2.2, wet:0.38 });
  filter.connect(reverb);

  const POOL_SIZE = 6;
  const pool = Array.from({ length: POOL_SIZE }, ()=>{
    const p = new Tone.PluckSynth({ attackNoise:0.8, dampening:3600, resonance:0.90 });
    p.connect(filter);
    return p;
  });
  let poolIdx = 0;

  return {
    connect(dest){ reverb.connect(dest); return this; },
    triggerAttackRelease(freq, dur, time, vel=1){
      const voice = pool[poolIdx % POOL_SIZE];
      poolIdx++;
      // Dampening adaptatif uniquement pour les notes vraiment aiguës (>800 Hz)
      const damp = freq > 800
        ? clamp(3600 - (freq - 800) * 2.0, 1200, 3600)
        : 3600;
      voice.dampening = damp;
      // Résonance stable dans le bas/médium, légère réduction seulement au-dessus de 1000 Hz
      voice.resonance = freq > 1000
        ? clamp(0.90 - (freq - 1000) / 4000, 0.72, 0.90)
        : 0.90;
      voice.triggerAttack(freq, time, clamp(vel * 0.85, 0.05, 1));
    },
    dispose(){
      pool.forEach(p=>p.dispose());
      filter.dispose(); reverb.dispose();
    }
  };
}

function buildSynthVoice(name){
  switch(name){
    case "pad":    return buildPad();
    case "bass":   return buildBass();
    case "bell":   return buildBell();
    case "string": return buildString();
    default:       return buildPad();
  }
}

/* ── Audio init ────────────────────────────────────────────────── */

async function ensureAudio(){
  if(state.audioReady) return;
  await Tone.start();
  await Tone.context.resume();

  master = new Tone.Gain(parseFloat(masterEl.value)).toDestination();

  recorder = new Tone.Recorder();
  master.connect(recorder);

  const initDrumGain = state.preset.drums.enabled ? state.preset.drums.intensity : 0;
  drumGain = new Tone.Gain(initDrumGain).connect(master);

  kick  = new Tone.MembraneSynth({ pitchDecay:0.02, octaves:3 }).connect(drumGain);
  snare = new Tone.NoiseSynth({ noise:{type:"white"}, envelope:{attack:0.001,decay:0.12,sustain:0} }).connect(drumGain);
  hat   = new Tone.MetalSynth({
    frequency:250, envelope:{attack:0.001,decay:0.06,release:0.01},
    harmonicity:5.1, modulationIndex:32, resonance:4000
  }).connect(drumGain);

  Tone.Transport.timeSignature = [4,4];
  Tone.Transport.loop = true;
  Tone.Transport.loopStart = "0:0:0";
  Tone.Transport.loopEnd   = "1:0:0";
  Tone.Transport.bpm.value = state.preset.music.tempo;

  synthVoice = buildSynthVoice(state.preset.instrument);
  synthVoice.connect(master);

  state.audioReady = true;
  audioBtn.textContent = "Audio: ready";
  audioBtn.classList.add("ready");
}
audioBtn.addEventListener("click", ensureAudio);

function setInstrument(name){
  if(synthVoice){ synthVoice.dispose(); synthVoice = null; }
  synthVoice = buildSynthVoice(name);
  synthVoice.connect(master);
}

/* =========================
   Pattern compiler — unchanged from original
========================= */
function compileMelody(p){
  const rng = mulberry32(p.gen.seed >>> 0);
  const steps = 16, stepBeat = 0.25;
  const dens = clamp(0.08 + p.gen.density*0.85, 0.08, 0.95);
  const baseOct = 3 + (rng()<0.5 ? 0 : 1) + (p.gen.harmony>0.5 ? 1:0);
  let lastDeg = 0;
  const events = [];

  for(let i=0;i<steps;i++){
    if(rng() > dens) continue;
    const move = (rng()<0.62) ? (rng()<0.5?-1:1) : (rng()<0.85) ? (rng()<0.5?-2:2) : (rng()<0.5?-3:3);
    let deg = clamp(lastDeg + move, -3, 11);
    lastDeg = deg;
    const durSteps = (rng() < (0.35 + p.gen.repeat*0.45)) ? 1 : (rng()<0.7 ? 2 : 4);
    events.push({ tBeat:i*stepBeat, durBeat:durSteps*stepBeat, degree:deg, oct:baseOct, vel:0.62+rng()*0.28 });
  }

  let out = events;
  out = tfRepeat(out, p, rng);
  out = tfAlternate(out, p, rng);
  out = tfShift(out, p, rng);
  out = tfHarmony(out, p, rng);
  out = tfChance(out, p, rng);

  return out
    .map(e=>({ ...e, tBeat:clamp(e.tBeat,0,3.999), durBeat:clamp(e.durBeat,0.125,2) }))
    .sort((a,b)=>a.tBeat-b.tBeat);
}

function tfRepeat(events, p, rng){
  const amt = p.gen.repeat;
  if(amt < 0.08) return events;
  const out = [...events], prob = 0.10 + amt*0.35;
  events.forEach(e=>{
    if(rng() > prob) return;
    const dt = (rng()<0.5 ? 1 : 2) * 0.25;
    const echoed = { ...e, tBeat:e.tBeat+dt, vel:e.vel*(0.60+rng()*0.25), degree:e.degree+(rng()<0.35?(rng()<0.5?-1:1):0) };
    if(echoed.tBeat < 4.0) out.push(echoed);
  });
  return out;
}
function tfAlternate(events, p, rng){
  const amt = p.gen.alternate;
  if(amt < 0.12) return events;
  return events.map(e=>{
    if(rng() > (0.15 + amt*0.45)) return e;
    return { ...e, degree:-e.degree+(rng()<0.25?(rng()<0.5?-1:1):0) };
  });
}
function tfShift(events, p, rng){
  const amt = p.gen.shift;
  if(amt < 0.05) return events;
  const shiftSteps = Math.round(amt * 6) - 2;
  const timeShift = (amt * 0.20) * (rng()<0.5?-1:1);
  return events.map(e=>({ ...e, degree:e.degree+shiftSteps, tBeat:e.tBeat+timeShift }));
}
function tfHarmony(events, p, rng){
  const amt = p.gen.harmony;
  if(amt < 0.10) return events;
  const out = [...events], prob = 0.08 + amt*0.35;
  events.forEach(e=>{
    if(rng() > prob) return;
    const add = (rng()<0.6) ? 2 : 4;
    out.push({ ...e, degree:e.degree+add, vel:e.vel*(0.55+rng()*0.20), tBeat:e.tBeat+(rng()<0.5?0:0.25) });
  });
  return out;
}
function tfChance(events, p, rng){
  const amt = p.gen.chance;
  if(amt < 0.02) return events;
  const timeJit=amt*0.10, velJit=amt*0.25, rareP=amt*0.12;
  return events.map(e=>{
    let t=e.tBeat+(rng()*2-1)*timeJit, v=e.vel+(rng()*2-1)*velJit, deg=e.degree;
    if(rng() < rareP){ deg += (rng()<0.5?-7:7); v *= 1.05; }
    return { ...e, tBeat:t, vel:clamp(v,0.05,1.0), degree:deg };
  });
}

function compileDrums(p){
  if(!p.drums.enabled || p.drums.intensity <= 0.001) return [];
  const seed = (p.gen.seed ^ 0x9E3779B9) >>> 0;
  const rng = mulberry32(seed);
  const inten = p.drums.intensity;
  const vari  = p.drums.variation;
  const steps = 16, stepBeat = 0.25, ev = [];

  // Variation selects one of 4 structural groove modes
  // 0.00–0.25 : minimal (kick 1+3, snare 2+4 only, sparse hat)
  // 0.25–0.50 : standard (four-on-floor kick, backbeat snare, steady hat)
  // 0.50–0.75 : syncopated (offbeat kicks, ghost snares, 16th hat bursts)
  // 0.75–1.00 : chaotic (seed-driven free hits, rolls, accents)
  const mode = vari < 0.25 ? 0 : vari < 0.50 ? 1 : vari < 0.75 ? 2 : 3;

  // Base velocity scales with intensity (quiet at low intensity)
  const velScale = 0.25 + inten * 0.75;

  for(let i = 0; i < steps; i++){
    const tBeat = i * stepBeat;
    const beat  = i % 4;   // 0..3 within each quarter
    const bar16 = i;       // 0..15

    // ── KICK ──
    let doKick = false;
    if(mode === 0){ doKick = (bar16===0||bar16===8); }
    else if(mode === 1){ doKick = (bar16===0||bar16===4||bar16===8||bar16===12); }
    else if(mode === 2){
      doKick = (bar16===0||bar16===4||bar16===8||bar16===12);
      if(bar16===2||bar16===10) doKick = rng()<0.55; // synco kick
      if(bar16===6||bar16===14) doKick = rng()<0.35;
    }
    else { doKick = rng() < (0.15 + inten*0.45); }

    if(doKick) ev.push({ tBeat, type:"kick", vel: velScale*(0.75 + rng()*0.25) });

    // ── SNARE ──
    let doSnare = false;
    if(mode === 0){ doSnare = (bar16===4||bar16===12); }
    else if(mode === 1){ doSnare = (bar16===4||bar16===12); }
    else if(mode === 2){
      doSnare = (bar16===4||bar16===12);
      // ghost snares on offbeats
      if(!doSnare && rng()<0.22) ev.push({ tBeat, type:"snare", vel: velScale*(0.18+rng()*0.18) });
    }
    else {
      doSnare = (bar16===4||bar16===12);
      if(rng() < 0.30) doSnare = !doSnare; // flip
      if(rng() < 0.18) ev.push({ tBeat, type:"snare", vel: velScale*(0.15+rng()*0.20) });
    }
    if(doSnare) ev.push({ tBeat, type:"snare", vel: velScale*(0.55+rng()*0.30) });

    // ── HAT ──
    let doHat = false;
    if(mode === 0){ doHat = (bar16%4===0); } // quarter notes only
    else if(mode === 1){ doHat = (bar16%2===0); } // 8th notes
    else if(mode === 2){
      doHat = true; // 16th notes
      // occasional 32nd burst on the & of 3
      if(bar16===9 && rng()<0.55)
        ev.push({ tBeat: tBeat+0.125, type:"hat", vel: velScale*(0.15+rng()*0.15) });
    }
    else {
      doHat = rng() < 0.70;
      if(doHat && rng()<0.30)
        ev.push({ tBeat: tBeat+0.125, type:"hat", vel: velScale*(0.12+rng()*0.18) });
    }
    if(doHat) ev.push({ tBeat, type:"hat", vel: velScale*(0.20+rng()*0.25) });
  }

  return ev.sort((a,b)=>a.tBeat-b.tBeat);
}

function beatToTime(tBeat){
  const six=Math.round(tBeat*4), bars=Math.floor(six/16), rem=six%16, q=Math.floor(rem/4), s=rem%4;
  return `${bars}:${q}:${s}`;
}

function stopParts(){
  if(partMelody){ partMelody.stop(); partMelody.dispose(); partMelody=null; }
  if(partDrums){ partDrums.stop(); partDrums.dispose(); partDrums=null; }
}

async function recompileAndApply(forceInstrument=false){
  syncUI(); buildKeyDots();
  if(!state.audioReady) return;

  Tone.Transport.bpm.rampTo(state.preset.music.tempo, 0.05);
  if(forceInstrument) setInstrument(state.preset.instrument);

  stopParts();

  const melody = compileMelody(state.preset);
  const drums  = compileDrums(state.preset);

  partMelody = new Tone.Part((time, e)=>{
    const midi = degreeToMidi(e.degree, e.oct, state.preset.music.key, state.preset.music.scale);
    const freq = midiToFreq(midi);
    // dur as seconds for synth voices (more reliable than Tone notation with custom voices)
    const bps = Tone.Transport.bpm.value / 60;
    const durSec = Math.max(0.05, e.durBeat / bps);
    synthVoice.triggerAttackRelease(freq, durSec, time, clamp(e.vel, 0.05, 1));
  }, melody.map(e=>[beatToTime(e.tBeat), e]));
  partMelody.loop = true;
  partMelody.loopEnd = "1:0:0";
  partMelody.start(0);

  partDrums = new Tone.Part((time, e)=>{
    const v = clamp(e.vel, 0.05, 1);
    if(e.type==="kick")  kick.triggerAttackRelease("C1","16n",time,v);
    if(e.type==="snare") snare.triggerAttackRelease("16n",time,v);
    if(e.type==="hat")   hat.triggerAttackRelease("16n",time,v);
  }, drums.map(e=>[beatToTime(e.tBeat), e]));
  partDrums.loop = true;
  partDrums.loopEnd = "1:0:0";
  partDrums.start(0);
}

/* =========================
   UI events — unchanged
========================= */
seedSelect.addEventListener("change", async(e)=>{
  const id = e.target.value;
  state.seedId = id;
  state.preset = structuredClone(SEEDS[id]);
  syncUI(); buildKeyDots();
  if(state.audioReady){
    if(drumGain) drumGain.gain.rampTo(state.preset.drums.enabled ? 1 : 0, 0.08);
    await recompileAndApply(true);
  }
});

lockBtn.addEventListener("click", ()=>{ state.preset.gen.lock = !state.preset.gen.lock; syncUI(); });

randomizeBtn.addEventListener("click", ()=>{
  if(state.preset.gen.lock) return;
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  const newSeed = buf[0] >>> 0;
  state.preset.gen.seed = newSeed;
  const rng = mulberry32((newSeed ^ 0x51C0FFEE) >>> 0);
  const shaped = (min,max,pow)=> min + (max-min)*Math.pow(rng(),pow);
  state.preset.gen.repeat    = shaped(0.05,0.85,1.10);
  state.preset.gen.alternate = shaped(0.00,0.75,1.25);
  state.preset.gen.shift     = shaped(0.00,0.80,1.25);
  state.preset.gen.harmony   = shaped(0.00,0.75,1.20);
  state.preset.gen.density   = shaped(0.10,0.90,0.90);
  state.preset.gen.chance    = shaped(0.00,0.55,1.35);
  state.preset.drums.intensity = shaped(0.00,0.55,1.15);
  state.preset.drums.variation = shaped(0.00,0.60,1.20);
  if(rng() < 0.35) state.preset.music.tempo = Math.round(shaped(78,128,1.2));
  if(rng() < 0.25) state.preset.music.scale = (rng()<0.5) ? "minor" : "dorian";
  syncUI();
  recompileAndApply();
});

tempoEl.addEventListener("input", ()=>{
  state.preset.music.tempo = parseInt(tempoEl.value,10);
  tempoVal.textContent = `${state.preset.music.tempo} BPM`;
  if(state.audioReady) Tone.Transport.bpm.rampTo(state.preset.music.tempo,0.05);
});

scaleSelect.addEventListener("change", ()=>{ state.preset.music.scale = scaleSelect.value; syncUI(); recompileAndApply(); });

macros.forEach(k=>{
  macroEls[k].addEventListener("input", ()=>{
    state.preset.gen[k] = parseFloat(macroEls[k].value);
    macroVals[k].textContent = state.preset.gen[k].toFixed(2);
    recompileAndApply();
  });
});

drumToggle.addEventListener("click", ()=>{
  state.preset.drums.enabled = !state.preset.drums.enabled;
  syncUI();
  if(state.audioReady && drumGain){
    const targetGain = state.preset.drums.enabled ? state.preset.drums.intensity : 0;
    drumGain.gain.rampTo(targetGain, 0.08);
  }
  recompileAndApply();
});

drumIntensity.addEventListener("input", ()=>{
  state.preset.drums.intensity = parseFloat(drumIntensity.value);
  drumIntensityVal.textContent = state.preset.drums.intensity.toFixed(2);
  // Intensity = gain on the drum bus (immediate, no recompile needed)
  if(state.audioReady && drumGain && state.preset.drums.enabled){
    drumGain.gain.rampTo(state.preset.drums.intensity, 0.06);
  }
  recompileAndApply();
});

drumVariation.addEventListener("input", ()=>{
  state.preset.drums.variation = parseFloat(drumVariation.value);
  drumVariationVal.textContent = state.preset.drums.variation.toFixed(2);
  recompileAndApply();
});

masterEl.addEventListener("input", ()=>{
  const v = parseFloat(masterEl.value);
  masterVal.textContent = v.toFixed(2);
  if(state.audioReady && master) master.gain.rampTo(v,0.08);
});

/* V5.2: UI states follow the actual transport and recording state. */
function syncTransportVisuals(){
  const isPlaying = !!(state.audioReady && Tone.Transport.state === "started");
  playBtn.classList.toggle("is-playing", isPlaying);
  playBtn.classList.toggle("primary", !isPlaying);
  playBtn.textContent = isPlaying ? "♫ Playing" : "▶ Play";
  playBtn.setAttribute("aria-pressed", String(isPlaying));
  recordBtn.classList.toggle("is-recording", !!state.recording);
  recordBtn.setAttribute("aria-pressed", String(!!state.recording));
  document.querySelector(".transport")?.classList.toggle("is-playing", isPlaying);
  document.querySelector(".transport")?.classList.toggle("is-recording", !!state.recording);
  const label = $("transportState");
  if(label) label.textContent = state.recording ? "Recording" : isPlaying ? "Playing" : "Ready";
}
playBtn.addEventListener("click", async()=>{
  await ensureAudio();
  await recompileAndApply();
  if(Tone.Transport.state !== "started") Tone.Transport.start();
  syncTransportVisuals();
});

stopBtn.addEventListener("click", ()=>{
  if(Tone.Transport.state !== "stopped") Tone.Transport.stop();
  syncTransportVisuals();
});

regenBtn.addEventListener("click", async()=>{
  if(!state.preset.gen.lock){
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    state.preset.gen.seed = buf[0] >>> 0;
  }
  await ensureAudio();
  await recompileAndApply();
  syncUI();
});

recordBtn.addEventListener("click", async()=>{
  await ensureAudio();
  if(!state.recording){
    state.recording = true;
    recordBtn.innerHTML = '<span class="record-led" aria-hidden="true"></span> Stop & Save';
    syncTransportVisuals();
    recorder.start();
    if(Tone.Transport.state !== "started"){ await recompileAndApply(); Tone.Transport.start(); }
    syncTransportVisuals();
  }else{
    state.recording = false;
    recordBtn.innerHTML = '<span class="record-led" aria-hidden="true"></span> Record';
    syncTransportVisuals();
    const blob = await recorder.stop();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `subdive-${state.seedId}-seed${state.preset.gen.seed}.webm`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url), 800);
  }
});

/* =========================
   Visuals — unchanged
========================= */
function setupCanvas(canvas){
  const ctx = canvas.getContext("2d", { alpha:true });
  function resize(){
    const dpr=Math.max(1,window.devicePixelRatio||1), rect=canvas.getBoundingClientRect();
    canvas.width=Math.max(1,Math.floor(rect.width*dpr)); canvas.height=Math.max(1,Math.floor(rect.height*dpr));
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  resize(); window.addEventListener("resize",resize);
  return { ctx, resize, canvas };
}
function bg(ctx,w,h){
  ctx.clearRect(0,0,w,h);
  const g=ctx.createLinearGradient(0,0,w,h);
  g.addColorStop(0,"rgba(161,238,105,0.055)"); g.addColorStop(1,"rgba(85,144,95,0.028)");
  ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
}
function seedRng(seed, salt){ return mulberry32(((seed ^ salt)>>>0)); }

const cRepeat = setupCanvas($("vizRepeat"));
const cAlt    = setupCanvas($("vizAlternate"));
const cShift  = setupCanvas($("vizShift"));
const cHar    = setupCanvas($("vizHarmony"));
const cDen    = setupCanvas($("vizDensity"));
const cCha    = setupCanvas($("vizChance"));
// The large ribbon has been removed from V5; original six modulation canvases remain.

function drawRepeat(t){
  const ctx=cRepeat.ctx,w=cRepeat.canvas.clientWidth,h=cRepeat.canvas.clientHeight;
  bg(ctx,w,h);
  const v=state.preset.gen.repeat,rng=seedRng(state.preset.gen.seed,0xA1),dup=Math.floor(v*5);
  for(let k=0;k<=dup;k++){
    const a=0.18+(k===0?0.32:0.16);
    ctx.fillStyle=`rgba(220,255,202,${a})`;
    for(let i=0;i<9;i++){
      const x=(i/8)*(w-10)+5+k*1.4,jitter=(rng()*2-1)*(1+v*3),y=h*0.5+Math.sin((i*0.9+t*2.1+k)*1.1)*(2+v*6)+jitter*0.35;
      ctx.beginPath(); ctx.arc(x,y,1.2+v*1.7,0,Math.PI*2); ctx.fill();
    }
  }
  ctx.strokeStyle="rgba(161,238,105,0.55)"; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(6,7); ctx.lineTo(6+(0.22+v*0.65)*w,7); ctx.stroke();
}
function drawAlt(t){
  const ctx=cAlt.ctx,w=cAlt.canvas.clientWidth,h=cAlt.canvas.clientHeight;
  bg(ctx,w,h);
  const v=state.preset.gen.alternate,speed=0.5+v*3.4,cells=10,phase=Math.floor(t*speed)%2;
  for(let i=0;i<cells;i++){
    const isA=((i+phase)%2===0),x0=(i/cells)*w,x1=((i+1)/cells)*w,a=0.12+v*0.40;
    ctx.fillStyle=isA?`rgba(161,238,105,${a})`:`rgba(85,153,99,${a})`;
    ctx.fillRect(x0+2,5,(x1-x0)-4,h-10);
  }
  const pulse=0.5+0.5*Math.sin(t*speed*2);
  ctx.strokeStyle=`rgba(220,255,202,${0.10+pulse*v*0.30})`; ctx.lineWidth=2; ctx.strokeRect(3,3,w-6,h-6);
}
function drawShift(t){
  const ctx=cShift.ctx,w=cShift.canvas.clientWidth,h=cShift.canvas.clientHeight;
  bg(ctx,w,h);
  const v=state.preset.gen.shift,shift=(Math.sin(t*1.2)*(0.5+v*0.5))*(w*0.26);
  ctx.strokeStyle="rgba(220,255,202,0.30)"; ctx.lineWidth=2; ctx.beginPath();
  for(let i=0;i<16;i++){
    const x=(i/15)*(w-10)+5+shift,y=h*0.5+Math.sin(t*2.1+i*0.65)*(2+v*7);
    if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
  }
  ctx.stroke();
  ctx.fillStyle="rgba(161,238,105,0.45)"; ctx.fillRect(w*0.5-1,4,2,h-8);
}
function drawHarmony(t){
  const ctx=cHar.ctx,w=cHar.canvas.clientWidth,h=cHar.canvas.clientHeight;
  bg(ctx,w,h);
  const v=state.preset.gen.harmony,rng=seedRng(state.preset.gen.seed,0xB4),cx=w*0.5,cy=h*0.5,spread=2+v*14;
  const g=ctx.createRadialGradient(cx,cy,2,cx,cy,spread*2.2);
  g.addColorStop(0,`rgba(85,153,99,${0.22+v*0.28})`); g.addColorStop(1,"rgba(0,0,0,0)");
  ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
  for(let i=0;i<14;i++){
    const ang=(rng()*Math.PI*2)+t*0.18,r=(0.2+rng()*0.8)*spread,x=cx+Math.cos(ang)*r,y=cy+Math.sin(ang)*r;
    ctx.fillStyle=`rgba(220,255,202,${0.14+v*0.36})`; ctx.beginPath(); ctx.arc(x,y,1.2+rng()*1.6,0,Math.PI*2); ctx.fill();
  }
  ctx.fillStyle="rgba(161,238,105,0.45)"; ctx.beginPath(); ctx.arc(cx,cy,2.0,0,Math.PI*2); ctx.fill();
}
function drawDensity(t){
  const ctx=cDen.ctx,w=cDen.canvas.clientWidth,h=cDen.canvas.clientHeight;
  bg(ctx,w,h);
  const v=state.preset.gen.density,rng=seedRng(state.preset.gen.seed,0xC5),target=Math.floor(4+v*28),cols=10,cellW=w/cols;
  let placed=0;
  for(let col=0;col<cols&&placed<target;col++){
    const cap=1+Math.floor((v*3.6)+rng()*2);
    for(let k=0;k<cap&&placed<target;k++){
      const x=(col+0.5)*cellW+(rng()*2-1)*cellW*0.12,y=h-6-k*5-(rng()*1.2),a=0.12+v*0.42;
      ctx.fillStyle=(col%2===0)?`rgba(161,238,105,${a})`:`rgba(85,153,99,${a})`;
      ctx.beginPath(); ctx.arc(x,y,1.6+v*1.3,0,Math.PI*2); ctx.fill(); placed++;
    }
  }
  ctx.fillStyle=`rgba(220,255,202,${0.08+v*0.22})`; ctx.fillRect(4,4,(w-8)*clamp(v,0,1),3);
}
function drawChance(t){
  const ctx=cCha.ctx,w=cCha.canvas.clientWidth,h=cCha.canvas.clientHeight;
  bg(ctx,w,h);
  const v=state.preset.gen.chance,seed=state.preset.gen.seed>>>0,tickRate=2+v*12,tick=Math.floor(t*tickRate);
  const rng=mulberry32((seed^0xD6^tick)>>>0),n=Math.floor(6+v*24);
  for(let i=0;i<n;i++){
    const x=rng()*w,y=rng()*h;
    if(rng()>(0.30+v*0.55)) continue;
    const a=0.08+v*0.45,size=1.0+rng()*2.4+v*1.2;
    ctx.fillStyle=(rng()<0.5)?`rgba(220,255,202,${a})`:`rgba(161,238,105,${a*0.9})`;
    ctx.beginPath(); ctx.arc(x,y,size,0,Math.PI*2); ctx.fill();
  }
  const pulse=0.5+0.5*Math.sin(t*(3+v*7));
  ctx.strokeStyle=`rgba(85,153,99,${0.06+pulse*v*0.28})`; ctx.lineWidth=2; ctx.strokeRect(3,3,w-6,h-6);
}
function drawRibbon(t){
  const ctx=cRibbon.ctx,w=cRibbon.canvas.clientWidth,h=cRibbon.canvas.clientHeight;
  ctx.clearRect(0,0,w,h);
  const g=ctx.createRadialGradient(w*0.35,h*0.45,10,w*0.5,h*0.5,Math.max(w,h));
  g.addColorStop(0,"rgba(141,217,176,0.14)"); g.addColorStop(1,"rgba(0,0,0,0)");
  ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
  const dens=state.preset.gen.density,ch=state.preset.gen.chance,rep=state.preset.gen.repeat,lines=7;
  for(let i=0;i<lines;i++){
    const phase=i*0.55,amp=(10+dens*26)*(0.65+i*0.06),speed=0.6+ch*2.1+i*0.05,y0=(i+1)/(lines+1)*h;
    ctx.lineWidth=2+rep*1.2;
    ctx.strokeStyle=(i%2===0)?`rgba(141,217,176,${0.10+dens*0.22})`:`rgba(177,167,146,${0.10+dens*0.22})`;
    ctx.beginPath();
    for(let x=0;x<=w;x+=8){
      const nx=x/w,wob=Math.sin((nx*6+t*speed+phase)*1.2)*amp,jit=Math.sin((nx*13+t*(speed*1.8)+phase)*2.0)*(ch*10),y=y0+wob+jit;
      if(x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.stroke();
  }
  const rng=seedRng(state.preset.gen.seed,0xEE),dots=8+Math.floor(dens*18);
  for(let i=0;i<dots;i++){
    const px=((t*(40+ch*120))+i*60)%(w+120)-60,lane=i%lines,y0=(lane+1)/(lines+1)*h,r=2+rng()*2+ch*2;
    ctx.fillStyle=`rgba(225,236,226,${0.10+ch*0.35})`;
    ctx.beginPath(); ctx.arc(px,y0+Math.sin((px/w*6+t)*1.8)*(8+dens*10),r,0,Math.PI*2); ctx.fill();
  }
}

let t0=performance.now();
function loop(now){
  const t=(now-t0)/1000;
  drawRepeat(t); drawAlt(t); drawShift(t); drawHarmony(t); drawDensity(t); drawChance(t);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
syncTransportVisuals();

/* =========================
   Init
========================= */
syncUI(); buildKeyDots();

["pointerdown","touchstart","keydown","mousedown"].forEach(ev=>{
  window.addEventListener(ev, async function once(){
    try{ await Tone.start(); await Tone.context.resume(); }catch(e){}
    window.removeEventListener(ev, once);
  }, {once:true,passive:true});
});

/* V5 — control presentation; audio events remain bound to the original IDs. */
function v5PaintRanges(){
  document.querySelectorAll('input[type="range"]').forEach(el=>{
    const v=(Number(el.value)-Number(el.min))/(Number(el.max)-Number(el.min))*100;
    el.style.background=`linear-gradient(to right,#a1ee69 0%,#a1ee69 ${v}%,#354a38 ${v}%,#354a38 100%)`;
  });
}
document.addEventListener('input',e=>{if(e.target.matches('input[type="range"]'))v5PaintRanges()});
const v5OldSyncUI=syncUI;
syncUI=function(){v5OldSyncUI();v5PaintRanges();};
v5PaintRanges();
