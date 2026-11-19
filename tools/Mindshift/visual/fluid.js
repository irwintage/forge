/* Mindshift Fluid V3.4 — depth-focused luminous flow.
   Single Canvas visual, no independent full-screen mist layer.
   Staggered depth groups, restrained motion traces and an XY-induced field perturbation.
   Audio engine and presets remain unchanged. */
(()=>{'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const recipes={
 calm:{count:20,amp:.111,warp:5.4,detail:.042,drift:.66,spread:.94,hue:0,trail:.10,turb:.68},
 focus:{count:22,amp:.078,warp:7.4,detail:.027,drift:.88,spread:.87,hue:-8,trail:.075,turb:.5},
 dream:{count:23,amp:.147,warp:5.2,detail:.052,drift:.63,spread:1.03,hue:16,trail:.14,turb:.87},
 flow:{count:24,amp:.162,warp:6.5,detail:.061,drift:1.09,spread:1.06,hue:3,trail:.12,turb:1},
 ko:{count:24,amp:.137,warp:9.4,detail:.067,drift:1.45,spread:1,hue:64,trail:.045,turb:1.3}
};
let previous=document.createElement('canvas'),prevCtx=previous.getContext('2d',{alpha:false});
let clock=0,last=0,prevMode='';
function resizePrev(w,h){const W=Math.max(1,Math.round(w)),H=Math.max(1,Math.round(h));if(previous.width!==W||previous.height!==H){previous.width=W;previous.height=H;prevCtx.fillStyle='#070c1a';prevCtx.fillRect(0,0,W,H)}}
function render(ctx,w,h,{time=0,mode='calm',x=.5,y=.5,rms=0,playing=false,space=.25}={}){
 if(w<2||h<2)return;
 resizePrev(w,h);
 const p=recipes[mode]||recipes.calm;
 if(mode!==prevMode){prevCtx.fillStyle='#070c1a';prevCtx.fillRect(0,0,previous.width,previous.height);prevMode=mode;}
 const dt=Math.min(.045,Math.max(0,(time-last)/1000||.016));last=time;
 clock+=dt*p.drift*(playing?1:.94);
 const t=clock,energy=clamp(rms*2.7,0,.65),nx=(x-.5)*2,ny=(y-.5)*2;
 const dark='#070d1c';
 ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.shadowBlur=0;
 ctx.fillStyle=dark;ctx.fillRect(0,0,w,h);
 // A faint residual from the PREVIOUS clean frame creates continuity, not a bleached screen.
 ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=p.trail;
 ctx.drawImage(previous,0,0,w,h);ctx.restore();
 // Vary depth by both phase and width. One consistent wave field spans the whole canvas.
 const count=p.count;
 const place=(u,i,depth)=>{
   const of=(i-(count-1)*.5)/(count+1);
   const phase=t*.68+i*.28+of*8.6;
   const xx=u*2-1;
   const fundamental=Math.sin(xx*(p.warp+3.2*x)+phase);
   const secondary=Math.sin(xx*(11.5+8*y)-t*.54+of*6.3+i*.09);
   const tertiary=Math.cos(xx*(3.2+2.2*x)-t*.28+i*.43);
   const perspective=depth===0?1.10:depth===1?.96:.79;
   let yy=h*(.5+of*p.spread)+h*(p.amp*fundamental*(.78+Math.abs(of)*.71)+p.detail*secondary+.025*tertiary)*perspective*(1+energy*.18);
   // XY is part of the wave field: a smooth signed displacement localized at the cursor.
   const dx=u*w-x*w;
   const radius=w*(depth===2?.16:.21);
   const influence=Math.exp(-(dx*dx)/(2*radius*radius));
   const yDistance=clamp(Math.abs(yy-y*h)/(h*.52),0,1);
   const interaction=influence*(1-yDistance*.58)*p.turb;
   yy+=h*.066*interaction*(ny*.73+Math.sin((u-x)*Math.PI*2+t*.83+i*.20)*.20);
   return yy;
 };
 const hueFor=(i,depth)=>190+24*Math.sin(t*.13+i*.145)+x*35+p.hue+(depth===0?28:depth===2?-7:0);
 function trace(i,depth,strokeWidth,color,shadow){
   ctx.beginPath();
   const steps=145;
   for(let j=0;j<=steps;j++){const u=j/steps;const yy=place(u,i,depth);if(j)ctx.lineTo(u*w,yy);else ctx.moveTo(u*w,yy)}
   ctx.strokeStyle=color;ctx.lineWidth=strokeWidth;
   ctx.shadowColor=color;ctx.shadowBlur=shadow;
   ctx.stroke();ctx.shadowBlur=0;
 }
 // Atmospheric depth is created by the strands themselves, not a white translucent overlay.
 ctx.save();ctx.globalCompositeOperation='screen';
 for(let depth=0;depth<3;depth++){
   for(let i=0;i<count;i++){
     if(depth===0&&i%2!==0)continue;
     if(depth===2&&i%3!==0)continue;
     const off=Math.abs((i-(count-1)*.5)/(count+1));
     const center=1-clamp(off*1.3,0,.8);
     const hue=hueFor(i,depth);
     if(depth===0){
       trace(i,depth,10,`hsla(${hue},85%,48%,${.045+center*.045})`,11);
       trace(i,depth,1.35,`hsla(${hue},91%,65%,${.09+center*.07})`,3);
     }else if(depth===1){
       const strong=i%5===0;
       trace(i,depth,strong?10:6,`hsla(${hue},95%,56%,${.042+center*.037})`,12);
       trace(i,depth,strong?1.65:1.08,`hsla(${hue},98%,${65+5*y}%,${.17+center*.09})`,strong?8:4);
     }else{
       const strong=i%6===0;
       trace(i,depth,strong?7:3.5,`hsla(${hue},96%,62%,${.045+center*.03})`,7);
       trace(i,depth,strong?1.95:1.25,`hsla(${hue},100%,${73+5*y}%,${.28+center*.1})`,strong?12:5);
     }
   }
 }
 ctx.restore();
 // An optional faint localized light at XY arises only from the active flow's energy.
 const px=x*w,py=y*h;
 const glowRadius=Math.min(w,h)*(.12+.04*energy);
 ctx.save();ctx.globalCompositeOperation='screen';
 const light=ctx.createRadialGradient(px,py,2,px,py,glowRadius);
 light.addColorStop(0,`rgba(87,193,255,${.045+energy*.045})`);
 light.addColorStop(.38,'rgba(64,134,222,.022)');light.addColorStop(1,'rgba(64,134,222,0)');
 ctx.fillStyle=light;ctx.fillRect(px-glowRadius,py-glowRadius,2*glowRadius,2*glowRadius);ctx.restore();
 // Thin XY marker: anchored to the fluid disturbance, not a detached orb.
 ctx.save();ctx.globalCompositeOperation='source-over';
 ctx.beginPath();ctx.arc(px,py,3.4,0,Math.PI*2);ctx.fillStyle='#e6f7ff';ctx.shadowColor='#8fd9ff';ctx.shadowBlur=10;ctx.fill();
 ctx.shadowBlur=0;ctx.beginPath();ctx.arc(px,py,9.5,0,Math.PI*2);ctx.strokeStyle='rgba(160,218,252,.48)';ctx.lineWidth=.9;ctx.stroke();ctx.restore();
 // Save only a very darkened clean version for the subsequent frame.
 prevCtx.globalCompositeOperation='source-over';prevCtx.globalAlpha=1;
 prevCtx.fillStyle=dark;prevCtx.fillRect(0,0,previous.width,previous.height);
 prevCtx.globalAlpha=.53;prevCtx.drawImage(ctx.canvas,0,0,previous.width,previous.height);prevCtx.globalAlpha=1;
}
function destroy(){previous.width=1;previous.height=1;clock=0;last=0;prevMode='';}
window.MindshiftFluid={render,destroy};
})();
