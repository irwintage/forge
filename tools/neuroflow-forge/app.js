/* NeuroFlow Forge module: scoped UI, timer, animation and lifecycle. */
(function(){
'use strict';
const root=document.getElementById('neuroflow');if(!root||!window.NeuroFlowAudio)return;
const $=id=>root.querySelector('#'+id);
const audio=new window.NeuroFlowAudio();
const canvas=$('nf-wave'),ctx=canvas.getContext('2d');
const carrier=$('nf-carrier'),beat=$('nf-beat'),volume=$('nf-volume');
const presetBtns=Array.from(root.querySelectorAll('[data-band]'));
let playing=false, raf=0, timerHandle=0, endAt=0, lastFrame=0, destroyStarted=false;
let leftSamples=new Float32Array(2048),rightSamples=new Float32Array(2048);
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}
function progress(el){const lo=Number(el.min),hi=Number(el.max);el.style.setProperty('--progress',`${100*(Number(el.value)-lo)/(hi-lo)}%`);}
function updateFrequencies(){
  const c=Number(carrier.value),b=Number(beat.value);
  audio.setFrequencies(c,b);
  $('nf-carrier-val').textContent=`${c} Hz`;
  $('nf-beat-val').textContent=`${b.toFixed(1)} Hz`;
  $('nf-band-hz').innerHTML=`${b.toFixed(1)} <small>Hz</small>`;
  $('nf-left-hz').textContent=`${c.toFixed(1)} Hz`;
  $('nf-right-hz').textContent=`${(c+b).toFixed(1)} Hz`;
  for(const el of [carrier,beat,volume])progress(el);
  const matching=presetBtns.find(btn=>Math.abs(Number(btn.dataset.beat)-b)<.05);
  presetBtns.forEach(btn=>{const sel=btn===matching;btn.classList.toggle('active',sel);btn.setAttribute('aria-pressed',String(sel));});
  $('nf-band-name').textContent=matching?matching.dataset.band.toUpperCase():'CUSTOM';
}
function updateVolume(){const v=Number(volume.value);$('nf-volume-val').textContent=`${v}%`;audio.setVolume(v/100);progress(volume);}
function clearTimer(){if(timerHandle)clearInterval(timerHandle);timerHandle=0;endAt=0;$('nf-time-left').textContent='';}
function timerTick(){if(!playing||!endAt)return;const remaining=Math.max(0,Math.ceil((endAt-performance.now())/1000));const m=Math.floor(remaining/60),s=remaining%60;$('nf-time-left').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;if(remaining<=0)stop();}
function scheduleTimer(){clearTimer();if(!playing)return;const duration=Number($('nf-timer').value);if(!duration)return;endAt=performance.now()+duration*1000;timerTick();timerHandle=setInterval(timerTick,200);}
function syncState(){
  $('nf-play').classList.toggle('is-playing',playing);
  $('nf-play').setAttribute('aria-pressed',String(playing));
  $('nf-status').textContent=playing?'PLAYING':'READY';
  $('nf-status').classList.toggle('active',playing);
  $('nf-idle-overlay').textContent=playing?'LIVE STEREO':'STEREO SIGNAL';
}
async function start(){if(destroyStarted||playing)return;try{
    // Prevent double-click races while audio context resumes.
    $('nf-play').disabled=true;
    await audio.play();
    if(destroyStarted){await audio.destroy();return;}
    playing=true;syncState();scheduleTimer();
  }catch(e){console.error('NeuroFlow audio:',e);$('nf-status').textContent='AUDIO UNAVAILABLE';}
  finally{$('nf-play').disabled=false;}
}
function stop(){playing=false;audio.stop();clearTimer();syncState();}
function sizeCanvas(){
 const box=canvas.getBoundingClientRect();if(!box.width||!box.height)return null;
 const dpr=Math.min(2,window.devicePixelRatio||1),w=Math.floor(box.width*dpr),h=Math.floor(box.height*dpr);
 if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
 ctx.setTransform(dpr,0,0,dpr,0,0);return {w:box.width,h:box.height};
}
function drawWaveform(w,h,samples,color,yCenter,amp){
  if(!playing)return;
  ctx.save();ctx.beginPath();
  // Show about 12 periods of carrier for stable, readable shape.
  const periodSamples=audio.context?audio.context.sampleRate/Math.max(1,audio.carrier):220;
  const span=Math.min(samples.length,Math.max(64,Math.round(periodSamples*12)));
  const stride=(span-1)/Math.max(1,w);
  let trigger=0;
  for(let i=1;i<samples.length-span-2;i++){if(samples[i-1]<0&&samples[i]>=0){trigger=i;break;}}
  for(let px=0;px<=Math.round(w);px++){
    const idx=Math.min(samples.length-1,trigger+Math.floor(px*stride));
    const x=px,y=yCenter-samples[idx]*amp;
    if(px===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  }
  ctx.strokeStyle=color;ctx.lineWidth=1.7;ctx.lineJoin='round';ctx.lineCap='round';ctx.shadowColor=color;ctx.shadowBlur=8;ctx.stroke();ctx.restore();
}
function drawFrame(timestamp){
  raf=requestAnimationFrame(drawFrame);
  if(document.hidden||timestamp-lastFrame<30)return;lastFrame=timestamp;
  const size=sizeCanvas();if(!size)return;const {w,h}=size;
  ctx.clearRect(0,0,w,h);
  ctx.lineWidth=1;ctx.strokeStyle='rgba(143,184,207,.09)';
  for(let i=1;i<6;i++){const x=w*i/6;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
  for(let i=1;i<5;i++){const y=h*i/5;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  ctx.strokeStyle='rgba(137,191,214,.16)';ctx.beginPath();ctx.moveTo(0,h/2);ctx.lineTo(w,h/2);ctx.stroke();
  if(playing&&audio.readWave(leftSamples,rightSamples)){
    const amp=Math.min(h*.19,95);
    drawWaveform(w,h,leftSamples,'#7cdaf1',h*.34,amp);
    drawWaveform(w,h,rightSamples,'#aa9df2',h*.66,amp);
  }else{
    // Thin static guides for an informative, quiet idle view.
    ctx.setLineDash([4,8]);ctx.strokeStyle='rgba(117,196,219,.20)';
    for(const y of [h*.34,h*.66]){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
    ctx.setLineDash([]);
  }
}
const onVisibility=()=>{if(document.hidden)lastFrame=0;};
function onPageHide(){stop();}
function onKeyDown(e){if(e.code==='Escape'&&document.fullscreenElement===root)document.exitFullscreen?.();}
$('nf-play').addEventListener('click',start);
$('nf-stop').addEventListener('click',stop);
carrier.addEventListener('input',updateFrequencies);beat.addEventListener('input',updateFrequencies);
volume.addEventListener('input',updateVolume);
presetBtns.forEach(btn=>btn.addEventListener('click',()=>{beat.value=btn.dataset.beat;updateFrequencies();}));
$('nf-timer').addEventListener('change',scheduleTimer);
$('nf-fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement===root)await document.exitFullscreen();else await root.requestFullscreen();}catch(e){console.warn('Fullscreen unavailable:',e);}});
document.addEventListener('visibilitychange',onVisibility);
window.addEventListener('pagehide',onPageHide);
window.addEventListener('keydown',onKeyDown);
updateFrequencies();updateVolume();syncState();raf=requestAnimationFrame(drawFrame);
async function destroy(){if(destroyStarted)return;destroyStarted=true;stop();cancelAnimationFrame(raf);document.removeEventListener('visibilitychange',onVisibility);window.removeEventListener('pagehide',onPageHide);window.removeEventListener('keydown',onKeyDown);if(document.fullscreenElement===root)await document.exitFullscreen();await audio.destroy();}
window.ForgeNeuroFlow={stop,destroy};
})();
