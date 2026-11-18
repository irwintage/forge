/* Noise Generator: native Web Audio stereo engine, no network dependencies.
   Independent channels, gentle gain ramps, actual filter response. */
(function(){
  'use strict';
  class NoiseEngine {
    constructor(){this.ctx=null;this.chain=null;this.active=false;this.type='white';this.filterType='off';this.cutoff=2000;this.q=1;this.air=0;this.width=.5;this.db=-18;this.onState=()=>{};this.stopping=null;}
    async init(){if(!this.ctx){const A=window.AudioContext||window.webkitAudioContext;if(!A)throw new Error('Web Audio is unavailable');this.ctx=new A();}await this.ctx.resume();}
    static buffer(ctx,type){const length=ctx.sampleRate*4,b=ctx.createBuffer(1,length,ctx.sampleRate),data=b.getChannelData(0);let p0=0,p1=0,p2=0,p3=0,p4=0,p5=0,p6=0,brown=0;for(let i=0;i<length;i++){const v=Math.random()*2-1;if(type==='white')data[i]=v*.55;else if(type==='pink'){p0=.99886*p0+v*.0555179;p1=.99332*p1+v*.0750759;p2=.969*p2+v*.153852;p3=.8665*p3+v*.3104856;p4=.55*p4+v*.5329522;p5=-.7616*p5-v*.016898;data[i]=(p0+p1+p2+p3+p4+p5+p6+v*.5362)*.11;p6=v*.115926;}else{brown=(brown+.02*v)/1.02;data[i]=Math.max(-1,Math.min(1,brown*3.5));}}return b;}
    makeFilter(ctx){const filter=ctx.createBiquadFilter();filter.type=this.filterType==='off'?'lowpass':this.filterType;filter.frequency.value=this.cutoff;filter.Q.value=this.q;return filter;}
    build(){const ctx=this.ctx,now=ctx.currentTime,output=ctx.createGain(),master=ctx.createGain(),analyser=ctx.createAnalyser(),merger=ctx.createChannelMerger(2);master.gain.value=this.level();output.gain.setValueAtTime(0,now);output.gain.linearRampToValueAtTime(1,now+.11);analyser.fftSize=2048;analyser.smoothingTimeConstant=.45;merger.connect(master);master.connect(output);output.connect(analyser);analyser.connect(ctx.destination);
      const chains=[],sources=[];
      // At width=0 L and R share the same noise: mono. Width=1 has independent noise on each side.
      const a=ctx.createBufferSource(),b=ctx.createBufferSource(),c=ctx.createBufferSource();a.buffer=NoiseEngine.buffer(ctx,this.type);b.buffer=NoiseEngine.buffer(ctx,this.type);c.buffer=NoiseEngine.buffer(ctx,this.type);a.loop=true;b.loop=true;c.loop=true;
      for(let ch=0;ch<2;ch++){
        const shared=ctx.createGain(),independent=ctx.createGain(),direct=ctx.createGain(),filter=this.makeFilter(ctx),shelf=ctx.createBiquadFilter();shelf.type='highshelf';shelf.frequency.value=6500;shelf.gain.value=this.air;
        const blend=Math.max(0,Math.min(1,this.width));shared.gain.value=Math.sqrt(1-blend);independent.gain.value=Math.sqrt(blend);
        a.connect(shared);(ch===0?b:c).connect(independent);shared.connect(direct);independent.connect(direct);
        const bypass=ctx.createGain(),effect=ctx.createGain();bypass.gain.value=this.filterType==='off'?1:0;effect.gain.value=this.filterType==='off'?0:1;
        direct.connect(bypass);direct.connect(filter);filter.connect(effect);bypass.connect(shelf);effect.connect(shelf);shelf.connect(merger,0,ch);
        chains.push({shared,independent,direct,bypass,effect,filter,shelf});
      }
      a.start();b.start();c.start();sources.push(a,b,c);return {output,master,analyser,merger,chains,sources};
    }
    async start(){await this.init();this.cancelStop();if(this.chain){this.active=true;this.onState(true);return;}this.chain=this.build();this.active=true;this.onState(true);}
    cancelStop(){if(this.stopping){clearTimeout(this.stopping);this.stopping=null;}}
    stop(){this.active=false;this.onState(false);const chain=this.chain;if(!chain)return;const t=this.ctx.currentTime;chain.output.gain.cancelScheduledValues(t);chain.output.gain.setValueAtTime(chain.output.gain.value,t);chain.output.gain.linearRampToValueAtTime(0,t+.09);this.chain=null;setTimeout(()=>this.disposeChain(chain),140);}
    disposeChain(c){for(const s of c.sources){try{s.stop();}catch{}}for(const n of [c.output,c.master,c.analyser,c.merger,...c.chains.flatMap(v=>Object.values(v)),...c.sources])try{n.disconnect();}catch{}}
    level(){return Math.pow(10,this.db/20)*.65;}
    setMaster(db){this.db=db;if(this.chain)this.chain.master.gain.setTargetAtTime(this.level(),this.ctx.currentTime,.025);}
    setAir(db){this.air=db;if(this.chain)for(const c of this.chain.chains)c.shelf.gain.setTargetAtTime(db,this.ctx.currentTime,.025);}
    setWidth(v){this.width=v;if(this.chain)for(const c of this.chain.chains){c.shared.gain.setTargetAtTime(Math.sqrt(1-v),this.ctx.currentTime,.03);c.independent.gain.setTargetAtTime(Math.sqrt(v),this.ctx.currentTime,.03);}}
    setFilter(type){this.filterType=type;if(this.chain)for(const c of this.chain.chains){if(type!=='off')c.filter.type=type;c.bypass.gain.setTargetAtTime(type==='off'?1:0,this.ctx.currentTime,.02);c.effect.gain.setTargetAtTime(type==='off'?0:1,this.ctx.currentTime,.02);}}
    setCutoff(v){this.cutoff=v;if(this.chain)for(const c of this.chain.chains)c.filter.frequency.setTargetAtTime(v,this.ctx.currentTime,.015);}
    setQ(v){this.q=v;if(this.chain)for(const c of this.chain.chains)c.filter.Q.setTargetAtTime(v,this.ctx.currentTime,.015);}
    async setType(type){
      this.type=type;
      if(!this.active||!this.chain)return;
      // Build a second fully configured chain and crossfade between sources.
      // This avoids clicks and avoids the mono channel becoming accidentally louder.
      const old=this.chain,next=this.build(),t=this.ctx.currentTime;
      next.output.gain.cancelScheduledValues(t);
      next.output.gain.setValueAtTime(0,t);
      next.output.gain.linearRampToValueAtTime(1,t+.13);
      old.output.gain.cancelScheduledValues(t);
      old.output.gain.setValueAtTime(old.output.gain.value,t);
      old.output.gain.linearRampToValueAtTime(0,t+.13);
      this.chain=next;
      setTimeout(()=>this.disposeChain(old),170);
    }
    response(freq){if(this.filterType==='off')return 0;const c=this.ctx;let filter;if(c)filter=c.createBiquadFilter();else{const Offline=window.OfflineAudioContext||window.webkitOfflineAudioContext;if(!Offline)return 0;filter=(new Offline(1,128,44100)).createBiquadFilter();}filter.type=this.filterType;filter.frequency.value=this.cutoff;filter.Q.value=this.q;const f=new Float32Array([freq]),mag=new Float32Array(1),phase=new Float32Array(1);filter.getFrequencyResponse(f,mag,phase);return 20*Math.log10(Math.max(0.00001,mag[0]));}
    getAnalyser(){return this.chain?.analyser||null;}
    async destroy(){this.stop();if(this.ctx){await new Promise(r=>setTimeout(r,155));try{await this.ctx.close();}catch{}this.ctx=null;}}
  }
  window.NoiseForgeEngine=NoiseEngine;
})();
