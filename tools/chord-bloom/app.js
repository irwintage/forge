/* CHRYSASYNTH / CHORD BLOOM
 * Converted from the Hostinger embedded code into an independent module.
 * Harmonic engine retained; audio DSP refactored into audio/engine.js. Requires Tone.js 14.8.49 and
 * LZ-String 1.5.0, loaded by index.html.
 */
(() => {
  'use strict';
  const root = document.getElementById('cb-app');
  if (!root) return;
  const getId = id => root.querySelector('#' + id);

/* ===== THEORY / SCALES ===== */
const NOTES=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

const SCALE_OFFSETS = {
  major:[0,2,4,5,7,9,11],
  minor:[0,2,3,5,7,8,10],
  harmMinor:[0,2,3,5,7,8,11],
  melodicMinor:[0,2,3,5,7,9,11],
  dorian:[0,2,3,5,7,9,10],
  phrygian:[0,1,3,5,7,8,10],
  phrygDom:[0,1,4,5,7,8,10],
  lydian:[0,2,4,6,7,9,11],
  mixolydian:[0,2,4,5,7,9,10],
  aeolian:[0,2,3,5,7,8,10],
  chromatic:[0,1,2,3,4,5,6]
};

const SCALE_NAMES = {
  major:"Major",
  minor:"Minor",
  harmMinor:"Harmonic Minor",
  melodicMinor:"Melodic Minor",
  dorian:"Dorian",
  phrygian:"Phrygian",
  phrygDom:"Phrygian Dom",
  lydian:"Lydian",
  mixolydian:"Mixolydian",
  aeolian:"Aeolian",
  chromatic:"Chromatic"
};

function scaleNoteIdx(keyIdx, scaleId, degree){
  const offs = SCALE_OFFSETS[scaleId] || SCALE_OFFSETS.major;
  const len = offs.length;
  const d = ((degree % len) + len) % len;
  return (keyIdx + offs[d]) % 12;
}

/* Roman helpers */
const ROMAN_INDEX = {
  "I":0,"ii":1,"iii":2,"IV":3,"V":4,"vi":5,"vii°":6,
  "i":0,"ii°":1,"III":2,"iv":3,"v":4,"VI":5,"VII":6,
  "bII":1,"bIII":2,"bVI":5,"bVII":6
};

function isMinorRoman(r){
  return r[0] === r[0].toLowerCase() || r.includes("°");
}

/* Interval helper (demi-tons entre deux classes de hauteur, 0-11) */
function ivl(fromPc, toPc){
  return ((toPc - fromPc) % 12 + 12) % 12;
}

/*
  Construit un accord (triade ou septième) à partir d'un chiffrage romain,
  en déduisant la qualité (maj/min/dim/aug, et maj7/dom7/m7/m7b5/dim7)
  directement des intervalles de la gamme choisie — pas de valeurs en dur.
*/
function chordFromRoman(keyIdx, scaleId, roman, use7th){
  const deg = (roman in ROMAN_INDEX) ? ROMAN_INDEX[roman] : 0;
  const rootPc    = scaleNoteIdx(keyIdx, scaleId, deg);
  const thirdPc   = scaleNoteIdx(keyIdx, scaleId, deg+2);
  const fifthPc   = scaleNoteIdx(keyIdx, scaleId, deg+4);
  const seventhPc = scaleNoteIdx(keyIdx, scaleId, deg+6);

  const t3 = ivl(rootPc, thirdPc);   // 3 = mineure, 4 = majeure
  const t5 = ivl(rootPc, fifthPc);   // 6 = dim, 7 = juste, 8 = aug
  const t7 = ivl(rootPc, seventhPc); // 9 = dim7, 10 = mineure(dom), 11 = majeure

  let triadQuality;
  if(t3===3 && t5===6) triadQuality="dim";
  else if(t3===4 && t5===8) triadQuality="aug";
  else if(t3===3) triadQuality="min";
  else triadQuality="maj";

  const rootName = NOTES[rootPc];
  let suffix;

  if(!use7th){
    suffix = triadQuality==="dim" ? "dim" : triadQuality==="aug" ? "aug" : triadQuality==="min" ? "m" : "";
  }else{
    if(triadQuality==="dim"){
      if(t7===9) suffix="dim7";
      else if(t7===10) suffix="m7b5"; // demi-diminué
      else suffix="dim7";
    }else if(triadQuality==="min"){
      suffix = (t7===11) ? "m(maj7)" : "m7";
    }else if(triadQuality==="aug"){
      suffix = (t7===11) ? "maj7(#5)" : "7(#5)";
    }else{ // majeur
      suffix = (t7===11) ? "maj7" : "7"; // 7 = dominante
    }
  }

  // Ascending closed voicing: avoid octave foldbacks that muddy the chord.
  const pcs=[rootPc,thirdPc,fifthPc,...(use7th?[seventhPc]:[])];
  const midi=[];
  for(const pc of pcs){
    let note=pc+60;
    while(midi.length && note<=midi[midi.length-1]) note+=12;
    midi.push(note);
  }

  return {
    name: rootName + suffix,
    degreeLabel: roman,
    midi
  };
}

/* ===== SEED LIBRARY ===== */
const SEED_LIBRARY = {
  celestial:{
    id:"celestial",
    label:"Celestial Blend",
    display:"🌱 Celestial Blend",
    key:"C",
    scale:"major",
    patterns:[
      ["I","V","vi","IV"]
    ],
    sound:{
      osc:"triangle",
      cut:6100,
      att:90,
      rel:1500,
      reverb:58,
      chorus:60
    }
  },
  shadow:{
    id:"shadow",
    label:"Shadow Bloom",
    display:"🌱 Shadow Bloom",
    key:"D",
    scale:"minor",
    patterns:[
      ["i","bVII","v","iv"]
    ],
    sound:{
      osc:"sawtooth",
      cut:2300,
      att:25,
      rel:800,
      reverb:34,
      chorus:22
    }
  },
  solar:{
    id:"solar",
    label:"Solar Flux",
    display:"🌱 Solar Flux",
    key:"F",
    scale:"major",
    patterns:[
      ["I","IV","I","V"]
    ],
    sound:{
      osc:"square",
      cut:5000,
      att:15,
      rel:650,
      reverb:20,
      chorus:12
    }
  },
  lunar:{
    id:"lunar",
    label:"Lunar Drift",
    display:"🌙 Lunar Drift",
    key:"E",
    scale:"mixolydian",
    patterns:[
      ["i","VI","III","VII"]
    ],
    sound:{
      osc:"triangle",
      cut:3800,
      att:75,
      rel:1800,
      reverb:72,
      chorus:45
    }
  },
  aether:{
    id:"aether",
    label:"Aether Pulse",
    display:"✧ Aether Pulse",
    key:"D",
    scale:"dorian",
    patterns:[
      ["i","IV","v","VII"]
    ],
    sound:{
      osc:"sawtooth",
      cut:4500,
      att:40,
      rel:1000,
      reverb:48,
      chorus:33
    }
  }
};

/* ===== STATE ===== */
let currentSeedId = "celestial";
let currentProg = [];
let lastPatternRoman = [];
let use7th = false;
let loopEnabled = true;
let audioReady=false;
let engine=null;
let recording=false, recordingTimer=null;
let vizRAF=null;
let bpm=100;
let strumMs=35;

/* Play / Stop avec Tone.Transport */
let isPlaying = false;
let scheduledEvents = [];

/* Share state */
let lastSharedUrl = '';
let cbShareTimer = null;

/* ===== SOUND PRESETS (right column) ===== */
const SOUND_PRESETS = {
  softKeys:{ cut:6500, att:40,  rel:900,  rev:35, chor:30, vol:-8, osc:"fatsawtooth" },
  widePad: { cut:5500, att:120, rel:1400, rev:55, chor:55, vol:-10,osc:"triangle" },
  pluck:   { cut:9000, att:5,   rel:220,  rev:18, chor:20, vol:-6, osc:"sawtooth" }
};

function setSoundUI(p){
  if(!p) return;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  const cut = clamp(Math.round(p.cut),500,12000);
  const att = clamp(Math.round(p.att),1,400);
  const rel = clamp(Math.round(p.rel),50,2000);
  const rev = clamp(Math.round(p.reverb ?? p.rev),0,100);
  const chor= clamp(Math.round(p.chorus ?? p.chor),0,100);
  const osc = p.osc || "fatsawtooth";

  getId('cp-cut').value = cut;
  getId('cp-cut-val').textContent = cut;
  getId('cp-att').value = att;
  getId('cp-att-val').textContent = att;
  getId('cp-rel').value = rel;
  getId('cp-rel-val').textContent = rel;
  getId('cp-reverb').value = rev;
  getId('cp-reverb-val').textContent = rev + "%";
  getId('cp-chorus').value = chor;
  getId('cp-chorus-val').textContent = chor + "%";
  getId('cp-osc').value = osc;
}

function applySoundPreset(name){
  if(name==="randomTone"){
    const keys=["softKeys","widePad","pluck"];
    const base=SOUND_PRESETS[keys[Math.floor(Math.random()*keys.length)]];
    const p={...base};
    p.cut += (Math.random()-0.5)*1500;
    p.att += (Math.random()-0.5)*40;
    p.rel += (Math.random()-0.5)*200;
    p.rev += (Math.random()-0.5)*10;
    p.chor+= (Math.random()-0.5)*10;
    p.vol += (Math.random()-0.5)*3;
    setSoundUI({
      cut:p.cut, att:p.att, rel:p.rel,
      reverb:p.rev, chorus:p.chor, vol:p.vol, osc:p.osc
    });
  }else{
    const base=SOUND_PRESETS[name];
    if(base){
      setSoundUI({
        cut:base.cut, att:base.att, rel:base.rel,
        reverb:base.rev, chorus:base.chor, vol:base.vol, osc:base.osc
      });
    }
  }
  if(audioReady) buildChain();
}

/* ===== SEED → sound ===== */
function applySeedSound(seed){
  if(!seed || !seed.sound) return;
  setSoundUI(seed.sound);
  if(audioReady) buildChain();
}

/* ===== RENDER ===== */
function renderChords(patternRoman, seedLabel){
  const wrap=getId('cp-chords');
  wrap.innerHTML='';
  currentProg.forEach((ch, idx)=>{
    const pill=document.createElement('div');
    pill.className='chordPill';
    pill.dataset.index = idx;
    pill.innerHTML = ch.name + '<span>'+ch.degreeLabel+'</span>';
    wrap.appendChild(pill);
  });
  const txtNames = currentProg.map(c=>c.name).join(' – ');
  const txtRoman = currentProg.map(x=>x.degreeLabel).join(' – ');
  getId('cp-output').textContent = txtRoman + "  —  " + txtNames;
  getId('cp-output-roman').textContent = patternRoman.join(' – ');
  const key = getId('cp-key').value;
  const scale = getId('cp-scale').value;
  const labelScale = SCALE_NAMES[scale] || scale;
  getId('cp-output-key').textContent =
    `Key: ${key} ${labelScale} · ${seedLabel}`;
}

/* ===== GENERATION ===== */
function generate(){
  const seed = SEED_LIBRARY[currentSeedId] || SEED_LIBRARY.celestial;

  const keySel = getId('cp-key').value;
  const scaleSel = getId('cp-scale').value;
  const keyIdx = NOTES.indexOf(keySel);

  const patterns = seed.patterns;
  const patternRoman = patterns[Math.floor(Math.random()*patterns.length)];
  lastPatternRoman = patternRoman.slice();

  currentProg = patternRoman.map(r => chordFromRoman(keyIdx, scaleSel, r, use7th));
  renderChords(patternRoman, seed.label);
}

/* Rebuild uniquement le voicing (ex: toggle 7th) sans tirer un nouveau pattern */
function rebuildCurrentVoicing(){
  if(!lastPatternRoman.length) return;
  const seed = SEED_LIBRARY[currentSeedId] || SEED_LIBRARY.celestial;
  const keyIdx = NOTES.indexOf(getId('cp-key').value);
  const scaleSel = getId('cp-scale').value;
  currentProg = lastPatternRoman.map(r => chordFromRoman(keyIdx, scaleSel, r, use7th));
  renderChords(lastPatternRoman, seed.label);
}

/* ===== AUDIO CHAIN: engine defined in audio/engine.js ===== */
function readSoundSettings(){
  return {
    osc:getId('cp-osc').value,
    cut:+getId('cp-cut').value,
    attack:+getId('cp-att').value/1000,
    release:+getId('cp-rel').value/1000,
    reverb:+getId('cp-reverb').value,
    chorus:+getId('cp-chorus').value,
    master:+getId('cp-master').value
  };
}
function buildChain(){
  if(!engine) engine=new window.ChordBloomAudioEngine();
  engine.configure(readSoundSettings());
}
function setMasterUI(value){
  const v=Math.max(-36,Math.min(0,Math.round(value)));
  getId('cp-master').value=v;
  getId('cp-master-val').textContent=(v<0?'−':'')+Math.abs(v)+' dB';
  if(engine)engine.setMaster(v);
}

/* AudioContext must only be unlocked after the user's first interaction. */
async function ensureAudio(){
  if(audioReady)return;
  await Tone.start();
  getId('cp-hint').textContent='Preparing audio space…';
  buildChain();
  await engine.ready();
  Tone.Transport.stop();
  Tone.Transport.cancel();
  audioReady=true;
  getId('cp-hint').textContent='Audio ready. Reverb and chorus are independent sends.';
  startVisualizer();
}

/* ===== HIGHLIGHT VISUEL (utile pour filmer une démo) ===== */
function highlightChord(index){
  const pills = root.querySelectorAll('#cp-chords .chordPill');
  pills.forEach(p=>{
    p.classList.toggle('playing', +p.dataset.index === index);
  });
}
function clearHighlight(){
  root.querySelectorAll('#cp-chords .chordPill.playing').forEach(p=>{
    p.classList.remove('playing');
  });
}

/* ===== PLAYBACK (Play / Stop via Transport) ===== */
function midiToNote(n){
  const name = NOTES[n%12];
  const oct = Math.floor(n/12)-1;
  return name + oct;
}

function scheduleProgression(forRender=false){
  if(!currentProg.length || !audioReady) return;

  Tone.Transport.cancel();
  Tone.Transport.position = 0;
  if(!forRender){
    scheduledEvents = [];
  }

  const beatsPerChord = 2;
  const secPerBeat = 60 / bpm;
  const chordDur = beatsPerChord * secPerBeat;
  const str = Math.max(0, strumMs)/1000;

  currentProg.forEach((ch, chordIndex)=>{
    const chordStart = chordIndex * chordDur;
    ch.midi.forEach((m, idx)=>{
      const eventTime = chordStart + idx*str;
      const id = Tone.Transport.schedule(time=>{
        const note = midiToNote(m);
        engine?.noteOn(note, chordDur*0.82, time);
      }, eventTime);
      if(!forRender){
        scheduledEvents.push(id);
      }
    });

    // Highlight visuel synchronisé (pratique pour filmer une démo)
    if(!forRender){
      const hlId = Tone.Transport.schedule(time=>{
        Tone.Draw.schedule(()=>{ highlightChord(chordIndex); }, time);
      }, chordStart);
      scheduledEvents.push(hlId);
    }
  });

  const totalDur = chordDur * currentProg.length;

  if(!forRender){
    if(loopEnabled){
      // Boucle native Tone.js : les événements déjà programmés dans
      // [loopStart, loopEnd] sont automatiquement rejoués, pas besoin
      // de reprogrammer quoi que ce soit.
      Tone.Transport.loop = true;
      Tone.Transport.loopStart = 0;
      Tone.Transport.loopEnd = totalDur;
    }else{
      Tone.Transport.loop = false;
      const endId = Tone.Transport.schedule(()=>{
        stopPlayback();
      }, totalDur + 0.1);
      scheduledEvents.push(endId);
    }
  }
}

function stopPlayback(resetButton){
  Tone.Transport.stop();
  Tone.Transport.cancel();
  Tone.Transport.loop = false;
  scheduledEvents = [];
  engine?.releaseAll();
  isPlaying = false;
  clearHighlight();
  const btn = getId('cp-play');
  if(btn && resetButton !== false){
    btn.textContent = 'Play';
  }
  if (btn) { btn.classList.remove('is-playing'); btn.setAttribute('aria-pressed','false'); }
  getId('cp-stop').disabled=true;
}

/* ===== RESPONSIVE OSCILLOSCOPE: visual auto gain (never affects audio) ===== */
let scopeDisplayGain=1;
let scopeSignalStrength=0;
let scopeResizeObserver=null;
function startVisualizer(){
  const canvas=getId('cp-scope');
  if(!canvas)return;
  const ctx=canvas.getContext('2d',{alpha:false});
  if(!ctx)return;
  if(vizRAF!==null){cancelAnimationFrame(vizRAF);vizRAF=null;}

  function draw(){
    // Reuse the real canvas dimensions: retina/sharp even when Forge resizes the panel.
    const rect=canvas.getBoundingClientRect();
    const w=Math.max(10,rect.width),h=Math.max(10,rect.height);
    const dpr=Math.min(2.5,window.devicePixelRatio||1);
    const pxW=Math.round(w*dpr),pxH=Math.round(h*dpr);
    if(canvas.width!==pxW||canvas.height!==pxH){canvas.width=pxW;canvas.height=pxH;}
    ctx.setTransform(dpr,0,0,dpr,0,0);

    // Dark instrument face; grid stays visible even before audio is unlocked.
    const bg=ctx.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#07131f'); bg.addColorStop(.5,'#081928'); bg.addColorStop(1,'#07131e');
    ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
    ctx.save();
    ctx.strokeStyle='rgba(104,163,197,.115)';ctx.lineWidth=.65;
    ctx.beginPath();
    for(let i=1;i<14;i++){
      const x=Math.round(w*i/14)+.5;
      ctx.moveTo(x,0);ctx.lineTo(x,h);
    }
    for(let j=1;j<6;j++){
      const y=Math.round(h*j/6)+.5;
      ctx.moveTo(0,y);ctx.lineTo(w,y);
    }
    ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,Math.round(h/2)+.5);ctx.lineTo(w,Math.round(h/2)+.5);
    ctx.strokeStyle='rgba(129,199,220,.24)';ctx.lineWidth=.85;ctx.stroke();
    ctx.restore();

    const values=engine?.analyser?.getValue?.();
    const hasBuffer=values && values.length>=32;
    let peak=0,energy=0;
    if(hasBuffer){
      for(let i=0;i<values.length;i++){
        const v=Number.isFinite(values[i])?values[i]:0;
        peak=Math.max(peak,Math.abs(v));energy+=v*v;
      }
      energy=Math.sqrt(energy/values.length);
    }
    const active=hasBuffer && peak>.002 && energy>.0006;
    // Only the DISPLAY is normalized. The master, dry signal, exports and
    // effect balances are untouched. A floor prevents noise from filling it.
    const desiredGain=active?Math.max(1,Math.min(42,.77/Math.max(peak,.012))):1;
    const speed=desiredGain<scopeDisplayGain?.23:.16;
    scopeDisplayGain+=(desiredGain-scopeDisplayGain)*speed;
    scopeSignalStrength+=(Math.min(1,energy*scopeDisplayGain*2.8)-scopeSignalStrength)*.16;
    if(!active){scopeSignalStrength*=.90;}

    const path=new Path2D();
    const amplitude=h*.44*scopeDisplayGain;
    const center=h/2;
    if(active){
      // Draw a continuous waveform instead of a column of min/max ticks.
      // Select an upward zero crossing to reduce horizontal phase jitter.
      const windowSize=Math.max(128,Math.min(values.length-64,Math.round(w*1.05),1250));
      let start=Math.max(0,Math.floor((values.length-windowSize)*.30));
      const scanEnd=Math.min(values.length-windowSize-1,start+Math.min(300,Math.round(windowSize*.4)));
      const slopeFloor=Math.max(.0003,energy*.025);
      for(let i=start+2;i<scanEnd;i++){
        const a=values[i-1],b=values[i];
        if(a<=0 && b>0 && b-a>slopeFloor){start=i;break;}
      }
      const denom=Math.max(1,windowSize-1);
      for(let i=0;i<windowSize;i++){
        const v=values[start+i];
        const x=i/denom*w;
        const y=center-Math.max(-1,Math.min(1,v*scopeDisplayGain))*h*.40;
        if(i===0)path.moveTo(x,y);else path.lineTo(x,y);
      }
    }else{
      path.moveTo(0,center);path.lineTo(w,center);
    }

    // Subtle phosphor bloom behind a crisp 1.5px trace, not a blurry canvas.
    ctx.save();ctx.lineJoin='round';ctx.lineCap='round';
    ctx.strokeStyle=active?'rgba(140,180,255,.26)':'rgba(96,156,188,.16)';
    ctx.lineWidth=5;ctx.shadowColor='#8cb7ff';ctx.shadowBlur=active?10:0;ctx.stroke(path);
    ctx.shadowBlur=0;
    const line=ctx.createLinearGradient(0,0,w,0);
    line.addColorStop(0,'#bda4ff');line.addColorStop(.52,'#8ef0ed');line.addColorStop(1,'#99b8fa');
    ctx.strokeStyle=active?line:'rgba(103,168,192,.42)';
    ctx.lineWidth=active?1.65:1.2;ctx.stroke(path);
    ctx.restore();

    // Small signal-health meter measures presence, not audible gain.
    const meterX=w-11,meterH=Math.min(62,h*.56),meterTop=(h-meterH)/2;
    ctx.fillStyle='rgba(116,160,193,.19)';ctx.fillRect(meterX,meterTop,3,meterH);
    const meterLevel=Math.max(0,Math.min(1,scopeSignalStrength));
    const meter=ctx.createLinearGradient(0,meterTop+meterH,0,meterTop);
    meter.addColorStop(0,'#68bde8');meter.addColorStop(1,'#b49cf5');
    ctx.fillStyle=meter;ctx.fillRect(meterX,meterTop+meterH*(1-meterLevel),3,meterH*meterLevel);
    vizRAF=engine && !engine.disposed ? requestAnimationFrame(draw) : null;
  }
  draw();
  // Resize while idle, and disconnect on Forge tool unload.
  if(!scopeResizeObserver && typeof ResizeObserver!=='undefined'){
    scopeResizeObserver=new ResizeObserver(()=>{
      if(vizRAF===null)draw();
    });
    scopeResizeObserver.observe(canvas);
  }
}

/* ===== REC: one progression, real browser audio format ===== */
async function exportWAV(){
  if(recording) return;
  const btn=getId('cp-wav');
  try{
    await ensureAudio();
    if(!currentProg.length) generate();
    if(isPlaying) stopPlayback();
    buildChain();
    const seconds=(60/bpm*2)*currentProg.length + 3.8;
    await engine.recorder.start();
    recording=true;
    btn.classList.add('recording');
    btn.innerHTML='<span class="rec-dot"></span> RECORDING';
    btn.disabled=true;
    getId('cp-hint').textContent='Recording one progression plus the complete reverb tail…';
    Tone.Transport.loop=false;
    scheduleProgression(true);
    Tone.Transport.bpm.value=bpm;
    Tone.Transport.start();
    recordingTimer=setTimeout(async()=>{
      try{
        const blob=await engine.recorder.stop();
        Tone.Transport.stop();Tone.Transport.cancel();
        engine?.releaseAll();
        const ext=blob.type.includes('ogg')?'ogg':blob.type.includes('mp4')?'mp4':'webm';
        const url=URL.createObjectURL(blob);
        const a=document.createElement('a');a.href=url;
        a.download=`chrysasynth-chord-bloom-${currentSeedId}-${getId('cp-key').value}.${ext}`;
        document.body.appendChild(a);a.click();a.remove();
        setTimeout(()=>URL.revokeObjectURL(url),30000);
        getId('cp-hint').textContent=`Audio captured as ${ext.toUpperCase()}. Ready for another take.`;
      }catch(err){console.error(err);getId('cp-hint').textContent='Recording failed. Check browser audio support.';}
      finally{ recording=false;recordingTimer=null;btn.disabled=false;btn.classList.remove('recording');btn.innerHTML='<span class="rec-dot"></span> REC'; }
    },seconds*1000);
  }catch(err){console.error(err);recording=false;btn.disabled=false;btn.classList.remove('recording');btn.innerHTML='<span class="rec-dot"></span> REC';getId('cp-hint').textContent='Recording unavailable in this browser.';}
}

/* ===== MIDI Export (type 0 with tempo metadata) ===== */
function vlq(number){let v=Math.max(0,Math.floor(number)),a=[v&127];while(v>>=7)a.unshift((v&127)|128);return a;}
function midiExport(){
  if(!currentProg.length) return;
  const bpmNow=+getId('cp-bpm').value;
  const ticksPerBeat=480, beatsPerChord=2;
  const events=[];
  for(let ci=0;ci<currentProg.length;ci++){
    const notes=currentProg[ci].midi;
    for(let ni=0;ni<notes.length;ni++){
      const at=Math.round(ci*beatsPerChord*ticksPerBeat+ni*strumMs/1000*bpmNow/60*ticksPerBeat);
      const off=Math.round((ci*beatsPerChord+beatsPerChord*.87)*ticksPerBeat);
      events.push({tick:at,p:1,bytes:[0x90,Math.min(127,notes[ni]),78]});
      events.push({tick:Math.max(at+15,off),p:0,bytes:[0x80,Math.min(127,notes[ni]),0]});
    }
  }
  events.sort((a,b)=>a.tick-b.tick||a.p-b.p);
  const tempo=Math.round(60000000/bpmNow);
  const track=[0,255,81,3,(tempo>>16)&255,(tempo>>8)&255,tempo&255];
  let last=0;
  for(const e of events){track.push(...vlq(e.tick-last),...e.bytes);last=e.tick;}
  track.push(0,255,47,0);
  const u32=n=>[(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255];
  const bytes=new Uint8Array([77,84,104,100,...u32(6),0,0,0,1,1,224,77,84,114,107,...u32(track.length),...track]);
  const url=URL.createObjectURL(new Blob([bytes],{type:'audio/midi'}));
  const a=document.createElement('a');a.href=url;a.download=`chrysasynth-chord-bloom-${currentSeedId}.mid`;
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
}

/* ===== SHARE ENGINE (Axis-like) ===== */

function getShareBaseUrl(){
  try{
    if(window.parent && window.parent !== window && window.parent.location){
      return window.parent.location.href.split("#")[0].split("?")[0];
    }
  }catch(e){}
  return window.location.href.split("#")[0].split("?")[0];
}
function getSearchParams(){
  let search='';
  try{
    if(window.parent && window.parent !== window && window.parent.location){
      search = window.parent.location.search || '';
    }else{
      search = window.location.search || '';
    }
  }catch(e){
    search = window.location.search || '';
  }
  return new URLSearchParams(search);
}

function encodeState(){
  const sound = {
    osc: getId('cp-osc').value,
    cut: +getId('cp-cut').value,
    att: +getId('cp-att').value,
    rel: +getId('cp-rel').value,
    reverb: +getId('cp-reverb').value,
    chorus: +getId('cp-chorus').value,
    master: +getId('cp-master').value
  };
  const state = {
    v:4,
    seedId: currentSeedId,
    key: getId('cp-key').value,
    scale: getId('cp-scale').value,
    bpm,
    strum: strumMs,
    use7th,
    loopEnabled,
    patternRoman: lastPatternRoman,
    sound
  };
  const json = JSON.stringify(state);
  let encoded;
  if(typeof LZString !== 'undefined' && LZString.compressToEncodedURIComponent){
    encoded = LZString.compressToEncodedURIComponent(json);
  }else{
    encoded = encodeURIComponent(btoa(json));
  }
  return encoded;
}

function decodeState(encoded){
  try{
    let json;
    if(typeof LZString !== 'undefined' && LZString.decompressFromEncodedURIComponent){
      json = LZString.decompressFromEncodedURIComponent(encoded);
    }else{
      json = atob(decodeURIComponent(encoded));
    }
    if(!json) return null;
    return JSON.parse(json);
  }catch(e){
    console.warn("Invalid shared state", e);
    return null;
  }
}

function applySharedState(st){
  if(!st) return;
  if(st.key)   getId('cp-key').value = st.key;
  if(st.scale) getId('cp-scale').value = st.scale;

  if(typeof st.bpm === 'number'){
    bpm = st.bpm;
    getId('cp-bpm').value = bpm;
    getId('cp-bpm-val').textContent = bpm;
    if(Tone.Transport) Tone.Transport.bpm.value = bpm;
  }
  if(typeof st.strum === 'number'){
    strumMs = st.strum;
    getId('cp-strum').value = strumMs;
    getId('cp-strum-val').textContent = strumMs;
  }

  if(typeof st.use7th === 'boolean'){
    use7th = st.use7th;
    getId('cp-7th').checked = use7th;
  }
  if(typeof st.loopEnabled === 'boolean'){
    loopEnabled = st.loopEnabled;
    getId('cp-loop').checked = loopEnabled;
  }

  if(st.sound){
    setSoundUI(st.sound);
    if(Number.isFinite(st.sound.master))setMasterUI(st.sound.master);
    else if(Number.isFinite(st.sound.vol))setMasterUI(st.sound.vol); // legacy V3 links
  }

  if(st.seedId && SEED_LIBRARY[st.seedId]){
    currentSeedId = st.seedId;
  }

  root.querySelectorAll('#cp-seeds .seedChip').forEach(btn=>{
    btn.classList.toggle('active', btn.dataset.seed === currentSeedId);
  });

  const keyIdx = NOTES.indexOf(getId('cp-key').value);
  const scaleId = getId('cp-scale').value;
  const seed = SEED_LIBRARY[currentSeedId] || SEED_LIBRARY.celestial;

  lastPatternRoman = Array.isArray(st.patternRoman) && st.patternRoman.length
    ? st.patternRoman.slice()
    : (seed.patterns[0] || ["I","V","vi","IV"]);

  currentProg = lastPatternRoman.map(r => chordFromRoman(keyIdx, scaleId, r, use7th));
  renderChords(lastPatternRoman, seed.label);
}

function createShareUrl(){
  const encoded = encodeState();
  const base = getShareBaseUrl();
  const sep = base.includes("?") ? "&" : "?";
  return base + sep + "cb=" + encoded;
}

function showShareToast(copied){
  const toast = getId('cb-share-toast');
  const titleEl = getId('cb-share-title');
  const subEl = getId('cb-share-sub');
  if(!toast) return;

  clearTimeout(cbShareTimer);

  if(copied){
    if(titleEl) titleEl.textContent = 'Seed link copied';
    if(subEl)   subEl.textContent = 'Share this link to recall the same progression.';
  }else{
    if(titleEl) titleEl.textContent = 'Link ready (copy failed)';
    if(subEl)   subEl.textContent = 'Copy might be blocked. Use “Copy again” or “Open preview”.';
  }

  toast.classList.add('show');
  cbShareTimer = setTimeout(()=>{
    toast.classList.remove('show');
  },4000);
}

function tryLoadShared(){
  const params = getSearchParams();
  const encoded = params.get("cb");
  if(!encoded) return;
  const st = decodeState(encoded);
  if(st) applySharedState(st);
}

/* ===== EVENTS ===== */
getId('cp-gen').addEventListener('click',()=>{
  if(isPlaying){
    stopPlayback();
  }
  generate();
});

getId('cp-rand').addEventListener('click',()=>{
  getId('cp-key').value=NOTES[Math.floor(Math.random()*NOTES.length)];
  const scaleKeys = Object.keys(SCALE_OFFSETS);
  getId('cp-scale').value=scaleKeys[Math.floor(Math.random()*scaleKeys.length)];
  if(isPlaying){
    stopPlayback();
  }
  generate();
});

getId('cp-bpm').addEventListener('input',e=>{
  bpm=+e.target.value;
  getId('cp-bpm-val').textContent=bpm;
  if(Tone.Transport){
    Tone.Transport.bpm.value = bpm;
  }
});
getId('cp-strum').addEventListener('input',e=>{
  strumMs=+e.target.value;
  getId('cp-strum-val').textContent=strumMs;
});

// Times on Tone.Transport are scheduled in seconds, so an existing schedule
// needs rebuilding when tempo or strum changes (on slider release).
function restartScheduleAtNewTempo(){
  if(!isPlaying || recording)return;
  stopPlayback();
  scheduleProgression(false);
  Tone.Transport.bpm.value=bpm;
  Tone.Transport.start();
  isPlaying=true;
  const btn=getId('cp-play');btn.textContent='Playing';btn.classList.add('is-playing');btn.setAttribute('aria-pressed','true');
  getId('cp-stop').disabled=false;
}
getId('cp-bpm').addEventListener('change',restartScheduleAtNewTempo);
getId('cp-strum').addEventListener('change',restartScheduleAtNewTempo);

getId('cp-key').addEventListener('change',()=>{
  if(isPlaying){
    stopPlayback();
  }
  generate();
});
getId('cp-scale').addEventListener('change',()=>{
  if(isPlaying){
    stopPlayback();
  }
  generate();
});

/* Toggle 7th chords : recalcule juste le voicing, garde le pattern romain actuel */
getId('cp-7th').addEventListener('change',e=>{
  use7th = e.target.checked;
  if(isPlaying)stopPlayback();
  rebuildCurrentVoicing();
});

/* Toggle Loop : si ça joue déjà, on relance proprement avec le nouveau mode */
getId('cp-loop').addEventListener('change',e=>{
  loopEnabled = e.target.checked;
  if(isPlaying){
    stopPlayback(false);
    scheduleProgression(false);
    Tone.Transport.bpm.value = bpm;
    Tone.Transport.start();
    isPlaying = true;
    getId('cp-play').textContent = 'Playing';
    getId('cp-play').classList.add('is-playing');
    getId('cp-play').setAttribute('aria-pressed','true');
    getId('cp-stop').disabled=false;
  }
});

/* Transport: explicit Play and Stop (Fibonacci layout) */
getId('cp-play').addEventListener('click',async ()=>{
  if(isPlaying || recording) return;
  try{
    await ensureAudio();
    if(!currentProg.length)generate();
    scheduleProgression(false);
    Tone.Transport.bpm.value=bpm;
    Tone.Transport.start();
    isPlaying=true;
    const play=getId('cp-play');
    play.textContent='Playing';play.classList.add('is-playing');play.setAttribute('aria-pressed','true');
    getId('cp-stop').disabled=false;
  }catch(e){console.error(e);getId('cp-hint').textContent='Could not start audio. Check browser permissions.';}
});
getId('cp-stop').addEventListener('click',()=>{if(isPlaying)stopPlayback();});
getId('cp-midi').addEventListener('click',midiExport);

/* WAV button */
getId('cp-wav').addEventListener('click',exportWAV);

/* Master in the top-right header: independent of sound presets and Seeds. */
getId('cp-master').addEventListener('input',e=>setMasterUI(+e.target.value));

/* Sound sliders */
["cp-osc","cp-cut","cp-att","cp-rel","cp-chorus","cp-reverb"].forEach(id=>{
  const el=getId(id);
  el.addEventListener('input',()=>{
    if(id==="cp-cut")   getId('cp-cut-val').textContent = el.value;
    if(id==="cp-att")   getId('cp-att-val').textContent = el.value;
    if(id==="cp-rel")   getId('cp-rel-val').textContent = el.value;
    if(id==="cp-chorus")getId('cp-chorus-val').textContent = el.value + "%";
    if(id==="cp-reverb")getId('cp-reverb-val').textContent = el.value + "%";
    if(audioReady) buildChain();
  });
});

getId('cp-reset').addEventListener('click',()=>{
  setSoundUI(SOUND_PRESETS.softKeys);
  if(audioReady) buildChain();
});

/* Seed chips */
root.querySelectorAll('#cp-seeds .seedChip').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const id = btn.dataset.seed;
    if(!SEED_LIBRARY[id]) return;
    currentSeedId = id;
    root.querySelectorAll('#cp-seeds .seedChip').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');

    const seed = SEED_LIBRARY[id];
    getId('cp-key').value = seed.key;
    getId('cp-scale').value = seed.scale;

    if(isPlaying){
      stopPlayback();
    }
    applySeedSound(seed);
    generate();
  });
});

