/* Vocalis audio engine: Tone.js realtime and matching Offline rendering. */
window.VocalisAudio=(()=>{
'use strict';
let buffer=null,player=null,graph=null,startedAt=0,duration=0,finishTimer=null,rendering=false;
const state={mode:'doubler',character:.5,mix:.75,output:0,ab:'A'};
const dbGain=v=>Math.pow(10,v/20);
const equalPower=m=>({dry:Math.cos(m*Math.PI/2),wet:Math.sin(m*Math.PI/2)});
const nodes={};
function requireTone(){if(!window.Tone)throw new Error('Tone.js failed to load. Check your network connection.');return Tone;}
async function ensureAudio(){requireTone();await Tone.start();await Tone.context.resume();}
async function load(file){requireTone();await ensureAudio();stop();const ab=await file.arrayBuffer();buffer=await Tone.context.decodeAudioData(ab.slice(0));duration=buffer.duration;return buffer;}
function disposeGraph(){if(!graph)return;for(const n of graph.nodes){try{n.dispose()}catch(e){}}graph=null;}
function createProcessing(mode,character,opts={}){
 const t=requireTone(),ns=[];const add=n=>(ns.push(n),n);
 const entry=add(new t.Gain(1)),exit=add(new t.Gain(1));
 if(mode==='doubler'){
  const chorus=add(new t.Chorus({frequency:.45+character*1.8,delayTime:4+character*11,depth:.25+character*.6,feedback:.05+character*.15,spread:180}).start());
  const wide=add(new t.StereoWidener(.25+character*.65)); entry.connect(chorus);chorus.connect(wide);wide.connect(exit);
 }else if(mode==='pitch'){
  const st=Math.round((character-.5)*24);
  const shift=add(new t.PitchShift({pitch:st,windowSize:.1,delayTime:0,feedback:0}));entry.connect(shift);shift.connect(exit);
 }else if(mode==='robot'){
  const filt=add(new t.AutoFilter({frequency:.25+character*1.5,depth:.45+character*.5,baseFrequency:300+character*600,octaves:1.3+character*2}).start());
  const distortion=add(new t.Distortion(.1+character*.35));const cheb=add(new t.Chebyshev(8+Math.round(character*22)));entry.connect(filt);filt.connect(distortion);distortion.connect(cheb);cheb.connect(exit);
 }else if(mode==='space'){
  const hp=add(new t.Filter(120,'highpass'));
  const delay=add(new t.PingPongDelay({delayTime:.18+character*.52,feedback:.12+character*.52,wet:.45}));
  const rev=add(new t.Reverb({decay:.8+character*4.2,preDelay:character*.05,wet:.55}));
  const lp=add(new t.Filter(10000-character*5000,'lowpass'));
  entry.connect(hp);hp.connect(delay);delay.connect(rev);rev.connect(lp);lp.connect(exit);
 }else entry.connect(exit);
 return {entry,exit,nodes:ns};
}
function createGraph(){disposeGraph();const t=requireTone();const ns=[];const dry= new t.Gain(1), wet=new t.Gain(0),output=new t.Gain(dbGain(state.output)).toDestination();ns.push(dry,wet,output);dry.connect(output);wet.connect(output);const proc=createProcessing(state.mode,state.character);ns.push(...proc.nodes);proc.exit.connect(wet);graph={dry,wet,output,proc,nodes:ns};applyMix(false);}
function applyMix(smooth=true){if(!graph)return;const gains=equalPower(state.mix),processed=state.ab==='B';const assign=(param,v)=>smooth?param.rampTo(v,.03):param.value=v;assign(graph.dry.gain,processed?gains.dry:1);assign(graph.wet.gain,processed?gains.wet:0);assign(graph.output.gain,dbGain(state.output));}
function set(name,value){if(!(name in state))return;const old=state[name];state[name]=value;if(name==='mode'||name==='character'){if(graph&&old!==value){if(player){const src=player;try{src.disconnect()}catch(e){}createGraph();src.connect(graph.dry);src.connect(graph.proc.entry);}else createGraph()}}else applyMix();}
function stop(){if(finishTimer){clearTimeout(finishTimer);finishTimer=null}if(player){try{player.stop()}catch(e){}try{player.dispose()}catch(e){}player=null}startedAt=0;}
async function play(onended){if(!buffer)throw Error('Load audio first.');await ensureAudio();stop();if(!graph)createGraph();player=new Tone.Player(buffer);player.connect(graph.dry);player.connect(graph.proc.entry);startedAt=Tone.now();player.start(startedAt);finishTimer=setTimeout(()=>{finishTimer=null;stop();onended?.()},Math.ceil(duration*1000)+100);}
function position(){return player?Math.max(0,Math.min(duration,Tone.now()-startedAt)):null;}
function clear(){stop();disposeGraph();buffer=null;duration=0;}
function encodeWav(audioBuffer){const native=audioBuffer?.get?audioBuffer.get():audioBuffer;const channels=Math.min(2,native.numberOfChannels),len=native.length,sr=native.sampleRate,bytes=len*channels*2,ab=new ArrayBuffer(bytes+44),v=new DataView(ab);const str=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i))};str(0,'RIFF');v.setUint32(4,bytes+36,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,channels,true);v.setUint32(24,sr,true);v.setUint32(28,sr*channels*2,true);v.setUint16(32,channels*2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,bytes,true);let o=44;for(let i=0;i<len;i++)for(let c=0;c<channels;c++){let s=Math.max(-1,Math.min(1,native.getChannelData(c)[i]));v.setInt16(o,Math.round(s<0?s*32768:s*32767),true);o+=2}return new Blob([ab],{type:'audio/wav'});}
async function exportWav(filename='vocalis-processed.wav'){
 if(!buffer)throw new Error('Load audio first.');if(rendering)throw new Error('Already rendering.');
 rendering=true;try{
  requireTone();
  const settings={...state};const source=buffer;
  const rendered=await Tone.Offline(async()=>{
   const dry=new Tone.Gain(equalPower(settings.mix).dry);
   const wet=new Tone.Gain(equalPower(settings.mix).wet);
   const out=new Tone.Gain(dbGain(settings.output)).toDestination();
   dry.connect(out);wet.connect(out);
   const proc=createProcessing(settings.mode,settings.character);proc.exit.connect(wet);
   const p=new Tone.Player(source);p.connect(dry);p.connect(proc.entry);p.start(0);p.stop(duration);
  },duration+1.5,2);
  const wav=encodeWav(rendered);
  const url=URL.createObjectURL(wav),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
  return wav;
 }finally{rendering=false}
}
return {state,load,set,stop,play,position,clear,exportWav,get buffer(){return buffer},get duration(){return duration},get playing(){return !!player}};
})();
