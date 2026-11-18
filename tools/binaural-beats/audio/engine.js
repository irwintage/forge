/* Independent, dependency-free stereo oscillator engine for Forge.
   Audio graph: two oscillators -> separate envelope gains -> channel merger -> master -> destination.
   Pink noise is generated in its own channel-independent low-level path.
*/
(function(){
'use strict';
class BinauralAudio {
  constructor(){this.ctx=null;this.master=null;this.left=null;this.right=null;this.leftGain=null;this.rightGain=null;this.noise=null;this.noiseGain=null;this.noiseBuffer=null;this.running=false;this.volume=.22;this.noiseLevel=.12;this.noiseEnabled=false;this.base=220;this.beat=8;this.wave='sine';}
  async init(){
    if(!this.ctx){
      const C=window.AudioContext||window.webkitAudioContext;
      if(!C)throw new Error('Web Audio API unavailable');
      this.ctx=new C();
      this.master=this.ctx.createGain();
      this.master.gain.value=0;
      this.master.connect(this.ctx.destination);
    }
    if(this.ctx.state==='suspended')await this.ctx.resume();
  }
  setFrequencies(base,beat){
    this.base=base;this.beat=beat;
    if(!this.ctx||!this.running)return;
    const t=this.ctx.currentTime;
    for(const [osc,f] of [[this.left,base-beat/2],[this.right,base+beat/2]]){
      if(!osc)continue;
      osc.frequency.cancelScheduledValues(t);
      osc.frequency.setTargetAtTime(f,t,.022);
    }
  }
  setVolume(v){this.volume=v;if(this.master&&this.ctx){const t=this.ctx.currentTime;this.master.gain.setTargetAtTime(this.running?this.volume:0,t,.032);}}
  setNoiseLevel(v){this.noiseLevel=v;if(this.noiseGain&&this.ctx){this.noiseGain.gain.setTargetAtTime(this.noiseEnabled?v*.09:0,this.ctx.currentTime,.04);}}
  setNoiseEnabled(on){this.noiseEnabled=on;if(this.running&&this.ctx){this.ensureNoise();this.setNoiseLevel(this.noiseLevel);}}
  createPinkNoise(){
    const len=this.ctx.sampleRate*4;
    const b=this.ctx.createBuffer(1,len,this.ctx.sampleRate),out=b.getChannelData(0);
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for(let i=0;i<len;i++){
      const w=Math.random()*2-1;
      b0=.99886*b0+w*.0555179;b1=.99332*b1+w*.0750759;
      b2=.96900*b2+w*.1538520;b3=.86650*b3+w*.3104856;
      b4=.55000*b4+w*.5329522;b5=-.7616*b5-w*.0168980;
      out[i]=Math.max(-1,Math.min(1,(b0+b1+b2+b3+b4+b5+b6+w*.5362)*.095));
      b6=w*.115926;
    }
    return b;
  }
  ensureNoise(){
    if(!this.running||!this.ctx||this.noise)return;
    if(!this.noiseBuffer)this.noiseBuffer=this.createPinkNoise();
    this.noise=this.ctx.createBufferSource();this.noise.buffer=this.noiseBuffer;this.noise.loop=true;
    this.noiseGain=this.ctx.createGain();this.noiseGain.gain.value=0;
    // Center the pink bed, unlike L and R carrier signals.
    this.noise.connect(this.noiseGain);this.noiseGain.connect(this.master);this.noise.start();
  }
  async start({base,beat,wave,volume,noise,noiseLevel}){
    await this.init();
    this.base=base;this.beat=beat;this.wave=wave;this.volume=volume;this.noiseEnabled=noise;this.noiseLevel=noiseLevel;
    if(this.running){this.stop();}
    const ctx=this.ctx;
    // Web Audio's ChannelMergerNode forces exactly two channels, even with mono output.
    const merger=ctx.createChannelMerger(2);
    merger.connect(this.master);
    this.merger=merger;
    this.left=ctx.createOscillator();this.right=ctx.createOscillator();
    this.left.type=wave;this.right.type=wave;
    this.left.frequency.value=base-beat/2;
    this.right.frequency.value=base+beat/2;
    this.leftGain=ctx.createGain();this.rightGain=ctx.createGain();
    // Attenuation for waves with higher RMS and to avoid clipping on stereo downmix.
    const voiceLevel=(wave==='square'||wave==='sawtooth')?.40:.55;
    this.leftGain.gain.value=voiceLevel;this.rightGain.gain.value=voiceLevel;
    this.left.connect(this.leftGain);this.right.connect(this.rightGain);
    this.leftGain.connect(merger,0,0);this.rightGain.connect(merger,0,1);
    this.master.gain.cancelScheduledValues(ctx.currentTime);
    this.master.gain.setValueAtTime(0,ctx.currentTime);
    this.master.gain.setTargetAtTime(volume,ctx.currentTime,.09);
    this.left.start();this.right.start();
    this.running=true;
    if(noise){this.ensureNoise();this.setNoiseLevel(noiseLevel);}
  }
  setWave(w){this.wave=w;for(const osc of [this.left,this.right])if(osc)osc.type=w;}
  stop(){
    if(!this.ctx)return;
    const ctx=this.ctx,t=ctx.currentTime;
    this.running=false;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(0,t,.065);
    // Disconnect asynchronously only after the fade; repeated start safely clears old graph.
    const nodes=[this.left,this.right,this.leftGain,this.rightGain,this.merger,this.noise,this.noiseGain];
    this.left=this.right=this.leftGain=this.rightGain=this.merger=this.noise=this.noiseGain=null;
    const stopAt=t+.35;
    for(const node of nodes){if(!node)continue;try{if(typeof node.stop==='function')node.stop(stopAt);}catch{}}
    // Close old graph connections when source finished, without touching current playback.
    setTimeout(()=>{for(const node of nodes){try{node?.disconnect();}catch{}}},500);
  }
  async destroy(){this.stop();if(this.ctx){const old=this.ctx;this.ctx=null;await old.close().catch(()=>{});}this.master=null;this.noiseBuffer=null;}
}
window.BinauralAudio=BinauralAudio;
})();
