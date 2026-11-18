(function(){
'use strict';
const root=document.getElementById('bb-app');if(!root)return;
const el=id=>root.querySelector('#'+id);
const audio=new window.BinauralAudio();
const state={base:220,beat:8,wave:'sine',master:22,noise:false,noiseLevel:12,playing:false,endAt:0,interval:null,raf:0,phase:0,lastFrame:0,destroyed:false};
const C={base:el('bb-base'),baseNum:el('bb-base-num'),beat:el('bb-beat'),beatNum:el('bb-beat-num'),master:el('bb-master'),noise:el('bb-noise'),noiseLevel:el('bb-noise-level'),wave:el('bb-wave'),play:el('bb-play'),timer:el('bb-timer'),canvas:el('bb-canvas')};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const format=n=>n.toFixed(1);
function sliderFill(input){const min=Number(input.min)||0,max=Number(input.max)||100;input.style.setProperty('--fill',((Number(input.value)-min)/(max-min)*100)+'%');}
function refresh(){
  C.base.value=state.base;C.baseNum.value=state.base;
  C.beat.value=state.beat;C.beatNum.value=state.beat;
  el('bb-left').textContent=format(state.base-state.beat/2)+' Hz';
  el('bb-right').textContent=format(state.base+state.beat/2)+' Hz';
  el('bb-wave-caption').textContent=`L ${format(state.base-state.beat/2)} Hz  /  R ${format(state.base+state.beat/2)} Hz`;
  root.querySelectorAll('[data-beat]').forEach(b=>b.classList.toggle('active',Math.abs(Number(b.dataset.beat)-state.beat)<.001));
  for(const slider of [C.base,C.beat,C.master,C.noiseLevel])sliderFill(slider);
}
function setBase(value){const n=Number(value);if(!Number.isFinite(n))return;state.base=clamp(n,40,1000);refresh();audio.setFrequencies(state.base,state.beat);drawStatic();}
function setBeat(value){const n=Number(value);if(!Number.isFinite(n))return;state.beat=clamp(n,.5,40);refresh();audio.setFrequencies(state.base,state.beat);drawStatic();}
for(const [input,fn] of [[C.base,setBase],[C.beat,setBeat]])input.addEventListener('input',()=>fn(input.value));
for(const [input,fn,def] of [[C.baseNum,setBase,220],[C.beatNum,setBeat,8]]){
  input.addEventListener('input',()=>{if(input.value==='')return;const n=Number(input.value);if(Number.isFinite(n)&&n>=Number(input.min)&&n<=Number(input.max))fn(n);});
  input.addEventListener('change',()=>fn(Number.isFinite(Number(input.value))&&input.value!==''?input.value:def));
}
root.querySelectorAll('[data-beat]').forEach(b=>b.addEventListener('click',()=>setBeat(b.dataset.beat)));
C.master.addEventListener('input',()=>{state.master=Number(C.master.value);el('bb-master-val').textContent=state.master+'%';sliderFill(C.master);audio.setVolume(state.master/100);});
C.noiseLevel.addEventListener('input',()=>{state.noiseLevel=Number(C.noiseLevel.value);el('bb-noise-val').textContent=state.noiseLevel+'%';sliderFill(C.noiseLevel);audio.setNoiseLevel(state.noiseLevel/100);});
C.noise.addEventListener('change',()=>{state.noise=C.noise.checked;root.querySelector('.bb-noise-volume').classList.toggle('dimmed',!state.noise);audio.setNoiseEnabled(state.noise);});
C.wave.addEventListener('change',()=>{state.wave=C.wave.value;audio.setWave(state.wave);});
function stateUI(){el('bb-status').classList.toggle('active',state.playing);el('bb-status').innerHTML=state.playing?'<span></span> PLAYING':'<span></span> READY';C.play.querySelector('span').textContent=state.playing?'Pause':'Play';C.play.querySelector('svg').innerHTML=state.playing?'<path d="M7 5h4v14H7zm7 0h4v14h-4z"/>':'<path d="m8 5 12 7-12 7z"/>';}
function cancelTimer(){if(state.interval){clearInterval(state.interval);state.interval=null;}state.endAt=0;el('bb-remaining').textContent='';}
function scheduleTimer(){cancelTimer();const secs=Number(C.timer.value);if(!secs||!state.playing)return;state.endAt=Date.now()+secs*1000;state.interval=setInterval(tickTimer,250);tickTimer();}
function tickTimer(){if(!state.endAt)return;const sec=Math.max(0,Math.ceil((state.endAt-Date.now())/1000));el('bb-remaining').textContent=String(Math.floor(sec/60))+':'+String(sec%60).padStart(2,'0');if(sec<=0)stop();}
function stop(){audio.stop();state.playing=false;cancelTimer();stateUI();}
async function start(){if(state.playing)return;C.play.disabled=true;try{await audio.start({base:state.base,beat:state.beat,wave:state.wave,volume:state.master/100,noise:state.noise,noiseLevel:state.noiseLevel/100});if(state.destroyed){await audio.destroy();return;}state.playing=true;stateUI();scheduleTimer();}catch(err){console.error('Binaural Beats audio error:',err);el('bb-status').textContent='AUDIO UNAVAILABLE';}finally{C.play.disabled=false;}}
C.play.addEventListener('click',()=>state.playing?stop():start());el('bb-stop').addEventListener('click',stop);C.timer.addEventListener('change',scheduleTimer);
// This animated illustration is a deliberately slowed visualization of the frequency difference,
// not a literal time-domain plot of 220 Hz audio.
function paint(ts){const canvas=C.canvas,rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;const dpi=Math.min(2,window.devicePixelRatio||1),w=rect.width,h=rect.height,pw=Math.round(w*dpi),ph=Math.round(h*dpi);if(canvas.width!==pw||canvas.height!==ph){canvas.width=pw;canvas.height=ph;}const ctx=canvas.getContext('2d');ctx.setTransform(dpi,0,0,dpi,0,0);ctx.clearRect(0,0,w,h);ctx.strokeStyle='rgba(164,186,202,.12)';ctx.lineWidth=1;for(let i=1;i<5;i++){ctx.beginPath();ctx.moveTo(i*w/5,0);ctx.lineTo(i*w/5,h);ctx.stroke();}ctx.strokeStyle='rgba(164,186,202,.11)';for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(0,i*h/4);ctx.lineTo(w,i*h/4);ctx.stroke();}
 const dt=Math.min(.05,((ts||0)-(state.lastFrame||ts||0))/1000);state.lastFrame=ts||0;if(state.playing)state.phase+=dt*(.45+state.beat*.045);
 const cycles=3.6+(state.base-40)/960*2.1;
 for(let channel=0;channel<2;channel++){
  const color=channel===0?'#ffcc82':'#8fd4ea';
  const phase=state.phase*(channel===0?1:-1);
  const baseline=h*(channel===0?.33:.67),amp=h*.18;
  ctx.beginPath();for(let i=0;i<=w;i+=2){const t=i/w;const envelope=.77+.20*Math.sin(2*Math.PI*t+phase*.8);const y=baseline+Math.sin(t*2*Math.PI*cycles+phase)*amp*envelope;if(i===0)ctx.moveTo(i,y);else ctx.lineTo(i,y);}
  ctx.strokeStyle=color;ctx.lineWidth=1.9;ctx.shadowBlur=state.playing?12:4;ctx.shadowColor=color;ctx.stroke();ctx.shadowBlur=0;
 }
}
function animate(ts){if(state.destroyed)return;paint(ts);state.raf=requestAnimationFrame(animate);}function drawStatic(){if(!state.playing)paint(performance.now());}
const resizeObserver=typeof ResizeObserver!=='undefined'?new ResizeObserver(drawStatic):null;if(resizeObserver)resizeObserver.observe(C.canvas);
function onPageHide(){stop();}
window.addEventListener('pagehide',onPageHide);
async function destroy(){if(state.destroyed)return;state.destroyed=true;stop();cancelAnimationFrame(state.raf);resizeObserver?.disconnect();window.removeEventListener('pagehide',onPageHide);await audio.destroy();if(window.ForgeBinaural===api)delete window.ForgeBinaural;}
const api={stop,destroy};window.ForgeBinaural=api;
root.querySelector('.bb-noise-volume').classList.add('dimmed');refresh();stateUI();state.raf=requestAnimationFrame(animate);
})();
