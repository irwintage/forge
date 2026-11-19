/* Self-contained Web Audio percussion engine; no external dependencies. */
class PolyPercussionEngine {
  constructor(){this.ctx=null;this.master=null;this.bus=null;this.comp=null;this.voices=[];this.active=[];this.masterLevel=.70;this.noiseBuffer=null;}
  async init(){
    if(!this.ctx){
      const AC=window.AudioContext||window.webkitAudioContext; if(!AC) throw Error('Web Audio unsupported');
      const c=this.ctx=new AC();
      this.master=c.createGain();this.master.gain.value=this.masterLevel;
      this.comp=c.createDynamicsCompressor();this.comp.threshold.value=-15;this.comp.knee.value=12;this.comp.ratio.value=3;this.comp.attack.value=.004;this.comp.release.value=.18;
      this.bus=c.createGain();this.bus.gain.value=.46;
      this.bus.connect(this.comp);this.comp.connect(this.master);this.master.connect(c.destination);
      this.noiseBuffer=c.createBuffer(1,Math.floor(c.sampleRate*1.5),c.sampleRate);
      const data=this.noiseBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
    }
    await this.ctx.resume();
  }
  setMaster(v){this.masterLevel=v;if(this.ctx)this.master.gain.setTargetAtTime(v,this.ctx.currentTime,.015)}
  silence(){if(!this.ctx)return;const now=this.ctx.currentTime;for(const item of this.active){try{item.gain.gain.cancelScheduledValues(now);item.gain.gain.setTargetAtTime(Math.max(.0001,item.gain.gain.value),now);item.gain.gain.exponentialRampToValueAtTime(.0001,now+.02);item.source.stop(now+.03)}catch(e){}}this.active=[]}
  trigger(index,voice,when){
    if(!this.ctx||voice.mute)return;
    const c=this.ctx, t=Math.max(when,c.currentTime+.001);
    const level=(voice.level/100)*.55;
    const decay=.045+voice.decay/100*.7;
    const pitch=Math.pow(2,(voice.pitch-50)/35);
    const tone=voice.tone/100;
    const type=voice.sound;
    const output=c.createGain();output.gain.value=1;output.connect(this.bus);
    const amp=c.createGain();amp.gain.setValueAtTime(.0001,t);amp.gain.exponentialRampToValueAtTime(Math.max(.0001,level),t+.003);amp.gain.exponentialRampToValueAtTime(.0001,t+decay);
    amp.connect(output);
    const useNoise=type==='Snare'||type==='Hat'||type==='Clap'||type==='Shaker';
    const source=useNoise?c.createBufferSource():c.createOscillator();
    if(useNoise){source.buffer=this.noiseBuffer;
      const filter=c.createBiquadFilter();filter.type=type==='Hat'||type==='Shaker'?'highpass':'bandpass';
      filter.frequency.setValueAtTime((type==='Hat'?4600:type==='Shaker'?3800:1100)*pitch*(.5+tone),t);
      filter.Q.value=type==='Clap'?0.45:0.8;source.connect(filter);filter.connect(amp);
      if(type==='Hat'||type==='Shaker')amp.gain.exponentialRampToValueAtTime(.0001,t+Math.min(decay,.22));
      if(type==='Clap')amp.gain.exponentialRampToValueAtTime(.0001,t+Math.min(decay,.32));
    }else{
      source.type=type==='Bell'?'sine':type==='Rim'?'triangle':type==='Pluck'?'triangle':'sine';
      const base=type==='Kick'?95:type==='Tom'?170:type==='Bell'?490:type==='Pluck'?315:590;
      source.frequency.setValueAtTime(base*pitch*(type==='Kick'?1.8:1),t);
      source.frequency.exponentialRampToValueAtTime(Math.max(45,base*pitch*(type==='Kick'?.44:type==='Tom'?.65:1)),t+Math.min(.13,decay));
      const filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=650+tone*11500;source.connect(filter);filter.connect(amp);
    }
    source.start(t);source.stop(t+Math.max(.04,Math.min(1.4,decay+.04)));
    const item={source,gain:amp};this.active.push(item);
    source.onended=()=>{try{source.disconnect();amp.disconnect();output.disconnect()}catch(e){}this.active=this.active.filter(v=>v!==item)};
  }
  async destroy(){this.silence();if(this.ctx){await this.ctx.close();this.ctx=null;}}
}
window.PolyPercussionEngine=PolyPercussionEngine;
