
/* ============================================================
   CHRYSASYNTH FORGE — forge.js
   ============================================================ */

/* ── NAV SCROLL ── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── NAV BURGER ── */
const burger = document.getElementById('navBurger');
const mobileMenu = document.getElementById('navMobile');
burger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
document.addEventListener('click', (e) => {
  if (!nav.contains(e.target)) mobileMenu.classList.remove('open');
});

/* ── SCROLL REVEAL ── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(el => {
    if (el.isIntersecting) {
      el.target.classList.add('visible');
      revealObserver.unobserve(el.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── PARTICLE CANVAS (hero background) ── */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }

  function Particle() {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.r = Math.random() * 1.2 + 0.3;
    this.vx = (Math.random() - 0.5) * 0.18;
    this.vy = (Math.random() - 0.5) * 0.18;
    this.alpha = Math.random() * 0.5 + 0.1;
    this.hue = Math.random() > 0.6 ? 210 : (Math.random() > 0.5 ? 270 : 160);
  }

  function init() {
    resize();
    particles = Array.from({ length: 80 }, () => new Particle());
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 70%, 70%, ${p.alpha})`;
      ctx.fill();
    });
    // draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(77,157,224,${0.06 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });
  init();
  draw();
})();

/* ── CATEGORY CARDS → FILTER ── */
document.querySelectorAll('.cat-card[data-filter]').forEach(card => {
  card.addEventListener('click', (e) => {
    e.preventDefault();
    const cat = card.getAttribute('data-filter');
    document.getElementById('tools').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => activateFilter(cat), 500);
  });
});

/* ── FOOTER FILTER LINKS ── */
document.querySelectorAll('.footer-filter').forEach(a => {
  a.addEventListener('click', (e) => {
    e.preventDefault();
    const cat = a.getAttribute('data-filter-link');
    document.getElementById('tools').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => activateFilter(cat), 500);
  });
});

/* ── TOOL EXPLORER ── */
const TOOLS = [
  { name:"Chrysasynth Studio", url:"https://free-studio.chrysasynth.com/", category:"Creative", desc:"A creative music studio in your browser", isNew:true },
  { name:"SUBDIVE", url:"https://chrysasynth.com/subdive-melodic-systems", category:"Creative", desc:"Seed-driven melodic systems", isNew:true },
  { name:"Axis", url:"https://chrysasynth.com/axis", category:"Creative", desc:"Organic acid basslines" },
  { name:"Nodes", url:"https://chrysasynth.com/nodes", category:"Creative", desc:"Design custom arpeggio patterns" },
  { name:"Mystic Drums", url:"https://chrysasynth.com/mystic-drums", category:"Creative", desc:"A web-based drum machine", isNew:true },
  { name:"Aura Sampler", url:"https://chrysasynth.com/aura-sampler", category:"Creative", desc:"A sampler for textured, evolving sounds" },
  { name:"Duality Synth", url:"https://chrysasynth.com/duality-synth", category:"Creative", desc:"A morphing arpeggio synth" },
  { name:"pixelTone Bloom", url:"https://chrysasynth.com/pixeltone-bloom", category:"Creative", desc:"Turn photos into soft textures" },
  { name:"Etheremin", url:"https://chrysasynth.com/etheremin", category:"Creative", desc:"A webcam-controlled theremin" },
  { name:"Shepard", url:"https://chrysasynth.com/shepard", category:"Creative", desc:"Endless rising tones" },
  { name:"Ethereal Stretch", url:"https://chrysasynth.com/ethereal-stretch", category:"Creative", desc:"Create time-stretched soundscapes" },
  { name:"Climax", url:"https://chrysasynth.com/climax", category:"Creative", desc:"Automatic risers and builds" },
  { name:"Fibonacci Melody Generator", url:"https://chrysasynth.com/fibonacci-melody-generator", category:"Creative", desc:"Generate melodies from Fibonacci" },
  { name:"Chord Progression Generator", url:"https://chrysasynth.com/chord-progression-generator", category:"Creative", desc:"Emotion-based chord progressions" },
  { name:"Noise Generator", url:"https://chrysasynth.com/online-noise-generator-or-white-pink-and-brown-noise", category:"Creative", desc:"White, pink, and brown noise" },
  { name:"Polyrhythm Bouncer", url:"https://chrysasynth.com/polyrhythm-bouncer", category:"Creative", desc:"Bouncing polyrhythmic patterns" },
  { name:"Polyrhythm Kaleido Looper", url:"https://chrysasynth.com/polyrhythm-kaleido-looper", category:"Creative", desc:"Kaleidoscopic rhythmic loops" },
  { name:"PolyShape", url:"https://chrysasynth.com/polyshape", category:"Creative", desc:"Turn shapes into rhythms" },
  { name:"Granular Pad", url:"https://chrysasynth.com/granular-pad", category:"Creative", desc:"Evolving granular textures" },
  { name:"NeuroFlow Brainwave Generator", url:"https://chrysasynth.com/neuroflow-brainwave-generator", category:"Wellness", desc:"Alpha, beta, and theta waves" },
  { name:"Hold The Frequency", url:"https://chrysasynth.com/hold-the-frequency", category:"Wellness", desc:"A seven-chakra tone ritual" },
  { name:"Sphère Natale", url:"https://chrysasynth.com/sphere-natale", category:"Wellness", desc:"Your birth date as a planetary tone", isNew:true },
  { name:"MindShift", url:"https://chrysasynth.com/mindshift", category:"Wellness", desc:"Five creative states of mind" },
  { name:"ZenBox", url:"https://chrysasynth.com/zenbox-app", category:"Wellness", desc:"A breathing meditation cube" },
  { name:"Cosmic Garden", url:"https://chrysasynth.com/cosmic-garden", category:"Wellness", desc:"An interactive ambient space" },
  { name:"Binaural Beats Generator", url:"https://chrysasynth.com/binaural-beats-generator", category:"Wellness", desc:"Binaural tones for focus and sleep" },
  { name:"Chakra Frequency Generator", url:"https://chrysasynth.com/hold-the-frequency", category:"Wellness", desc:"Seven chakra frequencies" },
  { name:"5th Essence Multi-FX", url:"https://chrysasynth.com/5th-essence-multi-fx", category:"FX", desc:"An all-in-one creative FX unit" },
  { name:"pixelTone Warp", url:"https://chrysasynth.com/pixeltone-warp", category:"FX", desc:"Turn photos into glitch textures" },
  { name:"Reverb", url:"https://chrysasynth.com/reverb", category:"FX", desc:"Deep, spacious ambience" },
  { name:"Flanger / Chorus", url:"https://chrysasynth.com/flangerchorus", category:"FX", desc:"Wide, moving modulation" },
  { name:"Delay", url:"https://chrysasynth.com/delay", category:"FX", desc:"Tempo-synced echoes" },
  { name:"Orbit Pan", url:"https://chrysasynth.com/orbit-pan", category:"FX", desc:"360° orbital panning" },
  { name:"Soft Glue Compressor", url:"https://chrysasynth.com/soft-glue-compressor", category:"FX", desc:"Warm glue for your mix bus" },
  { name:"Mastering Tools", url:"https://chrysasynth.com/master", category:"Utility", desc:"Loudness tools for streaming" },
  { name:"Mic Clean", url:"https://chrysasynth.com/mic-clean", category:"Utility", desc:"Clean up and prepare vocals" },
  { name:"TrimRitual", url:"https://chrysasynth.com/trimritual", category:"Utility", desc:"Quickly trim audio files" },
  { name:"3-Band EQ", url:"https://chrysasynth.com/3-band-eq", category:"Utility", desc:"Simple tone shaping" },
  { name:"BPM Tapper", url:"https://chrysasynth.com/bpm-tapper", category:"Utility", desc:"Tap to find the tempo" },
  { name:"Frequency to Note Converter", url:"https://chrysasynth.com/frequency-to-note-converter", category:"Utility", desc:"Convert frequencies into notes" },
  { name:"BPM to Milliseconds Calculator", url:"https://chrysasynth.com/bpm-to-milliseconds-delay-calculator", category:"Utility", desc:"Calculate delay times from BPM" }
];

const CAT_COLORS = {
  Creative: { color: '#4d9de0', bg: 'rgba(77,157,224,0.1)' },
  Wellness: { color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
  FX:       { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  Utility:  { color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' }
};

let currentFilter = 'all';
let currentQuery = '';

function buildToolCard(tool) {
  const cc = CAT_COLORS[tool.category] || CAT_COLORS.Creative;
  const newTag = tool.isNew ? '<span class="tool-new">New</span>' : '';
  return `
