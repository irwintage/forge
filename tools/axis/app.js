
const $ = s => document.querySelector(s);
const statusEl = $("#engineStatus");
function status(msg){ if(statusEl) statusEl.textContent = msg; }
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));

/* ROOT & SCALE */
function getRootMidi(){
  const note = $('#rootNote').value;
  const oct  = parseInt($('#rootOct').value,10);
  const map = {C:0,'C#':1,D:2,'D#':3,E:4,F:5,'F#':6,G:7,'G#':8,A:9,'A#':10,B:11};
  return (oct+1)*12 + map[note];
}
let root = getRootMidi();
let scale = [0,2,3,5,7,8,10];
let range = 24;

/* PATTERNS A / B */
const makeEmptySteps = ()=>Array.from({length:16}, ()=>({row:null, acc:false, sli:false}));
const patterns = { A: makeEmptySteps(), B: makeEmptySteps() };
let currentBank = 'A';
let steps = patterns[currentBank];
let autoChain = false;

/* GLOBAL FLAGS */
let drumLock = false;
let currentSeedId = 'none';
let lastSharedUrl = '';

/* BUILD SEQ */
const seqEl = $('#seq');

function buildSeq(){
  seqEl.innerHTML='';
  for(let c=0;c<16;c++){
    const col=document.createElement('div');
    col.className='col';
    col.dataset.step=String(c+1).padStart(2,'0');

    for(let r=0;r<12;r++){
      const cell=document.createElement('div');
      cell.className='cell';
      cell.dataset.col=c;
      cell.dataset.row=r;
      cell.addEventListener('click',()=>{
        const st = steps[c];
        st.row = (st.row===r)? null : r;
        redrawCol(c);
      });
      col.appendChild(cell);
    }

    const play=document.createElement('div');
    play.className='play';
    col.appendChild(play);

    const flags=document.createElement('div');
    flags.className='stepFlags';

    const acc=document.createElement('div');
    acc.className='dotFlag acc';
    acc.title='Accent';
    acc.addEventListener('click',e=>{
      e.stopPropagation();
      const st = steps[c];
      st.acc=!st.acc;
      acc.classList.toggle('on', st.acc);
    });

    const sli=document.createElement('div');
    sli.className='dotFlag sli';
    sli.title='Slide';
    sli.addEventListener('click',e=>{
      e.stopPropagation();
      const st = steps[c];
      st.sli=!st.sli;
      sli.classList.toggle('on', st.sli);
    });

    flags.appendChild(acc);
    flags.appendChild(sli);
    col.appendChild(flags);

    seqEl.appendChild(col);
  }
}
function redrawCol(c){
  const colEl = seqEl.children[c];
  const st = steps[c];
  for(let r=0;r<12;r++){
    colEl.children[r].classList.toggle('on', st.row===r);
  }
  const flags = colEl.querySelectorAll('.dotFlag');
  if(flags.length===2){
    flags[0].classList.toggle('on', st.acc);
    flags[1].classList.toggle('on', st.sli);
  }
}
buildSeq();
const playEls = document.querySelectorAll('.play');

/* Seed pattern A par défaut (simple) */
for(let i=0;i<16;i++){
  const st = patterns.A[i];
  if(i%2===0) st.row = [6, 5, 7, 5, 6, 4, 7, 5][i/2];
  if(i===7 || i===15) st.sli = true;
  if(i%8===4) st.acc = true;
}
patterns.B = patterns.A.map(s=>({...s}));
steps = patterns[currentBank];
for(let c=0;c<16;c++) redrawCol(c);

/* A/B toggle */
document.querySelectorAll('.abBtn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const bank = btn.dataset.bank;
    if(bank === currentBank) return;
    currentBank = bank;
    steps = patterns[currentBank];
    document.querySelectorAll('.abBtn').forEach(b=>{
      b.classList.toggle('active', b.dataset.bank === bank);
    });
    for(let c=0;c<16;c++) redrawCol(c);
  });
});

/* LOCK auto A/B */
$('#lockToggle').addEventListener('click',()=>{
  autoChain = !autoChain;
  $('#lockToggle').classList.toggle('on', autoChain);
});

/* DRUMS */
const kickPat=new Array(16).fill(0),
      snarePat=new Array(16).fill(0),
      hatsPat=new Array(16).fill(0);
