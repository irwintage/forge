(() => {
'use strict';
const DSP=window.ToneSculptorEngine,$=id=>document.getElementById(id);
const bands=['low','mid','high'];
const PRESETS=[['Flat',[0,0,0]],['Warmth',[7,-1.5,-5]],['Clarity',[-4,3.5,7]],['Soft Focus',[3,-4,-5]],['Vocal Presence',[-5,8,1]],['Bass Lift',[9,-3,-1]],['Air',[-2,-1,9]]];
let gains={low:0,mid:0,high:0}, ctx=null,sourceBuffer=null,liveFilters=null,sourceNode=null,sourceStart=0,progress=0,playing=false,raf=0,loadVersion=0,rendering=false,playVersion=0,fileBase='tone-sculptor',bypassed=false,eqBus=null,dryBus=null;
const sliders=Object.fromEntries(bands.map(k=>[k,$(k)]));
const graph=$('eqCanvas'),wave=$('waveCanvas'),graphCtx=graph.getContext('2d'),waveCtx=wave.getContext('2d');
const status=$('status');
function setStatus(t,error=false){status.textContent=t;status.classList.toggle('error',error);}
function ensureContext(){if(!ctx){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw Error('Web Audio API unavailable');ctx=new AC();liveFilters=DSP.createFilters(ctx,gains);eqBus=ctx.createGain();dryBus=ctx.createGain();for(let i=0;i<liveFilters.length-1;i++)liveFilters[i].node.connect(liveFilters[i+1].node);liveFilters.at(-1).node.connect(eqBus);eqBus.connect(ctx.destination);dryBus.connect(ctx.destination);eqBus.gain.value=bypassed?0:1;dryBus.gain.value=bypassed?1:0;}return ctx;}
function syncUI(){bands.forEach(k=>{sliders[k].value=gains[k];const t=(gains[k]>0?'+':'')+gains[k].toFixed(1)+' dB';$(k+'Value').textContent=t;$(k+'Read').textContent=t;});if(liveFilters)liveFilters.forEach(({key,node})=>{node.gain.cancelScheduledValues(ctx.currentTime);node.gain.setValueAtTime(gains[key],ctx.currentTime)});const preset=PRESETS.find(p=>bands.every((k,i)=>gains[k]===p[1][i]));$('presetState').textContent=bypassed?'BYPASS':(preset?preset[0].toUpperCase():'CUSTOM');document.querySelectorAll('[data-preset]').forEach(b=>b.classList.toggle('active',!!preset&&b.dataset.preset===preset[0]));drawGraph();}
function updateBand(k,v){gains[k]=Math.round(DSP.clamp(v)*2)/2;syncUI();}
function setBypass(value){bypassed=value;$('bypass').setAttribute('aria-pressed',String(value));$('bypass').textContent=value?'A/B · EQ Off':'A/B · Bypass';if(ctx&&eqBus&&dryBus){const t=ctx.currentTime;eqBus.gain.setTargetAtTime(value?0:1,t,.008);dryBus.gain.setTargetAtTime(value?1:0,t,.008);}syncUI();}
$('bypass').addEventListener('click',()=>setBypass(!bypassed));
for(const k of bands){sliders[k].addEventListener('input',()=>updateBand(k,sliders[k].value));sliders[k].addEventListener('dblclick',()=>updateBand(k,0));}
$('reset').addEventListener('click',()=>{gains={low:0,mid:0,high:0};syncUI();});
PRESETS.forEach(([name,vals])=>{const b=document.createElement('button');b.textContent=name;b.dataset.preset=name;b.type='button';b.addEventListener('click',()=>{bands.forEach((k,i)=>gains[k]=vals[i]);syncUI();});$('presets').appendChild(b);});
function sizeCanvas(canvas,c){const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);if(!r.width||!r.height)return null;const w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}c.setTransform(dpr,0,0,dpr,0,0);return {w:r.width,h:r.height};}
const G={left:45,right:19,top:27,bottom:27},PLOT_DB=18;
const freqToX=(f,w)=>G.left+Math.log(f/20)/Math.log(20000/20)*(w-G.left-G.right);
const xToFreq=(x,w)=>20*Math.pow(1000,(x-G.left)/(w-G.left-G.right));
const dbToY=(db,h)=>G.top+(PLOT_DB-db)/(PLOT_DB*2)*(h-G.top-G.bottom);
const yToDb=(y,h)=>PLOT_DB-2*PLOT_DB*(y-G.top)/(h-G.top-G.bottom);
function drawGraph(){const sz=sizeCanvas(graph,graphCtx);if(!sz)return;const {w,h}=sz,c=graphCtx;c.clearRect(0,0,w,h);
  // sparse logarithmic frequency grid
  for(const hz of [20,50,100,200,500,1000,2000,5000,10000,20000]){const x=freqToX(hz,w);c.strokeStyle='#20322f';c.lineWidth=1;c.beginPath();c.moveTo(x,G.top);c.lineTo(x,h-G.bottom);c.stroke();if([20,100,1000,10000].includes(hz)){c.fillStyle='#71897e';c.font='10px system-ui';c.textAlign='center';c.fillText(hz===1000?'1k':hz===10000?'10k':String(hz),x,h-8);}}
  for(const db of [-18,-12,-6,0,6,12,18]){const y=dbToY(db,h);c.strokeStyle=db===0?'#496157':'#1c2d2a';c.beginPath();c.moveTo(G.left,y);c.lineTo(w-G.right,y);c.stroke();c.fillStyle='#71897e';c.font='10px system-ui';c.textAlign='right';c.fillText((db>0?'+':'')+db,G.left-10,y+3);}
  let values;try{ensureContext();values=DSP.response(liveFilters,Array.from({length:Math.max(128,Math.floor(w))},(_,i)=>20*Math.pow(1000,i/(Math.max(128,Math.floor(w))-1))));}catch(e){values=new Float32Array(200);}
  const xStart=G.left,xEnd=w-G.right,dy=h-G.top-G.bottom;
  c.beginPath();for(let i=0;i<values.length;i++){const x=xStart+(xEnd-xStart)*i/(values.length-1),y=dbToY(Math.max(-18,Math.min(18,values[i])),h);i?c.lineTo(x,y):c.moveTo(x,y);}const endY=dbToY(Math.max(-18,Math.min(18,values.at(-1))),h);c.lineTo(xEnd,dbToY(-PLOT_DB,h));c.lineTo(xStart,dbToY(-PLOT_DB,h));c.closePath();const grad=c.createLinearGradient(0,G.top,0,h-G.bottom);grad.addColorStop(0,'rgba(141,230,184,.3)');grad.addColorStop(1,'rgba(141,230,184,.01)');c.fillStyle=grad;c.fill();
  c.beginPath();for(let i=0;i<values.length;i++){const x=xStart+(xEnd-xStart)*i/(values.length-1),y=dbToY(Math.max(-18,Math.min(18,values[i])),h);i?c.lineTo(x,y):c.moveTo(x,y);}c.lineWidth=2.3;c.strokeStyle='#b3eccb';c.shadowColor='#6ab98c';c.shadowBlur=13;c.stroke();c.shadowBlur=0;
  for(const [i,k] of bands.entries()){const f=DSP.BANDS[k].frequency,x=freqToX(f,w),y=dbToY(responseAt(f),h),color=['#79cfac','#e3cca5','#a5b5ec'][i];c.beginPath();c.arc(x,y,9,0,Math.PI*2);c.fillStyle='#142320';c.fill();c.lineWidth=1.5;c.strokeStyle=color;c.stroke();c.beginPath();c.arc(x,y,3.6,0,Math.PI*2);c.fillStyle=color;c.fill();}
}
// Handles sit exactly on the response curve, which is the sum of all filters.
function responseAt(freq){if(!liveFilters)return 0;return DSP.response(liveFilters,[freq])[0];}
// Inverse mapping: find a band gain that puts its RESPONSE handle nearest
// to the pointer. A gain value is not itself the resulting total dB at a frequency.
function solveGainForResponse(key,target){
 const f=DSP.BANDS[key].frequency,node=liveFilters.find(v=>v.key===key).node,old=gains[key];
 const measure=g=>{node.gain.value=g;return responseAt(f)};
 let a=-12,b=12,ra=measure(a),rb=measure(b),ascending=rb>=ra;
 target=Math.max(Math.min(ra,rb),Math.min(Math.max(ra,rb),target));
 for(let i=0;i<18;i++){const m=(a+b)/2,r=measure(m);if((r<target)===ascending)a=m;else b=m;}
 node.gain.value=old;return (a+b)/2;
}
let dragged=null;
function graphPoint(e){const r=graph.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top,w:r.width,h:r.height};}
graph.addEventListener('pointerdown',e=>{const p=graphPoint(e);let nearest=null,dist=Infinity;for(const k of bands){const x=freqToX(DSP.BANDS[k].frequency,p.w),y=dbToY(responseAt(DSP.BANDS[k].frequency),p.h),d=Math.hypot(p.x-x,p.y-y);if(d<dist){dist=d;nearest=k;}}if(dist>35)return;dragged=nearest;graph.setPointerCapture(e.pointerId);updateBand(dragged,solveGainForResponse(dragged,yToDb(p.y,p.h)));});
graph.addEventListener('pointermove',e=>{if(!dragged)return;const p=graphPoint(e);updateBand(dragged,solveGainForResponse(dragged,yToDb(p.y,p.h)));});
graph.addEventListener('pointerup',()=>dragged=null);graph.addEventListener('pointercancel',()=>dragged=null);
function drawWave(){const sz=sizeCanvas(wave,waveCtx);if(!sz)return;const {w,h}=sz,c=waveCtx;c.clearRect(0,0,w,h);c.fillStyle='#0b1314';c.fillRect(0,0,w,h);const mid=h*.5;
 c.strokeStyle='#243832';c.beginPath();c.moveTo(0,mid);c.lineTo(w,mid);c.stroke();if(!sourceBuffer)return;
 const data=sourceBuffer.getChannelData(0),n=Math.max(1,Math.floor(w)),samples=data.length;
 for(let x=0;x<n;x++){let a=Math.floor(x*samples/n),b=Math.max(a+1,Math.floor((x+1)*samples/n)),lo=1,hi=-1;const stride=Math.max(1,Math.floor((b-a)/300));for(let i=a;i<b;i+=stride){const v=data[i];if(v<lo)lo=v;if(v>hi)hi=v;}c.strokeStyle=x/w<progress?'#a9e9c7':'#5e987e';c.globalAlpha=x/w<progress?.98:.7;c.beginPath();c.moveTo(x,mid-hi*mid*.78);c.lineTo(x,mid-lo*mid*.78);c.stroke();}c.globalAlpha=1;
 const px=progress*w;c.strokeStyle='#e0f6e8';c.lineWidth=1.3;c.beginPath();c.moveTo(px,0);c.lineTo(px,h);c.stroke();}
