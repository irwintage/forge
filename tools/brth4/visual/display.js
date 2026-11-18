(function(){'use strict';
const CURVE=[[0,1],[0,0],[1,0],[1,1],[0,1]];
function position(dot,phase,p){const a=CURVE[phase],b=CURVE[phase+1];let x=a[0]+(b[0]-a[0])*p,y=a[1]+(b[1]-a[1])*p;dot.style.left=(x*100)+'%';dot.style.top=(y*100)+'%';}
window.BreathDisplay={position};
})();