for(let i=0;i<16;i++){
  kickPat[i]=(i%4===0)?1:0;
  snarePat[i]=(i%8===4)?1:0;
  hatsPat[i]=(i%2===0)?1:0;
}
function buildLane(id, arr){
  const wrap=$(id);
  wrap.innerHTML='';
  for(let i=0;i<16;i++){
    const s=document.createElement('div');
    s.className='dstep'+(arr[i]?' on':'');
    s.addEventListener('click',()=>{
      arr[i]=arr[i]?0:1;
      s.classList.toggle('on');
    });
    wrap.appendChild(s);
  }
}
buildLane('#kick',kickPat);
buildLane('#snare',snarePat);
buildLane('#hats',hatsPat);

/* DRUM LOCK */
$('#drumLock').addEventListener('click',()=>{
  drumLock = !drumLock;
  $('#drumLock').classList.toggle('on', drumLock);
});

/* NOTE MAP */
function noteFor(row){
  const target = root + clamp((6-row)*2, -range, range);
  const allowed = new Set(scale.map(n => ((n % 12)+12)%12));
  let best = root, bestDist = Infinity;
  for(let midi = Math.max(12, target-12); midi <= Math.min(119, target+12); midi++){
    const degree = ((midi - root) % 12 + 12) % 12;
    if(!allowed.has(degree)) continue;
    const d = Math.abs(midi-target);
    if(d < bestDist){ best = midi; bestDist = d; }
  }
  return best;
}

/* AUDIO + RECORD */
let started=false, tick=0, tickEvt=null;
let synth, synthGain, drive, filter, delayFX, reverb, master, drumGain;
let kick, snr, hat;
let recorder=null;
let isRecording=false;

async function buildChain(){
  master = new Tone.Gain(0.9).toDestination();

  recorder = new Tone.Recorder();
  master.connect(recorder);

  synthGain = new Tone.Gain(Tone.dbToGain(parseInt($('#svol').value,10)));

  drive = new Tone.Distortion(0.25);
  filter = new Tone.Filter(1600,"lowpass");

  delayFX = new Tone.PingPongDelay({
    delayTime:"8n",
    feedback:0.25,
    wet: parseFloat($('#delay').value)
  });

  reverb = new Tone.Reverb({
    decay:2.2,
    preDelay:0.02,
    wet:0.25
  });

  const envMod = parseFloat($('#env').value)||0.35;

  synth = new Tone.MonoSynth({
    oscillator:{ type: $('#wave').value },
    envelope:{ attack:0.01, decay:0.25, sustain:0.0, release:0.14 },
    filter:{ type:"lowpass", frequency: parseFloat($('#cut').value), rolloff:-24 },
    filterEnvelope:{
      attack:0.01,
      decay:0.18,
      sustain:0.0,
      release:0.02,
      baseFrequency:200,
      octaves:2 + envMod*3
    },
    portamento:0.04
  });

  synth.connect(drive);
  drive.connect(filter);
  filter.connect(synthGain);

  synthGain.connect(master);
  synthGain.connect(delayFX);
  synthGain.connect(reverb);

  delayFX.connect(master);
  reverb.connect(master);

  drumGain = new Tone.Gain(Tone.dbToGain(parseInt($('#dvol').value,10))).connect(master);

  kick = new Tone.MembraneSynth({
    pitchDecay:0.03,
    octaves:4,
    envelope:{attack:0.001, decay:0.25, sustain:0}
  }).connect(drumGain);

  snr  = new Tone.NoiseSynth({
    noise:{type:'white'},
    envelope:{ attack:0.001, decay:0.18, sustain:0 }
  }).connect(drumGain);

  hat  = new Tone.MetalSynth({
    frequency:400,
    envelope:{ attack:0.001, decay:0.12, release:0.03 },
    harmonicity:5.1,
    modulationIndex:32,
    resonance:5000,
    octaves:1.5,
    volume:-4
  }).connect(drumGain);
}

