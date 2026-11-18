(function(global){'use strict';
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
function rand(seed){let x=seed|0;return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};}
function createEngine(ctx,buffer,params,opts={}){
 const input=ctx.createGain(), output=ctx.createGain(), dryGain=ctx.createGain(), wetGain=ctx.createGain(), wetBus=ctx.createGain();
 input.connect(dryGain);dryGain.connect(output);wetBus.connect(wetGain);wetGain.connect(output);
 const rng=rand(opts.seed??19421);const isOffline=!!opts.offline;
 let running=false,timer=null,nextTime=0,startedAt=0,pausedScan=0,liveSources=new Set(),lastCount=0;
 const p={...params};
 function apply(q={}){Object.assign(p,q);const wet=clamp(p.mix,0,1); const t=ctx.currentTime;dryGain.gain.setTargetAtTime(opts.bypass?1:1-wet,t,.012);wetGain.gain.setTargetAtTime(opts.bypass?0:wet*.78,t,.012);}
 apply();
 // Equal-power pan; Hann envelope always placed BEFORE panning, never duplicated.
 function grain(time, elapsed){
  const dur=clamp(p.size,35,500)/1000;const scan=clamp(p.position,0,1)*buffer.duration+elapsed*clamp(p.speed,0,1.5);
  const jitter=(rng()-.5)*dur*.8;const sourceDur=buffer.duration;
  const start=((scan+jitter)%sourceDur+sourceDur)%sourceDur;
  const pitch=(rng()*2-1)*clamp(p.scatter,0,12); const rate=Math.pow(2,pitch/12);
  const pan=(rng()*2-1)*clamp(p.spread,0,1);
  const source=ctx.createBufferSource();source.buffer=buffer;source.loop=true;source.playbackRate.value=rate;
  const envelope=ctx.createGain(),panNode=ctx.createStereoPanner();panNode.pan.value=pan;
  source.connect(envelope);envelope.connect(panNode);panNode.connect(wetBus);
  const begin=Math.max(time,ctx.currentTime);const attack=Math.max(.005,dur*.23),release=Math.max(.005,dur*.23);
  envelope.gain.setValueAtTime(0,begin);envelope.gain.linearRampToValueAtTime(1,begin+attack);envelope.gain.setValueAtTime(1,begin+dur-release);envelope.gain.linearRampToValueAtTime(0,begin+dur);
  source.start(begin,start);source.stop(begin+dur+.003);
  if(!isOffline){liveSources.add(source);source.onended=()=>{liveSources.delete(source);try{source.disconnect();envelope.disconnect();panNode.disconnect();}catch{}};}
 }
 function scheduleUntil(until){const end=isOffline?opts.duration??buffer.duration:Infinity;let n=0;while(nextTime<until&&nextTime<end&&n<1200){const elapsed=Math.max(0,nextTime-startedAt);grain(nextTime,elapsed);nextTime+=1/clamp(p.density,2,55);n++;}lastCount=liveSources.size;}
 function tick(){if(!running)return;scheduleUntil(ctx.currentTime+.14);timer=setTimeout(tick,35);}
 function start(){if(running)return;running=true;startedAt=ctx.currentTime;nextTime=startedAt;tick();}
 function scheduleOffline(duration){startedAt=0;nextTime=0;Object.assign(opts,{duration});scheduleUntil(duration);}
 function stop(){running=false;if(timer!==null){clearTimeout(timer);timer=null;}const now=ctx.currentTime;output.gain.cancelScheduledValues(now);output.gain.setTargetAtTime(0,now,.008); // stop scheduled sources after fade; disconnect whole graph after the release
 if(!isOffline){for(const s of liveSources){try{s.stop(now+.065)}catch{}}setTimeout(()=>{try{input.disconnect();wetBus.disconnect();dryGain.disconnect();wetGain.disconnect();output.disconnect();}catch{}},110);}}
 function setBypass(v){opts.bypass=!!v;apply();}
 return {input,output,start,stop,apply,setBypass,scheduleOffline,get activeGrains(){return lastCount;}};
}
function encodeWav(channels,sr){const frames=channels[0].length,n=channels.length;const bytes=44+frames*n*2;const ab=new ArrayBuffer(bytes),d=new DataView(ab);const str=(o,s)=>{for(let i=0;i<s.length;i++)d.setUint8(o+i,s.charCodeAt(i));};str(0,'RIFF');d.setUint32(4,bytes-8,true);str(8,'WAVE');str(12,'fmt ');d.setUint32(16,16,true);d.setUint16(20,1,true);d.setUint16(22,n,true);d.setUint32(24,sr,true);d.setUint32(28,sr*n*2,true);d.setUint16(32,n*2,true);d.setUint16(34,16,true);str(36,'data');d.setUint32(40,frames*n*2,true);let k=44;for(let i=0;i<frames;i++)for(let c=0;c<n;c++){const v=clamp(channels[c][i],-1,1);d.setInt16(k,v<0?Math.round(v*32768):Math.round(v*32767),true);k+=2;}return new Blob([ab],{type:'audio/wav'});}
async function render(buffer,p,progress){const sr=buffer.sampleRate;const duration=Math.min(buffer.duration,600),tail=clamp(p.size/1000+.2,.3,1);const ctx=new OfflineAudioContext(2,Math.ceil((duration+tail)*sr),sr);const source=ctx.createBufferSource();source.buffer=buffer;
 const engine=createEngine(ctx,buffer,p,{offline:true,seed:19421});source.connect(engine.input);engine.output.connect(ctx.destination);source.start(0);engine.scheduleOffline(duration);if(progress)progress('Rendering audio…');const result=await ctx.startRendering();return encodeWav([result.getChannelData(0),result.getChannelData(1)],result.sampleRate);}
function makeDemo(ctx){const sr=ctx.sampleRate,dur=6,buffer=ctx.createBuffer(2,sr*dur,sr);const rnd=rand(1177);for(let ch=0;ch<2;ch++){const d=buffer.getChannelData(ch);for(let i=0;i<d.length;i++){let v=0;const t=i/sr;for(const [at,hz,length] of [[0,220,1.7],[1.35,329.63,1.8],[2.75,246.94,1.6],[4.05,392,1.8]]){const u=t-at;if(u>=0&&u<length){const attack=Math.min(1,u/.055),release=Math.min(1,(length-u)/.28),env=attack*release*Math.exp(-u*.8);v+=env*(.23*Math.sin(2*Math.PI*hz*u)+.09*Math.sin(2*Math.PI*hz*2*u)+.028*Math.sin(2*Math.PI*hz*3*u));}}v+=(rnd()-.5)*.0007;d[i]=v;}}return buffer;}
global.ChrysasynthGranular={createEngine,render,makeDemo};
})(window);
