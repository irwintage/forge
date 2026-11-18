(function(){'use strict';
class EtherTracker{
constructor(video,onHands,onStatus){this.video=video;this.onHands=onHands;this.onStatus=onStatus;this.hands=null;this.stream=null;this.active=false;this.running=false;this.mirror=true;this.last=0;this.raf=0;}
async enableCamera(){if(this.stream)return; if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)throw Error('Camera unavailable: use HTTPS or localhost');this.stream=await navigator.mediaDevices.getUserMedia({video:{width:{ideal:1280},height:{ideal:720},facingMode:'user'},audio:false});this.video.srcObject=this.stream;await this.video.play();this.video.classList.add('active');this.onStatus('Camera ready');}
async start(){if(this.active)return;await this.enableCamera();if(!window.Hands)throw Error('MediaPipe unavailable: internet connection required');if(!this.hands){this.hands=new window.Hands({locateFile:f=>'https://cdn.jsdelivr.net/npm/@mediapipe/hands/'+f});this.hands.setOptions({maxNumHands:2,modelComplexity:1,minDetectionConfidence:.65,minTrackingConfidence:.65});this.hands.onResults(r=>{const landmarks=r.multiHandLandmarks||[], handed=r.multiHandedness||[];let found=landmarks.map((pts,i)=>{const tip=pts[8],wrist=pts[0],middle=pts[9];return {x:this.mirror?1-tip.x:tip.x,y:tip.y,stability:Math.abs(middle.x-wrist.x),label:handed[i]?.label||'Unknown',points:pts};});this.onHands(found);});}this.active=true;this.onStatus('Tracking active');this.loop();}
async loop(){if(this.running)return;this.running=true;while(this.active){try{if(this.video.readyState>=2){await this.hands.send({image:this.video});}}catch(err){this.onStatus('Tracking error: '+err.message);this.active=false;break;}await new Promise(resolve=>{this.raf=requestAnimationFrame(resolve);});}this.running=false;}
stop(){this.active=false;this.onHands([]);this.onStatus('Tracking off');}
close(){this.stop();if(this.stream){this.stream.getTracks().forEach(t=>t.stop());this.stream=null;}this.video.srcObject=null;this.video.classList.remove('active');if(this.hands){try{this.hands.close();}catch(e){}this.hands=null;}}
}
window.EtherTracker=EtherTracker;
})();
