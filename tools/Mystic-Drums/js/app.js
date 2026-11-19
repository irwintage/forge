
  // ── Sub-Drone supprimé ───────────────────────────────────────────────────────
  const instruments = [
    {id:'kick',  name:'Kick',        tag:'Low ritual pulse'},
    {id:'snare', name:'Snare',       tag:'Grain / dust'},
    {id:'ch',    name:'Closed Hat',  tag:'Metallic tick'},
    {id:'oh',    name:'Open Hat',    tag:'Bright air'},
    {id:'perc',  name:'Ritual Bell', tag:'Soft FM tone'}
  ];
  const stepsCount = 16;

  const patterns  = { A:{}, B:{} };
  const params    = {};
  const trackLocks= { A:{}, B:{} };

  instruments.forEach(inst=>{
    patterns.A[inst.id] = Array(stepsCount).fill(false);
    patterns.B[inst.id] = Array(stepsCount).fill(false);
    params[inst.id] = { volume:0.8, decay:0.5, tone:0.5, muted:false };
    trackLocks.A[inst.id] = false;
    trackLocks.B[inst.id] = false;
  });

  const presets = {
    moon:{
      bpm:88, swing:8, verb:30, warmth:15,
      params:{
        kick :{volume:0.9, decay:0.6, tone:0.4, muted:false},
        snare:{volume:0.7, decay:0.4, tone:0.6, muted:false},
        ch   :{volume:0.5, decay:0.3, tone:0.7, muted:false},
        oh   :{volume:0.45,decay:0.6, tone:0.7, muted:true},
        perc :{volume:0.65,decay:0.7, tone:0.5, muted:false}
      },
      steps:{
        kick :[1,0,0,0, 0,0,1,0, 0,0,0,0, 1,0,0,0],
        snare:[0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
        ch   :[0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
        oh   :[0,0,0,0, 0,0,0,0, 0,0,1,0, 0,0,0,0],
        perc :[0,0,0,0, 1,0,0,0, 0,0,0,0, 0,0,0,1]
      }
    },
    ash:{
      bpm:122, swing:24, verb:20, warmth:30,
      params:{
        kick :{volume:0.95,decay:0.55,tone:0.5, muted:false},
        snare:{volume:0.8, decay:0.45,tone:0.7, muted:false},
        ch   :{volume:0.75,decay:0.3, tone:0.8, muted:false},
        oh   :{volume:0.6, decay:0.6, tone:0.75,muted:false},
        perc :{volume:0.7, decay:0.5, tone:0.6, muted:false}
      },
      steps:{
        kick :[1,0,0,0, 0,0,1,0, 0,1,0,0, 0,0,1,0],
        snare:[0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
        ch   :[1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
        oh   :[0,0,0,0, 0,1,0,0, 0,0,0,0, 0,1,0,0],
        perc :[0,0,0,1, 0,0,0,1, 0,0,0,1, 0,0,0,1]
      }
    },
    silver:{
      bpm:104, swing:18, verb:45, warmth:18,
      params:{
        kick :{volume:0.8, decay:0.55,tone:0.4, muted:false},
        snare:{volume:0.7, decay:0.5, tone:0.5, muted:false},
        ch   :{volume:0.55,decay:0.35,tone:0.7, muted:false},
        oh   :{volume:0.65,decay:0.75,tone:0.75,muted:false},
        perc :{volume:0.8, decay:0.7, tone:0.5, muted:false}
      },
      steps:{
        kick :[1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0],
        snare:[0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
        ch   :[0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0],
        oh   :[0,0,0,0, 0,0,0,1, 0,0,0,0, 0,0,0,1],
        perc :[0,0,0,1, 0,0,0,0, 0,0,0,1, 0,0,0,0]
      }
    }
  };

  let currentPreset = 'moon';
  let currentBank = 'A';
  let lockAB = false;

  const stepNumsEl = document.getElementById('stepNums');
  const gridBodyEl = document.getElementById('gridBody');
  const instGridEl = document.getElementById('instGrid');
  const tempoEl    = document.getElementById('tempo');
  const swingEl    = document.getElementById('swing');
  const verbEl     = document.getElementById('verb');
  const warmthEl   = document.getElementById('warmth');
  const tempoVal   = document.getElementById('tempoVal');
  const swingVal   = document.getElementById('swingVal');
  const verbVal    = document.getElementById('verbVal');
  const warmthVal  = document.getElementById('warmthVal');
  const playBtn    = document.getElementById('playBtn');
  const stopBtn    = document.getElementById('stopBtn');
  const clearBtn   = document.getElementById('clearBtn');
  const randomBtn  = document.getElementById('randomBtn');
  const exportBtn  = document.getElementById('exportBtn');
  const statusDot  = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  const statusMsg  = document.getElementById('statusMsg');
  const chips      = Array.from(document.querySelectorAll('.md-chip'));
  const abButtons  = Array.from(document.querySelectorAll('.md-abBtn'));
  const abLockBtn  = document.getElementById('abLockBtn');
  const shareBtn   = document.getElementById('shareBtn');
  const mdToast    = document.getElementById('mdToast');
  const mdToastCopy= document.getElementById('mdToastCopy');
  const mdToastOpen= document.getElementById('mdToastOpen');

  // Collapsible instruments
  const instPanelHeader = document.getElementById('instPanelHeader');
  const instBody        = document.getElementById('instBody');
  const instToggleBtn   = document.getElementById('instToggleBtn');
  const instToggleLabel = document.getElementById('instToggleLabel');
  const instToggleIcon  = document.getElementById('instToggleIcon');

  let instPanelOpen = false;

  function toggleInstPanel(){
    instPanelOpen = !instPanelOpen;
    instBody.classList.toggle('open', instPanelOpen);
    instToggleIcon.classList.toggle('open', instPanelOpen);
    instToggleLabel.textContent = instPanelOpen ? 'Hide' : 'Show';
    instToggleBtn.setAttribute('aria-expanded', instPanelOpen);
  }

  instPanelHeader.addEventListener('click', toggleInstPanel);

  let toneReady = false;
  let isPlaying = false;
  let currentStep = 0;
  let lastStep = 0;
  let stepCells = [];
  let cellMap = {};
  let rowLockBtns = [];

  let drumBus, masterGain, reverbSend, reverb, warmth, limiter, voices;

  // ── Anti-crack kick : garde le temps du dernier trigger ────────────────────
  let kickLastTrigTime = -Infinity;
  const KICK_RETRIG_MIN = 0.075; // 75 ms entre deux kicks

  let recordDest = null;
  let mediaRecorder = null;
  let recordingChunks = [];
  let isRecording = false;
  let recordTimeout = null;
  let toastTimer = null;
  let lastSharedUrl = '';

  function setStatus(mode, msg){
    if(mode==='playing'){ statusDot.classList.add('on'); statusText.textContent='Playing loop…'; }
    else if(mode==='ready'){ statusDot.classList.add('on'); statusText.textContent='Ready.'; }
    else if(mode==='idle'){ statusDot.classList.remove('on'); statusText.textContent='Engine idle.'; }
    else if(mode==='render'){ statusDot.classList.add('on'); statusText.textContent='Recording…'; }
    else if(mode==='error'){ statusDot.classList.remove('on'); statusText.textContent='Error.'; }
    else if(mode==='done'){ statusDot.classList.add('on'); statusText.textContent='Recording exported.'; }
    statusMsg.textContent = msg || '';
    statusMsg.classList.toggle('error', mode==='error');
  }

  /* ── GRID ──────────────────────────────────────────────────────────────────*/
  function buildStepNums(){
    for(let i=0;i<stepsCount;i++){
      const div=document.createElement('div');
      div.className='md-stepNum';
      div.textContent=(i%4)===0?(i/4)+1:'.';
      stepNumsEl.appendChild(div);
    }
  }

  function buildGrid(){
    gridBodyEl.innerHTML='';
    stepCells=Array.from({length:stepsCount},()=>[]);
    cellMap={};
    rowLockBtns=[];

    instruments.forEach(inst=>{
      const row=document.createElement('div');
      row.className='md-row';
      const lab=document.createElement('div');
      lab.className='md-rowLabel';
      const l1=document.createElement('div');
      l1.className='md-rowLabelMain';
      l1.textContent=inst.name;
      lab.appendChild(l1);

      const lockBtn=document.createElement('button');
      lockBtn.type='button';
      lockBtn.className='md-rowLock';
      lockBtn.dataset.inst=inst.id;
      lockBtn.title='Lock row during randomize';
      lockBtn.textContent='Lock';
      lockBtn.addEventListener('click',()=>{
        const c=trackLocks[currentBank][inst.id];
        trackLocks[currentBank][inst.id]=!c;
        updateRowLockBtn(lockBtn,!c);
      });
      rowLockBtns.push(lockBtn);
      lab.appendChild(lockBtn);

      const stepsRow=document.createElement('div');
      stepsRow.className='md-stepRow';
      cellMap[inst.id]=[];

      for(let s=0;s<stepsCount;s++){
        const cell=document.createElement('div');
        cell.className='md-step';
        cell.dataset.inst=inst.id;
        cell.dataset.step=s;
        if(s%4===3){ const m=document.createElement('div'); m.className='md-measure'; cell.appendChild(m); }
        cell.addEventListener('click',()=>{
          const arr=patterns[currentBank][inst.id];
          arr[s]=!arr[s];
          cell.classList.toggle('on',arr[s]);
        });
        stepsRow.appendChild(cell);
        stepCells[s].push(cell);
        cellMap[inst.id][s]=cell;
      }
      row.appendChild(lab);
      row.appendChild(stepsRow);
      gridBodyEl.appendChild(row);
    });
    refreshRowLocksForCurrentBank();
  }

  function updateRowLockBtn(btn,isLocked){ btn.classList.toggle('locked',isLocked); }
  function refreshRowLocksForCurrentBank(){
    rowLockBtns.forEach(btn=>{
      updateRowLockBtn(btn,!!trackLocks[currentBank][btn.dataset.inst]);
    });
  }
  function refreshGridFromPatterns(){
    instruments.forEach(inst=>{
      const arr=patterns[currentBank][inst.id];
      for(let s=0;s<stepsCount;s++) cellMap[inst.id][s].classList.toggle('on',!!arr[s]);
    });
  }

  /* ── INSTRUMENT PANELS ─────────────────────────────────────────────────────*/
  function buildInstPanels(){
    instGridEl.innerHTML='';
    instruments.forEach(inst=>{
      const card=document.createElement('div');
      card.className='md-instCard';
      card.dataset.inst=inst.id;

      const head=document.createElement('div');
      head.className='md-instHead';
      const nameWrap=document.createElement('div');
      nameWrap.innerHTML=`<div class="md-instName">${inst.name}</div><div class="md-instTag">${inst.tag}</div>`;

      const mute=document.createElement('button');
      mute.type='button';
      mute.className='md-mute'+(params[inst.id].muted?' muted':'');
      mute.dataset.inst=inst.id;
      mute.innerHTML=`<span class="md-muteDot"></span><span>${params[inst.id].muted?'Muted':'On'}</span>`;
      mute.addEventListener('click',()=>{
        const p=params[inst.id];
        p.muted=!p.muted;
        mute.classList.toggle('muted',p.muted);
        mute.querySelector('span:nth-child(2)').textContent=p.muted?'Muted':'On';
        if(voices&&voices[inst.id]) voices[inst.id].gain.mute=p.muted;
      });
      head.appendChild(nameWrap);
      head.appendChild(mute);

      const sliders=document.createElement('div');
      sliders.className='md-instSliders';
      [{key:'volume',label:'Vol',min:0,max:100},{key:'decay',label:'Dec',min:5,max:95},{key:'tone',label:'Tone',min:0,max:100}].forEach(def=>{
        const row2=document.createElement('div');
        row2.className='md-miniRow';
        const lab2=document.createElement('div');
        lab2.className='md-miniLabel';
        lab2.textContent=def.label;
        const inp=document.createElement('input');
        inp.type='range';inp.min=def.min;inp.max=def.max;
        inp.value=def.min+params[inst.id][def.key]*(def.max-def.min);
        inp.dataset.inst=inst.id;inp.dataset.key=def.key;
        const val2=document.createElement('div');
        val2.className='md-miniVal';
        val2.textContent=Math.round(inp.value);
        inp.addEventListener('input',()=>{
          const norm=(inp.value-def.min)/(def.max-def.min);
          params[inst.id][def.key]=norm;
          val2.textContent=Math.round(inp.value);
          applyParam(inst.id,def.key);
        });
        row2.appendChild(lab2);row2.appendChild(inp);row2.appendChild(val2);
        sliders.appendChild(row2);
      });
      card.appendChild(head);card.appendChild(sliders);
      instGridEl.appendChild(card);
    });
  }


// Sound engine lives in audio-engine.js
  function syncInstUIFromParams(){
    document.querySelectorAll('.md-instCard').forEach(card=>{
      const id=card.dataset.inst;
      if(!params[id]) return;
      const pInst=params[id];
      card.querySelectorAll('input[type="range"]').forEach(inp=>{
        const key=inp.dataset.key;
        const def=key==='volume'?{min:0,max:100}:key==='decay'?{min:5,max:95}:{min:0,max:100};
        inp.value=def.min+pInst[key]*(def.max-def.min);
        const val=inp.parentElement.querySelector('.md-miniVal');
        if(val) val.textContent=Math.round(inp.value);
      });
      const muteBtn=card.querySelector('.md-mute');
      muteBtn.classList.toggle('muted',pInst.muted);
      muteBtn.querySelector('span:nth-child(2)').textContent=pInst.muted?'Muted':'On';
    });
  }

  function applyPreset(key){
    const p=presets[key]; if(!p) return;
    currentPreset=key;
    instruments.forEach(inst=>{
      const arr=p.steps[inst.id]||[];
      for(let i=0;i<stepsCount;i++){
        const v=!!arr[i];
        patterns.A[inst.id][i]=v;
        patterns.B[inst.id][i]=v;
      }
    });
    instruments.forEach(inst=>{
      const cfg=p.params[inst.id]; if(!cfg) return;
      params[inst.id]={...cfg};
    });
    tempoEl.value=p.bpm; swingEl.value=p.swing; verbEl.value=p.verb; warmthEl.value=p.warmth;
    updateGlobal(); applyAllParams(); syncInstUIFromParams();
    chips.forEach(c=>c.classList.toggle('active',c.dataset.preset===key));
    exportBtn.disabled=false;
    refreshGridFromPatterns();
    refreshRowLocksForCurrentBank();
    setStatus('ready',`Preset loaded on banks A & B.`);
  }

  function clearPattern(){
    instruments.forEach(inst=>patterns[currentBank][inst.id].fill(false));
    refreshGridFromPatterns();
    setStatus('ready',`Bank ${currentBank} cleared.`);
  }

  function randomizePattern(){
    const probs={kick:0.35,snare:0.25,ch:0.6,oh:0.45,perc:0.3};
    instruments.forEach(inst=>{
      if(trackLocks[currentBank][inst.id]) return;
      const arr=patterns[currentBank][inst.id];
      const prob=probs[inst.id]||0.3;
      for(let s=0;s<stepsCount;s++) arr[s]=Math.random()<prob;
    });
    refreshGridFromPatterns();
    setStatus('ready',`Random pattern on bank ${currentBank}. Locked rows preserved.`);
  }

  async function startPlayback(){
    await initAudio();
    if(isPlaying) return;
    Tone.Transport.start('+0.03');
    isPlaying=true;
    setStatus('playing','');
  }

  function stopPlayback(){
    if(!toneReady) return;
    Tone.Transport.stop();
    isPlaying=false;
    stepCells.forEach(cols=>cols.forEach(c=>c.classList.remove('playhead')));
    setStatus('ready','');
  }

  /* ── RECORD ────────────────────────────────────────────────────────────────*/
  async function startRecording1min(){
    await initAudio();
    if(isRecording) return;
    if(!isPlaying) await startPlayback();
    recordingChunks=[];
    mediaRecorder=new MediaRecorder(recordDest.stream);
    mediaRecorder.ondataavailable=e=>{ if(e.data&&e.data.size>0) recordingChunks.push(e.data); };
    mediaRecorder.onstop=async()=>{
      try{
        const blob=new Blob(recordingChunks,{type:'audio/webm'});
        const arrBuf=await blob.arrayBuffer();
        const ctx=new(window.AudioContext||window.webkitAudioContext)();
        const audioBuffer=await ctx.decodeAudioData(arrBuf);
        const wavBlob=audioBufferToWav(audioBuffer);
        const url=URL.createObjectURL(wavBlob);
        const a=document.createElement('a');
        a.href=url;
        a.download=`MysticDrums_REC_${tempoEl.value}BPM_${new Date().toISOString().replace(/[:.]/g,'-')}.wav`;
        document.body.appendChild(a);a.click();a.remove();
        URL.revokeObjectURL(url);
        setStatus('done','Recording exported.');
      }catch(err){
        console.error(err);
        setStatus('error','Could not finalise recording.');
      }finally{
        exportBtn.disabled=false;
        exportBtn.textContent='REC 1 min';
        isRecording=false;
      }
    };
    mediaRecorder.start();
    isRecording=true;
    exportBtn.disabled=false;
    exportBtn.textContent='Stop REC';
    setStatus('render','Recording… up to 60 seconds. Click again to stop.');
    recordTimeout=setTimeout(()=>stopRecording1min(),60000);
  }

  function stopRecording1min(){
    if(!isRecording||!mediaRecorder) return;
    clearTimeout(recordTimeout);
    mediaRecorder.stop();
  }

  /* ── WAV ENCODER ───────────────────────────────────────────────────────────*/
  function audioBufferToWav(buffer){
    const nc=buffer.numberOfChannels,sr=buffer.sampleRate,len=buffer.length,bd=24;
    const bps=bd/8,ba=nc*bps,byteRate=sr*ba,dataSize=len*ba;
    const ab=new ArrayBuffer(44+dataSize),view=new DataView(ab);
    const ws=(o,s)=>{ for(let i=0;i<s.length;i++) view.setUint8(o+i,s.charCodeAt(i)); };
    ws(0,'RIFF');view.setUint32(4,36+dataSize,true);ws(8,'WAVE');ws(12,'fmt ');
    view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,nc,true);
    view.setUint32(24,sr,true);view.setUint32(28,byteRate,true);
    view.setUint16(32,ba,true);view.setUint16(34,bd,true);
    ws(36,'data');view.setUint32(40,dataSize,true);
    const chs=[]; for(let c=0;c<nc;c++) chs.push(buffer.getChannelData(c));
    let off=44; const mx=Math.pow(2,bd-1)-1;
    for(let i=0;i<len;i++){
      for(let c=0;c<nc;c++){
        let s=Math.max(-1,Math.min(1,chs[c][i]));
        const v=(s<0?s*(mx+1):s*mx)|0;
        view.setInt8(off,v&0xFF);view.setInt8(off+1,(v>>8)&0xFF);view.setInt8(off+2,(v>>16)&0xFF);
        off+=bps;
      }
    }
    return new Blob([ab],{type:'audio/wav'});
  }

  /* ── AB / UI ───────────────────────────────────────────────────────────────*/
  function updateABButtons(){
    abButtons.forEach(btn=>btn.classList.toggle('active',btn.dataset.bank===currentBank));
    abLockBtn.classList.toggle('locked',lockAB);
  }

  /* ── SHARE ─────────────────────────────────────────────────────────────────*/
  function getShareBaseUrl(){
    try{ if(window.parent&&window.parent!==window&&window.parent.location) return window.parent.location.href.split('#')[0].split('?')[0]; }catch(e){}
    return window.location.href.split('#')[0].split('?')[0];
  }
  function getSearchParams(){
    let s='';
    try{ s=window.parent&&window.parent!==window?window.parent.location.search||'':window.location.search||''; }catch(e){ s=window.location.search||''; }
    return new URLSearchParams(s);
  }
  function captureStateForShare(){
    return { v:1, preset:currentPreset, bpm:+tempoEl.value, swing:+swingEl.value, verb:+verbEl.value, warmth:+warmthEl.value, bank:currentBank, lockAB:!!lockAB, params, patterns, locks:trackLocks };
  }
  async function createShareUrl(){
    const json=JSON.stringify(captureStateForShare());
    const encoded=typeof LZString!=='undefined'?LZString.compressToEncodedURIComponent(json):encodeURIComponent(btoa(json));
    const base=getShareBaseUrl();
    return base+(base.includes('?')?'&':'?')+'md='+encoded;
  }
  function applySharedState(st){
    if(!st) return;
    if(typeof st.bpm==='number') tempoEl.value=st.bpm;
    if(typeof st.swing==='number') swingEl.value=st.swing;
    if(typeof st.verb==='number') verbEl.value=st.verb;
    if(typeof st.warmth==='number') warmthEl.value=st.warmth;
    currentBank=(st.bank==='A'||st.bank==='B')?st.bank:'A';
    lockAB=!!st.lockAB;
    if(st.patterns){
      ['A','B'].forEach(bank=>{
        if(!st.patterns[bank]) return;
        instruments.forEach(inst=>{
          const src=st.patterns[bank][inst.id]||[];
          for(let i=0;i<stepsCount;i++) patterns[bank][inst.id][i]=!!src[i];
        });
      });
    }
    if(st.params){
      instruments.forEach(inst=>{
        const src=st.params[inst.id]; if(!src) return;
        params[inst.id].volume = typeof src.volume==='number'?src.volume:params[inst.id].volume;
        params[inst.id].decay  = typeof src.decay==='number'?src.decay:params[inst.id].decay;
        params[inst.id].tone   = typeof src.tone==='number'?src.tone:params[inst.id].tone;
        params[inst.id].muted  = !!src.muted;
      });
    }
    if(st.locks){
      ['A','B'].forEach(bank=>{
        if(!st.locks[bank]) return;
        instruments.forEach(inst=>{ trackLocks[bank][inst.id]=!!st.locks[bank][inst.id]; });
      });
    }
    if(st.preset&&presets[st.preset]){ currentPreset=st.preset; chips.forEach(c=>c.classList.toggle('active',c.dataset.preset===currentPreset)); }
    else chips.forEach(c=>c.classList.remove('active'));
    updateABButtons(); updateGlobal(); applyAllParams(); syncInstUIFromParams(); refreshGridFromPatterns(); refreshRowLocksForCurrentBank();
  }
  function tryLoadFromUrl(){
    try{
      const encoded=getSearchParams().get('md'); if(!encoded) return false;
      const json=typeof LZString!=='undefined'?LZString.decompressFromEncodedURIComponent(encoded):atob(decodeURIComponent(encoded));
      if(!json) return false;
      applySharedState(JSON.parse(json));
      setStatus('ready','Shared preset loaded from URL.');
      return true;
    }catch(err){ console.error(err); setStatus('error','Could not load shared preset from URL.'); return false; }
  }
  function copyToClipboard(text){
    if(navigator.clipboard&&navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    return new Promise((res,rej)=>{
      try{
        const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.left='-9999px';
        document.body.appendChild(ta);ta.focus();ta.select();
        document.execCommand('copy')?res():rej();
        document.body.removeChild(ta);
      }catch(e){rej(e);}
    });
  }
  function showToast(copied){
    clearTimeout(toastTimer);
    const t=document.getElementById('mdToastTitle'),s=document.getElementById('mdToastSub');
    if(copied){ t.textContent='🌱 Seed copied'; s.textContent='Share this link to load the same pattern.'; }
    else { t.textContent='Link ready (copy failed)'; s.textContent='Use "Copy again" or "Open preview".'; }
    mdToast.classList.add('show');
    toastTimer=setTimeout(()=>mdToast.classList.remove('show'),4000);
  }

  /* ── EVENT BINDINGS ────────────────────────────────────────────────────────*/
  tempoEl.addEventListener('input',updateGlobal);
  swingEl.addEventListener('input',updateGlobal);
  verbEl.addEventListener('input',updateGlobal);
  warmthEl.addEventListener('input',updateGlobal);

  playBtn.addEventListener('click',()=>startPlayback().catch(console.error));
  stopBtn.addEventListener('click',stopPlayback);
  clearBtn.addEventListener('click',clearPattern);
  randomBtn.addEventListener('click',randomizePattern);
  exportBtn.addEventListener('click',()=>{ if(isRecording) stopRecording1min(); else startRecording1min().catch(console.error); });

  chips.forEach(chip=>chip.addEventListener('click',()=>applyPreset(chip.dataset.preset)));
  abButtons.forEach(btn=>btn.addEventListener('click',()=>{
    currentBank=btn.dataset.bank;
    updateABButtons(); refreshGridFromPatterns(); refreshRowLocksForCurrentBank();
  }));
  abLockBtn.addEventListener('click',()=>{ lockAB=!lockAB; updateABButtons(); });

  shareBtn.addEventListener('click',async()=>{
    try{ const url=await createShareUrl(); lastSharedUrl=url; await copyToClipboard(url); showToast(true); }
    catch(err){ console.error(err); showToast(false); }
  });
  mdToastCopy.addEventListener('click',()=>{ if(lastSharedUrl) copyToClipboard(lastSharedUrl).catch(console.error); });
  mdToastOpen.addEventListener('click',()=>{ if(lastSharedUrl) window.open(lastSharedUrl,'_blank','noopener'); });

  /* ── INIT ──────────────────────────────────────────────────────────────────*/
  buildStepNums();
  buildGrid();
  buildInstPanels();

  const loadedFromUrl=tryLoadFromUrl();
  if(!loadedFromUrl){ applyPreset('moon'); setStatus('idle',''); }

// Forge range track fill (single integrated battery slider)
function forgeSyncRange(e){const r=e.target;const min=Number(r.min||0),max=Number(r.max||100);r.style.setProperty('--pct', (100*(Number(r.value)-min)/(max-min||1))+'%');}
document.querySelectorAll('input[type="range"]').forEach(r=>{r.addEventListener('input',forgeSyncRange);forgeSyncRange({target:r});});
// Keep filled track synchronized when presets or shared states update sliders programmatically.
const forgeUpdateUI = updateGlobal; updateGlobal = function(){forgeUpdateUI();document.querySelectorAll('input[type="range"]').forEach(r=>forgeSyncRange({target:r}));};
document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>requestAnimationFrame(()=>document.querySelectorAll('input[type="range"]').forEach(r=>forgeSyncRange({target:r})))));