function fmt(t){const m=Math.floor(t/60),s=Math.floor(t%60);return `${m}:${String(s).padStart(2,'0')}`;}
function updateTime(){const dur=sourceBuffer?.duration||0;$('time').textContent=`${fmt(progress*dur)} / ${fmt(dur)}`;}
function animate(){if(!playing||!ctx||!sourceBuffer)return;progress=Math.min(1,(ctx.currentTime-sourceStart)/sourceBuffer.duration);drawWave();updateTime();if(progress<1)raf=requestAnimationFrame(animate);}
function stopAudio(reset=true){playVersion++;cancelAnimationFrame(raf);if(sourceNode){const old=sourceNode;sourceNode=null;old.onended=null;try{old.stop();}catch{}try{old.disconnect();}catch{}}playing=false;$('play').innerHTML='▶ <span>Play</span>';if(reset)progress=0;drawWave();updateTime();}
async function playAudio(){if(!sourceBuffer)return;try{if(playing){stopAudio(false);return;}const token=++playVersion;const ac=ensureContext();await ac.resume();if(token!==playVersion)return;const src=ac.createBufferSource();src.buffer=sourceBuffer;src.connect(liveFilters[0].node);src.connect(dryBus);src.onended=()=>{if(sourceNode!==src)return;stopAudio(false);progress=1;drawWave();updateTime();setStatus('Playback complete');};sourceNode=src;sourceStart=ac.currentTime;progress=0;playing=true;src.start(0);$('play').innerHTML='Ⅱ <span>Pause</span>';setStatus('Playing');animate();}catch(err){setStatus('Playback failed: '+err.message,true);}}
$('play').addEventListener('click',playAudio);$('stop').addEventListener('click',()=>{stopAudio();setStatus(sourceBuffer?'Ready':'No audio loaded');});
function updateEnabled(){const available=!!sourceBuffer;$('play').disabled=!available;$('stop').disabled=!available;$('export').disabled=!available||rendering;}
async function loadFile(file){if(!file)return;const version=++loadVersion;stopAudio();setStatus('Decoding audio…');try{const ac=ensureContext(),array=await file.arrayBuffer(),buf=await ac.decodeAudioData(array);if(version!==loadVersion)return;if(!buf.length||buf.duration>600)throw Error('Choose an audio file up to 10 minutes');sourceBuffer=buf;fileBase=(file.name||'tone-sculptor').replace(/\.[^.]+$/,'').replace(/[^a-z0-9_-]+/gi,'_').slice(0,70);$('fileName').textContent=file.name;$('fileMeta').textContent=`${buf.duration.toFixed(1)} s · ${buf.numberOfChannels} ch · ${(buf.sampleRate/1000).toFixed(1)} kHz`;$('uploadPrompt').hidden=true;progress=0;drawWave();updateTime();updateEnabled();setStatus('Ready');}catch(err){if(version!==loadVersion)return;setStatus('Could not load audio: '+err.message,true);}}
$('load').addEventListener('click',()=> $('fileInput').click());$('fileInput').addEventListener('change',e=>{loadFile(e.target.files[0]);e.target.value='';});
const zone=$('dropZone');zone.addEventListener('click',()=> $('fileInput').click());zone.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('fileInput').click();}});
zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('dragover');});zone.addEventListener('dragleave',()=>zone.classList.remove('dragover'));zone.addEventListener('drop',e=>{e.preventDefault();zone.classList.remove('dragover');loadFile(e.dataTransfer.files[0]);});
$('export').addEventListener('click',async()=>{if(!sourceBuffer||rendering)return;rendering=true;updateEnabled();setStatus('Rendering WAV…');const current=sourceBuffer,settings={...gains};try{const rendered=await DSP.render(current,settings,bypassed),blob=DSP.encodeWav(rendered),url=URL.createObjectURL(blob),anchor=document.createElement('a');anchor.href=url;anchor.download=`${fileBase}_ToneSculptor.wav`;document.body.appendChild(anchor);anchor.click();anchor.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);setStatus(bypassed?'Original WAV exported (EQ bypassed)':'WAV exported');}catch(err){setStatus('Export failed: '+err.message,true);}finally{rendering=false;updateEnabled();}});
window.addEventListener('resize',()=>{drawGraph();drawWave();});
if('ResizeObserver' in window){new ResizeObserver(()=>{drawGraph();drawWave();}).observe($('app'));}
syncUI();drawWave();updateTime();updateEnabled();
})();
