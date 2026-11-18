const PRESETS = {
 chorus: [
  {id:'silk',name:'Silk Chorus',description:'Gentle, spacious modulation for instruments and pads.',mix:38,rate:35,depth:48,feedback:18,width:80,tone:75},
  {id:'ensemble',name:'Deep Ensemble',description:'Wide and rich movement with a slow sweep.',mix:55,rate:20,depth:72,feedback:24,width:95,tone:66},
  {id:'glass',name:'Glass Motion',description:'Shimmering high-detail modulation.',mix:43,rate:58,depth:55,feedback:12,width:90,tone:95},
  {id:'vintage',name:'Vintage Drift',description:'Dark and slow with subtle regeneration.',mix:32,rate:13,depth:37,feedback:30,width:63,tone:36}
 ],
 flanger: [
  {id:'jet',name:'Jet Stream',description:'Resonant, moving comb-filter sweeps.',mix:50,rate:36,depth:76,feedback:62,width:80,tone:80},
  {id:'subtle',name:'Soft Sweep',description:'Transparent, understated phasing motion.',mix:32,rate:25,depth:34,feedback:20,width:70,tone:68},
  {id:'metal',name:'Metal Motion',description:'Bright metallic overtones with controlled feedback.',mix:48,rate:61,depth:65,feedback:73,width:92,tone:94},
  {id:'slow',name:'Long Orbit',description:'Deep, slowly evolving flanger texture.',mix:45,rate:9,depth:84,feedback:54,width:88,tone:60}
 ]
};
const rateFromSlider=(v,kind)=>{const min=.045,max=kind==='flanger'?1.8:4;return min*Math.pow(max/min,Number(v)/100)};
const toneFromSlider=v=>650*Math.pow(16000/650,Number(v)/100);
const paramsFromControls=(values,kind)=>{
 const rate=rateFromSlider(values.rate,kind),depth=Number(values.depth)/100;
 const base=kind==='flanger'?(.0023+depth*.002):(.015+depth*.005);
 const sweep=kind==='flanger'?(0.00015+depth*.0017):(.0006+depth*.0058);
 return {kind,mix:Number(values.mix)/100,rate,depth,sweep,base,feedback:Number(values.feedback)/100,width:Number(values.width)/100,tone:toneFromSlider(values.tone),master:Number(values.master)/100};
};

window.ModLabPresets={PRESETS,paramsFromControls,toneFromSlider,rateFromSlider};
