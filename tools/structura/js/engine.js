/* STRUCTURA · Arrangement generation and Web Audio preview, no external dependencies. */
(function(global){'use strict';
const TRACKS=['drums','bass','chords','lead','fx'];
const MODE_INTERVALS={minor:[0,2,3,5,7,8,10],major:[0,2,4,5,7,9,11],dorian:[0,2,3,5,7,9,10],mixolydian:[0,2,4,5,7,9,10]};
const KEY_NAMES=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const FORMS={
 house:[['Intro',8,22],['Build',16,48],['Verse',16,61],['Break',8,22],['Drop',32,95],['Verse',16,68],['Outro',16,20]],
 techno:[['Intro',16,20],['Build',16,57],['Drop',32,92],['Break',16,24],['Build',16,65],['Drop',32,97],['Outro',16,18]],
 ambient:[['Intro',16,20],['Verse',24,35],['Interlude',16,54],['Verse',24,63],['Break',12,29],['Outro',24,17]],
 hiphop:[['Intro',4,23],['Verse',16,64],['Chorus',8,92],['Verse',16,66],['Chorus',8,96],['Bridge',8,48],['Outro',8,18]],
 pop:[['Intro',4,20],['Verse',16,56],['Pre-Chorus',8,70],['Chorus',8,94],['Verse',16,59],['Pre-Chorus',8,75],['Chorus',16,99],['Bridge',8,44],['Chorus',8,98],['Outro',4,26]],
 cinematic:[['Intro',8,14],['Build',16,36],['Verse',16,62],['Build',8,79],['Drop',16,96],['Break',8,30],['Outro',16,17]]
};
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function seeded(seed){let s=seed>>>0;return()=>((s=Math.imul(s,1664525)+1013904223>>>0)/4294967296)}
function baseLayers(type,genre,energy,density,rng){const t=type.toLowerCase(),e=energy/100, d=density/100;const p={drums:.2+b(t,'drums'),bass:.2+b(t,'bass'),chords:.25+b(t,'chords'),lead:.1+b(t,'lead'),fx:.14+b(t,'fx')};function b(t,k){const m={intro:{drums:.1,bass:-.06,chords:.2,lead:-.06,fx:.64},verse:{drums:.56,bass:.56,chords:.5,lead:.23,fx:.12},chorus:{drums:.7,bass:.7,chords:.68,lead:.63,fx:.22},'pre-chorus':{drums:.39,bass:.47,chords:.52,lead:.47,fx:.45},build:{drums:.38,bass:.35,chords:.3,lead:.4,fx:.66},drop:{drums:.76,bass:.77,chords:.53,lead:.54,fx:.38},break:{drums:-.10,bass:-.06,chords:.40,lead:.28,fx:.6},bridge:{drums:.26,bass:.25,chords:.5,lead:.44,fx:.44},interlude:{drums:-.1,bass:-.1,chords:.53,lead:.35,fx:.45},outro:{drums:.03,bass:.08,chords:.4,lead:.02,fx:.41}};return (m[t]||m.verse)[k]||0}
if(genre==='ambient'||genre==='cinematic'){p.drums-=.48;p.chords+=.2;p.fx+=.12}if(genre==='techno'){p.drums+=.2;p.bass+=.1}if(genre==='hiphop'){p.drums+=.14;p.bass+=.18}
const o={};TRACKS.forEach(k=>o[k]=rng()<clamp(p[k]+(e-.5)*.17+(d-.5)*.65,.04,.98));return o}
function createArrangement(genre='house',dna={variation:50,tension:65,density:55},seed=Date.now()){const form=FORMS[genre]||FORMS.house,rng=seeded(seed),v=+dna.variation/100,ten=+dna.tension/100;let sections=form.map((tpl,i)=>{let [type,bars,energy]=tpl;const jitter= Math.round((rng()-.5)*v*22);energy=clamp(energy+jitter+((type==='Build'||type==='Drop')?(ten-.5)*20:0),5,100);const barVariants=[4,8,12,16,24,32];if(v>.42&&rng()<v*.36){let ix=barVariants.indexOf(bars);if(ix>-1)bars=barVariants[clamp(ix+(rng()>.5?1:-1),0,barVariants.length-1)]}return{id:'sec_'+Math.random().toString(36).slice(2,9)+'_'+i,type,bars,energy,layers:baseLayers(type,genre,energy,dna.density,rng)}});
if(v>.65 && rng()<v*.35 && sections.length<11){const at=2+Math.floor(rng()*(sections.length-3));let s=structuredClone(sections[at]);s.id='sec_'+Math.random().toString(36).slice(2,10);s.bars=8;s.energy=clamp(s.energy-15,5,100);sections.splice(at,0,s)}return sections}
function totalBars(sections){return sections.reduce((v,s)=>v+s.bars,0)}
function getSectionAtBar(sections,bar){let start=0;for(let i=0;i<sections.length;i++){let s=sections[i];if(bar<start+s.bars)return{section:s,index:i,localBar:bar-start,start};start+=s.bars}return null}
function clock(bars,bpm){return bars*240/bpm}
// Deterministic notes used both for audio preview and MIDI export.
function eventsInBar(track,barIndex,section,localBar,options){let bpm=options.bpm||120; const key=KEY_NAMES.indexOf(options.key);const root=key<0?0:key;const scale=MODE_INTERVALS[options.mode]||MODE_INTERVALS.minor;const progression=[0,5,3,4];const degree=progression[Math.floor(barIndex/4)%progression.length];const pitch=n=>48+root+scale[(degree+n)%7]+12*Math.floor((degree+n)/7);const e=section.energy/100;const result=[];const add=(q,d,n,velocity=90)=>result.push({q,d,n,velocity});
if(track==='drums') {for(let i=0;i<4;i++){if(i===0||i===2||e>.55) add(i,0.2,36,93);if(i===1||i===3)add(i,.20,38,80);if(e>.5) {add(i+.5,.11,42,59);if(e>.78)add(i+.25,.08,42,45)}}if(e>.76&&localBar%4===3)add(3.75,.1,46,72)}
if(track==='bass'){const notes=[0,0,4,2];for(let i=0;i<(e>.6?4:2);i++){const q=e>.6?i:i*2;add(q,.66,pitch(notes[i])-24,Math.round(70+20*e))}}
if(track==='chords'){let n=[pitch(0),pitch(2),pitch(4)];if(e>.7)n.push(pitch(6));if(options.genre==='ambient'||options.genre==='cinematic'){n.forEach(p=>add(0,3.75,p+12,52))}else for(let q=0;q<4;q+=(e>.7?1:2)){n.forEach(p=>add(q,.78,p,Math.round(55+e*18)))}}
if(track==='lead'){if(localBar%2===0||e>.7){let melody=[4,2,5,4,2,1,0,2];for(let i=0;i<(e>.68?4:2);i++){add(i*(e>.68?1:2),.5,pitch(melody[(barIndex*3+i)%melody.length])+12,Math.round(58+e*20))}}}
if(track==='fx'){if(localBar===0) add(0,1.5,76,75);if(localBar===section.bars-1)add(3,.75,81,80)}
if(global.StructuraPatterns)return global.StructuraPatterns.notesInBar(track,section,localBar,options,pitch);
return result}
class Preview{
constructor(){this.ctx=null;this.active=false;this.interval=null;this.nextBar=0;this.started=0;this.t0=0;this.nodes=[];this.timerId=null;this.onStep=null;this.onEnd=null;this.settings=null;this.sections=null;this.loop=false}
ensure(){if(!this.ctx)this.ctx=new(window.AudioContext||window.webkitAudioContext)();return this.ctx}
async start(sections,settings,loop,onStep,onEnd){this.stop();if(!sections.length)return;let ctx=this.ensure();await ctx.resume();this.active=true;this.sections=sections;this.settings={...settings};this.loop=loop;this.onStep=onStep;this.onEnd=onEnd;this.nextBar=0;this.t0=ctx.currentTime+.12;this.timerId=setInterval(()=>this.schedule(),85);this.schedule()}
schedule(){if(!this.active)return;const ctx=this.ctx;const total=totalBars(this.sections);const barSecs=clock(1,this.settings.bpm);while(this.nextBar*barSecs+this.t0<ctx.currentTime+.32){let globalBar=this.nextBar;let realBar=globalBar%total;if(globalBar>=total&&!this.loop){this.finishAt= this.t0+total*barSecs;if(ctx.currentTime>=this.finishAt) this.stop(true);break}if(this.loop){if(globalBar>0&&realBar===0){this.t0=ctx.currentTime+.12;this.nextBar=0;globalBar=0;realBar=0}}let info=getSectionAtBar(this.sections,realBar);if(!info)break;let when=this.t0+globalBar*barSecs;for(let track of TRACKS){if(!info.section.layers[track])continue;for(const ev of eventsInBar(track,realBar,info.section,info.localBar,this.settings)){this.playEvent(track,ev,when+ev.q*60/this.settings.bpm)}}this.nextBar++}
const pos=Math.min(total-1,Math.floor(Math.max(0,ctx.currentTime-this.t0)/barSecs)%total);if(this.onStep&&pos>=0)this.onStep(pos);if(!this.loop&&ctx.currentTime>=this.t0+total*barSecs+.1)this.stop(true)}
playDrum(ev,time,palette){
  const c=this.ctx;
  const kind=ev.n===36?'kick':ev.n===38?'snare':ev.n===42?'hat':ev.n===46?'open':ev.n===51?'perc':'perc';
  const intensity=Math.max(.15,Math.min(1.3,ev.velocity/100));
  const ambient=palette==='ambient'||palette==='cinematic';
  // Genre-specific dynamics: tight dance drums, dry hip-hop drums, restrained ambient drums.
  const level=(palette==='techno'?1.06:palette==='hiphop'?.94:ambient?.56:1)*intensity;
  const connect=(node,gain)=>{
    node.connect(gain);gain.connect(c.destination);
    node.onended=()=>{try{node.disconnect();gain.disconnect()}catch(e){}};
    this.nodes.push(node);
  };
  const tone=(type,f0,f1,dur,amp,attack=.003)=>{
    const osc=c.createOscillator(),g=c.createGain();
    osc.type=type;
    osc.frequency.setValueAtTime(Math.max(1,f0),time);
    if(f1!==f0)osc.frequency.exponentialRampToValueAtTime(Math.max(1,f1),time+Math.min(.09,dur*.7));
    g.gain.setValueAtTime(.0001,time);
    g.gain.linearRampToValueAtTime(Math.max(.00011,amp),time+attack);
    g.gain.exponentialRampToValueAtTime(.0001,time+dur);
    connect(osc,g);osc.start(time);osc.stop(time+dur+.008);
  };
  const noise=(filterType,freq,q,dur,amp,attack=.002)=>{
    if(!this.noiseBuffer){
      const length=c.sampleRate;const buffer=c.createBuffer(1,length,c.sampleRate);
      const arr=buffer.getChannelData(0);
      let prev=0;
      for(let i=0;i<length;i++){const white=Math.random()*2-1;prev=(prev+white*.85)/1.85;arr[i]=white*.78+prev*.22;}
      this.noiseBuffer=buffer;
    }
    const source=c.createBufferSource(),filter=c.createBiquadFilter(),g=c.createGain();
    source.buffer=this.noiseBuffer;
    filter.type=filterType;filter.frequency.value=freq;filter.Q.value=q;
    g.gain.setValueAtTime(.0001,time);
    g.gain.linearRampToValueAtTime(Math.max(.00011,amp),time+attack);
    g.gain.exponentialRampToValueAtTime(.0001,time+dur);
    source.connect(filter);filter.connect(g);g.connect(c.destination);
    source.onended=()=>{try{source.disconnect();filter.disconnect();g.disconnect()}catch(e){}};
    this.nodes.push(source);source.start(time,Math.random()*.4,dur+.008);source.stop(time+dur+.008);
  };
  switch(kind){
    case 'kick':
      // Short, weighty low-frequency transient. No long high-pitched laser sweep.
      tone('sine',palette==='techno'?92:82,48,ambient?.24:.19,.34*level,.002);
      tone('triangle',125,68,.035,.08*level,.001);
      break;
    case 'snare':
      noise('highpass',1250,.65,ambient?.12:.16,.19*level);
      tone('triangle',165,130,.085,.075*level);
      break;
    case 'hat':
      noise('highpass',6800,.7,.058,.085*level,.001);
      break;
    case 'open':
      noise('highpass',5900,.7,ambient?.23:.27,.075*level,.002);
      break;
    case 'perc':
      noise('bandpass',1900,1.6,.075,.085*level);
      tone('triangle',410,340,.065,.055*level);
      break;
  }
}
playEvent(track,ev,time){
  const c=this.ctx;
  const palette=this.settings.soundPreset==='auto'?this.settings.genre:this.settings.soundPreset;
  if(track==='drums'){this.playDrum(ev,time,palette);return}
  const hz=440*Math.pow(2,(ev.n-69)/12);
  const o=c.createOscillator(),g=c.createGain();
  const timbres={house:{bass:'sawtooth',chords:'triangle',lead:'sine',fx:'sine'},techno:{bass:'sawtooth',chords:'sawtooth',lead:'square',fx:'sawtooth'},ambient:{bass:'sine',chords:'sine',lead:'triangle',fx:'sine'},hiphop:{bass:'sine',chords:'triangle',lead:'triangle',fx:'sine'},pop:{bass:'triangle',chords:'triangle',lead:'sine',fx:'triangle'},cinematic:{bass:'sawtooth',chords:'triangle',lead:'sine',fx:'sine'}};
  o.type=(timbres[palette]||timbres.house)[track]||'sine';
  o.frequency.setValueAtTime(hz,time);
  let filter=null;
  if(track==='bass'){
    filter=c.createBiquadFilter();
    filter.type='lowpass';
    filter.frequency.value=palette==='ambient'?220:palette==='techno'?760:390;
    o.connect(filter);filter.connect(g);
  }else o.connect(g);
  g.connect(c.destination);
  const amp=(track==='bass'?.095:track==='chords'?.035:track==='lead'?.055:.016)*(palette==='ambient'?.62:palette==='techno'?1.05:palette==='cinematic'?.78:1);
  const dur=Math.min(2.2,ev.d*60/this.settings.bpm);
  g.gain.setValueAtTime(.0001,time);
  g.gain.linearRampToValueAtTime(Math.max(.00011,amp*ev.velocity/100),time+.009);
  g.gain.exponentialRampToValueAtTime(.0001,time+dur);
  o.start(time);o.stop(time+dur+.02);
  o.onended=()=>{o.disconnect();g.disconnect();if(filter)filter.disconnect()};
  this.nodes.push(o);
  if(this.nodes.length>600)this.nodes=this.nodes.filter(x=>x.context&&x.context.state!=='closed');
}
stop(finished=false){this.active=false;if(this.timerId){clearInterval(this.timerId);this.timerId=null}for(let n of this.nodes){try{n.stop()}catch(e){}}this.nodes=[];if(finished&&this.onEnd)this.onEnd()}
}
global.StructuraEngine={TRACKS,FORMS,MODE_INTERVALS,KEY_NAMES,createArrangement,totalBars,getSectionAtBar,clock,eventsInBar,Preview,clamp};
})(window);