function schedule(){
  if(tickEvt){
    Tone.Transport.clear(tickEvt);
    tickEvt=null;
  }
  tick = 0;

  tickEvt = Tone.Transport.scheduleRepeat((time)=>{
    const i = tick % 16;
    const s = patterns[currentBank][i];

    // playhead
    Tone.Draw.schedule(()=>{
      playEls.forEach((p,idx)=>{
        p.style.display = (idx===i)?'block':'none';
      });
    }, time);

    // melodic
    if(s && s.row !== null){
      const midi = noteFor(s.row);

      const baseCut   = parseFloat($('#cut').value)   || 1600;
      const baseRes   = parseFloat($('#res').value)   || 0.9;
      const envMod    = parseFloat($('#env').value)   || 0.35;
      const baseDrive = parseFloat($('#drive').value) || 0.25;

      const isAccent = !!s.acc;
      const vel      = isAccent ? 1.0 : 0.6;

      const accentCut = baseCut * 2.4;
      const accentRes = baseRes * 2.2;
      const accentDrv = baseDrive + 0.18;

      if(filter){
        filter.frequency.rampTo(isAccent ? accentCut : baseCut * 0.9, 0.02);
        filter.Q.rampTo(isAccent ? accentRes : baseRes, 0.02);
      }
      if(drive){
        drive.distortion = isAccent ? Math.min(0.9, accentDrv) : baseDrive;
      }
      if(synth){
        synth.oscillator.type = $('#wave').value;
        synth.filterEnvelope.octaves = 2 + envMod * 3;
      }

      const prevIndex = (i + 15) % 16;
      const prevStep  = patterns[currentBank][prevIndex];
      const hasPrev   = prevStep && prevStep.row !== null;
      const isSlideFromPrev = s.sli && hasPrev;
      // Slide means glide from the previous note, without leaving a held note behind.
      synth.portamento = isSlideFromPrev ? 0.085 : 0.008;
      synth.triggerAttackRelease(Tone.Frequency(midi,"midi"), "16n", time, vel);
    }

    // drums
    if(kickPat[i])  kick.triggerAttackRelease("C1","16n", time, 0.95);
    if(snarePat[i]) snr.triggerAttackRelease("8n", time, 0.6);
    if(hatsPat[i])  hat.triggerAttackRelease("C6","16n", time, 0.7);

    tick++;

    // auto A/B
    if(autoChain && tick % 16 === 0){
      currentBank = (currentBank === 'A') ? 'B' : 'A';
      steps = patterns[currentBank];
      Tone.Draw.schedule(()=>{
        document.querySelectorAll('.abBtn').forEach(b=>{
          b.classList.toggle('active', b.dataset.bank === currentBank);
        });
        for(let c=0;c<16;c++) redrawCol(c);
      }, time);
    }
  }, "16n");
}

/* XY */
const xy = $('#xy');
const xyCtx = xy.getContext('2d');
let mx=0.25, my=0.5;
function drawXY(){
  const w = xy.width  = xy.clientWidth;
  const h = xy.height = xy.clientHeight;
  xyCtx.clearRect(0,0,w,h);
  xyCtx.strokeStyle='rgba(255,255,255,.1)';
  xyCtx.lineWidth=1;
  for(let i=1;i<4;i++){
    const x=w*i/4;
    xyCtx.beginPath(); xyCtx.moveTo(x,0); xyCtx.lineTo(x,h); xyCtx.stroke();
  }
  for(let i=1;i<4;i++){
    const y=h*i/4;
    xyCtx.beginPath(); xyCtx.moveTo(0,y); xyCtx.lineTo(w,y); xyCtx.stroke();
  }
  const x = mx*w;
  const y = (1-my)*h;
  const g = xyCtx.createRadialGradient(x,y,3,x,y,22);
  g.addColorStop(0,'#fff');
  g.addColorStop(1,'rgba(255,255,255,0)');
  xyCtx.fillStyle=g;
  xyCtx.beginPath();
  xyCtx.arc(x,y,7,0,Math.PI*2);
  xyCtx.fill();
}
function applyXY(){
  const mix = mx;
  const dec = 0.5 + my*6.0;
  $('#xyLabel').textContent = `Mix ${mix.toFixed(2)} • Decay ${dec.toFixed(2)}s`;
  if(reverb){
    reverb.wet.value = mix;
    reverb.decay = dec;
  }
}
function handleXYEvent(e){
  const r = xy.getBoundingClientRect();
  mx = clamp((e.clientX - r.left)/r.width, 0, 1);
  my = clamp(1 - (e.clientY - r.top)/r.height, 0, 1);
  drawXY();
  applyXY();
}
xy.addEventListener('pointerdown',e=>{
  handleXYEvent(e);
  xy.setPointerCapture(e.pointerId);
});
xy.addEventListener('pointermove',e=>{
  if(e.buttons!==1) return;
  handleXYEvent(e);
});
xy.addEventListener('pointerup',e=>{
  xy.releasePointerCapture(e.pointerId);
});
window.addEventListener('resize',drawXY);
drawXY();
applyXY();

