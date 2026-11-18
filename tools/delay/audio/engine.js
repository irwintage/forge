(function(){'use strict';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function targetTime(p){return p.sync?clamp(60000/clamp(+p.bpm||120,40,240)*4*(+p.division||.5),40,1800):clamp(+p.time||350,40,1800)}
function shaperCurve(drive){const n=2048, c=new Float32Array(n), norm=Math.tanh(drive);for(let i=0;i<n;i++){const x=2*i/(n-1)-1;c[i]=Math.tanh(x*drive)/norm;}return c}
function build(ctx,initial){
 const p={...initial}, input=ctx.createGain(), output=ctx.createGain(), dry=ctx.createGain(), wet=ctx.createGain(), bypass=ctx.createGain(), split=ctx.createChannelSplitter(2), merge=ctx.createChannelMerger(2);
 input.channelCount=2;input.channelCountMode='explicit';
 const dL=ctx.createDelay(2.2),dR=ctx.createDelay(2.2),lpL=ctx.createBiquadFilter(),lpR=ctx.createBiquadFilter(),shL=ctx.createWaveShaper(),shR=ctx.createWaveShaper();
 const taps=[ctx.createGain(),ctx.createGain(),ctx.createGain(),ctx.createGain()];
 // Feedback cells: L→L, L→R, R→R, R→L, at most 0.88 combined gain.
 input.connect(dry);dry.connect(output);input.connect(split);split.connect(dL,0);split.connect(dR,1);
 dL.connect(merge,0,0);dR.connect(merge,0,1);merge.connect(wet);wet.connect(output);
 dL.connect(lpL);dR.connect(lpR);lpL.connect(shL);lpR.connect(shR);
 shL.connect(taps[0]);shL.connect(taps[1]);shR.connect(taps[2]);shR.connect(taps[3]);
 taps[0].connect(dL);taps[1].connect(dR);taps[2].connect(dR);taps[3].connect(dL);
 const timeL=()=>ctx.currentTime;
 function smooth(param,val,ms=.035){param.setTargetAtTime(val,timeL(),ms)}
 function update(next={}){Object.assign(p,next);const time=targetTime(p)/1000;
 smooth(dL.delayTime,time,.035);smooth(dR.delayTime,time,.035);
 const damp=13500*Math.pow(0.16,clamp(p.damping/100,0,1));smooth(lpL.frequency,damp);smooth(lpR.frequency,damp);lpL.type=lpR.type='lowpass';
 const c=clamp(p.character/100,0,1),drive=1+2.7*c;const curve=shaperCurve(drive);shL.curve=curve;shR.curve=curve;
 const fb=clamp(p.feedback/100,0,.88),cross=(p.mode==='pingpong'?0.25+0.74*clamp(p.width/100,0,1):0.02+0.23*clamp(p.width/100,0,1));
 // Gentle feedback compensation for perceived saturation, without an extra parallel path.
 const total=fb*(1-.16*c);smooth(taps[0].gain,total*(1-cross));smooth(taps[1].gain,total*cross);smooth(taps[2].gain,total*(1-cross));smooth(taps[3].gain,total*cross);
 const mix=clamp(p.mix/100,0,1),active=p.bypass?0:1;smooth(dry.gain,1-active*mix,.025);smooth(wet.gain,active*mix*.86,.025);return targetTime(p)}
 update();
 return {input,output,update,time:()=>targetTime(p),release(){try{input.disconnect();output.disconnect();dry.disconnect();wet.disconnect();split.disconnect();merge.disconnect();dL.disconnect();dR.disconnect();lpL.disconnect();lpR.disconnect();shL.disconnect();shR.disconnect();taps.forEach(n=>n.disconnect())}catch(e){}}};
 }
function encodeWav(buffer){const nc=2,n=buffer.length,sr=buffer.sampleRate,array=new ArrayBuffer(44+n*nc*2),v=new DataView(array);function str(off,s){for(let i=0;i<s.length;i++)v.setUint8(off+i,s.charCodeAt(i))}str(0,'RIFF');v.setUint32(4,array.byteLength-8,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,nc,true);v.setUint32(24,sr,true);v.setUint32(28,sr*nc*2,true);v.setUint16(32,nc*2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,n*nc*2,true);const a=buffer.getChannelData(0),b=buffer.getChannelData(Math.min(1,buffer.numberOfChannels-1));let ptr=44;for(let i=0;i<n;i++){for(const s of [a[i],b[i]]){const z=Math.max(-1,Math.min(1,s));v.setInt16(ptr,z<0?z*32768:z*32767,true);ptr+=2}}return new Blob([array],{type:'audio/wav'})}
async function render(buffer,p){const sr=buffer.sampleRate,fb=clamp(p.feedback/100,0,.88),tail=Math.min(22,Math.max(2,targetTime(p)/1000*Math.log(.0008)/Math.log(Math.max(.02,fb))));const len=Math.ceil((buffer.duration+tail+.08)*sr);if(len>sr*60*20)throw Error('Audio too long for offline export');const offline=new OfflineAudioContext(2,len,sr);const engine=build(offline,p),source=offline.createBufferSource(),gain=offline.createGain();source.buffer=buffer;source.connect(engine.input);engine.output.connect(gain);gain.gain.value=clamp(p.master/100,0,1.5);gain.connect(offline.destination);source.start();const out=await offline.startRendering();return encodeWav(out)}
window.DelayDSP={build,render,targetTime,encodeWav};
})();
