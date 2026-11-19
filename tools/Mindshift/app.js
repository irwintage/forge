(() => {
const $=id=>document.getElementById(id);
const THEMES=window.MindshiftPresets;
const engine=new MindshiftEngine(),modeEls=[...document.querySelectorAll('.modes button')];
let mode='calm',playing=false,hold=false,auto=false,point={x:.5,y:.5},pointer=false,raf=0,scopeData=new Uint8Array(1024),lastFrame=performance.now(),wav=null,recBegan=0;
const xy=$('xy'),orb=$('orb'),scope=$('scope'),oc=orb.getContext('2d'),sc=scope.getContext('2d');
function applyMode(next){mode=next;const cfg=THEMES[mode];document.documentElement.style.setProperty('--accent',cfg.color);document.documentElement.style.setProperty('--accent-rgb',cfg.rgb);
 modeEls.forEach(b=>{b.classList.toggle('selected',b.dataset.mode===mode);b.setAttribute('aria-pressed',String(b.dataset.mode===mode));});$('modeTitle').textContent=mode.toUpperCase();$('engineTitle').textContent=mode[0].toUpperCase()+mode.slice(1)+' Engine';$('modeDescription').textContent=cfg.description;$('xAxis').textContent='X · '+cfg.x;$('yAxis').textContent='Y · '+cfg.y;$('soundNote').textContent=cfg.note;
 const host=$('parameters');host.innerHTML='';cfg.params.forEach(([id,label,value])=>{let div=document.createElement('div');div.className='param';div.innerHTML=`<div class="param-label"><label for="param-${id}">${label}</label><output id="value-${id}">${Math.round(value*100)}%</output></div><input id="param-${id}" type="range" min="0" max="100" value="${Math.round(value*100)}">`;host.appendChild(div);div.querySelector('input').addEventListener('input',e=>{div.querySelector('output').textContent=e.target.value+'%';updateParams();});});
 updateParams();if(playing)engine.switchMode(mode);
}
function updateParams(){const p={};for(const [id] of THEMES[mode].params)p[id]=+$('param-'+id).value/100;engine.setParams(p);}
function syncToggle(id,on){const el=$(id);el.classList.toggle('on',on);el.setAttribute('aria-pressed',String(on));el.querySelector('span').textContent=on?'ON':'OFF';}
function setPoint(x,y){point.x=Math.max(0,Math.min(1,x));point.y=Math.max(0,Math.min(1,y));$('positionDot').style.left=(point.x*100)+'%';$('positionDot').style.top=(point.y*100)+'%';engine.updateXY(point.x,point.y);}
function pointerPoint(e){const rect=xy.getBoundingClientRect();setPoint((e.clientX-rect.left)/rect.width,(e.clientY-rect.top)/rect.height);}
xy.addEventListener('pointerdown',e=>{if(auto){auto=false;syncToggle('auto',false);}pointer=true;xy.setPointerCapture(e.pointerId);pointerPoint(e);engine.gesture(true);});
xy.addEventListener('pointermove',e=>{if(pointer&&!auto)pointerPoint(e);});
function pointerEnd(){if(!pointer)return;pointer=false;engine.gesture(false);if(!hold&&!auto)setPoint(.5,.5);}
xy.addEventListener('pointerup',pointerEnd);xy.addEventListener('pointercancel',pointerEnd);xy.addEventListener('lostpointercapture',pointerEnd);
xy.addEventListener('keydown',e=>{const step=e.shiftKey?.08:.025;let x=point.x,y=point.y;if(e.key==='ArrowLeft')x-=step;else if(e.key==='ArrowRight')x+=step;else if(e.key==='ArrowUp')y-=step;else if(e.key==='ArrowDown')y+=step;else return;e.preventDefault();setPoint(x,y);});
$('hold').addEventListener('click',()=>{hold=!hold;syncToggle('hold',hold);if(!hold&&!auto&&!pointer)setPoint(.5,.5);});
$('auto').addEventListener('click',()=>{auto=!auto;syncToggle('auto',auto);if(!auto&&!hold&&!pointer)setPoint(.5,.5);});
modeEls.forEach(b=>b.addEventListener('click',()=>applyMode(b.dataset.mode)));
$('root').addEventListener('change',()=>engine.setHarmony($('root').value,$('scale').value));$('scale').addEventListener('change',()=>engine.setHarmony($('root').value,$('scale').value));
$('master').addEventListener('input',e=>{engine.setMaster(+e.target.value/100);$('masterValue').textContent=e.target.value+'%';});
$('space').addEventListener('input',e=>{engine.setSpace(+e.target.value/100);$('spaceValue').textContent=e.target.value+'%';});
$('play').addEventListener('click',async()=>{if(playing)return;try{engine.setHarmony($('root').value,$('scale').value);await engine.start(mode);playing=true;$('status').textContent='Playing';}catch(err){$('status').textContent='Audio unavailable';console.error(err);}});
$('stop').addEventListener('click',()=>{engine.stop();playing=false;$('status').textContent='Stopped';});
$('record').addEventListener('click',async()=>{try{if(!engine.recording){await engine.ensure();engine.startRecording();wav=null;$('export').disabled=true;recBegan=performance.now();$('record').classList.add('live');$('record').textContent='■ Stop Rec';$('recordingInfo').textContent='Recording stereo WAV…';}else{finishRecording();}}catch(err){$('status').textContent='Recording unavailable';console.error(err);}});
engine.onRecordingLimit=()=>{finishRecording(true);};
function finishRecording(alreadyStopped=false){if(!alreadyStopped){wav=engine.stopRecording();}else{wav=engine._lastWav||null;}if(!wav && engine.lastRecording)wav=engine.lastRecording;
 $('record').classList.remove('live');$('record').textContent='● Rec';$('export').disabled=!wav;$('recordingInfo').textContent=wav?'WAV ready · '+(wav.size/1048576).toFixed(1)+' MB':'Recording ended';}
$('export').addEventListener('click',()=>{if(!wav)return;const url=URL.createObjectURL(wav),a=document.createElement('a');a.href=url;a.download='mindshift-'+mode+'-'+new Date().toISOString().replace(/[:.]/g,'-')+'.wav';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);});
function resizeCanvas(canvas,ctx){const r=canvas.getBoundingClientRect();const d=Math.min(2,window.devicePixelRatio||1);const w=Math.max(2,Math.round(r.width*d)),h=Math.max(2,Math.round(r.height*d));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}ctx.setTransform(d,0,0,d,0,0);return {w:r.width,h:r.height};}
function draw(time){raf=requestAnimationFrame(draw);const elapsed=(time-lastFrame)/1000;lastFrame=time;
 if(auto&&!pointer){const s=+$('autoSpeed').value/100;const t=time*.001*(.10+s*.9);setPoint(.5+.38*Math.sin(t*.9),.5+.35*Math.sin(t*1.3+.7));}
 const a=resizeCanvas(orb,oc),b=resizeCanvas(scope,sc),w=a.w,h=a.h,cx=w/2,cy=h/2,config=THEMES[mode];

 // Fluid visual synthesis V3.2, drawing and feedback on an isolated offscreen surface.
 engine.getWave(scopeData);let rms=0;for(let i=0;i<scopeData.length;i+=8){const v=(scopeData[i]-128)/128;rms+=v*v;}rms=Math.sqrt(rms/(scopeData.length/8));
 window.MindshiftFluid.render(oc,w,h,{time,mode,rgb:config.rgb,x:point.x,y:point.y,rms,playing,space:+$('space').value/100});
 sc.clearRect(0,0,b.w,b.h);sc.beginPath();sc.moveTo(0,b.h/2);for(let i=0;i<scopeData.length;i+=3){const x=i/(scopeData.length-1)*b.w;const y=b.h/2+(scopeData[i]-128)/128*b.h*.42;sc.lineTo(x,y);}sc.strokeStyle=config.color;sc.lineWidth=1.35;sc.stroke();
 if(engine.recording){const seconds=Math.min(120,Math.floor((time-recBegan)/1000));$('recordingInfo').textContent=`Recording WAV · ${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')} / 02:00`;}
}
applyMode('calm');setPoint(.5,.5);raf=requestAnimationFrame(draw);
window.MindshiftForge={stop:()=>{$('stop').click();},destroy:async()=>{cancelAnimationFrame(raf);window.MindshiftFluid.destroy();if(engine.recording)engine.stopRecording();await engine.destroy();}};
})();