/* TRANSPORT */
$('#start').addEventListener('click',async()=>{
  if(typeof Tone === 'undefined'){
    status('AUDIO LIBRARY UNAVAILABLE · CHECK CONNECTION');
    return;
  }
  if(!started){
    try{ await Tone.start(); await buildChain(); }
    catch(err){ console.error(err); status('AUDIO COULD NOT START'); return; }
    schedule();
    Tone.Transport.bpm.value=parseInt($('#bpm').value,10);
    Tone.Transport.swingSubdivision='16n';
    Tone.Transport.swing=parseInt($('#swing').value,10)/100;
    Tone.Transport.start();
    started=true;
    $('#start').textContent='Pause';
    status('PLAYING · 125 BPM');
  }else{
    if(Tone.Transport.state==='started'){
      Tone.Transport.pause();
      $('#start').textContent='Play'; status('PAUSED');
    }else{
      Tone.Transport.start();
      $('#start').textContent='Pause'; status('PLAYING');
    }
  }
});

window.addEventListener('keydown',e=>{
  if(e.code==='Space' && !['INPUT','SELECT','TEXTAREA','BUTTON'].includes(document.activeElement.tagName)){
    e.preventDefault();
    $('#start').click();
  }
});

$('#bpm').addEventListener('input',e=>{
  const v=e.target.value;
  $('#bpmVal').textContent=v;
  if(started) Tone.Transport.bpm.value=parseInt(v,10);
  if(started && Tone.Transport.state==='started') status('PLAYING · '+v+' BPM');
});
$('#swing').addEventListener('input',e=>{
  const v=e.target.value;
  $('#swingVal').textContent=v+'%';
  if(started) Tone.Transport.swing=parseInt(v,10)/100;
});
$('#delay').addEventListener('input',e=>{
  const v=e.target.value;
  $('#delayVal').textContent=v;
  if(delayFX) delayFX.wet.value=parseFloat(v);
});

$('#scale').addEventListener('change',e=>{
  const val = e.target.value;
  if(val === 'chromatic'){
    scale = [...Array(12).keys()];
  }else{
    scale=val.split(',').map(n=>parseInt(n,10));
  }
});
$('#rootNote').addEventListener('change',()=>{root=getRootMidi();});
$('#rootOct').addEventListener('change',()=>{root=getRootMidi();});
$('#range').addEventListener('change',e=>{
  range=parseInt(e.target.value,10);
});

$('#dvol').addEventListener('input',e=>{
  const v=e.target.value;
  $('#dvolVal').textContent=v+' dB';
  if(drumGain) drumGain.gain.value=Tone.dbToGain(parseInt(v,10));
});
$('#svol').addEventListener('input',e=>{
  const v = parseInt(e.target.value,10);
  if(synthGain) synthGain.gain.value = Tone.dbToGain(v);
});

/* Live tweaks */
['cut','res','env','drive','wave'].forEach(id=>{
  $('#'+id).addEventListener('input',()=>{
    if(!synth || !filter || !drive) return;
    const baseCut = parseFloat($('#cut').value)||1600;
    const baseRes = parseFloat($('#res').value)||0.9;
    const envMod  = parseFloat($('#env').value)||0.35;
    filter.frequency.value = baseCut;
    filter.Q.value = baseRes;
    synth.filterEnvelope.octaves = 2 + envMod*3;
    drive.distortion = parseFloat($('#drive').value)||0.25;
    synth.oscillator.type = $('#wave').value;
  });
});

/* RANDOM */
$('#dice').addEventListener('click',()=>{
  // basse
  for(let i=0;i<16;i++){
    const prob=Math.random();
    const st = steps[i];
    st.row = (prob>0.35)?Math.floor(Math.random()*12):null;
    st.acc = Math.random()<0.35;
    st.sli = Math.random()<0.25;
    redrawCol(i);
  }

  // drums (si non lock)
  if(!drumLock){
    for(let i=0;i<16;i++){
      kickPat[i]=(i%4===0)?1:(Math.random()<0.12?1:0);
      snarePat[i]=(i%8===4)?1:(Math.random()<0.16?1:0);
      hatsPat[i]=(Math.random()<0.6)?1:0;
    }
    buildLane('#kick',kickPat);
    buildLane('#snare',snarePat);
    buildLane('#hats',hatsPat);
  }

  if(!started) $('#start').click();
});

/* RECORD */
$('#rec').addEventListener('click', async ()=>{
  if(!started || !recorder){
    status('PRESS PLAY BEFORE RECORDING');
    return;
  }
  const btn = $('#rec');
  const dl  = $('#download');
  dl.style.display='none';

  if(!isRecording){
    try { await recorder.start(); } catch(e){ console.error(e); status('RECORDING FAILED'); return; }
    isRecording = true;
    btn.classList.add('on');
    btn.textContent = 'Stop Rec'; status('RECORDING AUDIO');
  }else{
    let recording; try{ recording = await recorder.stop(); }catch(e){console.error(e); status('STOP RECORDING FAILED');return;}
    isRecording = false;
    btn.classList.remove('on');
    btn.textContent = 'Record'; status('AUDIO CAPTURE COMPLETE');

    const url = URL.createObjectURL(recording);
    dl.href = url;
    dl.download = 'chrysasynth-axis.webm';
    dl.style.display = 'inline-block';
  }
});

