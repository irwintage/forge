'use strict';
const KnotScales={
 names:['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'],
 intervals:{major:[0,2,4,5,7,9,11],minor:[0,2,3,5,7,8,10],dorian:[0,2,3,5,7,9,10],phrygian:[0,1,3,5,7,8,10],lydian:[0,2,4,6,7,9,11],mixolydian:[0,2,4,5,7,9,10],pentatonic:[0,3,5,7,10]},
 allowed(note,s){if(s.type==='off')return true;return this.intervals[s.type].includes(((note-s.root)%12+12)%12);},
 map(note,s){if(s.type==='off'||s.behavior==='free'||this.allowed(note,s))return note;if(s.behavior==='mute')return null;for(let distance=1;distance<12;distance++){const low=note-distance,high=note+distance;if(low>=0&&this.allowed(low,s))return low;if(high<=127&&this.allowed(high,s))return high;}return note;}
};
