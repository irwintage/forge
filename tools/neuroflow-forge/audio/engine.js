/* NeuroFlow isolated Web Audio engine. True discrete left/right channels. */
(function(){
  'use strict';
  class NeuroFlowAudio {
    constructor(){
      this.context=null;this.left=null;this.right=null;this.master=null;
      this.leftAnalyser=null;this.rightAnalyser=null;this.playing=false;
      this.carrier=200;this.beat=10;this.volume=.18;
    }
    async init(){
      if(this.context){if(this.context.state==='suspended')await this.context.resume();return;}
      const AC=window.AudioContext||window.webkitAudioContext;
      if(!AC)throw new Error('Web Audio is not supported');
      const ctx=new AC();this.context=ctx;
      const L=ctx.createOscillator(),R=ctx.createOscillator();
      const lGain=ctx.createGain(),rGain=ctx.createGain();
      const lMeter=ctx.createAnalyser(),rMeter=ctx.createAnalyser();
      const merger=ctx.createChannelMerger(2),master=ctx.createGain();
      L.type=R.type='sine';L.frequency.value=this.carrier;R.frequency.value=this.carrier+this.beat;
      lGain.gain.value=rGain.gain.value=.5;
      lMeter.fftSize=rMeter.fftSize=2048;
      lMeter.smoothingTimeConstant=rMeter.smoothingTimeConstant=.25;
      L.connect(lGain);R.connect(rGain);
      lGain.connect(lMeter);rGain.connect(rMeter);
      lMeter.connect(merger,0,0);rMeter.connect(merger,0,1);
      master.gain.value=0;merger.connect(master);master.connect(ctx.destination);
      this.left=L;this.right=R;this.master=master;
      this.leftAnalyser=lMeter;this.rightAnalyser=rMeter;
      L.start();R.start();
      await ctx.resume();
    }
    setFrequencies(carrier,beat){
      this.carrier=carrier;this.beat=beat;
      if(!this.context)return;
      const now=this.context.currentTime;
      this.left.frequency.setTargetAtTime(carrier,now,.025);
      this.right.frequency.setTargetAtTime(carrier+beat,now,.025);
    }
    setVolume(volume){
      this.volume=Math.max(0,Math.min(1,volume));
      if(this.playing)this.rampTo(this.volume,.075);
    }
    rampTo(v,duration){
      if(!this.context||!this.master)return;
      const t=this.context.currentTime,p=this.master.gain;
      p.cancelScheduledValues(t);p.setValueAtTime(p.value,t);p.linearRampToValueAtTime(v,t+duration);
    }
    async play(){
      await this.init();this.playing=true;this.rampTo(this.volume,.14);
    }
    stop(){this.playing=false;this.rampTo(0,.12);}
    readWave(left,right){
      if(!this.context||!this.leftAnalyser||!this.rightAnalyser)return false;
      this.leftAnalyser.getFloatTimeDomainData(left);this.rightAnalyser.getFloatTimeDomainData(right);return true;
    }
    async destroy(){
      this.stop();
      if(!this.context)return;
      const ctx=this.context;this.context=null;
      try{this.left.stop();this.right.stop();}catch(_){}
      try{await ctx.close();}catch(_){}
      this.left=this.right=this.master=this.leftAnalyser=this.rightAnalyser=null;
    }
  }
  window.NeuroFlowAudio=NeuroFlowAudio;
})();