/* ========= SHARE HELPERS (URL parent-safe) ========= */

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

/* CAPTURE / ENCODE / DECODE */

function captureStateForShare(){
  return {
    v:1,
    bank: currentBank,
    autoChain: !!autoChain,
    drumLock: !!drumLock,
    seedId: currentSeedId,

    bpm: parseInt($('#bpm').value,10),
    swing: parseInt($('#swing').value,10),

    rootNote: $('#rootNote').value,
    rootOct: $('#rootOct').value,
    scaleStr: $('#scale').value,
    range: parseInt($('#range').value,10),

    cut: parseFloat($('#cut').value),
    res: parseFloat($('#res').value),
    env: parseFloat($('#env').value),
    drive: parseFloat($('#drive').value),
    wave: $('#wave').value,
    svol: parseInt($('#svol').value,10),

    delay: parseFloat($('#delay').value),
    dvol: parseInt($('#dvol').value,10),

    mx, my,

    patterns: {
      A: patterns.A.map(s=>({row:s.row, acc:!!s.acc, sli:!!s.sli})),
      B: patterns.B.map(s=>({row:s.row, acc:!!s.acc, sli:!!s.sli}))
    },
    drums: {
      kick: kickPat.slice(),
      snare: snarePat.slice(),
      hats: hatsPat.slice()
    }
  };
}

async function createShareUrl(){
  const state = captureStateForShare();
  const json = JSON.stringify(state);
  let encoded;
  if(typeof LZString !== 'undefined' && LZString.compressToEncodedURIComponent){
    encoded = LZString.compressToEncodedURIComponent(json);
  }else{
    encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(json))));
  }
  const baseUrl = getShareBaseUrl();
  const sep = baseUrl.includes('?') ? '&' : '?';
  return baseUrl + sep + 'ax=' + encoded;
}

function applySharedState(st){
  if(!st) return;

  currentBank = (st.bank === 'B') ? 'B' : 'A';
  steps = patterns[currentBank];
  autoChain = !!st.autoChain;
  drumLock = !!st.drumLock;
  currentSeedId = st.seedId || 'none';

  document.querySelectorAll('.abBtn').forEach(b=>{
    b.classList.toggle('active', b.dataset.bank === currentBank);
  });
  $('#lockToggle').classList.toggle('on', autoChain);
  $('#drumLock').classList.toggle('on', drumLock);

  const seedSel = $('#seedSelect');
  if(seedSel){
    seedSel.value = currentSeedId;
  }

  // transport
  if(typeof st.bpm === 'number'){
    $('#bpm').value = st.bpm;
    $('#bpmVal').textContent = st.bpm;
    if(started) Tone.Transport.bpm.value = st.bpm;
  }
  if(typeof st.swing === 'number'){
    $('#swing').value = st.swing;
    $('#swingVal').textContent = st.swing+'%';
    if(started) Tone.Transport.swing = st.swing/100;
  }

  // pitch/scale
  if(st.rootNote) $('#rootNote').value = st.rootNote;
  if(st.rootOct)  $('#rootOct').value  = st.rootOct;
  if(st.scaleStr) $('#scale').value    = st.scaleStr;
  if(typeof st.range === 'number') $('#range').value = String(st.range);

  root  = getRootMidi();
  const selVal = $('#scale').value;
  if(selVal === 'chromatic'){
    scale = [...Array(12).keys()];
  }else{
    scale = selVal.split(',').map(n=>parseInt(n,10));
  }
  range = parseInt($('#range').value,10) || 24;

  // synth params
  if(typeof st.cut === 'number')   $('#cut').value   = st.cut;
  if(typeof st.res === 'number')   $('#res').value   = st.res;
  if(typeof st.env === 'number')   $('#env').value   = st.env;
  if(typeof st.drive === 'number') $('#drive').value = st.drive;
  if(st.wave) $('#wave').value = st.wave;
  if(typeof st.svol === 'number') $('#svol').value   = st.svol;

  if(filter){
    filter.frequency.value = parseFloat($('#cut').value)||1600;
    filter.Q.value         = parseFloat($('#res').value)||0.9;
  }
  if(synth){
    synth.filterEnvelope.octaves = 2 + (parseFloat($('#env').value)||0.35)*3;
    synth.oscillator.type = $('#wave').value;
  }
  if(synthGain){
    synthGain.gain.value = Tone.dbToGain(parseInt($('#svol').value,10)||0);
  }

  // FX
  if(typeof st.delay === 'number'){
    $('#delay').value = st.delay;
    $('#delayVal').textContent = st.delay.toFixed(2);
    if(delayFX) delayFX.wet.value = st.delay;
  }
  if(typeof st.dvol === 'number'){
    $('#dvol').value = st.dvol;
    $('#dvolVal').textContent = st.dvol+' dB';
    if(drumGain) drumGain.gain.value = Tone.dbToGain(st.dvol);
  }

  if(typeof st.mx === 'number') mx = clamp(st.mx,0,1);
  if(typeof st.my === 'number') my = clamp(st.my,0,1);
  drawXY();
  applyXY();

  // patterns
  if(st.patterns){
    ['A','B'].forEach(bank=>{
      const srcArr = st.patterns[bank];
      if(!srcArr) return;
      for(let i=0;i<16;i++){
        const src = srcArr[i] || {};
        const dst = patterns[bank][i];
        dst.row = (typeof src.row === 'number') ? src.row : null;
        dst.acc = !!src.acc;
        dst.sli = !!src.sli;
      }
    });
  }
  steps = patterns[currentBank];
  for(let c=0;c<16;c++) redrawCol(c);

  // drums
  if(st.drums){
    if(Array.isArray(st.drums.kick) && st.drums.kick.length===16){
      for(let i=0;i<16;i++) kickPat[i] = st.drums.kick[i]?1:0;
    }
    if(Array.isArray(st.drums.snare) && st.drums.snare.length===16){
      for(let i=0;i<16;i++) snarePat[i] = st.drums.snare[i]?1:0;
    }
    if(Array.isArray(st.drums.hats) && st.drums.hats.length===16){
      for(let i=0;i<16;i++) hatsPat[i] = st.drums.hats[i]?1:0;
    }
    buildLane('#kick',kickPat);
    buildLane('#snare',snarePat);
    buildLane('#hats',hatsPat);
  }
}

