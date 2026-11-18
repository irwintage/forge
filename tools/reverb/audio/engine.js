(function(){
'use strict';
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const norm=v=>clamp(v/100,0,1);
// Deterministic impulse: live and offline rendering use identical noise and response.
function impulse(ctx,p){
  const sr=ctx.sampleRate, decay=clamp(p.decay,.45,8.5), length=Math.max(1,Math.floor(sr*Math.min(10,decay*1.28+.32)));
  const buffer=ctx.createBuffer(2,length,sr);
  const dim=norm(p.damping),diff=norm(p.diffusion);
  const lowpassCoeff=Math.exp(-2*Math.PI*(1500+12000*(1-dim)**2)/sr);
  const rate=sr;
  for(let ch=0;ch<2;ch++){
    const data=buffer.getChannelData(ch);let seed=(0x51A12+(ch+1)*98123)>>>0;let lp=0,energy=0;
    for(let i=0;i<length;i++){
      seed=(Math.imul(seed,1664525)+1013904223)>>>0;
      let random=(seed/4294967295)*2-1;
      lp=lp*lowpassCoeff+random*(1-lowpassCoeff);
      const t=i/rate;
      const late=Math.exp(-6.907755*t/decay);
      // Diffusion shapes onset; early reflections remain distinct at low settings.
      const onset=.15+.85*(1-Math.exp(-t/(.006+diff*.045)));
      const early=(i%Math.max(1,Math.round(rate*(.021+ch*.004)))===0&&t<.13)?0.12*Math.exp(-18*t):0;
      const v=((random*(.72-.3*dim)+lp*(.28+.3*dim))*late*onset + early)*.32;
      data[i]=v;
      energy+=v*v;
    }
    // Normalize each channel to similar integrated energy and safe peak levels.
    const rms=Math.sqrt(energy/length)||1;
    const gain=Math.min(1.8, .09/rms);
    for(let i=0;i<length;i++)data[i]*=gain;
  }
  return buffer;
}
function create(ctx,init){
  const input=ctx.createGain(),output=ctx.createGain();
  const dry=ctx.createGain(),wet=ctx.createGain(),pre=ctx.createDelay(.25),compressor=ctx.createDynamicsCompressor();
  compressor.threshold.value=-5;compressor.knee.value=6;compressor.ratio.value=3;compressor.attack.value=.004;compressor.release.value=.15;
  input.connect(dry);dry.connect(compressor);input.connect(pre);
  const convolver=[ctx.createConvolver(),ctx.createConvolver()],cvGain=[ctx.createGain(),ctx.createGain()];
  for(let i=0;i<2;i++){pre.connect(convolver[i]);convolver[i].connect(cvGain[i]);}
  const split=ctx.createChannelSplitter(2),merge=ctx.createChannelMerger(2);
  cvGain[0].connect(split);cvGain[1].connect(split);
  const matrix=[];
  for(let src=0;src<2;src++)for(let dest=0;dest<2;dest++){
    const g=ctx.createGain();split.connect(g,src);g.connect(merge,0,dest);matrix.push(g);
  }
  merge.connect(wet);wet.connect(compressor);compressor.connect(output);
  let values={},which=0,serial=0,regenTimer=null,disposed=false;
  const smooth=(a,value,secs=.045)=>{const now=ctx.currentTime;a.cancelScheduledValues(now);a.setTargetAtTime(value,now,secs)};
  function apply(next,options={}){
    if(disposed)return;
    const previous=values;values={...values,...next};const p=values;
    const mix=norm(p.mix),w=norm(p.width)*1.5;
    const a=(1+w)/2,b=(1-w)/2;
    smooth(dry.gain,Math.cos(mix*Math.PI*.5));smooth(wet.gain,Math.sin(mix*Math.PI*.5)*.55);
    smooth(pre.delayTime,clamp(p.predelay,0,120)/1000);
    smooth(matrix[0].gain,a);smooth(matrix[1].gain,b);smooth(matrix[2].gain,b);smooth(matrix[3].gain,a);
    const mustRegen=options.immediate||!convolver[which].buffer||['decay','damping','diffusion'].some(k=>p[k]!==previous[k]);
    if(mustRegen){
      clearTimeout(regenTimer);const id=++serial;
      const generate=()=>{
        if(disposed||id!==serial)return;
        const target=(convolver[which].buffer&&!options.immediate)?1-which:which;
        convolver[target].buffer=impulse(ctx,p);
        const now=ctx.currentTime;
        cvGain[target].gain.cancelScheduledValues(now);
        if(options.immediate){cvGain[target].gain.setValueAtTime(1,now);cvGain[1-target].gain.setValueAtTime(0,now)}
        else{cvGain[target].gain.setValueAtTime(0,now);cvGain[target].gain.linearRampToValueAtTime(1,now+.13);cvGain[which].gain.cancelScheduledValues(now);cvGain[which].gain.setValueAtTime(1,now);cvGain[which].gain.linearRampToValueAtTime(0,now+.13)}
        which=target;
      };
      if(options.immediate)generate();else regenTimer=setTimeout(generate,150);
    }
  }
  apply(init,{immediate:true});
  return{input,output,apply,dispose(){disposed=true;clearTimeout(regenTimer);input.disconnect();output.disconnect();try{pre.disconnect()}catch{}}};
}
function encodeWAV(buffer){
  const count=buffer.length,sr=buffer.sampleRate,ch=2,bytes=44+count*ch*2;
  const data=new ArrayBuffer(bytes),v=new DataView(data);
  const write=(at,s)=>{for(let i=0;i<s.length;i++)v.setUint8(at+i,s.charCodeAt(i))};
  write(0,'RIFF');v.setUint32(4,bytes-8,true);write(8,'WAVE');write(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,ch,true);v.setUint32(24,sr,true);v.setUint32(28,sr*ch*2,true);v.setUint16(32,ch*2,true);v.setUint16(34,16,true);write(36,'data');v.setUint32(40,count*ch*2,true);
  const L=buffer.getChannelData(0),R=buffer.getChannelData(1);let offset=44;
  for(let i=0;i<count;i++){for(let k=0;k<2;k++){let x=clamp((k?R:L)[i],-1,1);v.setInt16(offset,x<0?Math.round(x*32768):Math.round(x*32767),true);offset+=2}}
  return new Blob([data],{type:'audio/wav'});
}
function demo(ctx){
  const sr=ctx.sampleRate,dur=7.2,buf=ctx.createBuffer(2,Math.ceil(sr*dur),sr);
  const notes=[220,329.63,440,261.63,329.63,392,293.66,440];
  for(let ch=0;ch<2;ch++){const d=buf.getChannelData(ch);for(let i=0;i<d.length;i++){
    const t=i/sr;let val=0;
    for(let n=0;n<notes.length;n++){
      const start=n*.78,age=t-start;if(age<0||age>1.65)continue;
      const env=(1-Math.exp(-age*90))*Math.exp(-age*(2.7+0.12*n));
      const f=notes[n],phase=2*Math.PI*f*age;
      val+=env*(Math.sin(phase)*.27+Math.sin(phase*2.001)*.06+Math.sin(phase*3.002)*.025);
    }d[i]=val;
  }}return buf;
}
window.ReverbDSP={create,encodeWAV,demo};
})();
