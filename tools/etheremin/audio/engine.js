/* Etheremin Forge V1.3 | expressive theremin voice (Web Audio, no modules). */
(function(){'use strict';
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
function impulse(ctx,seconds){
  const n=Math.floor(ctx.sampleRate*seconds),b=ctx.createBuffer(2,n,ctx.sampleRate);
  for(let ch=0;ch<2;ch++){
    const d=b.getChannelData(ch);let seed=ch?17171:34113;
    let smooth=0;
    for(let i=0;i<n;i++){
      seed=(Math.imul(seed,1664525)+1013904223)|0;
      const white=(seed>>>0)/2147483648-1;
      smooth=.78*smooth+.22*white;
      const t=i/n;
      const predelay=i<Math.floor(.013*ctx.sampleRate)?0:1;
      d[i]=(white*.42+smooth*.58)*Math.pow(1-t,2.8)*.24*predelay;
    }
  }
  return b;
}
// The harmonics make the sound vocal and rounded instead of pure / piercing.
// Every voice shares the same stable phase progression; no beating oscillators.
function wave(ctx,harmonics){
  const real=new Float32Array(harmonics.length+1),imag=new Float32Array(harmonics.length+1);
  for(let i=0;i<harmonics.length;i++)imag[i+1]=harmonics[i];
  return ctx.createPeriodicWave(real,imag,{disableNormalization:false});
}
class EtherAudio{
  constructor(){
    this.ctx=null;this.ready=false;this.sounding=false;
    this.params={tone:'warm',glide:120,vibrato:40,reverb:40,volume:42};
    this.currentHz=220;this.lastNoteOn=0;this.currentExpr=0;
  }
  async init(){
    if(this.ready){await this.ctx.resume();return;}
    const C=window.AudioContext||window.webkitAudioContext;
    if(!C)throw Error('Web Audio is unavailable');
    const c=this.ctx=new C();
    // Fundamental + a restrained octave below for body. Not a chorused detuned pair.
    this.oscA=c.createOscillator();this.oscB=c.createOscillator();
    this.oscA.frequency.value=220;this.oscB.frequency.value=110;
    this.waves={
      pure:wave(c,[1,.045,.012]),
      warm:wave(c,[1,.42,.22,.11,.065,.028,.013]),
      air:wave(c,[1,.23,.11,.12,.09,.05,.025,.01])
    };
    this.oscA.setPeriodicWave(this.waves.warm);
    this.oscB.setPeriodicWave(wave(c,[1,.12,.025]));
    this.ga=c.createGain();this.gb=c.createGain();
    this.ga.gain.value=.76;this.gb.gain.value=.11;
    this.amp=c.createGain();this.amp.gain.value=0;
    // Gentle frequency-following low-pass preserves warmth at the upper end.
    this.lp=c.createBiquadFilter();this.lp.type='lowpass';this.lp.frequency.value=1100;this.lp.Q.value=.48;
    this.body=c.createBiquadFilter();this.body.type='peaking';this.body.frequency.value=750;this.body.Q.value=.62;this.body.gain.value=1.6;
    this.lowCut=c.createBiquadFilter();this.lowCut.type='highpass';this.lowCut.frequency.value=72;this.lowCut.Q.value=.7;
    this.dry=c.createGain();this.wet=c.createGain();
    this.convolver=c.createConvolver();this.convolver.buffer=impulse(c,1.55);
    this.bus=c.createGain();this.master=c.createGain();this.master.gain.value=0;
    this.limiter=c.createDynamicsCompressor();
    this.limiter.threshold.value=-12;this.limiter.knee.value=8;this.limiter.ratio.value=10;
    this.limiter.attack.value=.003;this.limiter.release.value=.16;
    // A single smooth vibrato LFO, controlled in cents, same depth for both oscillators.
    this.vib=c.createOscillator();this.vib.type='sine';this.vib.frequency.value=5.35;
    this.vibGain=c.createGain();this.vibGain.gain.value=0;
    this.vib.connect(this.vibGain);
    this.vibGain.connect(this.oscA.detune);
    this.vibGain.connect(this.oscB.detune);
    this.oscA.connect(this.ga);this.oscB.connect(this.gb);
    this.ga.connect(this.amp);this.gb.connect(this.amp);
    this.amp.connect(this.lowCut);this.lowCut.connect(this.lp);this.lp.connect(this.body);
    this.body.connect(this.dry);this.body.connect(this.convolver);this.convolver.connect(this.wet);
    this.dry.connect(this.bus);this.wet.connect(this.bus);
    this.bus.connect(this.master);this.master.connect(this.limiter);
    this.dest=c.createMediaStreamDestination();
    this.limiter.connect(this.dest);this.limiter.connect(c.destination);
    this.oscA.start();this.oscB.start();this.vib.start();
    this.ready=true;this.setParams(this.params);await c.resume();
  }
  setParams(p){
    Object.assign(this.params,p);
    if(!this.ready)return;
    const n=this.ctx.currentTime,q=this.params;
    const tone=this.waves[q.tone]||this.waves.warm;
    // PeriodicWave is changed only when the voice selector changes, not at tracking rate.
    if(tone!==this.selectedWave){this.oscA.setPeriodicWave(tone);this.selectedWave=tone;}
    const gains=q.tone==='pure'?[.71,.045]:q.tone==='air'?[.72,.075]:[.76,.11];
    this.ga.gain.setTargetAtTime(gains[0],n,.025);
    this.gb.gain.setTargetAtTime(gains[1],n,.025);
    this.dry.gain.setTargetAtTime(1-q.reverb/190,n,.04);
    this.wet.gain.setTargetAtTime(q.reverb/100,n,.04);
    this.master.gain.setTargetAtTime(clamp(q.volume,0,100)/100*.70,n,.045);
    if(this.sounding)this.vibGain.gain.setTargetAtTime(clamp(q.vibrato,0,40)*(.72+.28*this.currentExpr),n,.13);
  }
  update(hz,expression){
    if(!this.ready)return;
    const c=this.ctx,n=c.currentTime;
    hz=clamp(hz,50,1400);const expr=clamp(expression,0,1);
    const wasSounding=this.sounding;
    this.sounding=true;this.currentExpr=expr;
    const glide=clamp(this.params.glide/1000,.008,.4);
    // WebAudio setTargetAtTime is continuous even when tracking updates frequently.
    this.oscA.frequency.setTargetAtTime(hz,n,glide*.42);
    this.oscB.frequency.setTargetAtTime(hz*.5,n,glide*.42);
    this.currentHz=hz;
    // Smooth amplitude expression with quiet-to-full range and slower releases.
    this.amp.gain.setTargetAtTime(.56*Math.pow(expr,1.3),n,expr>.15?.035:.065);
    // A frequency-dependent cutoff keeps high notes rounded while following expression.
    const tone=this.params.tone;
    const ratio=tone==='pure'?2.9:tone==='air'?4.5:3.5;
    const ceiling=tone==='air'?3400:2800;
    const cutoff=clamp(hz*(ratio+.8*expr),410,ceiling);
    this.lp.frequency.setTargetAtTime(cutoff,n,.085);
    this.body.frequency.setTargetAtTime(clamp(hz*2.5,390,1100),n,.09);
    if(!wasSounding){
      // Re-entry is smooth. Vibrato gently blossoms after the initial attack.
      this.vibGain.gain.cancelScheduledValues(n);
      this.vibGain.gain.setValueAtTime(0,n);
      this.lastNoteOn=n;
    }
    const vibrato=clamp(this.params.vibrato,0,40)*(.72+.28*expr);
    this.vibGain.gain.setTargetAtTime(vibrato,n,wasSounding?.15:.18);
  }
  release(){
    if(!this.ready)return;
    const n=this.ctx.currentTime;
    if(this.sounding){this.amp.gain.setTargetAtTime(0,n,.045);this.vibGain.gain.setTargetAtTime(0,n,.09);}
    this.sounding=false;this.currentExpr=0;
  }
  panic(){
    if(!this.ready)return;
    const n=this.ctx.currentTime;
    this.amp.gain.cancelScheduledValues(n);
    this.amp.gain.setTargetAtTime(0,n,.006);
    this.vibGain.gain.setTargetAtTime(0,n,.018);
    this.sounding=false;this.currentExpr=0;
  }
  getStream(){return this.ready?this.dest.stream:null;}
}
window.EtherAudio=EtherAudio;
})();
