(function(){
const definitions={
 air:{name:'AIR',role:'FILTER',color:'#76D5D8',modes:['LP','BP','HP'],defaults:{mode:'LP',amount:.52,tone:.25,mix:1}},
 fire:{name:'FIRE',role:'SATURATION',color:'#FFB18A',modes:['Tube','Tape','Fuzz'],defaults:{mode:'Tube',amount:.45,tone:.52,mix:.85}},
 water:{name:'WATER',role:'MODULATION',color:'#B1C7FF',modes:['Chorus','Flanger','Vibrato'],defaults:{mode:'Chorus',amount:.42,tone:.4,mix:.55}},
 earth:{name:'EARTH',role:'REVERB',color:'#E0B8F2',modes:['Room','Plate','Hall'],defaults:{mode:'Hall',amount:.54,tone:.55,mix:.33}},
 aether:{name:'AETHER',role:'TEXTURE',color:'#F2D7A2',modes:['Air','Dust','Grain'],defaults:{mode:'Air',amount:.25,tone:.55,mix:.12}}
};
const initial=()=>Object.fromEntries(Object.entries(definitions).map(([key,value])=>[key,{...value.defaults,on:true}]));
const patches={
 'Warm Atmosphere':{order:['air','fire','water','earth'],values:{air:{mode:'LP',amount:.35,tone:.18,mix:1},fire:{mode:'Tape',amount:.41,tone:.57,mix:.72},water:{mode:'Chorus',amount:.28,tone:.33,mix:.38},earth:{mode:'Hall',amount:.44,tone:.53,mix:.29}}},
 'Ambient Bloom':{order:['water','air','earth','aether'],values:{water:{mode:'Chorus',amount:.68,tone:.24,mix:.62},air:{mode:'LP',amount:.38,tone:.14,mix:1},earth:{mode:'Hall',amount:.76,tone:.62,mix:.65},aether:{mode:'Air',amount:.22,tone:.64,mix:.08}}},
 'Analog Character':{order:['air','fire','water'],values:{air:{mode:'LP',amount:.4,tone:.21,mix:1},fire:{mode:'Tube',amount:.73,tone:.45,mix:.95},water:{mode:'Flanger',amount:.18,tone:.25,mix:.16}}},
 'Lo-Fi Memory':{order:['air','fire','aether','earth'],values:{air:{mode:'LP',amount:.69,tone:.18,mix:1},fire:{mode:'Tape',amount:.62,tone:.25,mix:.91},aether:{mode:'Dust',amount:.32,tone:.29,mix:.18},earth:{mode:'Room',amount:.23,tone:.68,mix:.2}}},
 'Raw Distortion':{order:['air','fire'],values:{air:{mode:'HP',amount:.22,tone:.38,mix:1},fire:{mode:'Fuzz',amount:.85,tone:.35,mix:1}}},
 'Empty Rack':{order:[],values:{}}
};
window.EssencePresets={definitions,initial,patches};
})();
