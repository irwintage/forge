(function(){
'use strict';
const root=document.querySelector('#noise-generator');if(!root)return;
const $=id=>root.querySelector('#'+id);
const engine=new window.NoiseForgeEngine();
const state={noise:'white',filter:'off',running:false,dragging:false,raf:0,disposed:false};
const names={white:'WHITE NOISE',pink:'PINK NOISE',brown:'BROWN NOISE'};
const canvas=$('nz-filter-canvas'),scope=$('nz-scope');
function fmtHz(v){return Math.round(v).toLocaleString('en-US')+' Hz';}
function setStatus(running){state.running=running;$('nz-status').textContent=running?'PLAYING':'READY';$('nz-status').classList.toggle('is-playing',running);$('nz-play').setAttribute('aria-pressed',String(running));}
engine.onState=setStatus;
function updateMaster(){const n=Number($('nz-master').value);engine.setMaster(n);$('nz-master-val').textContent=`${n} dB`;}
function cutoffFromSlider(v){return 20*Math.pow(1000,Number(v)/1000);}
function cutoffToSlider(hz){return 1000*Math.log(hz/20)/Math.log(1000);}
function syncCut(hz){hz=Math.min(20000,Math.max(20,hz));$('nz-cut').value=String(Math.round(cutoffToSlider(hz)));$('nz-cut-val').textContent=fmtHz(hz);engine.setCutoff(hz);drawFilter();}
function syncQ(){const q=Number($('nz-q').value);$('nz-q-val').textContent=q.toFixed(1)+' Q';engine.setQ(q);drawFilter();}
function setFilter(type){state.filter=type;engine.setFilter(type);root.querySelectorAll('[data-filter]').forEach(b=>{const yes=b.dataset.filter===type;b.classList.toggle('is-selected',yes);b.setAttribute('aria-pressed',String(yes));});for(const id of ['nz-cut-wrap','nz-q-wrap'])$(id).classList.toggle('is-disabled',type==='off');root.querySelector('.nz-filtergraph').classList.toggle('is-disabled',type==='off');drawFilter();}
function resize(c){const r=c.getBoundingClientRect(),ratio=Math.min(2,window.devicePixelRatio||1),w=r.width,h=r.height;if(!w||!h)return null;const dw=Math.max(1,Math.round(w*ratio)),dh=Math.max(1,Math.round(h*ratio));if(c.width!==dw||c.height!==dh){c.width=dw;c.height=dh;}const x=c.getContext('2d');x.setTransform(ratio,0,0,ratio,0,0);x.clearRect(0,0,w,h);return {x,w,h};}
function drawFilter(){const r=resize(canvas);if(!r)return;const {x,w,h}=r,top=14,bottom=h-15,usable=bottom-top;x.strokeStyle='rgba(125,154,193,.13)';x.lineWidth=1;for(let i=0;i<5;i++){let y=top+i*usable/4;x.beginPath();x.moveTo(5,y+.5);x.lineTo(w-5,y+.5);x.stroke();}for(let j=0;j<4;j++){let xx=5+(w-10)*j/3;x.beginPath();x.moveTo(xx,top);x.lineTo(xx,bottom);x.stroke();}
 const count=Math.max(120,Math.round(w*1.3)),freq=new Float32Array(count),mag=new Float32Array(count),phase=new Float32Array(count),filter=engine.ctx?.createBiquadFilter()||(function(){try{return new OfflineAudioContext(1,64,44100).createBiquadFilter();}catch{return null;}})();
 if(filter){filter.type=state.filter==='off'?'lowpass':state.filter;filter.frequency.value=engine.cutoff;filter.Q.value=engine.q;for(let i=0;i<count;i++)freq[i]=20*Math.pow(1000,i/(count-1));filter.getFrequencyResponse(freq,mag,phase);}
 const yFor=db=>top+(1-(Math.max(-48,Math.min(18,db))+48)/66)*usable;
 const coords=[];for(let i=0;i<count;i++){const v=state.filter==='off'?0:20*Math.log10(Math.max(1e-6,mag[i]||0));coords.push([5+(w-10)*i/(count-1),yFor(v)]);}
 x.beginPath();coords.forEach(([xx,yy],i)=>i===0?x.moveTo(xx,yy):x.lineTo(xx,yy));x.lineTo(w-5,bottom);x.lineTo(5,bottom);x.closePath();const grd=x.createLinearGradient(0,top,0,bottom);grd.addColorStop(0,'rgba(114,168,255,.24)');grd.addColorStop(1,'rgba(114,168,255,.005)');x.fillStyle=grd;x.fill();
 x.beginPath();coords.forEach(([xx,yy],i)=>i===0?x.moveTo(xx,yy):x.lineTo(xx,yy));x.strokeStyle=state.filter==='off'?'#637a99':'#95bcff';x.lineWidth=2;x.lineJoin='round';x.lineCap='round';x.stroke();
 if(state.filter!=='off'){const xx=5+(w-10)*Math.log(engine.cutoff/20)/Math.log(1000);x.setLineDash([3,5]);x.strokeStyle='rgba(167,202,253,.42)';x.beginPath();x.moveTo(xx,top);x.lineTo(xx,bottom);x.stroke();x.setLineDash([]);}
}
function drawScope(){if(state.disposed)return;const r=resize(scope);if(r){const {x,w,h}=r,mid=h*.5,an=engine.getAnalyser();x.strokeStyle='#1e3048';x.lineWidth=1;for(let row=1;row<4;row++){const y=h*row/4;x.beginPath();x.moveTo(0,y);x.lineTo(w,y);x.stroke();}
 const d=new Float32Array(1024);if(an){an.getFloatTimeDomainData(d);}else{d.fill(0);}
 // Visual-only normalization, capped to avoid a nearly flat oscilloscope at safe listening levels.
 let peak=0;for(const v of d)peak=Math.max(peak,Math.abs(v));const amplify=an?Math.min(5.5,.55/Math.max(.04,peak)):1;
 x.beginPath();for(let i=0;i<d.length;i++){const xx=i/(d.length-1)*w,yy=mid-d[i]*amplify*h*.4;if(i===0)x.moveTo(xx,yy);else x.lineTo(xx,yy);}x.strokeStyle='#90baff';x.lineWidth=1.5;x.lineJoin='round';x.stroke();}
 state.raf=requestAnimationFrame(drawScope);}
function setNoise(type){state.noise=type;$('nz-visual-name').textContent=names[type];root.querySelectorAll('[data-noise]').forEach(b=>{const yes=b.dataset.noise===type;b.classList.toggle('is-selected',yes);b.setAttribute('aria-pressed',String(yes));});engine.setType(type).catch(console.error);}
root.querySelectorAll('[data-noise]').forEach(b=>b.addEventListener('click',()=>setNoise(b.dataset.noise)));
root.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>setFilter(b.dataset.filter)));
$('nz-play').addEventListener('click',async()=>{try{await engine.start();}catch(e){$('nz-status').textContent='AUDIO ERROR';console.error(e);}});
$('nz-stop').addEventListener('click',()=>engine.stop());
$('nz-master').addEventListener('input',updateMaster);
$('nz-cut').addEventListener('input',e=>syncCut(cutoffFromSlider(e.target.value)));
$('nz-q').addEventListener('input',syncQ);
$('nz-air').addEventListener('input',e=>{const v=Number(e.target.value);$('nz-air-val').textContent=(v>0?'+':'')+v.toFixed(1)+' dB';engine.setAir(v);});
$('nz-width').addEventListener('input',e=>{const v=Number(e.target.value);$('nz-width-val').textContent=v+'%';engine.setWidth(v/100);});
function dragFilter(e){if(!state.dragging||state.filter==='off')return;const rect=canvas.getBoundingClientRect();const t=Math.max(0,Math.min(1,(e.clientX-rect.left-5)/(rect.width-10)));syncCut(20*Math.pow(1000,t));}
canvas.addEventListener('pointerdown',e=>{if(state.filter==='off')return;state.dragging=true;canvas.setPointerCapture(e.pointerId);dragFilter(e);});canvas.addEventListener('pointermove',dragFilter);canvas.addEventListener('pointerup',()=>{state.dragging=false;});canvas.addEventListener('pointercancel',()=>{state.dragging=false;});
const obs=typeof ResizeObserver!=='undefined'?new ResizeObserver(drawFilter):null;if(obs)obs.observe(canvas);else window.addEventListener('resize',drawFilter);
function stop(){engine.stop();}
async function destroy(){if(state.disposed)return;state.disposed=true;cancelAnimationFrame(state.raf);if(obs)obs.disconnect();else window.removeEventListener('resize',drawFilter);await engine.destroy();if(window.ForgeNoiseGenerator?.destroy===destroy)delete window.ForgeNoiseGenerator;}
window.ForgeNoiseGenerator={stop,destroy};
window.addEventListener('pagehide',stop);
updateMaster();syncCut(2000);syncQ();setFilter('off');drawScope();
})();
