'use strict';
class DualityAudioEngine {
  constructor(onStep) {this.ready=false;this.running=false;this.onStep=onStep;this.tick=0;this.eventId=null;this.fadeValue=.5;this.tempo=96;this.volume=.66;this.seed=null;this.getPattern=()=>[];this.getNotes=()=>[];this.nodes=[];this.voices=[];this.capture=null;this.recording=false;this.recorded=[];this.recordSamples=0;}
  async init() {
    if(this.ready){await Tone.start();return;}
    if(typeof Tone==='undefined')throw new Error('Tone.js could not load. An Internet connection is required.');
    await Tone.start();
    const out=new Tone.Gain(this.volume);
    const limiter=new Tone.Limiter(-3).toDestination();
    out.connect(limiter);
    const xf=new Tone.CrossFade(this.fadeValue).connect(out);
    this.output=out;this.limiter=limiter;this.crossfade=xf;
    this.nodes.push(out,limiter,xf);
    this.voices=[this.makeVoice(xf.a),this.makeVoice(xf.b)];
    Tone.Transport.bpm.value=this.tempo;
    this.eventId=Tone.Transport.scheduleRepeat((time)=>this.step(time),'16n');
    this.ready=true;
    if(this.seed)this.applySeed(this.seed);
  }
  makeVoice(destination) {
    const gain=new Tone.Gain(.57).connect(destination);
    const room=new Tone.Freeverb({roomSize:.5,dampening:3400,wet:.22}).connect(gain);
    const dist=new Tone.Distortion({distortion:.05,wet:0}).connect(room);
    const chorus=new Tone.Chorus({frequency:.55,delayTime:3.1,depth:.27,wet:.1}).start(); chorus.connect(dist);
    const filter=new Tone.Filter({frequency:2200,type:'lowpass',rolloff:-12,Q:.55}).connect(chorus);
    const synth=new Tone.PolySynth(Tone.Synth,{maxPolyphony:6,oscillator:{type:'triangle'},envelope:{attack:.04,decay:.20,sustain:.64,release:.75}}).connect(filter);
    this.nodes.push(gain,room,dist,chorus,filter,synth);
    return {gain,room,dist,chorus,filter,synth};
  }
  setVolume(v) {this.volume=Math.max(0,Math.min(1,v));if(this.ready)this.output.gain.rampTo(this.volume,.07);}
  setTempo(v) {this.tempo=Math.max(50,Math.min(200,v));if(this.ready)Tone.Transport.bpm.rampTo(this.tempo,.06);}
  setMorph(v) {this.fadeValue=Math.max(0,Math.min(1,v));if(this.ready)this.crossfade.fade.rampTo(this.fadeValue,.055);}
  applySeed(seed) {
    this.seed=seed;
    if(!this.ready)return;
    for(let i=0;i<2;i++) {
      const p=i===0?seed.A:seed.B, v=this.voices[i];
      // Two actual synth voices and distinct DSP chains, continuously blended via CrossFade.
      v.synth.set({oscillator:{type:p.wave},envelope:{attack:p.attack,decay:p.decay,sustain:p.sustain,release:p.release}});
      v.filter.frequency.rampTo(p.cutoff,.08);
      v.chorus.wet.rampTo(p.chorus,.08);
      v.dist.distortion=p.distortion;
      v.dist.wet.rampTo(p.distWet,.08);
      v.room.roomSize.rampTo(p.room,.12);
      v.room.wet.rampTo(p.space,.12);
    }
  }
  async startRecording(){
    await this.init();
    if(this.recording)return;
    if(typeof MediaRecorder==='undefined')throw new Error('MediaRecorder is unavailable in this browser');
    if(!this.capture){
      // Tone.Recorder uses the browser's MediaRecorder via a MediaStreamDestination.
      // Do not use deprecated ScriptProcessor (not exposed by all WebAudio wrappers).
      const recorder=new Tone.Recorder();
      this.limiter.connect(recorder);
      this.capture={recorder};
      this.nodes.push(recorder);
    }
    await this.capture.recorder.start();
    this.recording=true;
  }
  async stopRecording(){
    if(!this.recording)return null;
    this.recording=false;
    const captured=await this.capture.recorder.stop();
    if(!captured || !captured.size)return null;
    // Decode the captured browser audio, then encode an actual PCM WAV.
    // Recording is real-time, so ring morphing and effect tails are included.
    let decoded;
    try{
      const ctx=Tone.getContext?Tone.getContext():Tone.context;
      const raw=ctx.rawContext||ctx;
      decoded=await raw.decodeAudioData(await captured.arrayBuffer());
    }catch(err){
      throw new Error('Could not decode the recorded audio for WAV export: '+(err.message||err));
    }
    const rate=decoded.sampleRate,frames=decoded.length;
    const byteCount=44+frames*4;
    if(byteCount>0xffffffff)throw new Error('Recording too long to export as WAV');
    const ab=new ArrayBuffer(byteCount),view=new DataView(ab);
    const ascii=(off,str)=>{for(let i=0;i<str.length;i++)view.setUint8(off+i,str.charCodeAt(i))};
    ascii(0,'RIFF');view.setUint32(4,byteCount-8,true);ascii(8,'WAVE');ascii(12,'fmt ');
    view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,2,true);
    view.setUint32(24,rate,true);view.setUint32(28,rate*4,true);
    view.setUint16(32,4,true);view.setUint16(34,16,true);ascii(36,'data');view.setUint32(40,frames*4,true);
    const left=decoded.getChannelData(0),right=decoded.getChannelData(decoded.numberOfChannels>1?1:0);
    let offset=44;
    for(let i=0;i<frames;i++){
      const l=Math.max(-1,Math.min(1,Number.isFinite(left[i])?left[i]:0));
      const r=Math.max(-1,Math.min(1,Number.isFinite(right[i])?right[i]:0));
      view.setInt16(offset,l<0?Math.round(l*32768):Math.round(l*32767),true);offset+=2;
      view.setInt16(offset,r<0?Math.round(r*32768):Math.round(r*32767),true);offset+=2;
    }
    return new Blob([ab],{type:'audio/wav'});
  }
  step(time) {
    const i=this.tick%16;
    const pattern=this.getPattern();
    if(pattern[i]){
      const notes=this.getNotes(),base=notes[i%notes.length];
      if(base){const midi=Tone.Frequency(base).toMidi()+(i>=8?12:0);const note=Tone.Frequency(midi,'midi').toNote();for(const v of this.voices)v.synth.triggerAttackRelease(note,'16n',time,.64);}
    }
    Tone.Draw.schedule(()=>this.onStep(i),time);
    this.tick=(this.tick+1)%16;
  }
  async play(){await this.init();if(this.running)return;Tone.Transport.start();this.running=true;}
  pause(){if(!this.ready||!this.running)return;Tone.Transport.pause();this.running=false;this.releaseAll();}
  stop(){if(!this.ready)return;Tone.Transport.stop();Tone.Transport.position=0;this.tick=0;this.running=false;this.releaseAll();this.onStep(-1);}
  releaseAll(){for(const v of this.voices)v.synth.releaseAll();}
}
window.DualityAudioEngine=DualityAudioEngine;