function tryLoadFromUrl(){
  try{
    const params = getSearchParams();
    const encoded = params.get('ax');
    if(!encoded) return false;

    let json;
    if(typeof LZString !== 'undefined' && LZString.decompressFromEncodedURIComponent){
      json = LZString.decompressFromEncodedURIComponent(encoded);
    }else{
      json = decodeURIComponent(escape(atob(decodeURIComponent(encoded))));
    }
    if(!json) return false;
    const state = JSON.parse(json);
    applySharedState(state);
    return true;
  }catch(e){
    console.error(e);
    return false;
  }
}

/* SHARE TOAST */

function copyToClipboard(text){
  if(navigator.clipboard && navigator.clipboard.writeText){
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve,reject)=>{
    try{
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position='fixed';
      ta.style.left='-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if(ok) resolve(); else reject();
    }catch(e){
      reject(e);
    }
  });
}

const shareToast = $('#shareToast');
const shareToastTitle = $('#shareToastTitle');
const shareToastSub = $('#shareToastSub');

let shareToastTimer = null;

function showShareToast(copied){
  clearTimeout(shareToastTimer);
  if(copied){
    if(shareToastTitle) shareToastTitle.textContent = 'Seed copied';
    if(shareToastSub)   shareToastSub.textContent   = 'Share this link to load the same pattern.';
  }else{
    if(shareToastTitle) shareToastTitle.textContent = 'Link ready (copy failed)';
    if(shareToastSub)   shareToastSub.textContent   = 'Copy may be blocked. Use “Copy again” or “Open preview”.';
  }
  shareToast.classList.add('show');
  shareToastTimer = setTimeout(()=>{
    shareToast.classList.remove('show');
  },4000);
}

/* SHARE BUTTON */

$('#share').addEventListener('click', async ()=>{
  try{
    if(location.protocol === 'file:'){
      status('SHARING LINKS REQUIRE A HOSTED PAGE');
      return;
    }
    const url = await createShareUrl();
    lastSharedUrl = url;
    await copyToClipboard(url);
    showShareToast(true);
  }catch(e){
    console.error(e);
    showShareToast(false);
  }
});

$('#shareToastCopy').addEventListener('click',()=>{
  if(!lastSharedUrl) return;
  copyToClipboard(lastSharedUrl).catch(console.error);
});
$('#shareToastOpen').addEventListener('click',()=>{
  if(!lastSharedUrl) return;
  window.open(lastSharedUrl,'_blank','noopener');
});

