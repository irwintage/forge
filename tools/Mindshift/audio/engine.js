/* Mindshift V3 / Native Web Audio — stable buses, capped voices, no global Tone Transport. */
(() => {
'use strict';
const LIMIT=(x,a,b)=>Math.min(b,Math.max(a,x));
const ROOTS=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const SCALE=window.MindshiftScales;
const CFG=window.MindshiftPresets;
class MindshiftEngine {
  constructor(){
    this.ctx=null;this.mode='calm';this.params={};this.root='A';this.scale='minor';this.x=.5;this.y=.5;
    this.masterLevel=.24;this.space=.25;this.running=false;this.recording=false;this.recordLimit=120;
    this.active=[];this.timers=[];this.targetCutoff=1000;this.modTimer=null;this._gesture=false;this.lastTrigger=-100;
    this.lastRecording=null;this.recChunks=[];this.recFrames=0;this.generation=0;
  }
  async ensure(){
    if(!this.ctx){
      const AC=window.AudioContext||window.webkitAudioContext;
      if(!AC)throw new Error('Web Audio unavailable');
      const a=this.ctx=new AC({latencyHint:'interactive'});
      this.input=a.createGain();this.input.gain.value=.58;
      this.filter=a.createBiquadFilter();this.filter.type='lowpass';this.filter.frequency.value=1000;this.filter.Q.value=.55;
      this.dry=a.createGain();this.dry.gain.value=.8;
      this.reverb=a.createConvolver();this.reverb.buffer=this._impulse(2.3);
      this.wet=a.createGain();this.wet.gain.value=.1;
      this.mix=a.createGain();this.mix.gain.value=1;
      this.compressor=a.createDynamicsCompressor();this.compressor.threshold.value=-22;
      this.compressor.knee.value=14;this.compressor.ratio.value=3;this.compressor.attack.value=.015;this.compressor.release.value=.24;
      this.master=a.createGain();this.master.gain.value=this.masterLevel;
      this.analyser=a.createAnalyser();this.analyser.fftSize=1024;
      this.input.connect(this.filter);this.filter.connect(this.dry);this.filter.connect(this.reverb);
      this.dry.connect(this.mix);this.reverb.connect(this.wet);this.wet.connect(this.mix);
      this.mix.connect(this.compressor);this.compressor.connect(this.master);this.master.connect(this.analyser);this.analyser.connect(a.destination);
    }
    if(this.ctx.state==='suspended')await this.ctx.resume();
  }
  _impulse(seconds){
    const a=this.ctx,n=Math.round(a.sampleRate*seconds),b=a.createBuffer(2,n,a.sampleRate);
    // A matched stereo impulse cannot bias the left/right energy balance.
    const l=b.getChannelData(0),r=b.getChannelData(1);
    for(let i=0;i<n;i++){const env=Math.pow(1-i/n,2.8);l[i]=(Math.random()*2-1)*env*.38;r[i]=l[i];}
    return b;
  }
  _ramp(param,value,tau=.06){if(!this.ctx||!param)return;const t=this.ctx.currentTime;param.cancelScheduledValues(t);param.setTargetAtTime(value,t,tau);}
  _freq(degree,oct=3){const notes=SCALE[this.scale]||SCALE.minor;const root=ROOTS.indexOf(this.root);const midi=(oct+1)*12+root+notes[((degree%notes.length)+notes.length)%notes.length]+12*Math.floor(degree/notes.length);return 440*Math.pow(2,(midi-69)/12);}
  setHarmony(root,scale){this.root=ROOTS.includes(root)?root:'A';this.scale=SCALE[scale]?scale:'minor';if(this.running)this.switchMode(this.mode);}
  setMaster(v){this.masterLevel=LIMIT(v,0,.75);if(this.master)this._ramp(this.master.gain,this.masterLevel,.03);}
  setSpace(v){this.space=LIMIT(v,0,1);this.updateXY(this.x,this.y);}
  setParams(p){this.params={...p};this.updateXY(this.x,this.y);}
  _voice(freq,kind,level,{attack=1.8,release=1.4,detune=0,pan=0,partials=1,finite=0}={}){
    if(!this.ctx||!this.running)return null;
    const a=this.ctx,t=a.currentTime+.012;
    const output=a.createGain();output.gain.setValueAtTime(.00001,t);
    output.gain.linearRampToValueAtTime(level,t+Math.max(.02,attack));
    const p=a.createStereoPanner();p.pan.value=LIMIT(pan,-1,1);
    output.connect(p);p.connect(this.input);
    const nodes=[output,p],oscillators=[];
    for(let j=0;j<partials;j++){
      const o=a.createOscillator();o.type=kind;o.frequency.value=freq*(j?j+1:1);o.detune.value=detune+(j?3:0);
      const g=a.createGain();g.gain.value=j?(.24/(j+1)):1;
      o.connect(g);g.connect(output);o.start(t);nodes.push(o,g);oscillators.push(o);
    }
    const voice={nodes,output,p,oscillators,level,stopped:false,stop:(fade=.22)=>{
      if(voice.stopped)return;voice.stopped=true;
      const when=a.currentTime;output.gain.cancelScheduledValues(when);output.gain.setTargetAtTime(.000001,when,Math.max(.015,fade/5));
      oscillators.forEach(o=>{try{o.stop(when+fade+.05);}catch(_){}});
      setTimeout(()=>{nodes.forEach(n=>{try{n.disconnect();}catch(_){}});this.active=this.active.filter(v=>v!==voice);},(fade+.15)*1000);
    }};
    this.active.push(voice);
    if(finite)setTimeout(()=>voice.stop(release),Math.max(.1,finite)*1000);
    return voice;
  }
  _noiseBurst(freq=1800,level=.05,duration=.15){
    if(!this.running||!this.ctx)return;
    const a=this.ctx,t=a.currentTime+.006,sz=Math.max(256,Math.round(a.sampleRate*duration)),buf=a.createBuffer(1,sz,a.sampleRate),d=buf.getChannelData(0);
    for(let i=0;i<sz;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/sz,2);
    const src=a.createBufferSource(),f=a.createBiquadFilter(),g=a.createGain();src.buffer=buf;f.type='bandpass';f.frequency.value=freq;f.Q.value=.8;
    g.gain.value=level;src.connect(f);f.connect(g);g.connect(this.input);src.start(t);src.stop(t+duration);
    src.onended=()=>{src.disconnect();f.disconnect();g.disconnect();};
  }
  _schedule(ms,fn){const id=setInterval(()=>{if(this.running)fn();},ms);this.timers.push(id);}
  _clear(){this.timers.forEach(clearInterval);this.timers.length=0;}
  _releaseAll(fade=.25){for(const v of [...this.active])v.stop(fade);}
  _startMode(){
    const c=CFG[this.mode],p=this.params;
    if(this.mode==='calm'){
      // continuous sustained low drone, no 808 pitch drops
      const base=this._freq(0,2);
      this._voice(base,'sine',.105,{attack:2.4,detune:-2,pan:0});
      this._voice(base*2,'triangle',.040,{attack:3.0,detune:3,pan:0});
      this._voice(base*1.5,'sine',.022,{attack:3.8,pan:0});
    } else if(this.mode==='focus'){
      const base=this._freq(0,3);
      this._voice(base,'sine',.075,{attack:1.2,detune:-2,pan:-.58});
      this._voice(base*1.005,'sine',.072,{attack:1.4,detune:2,pan:.58});
      this._schedule(2200,()=>this._pulse(this._freq(4,4),.028,.48,'sine'));
    } else if(this.mode==='dream'){
      // Four quiet harmonic voices; controlled overlap and low in-engine gain
      [0,2,4,6].forEach((n,i)=>this._voice(this._freq(n,3),'sine',.029,{attack:3.2+i*.28,pan:0,detune:(i%2?1:-1)*2}));
      this._voice(this._freq(0,2),'triangle',.023,{attack:4.2,pan:0});
      this._schedule(4300,()=>this._pulse(this._freq([4,6,2,5][Math.floor(Math.random()*4)],4),.023,1.65,'sine'));
    } else if(this.mode==='flow'){
      const f=this._freq(0,3);
      this._voice(f,'triangle',.065,{attack:2.2,pan:0});
      this._voice(f*1.5,'sine',.032,{attack:2.8,pan:0});
      this._schedule(2600,()=>this._pulse(this._freq(Math.floor(Math.random()*5),4),.036,1.12,'triangle'));
    } else if(this.mode==='ko'){
      this._schedule(500,()=>this._glitch());this._glitch();
    }
    this.updateXY(this.x,this.y);
    this._schedule(140,()=>this._modulate());
  }
  _modulate(){
    if(!this.running||!this.ctx)return;
    const p=this.params,t=this.ctx.currentTime;
    const motion=p.motion??.28;
    const freq=this.targetCutoff;
    const wobble=Math.sin(t*(.10+motion*.65)*2*Math.PI);
    const amount=(this.mode==='calm'?.035:this.mode==='focus'?.055:this.mode==='dream'?.09:.14)*motion;
    this._ramp(this.filter.frequency,LIMIT(freq*(1+amount*wobble),100,8500),.10);
  }
  _pulse(freq,level,dur,shape){if(!this.running)return;const v=this._voice(freq,shape,level,{attack:.025,release:.16,finite:dur});return v;}
  _glitch(){if(!this.running)return;const token=this.generation;const density=(this.params.stutter??.5),depth=(this.params.depth??.4);const count=1+Math.round(density*3);for(let i=0;i<count;i++){setTimeout(()=>{if(!this.running||this.generation!==token)return;const f=this._freq(Math.floor(Math.random()*7),3);this._pulse(f,Math.min(.065,.020+depth*.045),.05+(1-depth)*.07,'square');if(depth>.3)this._noiseBurst(1300+this.x*3000,.015+depth*.018,.06);},i*(48+(1-density)*65));}}
  updateXY(x,y){
    this.x=LIMIT(x,0,1);this.y=LIMIT(y,0,1);if(!this.ctx)return;
    const p=this.params,mode=this.mode;
    let cutoff=CFG[mode].filter;
    if(mode==='calm')cutoff=300+(p.warmth??.5)*900+this.x*950+(1-this.y)*250;
    if(mode==='focus')cutoff=650+(p.tone??.5)*1800+(1-this.y)*1600;
    if(mode==='dream')cutoff=650+this.x*1850+(p.air??.32)*2300;
    if(mode==='flow')cutoff=450+(p.tone??.5)*1850+(1-this.y)*1450;
    if(mode==='ko')cutoff=600+this.y*4500+(p.tone??.5)*1000;
    this.targetCutoff=cutoff;
    this._ramp(this.filter.frequency,cutoff,.08);
    this._ramp(this.filter.Q,mode==='ko'?1.15:.38,.07);
    const space=(p.space??.4)*.16+this.space*.21+(mode==='dream' ? this.y*.11:0);
    this._ramp(this.wet.gain,LIMIT(space,0,.32),.12);
    if(this.active.length){
      this.active.filter(v=>!v.stopped).forEach((v,i)=>{
        // Center every dry source. Focus uses only its matched first pair for equal-power width.
        // No index-based alternating pan: unequal voice levels previously biased the mix.
        const stereo=mode==='focus'?((p.depth??.5)*.48+.10)*(.35+.65*this.x):0;
        const position=mode==='focus' && i<2 ? (i===0?-stereo:stereo) : 0;
        this._ramp(v.p.pan,position,.14);
        // mode-specific dynamic levels, max 1.25x base
        const depth=mode==='calm' ? (p.depth??.6) : mode==='dream' ? (p.body??.58) : (p.depth??.5);
        const lev=v.level*(.77+depth*.34)*(mode==='calm'?(1.07-.18*this.y):1);
        this._ramp(v.output.gain,Math.min(.18,lev),.24);
      });
    }
  }
  gesture(down){this._gesture=!!down;if(!this.running||!down)return;if(this.mode==='ko')this._glitch();else if(this.mode==='dream')this._pulse(this._freq(Math.min(6,Math.floor(this.x*7)),4),.022,.9,'sine');}
  stop(){this.generation++;this.running=false;this._clear();this._releaseAll(.25);this._gesture=false;}
  async start(mode=this.mode){await this.ensure();this.stop();this.mode=mode;this.params=this.params||{};this.running=true;this._startMode();}
  switchMode(mode){this.mode=mode;if(this.running){this.stop();this.running=true;this._startMode();}}
  getWave(target){if(this.analyser)this.analyser.getByteTimeDomainData(target);else target.fill(128);}
  startRecording(){
    if(!this.ctx)throw new Error('Start audio first');if(this.recording)return;
    const a=this.ctx;this.lastRecording=null;this.recChunks=[];this.recFrames=0;
    const node=a.createScriptProcessor(2048,2,2),sink=a.createGain();sink.gain.value=0;
    this.master.connect(node);node.connect(sink);sink.connect(a.destination);
    this.recNode=node;this.recSink=sink;this.recording=true;
    node.onaudioprocess=e=>{
      if(!this.recording)return;
      const l=e.inputBuffer.getChannelData(0),r=e.inputBuffer.numberOfChannels>1?e.inputBuffer.getChannelData(1):l;
      const remaining=Math.max(0,Math.ceil(this.recordLimit*a.sampleRate)-this.recFrames);
      const count=Math.min(l.length,remaining);
      if(count){this.recChunks.push([l.slice(0,count),r.slice(0,count)]);this.recFrames+=count;}
      if(this.recFrames>=this.recordLimit*a.sampleRate)queueMicrotask(()=>{if(this.recording){this.stopRecording();this.onRecordingLimit?.();}});
    };
  }
  stopRecording(){
    if(!this.recording)return this.lastRecording;
    this.recording=false;
    if(this.recNode){this.recNode.onaudioprocess=null;try{this.master.disconnect(this.recNode);this.recNode.disconnect();this.recSink.disconnect();}catch(_){ }this.recNode=null;this.recSink=null;}
    const frames=this.recFrames,rate=this.ctx.sampleRate,buffer=new ArrayBuffer(44+frames*4),dv=new DataView(buffer);
    const str=(o,s)=>{for(let i=0;i<s.length;i++)dv.setUint8(o+i,s.charCodeAt(i));};
    str(0,'RIFF');dv.setUint32(4,36+frames*4,true);str(8,'WAVE');str(12,'fmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,2,true);dv.setUint32(24,rate,true);dv.setUint32(28,rate*4,true);dv.setUint16(32,4,true);dv.setUint16(34,16,true);str(36,'data');dv.setUint32(40,frames*4,true);
    let offset=44;for(const [l,r] of this.recChunks){for(let i=0;i<l.length;i++){dv.setInt16(offset,Math.round(LIMIT(l[i],-1,1)*32767),true);dv.setInt16(offset+2,Math.round(LIMIT(r[i],-1,1)*32767),true);offset+=4;}}
    this.recChunks=[];this.recFrames=0;
    return this.lastRecording=new Blob([buffer],{type:'audio/wav'});
  }
  async destroy(){if(this.recording)this.stopRecording();this.stop();if(this.ctx){try{await this.ctx.close();}catch(_){ }this.ctx=null;}}
}
window.MindshiftEngine=MindshiftEngine;
})();
