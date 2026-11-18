// Chrysasynth · BPM ⇆ Milliseconds · standalone module
(()=>{
  'use strict';
  const root=document.getElementById('bm-app');
  const $=id=>root.querySelector('#'+id);
  const bpmInput=$('bm-bpm'),msInput=$('bm-ms'),note=$('bm-note'),status=$('bm-status');
  const factors={1:'Whole',2:'Half',4:'Quarter',8:'Eighth',16:'Sixteenth',32:'Thirty-second',64:'Sixty-fourth'};
  let feel=1,tempo=120,intervals=[],previousTap=0,flashTimer=0,noticeTimer=0,disposed=false;
  const value=(input)=>Number(input.value);
  const validBpm=b=>Number.isFinite(b)&&b>=20&&b<=300;
  const validMs=m=>Number.isFinite(m)&&m>0;
  const fmt=m=>m.toFixed(m>=100?1:2).replace(/\.0$/,'');
  const factor=()=>Number(note.value)*feel;
  function setStatus(message){status.textContent=message;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>{status.textContent='READY';},1600);}
  function summary(){const key=Math.round(1/Number(note.value));const duration=factors[key]||'Quarter';const mood=feel===1?'straight':feel===1.5?'dotted':'triplet';$('bm-summary').textContent=`${duration} note · ${mood}`;}
  function fromBpm(){const bpm=value(bpmInput);if(!validBpm(bpm)){bpmInput.setAttribute('aria-invalid','true');return false;}bpmInput.removeAttribute('aria-invalid');tempo=bpm;msInput.value=fmt(60000*factor()/tempo);msInput.removeAttribute('aria-invalid');summary();return true;}
  function fromMs(){const ms=value(msInput);if(!validMs(ms)){msInput.setAttribute('aria-invalid','true');return false;}msInput.removeAttribute('aria-invalid');const bpm=60000*factor()/ms;if(!validBpm(bpm)){bpmInput.setAttribute('aria-invalid','true');setStatus('20–300 BPM');return false;}tempo=bpm;bpmInput.removeAttribute('aria-invalid');bpmInput.value=fmt(bpm);summary();return true;}
  bpmInput.addEventListener('input',fromBpm);
  bpmInput.addEventListener('change',()=>{if(!fromBpm()){bpmInput.value=fmt(tempo);fromBpm();}});
  msInput.addEventListener('input',fromMs);
  msInput.addEventListener('change',()=>{if(!fromMs()){fromBpm();}});
  note.addEventListener('change',fromBpm);
  root.querySelectorAll('[data-feel]').forEach(button=>button.addEventListener('click',()=>{feel=Number(button.dataset.feel);root.querySelectorAll('[data-feel]').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});fromBpm();}));
  function resetTap(){previousTap=0;intervals=[];$('bm-tap-caption').textContent='Tap a rhythm';setStatus('READY');}
  function tap(){const t=performance.now();if(previousTap&&t-previousTap>2000){resetTap();}
    if(previousTap){const gap=t-previousTap;if(gap>=180&&gap<=3000){intervals.push(gap);if(intervals.length>6)intervals.shift();const sorted=[...intervals].sort((a,b)=>a-b);const median=sorted[Math.floor(sorted.length/2)];const filtered=intervals.filter(v=>Math.abs(v-median)<median*.3);const avg=filtered.reduce((a,b)=>a+b,0)/filtered.length;const b=Math.round(60000/avg*10)/10;if(validBpm(b)){bpmInput.value=fmt(b);fromBpm();$('bm-tap-caption').textContent=`${b} BPM detected`;}}}
    previousTap=t;const button=$('bm-tap');button.classList.remove('pulse');void button.offsetWidth;button.classList.add('pulse');clearTimeout(flashTimer);flashTimer=setTimeout(()=>button.classList.remove('pulse'),150);
  }
  $('bm-tap').addEventListener('click',tap);$('bm-reset').addEventListener('click',resetTap);
  function onKey(e){if(e.code!=='Space'||e.repeat||e.ctrlKey||e.metaKey||e.altKey)return;const tag=document.activeElement?.tagName;if(['INPUT','SELECT','TEXTAREA','BUTTON'].includes(tag)||document.activeElement?.isContentEditable)return;e.preventDefault();tap();}
  window.addEventListener('keydown',onKey);
  $('bm-copy').addEventListener('click',async()=>{try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(`${msInput.value} ms`);setStatus('COPIED');}catch{msInput.focus();msInput.select();setStatus('SELECT TO COPY');}});
  function destroy(){disposed=true;window.removeEventListener('keydown',onKey);clearTimeout(flashTimer);clearTimeout(noticeTimer);}
  window.ForgeBpmMilliseconds={destroy,stop:()=>{resetTap();}};
  fromBpm();
})();
