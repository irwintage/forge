// Forge Edition: optional local session bridge, independent of the PWA.
const SAVE_KEY = 'chrysasynth:hold-frequency:forge-v1';
function setupForge(){
  const tracks=document.getElementById('forgeTracks');
  const counter=document.getElementById('forgeCounter');
  const status=document.getElementById('forgeSaveStatus');
  if(!tracks) return;
  function render(){
    tracks.replaceChildren();
    chakras.forEach((c,i)=>{
      const el=document.createElement('div');
      el.className='forge-track'+(completed[i]?' is-done':'')+(i===currentChakra?' is-current':'');
      el.style.setProperty('--track',c.color);
      el.title=c.name+' · '+c.freq+' Hz';
      const dot=document.createElement('i'); dot.setAttribute('aria-hidden','true');
      const label=document.createElement('small'); label.textContent=String(i+1).padStart(2,'0');
      el.append(dot,label);tracks.append(el);
    });
    counter.textContent=completed.filter(Boolean).length+' / 7 complete';
  }
  window.addEventListener('chrysa:progress',render);
  render();
  document.getElementById('forgeSave').addEventListener('click',()=>{
    try{
      localStorage.setItem(SAVE_KEY,JSON.stringify({schema:1,completed:[...completed],currentChakra,volume:volumeSlider.value,tone:toneSlider.value,savedAt:new Date().toISOString()}));
      status.textContent='Session saved locally on this device.';
    }catch(e){status.textContent='Local storage unavailable in this browser.';}
  });
  document.getElementById('forgeRestore').addEventListener('click',()=>{
    try{
      const data=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');
      if(!data||data.schema!==1||!Array.isArray(data.completed)||data.completed.length!==7) {status.textContent='No saved session found.';return;}
      if(isHolding||holdRequested)cancelHold();
      completed=data.completed.map(Boolean);
      currentChakra=Math.min(6,Math.max(0,Number.isInteger(data.currentChakra)?data.currentChakra:0));
      if(completed[currentChakra] && !completed.every(Boolean)) currentChakra=completed.findIndex(x=>!x);
      volumeSlider.value=String(Math.min(100,Math.max(0,Number(data.volume)||40)));
      toneSlider.value=String(Math.min(100,Math.max(0,Number(data.tone)||60)));
      applyVolumeFromSlider(false);applyToneFromSlider();
      flaskEl.classList.toggle('glow-final',completed.every(Boolean));
      resetTimerVisual();updateUIForChakra();updateHoldHint();
      if(audioReady)applyChakraAudio(true);
      status.textContent='Saved session restored.';
    }catch(e){status.textContent='Could not restore saved session.';}
  });
  document.getElementById('forgeReset').addEventListener('click',()=>{
    if(isHolding||holdRequested)cancelHold();
    completed=new Array(chakras.length).fill(false);currentChakra=0;
    flaskEl.classList.remove('glow-final');resetTimerVisual();updateUIForChakra();updateHoldHint();
    if(audioReady)applyChakraAudio(true);
    status.textContent='Session reset. Your saved copy is unchanged until you save again.';
  });
}
document.addEventListener('DOMContentLoaded',setupForge);
