/* Structura musical clip patterns — 16-step editable grids and melodic rhythms. */
(function(global){'use strict';
const DRUMS=['kick','snare','hat','open','perc'];
const PRESETS={
 house:{kick:[0,4,8,12],snare:[4,12],hat:[2,6,10,14],open:[7,15],perc:[]},
 techno:{kick:[0,4,8,12],snare:[4,12],hat:[0,2,4,6,8,10,12,14],open:[3,11],perc:[7,15]},
 ambient:{kick:[0],snare:[],hat:[6,14],open:[],perc:[11]},
 hiphop:{kick:[0,7,10],snare:[4,12],hat:[0,2,4,6,8,10,12,14],open:[15],perc:[11]},
 pop:{kick:[0,4,8,12],snare:[4,12],hat:[2,6,10,14],open:[15],perc:[10]},
 cinematic:{kick:[0,8],snare:[12],hat:[4,12],open:[],perc:[7,15]}
};
const DEFS={drums:{rows:DRUMS,names:['Kick','Snare','Closed hat','Open hat','Percussion'],pitches:[36,38,42,46,51]},bass:{rows:['bass'],names:['Bass'],pitches:[36]},chords:{rows:['chord'],names:['Chords'],pitches:[60]},lead:{rows:['lead'],names:['Lead'],pitches:[72]},fx:{rows:['impact','rise'],names:['Impact','Riser'],pitches:[76,81]}};
const DEFAULTS={bass:[0,3,8,11],chord:[0,8],lead:[0,4,7,12],impact:[0],rise:[14]};
function patternFor(track,genre='house',energy=50){let def=DEFS[track],o={};for(const row of def.rows){let arr=track==='drums'?(PRESETS[genre]||PRESETS.house)[row]:DEFAULTS[row];o[row]=Array.from({length:16},(_,i)=>arr.includes(i));}if(energy<30){if(track==='drums'){o.hat=Array(16).fill(false);o.open=Array(16).fill(false)}if(track==='lead')o.lead=Array(16).fill(false)}return o}
function ensure(section,genre='house'){if(!section.patterns)section.patterns={};for(const track of Object.keys(DEFS)){if(!section.patterns[track])section.patterns[track]=patternFor(track,genre,section.energy);for(const row of DEFS[track].rows){if(!Array.isArray(section.patterns[track][row])||section.patterns[track][row].length!==16)section.patterns[track][row]=patternFor(track,genre,section.energy)[row]}}return section.patterns}
function notesInBar(track,section,localBar,options,makePitch){ensure(section,options.genre);const pat=section.patterns[track],out=[];if(!section.layers[track])return out;const rowDef=DEFS[track];let groove=options.genre==='hiphop'?.028:0;for(let r=0;r<rowDef.rows.length;r++){const row=rowDef.rows[r];for(let step=0;step<16;step++){if(!pat[row][step])continue;let q=step*.25+(step%2?groove:0),d=.18,n=rowDef.pitches[r],velocity=72;if(track==='drums'){n=rowDef.pitches[r];velocity=row==='kick'?110:row==='snare'?99:row==='hat'?60:74;d=.16;}else if(track==='bass'){n=makePitch([0,0,4,2][(step+Math.floor(localBar/2))%4])-24;velocity=88;d=.35;}else if(track==='chords'){for(const offset of [0,2,4])out.push({q,d:step<8?1.7:.85,n:makePitch(offset),velocity:64});continue;}else if(track==='lead'){n=makePitch([4,2,5,4,2,1,0,2][(step+localBar)%8])+12;d=.42;velocity=72;}else if(track==='fx'){n=row==='impact'?76:81;d=row==='rise'?1.2:.5;velocity=72;}out.push({q,d,n,velocity});}}
return out}
function miniature(section,track,genre){ensure(section,genre);const rows=DEFS[track].rows;let cols=16,svg='<svg class="clip-mini" viewBox="0 0 160 32" preserveAspectRatio="none" aria-hidden="true">';for(let ri=0;ri<rows.length;ri++){const y=(ri+.5)*(32/rows.length);for(let i=0;i<16;i++){if(section.patterns[track][rows[ri]][i])svg+=`<rect x="${i*10+1}" y="${y-1.7}" width="8.2" height="3.4" rx="1"/>`;}}return svg+'</svg>'}
global.StructuraPatterns={DEFS,PRESETS,patternFor,ensure,notesInBar,miniature};
})(window);