<a href="${tool.url}" class="tool-card" style="--tc:${cc.color}" target="_blank">
  ${newTag}
  <div class="tool-cat">${tool.category}</div>
  <div class="tool-name">${tool.name}</div>
  <div class="tool-desc">${tool.desc}</div>
  <div class="tool-go">Open →</div>
</a>`;
}

function renderTools() {
  const grid = document.getElementById('toolsGrid');
  const empty = document.getElementById('toolsEmpty');
  if (!grid) return;

  let list = currentFilter === 'all' ? TOOLS : TOOLS.filter(t => t.category === currentFilter);
  if (currentQuery) {
    const q = currentQuery.toLowerCase();
    list = list.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.desc.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  }

  if (list.length === 0) {
    grid.innerHTML = '';
    empty.classList.add('visible');
  } else {
    grid.innerHTML = list.map(buildToolCard).join('');
    empty.classList.remove('visible');
  }
}

function activateFilter(cat) {
  currentFilter = cat;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cat === cat);
  });
  renderTools();
}

// Filter buttons
document.getElementById('filterBar')?.addEventListener('click', e => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  activateFilter(btn.dataset.cat);
});

// Search
document.getElementById('expSearch')?.addEventListener('input', e => {
  currentQuery = e.target.value.trim();
  renderTools();
});

renderTools();

/* ══════════════════════════════════════════════
   DRUM MACHINE
══════════════════════════════════════════════ */
['touchstart','pointerdown','mousedown','keydown'].forEach(ev => {
  window.addEventListener(ev, async function unlockOnce() {
    try { await Tone.start(); } catch(e) {}
    window.removeEventListener(ev, unlockOnce);
  }, { once: true, passive: true });
});

const TRACKS = [
  { id:'kick',  name:'Kick',      url:'kick.wav' },
  { id:'snare', name:'Snare',     url:'snare.wav' },
  { id:'hh_cl', name:'HH Closed', url:'hh-closed.wav' },
  { id:'hh_op', name:'HH Open',   url:'hh-open.wav' }
];

const MACRO_SOURCES = {
  chordA: 'chordA.wav',
  chordB: 'chordB.wav',
  bass:   'bass.wav'
};

const PRESETS = {
  techno124: { tempo:124, swing:8, pat: {
    kick:  [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
    snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
    hh_cl: [0,1,0,1,0,1,1,1,0,1,0,1,0,1,1,1],
    hh_op: [0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0]
  }},
  idm110: { tempo:110, swing:16, pat: {
    kick:  [1,0,0,1,0,0,0,0,0,1,0,0,1,0,1,0],
    snare: Array(16).fill(0),
    hh_cl: [1,0,1,0,1,1,0,1,0,1,0,1,1,0,1,1],
    hh_op: [0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0]
  }},
  minimalKickHH: { tempo:122, swing:10, pat: {
    kick:  [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
    snare: Array(16).fill(0),
    hh_cl: [0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0],
    hh_op: [0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0]
  }}
};

const STEPS = 16;
const pattern = {};
TRACKS.forEach(t => pattern[t.id] = Array(STEPS).fill(0));

const players = {};
const gains = {};
const limiter = typeof Tone !== 'undefined' ? new Tone.Limiter(-1).toDestination() : null;

let seqStep = 0;

const macroState = { chordA:false, chordB:false, bass:false };
const macroPlayers = {};
let macroGains = {};

async function setupPlayers() {
  if (!limiter) return;

  macroGains.chord = new Tone.Gain(0.75).connect(limiter);
  macroGains.bass  = new Tone.Gain(0.80).connect(limiter);

  for (const tr of TRACKS) {
    const g = new Tone.Gain(0.9).connect(limiter);
    const p = new Tone.Player(tr.url).connect(g);
    players[tr.id] = p;
    gains[tr.id] = g;
  }

  macroPlayers.chordA = new Tone.Player(MACRO_SOURCES.chordA).connect(macroGains.chord);
  macroPlayers.chordB = new Tone.Player(MACRO_SOURCES.chordB).connect(macroGains.chord);
  macroPlayers.bass   = new Tone.Player(MACRO_SOURCES.bass).connect(macroGains.bass);
}

function triggerChord(which, time) {
  try {
    macroPlayers.chordA?.stop(time);
    macroPlayers.chordB?.stop(time);
  } catch(e) {}

  macroPlayers[which]?.start(time);
}

function triggerBass(time) {
  try {
    macroPlayers.bass?.stop(time);
  } catch(e) {}

  macroPlayers.bass?.start(time);
}

function setupTransport() {
  if (typeof Tone === 'undefined') return;

  Tone.Transport.cancel();

  Tone.Transport.bpm.value = +document.getElementById('cs-tempo').value;
  Tone.Transport.swing = +document.getElementById('cs-swing').value / 100;
  Tone.Transport.swingSubdivision = '8n';

  seqStep = 0;

  Tone.Transport.scheduleRepeat(time => {
    document.querySelectorAll('.cs-cell').forEach(c => {
      c.classList.toggle('cs-hl', +c.dataset.col === seqStep);
    });

    document.querySelectorAll('.cs-mobile-step').forEach(s => {
      s.classList.toggle('is-playhead', +s.dataset.mobileCol === seqStep);
    });

    for (const tr of TRACKS) {
      if (pattern[tr.id][seqStep] && players[tr.id]?.buffer?.loaded) {
        players[tr.id].start(time);
      }
    }

    if (seqStep === 0) {
      if (macroState.bass) triggerBass(time);
      if (macroState.chordA) triggerChord('chordA', time);
    }

    if (seqStep === 8 && macroState.chordB) {
      triggerChord('chordB', time);
    }

    seqStep = (seqStep + 1) % STEPS;
  }, '16n');
}

function renderGrid() {
  const grid = document.getElementById('cs-grid');
  if (!grid) return;

  grid.innerHTML = '';
  grid.appendChild(document.createElement('div'));

  for (let i = 1; i <= STEPS; i++) {
    const h = document.createElement('div');
    h.className = 'cs-nums';
    h.textContent = i;
    grid.appendChild(h);
  }

  for (const tr of TRACKS) {
    const lab = document.createElement('div');
    lab.className = 'cs-lab';
    lab.textContent = tr.name;
    grid.appendChild(lab);

    for (let c = 0; c < STEPS; c++) {
      const cell = document.createElement('div');
      cell.className = 'cs-cell';
      cell.dataset.track = tr.id;
      cell.dataset.col = c;

      cell.addEventListener('click', () => {
        pattern[tr.id][c] ^= 1;
        cell.classList.toggle('cs-on', !!pattern[tr.id][c]);
        renderMobilePattern();
      });

      grid.appendChild(cell);
    }
  }
}

function renderMobilePattern() {
  const grid = document.getElementById('cs-mobile-pattern');
  if (!grid) return;

  const rows = [
    { id:'kick', label:'Kick' },
    { id:'snare', label:'Snare' },
    { id:'hh_cl', label:'Hat' }
  ];

  grid.innerHTML = '';

  rows.forEach(row => {
    const label = document.createElement('div');
    label.className = 'cs-mobile-label';
    label.textContent = row.label;
    grid.appendChild(label);

    for (let i = 0; i < STEPS; i++) {
      const step = document.createElement('div');
      step.className = 'cs-mobile-step';
      step.dataset.mobileTrack = row.id;
      step.dataset.mobileCol = i;
      step.classList.toggle('is-on', !!pattern[row.id][i]);

      step.addEventListener('click', () => {
        pattern[row.id][i] ^= 1;
        step.classList.toggle('is-on', !!pattern[row.id][i]);

        const desktopCell = document.querySelector(
          `.cs-cell[data-track="${row.id}"][data-col="${i}"]`
        );

        desktopCell?.classList.toggle('cs-on', !!pattern[row.id][i]);
      });

      grid.appendChild(step);
    }
  });
}

function loadPreset(key) {
  const p = PRESETS[key];
  if (!p) return;

  document.getElementById('cs-tempo').value = p.tempo;
  document.getElementById('cs-tempoVal').textContent = p.tempo;

  document.getElementById('cs-swing').value = p.swing;
  document.getElementById('cs-swingVal').textContent = p.swing;

  const mobilePreset = document.getElementById('cs-mobile-preset');
  if (mobilePreset) mobilePreset.value = key;

  for (const tr of TRACKS) {
    pattern[tr.id] = p.pat[tr.id] || Array(STEPS).fill(0);
  }

  document.querySelectorAll('.cs-cell').forEach(c => {
    c.classList.toggle('cs-on', !!pattern[c.dataset.track][+c.dataset.col]);
  });

  renderMobilePattern();
}

renderGrid();
loadPreset('idm110');
renderMobilePattern();

async function toggleDrumPlayback(sourceBtn) {
  if (typeof Tone === 'undefined') {
    console.error('Tone.js is not loaded');
    return;
  }

  const desktopBtn = document.getElementById('cs-playBtn');
  const mobileBtn = document.getElementById('cs-mobile-playBtn');
  const mobileLabel = mobileBtn?.querySelector('span:last-child');

  try {
    if (sourceBtn) sourceBtn.textContent = 'Loading...';

    await Tone.start();

    if (Object.keys(players).length === 0) {
      await setupPlayers();
      await Tone.loaded();
    }

    if (Tone.Transport.state === 'started') {
      Tone.Transport.stop();
      Tone.Transport.cancel();

      if (desktopBtn) desktopBtn.textContent = 'Play';

      if (mobileBtn) {
        mobileBtn.classList.remove('is-playing');
        if (mobileLabel) mobileLabel.textContent = 'Play';
      }

      document.querySelectorAll('.cs-cell').forEach(c => c.classList.remove('cs-hl'));
      document.querySelectorAll('.cs-mobile-step').forEach(s => s.classList.remove('is-playhead'));
    } else {
      setupTransport();
      Tone.Transport.start('+0.05');

      if (desktopBtn) desktopBtn.textContent = 'Stop';

      if (mobileBtn) {
        mobileBtn.classList.add('is-playing');
        if (mobileLabel) mobileLabel.textContent = 'Stop';
      }
    }
  } catch (err) {
    console.error('Drum machine audio error:', err);

    if (desktopBtn) desktopBtn.textContent = 'Play';

    if (mobileBtn) {
      mobileBtn.classList.remove('is-playing');
      if (mobileLabel) mobileLabel.textContent = 'Play';
    }
  }
}

document.getElementById('cs-playBtn')?.addEventListener('click', e => {
  toggleDrumPlayback(e.currentTarget);
});

document.getElementById('cs-mobile-playBtn')?.addEventListener('click', e => {
  toggleDrumPlayback(e.currentTarget);
});

document.getElementById('cs-loadPreset')?.addEventListener('click', () => {
  loadPreset(document.getElementById('cs-preset').value);
});

document.getElementById('cs-mobile-loadPreset')?.addEventListener('click', () => {
  const value = document.getElementById('cs-mobile-preset').value;

  const desktopPreset = document.getElementById('cs-preset');
  if (desktopPreset) desktopPreset.value = value;

  loadPreset(value);
});

document.getElementById('cs-mobile-preset')?.addEventListener('change', e => {
  const desktopPreset = document.getElementById('cs-preset');
  if (desktopPreset) desktopPreset.value = e.target.value;
  loadPreset(e.target.value);
});

document.getElementById('cs-tempo')?.addEventListener('input', e => {
  const v = +e.target.value;
  document.getElementById('cs-tempoVal').textContent = v;

  if (typeof Tone !== 'undefined') {
    Tone.Transport.bpm.value = v;
  }
});

document.getElementById('cs-swing')?.addEventListener('input', e => {
  const v = +e.target.value;
  document.getElementById('cs-swingVal').textContent = v;

  if (typeof Tone !== 'undefined') {
    Tone.Transport.swing = v / 100;
  }
});

document.querySelectorAll('.cs-fader input').forEach(inp => {
  inp.addEventListener('input', e => {
    const id = e.target.dataset.track;

    if (gains[id]) {
      gains[id].gain.value = +e.target.value;
    }
  });
});

document.getElementById('cs-gain-chord')?.addEventListener('input', e => {
  if (macroGains.chord) {
    macroGains.chord.gain.value = +e.target.value;
  }
});

document.getElementById('cs-gain-bass')?.addEventListener('input', e => {
  if (macroGains.bass) {
    macroGains.bass.gain.value = +e.target.value;
  }
});

document.querySelectorAll('.cs-pad').forEach(btn => {
  btn.addEventListener('click', async () => {
    if (typeof Tone === 'undefined') return;

    await Tone.start();

    if (!macroPlayers.chordA) {
      await setupPlayers();
      await Tone.loaded();
    }

    const key = btn.dataset.macro;

    if (key === 'chordA' || key === 'chordB') {
      macroState.chordA = key === 'chordA' ? !macroState.chordA : false;
      macroState.chordB = key === 'chordB' ? !macroState.chordB : false;

      document.querySelector('[data-macro="chordA"]')?.classList.toggle('is-on', macroState.chordA);
      document.querySelector('[data-macro="chordB"]')?.classList.toggle('is-on', macroState.chordB);
    }

    if (key === 'bass') {
      macroState.bass = !macroState.bass;
      btn.classList.toggle('is-on', macroState.bass);
    }
  });
});
