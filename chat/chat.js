/* Forge Chat V19.9 - draggable companion + 37-tool knowledge + inline ratings and dedicated feedback view.
   Never sends chat text to a server. Ratings/feedback are sent only if an API is configured. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const drawer = $('forgeChatDrawer'), trigger = $('sidebarAccount'), collapsedTrigger = $('fcCollapsedTrigger');
  if (!drawer || !trigger) return;
  const footer = drawer.querySelector('.fc-footer');
  if (footer) footer.textContent = 'Tool guides · Creative ideas · Local FAQ';
  const config = window.FORGE_CHAT_CONFIG || {};
  // This empty default is intentional: no fake online submission.
  const api = typeof config.apiBase === 'string' ? config.apiBase.replace(/\/$/, '') : '';
  const turnstileSiteKey = typeof config.turnstileSiteKey === 'string' ? config.turnstileSiteKey.trim() : '';
  const submissionsReady = !!api && !!turnstileSiteKey;
  // One stable, random browser ID. Kept local and sent only when rating a tool.
  // Deleting browser storage / using another browser creates a new voter ID.
  const voterStorageKey = 'forge-companion-voter-id-v1';
  function getVoterId() {
    try {
      let id = localStorage.getItem(voterStorageKey);
      if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
        id = crypto.randomUUID();
        localStorage.setItem(voterStorageKey, id);
      }
      return id;
    } catch (_) {
      // Avoid silently generating a different ID on every submission.
      return null;
    }
  }
  const state = { open:false, current:null, selectedStars:0, faq:null, history:[], asked:[], lastFocus:null, request:0, manualPosition:null };
  const icon = (name) => `<i data-lucide="${name}"></i>`;
  const refreshIcons = () => { try { window.lucide?.createIcons({attrs: {'stroke-width': 1.8}}); } catch(_) {} };
  const normalize = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const tokens = s => new Set(normalize(s).split(/\s+/).filter(w => w.length >= 3));
  const stop = new Set(['the','and','for','can','how','what','does','with','from','this','that','dans','pour','avec','est','une','les','des','comment','quoi','quel','outil','tool','sur','mon','mes','plus','faire']);
  const currentTool = () => {
    const id = (location.hash.match(/^#instrument\/([a-z0-9-]+)/i) || [])[1];
    const list = Array.isArray(window.FORGE_INSTRUMENTS) ? window.FORGE_INSTRUMENTS : (typeof FORGE_INSTRUMENTS !== 'undefined' ? FORGE_INSTRUMENTS : []);
    return list.find(x => x.id === id) || null;
  };
  const idForRating = () => state.current?.id || null;
  const typing = $('fcTyping');
  if (typing) {
    typing.replaceChildren();
    for (let i=0; i<3; i++) {
      const dot=document.createElement('span'); dot.className='fc-typing-dot';
      dot.setAttribute('aria-hidden','true'); typing.append(dot);
    }
    typing.setAttribute('aria-label','Preparing a reply');
  }
  let replyTimer=null;

  // The SCROLLABLE element is .fc-chat-body, not #fcMessages.
  // Scroll only the conversation inside the floating panel, never Forge's page.
  const scrollTranscriptToLatest = (smooth = false) => {
    const viewport = $('fcMessages')?.closest('.fc-chat-body');
    if (!viewport) return;
    const move = () => {
      if (smooth && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
      } else {
        viewport.scrollTop = viewport.scrollHeight;
      }
    };
    move();
    window.requestAnimationFrame(move); // account for newly rendered bubble / typing indicator
  };

  // Keep chat text safe. Current instrument names are highlighted with DOM nodes,
  // not interpolated HTML, so the same treatment works for FAQ and visitor text.
  const addBubble = (who, message) => {
    const box = document.createElement('div'); box.className = `fc-message ${who}`;
    if (who === 'assistant') {
      const label = document.createElement('span'); label.className = 'fc-label'; label.textContent = 'Forge Companion'; box.append(label);
    }
    const toolName = who === 'assistant' ? state.current?.name : '';
    if (toolName && message.toLowerCase().includes(toolName.toLowerCase())) {
      const index = message.toLowerCase().indexOf(toolName.toLowerCase());
      box.append(document.createTextNode(message.slice(0, index)));
      const strong = document.createElement('span'); strong.className = 'fc-tool-emphasis';
      strong.textContent = message.slice(index, index + toolName.length); box.append(strong);
      box.append(document.createTextNode(message.slice(index + toolName.length)));
    } else box.append(document.createTextNode(message));
    $('fcMessages').append(box);
    scrollTranscriptToLatest(who === 'assistant' && state.history.length > 0);
    state.history.push({who, message});
    if (state.history.length > 50) state.history.shift();
  };
  const questionWords = s => [...tokens(s)].filter(t => !stop.has(t) && !new Set(['could','would','should','please','about','need','want','like','help','using','some','have','know','this','into','there']).has(t));
  // Exact article titles and known intents take priority. The fallback is a
  // conservative local matcher, not an AI, so unrelated questions don't get
  // a made-up tool explanation.
  function matches(query, item) {
    const nq=normalize(query), title=normalize(item.title);
    if (!nq || !title) return 0;
    if (nq === title) return 200;
    if (title.length>=14 && nq.includes(title)) return 80;
    const queryWords=new Set(questionWords(query));
    const titleWords=questionWords(item.title);
    let score=0;
    const common=titleWords.filter(t=>queryWords.has(t)).length;
    if (common) score += common * 6 + (common===titleWords.length ? 8 : 0);
    for (const keyword of item.keywords||[]) {
      const k=normalize(keyword);
      if (!k || k===title) continue;
      const ks=questionWords(k);
      if (ks.length>=2 && nq.includes(k)) score+=12;
      else if (ks.length===1 && queryWords.has(ks[0])) score+=3;
    }
    return score;
  }
  const toolSummary = info => {
    if (!state.current) return 'Forge is the Chrysasynth audio workspace. Browse All Tools for synths, sequencers, effects, textures and music utilities.';
    return info?.summary || `${state.current.name} is part of Forge. Choose a question below to explore its controls.`;
  };
  const toolArticle = (tool,type) => (tool?.faq||[]).find(x=>x.type===type);
  const findArticle = (list,query) => (list||[]).find(x=>normalize(x.title)===normalize(query));
  const findBest = (list,text) => (list||[]).map(x=>({item:x,score:matches(text,x)})).sort((a,b)=>b.score-a.score)[0];
  function answer(text) {
    const kb=state.faq;
    if (!kb) return 'The local guide is still loading. Please try again.';
    const tool=state.current ? kb.tools[state.current.id] : null;
    const local=tool?.faq||[], general=kb.general||[];
    const q=normalize(text);
    // First honor a clicked suggestion from the current tool. Exact global
    // knowledge titles are considered after contextual creative guidance.
    const exactLocal=findArticle(local,text);
    if (exactLocal) return exactLocal.answer;
    const toolName=normalize(state.current?.name);
    const namedTool=toolName && q.includes(toolName);
    const genericTool=/\b(this tool|this instrument|cet outil|cet instrument|it)\b/.test(q);
    const isOverview=/^(what is|whats|what s|what does|tell me about|explain|c est quoi|qu est ce que|que fait)\b/.test(q) && (namedTool || genericTool || (state.current?.id==='shepard' && q.includes('shepherd')));
    if (tool && (isOverview || /^(what is this tool|what is this instrument|what is it|tell me about this tool)$/.test(q))) {
      return toolSummary(tool);
    }
    const isStart=/^(how (do|can|should) i (start|begin|get started)|how (to|do you) (start|begin)|where (do|can|should) i (start|begin)|getting started|help me (start|begin|get started)|start here|start|comment (commencer|debuter)|par ou commencer|como (empiezo|empezar|comienzo)|por donde empiezo)\b/.test(q);
    if (tool && isStart) return toolArticle(tool,'start')?.answer || toolSummary(tool);
    const isCreative=/\b(creative idea|sound design idea|inspiration|inspire me|creative experiment|what can i create|what should i create|make something|idea for|idee creative|donne moi une idee|inspiracion|give me an idea)\b/.test(q) || /^suggest (a|some) (idea|sound|texture)/.test(q);
    const contextualBuild=tool && ['structura','climax','shepard'].includes(state.current?.id) && /\b(build tension|build up|buildup|before (a|the) drop)\b/.test(q);
    if (tool && (isCreative || contextualBuild)) return toolArticle(tool,'creative')?.answer || toolSummary(tool);
    // Record and export requests often have wording very different from the FAQ
    // title. Route these to a verified article rather than rejecting them.
    const recordingRequest=/\b(record|recording|capture|enregistrer|grabacion)\b/.test(q);
    const exportRequest=/\b(export|download|save (audio|wav)|render|telecharger|exportar)\b/.test(q);
    if (tool && (recordingRequest || exportRequest)) {
      const candidates=local.filter(x => /\b(record|recording|capture|export|wav|webm|save|download)\b/i.test(x.title));
      const preferred=candidates.find(x => recordingRequest ? /\b(record|recording|capture)\b/i.test(x.title) : /\b(export|wav|download|save)\b/i.test(x.title));
      if (preferred) return preferred.answer;
      if (candidates[0]) return candidates[0].answer;
    }
    const exactGeneral=findArticle(general,text);
    if (exactGeneral) return exactGeneral.answer;
    if (/^(what can (i|you) do|what can i do here|how can (you|i) use|how do i use this|help me|help|suggest( some)? questions|show me (some )?questions|que puis je faire|qu est ce que je peux faire)/.test(q)) {
      return tool ? (tool.capabilities || toolSummary(tool)) : 'Explore Forge instruments or ask a question about music, sound design, harmony, textures or rhythm. You can also choose a suggested question below.';
    }
    // Match general theory questions before tool-only questions when they are
    // explicit; this keeps 'What is Dorian?' from becoming an unrelated control tip.
    const generalMatch=findBest(general,text);
    const localMatch=findBest(local,text);
    if (generalMatch?.score>=14 && generalMatch.score >= (localMatch?.score||0)+5) return generalMatch.item.answer;
    if (localMatch?.score>=12) return localMatch.item.answer;
    if (generalMatch?.score>=13) return generalMatch.item.answer;
    if (tool) {
      // Honest, compact fallback. Do not claim knowledge of unavailable controls.
      return `I don't have a verified answer to that specific question yet for ${state.current.name}. Try one of the tool questions below, or use Feedback / Bug to suggest a topic.`;
    }
    return 'I can help you discover tools, understand common music concepts and find a starting point. Choose a suggested question below.';
  }
  function renderSuggestions() {
    const host=$('fcSuggestions'); host.replaceChildren();
    // Keep the suggestions docked beneath the scrollable transcript.
    if (!host.dataset.docked) {
      const dock=document.createElement('div'); dock.className='fc-suggestions-dock';
      const title=document.createElement('span'); title.className='fc-suggestions-title';
      title.textContent='SUGGESTED QUESTIONS';dock.append(title);
      host.parentElement.after(dock);dock.append(host);host.dataset.docked='1';
    }
    const kb=state.faq||{tools:{},general:[]};
    const tool=kb.tools[state.current?.id];
    const catalog=tool ? tool.faq.map(x=>x.title) : [
      'What is Forge?', 'Which tool should I use for ambient textures?',
      'Which tool should I use for a bassline?', 'How can I build tension in a track?',
      'What is the Dorian mode?', 'What is an arpeggio?'
    ];
    // Initial prompts: overview + first steps + creative idea. As the visitor
    // explores, rotate in feature-specific questions without repeating the one
    // they have just asked. Keeping all answers in the dock is overwhelming.
    const recent=new Set(state.asked.slice(-4).map(normalize));
    const unused=catalog.filter(t=>!recent.has(normalize(t)));
    const fallback=catalog.filter(t=>normalize(t)!==normalize(state.asked.at(-1)));
    const candidates=[...new Set([...unused,...fallback])].slice(0,3);
    for (const title of candidates) {
      const b=document.createElement('button');b.type='button';b.textContent=title;
      b.addEventListener('click',()=>ask(title));host.append(b);
    }
  }
  async function loadFAQ() {
    try {
      const r=await fetch('./chat/knowledge/faq.json',{cache:'no-cache'});
      if (!r.ok) throw new Error(`FAQ status ${r.status}`);
      state.faq=await r.json();
    } catch(e) {
      // Fallback for users previewing Forge by opening index.html directly (file://).
      // Browsers often block fetch() of adjacent JSON files in that mode.
      try {
        await new Promise((resolve,reject)=>{
          const script=document.createElement('script');
          script.src='./chat/knowledge/faq.bundle.js';
          script.onload=resolve; script.onerror=()=>reject(new Error('Local FAQ bundle not found'));
          document.head.append(script);
        });
        if (!window.FORGE_CHAT_FAQ) throw new Error('Local FAQ bundle is empty');
        state.faq=window.FORGE_CHAT_FAQ;
      } catch(fallbackError) {
        console.warn('Forge Chat FAQ unavailable:',e,fallbackError);
        state.faq={general:[],tools:{}};
      }
    }
    renderSuggestions();
  }
  function setContext(force=false) {
    const t=currentTool(); if (!force && (state.current?.id || null)===(t?.id || null)) return;
    state.current=t;
    state.selectedStars=0;
    $('fcRatingInfo').dataset.result='';$('fcFeedbackInfo').dataset.result='';
    closeFeedbackView(); // do not accidentally attach a draft to a different instrument
    const textArea=$('fcFeedbackText'); if (textArea) textArea.value='';
    const feedbackType=$('fcFeedbackType'); if (feedbackType) feedbackType.value='feedback';
    const label=$('fcRatingLabel'); if (label) label.textContent=t ? 'Rate ' + t.name : 'Rate this tool';
    const ratingWrap=$('fcRatingInline'); if (ratingWrap) ratingWrap.classList.toggle('fc-no-tool',!t);
    const feedbackContext=$('fcFeedbackContext'); if (feedbackContext) feedbackContext.textContent=t ? 'About ' + t.name : 'About Forge';
    const context=$('fcContext');context.replaceChildren();
    if(t){const name=document.createElement('span');name.className='fc-context-tool';name.textContent=t.name;context.append(name,document.createTextNode(` · ${t.category}`));}
    else context.textContent='Forge · General';
    $('fcInput').placeholder=t ? `Ask about ${t.name}...` : 'Ask about Forge...';
    if (replyTimer) { clearTimeout(replyTimer); replyTimer=null; }
    $('fcMessages').replaceChildren(); state.history=[]; state.asked=[]; $('fcTyping').hidden=true;
    const greeting=t
      ? `Welcome to ${t.name}. Explore its sound, discover its controls, or find some creative inspiration. Where would you like to start?`
      : 'Welcome to Forge. Discover creative audio tools, explore musical ideas, or choose a question below to get started.';
    addBubble('assistant',greeting);
    renderSuggestions(); updateRatingState();
  }
  function ask(text) {
    const clean=String(text||'').trim(); if (!clean) return;
    if (replyTimer) { clearTimeout(replyTimer); replyTimer=null; $('fcTyping').hidden=true; }
    addBubble('user',clean);
    $('fcInput').value='';
    $('fcTyping').hidden=false;
    scrollTranscriptToLatest(); // show the three-dot indicator without manual scrolling
    const reply=answer(clean);
    state.asked.push(clean);
    // Remove the answered article from subsequent suggestions even when the
    // visitor used their own phrasing instead of clicking an exact question.
    const found=(state.faq?.tools[state.current?.id]?.faq||[]).find(item=>item.answer===reply);
    if (found) state.asked.push(found.title);
    if (state.asked.length>24) state.asked.splice(0,state.asked.length-24);
    if (replyTimer) clearTimeout(replyTimer);
    replyTimer=window.setTimeout(()=>{ $('fcTyping').hidden=true; addBubble('assistant',reply); renderSuggestions(); scrollTranscriptToLatest(); replyTimer=null; },520);
  }
  function activeTrigger() {
    return (window.matchMedia('(min-width:961px)').matches && document.querySelector('.app')?.classList.contains('sidebar-collapsed')) ? collapsedTrigger : trigger;
  }
  // The floating panel can be moved without moving or resizing Forge's tool view.
  // Keep every edge on screen and remember the chosen position while Forge is open.
  const PANEL_MARGIN = 10;
  function setPanelPosition(left, top) {
    const w=drawer.offsetWidth, h=drawer.offsetHeight;
    const maxLeft=Math.max(PANEL_MARGIN,window.innerWidth-w-PANEL_MARGIN);
    const maxTop=Math.max(PANEL_MARGIN,window.innerHeight-h-PANEL_MARGIN);
    const pos={
      left:Math.round(Math.max(PANEL_MARGIN,Math.min(maxLeft,left))),
      top:Math.round(Math.max(PANEL_MARGIN,Math.min(maxTop,top)))
    };
    drawer.style.setProperty('--fc-pop-left',`${pos.left}px`);
    drawer.style.setProperty('--fc-pop-top',`${pos.top}px`);
    return pos;
  }
  function positionDrawer() {
    if (state.manualPosition) {
      state.manualPosition=setPanelPosition(state.manualPosition.left,state.manualPosition.top);
      return;
    }
    const source=activeTrigger(); if(!source)return;
    const r=source.getBoundingClientRect();
    const panelW=drawer.offsetWidth, panelH=drawer.offsetHeight;
    setPanelPosition(r.right-16,r.top-panelH-12);
  }

  // Pointer Events cover mouse, pen and touch. Only the header is a drag handle:
  // buttons, inputs and the conversation remain fully interactive.
  const dragHandle=drawer.querySelector('.fc-header');
  let drag=null;
  if(dragHandle){
    dragHandle.title='Drag to move chat · Double-click to reset position';
    dragHandle.addEventListener('pointerdown',e=>{
      if (!state.open || !e.isPrimary || e.button!==0 || e.target.closest('button,a,input,select,textarea')) return;
      const rect=drawer.getBoundingClientRect();
      drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,left:rect.left,top:rect.top,moved:false};
      dragHandle.setPointerCapture(e.pointerId);
      e.preventDefault();
    });
    dragHandle.addEventListener('pointermove',e=>{
      if (!drag || e.pointerId!==drag.id) return;
      const dx=e.clientX-drag.startX,dy=e.clientY-drag.startY;
      if (!drag.moved && Math.hypot(dx,dy)<4) return;
      drag.moved=true;
      drawer.classList.add('is-dragging');
      state.manualPosition=setPanelPosition(drag.left+dx,drag.top+dy);
      e.preventDefault();
    });
    const finishDrag=e=>{
      if(!drag || e.pointerId!==drag.id)return;
      drag=null;
      drawer.classList.remove('is-dragging');
      if(dragHandle.hasPointerCapture(e.pointerId))dragHandle.releasePointerCapture(e.pointerId);
    };
    dragHandle.addEventListener('pointerup',finishDrag);
    dragHandle.addEventListener('pointercancel',finishDrag);
    // Return to the familiar position over the sidebar when requested.
    dragHandle.addEventListener('dblclick',e=>{
      if(e.target.closest('button,a,input,select,textarea'))return;
      state.manualPosition=null;
      positionDrawer();
    });
  }
  function toggle(open) {
    state.open=!!open; drawer.classList.toggle('is-open',state.open); drawer.setAttribute('aria-hidden',String(!state.open));
    trigger.setAttribute('aria-expanded',String(state.open));
    collapsedTrigger?.setAttribute('aria-expanded',String(state.open));
    if(state.open)positionDrawer();
    if (state.open) { state.lastFocus=document.activeElement; setContext(); window.setTimeout(()=>{ $('fcInput').focus(); scrollTranscriptToLatest(); },180); }
    else { closeFeedbackView();state.lastFocus?.focus?.(); }
  }
  // Reuse the existing V19.4 HTML nodes, so updating ONLY chat/ works.
  // Move the feedback form into its own view, not into the conversation transcript.
  function buildReviewUI() {
    const extras=drawer.querySelector('.fc-extras');
    const originalRating=$('fcRating');
    const originalFeedback=$('fcFeedback');
    const stars=$('fcStars');
    const submit=$('fcRatingSubmit');
    const summary=$('fcRatingSummary');
    const info=$('fcRatingInfo');
    const feedbackButton=$('fcFeedbackOpen');feedbackButton.classList.add('fc-feedback-open');
    const inline=document.createElement('div');inline.className='fc-rating-inline';inline.id='fcRatingInline';
    const row=document.createElement('div');row.className='fc-rating-row';
    const title=document.createElement('span');title.className='fc-rating-label';title.id='fcRatingLabel';title.textContent='Rate this tool';
    row.append(title,stars,feedbackButton);inline.append(row);
    const confirmation=document.createElement('div');confirmation.className='fc-rating-confirm';confirmation.append(submit,info);
    inline.append(confirmation,summary);
    // Feedback stays available in Explore. Ratings are for the opened tool.
    extras.replaceChildren(inline);
    originalRating.remove();
    const view=document.createElement('section');view.className='fc-feedback-view';view.id='fcFeedbackView';view.hidden=true;
    const heading=document.createElement('div');heading.className='fc-feedback-head';
    const back=document.createElement('button');back.type='button';back.id='fcFeedbackBack';back.className='fc-feedback-back';back.setAttribute('aria-label','Back to conversation');back.textContent='←';
    const headingText=document.createElement('div');headingText.className='fc-feedback-heading';
    const h=document.createElement('strong');h.textContent='Feedback / Bug';
    const context=document.createElement('small');context.id='fcFeedbackContext';context.textContent='About Forge';
    headingText.append(h,context);heading.append(back,headingText);view.append(heading);
    originalFeedback.hidden=false;
    view.append(originalFeedback);
    const note=document.createElement('p');note.className='fc-feedback-privacy';note.textContent='Please avoid sharing sensitive information. Messages are treated as text, not executable code.';view.append(note);
    drawer.insertBefore(view,drawer.querySelector('.fc-chat-body'));
    return {back};
  }
  function closeFeedbackView() {
    drawer.classList.remove('fc-feedback-mode');
    const view=$('fcFeedbackView');if(view)view.hidden=true;
  }
  function openFeedbackView() {
    const view=$('fcFeedbackView');if(!view)return;
    drawer.classList.add('fc-feedback-mode');view.hidden=false;
    updateRatingState();
    window.requestAnimationFrame(()=>$('fcFeedbackText').focus());
  }
  function ratingButtons() {
    const stars=$('fcStars'); stars.replaceChildren();
    for(let n=1;n<=5;n++) {
      const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',`${n} of 5 stars`);
      b.setAttribute('aria-pressed','false');b.title=`${n} of 5 stars`;
      b.innerHTML=icon('star');
      b.addEventListener('click',()=>{$('fcRatingInfo').dataset.result='';state.selectedStars=state.selectedStars===n?0:n;updateRatingState();});stars.append(b);
    }
    refreshIcons();
  }
  function updateRatingState() {
    const stars=$('fcStars');
    [...stars.querySelectorAll('button')].forEach((b,i)=>{const selected=i<state.selectedStars;b.classList.toggle('chosen',selected);b.setAttribute('aria-pressed',String(selected));});
    const id=idForRating();
    const submit=$('fcRatingSubmit');
    submit.hidden=!state.selectedStars;
    submit.disabled=!submissionsReady || !id || !state.selectedStars;
    submit.textContent=state.selectedStars ? `Confirm ${state.selectedStars}/5` : 'Confirm rating';
    $('fcFeedbackSubmit').disabled=!submissionsReady;
    const info=$('fcRatingInfo');
    if (!submissionsReady && state.selectedStars) info.textContent='Preview only. Connect Cloudflare and Turnstile to send ratings.';
    else if (!state.selectedStars) info.textContent='';
    // Preserve explicit success/failure messages after clicking Confirm.
    else if (!info.dataset.result) info.textContent='Confirm to send your rating.';
    info.hidden=!info.textContent;
    const feedback=$('fcFeedbackInfo');
    if(!submissionsReady)feedback.textContent='Preview only. No message is sent until Cloudflare and Turnstile are configured.';
    else if(!feedback.dataset.result)feedback.textContent='Your message will be sent only when you click Send feedback.';
    const summary=$('fcRatingSummary');
    if(api && id) void fetchSummary();
    else {summary.textContent='';summary.hidden=true;}
  }
  async function fetchSummary() {
    const id=idForRating(), request=++state.request;
    try {
      const r=await fetch(`${api}/api/tools/${encodeURIComponent(id)}/ratings`,{headers:{Accept:'application/json'}});
      if (!r.ok) throw new Error('Rating service error');
      const data=await r.json();
      if(request!==state.request||id!==idForRating()) return;
      const summary=$('fcRatingSummary');
      summary.textContent=data.count ? `${Number(data.average).toFixed(1)} / 5 · ${Number(data.count)} ratings` : '';
      summary.hidden=!data.count;
    } catch(_) {const summary=$('fcRatingSummary');summary.textContent='';summary.hidden=true;}
  }
  // Turnstile is loaded only on a real submission. Cloudflare verifies the token
  // again in the Worker. file:// testing works for FAQ/UI but NOT for Turnstile.
  let turnstileScriptPromise=null;
  function loadTurnstile() {
    if(window.turnstile)return Promise.resolve();
    if(!turnstileScriptPromise)turnstileScriptPromise=new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.async=true;
      script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.onload=()=>window.turnstile?resolve():reject(new Error('Verification unavailable'));
      script.onerror=()=>reject(new Error('Could not load human verification'));
      document.head.append(script);
    }).catch(e=>{turnstileScriptPromise=null;throw e;});
    return turnstileScriptPromise;
  }
  async function getTurnstileToken(host) {
    await loadTurnstile();
    return new Promise((resolve,reject)=>{
      host.replaceChildren();
      let settled=false,widgetId=null;
      const done=(err,token)=>{
        if(settled)return;settled=true;
        if(widgetId!==null)try{window.turnstile.remove(widgetId);}catch(_){}
        host.replaceChildren();
        err?reject(err):resolve(token);
      };
      try {
        widgetId=window.turnstile.render(host,{
          sitekey:turnstileSiteKey,theme:'dark',size:'flexible',
          appearance:'interaction-only',execution:'execute',
          callback:token=>done(null,token),
          'error-callback':()=>{done(new Error('Verification failed'));return true;},
          'expired-callback':()=>done(new Error('Verification expired. Please retry.'))
        });
        if(widgetId===null||widgetId===undefined)throw new Error('Verification could not start');
        window.turnstile.execute(widgetId);
      }catch(e){done(e);}
    });
  }
  async function send(path,payload,button,feedback,verifyHost) {
    if(!submissionsReady)return;
    if(button.dataset.busy==='1')return;
    button.dataset.busy='1';button.disabled=true;
    const initial=button.textContent;
    const toolAtSend=idForRating();
    feedback.dataset.result='1';feedback.textContent='Verifying…';feedback.hidden=false;
    try {
      const token=await getTurnstileToken(verifyHost);
      feedback.textContent='Sending…';
      const response=await fetch(api+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...payload,turnstileToken:token})});
      if(!response.ok){const err=await response.json().catch(()=>({}));throw new Error(err.error||'Submission failed');}
      feedback.textContent='Received. Thank you!';
      if(path.endsWith('/ratings')){
        if(toolAtSend===idForRating()){state.selectedStars=0;await fetchSummary();}
      }else if(path==='/api/feedback' && toolAtSend===idForRating()) $('fcFeedbackText').value='';
    }catch(e){feedback.textContent='Could not submit: '+(e?.message||'Unknown error');}
    finally{button.textContent=initial;button.dataset.busy='0';updateRatingState();}
  }
  // Build controls once. No changes required in Forge V19.4's index.html.
  const reviewUI=buildReviewUI();
  const ratingChallenge=document.createElement('div');ratingChallenge.className='fc-turnstile-host';
  $('fcRatingInline').append(ratingChallenge);
  const feedbackChallenge=document.createElement('div');feedbackChallenge.className='fc-turnstile-host';
  $('fcFeedback').append(feedbackChallenge);
  trigger.addEventListener('click',()=>toggle(!state.open));
  collapsedTrigger?.addEventListener('click',()=>toggle(!state.open));
  window.addEventListener('resize',()=>{if(state.open)positionDrawer()});
  $('fcClose').addEventListener('click',()=>toggle(false));
  document.addEventListener('pointerdown',e=>{
    if(state.open && !drawer.contains(e.target) && !trigger.contains(e.target) && !collapsedTrigger?.contains(e.target)) toggle(false);
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&state.open) toggle(false);});
  $('fcForm').addEventListener('submit',e=>{e.preventDefault();ask($('fcInput').value);});
  $('fcFeedbackOpen').addEventListener('click',openFeedbackView);
  reviewUI.back.addEventListener('click',closeFeedbackView);
  $('fcRatingSubmit').addEventListener('click',()=>{
    const voterId = getVoterId();
    if (!voterId) {
      const info = $('fcRatingInfo');
      info.dataset.result='1';
      info.hidden=false;
      info.textContent='Browser storage unavailable. Enable local storage to rate this tool.';
      return;
    }
    $('fcRatingInfo').dataset.result='';
    send(`/api/tools/${encodeURIComponent(idForRating())}/ratings`,{stars:state.selectedStars,voterId},$('fcRatingSubmit'),$('fcRatingInfo'),ratingChallenge);
  });
  $('fcFeedbackSubmit').addEventListener('click',()=>{
    const message=$('fcFeedbackText').value.trim();
    if(message.length<8){$('fcFeedbackInfo').textContent='Please add at least 8 characters.';return;}
    $('fcFeedbackInfo').dataset.result='';
    send('/api/feedback',{toolId:idForRating(),type:$('fcFeedbackType').value,message},$('fcFeedbackSubmit'),$('fcFeedbackInfo'),feedbackChallenge);
  });
  window.addEventListener('hashchange',()=>setContext()); window.addEventListener('forge:route',()=>setContext());
  ratingButtons(); loadFAQ().then(()=>setContext(true));
})();
