(function(){
  'use strict';
  const root=document.getElementById('poly-app');
  const $=id=>root.querySelector('#'+id);
  const palette=['#ed7587','#74ddac','#83a7ff','#f7bd75','#b9a0f5','#7cded9','#f4d99d','#99c9fc'];
  const audio=new window.PolyAudio();
  let divisors=[3,4],bpm=96,running=false,epoch=performance.now()/1000,raf=null;
  let muted=[false,false,false,false,false,false,false,false];
  const canvas=$('vis'),ctx=canvas.getContext('2d');
  function populateVoices(){
    const box=$('voices');box.replaceChildren();
    divisors.forEach((n,i)=>{
      const btn=document.createElement('button');btn.type='button';btn.className='voice-button'+(muted[i]?' muted':'');btn.style.setProperty('--lane-color',palette[i]);btn.setAttribute('aria-pressed',muted[i]?'true':'false');
      const left=document.createElement('span');left.className='voice-name';const dot=document.createElement('span');dot.className='voice-dot';const name=document.createElement('span');name.textContent=`${n} hits`;left.append(dot,name);
      const right=document.createElement('span');right.className='voice-right';right.textContent=muted[i]?'MUTED':`VOICE ${i+1}`;btn.append(left,right);
      btn.addEventListener('click',()=>{muted[i]=!muted[i];audio.setMuted(i,muted[i]);populateVoices();});box.append(btn);
    });
    $('pattern-label').textContent=divisors.join(' : ');$('lane-count').textContent=divisors.length+' VOICES';
  }
  function configure(){
    divisors=$('preset').value.split(',').map(Number);bpm=Number($('bpm').value);$('bpm-value').textContent=bpm+' BPM';
    if(running){audio.setPattern(divisors,bpm);}
    epoch=performance.now()/1000;populateVoices();draw();
  }
  $('preset').addEventListener('change',configure);$('bpm').addEventListener('input',configure);
  $('master').addEventListener('input',()=>{let v=Number($('master').value);$('master-value').textContent=v+'%';audio.setVolume(v/100);});
  $('tone').addEventListener('input',()=>{const v=Number($('tone').value);audio.setTone(v/100);$('tone-value').textContent=v<33?'Mellow':v<65?'Soft FM':'Bright FM';});
  $('reverb').addEventListener('input',()=>{const v=Number($('reverb').value);audio.setReverb(v/100);$('reverb-value').textContent=v+'%';});
  function status(value){$('status').textContent=value;$('status').classList.toggle('live',value==='PLAYING');}
  $('play').addEventListener('click',async()=>{
    if(running)return;
    try{audio.setPattern(divisors,bpm);audio.setVolume(Number($('master').value)/100);audio.setTone(Number($('tone').value)/100);audio.setReverb(Number($('reverb').value)/100);muted.forEach((m,i)=>audio.setMuted(i,m));await audio.start();running=true;status('PLAYING');draw();}
    catch(error){status('AUDIO UNAVAILABLE');console.error(error);}
  });
  function stop(){audio.stop();running=false;if(raf!==null){cancelAnimationFrame(raf);raf=null;}status('READY');draw();}
  $('stop').addEventListener('click',stop);
  function scaleCanvas(){const r=canvas.getBoundingClientRect(),dpr=Math.min(2,window.devicePixelRatio||1);const W=Math.round(r.width*dpr),H=Math.round(r.height*dpr);if(canvas.width!==W||canvas.height!==H){canvas.width=W;canvas.height=H;}ctx.setTransform(dpr,0,0,dpr,0,0);return {w:r.width,h:r.height};}
  function rounded(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r);}
  function draw(){
    const {w,h}=scaleCanvas();if(w<1||h<1)return;
    ctx.clearRect(0,0,w,h);
    const ground=h-40,apex=Math.max(42,h*.2),m= w<440?20:44,usable=w-m*2,N=divisors.length;
    const ballRadius=Math.max(11,Math.min(23,usable/(N*4.5)));
    const cycle=4*60/bpm;
    const now=audio.getAudioTime();const elapsed=running && now!==null?now-audio.startTime:0;
    const cyclePhase=((elapsed/cycle)%1+1)%1;
    ctx.strokeStyle='rgba(156,185,218,.16)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(m,ground+.5);ctx.lineTo(w-m,ground+.5);ctx.stroke();
    for(let i=0;i<N;i++){
      const x=m+(i+.5)*usable/N,n=divisors[i],interval=cycle/n;
      const local=running&&elapsed>=0?((elapsed%interval)+interval)%interval/interval:0;
      const u=local<=.5?2*local:2*(1-local);
      const heightFactor=1-(1-u)*(1-u);
      const y=ground-ballRadius-(ground-ballRadius-apex)*heightFactor;
      const color=palette[i],isMuted=muted[i];
      ctx.strokeStyle='rgba(154,183,221,.075)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,apex-8);ctx.lineTo(x,ground);ctx.stroke();
      const impact=running&&elapsed>=0?Math.exp(-((elapsed%interval)+interval)%interval*18):0;
      if(impact>.06&&!isMuted){ctx.strokeStyle=color;ctx.globalAlpha=impact*.75;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,ground+1,ballRadius+20*(1-impact),3+8*(1-impact),0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
      ctx.globalAlpha=isMuted?.28:1;
      const glow=ctx.createRadialGradient(x,y,1,x,y,ballRadius*2.4);glow.addColorStop(0,color+'70');glow.addColorStop(1,'transparent');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,y,ballRadius*2.4,0,Math.PI*2);ctx.fill();
      const ball=ctx.createRadialGradient(x-ballRadius*.35,y-ballRadius*.4,1,x,y,ballRadius);ball.addColorStop(0,'#f4f7ff');ball.addColorStop(.2,color);ball.addColorStop(1,color+'bb');ctx.fillStyle=ball;ctx.beginPath();ctx.arc(x,y,ballRadius,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
      ctx.textAlign='center';ctx.font='700 13px Inter,system-ui';ctx.fillStyle=isMuted?'#6c829b':'#c8d5e9';ctx.fillText(String(n),x,h-13);
    }
    // One coherent progress indicator, unobtrusive and synchronized to audio clock.
    const barX=m,barW=w-m*2;ctx.fillStyle='rgba(142,164,194,.13)';rounded(barX,18,barW,2,1);ctx.fill();
    ctx.fillStyle='rgba(139,183,250,.85)';rounded(barX,18,Math.max(1,barW*cyclePhase),2,1);ctx.fill();
    if(running && raf===null)raf=requestAnimationFrame(()=>{raf=null;draw();});
  }
  const resize=typeof ResizeObserver!=='undefined'?new ResizeObserver(()=>draw()):null;
  if(resize)resize.observe(canvas);else window.addEventListener('resize',draw);
  function destroy(){stop();if(resize)resize.disconnect();else window.removeEventListener('resize',draw);audio.destroy();window.removeEventListener('pagehide',stop);if(raf!==null)cancelAnimationFrame(raf);}
  window.ForgePolyrhythm={stop,destroy};window.addEventListener('pagehide',stop);
  configure();
})();
