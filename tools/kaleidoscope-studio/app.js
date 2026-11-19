(()=>{
  const COLORS=['#b38bfc','#67caff','#ffb968','#74e3bc'];
  const SOUNDS=['Kick','Snare','Hat','Tom','Clap','Shaker','Rim','Bell','Pluck'];
  const $=id=>document.getElementById(id);
  const canvas=$('rings'),ctx=canvas.getContext('2d');
  const engine=new window.PolyPercussionEngine();
  const settings=[
    {sound:'Kick',pitch:48,decay:36,tone:32,level:78,mute:false},
    {sound:'Snare',pitch:50,decay:28,tone:64,level:65,mute:false},
    {sound:'Hat',pitch:58,decay:17,tone:76,level:56,mute:false},
    {sound:'Tom',pitch:45,decay:43,tone:45,level:70,mute:false}
  ];
  let divisors=[3,4,5,7], steps=divisors.map(d=>Array(d).fill(true));
  let playing=false,bpm=96,startTime=0,lookaheadTimer=null,raf=0;
  let size=0,dpr=1,hitRegions=[];
  const secPerCycle=()=>240/bpm;
  const hasBeat=(i,n)=>steps[i]&&steps[i][n];

  function makeCard(i){
    const v=settings[i],el=document.createElement('div');el.className='voice-card';el.style.setProperty('--voice',COLORS[i]);
    el.innerHTML=`<div class="voice-head"><span class="number">0${i+1}</span><div class="voice-name"><strong>Voice ${i+1}</strong><span id="ratio${i}">÷ ${divisors[i]} · ${divisors[i]} hits</span></div><button class="mute" id="mute${i}" type="button">Mute</button></div>
      <select id="sound${i}" class="sound-select" aria-label="Sound for voice ${i+1}">${SOUNDS.map(s=>`<option value="${s}">${s}</option>`).join('')}</select>
      ${[['pitch','Pitch'],['decay','Decay'],['tone','Tone'],['level','Level']].map(([k,l])=>`<label class="param"><span class="param-label"><span>${l}</span><output id="${k}Val${i}">${v[k]}</output></span><input type="range" id="${k}${i}" min="0" max="100" value="${v[k]}" aria-label="${l} for voice ${i+1}"></label>`).join('')}
      <div class="voice-actions"><button id="test${i}" type="button">▶ Listen</button><button id="fill${i}" type="button">All steps</button></div>`;
    $('voiceGrid').appendChild(el);$('sound'+i).value=v.sound;
    $('sound'+i).addEventListener('change',e=>{v.sound=e.target.value;});
    for(const k of ['pitch','decay','tone','level'])$(''+k+i).addEventListener('input',e=>{v[k]=+e.target.value;$(k+'Val'+i).textContent=v[k];});
    $('mute'+i).addEventListener('click',()=>{v.mute=!v.mute;const b=$('mute'+i);b.classList.toggle('muted',v.mute);b.textContent=v.mute?'Unmute':'Mute';});
    $('test'+i).addEventListener('click',async()=>{try{await engine.init();engine.trigger(i,v,engine.ctx.currentTime+.025);}catch(e){$('status').textContent='Audio unavailable';}});
    $('fill'+i).addEventListener('click',()=>{steps[i].fill(true);});
  }
  settings.forEach((v,i)=>makeCard(i));
  function setPreset(){
    divisors=$('preset').value.split(',').map(Number);steps=divisors.map(d=>Array(d).fill(true));
    divisors.forEach((d,i)=>{$('ratio'+i).textContent=`÷ ${d} · ${d} hits`;});
    $('cycleLabel').textContent=divisors.join(' / ');restartPhase();
  }
  function restartPhase(){if(!playing)return;engine.silence();startTime=engine.ctx.currentTime+.065;cursors=[0,0,0,0];}
  // Schedule individual events with a moving cursor, rather than entire cycles at once.
  let cursors=[0,0,0,0];
  function schedulePrecise(){
    if(!playing||!engine.ctx)return;
    const now=engine.ctx.currentTime,horizon=now+.17,dur=secPerCycle();
    divisors.forEach((d,i)=>{
      const interval=dur/d;
      while(startTime+cursors[i]*interval<horizon){
        const at=startTime+cursors[i]*interval;
        if(at>now+.002 && hasBeat(i,cursors[i]%d))engine.trigger(i,settings[i],at);
        cursors[i]++;
      }
    });
  }
  async function play(){
    if(playing)return;
    try{await engine.init();}catch(err){$('status').textContent='Audio unavailable';return;}
    playing=true;startTime=engine.ctx.currentTime+.08;cursors=[0,0,0,0];
    $('play').textContent='▶ Playing';$('play').classList.add('isplaying');$('status').textContent='Playing';
    if(lookaheadTimer)clearInterval(lookaheadTimer);
    schedulePrecise();lookaheadTimer=setInterval(schedulePrecise,24);
  }
  function stop(){playing=false;if(lookaheadTimer)clearInterval(lookaheadTimer);lookaheadTimer=null;engine.silence();$('play').textContent='▶ Play';$('play').classList.remove('isplaying');$('status').textContent='Ready';}
  $('play').addEventListener('click',play);$('stop').addEventListener('click',stop);
  $('preset').addEventListener('change',setPreset);
  $('bpm').addEventListener('input',e=>{bpm=+e.target.value;$('bpmValue').textContent=bpm;restartPhase();});
  $('master').addEventListener('input',e=>{$('masterValue').textContent=e.target.value+'%';engine.setMaster(+e.target.value/100);});
  $('resetPattern').addEventListener('click',()=>{steps.forEach(s=>s.fill(true));});
  $('random').addEventListener('click',()=>{steps=divisors.map((d,i)=>Array.from({length:d},(_,j)=>j===0||Math.random()>(i===2?.42:.29)));});
  function resize(){const rect=canvas.getBoundingClientRect();dpr=Math.min(2,window.devicePixelRatio||1);const w=Math.round(rect.width*dpr),h=Math.round(rect.height*dpr);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;ctx.setTransform(dpr,0,0,dpr,0,0);}size=Math.min(rect.width,rect.height);}
  function draw(){raf=requestAnimationFrame(draw);resize();const w=canvas.clientWidth,h=canvas.clientHeight,cx=w/2,cy=h/2;ctx.clearRect(0,0,w,h);
    const time=playing&&engine.ctx?Math.max(0,engine.ctx.currentTime-startTime):0;const duration=secPerCycle();const cyc=(time/duration)%1;const baseRadius=Math.min(w,h)*.39;const space=Math.min(49,size*.071);hitRegions=[];
    // neutral polar grid
    ctx.strokeStyle='rgba(205,227,255,.045)';ctx.lineWidth=1;
    for(let k=0;k<12;k++){const a=2*Math.PI*k/12-Math.PI/2;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a)*baseRadius*1.16,cy+Math.sin(a)*baseRadius*1.16);ctx.stroke();}
    divisors.forEach((d,i)=>{
      const radius=baseRadius-i*space,color=COLORS[i];
      ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.strokeStyle='rgba(180,202,226,.15)';ctx.lineWidth=1.5;ctx.stroke();
      for(let j=0;j<d;j++){
        const a=2*Math.PI*j/d-Math.PI/2,x=cx+radius*Math.cos(a),y=cy+radius*Math.sin(a),on=hasBeat(i,j);
        const stepPosition=cyc*d;const distance=Math.min(Math.abs(stepPosition-j),d-Math.abs(stepPosition-j));
        const impact=playing&&distance<.09;
        ctx.beginPath();ctx.arc(x,y,impact?9:7,0,2*Math.PI);
        ctx.fillStyle=on?color:'#283341';ctx.globalAlpha=on?1:.88;ctx.fill();ctx.globalAlpha=1;
        if(impact&&on){ctx.beginPath();ctx.arc(x,y,16,0,2*Math.PI);ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.stroke();}
        hitRegions.push({x,y,r:16,i,j});
      }
      const theta=cyc*2*Math.PI-Math.PI/2;
      const tx=cx+radius*Math.cos(theta),ty=cy+radius*Math.sin(theta);
      ctx.beginPath();ctx.arc(tx,ty,4,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();
      ctx.beginPath();ctx.arc(tx,ty,10,0,Math.PI*2);ctx.strokeStyle=color;ctx.globalAlpha=.42;ctx.stroke();ctx.globalAlpha=1;
    });
    ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#e9f1ff';ctx.font=`700 ${Math.max(21,size*.055)}px Inter,system-ui,sans-serif`;ctx.fillText(divisors.join(' : '),cx,cy-10);
    ctx.font='11px Inter,system-ui,sans-serif';ctx.fillStyle='#8496ad';ctx.fillText(playing?'PLAYING':'READY',cx,cy+19);
  }
  canvas.addEventListener('pointerdown',e=>{
    const r=canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
    let best=null,dist=Infinity;for(const point of hitRegions){const dd=Math.hypot(point.x-x,point.y-y);if(dd<point.r&&dd<dist){best=point;dist=dd;}}
    if(best)steps[best.i][best.j]=!steps[best.i][best.j];
  });
  window.addEventListener('resize',resize);window.addEventListener('pagehide',stop);
  setPreset();draw();
  window.KaleidoscopeForge={stop,destroy(){stop();cancelAnimationFrame(raf);window.removeEventListener('resize',resize);engine.destroy();}};
})();
