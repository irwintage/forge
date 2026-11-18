(function(){'use strict';
const $=id=>document.getElementById(id);const audio=new window.BreathAudio();
const names=['Inhale','Hold','Exhale','Hold'];const elems={pattern:$('pattern'),duration:$('duration'),start:$('start'),stop:$('stop'),phase:$('phase'),count:$('count'),hint:$('hint'),state:$('state'),sessionTime:$('sessionTime'),cursor:$('cursor'),fill:$('guideFill'),progress:$('progress'),steps:[...$('phaseSteps').children],custom:$('custom'),texture:$('texture'),sound:$('sound'),volume:$('volume'),volumeLabel:$('volumeLabel'),description:$('soundDescription')};
const customInputs=[$('inDur'),$('holdIn'),$('outDur'),$('holdOut')];
let active=false,startTime=0,elapsed=0,raf=0,durations=[4,4,4,4],limit=0,phaseIndex=-1,lastSoundError='';
const clamp=(n,lo,hi)=>Math.min(hi,Math.max(lo,n));
function readDurations(){switch(elems.pattern.value){case 'box':return [4,4,4,4];case 'focus':return [5,5,5,5];case 'relax':return [4,7,8,0];default:return customInputs.map((e,i)=>{const v=Number(e.value);return Number.isFinite(v)?clamp(v,i===0||i===2?1:0,30):(i===0||i===2?4:0);});}}
function mmss(s){const n=Math.floor(Math.max(0,s));return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;}
function frame(){if(!active)return;elapsed=(performance.now()-startTime)/1000;if(limit&&elapsed>=limit){finish(true);return;}
 let cyc=durations.reduce((a,b)=>a+b,0),position=elapsed%cyc,idx=0;
 for(let i=0;i<4;i++){if(durations[i]===0)continue;if(position<durations[i]){idx=i;break;}position-=durations[i];}
 const fraction=clamp(position/durations[idx],0,1);
 if(idx!==phaseIndex){phaseIndex=idx;elems.steps.forEach((s,i)=>s.classList.toggle('active',i===idx));elems.phase.textContent=names[idx];elems.hint.textContent=idx===0?'Breathe in gently':idx===2?'Release slowly':'Rest in stillness';}
 elems.count.textContent=(durations[idx]-position).toFixed(1);elems.progress.style.width=(fraction*100)+'%';elems.fill.style.transform=`scale(${idx===0?.75+.32*fraction:idx===2?1.07-.32*fraction:idx===1?1.07:.75})`;elems.fill.style.opacity=String(idx===0?.25+.42*fraction:idx===2?.67-.42*fraction:.4);
 window.BreathDisplay.position(elems.cursor,idx,fraction);elems.sessionTime.textContent=mmss(limit?Math.max(0,limit-elapsed):elapsed);audio.setPhase(names[idx],fraction);raf=requestAnimationFrame(frame);
}
function setControls(running){elems.start.disabled=running;elems.stop.disabled=!running;elems.pattern.disabled=running;elems.duration.disabled=running;customInputs.forEach(e=>e.disabled=running);}
function start(){if(active)return;durations=readDurations();if(durations.reduce((a,b)=>a+b,0)<=0)return;limit=Number(elems.duration.value)||0;elapsed=0;phaseIndex=-1;active=true;setControls(true);elems.state.textContent='IN SESSION';startTime=performance.now();frame();}
function finish(completed){active=false;cancelAnimationFrame(raf);setControls(false);phaseIndex=-1;elems.steps.forEach(e=>e.classList.remove('active'));elems.phase.textContent=completed?'Complete':'Ready';elems.count.textContent='4.0';elems.hint.textContent=completed?'Session complete':'Begin at your own pace';elems.progress.style.width='0%';elems.state.textContent=completed?'COMPLETE':'READY';elems.fill.style.transform='scale(.8)';elems.fill.style.opacity='.35';window.BreathDisplay.position(elems.cursor,0,0);elems.sessionTime.textContent=mmss(completed?0:0);audio.setPhase('Hold',0);}
elems.start.addEventListener('click',start);elems.stop.addEventListener('click',()=>finish(false));elems.pattern.addEventListener('change',()=>{elems.custom.classList.toggle('hidden',elems.pattern.value!=='custom');if(!active){elems.count.textContent=readDurations()[0].toFixed(1);}});
elems.texture.addEventListener('change',()=>{const m=elems.texture.value;audio.setMode(m);elems.description.textContent=m==='alpha'?'Stereo binaural tones · headphones recommended':'Soft brown noise';});
elems.volume.addEventListener('input',()=>{const v=Number(elems.volume.value);elems.volumeLabel.textContent=v+'%';audio.setVolume(v/100);});
elems.sound.addEventListener('click',async()=>{const desired=elems.sound.getAttribute('aria-checked')!=='true';elems.sound.disabled=true;try{await audio.setEnabled(desired);elems.sound.classList.toggle('on',desired);elems.sound.setAttribute('aria-checked',String(desired));elems.description.textContent=elems.texture.value==='alpha'?'Stereo binaural tones · headphones recommended':'Soft brown noise';}catch(err){lastSoundError=String(err);elems.description.textContent='Audio unavailable: '+(err.message||'browser error');}finally{elems.sound.disabled=false;}});
audio.setVolume(.3);window.BreathDisplay.position(elems.cursor,0,0);elems.count.textContent='4.0';
})();