/* ========= ADVANCED SEEDS ========= */

const AXIS_SEEDS = {
  serpent: {
    label: "Serpent Acid",
    root: "D",
    oct: 2,
    scale: "0,1,4,5,7,8,10",   // Phrygian Dominant
    range: 12,
    cut: 0.78,
    res: 0.90,
    env: 0.65,
    drive: 0.55,
    delay: 0.10,
    spaceMix: 0.08,
    waveform: "sawtooth",
    A: ["D2","F2","F#2","E2",null,"D2","C2","C2","D2","F2",null,"E2","D2","C2","D2",null],
    B: ["D2",null,"E2","F2","F#2","E2","D2","C2",null,"D2","E2",null,"F2","F#2","E2","D2"],
    accents: ["F#2","E2","C2"],
    slides: [["F2","F#2"],["E2","D2"]]
  },
  quartz: {
    label: "Quartz Bloom",
    root: "A",
    oct: 2,
    scale: "0,2,4,6,7,9,11",  // Lydian
    range: 12,
    cut: 0.50,
    res: 0.38,
    env: 0.42,
    drive: 0.20,
    delay: 0.24,
    spaceMix: 0.15,
    waveform: "triangle",
    A: ["A2","B2","C#3","B2","A2",null,"E3","D3","C#3","B2",null,"A2","A2","B2","C#3",null],
    B: [null,"A2","A2","D3","C#3","B2",null,"B2","C#3","E3","D3",null,"A2","A2","B2","C#3"],
    accents: ["C#3"],
    slides: []
  },
  ghost: {
    label: "Ghost Footsteps",
    root: "F",
    oct: 1,
    scale: "0,3,5,7,10",   // Minor pentatonic
    range: 24,
    cut: 0.30,
    res: 0.42,
    env: 0.28,
    drive: 0.60,
    delay: 0.0,
    spaceMix: 0.05,
    waveform: "square",
    A: ["F1",null,"G1","Bb1",null,"C2",null,"C2","F1",null,null,"Bb1","A1",null,"G1","F1"],
    B: [null,"F1","A1",null,"G1",null,"Bb1","Bb1","F1",null,"C2",null,null,"A1","G1","F1"],
    accents: [],
    slides: []
  },
  dry: {
    label: "Dry Groove Circuit",
    root: "C",
    oct: 2,
    scale: "chromatic",
    range: 12,
    cut: 0.45,
    res: 0.32,
    env: 0.40,
    drive: 0.75,
    delay: 0,
    spaceMix: 0,
    waveform: "sawtooth",
    A: ["C2","C2","G1",null,"C2","D#2",null,"G1","C2","G1",null,"D2","C2",null,"G1","F1"],
    B: [null,"F1","C2","C2","G1",null,"D#2","D2",null,"C2","C2","G1",null,"D2","C2","G1"],
    accents: ["C2","G1"],
    slides: []
  },
  solar: {
    label: "Solar Triphaze",
    root: "E",
    oct: 2,
    scale: "0,2,3,5,7,8,11",  // Harmonic Minor
    range: 12,
    cut: 0.62,
    res: 0.68,
    env: 0.75,
    drive: 0.30,
    delay: 0.18,
    spaceMix: 0.12,
    waveform: "sawtooth",
    A: ["E2",null,"F2","G#2","B2",null,"G#2","F2","E2","E2",null,"B2","A2","G#2","F2","E2"],
    B: [null,"E2","G#2","B2","C3","B2","G#2","F2",null,"A2","G#2","F2",null,"E2","E2","B2"],
    accents: ["G#2","B2"],
    slides: [["E2","F2"]]
  }
};

