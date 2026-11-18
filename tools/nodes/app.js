
(function(){
  if(!window.Tone) return;

  const ROWS = 16;
  const COLS = 16;
  const pcs = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const N2S = {C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
  const CHORDS = {
    maj:[0,4,7],
    min:[0,3,7],
    dom7:[0,4,7,10],
    maj7:[0,4,7,11],
    m7:[0,3,7,10],
    dim:[0,3,6],
    sus2:[0,2,7],
    sus4:[0,5,7],
    add9:[0,4,7,14]
  };

  const $ = s => document.querySelector(s);

  const midiFrom = n => {
    const m = n.match(/^([A-G](?:#|b)?)(-?\d)$/i);
    if(!m) return 60;
    return 12 * (parseInt(m[2],10) + 1) + N2S[m[1].toUpperCase()];
  };

  const midiName = m => pcs[m % 12] + (Math.floor(m / 12) - 1);

  const boardA = $('#boardA');
  const boardB = $('#boardB');
  const rootA = $('#rootA');
  const rootB = $('#rootB');
  const chordA = $('#chordA');
  const chordB = $('#chordB');

  function buildBoard(board){
    board.innerHTML = '';
    for(let r=0;r<ROWS;r++){
      for(let c=0;c<COLS;c++){
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = r;
        cell.dataset.col = c;

        const dot = document.createElement('div');
        dot.className = 'cellDot';
        cell.appendChild(dot);

        board.appendChild(cell);
      }
    }
  }

  buildBoard(boardA);
  buildBoard(boardB);

  const clearBoard = b => b.querySelectorAll('.cell.active').forEach(c => c.classList.remove('active'));

  const setExcl = (b,col,row) => {
    b.querySelectorAll(`.cell[data-col="${col}"]`).forEach(c=>{
      c.classList.toggle('active', +c.dataset.row === row);
    });
  };

  const getState = b => {
    const a = [];
    for(let c=0;c<COLS;c++){
      const x = b.querySelector(`.cell[data-col="${c}"].active`);
      a.push(x ? +x.dataset.row : -1);
    }
    return a;
  };

  const setState = (b,arr) => {
    if(!Array.isArray(arr)) return;
    clearBoard(b);
    arr.forEach((row,c)=>{
      if(row >= 0 && row < ROWS) setExcl(b,c,row);
    });
  };

  /* drag */
  let dragging = false;
  let dragCol = null;
  let dragBoard = null;

  function setupDrag(board){
    const cellAt = el => {
      const cell = el && el.closest ? el.closest('.cell') : null;
      return cell && board.contains(cell) ? cell : null;
    };

    board.addEventListener('mousedown',e=>{
      const c = cellAt(e.target);
      if(!c) return;
      dragging = true;
      dragCol = +c.dataset.col;
      dragBoard = board;
      setExcl(board, dragCol, +c.dataset.row);
      e.preventDefault();
    });

    board.addEventListener('mousemove',e=>{
      if(!dragging || dragBoard !== board) return;
      const c = cellAt(e.target);
      if(c && +c.dataset.col === dragCol) setExcl(board, dragCol, +c.dataset.row);
    });

    board.addEventListener('touchstart',e=>{
      const t = e.touches[0];
      const el = document.elementFromPoint(t.clientX,t.clientY);
      const c = cellAt(el);
      if(!c) return;
      dragging = true;
      dragCol = +c.dataset.col;
      dragBoard = board;
      setExcl(board, dragCol, +c.dataset.row);
    },{passive:true});

    board.addEventListener('touchmove',e=>{
      if(!dragging || dragBoard !== board) return;
      const t = e.touches[0];
      const el = document.elementFromPoint(t.clientX,t.clientY);
      const c = cellAt(el);
      if(c && +c.dataset.col === dragCol) setExcl(board, dragCol, +c.dataset.row);
    },{passive:true});
  }

  setupDrag(boardA);
  setupDrag(boardB);

  document.addEventListener('mouseup',()=>{ dragging=false; dragCol=null; dragBoard=null; });
  document.addEventListener('touchend',()=>{ dragging=false; dragCol=null; dragBoard=null; });

  /* page switch */
  let viewPage = 'a';

  function switchView(page,dir){
    if(viewPage === page) return;

    const from = page === 'a' ? boardB : boardA;
    const to   = page === 'a' ? boardA : boardB;

    from.classList.add('hidden');
    from.classList.toggle('rev', dir === 'left');
    to.classList.remove('hidden','rev');

    viewPage = page;

    $('#tabA').className = 'pg-tab' + (page === 'a' ? ' ta' : '');
    $('#tabB').className = 'pg-tab' + (page === 'b' ? ' tb' : '');

    const p = $('#gridPill');
    $('#gridLabel').childNodes[0].nodeValue = 'Page ' + page.toUpperCase() + ' ';
    p.textContent = page.toUpperCase();
    p.className = 'pg-pill pill-' + page;

    renderLegend();
  }

  $('#tabA').addEventListener('click',()=>switchView('a','left'));
  $('#tabB').addEventListener('click',()=>switchView('b','right'));

  /* rows + legend */
  let rowMidiA = new Array(ROWS);
  let rowMidiB = new Array(ROWS);
  let chordRowsA = new Set();
  let chordRowsB = new Set();

  (function populateRoots(){
    [rootA,rootB].forEach(sel=>{
      [3,4].forEach(o=>{
        pcs.forEach(pc=>{
          const opt = document.createElement('option');
          opt.textContent = pc + o;
          sel.appendChild(opt);
        });
      });
    });
    rootA.value = 'C4';
    rootB.value = 'G3';
  })();

  function rebuildRows(rootSel, chordSel, rowsSet, targetMidi){
    const root = midiFrom(rootSel.value);
    const start = root - 12;
    const tmp = [];

    for(let i=0;i<ROWS;i++) tmp[i] = start + i;
    tmp.reverse();

    for(let i=0;i<ROWS;i++) targetMidi[i] = tmp[i];

    rowsSet.clear();
    const pcsC = new Set((CHORDS[chordSel.value] || [0,4,7]).map(o => (root + o) % 12));

    for(let r=0;r<ROWS;r++){
      if(pcsC.has(targetMidi[r] % 12)) rowsSet.add(r);
    }
  }

  function paintChordRows(board, rowsSet){
    board.querySelectorAll('.cell').forEach(c=>c.classList.remove('cellChord'));
    for(let r=0;r<ROWS;r++){
      if(rowsSet.has(r)){
        board.querySelectorAll(`.cell[data-row="${r}"]`).forEach(c=>c.classList.add('cellChord'));
      }
    }
  }

  function renderLegend(){
    const legend = $('#noteLegend');
    const midiMap = viewPage === 'a' ? rowMidiA : rowMidiB;
    const chordSet = viewPage === 'a' ? chordRowsA : chordRowsB;

    legend.innerHTML = '';
    for(let r=0;r<ROWS;r++){
      const row = document.createElement('div');
      row.className = 'note-row' + (chordSet.has(r) ? ' chord' : '');
      row.textContent = midiName(midiMap[r]);
      legend.appendChild(row);
    }
  }

  function rebuildBoth(){
    rebuildRows(rootA, chordA, chordRowsA, rowMidiA);
    rebuildRows(rootB, chordB, chordRowsB, rowMidiB);
    paintChordRows(boardA, chordRowsA);
    paintChordRows(boardB, chordRowsB);
    renderLegend();
  }

  [rootA,rootB,chordA,chordB].forEach(s=>s.addEventListener('change',rebuildBoth));

  /* audio */
  Tone.Transport.bpm.value = 120;
  Tone.Transport.swing = 0;
  Tone.Transport.swingSubdivision = '8n';

  const master = new Tone.Gain(0.45).toDestination();
  const filter = new Tone.Filter({type:'lowpass',frequency:5000,Q:0.6});
  const chorus = new Tone.Chorus(1.25,1.5,0.12).start();
  const rev = new Tone.Reverb({decay:2.2,preDelay:0.025,wet:0.18});
  const comp = new Tone.Compressor(-22,3);
  const vGain = new Tone.Gain(0.65);

  function connectChain(){
    try{ vGain.disconnect(); }catch(e){}
    try{ filter.disconnect(); }catch(e){}
    try{ chorus.disconnect(); }catch(e){}
    try{ rev.disconnect(); }catch(e){}
    try{ comp.disconnect(); }catch(e){}

    vGain.connect(filter);
    filter.connect(chorus);
    chorus.connect(rev);
    rev.connect(comp);
    comp.connect(master);
  }

  connectChain();

  const recorder = new Tone.Recorder();
  master.connect(recorder);

  const analyser = new Tone.Waveform(512);
  master.connect(analyser);

  const fm = new Tone.FMSynth({
    modulationIndex:8,
    harmonicity:1.32,
    oscillator:{type:'sine'},
    envelope:{attack:.004,decay:.22,sustain:.03,release:.20},
    modulationEnvelope:{attack:.003,decay:.16,sustain:.05,release:.18}
  });

  const fm2 = new Tone.FMSynth({
    modulationIndex:7,
    harmonicity:1.92,
    oscillator:{type:'sine'},
    envelope:{attack:.004,decay:.21,sustain:.02,release:.18},
    modulationEnvelope:{attack:.003,decay:.15,sustain:.05,release:.16},
    detune:6
  });

  const fmMix = new Tone.Gain(.5);
  fm.connect(fmMix);
  fm2.connect(fmMix);
  fmMix.connect(vGain);

  const pad = new Tone.PolySynth(Tone.Synth,{
    oscillator:{type:'triangle'},
    envelope:{attack:.28,decay:.50,sustain:.74,release:2.4}
  });

  const bell = new Tone.AMSynth({
    harmonicity:3.1,
    oscillator:{type:'sine'},
    modulation:{type:'sine'},
    envelope:{attack:.002,decay:1.25,sustain:0,release:1.1},
    modulationEnvelope:{attack:.002,decay:.55,sustain:.18,release:.85}
  });

  const organ = new Tone.PolySynth(Tone.Synth,{
    oscillator:{type:'square4'},
    envelope:{attack:.01,decay:.05,sustain:.75,release:.35}
  });

  const lead = new Tone.DuoSynth({
    harmonicity:1.01,
    vibratoAmount:.14,
    vibratoRate:5.2,
    voice0:{oscillator:{type:'sawtooth'},envelope:{attack:.01,decay:.20,sustain:.38,release:.22}},
    voice1:{oscillator:{type:'pulse'},envelope:{attack:.01,decay:.20,sustain:.38,release:.22}},
    detune:-7
  });

  [pad,bell,organ,lead].forEach(v=>v.connect(vGain));

  const VOICES = {fm,bell,organ,lead,pad};
  let currentVoice = fm;
  let voiceId = 'fm';

  function setVoice(id){
    voiceId = id;
    currentVoice = VOICES[id] || fm;
  }

  $('#voice').addEventListener('change',e=>setVoice(e.target.value));

  $('#cutoff').addEventListener('input',e=>{
    filter.frequency.rampTo(+e.target.value,.05);
    $('#cutVal').textContent = e.target.value;
    updateLFO();
  });

  $('#q').addEventListener('input',e=>{
    filter.Q.rampTo(+e.target.value,.05);
    $('#qVal').textContent = (+e.target.value).toFixed(2);
  });

  $('#reverb').addEventListener('input',e=>{
    rev.wet.rampTo(+e.target.value,.05);
    $('#revVal').textContent = (+e.target.value).toFixed(2);
  });

  $('#volume').addEventListener('input',e=>{
    master.gain.rampTo(+e.target.value,.05);
    $('#masterTopValue').textContent = Math.round(+e.target.value * 100) + '%';
  });

  $('#bpm').addEventListener('input',e=>{
    Tone.Transport.bpm.value = +e.target.value;
    $('#bpmVal').textContent = e.target.value;
  });

  $('#swing').addEventListener('input',e=>{
    Tone.Transport.swing = parseFloat(e.target.value);
    $('#swingVal').textContent = parseFloat(e.target.value).toFixed(2);
  });

  /* scope */
  const scopeCanvas = $('#scopeCanvas');
  const scopeCtx = scopeCanvas.getContext('2d');

  function resizeScope(){
    scopeCanvas.width = scopeCanvas.offsetWidth * devicePixelRatio;
    scopeCanvas.height = scopeCanvas.offsetHeight * devicePixelRatio;
  }

  resizeScope();
  window.addEventListener('resize',resizeScope);

  let destroyed = false;
  let scopeRAF = 0;
  (function drawScope(){
    if(destroyed) return;
    scopeRAF = requestAnimationFrame(drawScope);

    const W = scopeCanvas.width;
    const H = scopeCanvas.height;

    scopeCtx.clearRect(0,0,W,H);

    scopeCtx.beginPath();
    scopeCtx.strokeStyle = 'rgba(255,255,255,0.05)';
    scopeCtx.lineWidth = 1;
    scopeCtx.moveTo(0,H/2);
    scopeCtx.lineTo(W,H/2);
    scopeCtx.stroke();

    const wave = analyser.getValue();
    if(!wave || wave.length < 2) return;

    scopeCtx.beginPath();
    scopeCtx.strokeStyle = 'rgba(166,103,171,0.55)';
    scopeCtx.lineWidth = 1.1 * devicePixelRatio;

    const sl = W / wave.length;
    wave.forEach((v,i)=>{
      const x = i * sl;
      const y = H/2 + v * H * .36;
      i === 0 ? scopeCtx.moveTo(x,y) : scopeCtx.lineTo(x,y);
    });
    scopeCtx.stroke();
  })();

  /* LFO cutoff only */
  const lfo = new Tone.LFO({
    type:'sine',
    frequency:0.5,
    min:400,
    max:6000
  }).start();

  let lfoDepth = 0.3;

  function updateLFO(){
    const base = +$('#cutoff').value;
    const range = base * lfoDepth * 0.8;

    lfo.min = Math.max(120, base - range);
    lfo.max = Math.min(8000, base + range);

    try{ lfo.disconnect(); }catch(e){}
    lfo.connect(filter.frequency);
  }

  $('#lfoRate').addEventListener('input',e=>{
    lfo.frequency.value = +e.target.value;
    $('#lfoRateVal').textContent = (+e.target.value).toFixed(2);
  });

  $('#lfoDepth').addEventListener('input',e=>{
    lfoDepth = +e.target.value;
    $('#lfoDepthVal').textContent = (+e.target.value).toFixed(2);
    updateLFO();
  });

  /* arm */
  function seqFrom(rows,n=8){
    const arr = Array.from(rows).sort((a,b)=>a-b);
    if(!arr.length) return [];

    const mode = $('#arpMode').value;
    if(mode === 'up') return arr.slice(0,n);
    if(mode === 'down') return arr.slice().reverse().slice(0,n);
    if(mode === 'updown'){
      const r = arr.concat(arr.slice().reverse().slice(1,-1));
      return r.slice(0,n);
    }

    const out = [];
    for(let i=0;i<n;i++) out.push(arr[Math.floor(Math.random()*arr.length)]);
    return out;
  }

  function armBoard(b){
    clearBoard(b);
    const rowsSet = b === boardA ? chordRowsA : chordRowsB;
    const seq = seqFrom(rowsSet,8);
    for(let c=0;c<COLS;c++){
      if(!seq.length) continue;
      setExcl(b,c,seq[c % seq.length]);
    }
  }

  $('#armBtn').addEventListener('click',()=>armBoard(viewPage === 'a' ? boardA : boardB));
  $('#clearPageBtn').addEventListener('click',()=>clearBoard(viewPage === 'a' ? boardA : boardB));

  $('#copyABBtn').addEventListener('click',()=>{
    setState(boardB,getState(boardA));
    switchView('b','right');
  });

  $('#randBtn').addEventListener('click',()=>{
    const opts = Array.from(rootA.options).map(o=>o.value);
    const ck = Object.keys(CHORDS);

    rootA.value = opts[Math.floor(Math.random()*opts.length)];
    rootB.value = opts[Math.floor(Math.random()*opts.length)];
    chordA.value = ck[Math.floor(Math.random()*ck.length)];
    chordB.value = ck[Math.floor(Math.random()*ck.length)];

    $('#arpMode').value = ['up','down','updown','random'][Math.floor(Math.random()*4)];

    $('#bpm').value = 70 + Math.floor(Math.random()*55);
    $('#bpmVal').textContent = $('#bpm').value;
    Tone.Transport.bpm.value = +$('#bpm').value;

    $('#swing').value = (Math.random()*0.18).toFixed(2);
    $('#swingVal').textContent = (+$('#swing').value).toFixed(2);
    Tone.Transport.swing = +$('#swing').value;

    $('#voice').value = ['fm','bell','organ','lead','pad'][Math.floor(Math.random()*5)];
    setVoice($('#voice').value);

    rebuildBoth();
    armBoard(boardA);
    armBoard(boardB);
  });

  /* playback */
  let started = false;
  let step = 0;
  let pageRepeat = 0;
  let currentPlayPage = 'a';

  function updatePill(page){
    const pill = $('#playPill');
    const lbl = $('#playLabel');

    if(!started){
      pill.className = 'play-pill';
      lbl.textContent = 'Idle';
      return;
    }

    pill.className = 'play-pill on-' + page;
    lbl.textContent = 'Page ' + page.toUpperCase();
  }

  function triggerVoice(note,time){
    if(voiceId === 'fm'){
      fm.triggerAttackRelease(note,'16n',time);
      fm2.triggerAttackRelease(note,'16n',time);
      return;
    }
    currentVoice.triggerAttackRelease(note,'16n',time);
  }

  function tick(time){
    const mode = $('#pageMode').value;

    if(step === 0 && pageRepeat > 0){
      if(mode === 'ab-loop'){
        currentPlayPage = currentPlayPage === 'a' ? 'b' : 'a';
        pageRepeat = 0;
      }
    }

    if(mode === 'a-only') currentPlayPage = 'a';
    else if(mode === 'b-only') currentPlayPage = 'b';

    const board = currentPlayPage === 'a' ? boardA : boardB;
    const pageMidi = currentPlayPage === 'a' ? rowMidiA : rowMidiB;

    const playStep = step, playPage = currentPlayPage;
    const active = board.querySelector(`.cell[data-col="${playStep}"].active`);
    if(active){
      triggerVoice(midiName(pageMidi[+active.dataset.row]), time);
    }
    Tone.Draw.schedule(()=>{
      if(destroyed || !started) return;
      boardA.querySelectorAll('.cell.playing').forEach(c=>c.classList.remove('playing'));
      boardB.querySelectorAll('.cell.playing').forEach(c=>c.classList.remove('playing'));
      board.querySelectorAll(`.cell[data-col="${playStep}"]`).forEach(c=>c.classList.add('playing'));
      $('#stepInfo').textContent = 'Step ' + (playStep+1) + '/16 · ' + playPage.toUpperCase();
      updatePill(playPage);
    },time);

    step = (step + 1) % COLS;
    if(step === 0) pageRepeat++;
  }

  $('#startBtn').addEventListener('click',async()=>{
    await Tone.start();
    if(started) return;

    if(!boardA.querySelector('.cell.active')) armBoard(boardA);
    if(!boardB.querySelector('.cell.active')) armBoard(boardB);

    Tone.Transport.cancel();
    Tone.Transport.scheduleRepeat(tick,'16n');
    Tone.Transport.start('+0.02');

    started = true;
    step = 0;
    pageRepeat = 0;
    currentPlayPage = $('#pageMode').value === 'b-only' ? 'b' : 'a';
    updatePill(currentPlayPage);
  });

  $('#stopBtn').addEventListener('click',()=>{
    Tone.Transport.stop();
    Tone.Transport.cancel();

    boardA.querySelectorAll('.cell.playing').forEach(c=>c.classList.remove('playing'));
    boardB.querySelectorAll('.cell.playing').forEach(c=>c.classList.remove('playing'));

    started = false;
    step = 0;
    pageRepeat = 0;
    updatePill(null);
    $('#stepInfo').textContent = '—';
  });

  function stopPlayback(){
    Tone.Transport.stop();
    Tone.Transport.cancel();
    started=false;step=0;pageRepeat=0;
    boardA.querySelectorAll('.cell.playing').forEach(c=>c.classList.remove('playing'));
    boardB.querySelectorAll('.cell.playing').forEach(c=>c.classList.remove('playing'));
    [fm,fm2,pad,bell,organ,lead].forEach(v=>{try{v.triggerRelease?.();v.releaseAll?.();}catch(e){}});
    updatePill(null);$('#stepInfo').textContent='—';
  }
  window.ForgeNodes={
    stop:stopPlayback,
    async destroy(){
      if(destroyed)return;
      stopPlayback();
      if(recording) await stopRec();
      destroyed=true;cancelAnimationFrame(scopeRAF);
      window.removeEventListener('resize',resizeScope);
      [fm,fm2,fmMix,pad,bell,organ,lead,lfo,vGain,filter,chorus,rev,comp,master,recorder,analyser].forEach(n=>{
        try{n.stop?.();}catch(e){}try{n.dispose?.();}catch(e){}
      });
      delete window.ForgeNodes;
    }
  };

  /* share */
  let lastShareUrl = '';

  function getBase(){
    try{
      if(window.parent && window.parent !== window){
        return window.parent.location.href.split('#')[0].split('?')[0];
      }
    }catch(e){}
    return window.location.href.split('#')[0].split('?')[0];
  }

  function getParams(){
    let s = '';
    try{
      s = window.parent && window.parent !== window ? window.parent.location.search : window.location.search;
    }catch(e){
      s = window.location.search;
    }
    return new URLSearchParams(s || '');
  }

  function encState(){
    const st = {
      v:8,
      rootA:rootA.value,
      chordA:chordA.value,
      rootB:rootB.value,
      chordB:chordB.value,
      arpMode:$('#arpMode').value,
      bpm:+$('#bpm').value,
      swing:+$('#swing').value,
      voice:$('#voice').value,
      cut:+$('#cutoff').value,
      q:+$('#q').value,
      reverb:+$('#reverb').value,
      volume:+$('#volume').value,
      lfoRate:+$('#lfoRate').value,
      lfoDepth:+$('#lfoDepth').value,
      gridA:getState(boardA),
      gridB:getState(boardB),
      pageMode:$('#pageMode').value
    };

    const json = JSON.stringify(st);
    return window.LZString
      ? LZString.compressToEncodedURIComponent(json)
      : encodeURIComponent(btoa(json));
  }

  function decState(enc){
    try{
      const json = window.LZString
        ? LZString.decompressFromEncodedURIComponent(enc)
        : atob(decodeURIComponent(enc));
      if(!json) return null;
      return JSON.parse(json);
    }catch(e){
      return null;
    }
  }

  function applyState(st){
    if(!st) return;

    if(st.rootA) rootA.value = st.rootA;
    if(st.chordA) chordA.value = st.chordA;
    if(st.rootB) rootB.value = st.rootB;
    if(st.chordB) chordB.value = st.chordB;
    if(st.arpMode) $('#arpMode').value = st.arpMode;

    if(typeof st.bpm === 'number'){
      $('#bpm').value = st.bpm;
      $('#bpmVal').textContent = st.bpm;
      Tone.Transport.bpm.value = st.bpm;
    }

    if(typeof st.swing === 'number'){
      $('#swing').value = st.swing;
      $('#swingVal').textContent = st.swing.toFixed(2);
      Tone.Transport.swing = st.swing;
    }

    if(st.voice){
      $('#voice').value = st.voice;
      setVoice(st.voice);
    }

    if(typeof st.cut === 'number'){
      $('#cutoff').value = st.cut;
      $('#cutVal').textContent = st.cut;
      filter.frequency.value = st.cut;
    }

    if(typeof st.q === 'number'){
      $('#q').value = st.q;
      $('#qVal').textContent = st.q.toFixed(2);
      filter.Q.value = st.q;
    }

    if(typeof st.reverb === 'number'){
      $('#reverb').value = st.reverb;
      $('#revVal').textContent = st.reverb.toFixed(2);
      rev.wet.value = st.reverb;
    }

    if(typeof st.volume === 'number'){
      $('#volume').value = st.volume;
      $('#masterTopValue').textContent = Math.round(st.volume * 100) + '%';
      master.gain.value = st.volume;
    }

    if(typeof st.lfoRate === 'number'){
      $('#lfoRate').value = st.lfoRate;
      lfo.frequency.value = st.lfoRate;
      $('#lfoRateVal').textContent = st.lfoRate.toFixed(2);
    }

    if(typeof st.lfoDepth === 'number'){
      $('#lfoDepth').value = st.lfoDepth;
      lfoDepth = st.lfoDepth;
      $('#lfoDepthVal').textContent = st.lfoDepth.toFixed(2);
    }

    if(st.gridA) setState(boardA,st.gridA);
    if(st.gridB) setState(boardB,st.gridB);

    if(st.pageMode === 'a-only' || st.pageMode === 'b-only' || st.pageMode === 'ab-loop'){
      $('#pageMode').value = st.pageMode;
    } else {
      $('#pageMode').value = 'ab-loop';
    }

    rebuildBoth();
    updateLFO();
  }

  $('#shareBtn').addEventListener('click',()=>{
    lastShareUrl = getBase() + (getBase().includes('?') ? '&' : '?') + 'arp=' + encState();

    if(navigator.clipboard?.writeText){
      navigator.clipboard.writeText(lastShareUrl)
        .then(()=>{
          $('#shareTitle').textContent = 'Link copied ✓';
          $('#shareSub').textContent = 'Patch complet encodé dans l’URL.';
          $('#shareCard').classList.add('show');
        })
        .catch(()=>{
          $('#shareTitle').textContent = 'Link ready';
          $('#shareSub').textContent = 'Copie bloquée — utilise Copy again.';
          $('#shareCard').classList.add('show');
        });
    }else{
      $('#shareTitle').textContent = 'Link ready';
      $('#shareSub').textContent = 'Copie manuelle requise.';
      $('#shareCard').classList.add('show');
    }
  });

  $('#shareCopy').addEventListener('click',()=>{
    if(lastShareUrl && navigator.clipboard?.writeText){
      navigator.clipboard.writeText(lastShareUrl).catch(()=>{});
    }
  });

  $('#shareOpen').addEventListener('click',()=>{
    if(lastShareUrl) window.open(lastShareUrl,'_blank','noopener');
  });

  /* recorder */
  let recording = false;
  let lastBlob = null;
  let recStart = 0;
  let recRAF = null;

  const recBtn = $('#recBtn');
  const dlBtn = $('#dlBtn');

  const fmtTime = s =>
    (Math.floor(s/60)<10?'0':'') + Math.floor(s/60) + ':' +
    (Math.floor(s%60)<10?'0':'') + Math.floor(s%60);

  function updRec(){
    const sec = Tone.now() - recStart;
    $('#recTimer').textContent = fmtTime(sec);
    $('#recProgBar').style.width = Math.min(100,(sec/300)*100) + '%';
    if(recording) recRAF = requestAnimationFrame(updRec);
  }

  async function startRec(){
    await Tone.start();
    recStart = Tone.now();
    recording = true;
    lastBlob = null;
    dlBtn.disabled = true;
    recBtn.classList.remove('off');
    recBtn.textContent = '■ Stop Rec';
    $('#recProgBar').style.width = '0%';
    recorder.start();
    updRec();
    setTimeout(()=>{ if(recording) stopRec(); },300000);
  }

  async function stopRec(){
    if(!recording) return;
    recording = false;
    const blob = await recorder.stop();
    lastBlob = blob;
    dlBtn.disabled = false;
    recBtn.classList.add('off');
    recBtn.textContent = '● Rec';
    $('#recProgBar').style.width = '0%';
    cancelAnimationFrame(recRAF);
  }

  recBtn.addEventListener('click',()=>recording ? stopRec() : startRec());

  dlBtn.addEventListener('click',()=>{
    if(!lastBlob) return;
    const url = URL.createObjectURL(lastBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nodes-chrysa.' + (lastBlob.type.includes('ogg') ? 'ogg' : lastBlob.type.includes('mp4') ? 'm4a' : 'webm');
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  /* init */
  (() => {
    const enc = getParams().get('arp');
    if(enc){
      const st = decState(enc);
      if(st){
        applyState(st);
        return;
      }
    }

    setVoice('fm');
    rebuildBoth();

    setState(boardA,[12,11,10,9,8,7,6,5,5,6,7,8,9,10,11,12]);
    setState(boardB,[14,13,12,11,10,9,8,7,7,8,9,10,11,12,13,14]);

    $('#voice').value = 'pad';
    setVoice('pad');

    $('#bpm').value = 75;
    $('#bpmVal').textContent = '75';
    Tone.Transport.bpm.value = 75;

    $('#swing').value = 0.10;
    $('#swingVal').textContent = '0.10';
    Tone.Transport.swing = 0.10;

    updateLFO();
  })();

  $('#cutVal').textContent = $('#cutoff').value;
  $('#qVal').textContent = (+$('#q').value).toFixed(2);
  $('#revVal').textContent = (+$('#reverb').value).toFixed(2);
  $('#masterTopValue').textContent = Math.round(100 * +$('#volume').value) + '%';
  $('#bpmVal').textContent = $('#bpm').value;
  $('#swingVal').textContent = (+$('#swing').value).toFixed(2);
  $('#lfoRateVal').textContent = (+$('#lfoRate').value).toFixed(2);
  $('#lfoDepthVal').textContent = (+$('#lfoDepth').value).toFixed(2);
})();
