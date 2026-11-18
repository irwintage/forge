(function(){
'use strict';
const $=s=>document.querySelector(s),presets=window.ReverbPresets,DSP=window.ReverbDSP;
const controls=['mix','decay','predelay','damping','width','diffusion'];
const sliders=Object.fromEntries(controls.map(k=>[k,$('#'+k)]));
const values=Object.fromEntries(controls.map(k=>[k,$('#'+k+'Val')]));
const play=$('#play'),stop=$('#stop'),exp=$('#export'),file=$('#file'),demo=$('#demo'),info=$('#fileInfo'),bypass=$('#bypass'),preset=$('#preset'),master=$('#master'),dropzone=$('#dropzone');
const display=window.ReverbDisplay.create($('#scope'),[$('#meterL'),$('#meterR')]);
let audio=null,buffer=null,source=null,engine=null,analyser=null,masterGain=null,playing=false,paused=0,started=0,sourceOffset=0,active='room',params={...presets.room},bypassed=false,busy=false,tailTimer=null;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function setStatus(txt){info.textContent=txt}
function ensureAudio(){if(!audio){audio=new(window.AudioContext||window.webkitAudioContext)({latencyHint:'interactive'});}return audio}
async function resume(){const ctx=ensureAudio();if(ctx.state!=='running')await ctx.resume();return ctx}
function fmt(k,p){if(k==='decay')return Number(p[k]).toFixed(2)+' s';if(k==='predelay')return Math.round(p[k])+' ms';return Math.round(p[k])+'%'}
function paint(){
 for(const k of controls){const v=params[k];sliders[k].value=k==='decay'?(v-.45)/8.05*100:k==='predelay'?v/120*100:v;values[k].textContent=fmt(k,params)}
 $('#readout').textContent=params.decay.toFixed(2)+' s';display.set(params);
 $('#engineName').textContent=presets[active].name;
 $('#displayMode').textContent=presets[active].name.toUpperCase();
 $('#effectInfo').textContent=presets[active].description;
}
function effectParams(){return {...params,mix:bypassed?0:params.mix}}
function updateDSP(){if(engine)engine.apply(effectParams());display.set(params)}
function choosePreset(name){if(!presets[name])return;active=name;params={...presets[name]};preset.value=name;paint();updateDSP()}
Object.entries(presets).forEach(([key,p])=>{const opt=document.createElement('option');opt.value=key;opt.textContent=p.name;preset.appendChild(opt)});
preset.addEventListener('change',e=>choosePreset(e.target.value));$('#reset').onclick=()=>choosePreset(active);
for(const k of controls){sliders[k].addEventListener('input',e=>{const v=Number(e.target.value);params[k]=k==='decay'?.45+8.05*v/100:k==='predelay'?v*1.2:v;paint();updateDSP()})}
master.oninput=()=>{$('#masterValue').textContent=master.value+'%';if(masterGain)masterGain.gain.setTargetAtTime(Number(master.value)/100,audio.currentTime,.02)};
bypass.onclick=()=>{bypassed=!bypassed;bypass.classList.toggle('off',bypassed);bypass.setAttribute('aria-pressed',String(bypassed));bypass.textContent=bypassed?'Bypassed':'Effect On';updateDSP()};
function cleanup({reset=false}={}){
 if(tailTimer){clearTimeout(tailTimer);tailTimer=null}
 if(source){source.onended=null;try{source.stop()}catch{}try{source.disconnect()}catch{}source=null}
 if(engine){engine.dispose();engine=null}if(analyser){try{analyser.disconnect()}catch{}analyser=null}
 if(masterGain){try{masterGain.disconnect()}catch{}masterGain=null}
 display.setAnalyser(null);playing=false;play.textContent='▶ Play';stop.disabled=!buffer;
 if(reset)paused=0;
}
async function start(){if(!buffer)return;const ctx=await resume();cleanup();
 if(paused>=buffer.duration-.01)paused=0;
 const offset=paused;source=ctx.createBufferSource();source.buffer=buffer;
 engine=DSP.create(ctx,effectParams());analyser=ctx.createAnalyser();analyser.fftSize=2048;
 masterGain=ctx.createGain();masterGain.gain.value=Number(master.value)/100;
 source.connect(engine.input);engine.output.connect(masterGain);masterGain.connect(ctx.destination);masterGain.connect(analyser);display.setAnalyser(analyser);
 sourceOffset=offset;started=ctx.currentTime;source.onended=()=>{
  if(!playing)return;playing=false;paused=0;play.textContent='▶ Play';
  setStatus('Reverb tail…');
  tailTimer=setTimeout(()=>{cleanup({reset:true});setStatus('Ready')},Math.ceil(Math.min(11,params.decay*1.28+params.predelay/1000+.5)*1000));
 };
 source.start(0,offset);playing=true;play.textContent='Ⅱ Pause';stop.disabled=false;
}
function pause(){if(!playing)return;paused=Math.min(buffer.duration,sourceOffset+audio.currentTime-started);cleanup()}
function toggle(){if(playing)pause();else start().catch(e=>setStatus('Playback error: '+e.message))}
play.onclick=toggle;stop.onclick=()=>cleanup({reset:true});
async function loadFile(f){if(!f)return;try{setStatus('Decoding audio…');const ctx=await resume();const data=await f.arrayBuffer();const decoded=await ctx.decodeAudioData(data);cleanup({reset:true});buffer=decoded;setStatus(f.name+' · '+decoded.duration.toFixed(1)+'s · '+decoded.sampleRate+' Hz');play.disabled=false;stop.disabled=false;exp.disabled=false}catch(e){setStatus('Could not open audio: '+e.message)}}
file.onchange=e=>loadFile(e.target.files?.[0]);
demo.onclick=async()=>{try{const ctx=await resume();cleanup({reset:true});buffer=DSP.demo(ctx);setStatus('Demo · soft plucked notes · '+buffer.duration.toFixed(1)+'s');play.disabled=false;stop.disabled=false;exp.disabled=false}catch(e){setStatus('Demo error: '+e.message)}};
let dragCounter=0;
for(const ev of ['dragenter','dragover'])document.addEventListener(ev,e=>{if(!Array.from(e.dataTransfer?.types||[]).includes('Files'))return;e.preventDefault();if(ev==='dragenter')dragCounter++;dropzone.classList.add('drag-active')});
document.addEventListener('dragleave',e=>{if(!Array.from(e.dataTransfer?.types||[]).includes('Files'))return;dragCounter=Math.max(0,dragCounter-1);if(!dragCounter)dropzone.classList.remove('drag-active')});
document.addEventListener('drop',e=>{e.preventDefault();dragCounter=0;dropzone.classList.remove('drag-active');const f=Array.from(e.dataTransfer?.files||[]).find(x=>x.type.startsWith('audio/')||/\.(wav|mp3|ogg|m4a|flac|aac)$/i.test(x.name));if(f)loadFile(f)});
window.addEventListener('keydown',e=>{if(e.code==='Space'&&!e.repeat&&!['INPUT','SELECT','TEXTAREA','BUTTON'].includes(document.activeElement?.tagName)){e.preventDefault();toggle()}});
exp.onclick=async()=>{if(!buffer||busy)return;busy=true;exp.disabled=true;exp.textContent='Rendering…';
 try{const p=effectParams(),sr=buffer.sampleRate,tail=Math.max(1.3,Math.min(11,p.decay*1.28+.55+p.predelay/1000));const n=Math.ceil((buffer.duration+tail)*sr);
 const ctx=new OfflineAudioContext(2,n,sr),src=ctx.createBufferSource(),fx=DSP.create(ctx,p),gain=ctx.createGain();
 src.buffer=buffer;gain.gain.value=Number(master.value)/100;src.connect(fx.input);fx.output.connect(gain);gain.connect(ctx.destination);src.start(0);
 const rendered=await ctx.startRendering(),wav=DSP.encodeWAV(rendered),url=URL.createObjectURL(wav),a=document.createElement('a');
 a.href=url;a.download='chrysasynth-reverb-'+Date.now()+'.wav';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
 setStatus('WAV exported · '+(wav.size/1024/1024).toFixed(1)+' MB');
 }catch(e){setStatus('Export failed: '+e.message)}finally{busy=false;exp.disabled=!buffer;exp.textContent='↓ WAV'}
};
choosePreset('room');window.ReverbForge={stop:()=>cleanup({reset:true}),destroy:()=>{cleanup({reset:true});display.destroy();audio?.close()}};
})();
