'use strict';
(()=>{
  const $=id=>document.getElementById(id);
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  const presets=window.DUALITY_PRESETS,scales=window.DUALITY_SCALES;
  let currentSeed='juxtaposedVenus',pattern=presets[currentSeed].pattern.slice();
  let angle=0,orbit=false,speed=.24,dragging=false,playing=false,lastFrame=null,lastMix=-1,canvasSize=0,activeStep=-1;
  const ring=$('ring'),ctx=ring.getContext('2d');
  let engine;
  if(window.DualityAudioEngine){engine=new DualityAudioEngine(showStep);engine.getPattern=()=>pattern;engine.getNotes=()=>notesForScale();}
  function status(str,on=false){$('status').textContent=str;$('statusLight').classList.toggle('on',on);}
  function rootMidi(){const value=$('root').value;const m=value.match(/^([A-G]#?)(\d)$/);if(!m)return 52;const index={C:0,'C#':1,D:2,'D#':3,E:4,F:5,'F#':6,G:7,'G#':8,A:9,'A#':10,B:11};return (Number(m[2])+1)*12+index[m[1]];}
  function noteFromMidi(m){const names=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];return names[m%12]+(Math.floor(m/12)-1);}
  function notesForScale(){const root=rootMidi();return scales[$('scale').value].map(i=>noteFromMidi(root+i));}
  function updateScaleText(){const notes=notesForScale();$('notePreview').textContent=notes.join(' · ');}
  function buildSteps(){const labels=$('stepLabels'),holder=$('steps');labels.innerHTML='';holder.innerHTML='';for(let i=0;i<16;i++){
    const label=document.createElement('span');label.textContent=String(i+1).padStart(2,'0');labels.append(label);
    const btn=document.createElement('button');btn.type='button';btn.className=pattern[i]?'on':'';btn.setAttribute('aria-label',`Step ${i+1}`);btn.setAttribute('aria-pressed',String(!!pattern[i]));btn.addEventListener('click',()=>{pattern[i]=pattern[i]?0:1;refreshSteps()});holder.append(btn);
  }refreshSteps();}
  function refreshSteps(){Array.from($('steps').children).forEach((btn,i)=>{btn.classList.toggle('on',!!pattern[i]);btn.classList.toggle('playing',activeStep===i);btn.setAttribute('aria-pressed',String(!!pattern[i]));});Array.from($('stepLabels').children).forEach((el,i)=>el.classList.toggle('now',activeStep===i));}
  function showStep(i){activeStep=i;refreshSteps()}
  function makeSpectrum(id,type){const node=$(id);node.innerHTML='';for(let i=0;i<13;i++){const b=document.createElement('span');const v=type===0?Math.max(5,27*Math.abs(Math.sin(i*.9+1))*(1-i/18)):Math.max(5,24*Math.abs(Math.sin(i*.62+1.1)));b.style.height=v+'px';node.append(b);}}
  function applySeed(){const seed=presets[currentSeed];$('preset').value=currentSeed;$('root').value=seed.root;$('scale').value=seed.scale;pattern=seed.pattern.slice();$('nameA').textContent=seed.A.name;$('nameB').textContent=seed.B.name;$('descA').textContent=seed.A.description;$('descB').textContent=seed.B.description;$('toneA').textContent=seed.A.name;$('toneB').textContent=seed.B.name;$('toneDescA').textContent=seed.A.description;$('toneDescB').textContent=seed.B.description;activeStep=-1;buildSteps();updateScaleText();engine?.applySeed(seed);updateMorph(true);}
  function angleToBlend(a){return clamp((1+Math.sin(a))/2,0,1)}
  function drawRing(){const w=canvasSize;if(!w)return;const dpr=Math.min(window.devicePixelRatio||1,2);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,w);const c=w/2,r=w*.33;
    const glow=ctx.createRadialGradient(c,c,r*.4,c,c,r*1.5);glow.addColorStop(0,'rgba(100,176,105,.08)');glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,w);
    ctx.beginPath();ctx.arc(c,c,r,0,Math.PI*2);ctx.strokeStyle='#304d39';ctx.lineWidth=12;ctx.stroke();
    const grad=ctx.createLinearGradient(c-r,c-r,c+r,c+r);grad.addColorStop(0,'#b0f1a0');grad.addColorStop(.56,'#82d7af');grad.addColorStop(1,'#6fcfc9');ctx.beginPath();ctx.arc(c,c,r,-Math.PI/2,angle,false);ctx.lineCap='round';ctx.strokeStyle=grad;ctx.lineWidth=7;ctx.stroke();
    ctx.beginPath();ctx.arc(c,c,r-18,0,Math.PI*2);ctx.strokeStyle='#293d30';ctx.lineWidth=1;ctx.stroke();
    const xx=c+Math.cos(angle)*r,yy=c+Math.sin(angle)*r;const knobGlow=ctx.createRadialGradient(xx,yy,0,xx,yy,26);knobGlow.addColorStop(0,'#b6f7ab88');knobGlow.addColorStop(1,'#b6f7ab00');ctx.fillStyle=knobGlow;ctx.beginPath();ctx.arc(xx,yy,26,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(xx,yy,10,0,Math.PI*2);ctx.fillStyle='#dcffcc';ctx.fill();ctx.beginPath();ctx.arc(xx,yy,4.5,0,Math.PI*2);ctx.fillStyle='#345d36';ctx.fill();
    ctx.font=`700 ${Math.max(11,w*.027)}px system-ui`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#b2f4a9';ctx.fillText('A',c,c-r-39);ctx.fillStyle='#85dbcf';ctx.fillText('B',c,c+r+39);
  }
  function resize(){const rect=ring.getBoundingClientRect();const size=Math.max(220,Math.round(rect.width));if(size===canvasSize)return;canvasSize=size;const dpr=Math.min(window.devicePixelRatio||1,2);ring.width=Math.round(size*dpr);ring.height=Math.round(size*dpr);drawRing()}
  const ro=window.ResizeObserver?new ResizeObserver(resize):null;ro?.observe(ring);window.addEventListener('resize',resize);
  function updateMorph(force=false){const mix=angleToBlend(angle);if(force||Math.abs(mix-lastMix)>.001){lastMix=mix;const pctB=Math.round(mix*100);$('mixNumber').innerHTML=pctB+'<span>%</span>';$('pctA').textContent=(100-pctB)+'%';$('pctB').textContent=pctB+'%';$('blendFill').style.width=pctB+'%';engine?.setMorph(mix);}drawRing()}
  function setAngleFromEvent(e){const rect=ring.getBoundingClientRect(),x=e.clientX-rect.left-rect.width/2,y=e.clientY-rect.top-rect.height/2;angle=Math.atan2(y,x);updateMorph()}
  ring.addEventListener('pointerdown',e=>{if(e.button!==0&&e.pointerType==='mouse')return;dragging=true;orbit=false;$('orbitToggle').checked=false;$('ringState').textContent='MANUAL CONTROL';ring.setPointerCapture(e.pointerId);setAngleFromEvent(e)});
  ring.addEventListener('pointermove',e=>{if(dragging)setAngleFromEvent(e)});ring.addEventListener('pointerup',()=>{dragging=false});ring.addEventListener('pointercancel',()=>{dragging=false});
  ring.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowDown'||e.key==='ArrowRight'||e.key==='ArrowUp'){e.preventDefault();angle+=(e.key==='ArrowLeft'||e.key==='ArrowDown'?-1:1)*.06;updateMorph()}});
  function animate(now){if(lastFrame==null)lastFrame=now;const dt=Math.min(.075,(now-lastFrame)/1000);lastFrame=now;if(orbit&&!dragging){angle+=speed*.66*dt;updateMorph()}requestAnimationFrame(animate)}
  $('orbitToggle').addEventListener('change',e=>{orbit=e.target.checked;$('ringState').textContent=orbit?'ORBIT ACTIVE':'MANUAL CONTROL'});
  $('orbitSpeed').addEventListener('input',e=>{speed=Number(e.target.value);$('orbitValue').textContent=speed.toFixed(2)});
  $('preset').addEventListener('change',e=>{currentSeed=e.target.value;applySeed()});
  $('root').addEventListener('change',updateScaleText);$('scale').addEventListener('change',updateScaleText);
  $('random').addEventListener('click',()=>{pattern=Array.from({length:16},()=>Math.random()<.56?1:0);refreshSteps()});
  $('clearPattern').addEventListener('click',()=>{pattern.fill(0);refreshSteps()});
  function updateBpm(v){const bpm=clamp(Math.round(Number(v)||96),50,200);$('bpm').value=bpm;engine?.setTempo(bpm);}
  $('bpm').addEventListener('change',e=>updateBpm(e.target.value));
  $('bpmDown').addEventListener('click',()=>updateBpm(Number($('bpm').value)-1));
  $('bpmUp').addEventListener('click',()=>updateBpm(Number($('bpm').value)+1));
  $('volume').addEventListener('input',e=>engine?.setVolume(Number(e.target.value)/100));
  $('play').addEventListener('click',async()=>{if(playing){engine?.pause();playing=false;$('playText').textContent='Play';status('PAUSED');return;}if(!engine){status('AUDIO ENGINE UNAVAILABLE');return;}try{status('STARTING AUDIO');await engine.play();playing=true;$('playText').textContent='Pause';$('play').querySelector('svg').innerHTML='<path d="M7 5h4v14H7zM14 5h4v14h-4z"/>';status('PLAYING · AUDIO ACTIVE',true)}catch(e){console.error(e);status('AUDIO ERROR · '+e.message);}});
  $('stop').addEventListener('click',()=>{engine?.stop();playing=false;$('playText').textContent='Play';$('play').querySelector('svg').innerHTML='<path d="M8 5v14l11-7z"/>';status('READY · CLICK PLAY TO START')});
  // Restore play icon when paused.
  $('play').addEventListener('click',()=>{if(!playing){$('play').querySelector('svg').innerHTML='<path d="M8 5v14l11-7z"/>'}});
  window.addEventListener('keydown',e=>{if(e.code==='Space'&&!/INPUT|SELECT|TEXTAREA|BUTTON/.test(document.activeElement?.tagName||'')){e.preventDefault();$('play').click()}});
  let recUrl=null,recording=false,recordStart=0,recordTicker=null;
  function timeFormat(s){return String(Math.floor(s/60)).padStart(2,'0')+':'+String(Math.floor(s%60)).padStart(2,'0')}
  function updateRecordTime(){if(recording)$('recordTime').textContent=timeFormat((performance.now()-recordStart)/1000)}
  $('record').addEventListener('click',async()=>{
    if(!engine)return;
    const btn=$('record');
    try{
      if(!recording){
        if(!playing){status('START PLAYBACK BEFORE RECORDING');return;}
        if(recUrl){URL.revokeObjectURL(recUrl);recUrl=null;}
        $('downloadWav').disabled=true;
        await engine.startRecording();
        recording=true;recordStart=performance.now();$('recordTime').textContent='00:00';
        btn.classList.add('recording');$('recordText').textContent='Stop Rec';
        $('recordHint').textContent='Recording live audio · click to finish';
        recordTicker=setInterval(updateRecordTime,200);
      }else{
        recording=false;clearInterval(recordTicker);
        const blob=await engine.stopRecording();
        if(!blob){throw new Error('Recording was empty');}
        recUrl=URL.createObjectURL(blob);
        $('downloadWav').disabled=false;
        btn.classList.remove('recording');$('recordText').textContent='Record';
        $('recordHint').textContent='Ready to export · stereo PCM WAV';
        status('RECORDING READY · EXPORT WAV',false);
      }
    }catch(e){console.error(e);recording=false;clearInterval(recordTicker);btn.classList.remove('recording');$('recordText').textContent='Record';$('recordHint').textContent='Recording error';status('RECORD ERROR · '+e.message);}
  });
  $('downloadWav').addEventListener('click',()=>{if(!recUrl)return;const a=document.createElement('a');a.href=recUrl;a.download='chrysasynth-duality-'+new Date().toISOString().replace(/[:.]/g,'-')+'.wav';document.body.appendChild(a);a.click();a.remove()});
  window.addEventListener('beforeunload',()=>{if(recUrl)URL.revokeObjectURL(recUrl)});
  makeSpectrum('spectrumA',0);makeSpectrum('spectrumB',1);applySeed();resize();requestAnimationFrame(animate);
  if(typeof Tone==='undefined')status('ONLINE REQUIRED · TONE.JS NOT LOADED');
})();
