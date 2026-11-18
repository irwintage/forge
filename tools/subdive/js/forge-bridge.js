
/* Minimal Forge integration bridge. Does not change sound processing. */
(()=>{
 const name=JSON.parse(document.getElementById('forgeToolMeta').textContent).name;
 const post=(type,extra={})=>{try{parent.postMessage({forge:true,type,tool:name,...extra},'*')}catch(e){}};
 window.addEventListener('message',e=>{
   const d=e.data||{}; if(!d.forge)return;
   if(d.type==='FORGE_PING')post('FORGE_READY');
   if(d.type==='FORGE_STOP') {
     try { const b=[...document.querySelectorAll('button,[role="button"]')].find(x=>/^(stop|stop audio|stop playback|stop all)$/i.test((x.textContent||'').trim()));if(b)b.click(); }catch(e){}
   }
 });
 const sendSize=()=>post('FORGE_RESIZE',{height:Math.ceil(document.documentElement.scrollHeight)});
 window.addEventListener('load',()=>{post('FORGE_READY');sendSize()});
 if('ResizeObserver' in window)new ResizeObserver(sendSize).observe(document.body);
})();
