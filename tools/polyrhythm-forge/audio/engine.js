// Native Web Audio. One AudioContext, look-ahead scheduling, independently gated lanes.
(function(){
  'use strict';
  class PolyAudio {
    constructor(){this.ctx=null;this.master=null;this.pre=null;this.dry=null;this.wet=null;this.conv=null;this.compressor=null;this.running=false;this.muted=[];this.timer=null;this.startTime=0;this.next=[];this.divisors=[3,4];this.bpm=96;this.volume=.22;this.wetLevel=.18;this.tone=.38;this.onImpact=null;}
    init(){
      if(this.ctx)return;
      const C=window.AudioContext||window.webkitAudioContext;
      if(!C)throw new Error('Web Audio is unavailable');
      this.ctx=new C();const c=this.ctx;
      this.pre=c.createGain();this.pre.gain.value=.65;
      this.dry=c.createGain();this.wet=c.createGain();
      this.compressor=c.createDynamicsCompressor();this.compressor.threshold.value=-18;this.compressor.knee.value=12;this.compressor.ratio.value=3;
      this.master=c.createGain();this.master.gain.value=0;
      this.conv=c.createConvolver();const len=Math.ceil(c.sampleRate*1.7);const buffer=c.createBuffer(2,len,c.sampleRate);
      for(let ch=0;ch<2;ch++){const d=buffer.getChannelData(ch);for(let i=0;i<len;i++){const e=Math.pow(1-i/len,2.8);d[i]=(Math.random()*2-1)*e*.35;}}
      this.conv.buffer=buffer;
      this.pre.connect(this.dry);this.pre.connect(this.conv);this.conv.connect(this.wet);
      this.dry.connect(this.compressor);this.wet.connect(this.compressor);this.compressor.connect(this.master);this.master.connect(c.destination);
      this.setReverb(this.wetLevel);
    }
    setVolume(v){this.volume=Math.max(0,Math.min(1,v));if(this.master){this.master.gain.setTargetAtTime(this.volume,this.ctx.currentTime,.025);}}
    setReverb(v){this.wetLevel=Math.max(0,Math.min(1,v));if(this.wet){const now=this.ctx.currentTime;this.wet.gain.setTargetAtTime(this.wetLevel*.8,now,.03);this.dry.gain.setTargetAtTime(1-this.wetLevel*.2,now,.03);}}
    setTone(v){this.tone=Math.max(0,Math.min(1,v));}
    setMuted(i,value){this.muted[i]=!!value;}
    cycleDuration(){return 4*60/this.bpm;}
    async start(){this.init();await this.ctx.resume();this.running=true;this.next=this.divisors.map(()=>0);this.startTime=this.ctx.currentTime+.12;this.master.gain.cancelScheduledValues(this.ctx.currentTime);this.master.gain.setTargetAtTime(this.volume,this.ctx.currentTime,.04);this.schedule();}
    stop(){this.running=false;if(this.timer){clearTimeout(this.timer);this.timer=null;}if(this.master){this.master.gain.cancelScheduledValues(this.ctx.currentTime);this.master.gain.setTargetAtTime(0,this.ctx.currentTime,.02);}}
    setPattern(divisors,bpm){const wasRunning=this.running;this.divisors=divisors.slice();this.bpm=bpm;if(wasRunning){this.next=divisors.map(()=>0);this.startTime=this.ctx.currentTime+.12;}}
    schedule(){if(!this.running||!this.ctx)return;const c=this.ctx,lookAhead=c.currentTime+.16,cycle=this.cycleDuration();for(let i=0;i<this.divisors.length;i++){const interval=cycle/this.divisors[i];let n=this.next[i];while(this.startTime+n*interval<lookAhead){const at=this.startTime+n*interval;if(at>=c.currentTime-.015&&!this.muted[i])this.note(i,at);n++;}this.next[i]=n;}
      this.timer=setTimeout(()=>this.schedule(),35);
    }
    note(i,at){const c=this.ctx;const base=[130.8128,155.5635,196,233.0819,261.6256,311.127];const freq=base[i%base.length]*Math.pow(2,Math.floor(i/base.length));
      const carrier=c.createOscillator(),mod=c.createOscillator(),mg=c.createGain(),gain=c.createGain(),filter=c.createBiquadFilter();
      carrier.type='sine';mod.type='sine';carrier.frequency.setValueAtTime(freq,at);mod.frequency.setValueAtTime(freq*1.6,at);mg.gain.value=freq*(.3+this.tone*1.65);mod.connect(mg);mg.connect(carrier.frequency);
      filter.type='lowpass';filter.frequency.value=1150+this.tone*5600;filter.Q.value=.3;
      gain.gain.setValueAtTime(.00001,at);gain.gain.exponentialRampToValueAtTime(.14,at+.007);gain.gain.exponentialRampToValueAtTime(.00001,at+.27);
      carrier.connect(filter);filter.connect(gain);gain.connect(this.pre);carrier.start(at);mod.start(at);carrier.stop(at+.3);mod.stop(at+.3);
      carrier.onended=()=>{for(const node of [carrier,mod,mg,filter,gain]){try{node.disconnect();}catch{}}};
    }
    getAudioTime(){return this.ctx?this.ctx.currentTime:null;}
    async destroy(){this.stop();if(this.ctx){await this.ctx.close();this.ctx=null;}}
  }
  window.PolyAudio=PolyAudio;
})();
