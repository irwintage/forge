/* Forge V12: isolated native Knot workspace. No iframe or second sidebar. */
(() => {
  const mount = document.getElementById('knotMount');
  const toolsToggle = document.getElementById('toolsToggle');
  const toolsSubmenu = document.getElementById('toolsSubmenu');
  let loaded=false, loading=null, disposer=null;
  const asset = 'tools/knot/';
  const categoryRoutes=['creative','wellness','fx','utility'];
  const toggleTools = (open) => {toolsSubmenu.hidden=!open;toolsToggle.setAttribute('aria-expanded',String(open));};
  toggleTools(categoryRoutes.includes(location.hash.slice(1)));
  toolsToggle.addEventListener('click',()=>toggleTools(toolsSubmenu.hidden));
  window.addEventListener('hashchange',()=>{if(categoryRoutes.includes(location.hash.slice(1)))toggleTools(true);});
  async function text(path){const res=await fetch(asset+path);if(!res.ok)throw new Error(path+' HTTP '+res.status);return res.text();}
  async function initialize(){
    if(loaded||loading)return loading;
    loading=(async()=>{
      const [markup,style,overrides,master,recorder,scales,app]=await Promise.all([
        text('index.html'),text('styles.css'),text('forge-v03.css'),text('audio/master.js'),text('audio/recorder.js'),text('music/scales.js'),text('knot-embedded-app.js')]);
      const doc=new DOMParser().parseFromString(markup,'text/html');
      const host=document.createElement('knot-instrument');
      const shadow=host.attachShadow({mode:'open'});
      const styleNode=document.createElement('style');
      styleNode.textContent=(style+'\n'+overrides).replaceAll(':root{',':host{')+ `
        :host{display:block;height:100%;min-height:0;--bg:#07110c;color:#edf8ec;font-family:'DM Sans',sans-serif;color-scheme:dark}
        .backdrop{display:none!important}
         .app{max-width:none!important;width:100%;height:100%!important;min-height:0!important;padding:4px!important;gap:7px!important;box-sizing:border-box;overflow:hidden!important}
        .top.glass{flex-shrink:0;min-height:72px;padding:9px 14px;gap:12px;flex-wrap:nowrap}
        .brand{min-width:175px}.brand img{width:55px}
         .main{flex:1 1 0!important;min-height:0!important;gap:8px!important;overflow:hidden!important;display:grid!important;grid-template-rows:minmax(0,1.12fr) minmax(0,.91fr) minmax(156px,.85fr)!important}
         .sound-grid{min-height:0!important;height:100%!important;flex:none!important;gap:8px}
         .lower-grid{min-height:0!important;height:100%!important;flex:none!important;gap:8px}
         .keyboard-panel{min-height:0!important;height:100%!important;flex:none!important}
         .panel{padding:11px 13px;min-height:0!important}
        .panel.glass{background:linear-gradient(145deg,rgba(12,29,22,.95),rgba(5,15,12,.92));}
        .wave-canvas,.small-canvas{min-height:32px}
        footer{flex-shrink:0}
        @media(max-width:1150px){.main{display:flex!important;overflow:visible!important}.sound-grid{height:auto!important;grid-template-columns:repeat(2,minmax(0,1fr));flex:none!important}.lower-grid{height:auto!important;grid-template-columns:repeat(2,minmax(0,1fr));flex:none!important}.panel{min-height:190px!important}.top{flex-wrap:wrap!important}.keyboard-panel{height:auto!important;min-height:235px!important}.app{height:auto!important;overflow:visible!important}.main{overflow:visible!important}}
        @media(max-width:960px){
          :host{height:auto!important;min-height:0!important}
          .app{height:auto!important;min-height:0!important;overflow:visible!important;padding:6px!important;gap:10px!important}
          .main{display:flex!important;flex-direction:column!important;height:auto!important;overflow:visible!important;gap:10px!important}
          .sound-grid,.lower-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;height:auto!important;min-height:0!important;gap:10px!important}
          .panel{height:auto!important;min-height:210px!important;padding:13px!important;overflow:hidden!important}
          .wave-canvas,.small-canvas{height:95px!important;min-height:65px!important;flex:1 1 auto!important}
          .keyboard-panel{height:auto!important;min-height:260px!important}
          .keyboard-content{min-height:125px!important;grid-template-columns:1fr!important}
          .piano-container{min-height:120px!important}
          .top.glass{height:auto!important;min-height:0!important;flex-wrap:wrap!important;gap:10px!important}
          .head-actions{flex-wrap:wrap!important;justify-content:flex-start!important}
          .preset-head{min-width:180px!important;max-width:none!important}
          .mod-body{grid-template-columns:1fr!important}
          .mod-right{display:flex!important;padding:0!important;border:0!important}
        }
        @media(max-width:620px){
          .sound-grid,.lower-grid{grid-template-columns:1fr!important}
          .brand{min-width:0!important}
          .top.glass{padding:12px!important}
          .head-actions{width:100%!important;flex:1 1 100%!important}
          .preset-head{flex:1 1 100%!important;order:3!important}
          .panel{min-height:190px!important}
          .keyboard-head{flex-wrap:wrap!important;gap:8px!important}
          .keyboard-controls{margin-left:0!important;flex-wrap:wrap!important;width:100%!important;justify-content:flex-start!important}
          .keyboard-panel{min-height:0!important}
          .computer-key{min-width:0!important}
          .knobs.four{gap:5px!important}
          .master input{width:80px!important}
          .output-strip{flex-wrap:wrap!important}
        }
      `;
      shadow.append(styleNode);
      const content=document.createElement('div');content.innerHTML=doc.querySelector('.app')?.outerHTML+'\n'+[...doc.querySelectorAll('.modal-layer,#toast')].map(n=>n.outerHTML).join('\n');
      content.querySelectorAll('[src]').forEach(el=>{let s=el.getAttribute('src');if(s&&!/^(https?:|data:|\/)/.test(s))el.setAttribute('src',asset+s)});
      while(content.firstChild)shadow.append(content.firstChild);
      mount.replaceChildren(host);
      const controller=new AbortController();
      const onWindow=(type,fn,opts)=>window.addEventListener(type,(ev)=>{if(document.getElementById('view-knot').classList.contains('is-active'))fn(ev)}, {...opts,signal:controller.signal});
      const fn=new Function('root','controller','onWindow',master+'\n'+recorder+'\n'+scales+'\n'+app);
      disposer=fn(shadow,controller,onWindow);
      loaded=true;
    })().catch(err=>{mount.textContent='Unable to load Knot: '+err.message+' (Check the browser console and the tools/knot/ path; use a local HTTP server)';console.error(err);}).finally(()=>{loading=null});
    return loading;
  }
  window.addEventListener('forge:route',e=>{if(e.detail.route==='knot'){initialize();}else if(loaded){ // keep synth mounted, release notes when hidden
      // Audio is stopped on navigation to avoid stuck notes and background playback.
      Promise.resolve(disposer?.()).finally(()=>{loaded=false;disposer=null;mount.replaceChildren();});
    }
  });
  const menuButton=document.getElementById('menuBtn');
  const menuHome=document.createComment('Forge menu button original position');
  menuButton.parentNode.insertBefore(menuHome,menuButton);
  const sidebar=document.getElementById('sidebar');
  function updateKnotChrome(){
    const knot=location.hash.replace('#','')==='knot';
    document.body.classList.toggle('forge-knot-active',knot);
    if(knot && window.innerWidth > 960){if(menuButton.parentElement!==sidebar)sidebar.append(menuButton);}
    else if(menuButton.parentElement===sidebar)menuHome.parentNode.insertBefore(menuButton,menuHome.nextSibling);
    if(loaded&&knot)requestAnimationFrame(()=>mount.querySelector('knot-instrument')?.shadowRoot?.querySelector('.app')?.dispatchEvent(new Event('resize')));
  }
  window.addEventListener('hashchange',updateKnotChrome);
  window.addEventListener('resize',updateKnotChrome);
  updateKnotChrome();
  if(location.hash==='#knot')initialize();
})();
