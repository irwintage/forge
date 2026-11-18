// Same DSP graph for live playback and offline export. Symmetric wet stereo paths.
function buildEffect(ctx, p){
 const input=ctx.createGain(), output=ctx.createGain();
 const dry=ctx.createGain(),wet=ctx.createGain(),wetSum=ctx.createGain();
 const L=ctx.createDelay(.1),R=ctx.createDelay(.1);
 const fbL=ctx.createGain(),fbR=ctx.createGain();
 const filterL=ctx.createBiquadFilter(),filterR=ctx.createBiquadFilter();
 const mono=ctx.createGain(),split=ctx.createChannelSplitter(2);
 const monoL=ctx.createGain(),monoR=ctx.createGain();monoL.gain.value=.5;monoR.gain.value=.5;
 input.connect(split);split.connect(monoL,0);split.connect(monoR,1);monoL.connect(mono);monoR.connect(mono);
 // For mono sources a splitter's second channel is silent. Correct with channelCountMode: explicit upmix.
 // A 2-channel splitter fed by mono uses WebAudio upmix (mono duplicated to two channels).
 mono.connect(L);mono.connect(R);
 const mainL=ctx.createGain(),crossL=ctx.createGain(),mainR=ctx.createGain(),crossR=ctx.createGain();
 const merge=ctx.createChannelMerger(2);
 L.connect(mainL);L.connect(crossR);R.connect(mainR);R.connect(crossL);
 mainL.connect(merge,0,0);crossL.connect(merge,0,0);mainR.connect(merge,0,1);crossR.connect(merge,0,1);
 merge.connect(wet);wet.connect(wetSum);input.connect(dry);dry.connect(wetSum);wetSum.connect(output);
 for(const [d,f,fb] of [[L,filterL,fbL],[R,filterR,fbR]]){
   f.type='lowpass';d.connect(f);f.connect(fb);fb.connect(d);
 }
 const osc=ctx.createOscillator();osc.type='sine';const depthL=ctx.createGain(),depthR=ctx.createGain();
 osc.connect(depthL);osc.connect(depthR);depthL.connect(L.delayTime);depthR.connect(R.delayTime);
 const sm=(param,value,time=.04)=>param.setTargetAtTime(value,ctx.currentTime,Math.max(.005,time));
 function update(next){p={...p,...next};
  sm(osc.frequency,p.rate,.07);sm(L.delayTime,p.base,.035);sm(R.delayTime,p.base*1.015,.035);
  sm(depthL.gain,p.sweep,.035);sm(depthR.gain,-p.sweep,.035);
  sm(fbL.gain,p.feedback,.04);sm(fbR.gain,p.kind==='flanger'?-p.feedback:p.feedback,.04);
  sm(filterL.frequency,p.tone,.06);sm(filterR.frequency,p.tone,.06);
  const width=p.width;const own=.5+.5*width,cross=.5-.5*width;
  sm(mainL.gain,own);sm(mainR.gain,own);sm(crossL.gain,cross);sm(crossR.gain,cross);
  // equal power at intermediate settings; wet level trimmed for feedback safety.
  sm(dry.gain,Math.cos(p.mix*Math.PI/2));sm(wet.gain,Math.sin(p.mix*Math.PI/2)*.72);
 }
 update(p);osc.start();
 return {input,output,update,stop(){try{osc.stop()}catch{}},disconnect(){[input,output,dry,wet,wetSum,L,R,fbL,fbR,filterL,filterR,mono,split,monoL,monoR,mainL,mainR,crossL,crossR,merge,osc,depthL,depthR].forEach(n=>{try{n.disconnect()}catch{}})}};
}
function generateDemo(ctx){
 const sr=ctx.sampleRate,dur=12;const b=ctx.createBuffer(2,Math.floor(sr*dur),sr);
 const frequencies=[110,164.81,220,329.63];
 for(let ch=0;ch<2;ch++){
  const o=b.getChannelData(ch);
  for(let i=0;i<o.length;i++){
   const t=i/sr;const fade=Math.min(1,t/.15,(dur-t)/.35);
   let s=0;
   for(let k=0;k<frequencies.length;k++){
     const f=frequencies[k];s+=Math.sin(2*Math.PI*f*t+(ch===0?0:.012*k))* (.10/(k+1));
     s+=Math.sin(2*Math.PI*(f*2.01)*t +.18*Math.sin(t*.13+k))*(.02/(k+1));
   }
   o[i]=s*Math.max(0,fade)*(.72+.12*Math.sin(2*Math.PI*.12*t));
  }
 }
 return b;
}
function wavBlob(buffer){
 const ch=Math.min(2,buffer.numberOfChannels),length=buffer.length,sr=buffer.sampleRate;
 const ab=new ArrayBuffer(44+length*ch*2),d=new DataView(ab);
 const str=(i,s)=>{for(let k=0;k<s.length;k++)d.setUint8(i+k,s.charCodeAt(k))};
 str(0,'RIFF');d.setUint32(4,36+length*ch*2,true);str(8,'WAVE');str(12,'fmt ');
 d.setUint32(16,16,true);d.setUint16(20,1,true);d.setUint16(22,ch,true);
 d.setUint32(24,sr,true);d.setUint32(28,sr*ch*2,true);d.setUint16(32,ch*2,true);d.setUint16(34,16,true);
 str(36,'data');d.setUint32(40,length*ch*2,true);
 let ptr=44;const data=Array.from({length:ch},(_,i)=>buffer.getChannelData(i));
 for(let i=0;i<length;i++)for(let c=0;c<ch;c++){const x=Math.max(-1,Math.min(1,data[c][i]));d.setInt16(ptr,x<0?Math.round(x*32768):Math.round(x*32767),true);ptr+=2}
 return new Blob([ab],{type:'audio/wav'});
}

window.ModLabAudio={buildEffect,generateDemo,wavBlob};
