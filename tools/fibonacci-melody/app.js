// Fibonacci Melody v2 — self-contained Web Audio, musical mapping and MIDI export.
const ROOT=document.querySelector('#fib-app');
const $=id=>ROOT.querySelector('#'+id);
const SCALE={major:[0,2,4,5,7,9,11],minor:[0,2,3,5,7,8,10],dorian:[0,2,3,5,7,9,10],phrygian:[0,1,3,5,7,8,10],mixolydian:[0,2,4,5,7,9,10],pentatonic:[0,2,4,7,9]};
const NAMES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const ui={key:$('key'),scale:$('scale'),steps:$('steps'),octave:$('octave'),offset:$('offset'),rhythm:$('rhythm'),tempo:$('tempo'),voice:$('voice'),brightness:$('brightness'),space:$('space'),status:$('status'),geometry:$('geometry'),piano:$('piano'),sequence:$('sequence')};
const state={view:'split',notes:[],active:-1,playing:false,timer:0,ctx:null,master:null,dry:null,wet:null,delay:null,feedback:null,voices:new Set(),nextTime:0,nextBeatTime:0,beatCount:0,index:0,run:0};
function fib(n){let a=0n,b=1n;for(let i=0;i<n;i++) [a,b]=[b,a+b];return a;}
function config(){return {key:NAMES.indexOf(ui.key.value),scale:SCALE[ui.scale.value],steps:Number(ui.steps.value),octave:Number(ui.octave.value),offset:Number(ui.offset.value),tempo:Number(ui.tempo.value),rhythm:ui.rhythm.value};}
function generate(){const c=config(); const out=[];let beat=0;for(let i=0;i<c.steps;i++){const fi=c.offset+i,v=fib(fi);const degree=Number(v%BigInt(c.scale.length));const midi=(c.octave+1)*12+c.key+c.scale[degree];const dur=c.rhythm==='fibonacci'?[1,1,2,3,5][Number(v%5n)]*.25:.5;out.push({fi,value:v,degree,midi,duration:dur,start:beat,name:NAMES[midi%12]+(Math.floor(midi/12)-1)});beat+=dur;}return out;}
function regenerate(){const was=state.playing;if(was)stop();state.notes=generate();state.active=-1;renderSequence();updateCurrent();draw();}
function updateCurrent(){const n=state.notes[Math.max(0,state.active)]||state.notes[0];if(!n)return;$('term').textContent=`F(${n.fi}) = ${n.value}`;$('rule').textContent=`${n.value} mod ${SCALE[ui.scale.value].length} = ${n.degree}`;$('note').textContent=n.name;}
function renderSequence(){ui.sequence.replaceChildren(...state.notes.map((n,i)=>{const b=document.createElement('button');b.type='button';b.className='seq-token'+(state.active===i?' active':'');b.innerHTML=`<small>F(${n.fi})</small>${n.value}`;b.title=`Select F(${n.fi}) = ${n.value} → ${n.name}`;b.setAttribute('aria-label',b.title);b.addEventListener('click',()=>{if(state.playing)stop();setActive(i);});return b;}));}
function setActive(i){state.active=i;Array.from(ui.sequence.children).forEach((b,j)=>b.classList.toggle('active',i===j));updateCurrent();draw();}
function prepareCanvas(c){const r=c.getBoundingClientRect();if(!r.width||!r.height)return null;const d=Math.min(2,window.devicePixelRatio||1),w=r.width,h=r.height;const pw=Math.round(w*d),ph=Math.round(h*d);if(c.width!==pw||c.height!==ph){c.width=pw;c.height=ph;}const x=c.getContext('2d');x.setTransform(d,0,0,d,0,0);x.clearRect(0,0,w,h);return {x,w,h};}
// Exact Fibonacci squares F(1),F(2),..., grown around a bounding rectangle.
// The initial 1x1 squares sit side by side; subsequent tiles attach below, left, above, right.
// Their quarter-circle arcs join into a continuous Fibonacci spiral (not a decorative logarithmic overlay).
function squares(through){
  if(through<1)return [];
  const arr=[{x:0,y:0,s:1,fi:1}];
  if(through===1)return arr;
  arr.push({x:1,y:0,s:1,fi:2});
  let left=0,top=0,right=2,bottom=1;
  for(let fi=3;fi<=through;fi++){
    const s=Number(fib(fi));
    const side=(fi-3)%4;
    let x,y;
    if(side===0){x=left;y=bottom;bottom+=s;}
    else if(side===1){x=left-s;y=top;left=x;}
    else if(side===2){x=left;y=top-s;top=y;}
    else{x=right;y=top;right+=s;}
    arr.push({x,y,s,fi});
  }
  return arr;
}
const geometryPalette=[
  [92,158,189],[114,166,150],[141,132,183],[150,168,199],[115,154,180],[147,139,169]
];
function geometry(){
  const v=prepareCanvas(ui.geometry);
  if(!v)return;
  const {x,w,h}=v;
  const selected=state.notes[state.active>=0?state.active:0];
  // F(0) = 0 cannot be represented by a positive-area square.
  const fi=selected?.fi??0;
  // Show an illustrative nine-square composition when stopped at F(0),
  // then genuinely grow the tiling as the playback/selected term advances.
  const preview=state.active<0&&fi===0;
  const through=preview?9:Math.max(3,fi);
  const tiles=squares(through);
  const windowSize=10;
  // All squares are constructed, but the camera follows the ten latest
  // to prevent early tiny squares becoming impossible to distinguish.
  const first=Math.max(0,tiles.length-windowSize);
  const visible=tiles.slice(first);
  let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
  for(const tile of visible){
    left=Math.min(left,tile.x);top=Math.min(top,tile.y);
    right=Math.max(right,tile.x+tile.s);bottom=Math.max(bottom,tile.y+tile.s);
  }
  const marginX=Math.min(26,w*.065),marginY=18;
  const dx=right-left,dy=bottom-top;
  const scale=Math.min((w-2*marginX)/dx,(h-2*marginY)/dy);
  const ox=(w-dx*scale)/2-left*scale;
  const oy=(h-dy*scale)/2-top*scale;
  const at=tile=>({X:ox+tile.x*scale,Y:oy+tile.y*scale,S:tile.s*scale});
  const live=state.active>=0;
  // Geometric shapes sit on the parent canvas surface, without an inner card.
  for(const tile of visible){
    const {X,Y,S}=at(tile),active=live&&tile.fi===fi;
    const color=geometryPalette[(tile.fi-1)%geometryPalette.length];
    x.fillStyle=active?'rgba(127,218,193,.22)':`rgba(${color.join(',')},${.055+(tile.fi%3)*.015})`;
    x.fillRect(X,Y,S,S);
    // Rectilinear composition: crisp borders, pastel highlights, no full-surface glow.
    x.lineWidth=active?Math.min(2.4,Math.max(1.2,S*.014)):1;
    x.strokeStyle=active?'rgba(164,245,213,.96)':`rgba(${color.join(',')},.55)`;
    x.strokeRect(X+.5,Y+.5,Math.max(0,S-1),Math.max(0,S-1));
    if(S>45){
      x.fillStyle=active?'#e3fff4':'rgba(165,190,207,.75)';
      x.font=`${active?'600':'500'} ${S>78?12:10}px DM Sans`;
      x.fillText(`F(${tile.fi})`,X+Math.min(12,S*.12),Y+Math.min(22,S*.22));
      if(S>85){x.fillStyle=active?'rgba(210,248,227,.83)':'rgba(145,172,188,.62)';x.font='10px DM Sans';x.fillText(tile.s.toLocaleString('en-US'),X+12,Y+37);}
    }
  }
  // Connected arcs inscribed in each Fibonacci square.
  // The arc uses the opposite diagonal corner so the curve reads as a clearer outward spiral rather than a spider-web center.
  x.save();x.beginPath();
  let pathStarted=false;
  for(const tile of visible){
    const {X,Y,S}=at(tile);
    if(S<.18)continue;
    const phase=(tile.fi-1)%4;
    let cx,cy,from,to;
    if(phase===0){cx=X+S;cy=Y+S;from=Math.PI;to=3*Math.PI/2;}
    else if(phase===1){cx=X;cy=Y+S;from=3*Math.PI/2;to=2*Math.PI;}
    else if(phase===2){cx=X;cy=Y;from=0;to=Math.PI/2;}
    else{cx=X+S;cy=Y;from=Math.PI/2;to=Math.PI;}
    const sx=cx+S*Math.cos(from),sy=cy+S*Math.sin(from);
    if(!pathStarted){x.moveTo(sx,sy);pathStarted=true;}
    else x.lineTo(sx,sy);
    x.arc(cx,cy,S,from,to,false);
  }
  if(pathStarted){
    x.strokeStyle='rgba(164,157,234,.82)';
    x.lineWidth=1.75;x.lineJoin='round';x.lineCap='round';x.stroke();
  }
  x.restore();
  // Make the active arc shine without hiding the neighboring mathematical geometry.
  if(live&&fi>=1){
    const tile=visible.find(tile=>tile.fi===fi);
    if(tile){const {X,Y,S}=at(tile),phase=(fi-1)%4;
      const corners=[[X+S,Y+S,Math.PI,3*Math.PI/2],[X,Y+S,3*Math.PI/2,2*Math.PI],[X,Y,0,Math.PI/2],[X+S,Y,Math.PI/2,Math.PI]];
      const [cx,cy,from,to]=corners[phase];
      x.beginPath();x.arc(cx,cy,S,from,to,false);
      x.strokeStyle='rgba(169,243,212,.94)';x.lineWidth=2.8;x.stroke();
    }
  }
  const range=`F(${visible[0]?.fi??1})–F(${through})`;
  const status=preview?'Preview · choose a term below':fi===0?'F(0) = 0 · origin':`Current F(${fi}) = ${fib(fi)}`;
  const counter=document.getElementById('geometry-window');
  const caption=document.getElementById('geometry-caption');
  if(counter)counter.textContent=range;
  if(caption)caption.textContent=`${status} · exact square ratios`;
}
function piano(){const v=prepareCanvas(ui.piano);if(!v)return;const {x,w,h}=v;x.fillStyle='#0a111b';x.fillRect(0,0,w,h);const notes=state.notes;if(!notes.length)return;const min=Math.min(...notes.map(n=>n.midi))-1,max=Math.max(...notes.map(n=>n.midi))+1,rows=max-min+1;const left=32,right=12,top=13,bottom=22,innerW=w-left-right,innerH=h-top-bottom;const total=notes.reduce((a,n)=>a+n.duration,0);const rowH=innerH/rows;x.font='10px DM Sans';for(let r=0;r<rows;r++){const m=min+r,y=top+(rows-1-r)*rowH;x.fillStyle=m%12===0?'rgba(102,151,194,.1)':'rgba(255,255,255,.012)';x.fillRect(left,y,innerW,rowH);x.strokeStyle='rgba(124,156,185,.10)';x.beginPath();x.moveTo(left,y);x.lineTo(w-right,y);x.stroke();if((rows<18||r%2===0)&&rowH>8){x.fillStyle='#718ca3';x.fillText(NAMES[m%12],5,y+Math.min(rowH-1,11));}}
for(let i=0;i<notes.length;i++){const n=notes[i],xx=left+n.start/total*innerW,yy=top+(max-n.midi)*rowH,ww=n.duration/total*innerW;const selected=i===state.active;x.fillStyle=selected?'#b2f0e0':'#5ca9d4';x.globalAlpha=selected?1:.8;x.fillRect(xx+1,yy+1,Math.max(2,ww-2),Math.max(3,rowH-2));x.globalAlpha=1;}x.fillStyle='#6c879a';x.font='10px DM Sans';x.fillText(`${notes.length} events / ${total.toFixed(1)} beats`,left,h-6);}
function draw(){geometry();piano();}
function resize(){draw();}const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;if(observer){observer.observe(ui.geometry);observer.observe(ui.piano);}else{window.addEventListener('resize',resize);}
function ensureAudio(){if(state.ctx)return state.ctx;const C=window.AudioContext||window.webkitAudioContext;if(!C)throw Error('Web Audio unavailable');const ctx=new C();state.ctx=ctx;const master=ctx.createGain();master.gain.value=.62;const dry=ctx.createGain(),wet=ctx.createGain(),delay=ctx.createDelay(1),feedback=ctx.createGain();feedback.gain.value=.17;delay.delayTime.value=.235;dry.connect(master);wet.connect(master);delay.connect(wet);delay.connect(feedback);feedback.connect(delay);master.connect(ctx.destination);state.master=master;state.dry=dry;state.wet=wet;state.delay=delay;state.feedback=feedback;setSpace();return ctx;}
function setSpace(){if(state.wet){const v=Number(ui.space.value)/100;state.wet.gain.setTargetAtTime(v,state.ctx.currentTime,.025);state.dry.gain.setTargetAtTime(1-v*.4,state.ctx.currentTime,.025);}}
function playTone(midi,at,duration,velocity=.75,metronome=false){const ctx=state.ctx;if(!ctx)return;const freq=440*Math.pow(2,(midi-69)/12);const osc=ctx.createOscillator(),filter=ctx.createBiquadFilter(),gain=ctx.createGain();filter.type='lowpass';filter.frequency.value=metronome?6000:300+Number(ui.brightness.value)*68;const voice=metronome?'sine':ui.voice.value;osc.type=voice==='bell'?'triangle':voice==='pluck'?'sawtooth':'sine';osc.frequency.setValueAtTime(freq,at);const len=metronome?.045:Math.max(.08,Math.min(duration*.85,1.6));gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime((metronome?.09:.21)*velocity,at+.008);gain.gain.exponentialRampToValueAtTime(.0001,at+len);osc.connect(filter);filter.connect(gain);gain.connect(state.dry);if(!metronome)gain.connect(state.delay);osc.start(at);osc.stop(at+len+.04);state.voices.add(osc);osc.onended=()=>{state.voices.delete(osc);try{osc.disconnect();filter.disconnect();gain.disconnect();}catch{}};}
function schedule(){const run=state.run;if(!state.playing||!state.ctx)return;const ctx=state.ctx;const secPerBeat=60/Number(ui.tempo.value);while(state.nextTime<ctx.currentTime+.11){const i=state.index,n=state.notes[i],start=state.nextTime;playTone(n.midi,start,n.duration*secPerBeat);const delayMs=Math.max(0,(start-ctx.currentTime)*1000);setTimeout(()=>{if(state.run===run&&state.playing)setActive(i)},delayMs);state.nextTime+=n.duration*secPerBeat;state.index=(i+1)%state.notes.length;}state.timer=setTimeout(schedule,25);}
async function start(){if(state.playing)return;try{const ctx=ensureAudio();await ctx.resume();state.run++;state.playing=true;state.index=0;state.nextTime=ctx.currentTime+.06;state.nextBeatTime=state.nextTime;state.beatCount=0;ui.status.textContent='● PLAYING';ui.status.classList.add('live');$('play').innerHTML='■ <span>Stop</span>';schedule();}catch(e){ui.status.textContent='AUDIO UNAVAILABLE';console.error(e);}}
function stop(){state.run++;state.playing=false;clearTimeout(state.timer);state.timer=0;for(const o of state.voices){try{o.stop();}catch{}}state.voices.clear();ui.status.textContent='● READY';ui.status.classList.remove('live');$('play').innerHTML='▶ <span>Play</span>';setActive(-1);}
function variableLength(n){let v=n,out=[];do{out.unshift(v&0x7f);v>>=7;}while(v);for(let i=0;i<out.length-1;i++)out[i]|=0x80;return out;}
function midiExport(){const notes=state.notes,ticks=480,events=[];for(const n of notes){const at=Math.round(n.start*ticks),end=Math.round((n.start+n.duration*.9)*ticks);events.push({tick:at,priority:1,bytes:[0x90,n.midi,95]},{tick:end,priority:0,bytes:[0x80,n.midi,0]});}events.sort((a,b)=>a.tick-b.tick||a.priority-b.priority);const track=[0,0xff,0x51,3,...tempoBytes(Number(ui.tempo.value))];let prev=0;for(const e of events){track.push(...variableLength(e.tick-prev),...e.bytes);prev=e.tick;}track.push(0,0xff,0x2f,0);const header=[...ascii('MThd'),...u32(6),0,0,0,1,1,0xe0],chunk=[...ascii('MTrk'),...u32(track.length),...track],blob=new Blob([new Uint8Array([...header,...chunk])],{type:'audio/midi'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`chrysasynth-fibonacci-${ui.key.value}-${ui.scale.value}.mid`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function ascii(s){return [...s].map(c=>c.charCodeAt(0));}function u32(n){return [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255];}function tempoBytes(bpm){const n=Math.round(60000000/bpm);return [(n>>>16)&255,(n>>>8)&255,n&255];}
$('play').addEventListener('click',()=>state.playing?stop():start());$('stop').addEventListener('click',stop);$('reset').addEventListener('click',()=>{stop();ui.offset.value=0;regenerate();});$('random').addEventListener('click',()=>{ui.offset.value=Math.floor(Math.random()*41);regenerate();});$('export').addEventListener('click',midiExport);
ROOT.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>{state.view=b.dataset.view;ROOT.querySelectorAll('[data-view]').forEach(x=>x.classList.toggle('active',x===b));$('visuals').className='visuals '+state.view;$('panel-title').textContent=state.view==='geometry'?'Fibonacci Geometry':state.view==='piano'?'Generated Notes':'Geometry + Sequence';requestAnimationFrame(draw);}));
for(const id of ['key','scale','steps','octave','offset','rhythm'])$(id).addEventListener('change',regenerate);
for(const id of ['offset','brightness','space','tempo'])$(id).addEventListener('input',()=>{const v=$(id).value;$(id+'-val')&&($(id+'-val').textContent=v+(id==='brightness'||id==='space'?'%':''));id==='tempo'&&($('tempo-value').textContent=v);id==='space'&&setSpace();if(id==='offset')regenerate();});
// Integration point: Forge can call window.ForgeFibonacci.destroy() before switching modules.
async function destroy(){stop();if(observer)observer.disconnect();else window.removeEventListener('resize',resize);if(state.ctx){await state.ctx.close();state.ctx=null;} }
window.ForgeFibonacci={stop,destroy};window.addEventListener('pagehide',stop);
regenerate();
