/* Frequency ⇆ Note · Forge-ready utility · Web Audio, no CDN required. */
(() => {
'use strict';
const root=document.getElementById('fn-app');
if(!root)return;
const $=id=>root.querySelector('#'+id);
const names=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const MIN=20,MAX=20000,REF=440;
const el={freq:$('fn-freq'),slider:$('fn-slider'),note:$('fn-note'),cents:$('fn-cents'),exact:$('fn-exact'),noteName:$('fn-noteName'),oct:$('fn-oct'),play:$('fn-play'),stop:$('fn-stop'),snap:$('fn-snap'),apply:$('fn-apply'),wave:$('fn-wave'),wavePath:$('fn-wave-path'),master:$('fn-master'),masterVal:$('fn-master-val'),status:$('fn-status'),audioStatus:$('fn-audio-status')};
const clamp=(x,lo,hi)=>Math.max(lo,Math.min(hi,x));
const toMidi=f=>69+12*Math.log2(f/REF);
const toFreq=m=>REF*Math.pow(2,(m-69)/12);
const toSlider=f=>Math.round(clamp(Math.log(f/MIN)/Math.log(MAX/MIN),0,1)*10000);
const fromSlider=v=>MIN*Math.pow(MAX/MIN,v/10000);
const freqLabel=f=>f>=100?f.toFixed(2):f.toFixed(3);
const state={freq:440,ctx:null,osc:null,voiceGain:null,masterGain:null,filter:null,playing:false,stopTimer:null,disposeTimer:null,disposed:false};
const noteInfo=f=>{const midi=Math.round(toMidi(f)),exact=toFreq(midi);return {midi,exact,name:names[((midi%12)+12)%12],octave:Math.floor(midi/12)-1,cents:1200*Math.log2(f/exact)};};
function showFreq(f,opts={}){
 if(!Number.isFinite(f)||f<=0)return;
 state.freq=clamp(f,MIN,MAX);
 const info=noteInfo(state.freq);
 if(!opts.keepInput)el.freq.value=freqLabel(state.freq);
 el.slider.value=String(toSlider(state.freq));
 el.note.textContent=`${info.name}${info.octave}`;
 el.cents.innerHTML=`${info.cents>=0?'+':''}${info.cents.toFixed(1)} <span>cents</span>`;
 el.exact.innerHTML=`${freqLabel(info.exact)} <span>Hz</span>`;
 el.noteName.value=info.name;
 if(![...el.oct.options].some(o=>Number(o.value)===info.octave)){
  const o=document.createElement('option');o.value=String(info.octave);o.textContent=String(info.octave);el.oct.add(o);
 }
 el.oct.value=String(info.octave);
 if(state.playing&&state.ctx&&state.osc){state.osc.frequency.setTargetAtTime(state.freq,state.ctx.currentTime,.012);el.audioStatus.textContent=`${freqLabel(state.freq)} Hz · ${info.name}${info.octave}`;}
}
function setNote(){const octave=Number(el.oct.value),degree=names.indexOf(el.noteName.value);if(degree<0||!Number.isInteger(octave))return;showFreq(toFreq((octave+1)*12+degree));}
function setMaster(){const v=Number(el.master.value);el.masterVal.textContent=`${v}%`;if(state.masterGain&&state.ctx){state.masterGain.gain.setTargetAtTime(v/100*.14,state.ctx.currentTime,.025);}}
function drawWave(){const mode=el.wave.value;const points=[];const N=240;for(let i=0;i<=N;i++){const t=i/N;const phase=t*2*Math.PI*3.5;let v=Math.sin(phase);if(mode==='triangle')v=2/Math.PI*Math.asin(Math.sin(phase));else if(mode==='square')v=.78*Math.tanh(3*Math.sin(phase));const y=42-v*23;points.push(`${i?'L':'M'}${(320*t).toFixed(2)},${y.toFixed(2)}`);}el.wavePath.setAttribute('d',points.join(' '));}
async function ensureAudio(){if(state.disposed)throw Error('Module disposed');const C=window.AudioContext||window.webkitAudioContext;if(!C)throw Error('Web Audio unsupported');if(!state.ctx){const ctx=new C();state.ctx=ctx;state.filter=ctx.createBiquadFilter();state.filter.type='lowpass';state.filter.frequency.value=6500;state.filter.Q.value=.45;state.masterGain=ctx.createGain();state.masterGain.gain.value=Number(el.master.value)/100*.14;state.filter.connect(state.masterGain);state.masterGain.connect(ctx.destination);}await state.ctx.resume();}
function clearTimers(){if(state.stopTimer!==null){clearTimeout(state.stopTimer);state.stopTimer=null;}if(state.disposeTimer!==null){clearTimeout(state.disposeTimer);state.disposeTimer=null;}}
function stopTone(){if(state.stopTimer!==null){clearTimeout(state.stopTimer);state.stopTimer=null;}const osc=state.osc,gain=state.voiceGain;state.osc=null;state.voiceGain=null;state.playing=false;el.play.innerHTML='<span class="fn-play-icon">▶</span> Play tone';el.status.textContent='● READY';el.status.classList.remove('live');el.audioStatus.textContent='Click Play for a 3-second reference tone.';if(!osc||!gain||!state.ctx)return;const now=state.ctx.currentTime;gain.gain.cancelScheduledValues(now);gain.gain.setTargetAtTime(0,now,.015);try{osc.stop(now+.11);}catch{}osc.onended=()=>{try{osc.disconnect();gain.disconnect();}catch{}};}
async function playTone(){if(state.playing){stopTone();return;}try{await ensureAudio();if(state.disposed)return;clearTimers();const ctx=state.ctx;const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=el.wave.value;osc.frequency.setValueAtTime(state.freq,ctx.currentTime);gain.gain.value=0;osc.connect(gain);gain.connect(state.filter);osc.onended=()=>{try{osc.disconnect();gain.disconnect();}catch{}};const now=ctx.currentTime;osc.start(now);gain.gain.setTargetAtTime(1,now,.009);state.osc=osc;state.voiceGain=gain;state.playing=true;el.play.innerHTML='<span class="fn-play-icon">■</span> Stop tone';el.status.textContent='● PLAYING';el.status.classList.add('live');const info=noteInfo(state.freq);el.audioStatus.textContent=`${freqLabel(state.freq)} Hz · ${info.name}${info.octave}`;state.stopTimer=setTimeout(stopTone,3000);}catch(e){el.audioStatus.textContent='Audio unavailable in this browser.';console.error('Frequency Note audio:',e);}}
function destroy(){if(state.disposed)return;stopTone();clearTimers();state.disposed=true;if(state.ctx){state.ctx.close().catch(()=>{});state.ctx=null;}window.removeEventListener('pagehide',onPageHide);if(window.ForgeFrequencyNote?.destroy===destroy)delete window.ForgeFrequencyNote;}
function onPageHide(){stopTone();}
el.freq.addEventListener('input',()=>{const v=Number(el.freq.value);if(el.freq.value!==''&&Number.isFinite(v)&&v>0)showFreq(v,{keepInput:true});});
el.freq.addEventListener('change',()=>{const v=Number(el.freq.value);showFreq(Number.isFinite(v)&&v>0?v:440);});
el.freq.addEventListener('keydown',e=>{if(e.key==='Enter'){el.freq.blur();}});
el.slider.addEventListener('input',()=>showFreq(fromSlider(Number(el.slider.value))));
el.snap.addEventListener('click',()=>showFreq(toFreq(Math.round(toMidi(state.freq)))));
el.apply.addEventListener('click',setNote);
el.play.addEventListener('click',playTone);
el.stop.addEventListener('click',stopTone);
el.wave.addEventListener('change',()=>{drawWave();if(state.osc)state.osc.type=el.wave.value;});
el.master.addEventListener('input',setMaster);
window.addEventListener('pagehide',onPageHide);
window.ForgeFrequencyNote={stop:stopTone,destroy,version:'1.0.0'};
showFreq(440);setMaster();drawWave();
})();