/* Share button */
getId('cp-share').addEventListener('click',()=>{
  const url = createShareUrl();
  lastSharedUrl = url;

  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(url)
      .then(()=>{ showShareToast(true); })
      .catch(()=>{ showShareToast(false); });
  }else{
    showShareToast(false);
  }
});

/* Toast buttons */
getId('cb-share-copy').addEventListener('click',()=>{
  if(!lastSharedUrl) return;
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(lastSharedUrl).catch(()=>{});
  }
});
getId('cb-share-open').addEventListener('click',()=>{
  if(!lastSharedUrl) return;
  window.open(lastSharedUrl,'_blank','noopener');
});

/* sound presets buttons */
root.querySelectorAll('.sdPreset').forEach(btn=>{
  btn.addEventListener('click',()=>{
    root.querySelectorAll('.sdPreset').forEach(b=>b.classList.remove('active'));
    if(btn.dataset.preset!=="randomTone"){
      btn.classList.add('active');
    }
    applySoundPreset(btn.dataset.preset);
  });
});

/* Init */
setMasterUI(-12);
setSoundUI(SOUND_PRESETS.softKeys);
getId('cp-key').value = SEED_LIBRARY.celestial.key;
getId('cp-scale').value = SEED_LIBRARY.celestial.scale;
applySeedSound(SEED_LIBRARY.celestial);
generate();
tryLoadShared();
startVisualizer();


// Future Forge tool-manager integration: call stop() or destroy() before switching tools.
// This is a basic lifecycle bridge, not yet a complete Knot-style Shadow DOM loader.
function destroyChordBloom() {
  try { stopPlayback(); } catch (e) { console.warn('Chord Bloom stop:', e); }
  if (vizRAF != null) { cancelAnimationFrame(vizRAF); vizRAF = null; }
  if (scopeResizeObserver) { scopeResizeObserver.disconnect(); scopeResizeObserver=null; }
  if (cbShareTimer != null) { clearTimeout(cbShareTimer); cbShareTimer = null; }
  if(recordingTimer != null){clearTimeout(recordingTimer);recordingTimer=null;}
  if(recording && engine){try{engine.recorder.stop();}catch(e){}}
  recording=false;
  engine?.dispose();
  engine=null;
  audioReady = false;
  window.removeEventListener('pagehide', stopPlayback);
  if (window.ForgeChordBloom?.destroy === destroyChordBloom) delete window.ForgeChordBloom;
}
window.ForgeChordBloom = { stop: stopPlayback, destroy: destroyChordBloom };
window.addEventListener('pagehide', stopPlayback);
})();
