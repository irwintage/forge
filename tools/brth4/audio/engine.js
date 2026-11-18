/* BRTH4 Forge | lightweight synthesis, no dependencies */
(function(){'use strict';
class BreathAudio {
 constructor(){this.ctx=null;this.enabled=false;this.mode='brown';this.volume=.3;this.master=null;this.noiseGain=null;this.binauralGain=null;this.filter=null;this.noiseSource=null;}
 async init(){
  if(this.ctx){if(this.ctx.state==='suspended')await this.ctx.resume();return;}
  const A=window.AudioContext||window.webkitAudioContext;
  if(!A)throw new Error('Web Audio is unavailable in this browser');
  const c=this.ctx=new A();this.master=c.createGain();this.master.gain.value=0;
  const limiter=c.createDynamicsCompressor();limiter.threshold.value=-8;limiter.ratio.value=6;limiter.attack.value=.005;limiter.release.value=.16;
  this.master.connect(limiter).connect(c.destination);
  const noiseBuffer=c.createBuffer(1,c.sampleRate*6,c.sampleRate);const data=noiseBuffer.getChannelData(0);let v=0;
  // Integrated white noise with DC blocking / low-frequency protection.
  for(let i=0;i<data.length;i++){v=(v+.016*(Math.random()*2-1))/1.016;data[i]=v*.6;}
  this.noiseSource=c.createBufferSource();this.noiseSource.buffer=noiseBuffer;this.noiseSource.loop=true;
  this.filter=c.createBiquadFilter();this.filter.type='lowpass';this.filter.frequency.value=920;this.filter.Q.value=.7;
  const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=35;
  this.noiseGain=c.createGain();this.noiseGain.gain.value=0;
  this.noiseSource.connect(hp).connect(this.filter).connect(this.noiseGain).connect(this.master);
  const left=c.createOscillator(),right=c.createOscillator();left.type='sine';right.type='sine';left.frequency.value=180;right.frequency.value=188;
  const leftGain=c.createGain(),rightGain=c.createGain();leftGain.gain.value=.16;rightGain.gain.value=.16;
  const merger=c.createChannelMerger(2);left.connect(leftGain).connect(merger,0,0);right.connect(rightGain).connect(merger,0,1);
  this.binauralGain=c.createGain();this.binauralGain.gain.value=0;merger.connect(this.binauralGain).connect(this.master);
  left.start();right.start();this.noiseSource.start();this.setMode(this.mode);
  if(c.state==='suspended')await c.resume();
 }
 setMode(mode){this.mode=mode;if(!this.ctx)return;const t=this.ctx.currentTime;
  this.noiseGain.gain.setTargetAtTime(mode==='alpha'?.16:.38,t,.28);
  this.binauralGain.gain.setTargetAtTime(mode==='alpha'?.48:0,t,.22);
  this.filter.frequency.setTargetAtTime(mode==='alpha'?1150:850,t,.3);
 }
 setVolume(v){this.volume=Math.max(0,Math.min(1,v));this.refresh();}
 async setEnabled(value){if(value)await this.init();this.enabled=Boolean(value);this.refresh();}
 refresh(){if(!this.ctx)return;const t=this.ctx.currentTime;this.master.gain.setTargetAtTime(this.enabled?this.volume:0,t,.09);}
 setPhase(name,progress){if(!this.ctx||!this.enabled||!this.filter)return;const now=this.ctx.currentTime;
  const p=Math.max(0,Math.min(1,progress));const target=name==='Inhale'?740+360*p:name==='Exhale'?1100-370*p:900;
  this.filter.frequency.setTargetAtTime(target,now,.15);
 }
}
window.BreathAudio=BreathAudio;
})();
