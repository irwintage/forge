/* Forge instrument host: single iframe, owned by Forge, destroyed when leaving the view. */
const ForgeToolHost = (() => {
  const frame = document.getElementById('instrumentFrame');
  const host = document.getElementById('instrumentFrameHost');
  const title = document.getElementById('instrumentName');
  const category = document.getElementById('instrumentCategory');
  let selected = null;
  // Same-origin instrument frames may scroll internally. Make any native
  // scrollbars unobtrusive rather than overlaying a light scrollbar on the UI.
  // Match Forge's restrained green scrollbars across same-origin tools.
  // No scroll suppression: tools with tall layouts must remain navigable.
  function skinInstrument(doc) {
    if (!doc || !doc.head || doc.getElementById('forge-embedded-scroll-style')) return;
    const style = doc.createElement('style');
    style.id = 'forge-embedded-scroll-style';
    style.textContent = `
      :root { color-scheme: dark; }
      html,body { scrollbar-width:thin!important; scrollbar-color:#496959 #101a15!important; }
      * { scrollbar-width:thin; scrollbar-color:#496959 transparent; }
      ::-webkit-scrollbar { width:7px; height:7px; }
      ::-webkit-scrollbar-track { background:#101a15; }
      ::-webkit-scrollbar-thumb { background:#496959; border:1px solid #101a15; border-radius:20px; }
      ::-webkit-scrollbar-thumb:hover { background:#78ac87; }
    `;
    doc.head.appendChild(style);
  }
  function skinProblemTool(doc, id) {
    // These pages ship with a transparent/unstyled document background.
    // Set only the outer page background, not their components or palette.
    const affected = new Set(['nodes','tap-tempo','frequency-note','bpm-milliseconds']);
    if (!affected.has(id) || !doc?.head || doc.getElementById('forge-instrument-background')) return;
    const style = doc.createElement('style');
    style.id = 'forge-instrument-background';
    style.textContent = `html,body{background:#0b1411!important;color-scheme:dark!important;min-height:100%;}`;
    doc.head.appendChild(style);
  }
  function applyEmbeddedPresentation() {
    try {
      const doc = frame.contentDocument;
      if (!doc) return;
      skinInstrument(doc);
      skinProblemTool(doc, selected);
      // pixelTone is a multi-page tool: preserve its own Bloom/Warp tabs.
      // Its wrapper should not add another large margin inside Forge.
      if (selected === 'pixeltone') {
        const style = doc.createElement('style');
        style.textContent = 'body{padding:10px 12px 18px!important;}';
        doc.head.appendChild(style);
      }
      const applyNested = () => {
        doc.querySelectorAll('iframe').forEach(child => {
          try { skinInstrument(child.contentDocument); } catch (_) {}
        });
      };
      applyNested();
      doc.querySelectorAll('iframe').forEach(child => child.addEventListener('load', applyNested));
    } catch (_) { /* isolated/cross-origin content remains untouched */ }
  }
  frame.addEventListener('load', applyEmbeddedPresentation);

  function find(id){return FORGE_INSTRUMENTS.find(t=>t.id===id) || null;}
  function currentId(){
    const match=location.hash.match(/^#instrument\/([a-z0-9-]+)$/);
    return match ? match[1] : null;
  }
  function close(){
    if(frame.getAttribute('src')) frame.removeAttribute('src');
    selected=null;
    host.classList.remove('is-loaded');
  }
  function open(id){
    const tool=find(id);
    if(!tool){close();return false;}
    if(selected!==id || !frame.getAttribute('src')){
      close();
      frame.title=tool.name+' — Chrysasynth Forge';
      frame.setAttribute('src','./'+tool.path);
      selected=id;
    }
    title.textContent=tool.name;
    category.textContent=tool.category;
    host.classList.add('is-loaded');
    return true;
  }
  document.getElementById('instrumentBack').addEventListener('click',()=>{location.hash='#tools';});
  document.getElementById('instrumentReload').addEventListener('click',()=>{
    if(!selected)return;
    const id=selected;close();open(id);
  });
  window.addEventListener('pagehide',close);
  return {open,close,currentId,find};
})();
