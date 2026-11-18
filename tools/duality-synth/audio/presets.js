'use strict';
window.DUALITY_PRESETS = {
  juxtaposedVenus: {
    name:'Juxtaposed Venus', root:'E3', scale:'minor', pattern:[1,0,1,0,1,0,0,0,1,0,1,0,1,0,0,0],
    A:{name:'Juxtaposed',description:'Clear / intimate',wave:'triangle',attack:.025,decay:.20,sustain:.60,release:.55,cutoff:3000,chorus:.025,distortion:.03,distWet:0,space:.17, room:.38},
    B:{name:'Venus',description:'Deep / wide / saturated',wave:'sawtooth',attack:.06,decay:.33,sustain:.54,release:1.2,cutoff:1050,chorus:.26,distortion:.21,distWet:.19,space:.38,room:.74}
  },
  corpuscularBloom: {
    name:'Corpuscular Bloom', root:'A3', scale:'dorian', pattern:[1,0,0,1,0,1,0,0,1,0,0,1,0,1,0,0],
    A:{name:'Corpuscular',description:'Airy / delicate',wave:'sine',attack:.045,decay:.20,sustain:.66,release:.85,cutoff:3400,chorus:.11,distortion:.02,distWet:0,space:.22,room:.55},
    B:{name:'Bloom',description:'Radiant / floating',wave:'triangle',attack:.13,decay:.26,sustain:.75,release:1.6,cutoff:2450,chorus:.33,distortion:.09,distWet:.07,space:.46,room:.85}
  },
  occultTape: {
    name:'Occult Tape', root:'D3', scale:'minor', pattern:[1,0,0,0,1,0,0,1,0,0,1,0,1,0,0,0],
    A:{name:'Occult',description:'Soft / lo-fi',wave:'triangle',attack:.018,decay:.17,sustain:.48,release:.6,cutoff:2300,chorus:.13,distortion:.14,distWet:.13,space:.20,room:.48},
    B:{name:'Tape',description:'Dark / textured',wave:'sawtooth',attack:.015,decay:.18,sustain:.43,release:.75,cutoff:820,chorus:.19,distortion:.28,distWet:.28,space:.28,room:.58}
  },
  orbitsOfEcho: {
    name:'Orbits of Echo', root:'G3', scale:'pentatonic', pattern:[1,0,1,0,0,1,0,1,1,0,0,1,0,1,0,0],
    A:{name:'Orbit',description:'Focused / direct',wave:'triangle',attack:.032,decay:.22,sustain:.63,release:.7,cutoff:2400,chorus:0,distortion:.02,distWet:0,space:.12,room:.36},
    B:{name:'Echo',description:'Wide / liquid',wave:'triangle',attack:.07,decay:.23,sustain:.70,release:1.5,cutoff:2100,chorus:.36,distortion:.09,distWet:.08,space:.40,room:.80}
  }
};
window.DUALITY_SCALES={minor:[0,2,3,5,7,8,10,12],major:[0,2,4,5,7,9,11,12],dorian:[0,2,3,5,7,9,10,12],phrygian:[0,1,3,5,7,8,10,12],pentatonic:[0,3,5,7,10,12]};