/* note -> row index */
function noteToRow(note){
  if(!note) return null;
  const names = {C:0,'C#':1,D:2,'D#':3,E:4,F:5,'F#':6,G:7,'G#':8,A:9,'A#':10,B:11};
  const match = /^([A-G]#?)(\d)$/.exec(note.replace('Bb','A#'));
  if(!match) return null;
  const target = (+match[2]+1)*12 + names[match[1]];
  let best=0, dist=Infinity;
  for(let row=0;row<12;row++){
    const d=Math.abs(noteFor(row)-target);
    if(d<dist){dist=d;best=row;}
  }
  return best;
}

/* APPLY SEED */
function applySeed(id){
  currentSeedId = id;
  const S = AXIS_SEEDS[id];
  if(!S){
    return;
  }

  // Scale
  const scaleSel = $('#scale');
  if(S.scale === 'chromatic'){
    scaleSel.value = 'chromatic';
    scale = [...Array(12).keys()];
  }else{
    scaleSel.value = S.scale;
    scale = S.scale.split(',').map(n=>parseInt(n,10));
  }

  // Root / octave
  $('#rootNote').value = S.root;
  $('#rootOct').value  = String(S.oct);
  root = getRootMidi();

  // Range
  $('#range').value = String(S.range);
  range = S.range;

  // Voice params
  $('#cut').value   = Math.round(S.cut * 8000);
  $('#res').value   = (S.res * 18).toFixed(1);
  $('#env').value   = S.env;
  $('#drive').value = S.drive;
  $('#delay').value = S.delay;
  $('#delayVal').textContent = S.delay.toFixed(2);
  $('#wave').value  = S.waveform;
  mx = clamp(S.spaceMix,0,1);
  drawXY();
  applyXY();

  if(filter){
    filter.frequency.value = parseFloat($('#cut').value)||1600;
    filter.Q.value         = parseFloat($('#res').value)||0.9;
  }
  if(synth){
    synth.filterEnvelope.octaves = 2 + (parseFloat($('#env').value)||0.35)*3;
    synth.oscillator.type = $('#wave').value;
  }
  if(delayFX){ delayFX.wet.value = S.delay; }
  if(drive){ drive.distortion = S.drive; }
  status('SEED LOADED · ' + S.label.replace('',''));

  // Reset patterns
  patterns.A = makeEmptySteps();
  patterns.B = makeEmptySteps();
  currentBank = 'A';
  steps = patterns.A;
  document.querySelectorAll('.abBtn').forEach(b=>{
    b.classList.toggle('active', b.dataset.bank === 'A');
  });

  // Pattern A
  S.A.forEach((note,i)=>{
    const r = noteToRow(note);
    const st = patterns.A[i];
    st.row = r;
    st.acc = note ? S.accents.includes(note) : false;
    st.sli = false;
  });

  // Pattern B
  S.B.forEach((note,i)=>{
    const r = noteToRow(note);
    const st = patterns.B[i];
    st.row = r;
    st.acc = note ? S.accents.includes(note) : false;
    st.sli = false;
  });

  // Slides : on set la slide sur la deuxième note du couple from->to
  function applySlides(bankSteps, seqNotes, slidesDefs){
    for(let i=0;i<16;i++){
      const note = seqNotes[i];
      const prevNote = seqNotes[(i+15)%16];
      const st = bankSteps[i];
      st.sli = slidesDefs.some(([from,to])=>from===prevNote && to===note);
    }
  }
  applySlides(patterns.A, S.A, S.slides);
  applySlides(patterns.B, S.B, S.slides);

  // Drums : on laisse le kit actuel, tu peux custom plus tard si tu veux par seed.

  // redraw
  steps = patterns[currentBank];
  for(let c=0;c<16;c++) redrawCol(c);

  if(!started) $('#start').click();
}

/* SEED SELECT */
const seedSelect = $('#seedSelect');
seedSelect.addEventListener('change',e=>{
  const id = e.target.value;
  if(id === 'none'){
    currentSeedId = 'none';
    return;
  }
  applySeed(id);
});

/* INIT FROM URL (si présent) */
const loadedFromUrl = tryLoadFromUrl();
if(!loadedFromUrl){
  // on garde l'état par défaut
}

/* FORGE V2: synced waveform preview and transport icons */
(function(){
 const wave = document.getElementById('wave');
 const line = document.getElementById('waveformLine');
 function updateWave(){
   if(!line || !wave)return;
   let p='';const n=6;const w=540/n;
   for(let i=0;i<n;i++){
     const x=i*w;
     if(wave.value==='sawtooth')p+=`M${x} 55 L${x+w} 8 L${x+w} 55 `;
     else if(wave.value==='square')p+=`M${x} 55 L${x} 8 L${x+w/2} 8 L${x+w/2} 55 L${x+w} 55 `;
     else p+=`M${x} 55 L${x+w/2} 8 L${x+w} 55 `;
   }
   line.setAttribute('d',p);
 }
 wave?.addEventListener('change', updateWave);updateWave();
 const play=document.getElementById('start');
 const original=play?.addEventListener;
 // Status and labels already managed by the original transport handlers.
 document.querySelectorAll('input[type="range"]').forEach(el=>{
   el.addEventListener('input',()=>el.style.setProperty('--fill', ((el.value-el.min)/(el.max-el.min)*100)+'%'));
   el.dispatchEvent(new Event('input'));
 });
})();
