/* Chrysasynth Forge bridge: visibility, stop, resize, readiness. */
(() => {
  const tool = 'Sphère Natale';
  const post=(type, extra={})=>{try{window.parent.postMessage({forge:true,tool,type,...extra},'*')}catch(e){}};
  const stop=()=>{document.getElementById('btn-stop')?.click();};
  window.addEventListener('message', event => {
    if(event.source !== window.parent) return;
    const d=event.data || {};
    if(!d.forge) return;
    if(d.type==='FORGE_PING') post('FORGE_READY');
    if(d.type==='FORGE_STOP') stop();
  });
  window.addEventListener('pagehide',stop);
  const resize=()=>post('FORGE_RESIZE',{height:Math.ceil(document.documentElement.scrollHeight)});
  window.addEventListener('load',()=>{post('FORGE_READY');resize();});
  if('ResizeObserver' in window)new ResizeObserver(resize).observe(document.body);
})();
