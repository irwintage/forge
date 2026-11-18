/* Tone Sculptor DSP. Pure Web Audio API, no external dependencies. */
window.ToneSculptorEngine = (() => {
  const BANDS = {low:{type:'lowshelf', frequency:120},mid:{type:'peaking', frequency:1400,Q:0.78},high:{type:'highshelf',frequency:6500}};
  const clamp = value => Math.max(-12,Math.min(12,Number(value)||0));
  function createFilters(ctx, gains){
    return Object.keys(BANDS).map(key=>{
      const spec=BANDS[key], f=ctx.createBiquadFilter();
      f.type=spec.type; f.frequency.value=spec.frequency;
      if(spec.Q)f.Q.value=spec.Q;
      f.gain.value=clamp(gains[key]);
      return {key,node:f};
    });
  }
  function connectFilters(source,filters,destination){let last=source;for(const {node} of filters){last.connect(node);last=node;}last.connect(destination);}
  function response(filters, frequencies){
    const f=new Float32Array(frequencies.map(x=>Math.min(x,filters[0].node.context.sampleRate*.5-1))), total=new Float32Array(f.length),mag=new Float32Array(f.length),phase=new Float32Array(f.length);
    filters.forEach(({node})=>{node.getFrequencyResponse(f,mag,phase);for(let i=0;i<f.length;i++)total[i]+=20*Math.log10(Math.max(mag[i],1e-7));});return total;
  }
  async function render(buffer,gains,bypass=false){
    const ctx=new OfflineAudioContext(Math.min(2,buffer.numberOfChannels),buffer.length,buffer.sampleRate);
    const src=ctx.createBufferSource();src.buffer=buffer;if(bypass){src.connect(ctx.destination);}else{connectFilters(src,createFilters(ctx,gains),ctx.destination);}src.start(0);return ctx.startRendering();
  }
  function encodeWav(buffer){
    const channels=buffer.numberOfChannels,frames=buffer.length,sr=buffer.sampleRate,bytes=frames*channels*2;
    const out=new ArrayBuffer(44+bytes),dv=new DataView(out);let pos=0;
    const str=s=>{for(const c of s)dv.setUint8(pos++,c.charCodeAt(0));};
    const u16=x=>{dv.setUint16(pos,x,true);pos+=2;},u32=x=>{dv.setUint32(pos,x,true);pos+=4;};
    str('RIFF');u32(36+bytes);str('WAVE');str('fmt ');u32(16);u16(1);u16(channels);u32(sr);u32(sr*channels*2);u16(channels*2);u16(16);str('data');u32(bytes);
    const data=Array.from({length:channels},(_,i)=>buffer.getChannelData(i));
    for(let i=0;i<frames;i++)for(let c=0;c<channels;c++){const v=Math.max(-1,Math.min(1,data[c][i]));dv.setInt16(pos,v<0?v*32768:v*32767,true);pos+=2;}
    return new Blob([out],{type:'audio/wav'});
  }
  return {BANDS,clamp,createFilters,connectFilters,response,render,encodeWav};
})();
