/* Standard MIDI Format 1: tempo/markers + named MIDI guide tracks. */
(function(global){'use strict';const E=global.StructuraEngine,PPQ=480;
function u16(n){return[(n>>8)&255,n&255]}function u32(n){return[(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255]}function str(s){return Array.from(s).map(c=>c.charCodeAt(0)&255)}function vlq(n){n=Math.max(0,Math.floor(n));let b=[n&127];while((n>>=7))b.unshift((n&127)|128);return b}function chunk(id,bytes){return[...str(id),...u32(bytes.length),...bytes]}
function track(events){events.sort((a,b)=>a.tick-b.tick||a.rank-b.rank);let out=[],last=0;for(let e of events){out.push(...vlq(e.tick-last),...e.bytes);last=e.tick}out.push(0,0xff,0x2f,0);return chunk('MTrk',out)}
function marker(tick,s){let b=str(s.slice(0,100));return{tick,rank:0,bytes:[255,6,...vlq(b.length),...b]}}
function name(s){let b=str(s);return{tick:0,rank:0,bytes:[255,3,...vlq(b.length),...b]}}
function make(sections,settings){let bpm=Math.max(40,Math.min(250,Math.round(settings.bpm||120))),root=[name('STRUCTURA | Arrangement'),{tick:0,rank:0,bytes:[255,81,3,...u32(Math.round(60000000/bpm)).slice(1)]},{tick:0,rank:0,bytes:[255,88,4,4,2,24,8]}];let bar=0;for(let s of sections){root.push(marker(bar*PPQ*4,`${s.type} | ${s.bars} bars | energy ${s.energy}%`));bar+=s.bars}
const tracks=[track(root)];const names={drums:'Drums Guide',bass:'Bass Guide',chords:'Chords Guide',lead:'Lead Guide',fx:'FX Cues'};const channels={drums:9,bass:0,chords:1,lead:2,fx:3};const prog={bass:38,chords:88,lead:80,fx:98};for(const k of E.TRACKS){const ch=channels[k],arr=[name(names[k])];if(k!=='drums')arr.push({tick:0,rank:1,bytes:[0xc0|ch,prog[k]]});bar=0;for(const section of sections){if(section.layers[k]){for(let j=0;j<section.bars;j++){for(const ev of E.eventsInBar(k,bar+j,section,j,settings)){const start=Math.round(((bar+j)*4+ev.q)*PPQ),end=start+Math.max(1,Math.round(ev.d*PPQ));arr.push({tick:start,rank:2,bytes:[0x90|ch,ev.n&127,Math.max(1,ev.velocity&127)]});arr.push({tick:end,rank:1,bytes:[0x80|ch,ev.n&127,0]})}}}bar+=section.bars}tracks.push(track(arr))}return new Blob([Uint8Array.from([...str('MThd'),...u32(6),...u16(1),...u16(tracks.length),...u16(PPQ),...tracks.flat()])],{type:'audio/midi'})}
// Arrangement-only SMF: named marker track, section lane, five guide lanes.
// No melodic composition data, and no GM percussion channel is used.
function makeStructure(sections,settings){
  const bpm=Math.max(40,Math.min(250,Math.round(settings.bpm||120)));
  const barTick=PPQ*4;
  const root=[name('STRUCTURA | Arrangement Guide'),
    {tick:0,rank:0,bytes:[255,81,3,...u32(Math.round(60000000/bpm)).slice(1)]},
    {tick:0,rank:0,bytes:[255,88,4,4,2,24,8]}];
  const lane=[name('Sections | Guide')];
  const pitches={Intro:48,Verse:50,Chorus:52,'Pre-Chorus':53,Build:55,Break:57,Drop:59,Bridge:60,Interlude:62,Outro:64,Custom:65};
  const names={drums:'Drums | Guide',bass:'Bass | Guide',chords:'Chords | Guide',lead:'Lead | Guide',fx:'FX | Guide'};
  const guideNotes={drums:48,bass:50,chords:52,lead:53,fx:55};
  const guideChannels={drums:1,bass:2,chords:3,lead:4,fx:5};
  const guides={};
  for(const k of E.TRACKS)guides[k]=[name(names[k])];
  let bar=0;
  function textEvent(tick,kind,textValue){const b=str(textValue);return {tick,rank:0,bytes:[255,kind,...vlq(b.length),...b]}}
  function note(out,ch,pitch,start,end,velocity){if(end<=start)return;out.push({tick:start,rank:2,bytes:[0x90|ch,pitch,velocity]});out.push({tick:end,rank:1,bytes:[0x80|ch,pitch,0]})}
  for(let i=0;i<sections.length;i++){
    const s=sections[i],start=bar*barTick,end=(bar+s.bars)*barTick;
    const title=String(i+1).padStart(2,'0')+' '+s.type+' | '+s.bars+' bars';
    root.push(marker(start,title));
    lane.push(textEvent(start,1,title));
    note(lane,0,pitches[s.type]??65,start,end,Math.max(30,Math.min(110,Math.round(s.energy))));
    for(const k of E.TRACKS){if(s.layers[k]){
      // A sustained note stands for an active section, not for an audible phrase.
      note(guides[k],guideChannels[k],guideNotes[k],start,end,Math.max(30,Math.min(110,Math.round(s.energy))));
    }}
    bar+=s.bars;
  }
  root.push(marker(bar*barTick,'END | '+bar+' bars'));
  const tracks=[track(root),track(lane),...E.TRACKS.map(k=>track(guides[k]))];
  return new Blob([Uint8Array.from([...str('MThd'),...u32(6),...u16(1),...u16(tracks.length),...u16(PPQ),...tracks.flat()])],{type:'audio/midi'});
}
global.StructuraMidi={make,makeStructure};
})(window);
