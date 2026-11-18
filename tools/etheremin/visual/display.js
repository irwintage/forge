(function(){'use strict';
class EtherDisplay{
constructor(canvas,video){this.canvas=canvas;this.video=video;this.ctx=canvas.getContext('2d');this.hands=[];this.mirror=true;this.running=true;this.frame=this.frame.bind(this);this.resize();window.addEventListener('resize',()=>this.resize());requestAnimationFrame(this.frame);}
resize(){const r=this.canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.max(1,Math.round(r.width*d));this.canvas.height=Math.max(1,Math.round(r.height*d));this.ctx.setTransform(d,0,0,d,0,0);this.w=r.width;this.h=r.height;}
setHands(h){this.hands=h;}
frame(){if(!this.running)return;const c=this.ctx,w=this.w,h=this.h;c.clearRect(0,0,w,h);if(this.hands.length){for(const [i,p] of this.hands.entries()){const x=p.x*w,y=p.y*h;const isPitch=p.label==='Left';const role=isPitch?'PITCH':'EXPRESSION';const color=isPitch?'#c7bdff':'#92e2db';const grad=c.createRadialGradient(x,y,1,x,y,48);grad.addColorStop(0,isPitch?'#b3a4ff77':'#7fd9d177');grad.addColorStop(1,'#7a7aff00');c.fillStyle=grad;c.beginPath();c.arc(x,y,48,0,Math.PI*2);c.fill();c.strokeStyle=color;c.lineWidth=2;c.beginPath();c.arc(x,y,12,0,Math.PI*2);c.stroke();c.setLineDash([3,7]);c.strokeStyle='#ffffff55';c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();c.setLineDash([]);if(document.querySelector('#handMode')?.value==='two'){c.fillStyle='#111720d9';c.fillRect(Math.max(5,Math.min(w-86,x-38)),Math.max(8,y-36),85,20);c.font='bold 10px Inter, sans-serif';c.fillStyle=color;c.fillText(role,Math.max(10,Math.min(w-80,x-32)),Math.max(22,y-22));}}}requestAnimationFrame(this.frame);}
}
window.EtherDisplay=EtherDisplay;
})();
