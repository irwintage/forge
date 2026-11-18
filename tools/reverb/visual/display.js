(function(){
'use strict';
function create(canvas,meters){
 const ctx=canvas.getContext('2d');let W=0,H=0,dpr=1,phase=0,raf=0,last=0;
 let state={decay:2,damping:50,diffusion:65,predelay:15,mix:30};let analyser=null;
 const data=new Float32Array(1024);
 function resize(){const rect=canvas.getBoundingClientRect();W=Math.max(1,rect.width);H=Math.max(1,rect.height);dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
 new ResizeObserver(resize).observe(canvas);resize();
 function draw(t){const dt=Math.min(.05,(t-last)/1000||0);last=t;phase+=dt;
 ctx.clearRect(0,0,W,H);ctx.fillStyle='#0d151e';ctx.fillRect(0,0,W,H);
 const x0=24,x1=W-22,y0=H*.77,yTop=H*.20,span=x1-x0;
 ctx.strokeStyle='rgba(214,188,151,.09)';ctx.lineWidth=1;
 for(let j=0;j<5;j++){const y=yTop+(y0-yTop)*j/4;ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x1,y);ctx.stroke()}
 const end=Math.max(.9,state.decay*1.4),start=state.predelay/1000;
 const grad=ctx.createLinearGradient(x0,0,x1,0);grad.addColorStop(0,'rgba(228,204,166,.25)');grad.addColorStop(.65,'rgba(180,161,139,.1)');grad.addColorStop(1,'rgba(180,161,139,0)');
 ctx.beginPath();ctx.moveTo(x0,y0);
 for(let i=0;i<=230;i++){let u=i/230,sec=u*end;let env=sec<start?0:Math.exp(-6.9*(sec-start)/state.decay);let er=(sec>start&&sec<start+.16)?Math.sin((sec-start)*96)**2*.13:0;let value=Math.min(1,env*(.87+er));let px=x0+u*span,py=y0-value*(y0-yTop);ctx.lineTo(px,py)}
 ctx.lineTo(x1,y0);ctx.closePath();ctx.fillStyle=grad;ctx.fill();
 ctx.beginPath();for(let i=0;i<=230;i++){let u=i/230,sec=u*end;let env=sec<start?0:Math.exp(-6.9*(sec-start)/state.decay);let ripple=.035*Math.sin(u*(45+state.diffusion*.4)+phase*2)*Math.exp(-u*3)*(state.diffusion/100);let value=Math.max(0,env+ripple*env);let px=x0+u*span,py=y0-value*(y0-yTop);i?ctx.lineTo(px,py):ctx.moveTo(px,py)}
 ctx.strokeStyle='#dbc49e';ctx.lineWidth=1.7;ctx.stroke();
 ctx.setLineDash([3,5]);ctx.strokeStyle='rgba(204,192,171,.28)';ctx.beginPath();const preX=x0+span*start/end;ctx.moveTo(preX,yTop-9);ctx.lineTo(preX,y0);ctx.stroke();ctx.setLineDash([]);
 ctx.font='10px system-ui';ctx.fillStyle='#7a8a9b';ctx.fillText('0',x0,H-19);ctx.textAlign='right';ctx.fillText(end.toFixed(1)+'s',x1,H-19);ctx.textAlign='start';
 if(analyser){try{analyser.getFloatTimeDomainData(data);let l=0,r=0;for(let i=0;i<data.length;i++){const v=data[i];l+=v*v;if(i%2===0)r+=v*v}const rms=Math.sqrt(l/data.length);const value=Math.min(100,Math.round(100*Math.pow(rms*2,.65)));meters[0].style.width=value+'%';meters[1].style.width=value+'%'}catch{}}
 else{meters[0].style.width='0%';meters[1].style.width='0%'}
 raf=requestAnimationFrame(draw)}
 raf=requestAnimationFrame(draw);
 return{set(p){state={...state,...p}},setAnalyser(a){analyser=a},destroy(){cancelAnimationFrame(raf)}};
}
window.ReverbDisplay={create};
})();
