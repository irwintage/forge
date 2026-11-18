/* CLIMAX audio core: offline Web Audio rendering, no external dependencies. */
window.ClimaxEngine = (() => {
  const AC = window.AudioContext || window.webkitAudioContext;
  function curveValue(t,shape){return shape==='exponential'?t*t*(3-2*t)*t:t;}
  function makeCurve(count,fn){const c=new Float32Array(count);for(let i=0;i<count;i++)c[i]=fn(i/(count-1));return c;}
  function impulse(ctx,seconds=2.8){const length=Math.ceil(seconds*ctx.sampleRate),buf=ctx.createBuffer(2,length,ctx.sampleRate);for(let ch=0;ch<2;ch++){let d=buf.getChannelData(ch);for(let i=0;i<length;i++){const t=i/length;d[i]=(Math.random()*2-1)*Math.pow(1-t,2.3);}}return buf;}
  async function render(sourceBuffer,settings){
    if(!sourceBuffer)throw Error('Load a WAV first');
    const duration=sourceBuffer.duration, sr=sourceBuffer.sampleRate;
    const ctx=new OfflineAudioContext(2,Math.ceil(duration*sr),sr);
    const source=ctx.createBufferSource();source.buffer=sourceBuffer;
    // Pitch/speed rises can consume more samples than their timeline; looping preserves the requested output duration.
    source.loop=settings.effect==='pitch'||settings.effect==='speed';
    const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=20000;
    const dry=ctx.createGain(),wet=ctx.createGain(),convolver=ctx.createConvolver(),sum=ctx.createGain(),limiter=ctx.createDynamicsCompressor();
    convolver.buffer=impulse(ctx);wet.gain.value=0;dry.gain.value=1;
    source.connect(filter);filter.connect(dry);filter.connect(convolver);convolver.connect(wet);dry.connect(sum);wet.connect(sum);
    limiter.threshold.value=-2;limiter.knee.value=4;limiter.ratio.value=12;limiter.attack.value=.003;limiter.release.value=.16;
    sum.connect(limiter);limiter.connect(ctx.destination);
    const intensity=settings.intensity, start=duration*settings.start, span=Math.max(.005,duration-start),count=Math.min(2048,Math.max(32,Math.ceil(span*50)));
    const c=fn=>makeCurve(count,t=>fn(curveValue(t,settings.shape)));
    switch(settings.effect){
      case 'volume':{
        const min=Math.max(.012,(1-intensity)**2*.95);
        dry.gain.setValueAtTime(min,0);dry.gain.setValueAtTime(min,start);
        dry.gain.setValueCurveAtTime(c(t=>min+(1-min)*t),start,span);break;
      }
      case 'filter':{
        const low=85+(1-intensity)*3600,high=5200+intensity*12500;
        filter.frequency.setValueAtTime(low,0);
        filter.frequency.setValueCurveAtTime(c(t=>low*Math.pow(high/low,t)),start,span);break;
      }
      case 'pitch':{
        const semitones=2+intensity*10,top=Math.pow(2,semitones/12);
        source.playbackRate.setValueCurveAtTime(c(t=>1+(top-1)*t),start,span);
        dry.gain.setValueCurveAtTime(c(t=>1/(1+(top-1)*t*.6)),start,span);break;
      }
      case 'reverb':{
        const max=.18+intensity*.82;
        wet.gain.setValueCurveAtTime(c(t=>max*t),start,span);
        dry.gain.setValueCurveAtTime(c(t=>1-.25*intensity*t),start,span);break;
      }
      case 'speed':{
        const max=1+intensity*.55;
        source.playbackRate.setValueCurveAtTime(c(t=>1+(max-1)*t),start,span);
        dry.gain.setValueCurveAtTime(c(t=>1/(1+(max-1)*t*.4)),start,span);break;
      }
    }
    source.start(0);source.stop(duration);
    return ctx.startRendering();
  }
  function toWav(buffer){const n=buffer.length,ch=2,sr=buffer.sampleRate;const dataSize=n*ch*2,arr=new ArrayBuffer(44+dataSize),view=new DataView(arr);const str=(at,s)=>{for(let i=0;i<s.length;i++)view.setUint8(at+i,s.charCodeAt(i));};str(0,'RIFF');view.setUint32(4,36+dataSize,true);str(8,'WAVE');str(12,'fmt ');view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,ch,true);view.setUint32(24,sr,true);view.setUint32(28,sr*ch*2,true);view.setUint16(32,ch*2,true);view.setUint16(34,16,true);str(36,'data');view.setUint32(40,dataSize,true);let k=44;const a=buffer.getChannelData(0),b=buffer.getChannelData(Math.min(1,buffer.numberOfChannels-1));for(let i=0;i<n;i++){for(const s of [a[i],b[i]]){const v=Math.max(-1,Math.min(1,s));view.setInt16(k,v<0?v*32768:v*32767,true);k+=2;}}return new Blob([arr],{type:'audio/wav'});}
  return {AC,render,toWav};
})();
