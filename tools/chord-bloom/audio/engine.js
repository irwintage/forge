/* Chord Bloom V4 · dedicated sound engine (Tone.js 14.8.49)
   Safe gain staging; independent dry / chorus / convolution reverb sends;
   compressor + true-peak-style sample limiter, one post-master output/recorder.
   All sound nodes created only after a user gesture unlocks AudioContext. */
(() => {
  'use strict';
  class ChordBloomAudioEngine {
    constructor() {
      const T=window.Tone;
      if(!T) throw new Error('Tone.js is missing');
      this.synth=new T.PolySynth(T.Synth,{maxPolyphony:16});
      // Each note is trimmed before four-note chords are summed.
      this.voiceTrim=new T.Gain(0.30);
      this.filter=new T.Filter({frequency:6200,type:'lowpass',rolloff:-12});
      this.dry=new T.Gain(0.77);
      this.chorusSend=new T.Gain(0);
      this.reverbSend=new T.Gain(0);
      this.chorus=new T.Chorus({frequency:0.62,delayTime:4.5,depth:0.65,spread:130,wet:1}).start();
      // Convolution reverb generates a real impulse response, unlike a quiet
      // algorithmic room filter; the send level is adjusted independently.
      this.reverb=new T.Reverb({decay:3.3,preDelay:0.034,wet:1});
      this.reverbHighPass=new T.Filter({frequency:170,type:'highpass',rolloff:-12});
      this.mix=new T.Gain(1);
      this.comp=new T.Compressor({threshold:-20,ratio:2.2,attack:0.015,release:0.24});
      this.limiter=new T.Limiter(-2);
      this.master=new T.Volume(-12);
      this.analyser=new T.Analyser('waveform',2048);
      this.recorder=new T.Recorder();
      this.lastToneSettings='';
      this.disposed=false;
      this.synth.connect(this.voiceTrim);
      this.voiceTrim.connect(this.filter);
      this.filter.connect(this.dry);
      this.dry.connect(this.mix);
      this.filter.connect(this.chorusSend);
      this.chorusSend.connect(this.chorus);
      this.chorus.connect(this.mix);
      this.filter.connect(this.reverbSend);
      this.reverbSend.connect(this.reverb);
      this.reverb.connect(this.reverbHighPass);
      this.reverbHighPass.connect(this.mix);
      this.mix.connect(this.comp);
      this.comp.connect(this.limiter);
      this.limiter.connect(this.master);
      this.master.connect(this.analyser);
      this.analyser.toDestination();
      this.analyser.connect(this.recorder);
      // In Tone 14, convolution generation is asynchronous. Wait for it before
      // starting the first chord so there is no silent wet bus on first playback.
      this.reverbReady=Promise.resolve(this.reverb.ready).catch(err=>{
        console.warn('Reverb impulse generation error:',err);
      });
    }
    async ready(){await this.reverbReady;}
    configure(opts){
      if(this.disposed) return;
      const p={osc:opts.osc,attack:opts.attack,release:opts.release};
      const toneSettings=JSON.stringify(p);
      if(toneSettings!==this.lastToneSettings){
        this.synth.set({
          oscillator:{type:opts.osc},
          envelope:{attack:opts.attack,decay:0.23,sustain:0.50,release:opts.release}
        });
        this.lastToneSettings=toneSettings;
      }
      this.filter.frequency.rampTo(opts.cut,0.06);
      const wet=opts.reverb/100;
      // Perceptually gentle near zero, clearly audible at medium/high settings.
      this.reverbSend.gain.rampTo(Math.pow(wet,1.1)*0.90,0.06);
      this.chorusSend.gain.rampTo((opts.chorus/100)*0.34,0.06);
      this.setMaster(opts.master);
    }
    setMaster(db){
      if(!this.disposed) this.master.volume.rampTo(Math.max(-36,Math.min(0,db)),0.05);
    }
    noteOn(note,duration,time){
      if(!this.disposed)this.synth.triggerAttackRelease(note,duration,time,0.62);
    }
    releaseAll(){if(!this.disposed)this.synth.releaseAll();}
    dispose(){
      if(this.disposed)return;
      this.releaseAll();this.disposed=true;
      [this.synth,this.voiceTrim,this.filter,this.dry,this.chorusSend,
       this.reverbSend,this.chorus,this.reverb,this.reverbHighPass,
       this.mix,this.comp,this.limiter,this.master,this.analyser,this.recorder]
       .forEach(node=>{try{node?.dispose?.();}catch(e){console.warn('Audio cleanup',e);}});
    }
  }
  window.ChordBloomAudioEngine=ChordBloomAudioEngine;
})();
