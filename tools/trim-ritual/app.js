(() => {
'use strict';
const $=id=>document.getElementById(id);
const el={file:$('file'),upload:$('upload'),reset:$('reset'),stage:$('stage'),wave:$('wave'),empty:$('empty'),filename:$('filename'),filemeta:$('filemeta'),start:$('start'),end:$('end'),length:$('length'),randomLength:$('random-length'),randomValue:$('random-value'),random:$('random'),play:$('play'),stop:$('stop'),export:$('export'),status:$('status'),playText:$('play-text'),rulerStart:$('ruler-start'),rulerMid:$('ruler-mid'),rulerEnd:$('ruler-end')};
const engine=new window.TrimRitualAudio();
let buffer=null,fileName='',start=0,end=0,playing=false,playStartedAt=0,playStartOffset=0,raf=0,peaks=[],busy=false,loadVersion=0,drag=null;
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const format=t=>`${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`;
const setStatus=s=>el.status.textContent=s;
const duration=()=>buffer?buffer.duration:0;
function setControls(){let loaded=!!buffer;for(const c of [el.reset,el.start,el.end,el.random,el.play,el.export])c.disabled=!loaded||busy;el.stop.disabled=!playing;el.export.disabled=!loaded||busy;el.play.disabled=!loaded||busy;el.upload.disabled=busy;el.playText.textContent=playing?'▶ Restart':'▶ Play';}
function formatFields(){el.start.value=start.toFixed(2);el.end.value=end.toFixed(2);el.length.textContent=(end-start).toFixed(2)+' s';}
function setRange(a,b){if(!buffer)return;const d=duration(),gap=Math.min(.02,d);start=clamp(Math.min(a,b),0,d-gap);end=clamp(Math.max(a,b),start+gap,d);formatFields();draw();}
function buildPeaks(){if(!buffer){peaks=[];return;}const n=1400, channels=Array.from({length:buffer.numberOfChannels},(_,i)=>buffer.getChannelData(i));peaks=new Array(n);const len=buffer.length;for(let i=0;i<n;i++){const a=Math.floor(i*len/n),b=Math.max(a+1,Math.floor((i+1)*len/n));let min=0,max=0;const step=Math.max(1,Math.floor((b-a)/90));for(const data of channels)for(let j=a;j<b;j+=step){const v=data[j];if(v<min)min=v;if(v>max)max=v;}peaks[i]=[min,max]}}
function size(){const rect=el.stage.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);const w=Math.max(1,rect.width),h=Math.max(1,rect.height);const cw=Math.round(w*dpr),ch=Math.round(h*dpr);if(el.wave.width!==cw||el.wave.height!==ch){el.wave.width=cw;el.wave.height=ch;}const ctx=el.wave.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);return {ctx,w,h};}
function draw(){const {ctx,w,h}=size();ctx.clearRect(0,0,w,h);if(!buffer)return;
const d=duration(),left=w*start/d,right=w*end/d,mid=h/2;
ctx.fillStyle='rgba(120,219,168,.10)';ctx.fillRect(left,0,right-left,h);
ctx.strokeStyle='rgba(255,255,255,.045)';ctx.lineWidth=1;for(let i=1;i<8;i++){let x=i*w/8;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}
ctx.beginPath();ctx.moveTo(0,mid);ctx.lineTo(w,mid);ctx.strokeStyle='rgba(206,240,219,.12)';ctx.stroke();
ctx.lineWidth=Math.max(1,w/peaks.length+0.15);for(let i=0;i<peaks.length;i++){const x=i*w/peaks.length,[min,max]=peaks[i];ctx.strokeStyle=(x>=left&&x<=right)?'#9fe5bd':'#4b6e5b';ctx.beginPath();ctx.moveTo(x,mid-max*(h*.40));ctx.lineTo(x,mid-min*(h*.40));ctx.stroke();}
for(const x of [left,right]){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.strokeStyle='#bbffce';ctx.lineWidth=2;ctx.stroke();const yy=h/2;ctx.fillStyle='#dffeed';ctx.beginPath();ctx.roundRect(x-5,yy-16,10,32,4);ctx.fill();ctx.strokeStyle='#397052';ctx.lineWidth=1;ctx.stroke();}
if(playing&&engine.context){const t=clamp((engine.context.currentTime-playStartedAt)+playStartOffset,0,d);const x=w*t/d;ctx.fillStyle='#f6dfab';ctx.fillRect(x-1,0,2,h);}
}
function updateRuler(){const d=duration();el.rulerStart.textContent='0:00';el.rulerMid.textContent=format(d/2);el.rulerEnd.textContent=format(d)}
function stop(){playing=false;engine.stop();cancelAnimationFrame(raf);raf=0;setControls();draw()}
function clear(){stop();buffer=null;engine.buffer=null;fileName='';peaks=[];start=0;end=0;el.filename.textContent='No file loaded';el.filemeta.textContent='WAV or MP3 · 5–60 seconds';el.empty.hidden=false;el.stage.classList.remove('has-file');el.file.value='';updateRuler();formatFields();setControls();setStatus('Ready to import audio');draw()}
function maybeDownload(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),6000)}
async function importFile(file){if(!file)return;if(!/\.(wav|wave|mp3)$/i.test(file.name)){setStatus('Choose a WAV or MP3 file');return;}const current=++loadVersion;stop();busy=true;setControls();setStatus('Decoding audio…');try{const decoded=await engine.decode(await file.arrayBuffer());if(current!==loadVersion)return;if(decoded.duration<5||decoded.duration>60)throw Error(`Audio must be 5–60 seconds (${decoded.duration.toFixed(1)} s received)`);buffer=decoded;engine.buffer=decoded;fileName=file.name;start=0;end=decoded.duration;el.filename.textContent=file.name;el.filemeta.textContent=`${decoded.duration.toFixed(2)} s · ${decoded.numberOfChannels===1?'Mono':decoded.numberOfChannels===2?'Stereo':decoded.numberOfChannels+' channels'} · ${(decoded.sampleRate/1000).toFixed(1)} kHz`;el.empty.hidden=true;el.stage.classList.add('has-file');buildPeaks();updateRuler();formatFields();setStatus('Ready to trim')}catch(err){setStatus(err.message||'Could not decode file')}finally{if(current===loadVersion){busy=false;setControls();draw();}}}
// Before an audio file is loaded, the entire waveform stage acts as an import target.
// Once loaded, clicks are reserved exclusively for editing the selection.
el.stage.addEventListener('click', () => {
  if (!buffer && !busy) el.file.click();
});
el.stage.addEventListener('keydown', e => {
  if (!buffer && !busy && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    el.file.click();
  }
});
el.upload.onclick=()=>el.file.click();el.file.onchange=e=>{importFile(e.target.files[0]);e.target.value=''};el.reset.onclick=()=>{loadVersion++;clear()};
for(const evt of ['dragenter','dragover'])el.stage.addEventListener(evt,e=>{e.preventDefault();if(e.dataTransfer)e.dataTransfer.dropEffect='copy'});el.stage.addEventListener('drop',e=>{e.preventDefault();const f=e.dataTransfer?.files?.[0];if(f)importFile(f)});
function pointerTime(e){const r=el.stage.getBoundingClientRect();return clamp((e.clientX-r.left)/r.width,0,1)*duration()}
el.stage.addEventListener('pointerdown',e=>{if(!buffer||busy)return;const r=el.stage.getBoundingClientRect(),x=e.clientX-r.left,l=start/duration()*r.width,rr=end/duration()*r.width,edge=15;const t=pointerTime(e);if(Math.abs(x-l)<edge)drag={kind:'start'};else if(Math.abs(x-rr)<edge)drag={kind:'end'};else if(x>l&&x<rr)drag={kind:'move',t,initialStart:start,initialEnd:end};else{drag={kind:'create',anchor:t};setRange(t,Math.min(duration(),t+.02))}el.stage.setPointerCapture(e.pointerId);});
el.stage.addEventListener('pointermove',e=>{if(!drag||!buffer)return;const t=pointerTime(e),d=duration();if(drag.kind==='start')setRange(clamp(t,0,end-.02),end);else if(drag.kind==='end')setRange(start,clamp(t,start+.02,d));else if(drag.kind==='move'){const width=drag.initialEnd-drag.initialStart,a=clamp(drag.initialStart+t-drag.t,0,d-width);setRange(a,a+width)}else if(drag.kind==='create')setRange(drag.anchor,t);});
for(const ev of ['pointerup','pointercancel','lostpointercapture'])el.stage.addEventListener(ev,()=>drag=null);
el.stage.addEventListener('keydown',e=>{if(!buffer)return;const delta=(e.shiftKey?.1:.01);if(e.key==='ArrowLeft'){setRange(start-delta,end-delta);e.preventDefault()}if(e.key==='ArrowRight'){setRange(start+delta,end+delta);e.preventDefault()}});
el.start.onchange=()=>setRange(+el.start.value,end);el.end.onchange=()=>setRange(start,+el.end.value);
function randomFill(){const s=el.randomLength,min=+s.min,max=+s.max,val=+s.value;s.style.setProperty('--pct',`${(val-min)/(max-min)*100}%`);el.randomValue.textContent=val.toFixed(1)+' s'}el.randomLength.oninput=randomFill;randomFill();
el.random.onclick=()=>{if(!buffer)return;const d=duration(),length=Math.min(d,+el.randomLength.value),a=Math.random()*Math.max(0,d-length);stop();setRange(a,a+length);setStatus('Random selection ready')};
function tick(){if(!playing)return;draw();raf=requestAnimationFrame(tick)}
el.play.onclick=async()=>{if(!buffer||busy)return;stop();try{await engine.play(start,end,()=>{playing=false;setControls();draw();setStatus('Preview finished')});playing=true;playStartedAt=engine.context.currentTime;playStartOffset=start;setControls();setStatus('Playing selection');tick()}catch(err){stop();setStatus('Playback error: '+err.message)}};
el.stop.onclick=()=>{stop();setStatus('Stopped')};
el.export.onclick=async()=>{if(!buffer||busy)return;busy=true;setControls();setStatus('Rendering WAV…');try{const blob=await engine.exportSelection(start,end),stem=fileName.replace(/\.[^.]+$/,'').replace(/[^\w-]+/g,'_').slice(0,56)||'audio';maybeDownload(blob,`${stem}_trim_${start.toFixed(2)}-${end.toFixed(2)}.wav`);setStatus('WAV exported')}catch(err){setStatus('Export error: '+err.message)}finally{busy=false;setControls()}};
new ResizeObserver(draw).observe(el.stage);window.addEventListener('resize',draw);clear();
})();
