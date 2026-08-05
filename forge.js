/* ============================================================
   CHRYSASYNTH FORGE — forge.js
   ============================================================ */

/* ── NAV SCROLL ── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });


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


/* ============================================================
   FORGE SEED — HERO ENGINE V1
   ============================================================ */

(function initForgeSeed() {
  const root = document.getElementById('forgeSeed');
const introState = document.getElementById('forgeSeedIntro');
const loadingState = document.getElementById('forgeSeedLoading');
const resultState = document.getElementById('forgeSeedResult');
const seedShell = document.querySelector('.hero-seed-shell');
const regenerateBtn = document.getElementById('forgeSeedRegenerate');
const seedModal =
  document.getElementById('forgeSeedModal');

const seedModalForm =
  document.getElementById('forgeSeedModalForm');

const seedEmailInput =
  document.getElementById('forgeSeedEmail');

const seedModalError =
  document.getElementById('forgeSeedModalError');
  if (!root) return;

  const generateBtn = document.getElementById('forgeSeedGenerate');
  const playBtn = document.getElementById('forgeSeedPlay');
  const keepBtn = document.getElementById('forgeSeedKeep');

  const waveform = document.getElementById('forgeSeedWaveform');
const waveCanvas =
  document.getElementById('forgeSeedWaveCanvas');

const waveCtx =
  waveCanvas?.getContext('2d');

let waveAnimationFrame = null;
let wavePhase = 0;
  const seedNameEl = document.getElementById('forgeSeedName');
  const seedTypeEl = document.getElementById('forgeSeedType');
  const seedKeyEl = document.getElementById('forgeSeedKey');
  const seedDurationEl = document.getElementById('forgeSeedDuration');

  const SEED_NAMES = [
    'Aurora',
    'Aether',
    'Solace',
    'Lumen',
    'Vesper',
    'Halo',
    'Nova',
    'Serein',
    'Eclipse',
    'Drift'
  ];

  /*
   * Première version volontairement limitée.
   * On privilégie la qualité et la simplicité avant
   * d’ajouter risers, whooshes et textures plus complexes.
   */
  const SEED_TYPES = [
  'Chord Bloom',
  'Subdive Sequence',
  'Nodes Arp',
  'PixelTone Fragment',
  'Ethereal Drift',
  'Axis Bassline'
];

const ROOTS = [
  { name: 'C', midi: 60 },
  { name: 'C#', midi: 61 },
  { name: 'D', midi: 62 },
  { name: 'D#', midi: 63 },
  { name: 'E', midi: 64 },
  { name: 'F', midi: 65 },
  { name: 'F#', midi: 66 },
  { name: 'G', midi: 67 },
  { name: 'G#', midi: 68 },
  { name: 'A', midi: 69 },
  { name: 'A#', midi: 70 },
  { name: 'B', midi: 71 }
];

const MODES = {
  Minor: [0, 2, 3, 5, 7, 8, 10],
  Major: [0, 2, 4, 5, 7, 9, 11],
  Dorian: [0, 2, 3, 5, 7, 9, 10],
  Mixolydian: [0, 2, 4, 5, 7, 9, 10],
  Phrygian: [0, 1, 3, 5, 7, 8, 10],
  Lydian: [0, 2, 4, 6, 7, 9, 11],
  HarmonicMinor: [0, 2, 3, 5, 7, 8, 11]
};

let currentSeed = null;
let audio = null;
let playbackTimer = null;
let isPlaying = false;
  /* ------------------------------------------------------------
     SEEDED RANDOM
     The same number always produces the same musical data.
     ------------------------------------------------------------ */

  function mulberry32(seed) {
    let value = seed >>> 0;

    return function seededRandom() {
      value += 0x6D2B79F5;

      let result = value;

      result = Math.imul(result ^ (result >>> 15), result | 1);
      result ^= result + Math.imul(result ^ (result >>> 7), result | 61);

      return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
    };
  }

  function randomSeedNumber() {
    if (window.crypto?.getRandomValues) {
      const values = new Uint32Array(1);
      window.crypto.getRandomValues(values);

      return 10000 + (values[0] % 90000);
    }

    return Math.floor(Math.random() * 90000) + 10000;
  }

  function pick(list, random) {
    return list[Math.floor(random() * list.length)];
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  /* ------------------------------------------------------------
     MUSICAL SEED
     ------------------------------------------------------------ */

  
    function createSeed(seedNumber = randomSeedNumber()) {
  const random = mulberry32(seedNumber);

  const root = pick(ROOTS, random);
  const modeName = pick(Object.keys(MODES), random);
  const scale = MODES[modeName];
  const type = pick(SEED_TYPES, random);

  const bpm = 72 + Math.floor(random() * 73);

  const octaveOffset =
  type === 'Chord Bloom'
    ? pick(
        [-12, -12, 0, 0, 0],
        random
      )
    : pick(
        [-12, 0, 0, 0, 12],
        random
      );

  const density =
    0.35 + random() * 0.6;

  const humanize =
    random() * 0.035;

  const swing =
    random() * 0.22;

  const motifDirection = pick(
    [
      'up',
      'down',
      'wave',
      'random'
    ],
    random
  );

 const durationMap = {
  'Chord Bloom': [8, 12],
  'Subdive Sequence': [7, 11],
  'Nodes Arp': [6, 10],
  'PixelTone Fragment': [5, 9],
  'Ethereal Drift': [10, 14],
  'Axis Bassline': [6, 10]
};

  const durationRange =
    durationMap[type] || [7, 10];

  const duration =
    durationRange[0] +
    Math.floor(
      random() *
      (
        durationRange[1] -
        durationRange[0] +
        1
      )
    );

  const nameIndex =
    Math.floor(
      random() *
      SEED_NAMES.length
    );

 const melodyLengthMap = {
  'Chord Bloom': 4,

  'Subdive Sequence':
    6 + Math.floor(random() * 5),

  'Nodes Arp':
    6 + Math.floor(random() * 5),

  'PixelTone Fragment':
    5 + Math.floor(random() * 5),

  'Ethereal Drift':
    4 + Math.floor(random() * 3),

  'Axis Bassline':
    6 + Math.floor(random() * 5)
};

  const melodyLength =
    melodyLengthMap[type] || 6;

  const melody = [];

  let previousDegree =
    Math.floor(
      random() * 3
    );

  for (
    let index = 0;
    index < melodyLength;
    index++
  ) {
    let movement;

    if (motifDirection === 'up') {
      movement = pick(
        [0, 1, 1, 2],
        random
      );
    } else if (
      motifDirection === 'down'
    ) {
      movement = pick(
        [-2, -1, -1, 0],
        random
      );
    } else if (
      motifDirection === 'wave'
    ) {
      movement =
        index % 2 === 0
          ? pick([0, 1, 2], random)
          : pick([-2, -1, 0], random);
    } else {
      movement = pick(
        [-2, -1, 0, 1, 2],
        random
      );
    }

    previousDegree = clamp(
      previousDegree + movement,
      0,
      scale.length - 1
    );

    const octaveLift =
      random() > 0.78
        ? 12
        : 0;

    melody.push(
      root.midi +
      octaveOffset +
      scale[previousDegree] +
      octaveLift
    );
  }

  const chordDegrees = [0, 2, 4];

  if (random() > 0.42) {
    chordDegrees.push(6);
  }

  const chord =
    chordDegrees.map(
      degree =>
        root.midi +
        octaveOffset +
        scale[degree]
    );

  const oscillator = pick(
    [
      'sine',
      'triangle',
      'sawtooth',
      'fatsine',
      'fattriangle'
    ],
    random
  );

  const filterType = pick(
    [
      'lowpass',
      'lowpass',
      'bandpass'
    ],
    random
  );

  return {
    id: seedNumber,

    name:
      `${SEED_NAMES[nameIndex]}-${seedNumber}`,

    type,

    rootName: root.name,
    rootMidi: root.midi,

    modeName,
    scale,

    bpm,
    duration,

    density,
    humanize,
    swing,

    octaveOffset,
    motifDirection,

    melody,
    chord,

    sound: {
      oscillator,

      filterType,

      brightness:
        650 +
        random() * 2200,

      attack:  
  type === 'PixelTone Fragment' ||
  type === 'Axis Bassline'
    ? 0.005 + random() * 0.055
    : 0.04 + random() * 0.42,

      decay:
        0.25 +
        random() * 0.85,

      sustain:
        0.22 +
        random() * 0.48,

      release:
  type === 'Ethereal Drift'
    ? 3.5 + random() * 4.5
    : type === 'Axis Bassline'
      ? 0.18 + random() * 0.65
      : 1.2 + random() * 3.8,

      reverb:
        
  type === 'Ethereal Drift'
          ? 0.5 +
            random() * 0.25
          : 0.18 +
            random() * 0.32,

      delay:
        0.05 +
        random() * 0.22,

      feedback:
        0.1 +
        random() * 0.24,

      volume:
        -13 +
        random() * 4,

      /* ---- family-specific DNA ----
         Only the relevant field is used by each engine,
         but all are derived here so the seed stays the
         single source of truth (same id → same sound). */

      detune:
        (random() - 0.5) * 12,

      voices:
        3 + Math.floor(random() * 3),

      vibratoRate:
        3 + random() * 3,

      vibratoDepth:
        0.03 + random() * 0.08,

      bitcrushBits:
        3 + Math.floor(random() * 4),

      distortion:
        0.15 + random() * 0.35,

      chorusRate:
        0.3 + random() * 1.1,

      chorusDepth:
        0.4 + random() * 0.5,

      panSpread:
        0.3 + random() * 0.6,

      drive:
        0.08 + random() * 0.2
    }
  };
}

 

  /* ------------------------------------------------------------
     UI
     ------------------------------------------------------------ */

  function formatDuration(seconds) {
    return `0:${String(seconds).padStart(2, '0')}`;
  }

 function buildWaveform(seed) {
  if (!waveform || !waveCanvas) return;

  resizeSeedWaveCanvas();

  wavePhase = 0;

  if (!waveAnimationFrame) {
    startSeedWave();
  }
}

  function renderSeed(seed) {
    seedNameEl.textContent = seed.name;
    seedTypeEl.textContent = seed.type;
    seedKeyEl.textContent =
      `${seed.rootName} ${seed.modeName}`;
    seedDurationEl.textContent =
      formatDuration(seed.duration);

    buildWaveform(seed);
  }
function resizeSeedWaveCanvas() {
  if (!waveCanvas || !waveCtx) return;

  const rect =
    waveCanvas.getBoundingClientRect();

  const dpr =
    window.devicePixelRatio || 1;

  waveCanvas.width =
    Math.max(
      1,
      Math.floor(rect.width * dpr)
    );

  waveCanvas.height =
    Math.max(
      1,
      Math.floor(rect.height * dpr)
    );

  waveCtx.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );
}

function drawSeedWave() {
  if (
    !waveCanvas ||
    !waveCtx ||
    !currentSeed
  ) {
    return;
  }

  const width =
    waveCanvas.clientWidth;

  const height =
    waveCanvas.clientHeight;

  if (
    !width ||
    !height
  ) {
    return;
  }

  waveCtx.clearRect(
    0,
    0,
    width,
    height
  );

  const centerY =
    height * 0.5;

  const random =
    mulberry32(
      currentSeed.id + 733
    );

  const seedPhase =
    random() *
    Math.PI *
    2;

  const baseAmplitude =
    7 +
    currentSeed.density * 10;

  const frequency =
    1.4 +
    (
      currentSeed.sound.brightness /
      3000
    ) *
    2.2;

  const secondaryFrequency =
    2.5 +
    random() * 2.5;

  const playbackEnergy =
    isPlaying
      ? 1.25
      : 1;

  const forgingEnergy =
    root.classList.contains(
      'is-regenerating'
    )
      ? 1.65
      : 1;

  const amplitude =
    baseAmplitude *
    playbackEnergy *
    forgingEnergy;

  waveCtx.beginPath();

  for (
    let x = 0;
    x <= width;
    x += 2
  ) {
    const progress =
      x / width;

    const primary =
      Math.sin(
        progress *
        Math.PI *
        2 *
        frequency +
        wavePhase +
        seedPhase
      );

    const secondary =
      Math.sin(
        progress *
        Math.PI *
        2 *
        secondaryFrequency -
        wavePhase * 0.55
      ) *
      0.28;

    const edgeFade =
      Math.sin(
        progress *
        Math.PI
      );

    const y =
      centerY +
      (
        primary +
        secondary
      ) *
      amplitude *
      edgeFade;

    if (x === 0) {
      waveCtx.moveTo(
        x,
        y
      );
    } else {
      waveCtx.lineTo(
        x,
        y
      );
    }
  }

  waveCtx.lineWidth =
    1.6;

  waveCtx.strokeStyle =
    'rgba(120, 195, 245, 0.82)';

  waveCtx.shadowBlur =
    12;

  waveCtx.shadowColor =
    'rgba(77, 157, 224, 0.28)';

  waveCtx.stroke();

  waveCtx.shadowBlur =
    0;

  wavePhase +=
    isPlaying
      ? 0.025
      : root.classList.contains(
          'is-regenerating'
        )
        ? 0.045
        : 0.008;

  waveAnimationFrame =
    window.requestAnimationFrame(
      drawSeedWave
    );
}

function startSeedWave() {
  if (waveAnimationFrame) {
    return;
  }

  resizeSeedWaveCanvas();

  drawSeedWave();
}
  /* ------------------------------------------------------------
     AUDIO
     ------------------------------------------------------------ */

  function midiToNote(midi) {
    return Tone.Frequency(midi, 'midi').toNote();
  }

 function disposeAudio() {
  if (!audio) return;

  try {

    /*
     * PolySynth uses releaseAll().
     * Mono Tone.Synth uses triggerRelease().
     */
    if (
      audio.synth &&
      typeof audio.synth.releaseAll === 'function'
    ) {
      audio.synth.releaseAll();
    }

    if (
      audio.synth &&
      typeof audio.synth.triggerRelease === 'function'
    ) {
      audio.synth.triggerRelease();
    }

    audio.synth?.dispose();
audio.filter?.dispose();
audio.delay?.dispose();
audio.reverb?.dispose();

audio.chorus?.dispose();
audio.vibrato?.dispose();
audio.distortion?.dispose();
audio.bitcrush?.dispose();
audio.autoFilter?.dispose();

audio.master?.dispose();
audio.limiter?.dispose();

  } catch (error) {
    console.warn(
      'Forge Seed audio cleanup:',
      error
    );
  }

  audio = null;
}

function buildAudio(seed) {
  disposeAudio();


  /* ------------------------------------------------------------
     MASTER OUTPUT
     Shared by every Forge Seed engine
     ------------------------------------------------------------ */

  const limiter =
    new Tone.Limiter(-2)
      .toDestination();


  const master =
    new Tone.Gain(0.62)
      .connect(limiter);



  /* ============================================================
     AXIS BASSLINE ENGINE
     ============================================================ */

  if (seed.type === 'Axis Bassline') {

    /*
     * Axis stays much drier and more focused than
     * the melodic / atmospheric engines.
     */

    const reverb =
      new Tone.Reverb({
        decay:
          1.2 +
          seed.sound.reverb * 2,

        wet:
          Math.min(
            0.12,
            seed.sound.reverb * 0.3
          )
      })
        .connect(master);


    const delay =
      new Tone.FeedbackDelay({
        delayTime: '16n',

        feedback:
          Math.min(
            0.18,
            seed.sound.feedback
          ),

        wet:
          Math.min(
            0.1,
            seed.sound.delay * 0.45
          )
      })
        .connect(reverb);


    const filter =
      new Tone.Filter({
        frequency:
          Math.min(
            1500,
            Math.max(
              280,
              seed.sound.brightness * 0.55
            )
          ),

        type:
          'lowpass',

        rolloff:
          -12
      })
        .connect(delay);


    /*
     * Mono synth:
     * one note at a time,
     * much more appropriate for basslines.
     */

    const synth =
      new Tone.Synth({

        oscillator: {
          type:
            seed.sound.oscillator === 'sine'
              ? 'triangle'
              : seed.sound.oscillator
        },

        envelope: {
          attack:
            Math.min(
              0.025,
              seed.sound.attack
            ),

          decay:
            0.12 +
            seed.sound.decay * 0.32,

          sustain:
            0.18 +
            seed.sound.sustain * 0.3,

          release:
            Math.min(
              0.55,
              seed.sound.release
            )
        }

      })
        .connect(filter);


    synth.volume.value =
      Math.max(
        -12,
        seed.sound.volume
      );


    audio = {
      engine:
        'axis',

      synth,
      filter,
      delay,
      reverb,
      master,
      limiter
    };


    return;
  }



  /* ============================================================
     CHORD BLOOM ENGINE
     Wide harmonic engine, rich voicings, chorus for width.
     ============================================================ */

  if (seed.type === 'Chord Bloom') {

    const reverb =
      new Tone.Reverb({
        decay: 3.5 + seed.sound.reverb * 6.5,
        wet: Math.min(0.55, seed.sound.reverb * 1.15)
      }).connect(master);

    const chorus =
      new Tone.Chorus({
        frequency: seed.sound.chorusRate,
        depth: seed.sound.chorusDepth,
        wet: 0.35
      }).connect(reverb);

    chorus.start();

    const delay =
      new Tone.FeedbackDelay({
        delayTime: '4n',
        feedback: seed.sound.feedback * 0.7,
        wet: seed.sound.delay * 0.6
      }).connect(chorus);

    const filter =
      new Tone.Filter({
        frequency:
  Math.min(
    1800,
    Math.max(
      700,
      seed.sound.brightness * 0.62
    )
  ),
        type: seed.sound.filterType,
        rolloff: -12
      }).connect(delay);

    /* Wide voicing: more voices than any other family. */
    const synth =
      new Tone.PolySynth(Tone.Synth, {
        maxPolyphony: seed.sound.voices + 4,
       oscillator: {
  type:
    seed.sound.oscillator === 'sawtooth'
      ? 'fattriangle'
      : 'fatsine',

  count: 2,

  spread:
    18 +
    seed.sound.panSpread * 18
},
        envelope: {
          attack: Math.max(0.15, seed.sound.attack),
          decay: seed.sound.decay,
          sustain: Math.max(0.35, seed.sound.sustain),
          release: seed.sound.release
        }
      }).connect(filter);

    synth.volume.value = seed.sound.volume - 1;

    audio = { engine: 'chord-bloom', synth, filter, delay, chorus, reverb, master, limiter };
    return;
  }

  /* ============================================================
     SUBDIVE SEQUENCE ENGINE
     Melodic, seed-driven, alive — subtle vibrato + detune.
     ============================================================ */

  if (seed.type === 'Subdive Sequence') {

    const reverb =
      new Tone.Reverb({
        decay: 2.2 + seed.sound.reverb * 4,
        wet: seed.sound.reverb * 0.85
      }).connect(master);

    const delay =
      new Tone.PingPongDelay({
        delayTime: '8n',
        feedback: seed.sound.feedback,
        wet: seed.sound.delay
      }).connect(reverb);

    const filter =
      new Tone.Filter({
        frequency: seed.sound.brightness,
        type: seed.sound.filterType,
        rolloff: -12
      }).connect(delay);

    const vibrato =
      new Tone.Vibrato({
        frequency: seed.sound.vibratoRate,
        depth: seed.sound.vibratoDepth
      }).connect(filter);

    const synth =
      new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: seed.sound.oscillator,
          detune: seed.sound.detune
        },
        envelope: {
          attack: seed.sound.attack * 0.7,
          decay: seed.sound.decay,
          sustain: seed.sound.sustain,
          release: seed.sound.release * 0.7
        }
      }).connect(vibrato);

    synth.volume.value = seed.sound.volume;

    audio = { engine: 'subdive', synth, filter, delay, vibrato, reverb, master, limiter };
    return;
  }

  /* ============================================================
     NODES ARP ENGINE
     Precise, rhythmically structured — synced ping-pong delay,
     short plucky envelope, no swimming vibrato.
     ============================================================ */

  if (seed.type === 'Nodes Arp') {

    const reverb =
      new Tone.Reverb({
        decay: 1.6 + seed.sound.reverb * 2.5,
        wet: Math.min(0.28, seed.sound.reverb * 0.6)
      }).connect(master);

    const delay =
      new Tone.PingPongDelay({
        delayTime: '16n',
        feedback: Math.min(0.4, seed.sound.feedback * 1.2),
        wet: Math.min(0.32, seed.sound.delay * 0.9)
      }).connect(reverb);

    const filter =
      new Tone.Filter({
        frequency: Math.max(900, seed.sound.brightness),
        type: 'lowpass',
        rolloff: -24
      }).connect(delay);

    const synth =
      new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: seed.sound.oscillator },
        envelope: {
          attack: Math.min(0.02, seed.sound.attack),
          decay: 0.18 + seed.sound.decay * 0.3,
          sustain: 0.12,
          release: Math.min(0.5, seed.sound.release * 0.3)
        }
      }).connect(filter);

    synth.volume.value = seed.sound.volume;

    audio = { engine: 'nodes', synth, filter, delay, reverb, master, limiter };
    return;
  }

 /* ============================================================
   PIXELTONE FRAGMENT ENGINE
   ============================================================ */

if (seed.type === 'PixelTone Fragment') {

  const reverb =
    new Tone.Reverb({
      decay:
        1.4 +
        seed.sound.reverb * 2.2,

      wet:
        Math.min(
          0.2,
          seed.sound.reverb * 0.45
        )
    })
      .connect(master);


  const delay =
    new Tone.FeedbackDelay({
      delayTime:
        '16n',

      feedback:
        Math.min(
          0.28,
          seed.sound.feedback
        ),

      wet:
        Math.min(
          0.24,
          seed.sound.delay
        )
    })
      .connect(reverb);


  const filter =
    new Tone.Filter({
      frequency:
        Math.max(
          1100,
          seed.sound.brightness * 1.1
        ),

      type:
        'lowpass',

      rolloff:
        -12
    })
      .connect(delay);


  const synth =
    new Tone.PolySynth(
      Tone.Synth,
      {
        oscillator: {
          type:
            'square'
        },

        envelope: {
          attack:
            0.005,

          decay:
            0.09 +
            seed.sound.decay * 0.12,

          sustain:
            0.04,

          release:
            0.08 +
            Math.min(
              0.18,
              seed.sound.release * 0.08
            )
        }
      }
    )
      .connect(filter);


  synth.volume.value =
    Math.max(
      -12,
      seed.sound.volume - 1
    );


  audio = {
    engine:
      'pixeltone',

    synth,
    filter,
    delay,
    reverb,
    master,
    limiter
  };


  return;
}

 /* ============================================================
   ETHEREAL DRIFT ENGINE
   ============================================================ */

if (seed.type === 'Ethereal Drift') {

  const reverb =
    new Tone.Reverb({
      decay:
        Math.min(
          8,
          4.5 +
          seed.sound.reverb * 5
        ),

      wet:
        Math.min(
          0.5,
          0.28 +
          seed.sound.reverb * 0.35
        )
    })
      .connect(master);


  const filter =
    new Tone.Filter({
      frequency:
        Math.max(
          500,
          seed.sound.brightness * 0.62
        ),

      type:
        'lowpass',

      rolloff:
        -12
    })
      .connect(reverb);


  const synth =
    new Tone.PolySynth(
      Tone.Synth,
      {
        oscillator: {
          type:
            'fatsine',

          count:
            2,

          spread:
            24
        },

        envelope: {
          attack:
            Math.max(
              0.9,
              seed.sound.attack * 2.1
            ),

          decay:
            Math.min(
              1.8,
              seed.sound.decay * 1.2
            ),

          sustain:
            Math.max(
              0.42,
              seed.sound.sustain
            ),

          release:
            Math.min(
              4.8,
              seed.sound.release
            )
        }
      }
    )
      .connect(filter);


  synth.volume.value =
    Math.min(
      -11,
      seed.sound.volume - 3
    );


  audio = {
    engine:
      'ethereal',

    synth,
    filter,
    reverb,
    master,
    limiter
  };


  return;
}

  /* ============================================================
     FALLBACK ENGINE
     Only reached if a future family is added without its own
     engine yet — keeps playback from breaking silently.
     ============================================================ */

  const reverb =
    new Tone.Reverb({
      decay: 2.8 + seed.sound.reverb * 6,
      wet: seed.sound.reverb
    }).connect(master);

  const delay =
    new Tone.FeedbackDelay({
      delayTime: '8n',
      feedback: seed.sound.feedback,
      wet: seed.sound.delay
    }).connect(reverb);

  const filter =
    new Tone.Filter({
      frequency: seed.sound.brightness,
      type: seed.sound.filterType,
      rolloff: -12
    }).connect(delay);

  const synth =
    new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: seed.sound.oscillator },
      envelope: {
        attack: seed.sound.attack,
        decay: seed.sound.decay,
        sustain: seed.sound.sustain,
        release: seed.sound.release
      }
    }).connect(filter);

  synth.volume.value = seed.sound.volume;

  audio = { engine: 'poly-fallback', synth, filter, delay, reverb, master, limiter };
}

/* ------------------------------------------------------------
   WAVEFORM PROGRESS
   ------------------------------------------------------------ */

function resetWaveProgress() {
  if (!waveform) return;

  waveform.style.setProperty(
    '--wave-progress',
    '0%'
  );

  waveform.classList.remove(
    'is-complete'
  );

  waveform
    .querySelectorAll('span')
    .forEach(bar => {
      bar.classList.remove(
        'is-played',
        'is-current'
      );
    });
}




/* ------------------------------------------------------------
   STOP
   ------------------------------------------------------------ */

function stopPreview() {
  isPlaying = false;

  if (playbackTimer) {
    window.clearTimeout(
      playbackTimer
    );

    playbackTimer = null;
  }

 try {

  if (
    audio?.synth &&
    typeof audio.synth.releaseAll === 'function'
  ) {
    audio.synth.releaseAll();
  }

  if (
    audio?.synth &&
    typeof audio.synth.triggerRelease === 'function'
  ) {
    audio.synth.triggerRelease();
  }

} catch (error) {

  console.warn(
    'Forge Seed stop:',
    error
  );

}

  playBtn?.classList.remove(
    'is-playing'
  );

  playBtn?.setAttribute(
    'aria-pressed',
    'false'
  );

  waveform?.classList.remove(
    'is-playing'
  );

  resetWaveProgress();
}


/* ------------------------------------------------------------
   PLAYBACK HELPERS
   ------------------------------------------------------------ */

function getStepDuration(seed) {
  return 60 / seed.bpm;
}


function getHumanizedTime(
  baseTime,
  seed,
  random
) {
  const offset =
    (
      random() - 0.5
    ) *
    seed.humanize;

  return baseTime + offset;
}


/* ------------------------------------------------------------
   CHORD BLOOM
   ------------------------------------------------------------ */

async function playChordBloom(seed) {
  const now =
    Tone.now() + 0.06;

  const scale =
    seed.scale;

  const root =
    seed.rootMidi +
    seed.octaveOffset;

  const chordDuration =
    Math.max(
      1.8,
      seed.duration / 3
    );

  /*
   * Simple modal progression:
   * I → IV → VI
   *
   * Degrees are wrapped inside the current scale,
   * so it stays coherent with the Seed mode.
   */

  const progressionDegrees = [
    0,
    3,
    5
  ];

  progressionDegrees.forEach(
    (degree, index) => {

      const chordRoot =
        root +
        scale[
          degree %
          scale.length
        ];

      const chord = [
        chordRoot,
        chordRoot +
          scale[2],
        chordRoot +
          scale[4]
      ];

      /*
       * Optional upper colour note.
       */
      if (
        index === 2
      ) {
        chord.push(
          chordRoot +
          scale[6] +
          12
        );
      }

      const notes =
        chord.map(
          midiToNote
        );

      audio.synth
        .triggerAttackRelease(
          notes,
          chordDuration * 0.9,
          now +
            index *
            chordDuration,
          index === 0
            ? 0.52
            : 0.46
        );
    }
  );
}


/* ------------------------------------------------------------
   MELODIC subdive
   ------------------------------------------------------------ */
async function playSubdiveSequence(seed) {
  const random =
    mulberry32(
      seed.id + 901
    );

  const now =
    Tone.now() + 0.06;

  const usableDuration =
    Math.max(
      3.8,
      seed.duration - 1.2
    );

  const stepDuration =
    usableDuration /
    seed.melody.length;

  seed.melody.forEach(
    (midi, index) => {
      const adjustedMidi =
  midi > 76
    ? midi - 12
    : midi;

const note =
  midiToNote(adjustedMidi);

      const baseTime =
        now +
        index *
        stepDuration;

      const time =
        getHumanizedTime(
          baseTime,
          seed,
          random
        );

      const duration =
        Math.max(
          0.38,
          stepDuration * 0.78
        );

      const velocity =
        0.38 +
        (
          index /
          seed.melody.length
        ) *
        0.22;

      audio.synth
        .triggerAttackRelease(
          note,
          duration,
          time,
          velocity
        );
    }
  );
}


/* ------------------------------------------------------------
   ARP FRAGMENT
   ------------------------------------------------------------ */

async function playNodesArp(seed) {

  const random =
    mulberry32(
      seed.id + 1201
    );

  const now =
    Tone.now() + 0.06;

  const beat =
    getStepDuration(seed);

  const step =
    beat / 2;

  const totalSteps =
    Math.max(
      seed.melody.length,
      Math.floor(
        seed.duration /
        step
      )
    );

  for (
    let index = 0;
    index < totalSteps;
    index++
  ) {

    const midi =
      seed.melody[
        index %
        seed.melody.length
      ];

    const mustPlay =
      index % 4 === 0;

    const effectiveDensity =
      Math.max(
        0.52,
        seed.density
      );

    if (
      !mustPlay &&
      random() >
      effectiveDensity
    ) {
      continue;
    }

    const time =
      getHumanizedTime(
        now +
        index * step,
        seed,
        random
      );

    audio.synth
      .triggerAttackRelease(
        midiToNote(midi),
        Math.max(
          0.12,
          step * 0.7
        ),
        time,
        0.44 +
        random() * 0.16
      );
  }
}


/* ------------------------------------------------------------
   PLUCK SEQUENCE
   ------------------------------------------------------------ */

async function playPixelToneFragment(seed) {

  const random =
    mulberry32(
      seed.id + 1501
    );

  const now =
    Tone.now() + 0.06;

  const beat =
    getStepDuration(seed);

  const step =
    beat / 2;


  const totalSteps =
    Math.max(
      seed.melody.length,
      Math.floor(
        seed.duration /
        step
      )
    );


  for (
    let position = 0;
    position < totalSteps;
    position++
  ) {

    const midi =
      seed.melody[
        position %
        seed.melody.length
      ];


    /*
     * The first note of every cycle
     * is always played.
     */
    const mustPlay =
      position %
      seed.melody.length === 0;


    const effectiveDensity =
      Math.max(
        0.48,
        seed.density
      );


    if (
      !mustPlay &&
      random() >
      effectiveDensity
    ) {
      continue;
    }


    let swingOffset = 0;


    if (
      position % 2 === 1
    ) {
      swingOffset =
        step *
        seed.swing *
        0.35;
    }


    const time =
      getHumanizedTime(
        now +
        position * step +
        swingOffset,

        seed,
        random
      );


    audio.synth
      .triggerAttackRelease(

        midiToNote(
          midi
        ),

        Math.max(
          0.07,
          step * 0.34
        ),

        time,

        0.46 +
        random() * 0.18
      );
  }
}

/* ------------------------------------------------------------
   AMBIENT DRIFT
   ------------------------------------------------------------ */

async function playEtherealDrift(seed) {

  const random =
    mulberry32(
      seed.id + 1801
    );

  const now =
    Tone.now() + 0.06;

  const lowerChord =
    seed.chord
      .slice(0, 3)
      .map(midiToNote);

  audio.synth
    .triggerAttackRelease(
      lowerChord,
      Math.max(
        3.5,
        seed.duration - 2.2
      ),
      now,
      0.3
    );

  seed.melody
    .slice(0, 2)
    .forEach(
      (midi, index) => {

        const time =
          now +
          1.8 +
          index *
          (
            seed.duration /
            3.4
          ) +
          random() * 0.18;

        audio.synth
          .triggerAttackRelease(
            midiToNote(
              midi + 12
            ),
            1.8 +
            random() * 1.2,
            time,
            0.14 +
            random() * 0.08
          );
      }
    );
}


/* ------------------------------------------------------------
   AXIS PATTERN 
   ------------------------------------------------------------ */

async function playAxisBassline(seed) {
  const random =
    mulberry32(
      seed.id + 2101
    );

  const now =
    Tone.now() + 0.06;

  const beat =
    getStepDuration(seed);

  const step =
    beat / 2;

  const totalSteps =
    Math.floor(
      seed.duration / step
    );

  for (
    let index = 0;
    index < totalSteps;
    index++
  ) {
    if (
      random() >
      seed.density
    ) {
      continue;
    }

    const melodyIndex =
      index %
      seed.melody.length;

    /*
     * Axis stays in the bass register.
     * We derive the notes from the Seed melody,
     * but force them one or two octaves lower.
     */

    const sourceMidi =
      seed.melody[
        melodyIndex
      ];

    const bassMidi =
      sourceMidi -
      (
        sourceMidi >= 60
          ? 24
          : 12
      );

    let swingOffset = 0;

    if (
      index % 2 === 1
    ) {
      swingOffset =
        step *
        seed.swing *
        0.3;
    }

    const time =
      getHumanizedTime(
        now +
        index * step +
        swingOffset,
        seed,
        random
      );

    const duration =
      random() > 0.72
        ? step * 0.82
        : step * 0.42;

    const velocity =
      0.42 +
      random() * 0.22;

    audio.synth
      .triggerAttackRelease(
        midiToNote(
          bassMidi
        ),
        Math.max(
          0.08,
          duration
        ),
        time,
        velocity
      );
  }
}


/* ------------------------------------------------------------
   PLAY CURRENT SEED FAMILY
   ------------------------------------------------------------ */

async function playSeed(seed) {
  switch (seed.type) {

    case 'Chord Bloom':
      await playChordBloom(seed);
      break;

    case 'Subdive Sequence':
      await playSubdiveSequence(seed);
      break;

    case 'Nodes Arp':
      await playNodesArp(seed);
      break;

    case 'PixelTone Fragment':
      await playPixelToneFragment(seed);
      break;

    case 'Ethereal Drift':
      await playEtherealDrift(seed);
      break;

    case 'Axis Bassline':
      await playAxisBassline(seed);
      break;

    default:
      await playSubdiveSequence(seed);
      break;
  }
}


/* ------------------------------------------------------------
   WAV EXPORT

   Renders the seed offline through the exact same engine used
   for preview (buildAudio + playSeed), so the exported file is
   never a re-approximation — it's the real thing, just captured
   instead of sent to the speakers.

   Because the seed is fully deterministic, nothing needs to be
   stored server-side to "keep" a render: storing the seed id
   (plus its active transform name, if any) is enough to
   regenerate the identical WAV again later. That's a few bytes
   instead of a multi-MB audio file.
   ------------------------------------------------------------ */

function audioBufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const numFrames = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const dataSize = numFrames * blockAlign;

  const arrayBuffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(arrayBuffer);

  function writeString(offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bytesPerSample * 8, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  const channels = [];
  for (let ch = 0; ch < numChannels; ch++) {
    channels.push(buffer.getChannelData(ch));
  }

  let offset = 44;
  for (let frame = 0; frame < numFrames; frame++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = Math.max(-1, Math.min(1, channels[ch][frame]));
      view.setInt16(
        offset,
        sample < 0 ? sample * 0x8000 : sample * 0x7fff,
        true
      );
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

async function renderSeedToWav(seed) {
  const tail = 3; // seconds of release/reverb tail after the last note
  const length = seed.duration + tail;

  const buffer = await Tone.Offline(async () => {
    buildAudio(seed);
    await playSeed(seed);
  }, length);

  return audioBufferToWav(buffer.get ? buffer.get() : buffer);
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

async function exportSeedToWav(seed) {
  const wavBlob = await renderSeedToWav(seed);
  const filename = `chrysasynth-forge-${seed.name.replace(/\s+/g, '-').toLowerCase()}.wav`;
  downloadBlob(wavBlob, filename);
  return wavBlob;
}

/* ------------------------------------------------------------
   START PREVIEW
   ------------------------------------------------------------ */

async function startPreview() {
  if (
    !currentSeed ||
    isPlaying
  ) {
    return;
  }

  if (
    typeof Tone ===
    'undefined'
  ) {
    console.error(
      'Tone.js is not loaded.'
    );

    return;
  }

  try {
    await Tone.start();

    buildAudio(
      currentSeed
    );

    isPlaying = true;

    resetWaveProgress();

    
    playBtn?.classList.add(
      'is-playing'
    );

    playBtn?.setAttribute(
      'aria-pressed',
      'true'
    );

    waveform?.classList.add(
      'is-playing'
    );

    

    await playSeed(
      currentSeed
    );

    playbackTimer =
      window.setTimeout(
        () => {
          stopPreview();
        },
        currentSeed.duration *
        1000
      );

  } catch (error) {
    console.error(
      'Forge Seed playback error:',
      error
    );

    stopPreview();
  }
}
function setSeedState(state) {

  root.dataset.seedState = state;

  introState.hidden = state !== "intro";
  loadingState.hidden = state !== "loading";
  resultState.hidden = state !== "result";

}
  /* ------------------------------------------------------------
     GENERATION
     ------------------------------------------------------------ */

  function wait(milliseconds) {
    return new Promise(resolve => {
      window.setTimeout(resolve, milliseconds);
    });
  }

async function generateNewSeed({ fromResult = false } = {}) {

  if (generateBtn.disabled) return;

  stopPreview();
  disposeAudio();

  seedShell?.classList.add('is-forging-scene');

  generateBtn.disabled = true;
  regenerateBtn?.setAttribute('disabled', '');

  const nextSeed = createSeed();
currentSeed = nextSeed;

buildWaveform(currentSeed);

  if (!fromResult) {
    /* First generation:
       intro → compact loading → result */
    setSeedState("loading");
  } else {
    /* Regeneration:
       stay inside the result card */
    root.dataset.seedState = "result";
    resultState.hidden = false;

    root.classList.add('is-regenerating');

    keepBtn?.setAttribute('disabled', '');

  

    seedNameEl.textContent = 'Forging…';

    seedTypeEl.textContent = 'New musical identity';
    seedKeyEl.textContent = '';
    seedDurationEl.textContent = '';

    buildWaveform(nextSeed);
  }

  await wait(1400);

currentSeed = nextSeed;

setSeedState("result");

renderSeed(currentSeed);

  root.classList.remove('is-regenerating');

  keepBtn?.removeAttribute('disabled');

 
  await wait(650);

  seedShell?.classList.remove('is-forging-scene');

  generateBtn.disabled = false;
  regenerateBtn?.removeAttribute('disabled');
}

  /* ------------------------------------------------------------
     EVENTS
     ------------------------------------------------------------ */

 generateBtn?.addEventListener(
  'click',
  () => generateNewSeed({ fromResult: false })
);

regenerateBtn?.addEventListener(
  'click',
  () => generateNewSeed({ fromResult: true })
);
  playBtn?.addEventListener('click', () => {
    if (isPlaying) {
      stopPreview();
    } else {
      startPreview();
    }
  });

 if (keepBtn) {
  keepBtn.addEventListener('click', function () {
    console.log('KEEP CLICKED');

    if (!seedModal) {
      console.error('Forge Seed modal not found');
      return;
    }

    seedModal.classList.add('is-open');
    seedModal.setAttribute('aria-hidden', 'false');

    window.setTimeout(() => {
      seedEmailInput?.focus();
    }, 250);
  });
}
document
  .querySelectorAll('[data-seed-modal-close]')
  .forEach(element => {
    element.addEventListener('click', () => {
      seedModal?.classList.remove('is-open');
      seedModal?.setAttribute(
        'aria-hidden',
        'true'
      );

      seedModalError.hidden = true;
    });
  });
  seedModalForm?.addEventListener(
  'submit',
  async event => {
    event.preventDefault();

    const email =
      seedEmailInput.value.trim();

    const isValid =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValid) {
      seedModalError.hidden = false;
      return;
    }

    seedModalError.hidden = true;

    const submitBtn = seedModalForm.querySelector('[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Rendering…';
    }

    try {

      /*
       * TODO (server-side, not doable safely from the browser):
       * POST { email, seedId: currentSeed.id, transform: currentSeed.activeTransform }
       * to your Brevo-connected endpoint to add the contact —
       * the Brevo API key can't live in client JS.
       *
       * Note: you only need to send the seed id + transform name,
       * never the audio itself — the WAV is fully reproducible
       * from those two values whenever you need it again
       * (e.g. to re-render and email it as an attachment later).
       */
      await fetch('/api/forge-seed-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          seedId: currentSeed.id,
          transform: currentSeed.activeTransform || null
        })
      }).catch(() => {
        /* Endpoint not wired up yet — don't block the download on it. */
      });

      await exportSeedToWav(currentSeed);

      seedModal?.classList.remove('is-open');
      seedModal?.setAttribute('aria-hidden', 'true');

    } catch (error) {
      console.error('Forge Seed export error:', error);
      seedModalError.hidden = false;
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Get my WAV';
      }
    }
  }
);

  window.addEventListener('resize', () => {
    if (currentSeed) {
      buildWaveform(currentSeed);
    }
  });

  /* ------------------------------------------------------------
     INITIAL SEED
     Visible immediately when the page opens.
     ------------------------------------------------------------ */

  currentSeed = createSeed();

renderSeed(currentSeed);

setSeedState("intro");
})();
/* ============================================================
   FORGE — HERO + CATEGORIES SCROLL MOTION
   ============================================================ */

window.addEventListener('load', () => {

  const hero = document.getElementById('hero');
  const shell = document.querySelector('.hero-seed-shell');
  const categories = document.getElementById('categories');

  if (!hero || !shell || !categories) {
    console.warn('Forge scroll motion: element missing');
    return;
  }

  console.log('Forge scroll motion: ACTIVE');

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function updateHeroMotion() {

    const rect = hero.getBoundingClientRect();

    const progress = clamp(
      -rect.top / (hero.offsetHeight * 0.82),
      0,
      1
    );

    /* =========================
       HERO RECULE
       ========================= */

    const heroScale = 1 - progress * 0.08;
    const heroY = progress * -32;
    const heroOpacity = 1 - progress * 0.45;

    shell.style.setProperty(
      'transform',
      `translate3d(0, ${heroY}px, 0) scale(${heroScale})`,
      'important'
    );

    shell.style.setProperty(
      'opacity',
      heroOpacity,
      'important'
    );

    shell.style.setProperty(
      'transform-origin',
      '50% 42%',
      'important'
    );

    shell.style.setProperty(
      'will-change',
      'transform, opacity'
    );


    /* =========================
       CATEGORIES ARRIVE
       ========================= */

    const catProgress = clamp(
      (progress - 0.30) / 0.70,
      0,
      1
    );

    const eased = easeOutCubic(catProgress);

    const catY = eased * -170;
    const catScale = 0.965 + eased * 0.035;

    categories.style.setProperty(
      'transform',
      `translate3d(0, ${catY}px, 0) scale(${catScale})`,
      'important'
    );

    categories.style.setProperty(
      'transform-origin',
      '50% 0%',
      'important'
    );

    categories.style.setProperty(
      'will-change',
      'transform'
    );
  }

  updateHeroMotion();

  window.addEventListener(
    'scroll',
    updateHeroMotion,
    { passive: true }
  );

});
/* ============================================================
   FORGE — FEATURED BENTO SCROLL MOTION V3
   Dispersé → Assemblé → Dispersé
   ============================================================ */

window.addEventListener('load', () => {

  const featured = document.getElementById('featured');
  const create = document.getElementById('create');

  if (!featured || !create) {
    console.warn('Featured scroll motion: element missing');
    return;
  }

  const cards = [
    ...featured.querySelectorAll('.feat-card')
  ];

  const createHeader =
    create.querySelector('.section-header');

  const createItems = [
    ...create.querySelectorAll('.create-item')
  ];

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function updateFeaturedMotion() {
  const isMobile =
    window.matchMedia('(max-width: 768px)').matches;

  if (isMobile) {

    cards.forEach(card => {
      card.style.removeProperty('transform');
      card.style.removeProperty('opacity');
      card.style.removeProperty('will-change');
    });

    return;
  }
    const rect = featured.getBoundingClientRect();
    const vh = window.innerHeight;

    /* ========================================================
       PROGRESSION GLOBALE

       0 = section encore sous l'écran
       0.5 = Featured parfaitement dans la zone centrale
       1 = section en train de quitter vers le haut
       ======================================================== */

    const start = vh * 1.05;
    const end = -featured.offsetHeight * 0.35;

    const progress = clamp(
      (start - rect.top) /
      (start - end),
      0,
      1
    );


    /* ========================================================
       BENTO AMOUNT

       0 = dispersé
       1 = parfaitement assemblé

       0.00 → 0.32 = rassemblement
       0.32 → 0.58 = reste assemblé
       0.58 → 1.00 = dispersion
       ======================================================== */

    let assembled = 0;

    if (progress < 0.65) {

      const p = clamp(
        progress / 0.32,
        0,
        1
      );

      assembled =
        easeInOutCubic(p);

    }

    else if (progress < 0.82) {

      assembled = 1;

    }

    else {

      const p = clamp(
        (progress - 0.58) / 0.42,
        0,
        1
      );

      assembled =
        1 - easeInOutCubic(p);

    }


    /* ========================================================
       CARTES
       ======================================================== */

    const directions = [

      /* Hold — grande carte gauche */
      { x: -1.10, y:  0.20, r: -1.4 },

      /* Axis */
      { x:  0.10, y: -0.85, r:  0.8 },

      /* pixelTone */
      { x:  1.05, y: -0.25, r:  1.2 },

      /* Subdive */
      { x: -0.75, y:  0.85, r: -1.0 },

      /* Frequency */
      { x:  0.20, y:  1.00, r:  0.5 },

      /* Orbit Pan */
      { x:  1.15, y:  0.65, r:  1.1 }

    ];


    cards.forEach((card, index) => {

      const dir =
        directions[index % directions.length];


      /*
        scatteredAmount :
        1 = complètement dispersé
        0 = Bento parfaitement assemblé
      */

      const scatteredAmount =
        1 - assembled;


      const x =
        dir.x * 145 * scatteredAmount;

      const y =
        dir.y * 85 * scatteredAmount;

      const rotation =
        dir.r * 3.5 * scatteredAmount;

      const scale =
        1 - 0.065 * scatteredAmount;


      /*
        On garde les cartes lisibles même dispersées.
      */

      const opacity =
        1 - 0.32 * scatteredAmount;


      card.style.setProperty(
        'transform',
        `
          translate3d(${x}px, ${y}px, 0)
          rotate(${rotation}deg)
          scale(${scale})
        `,
        'important'
      );

      card.style.setProperty(
        'opacity',
        opacity,
        'important'
      );

      card.style.setProperty(
        'will-change',
        'transform, opacity'
      );

    });


    /* ========================================================
       CREATE

       Commence à apparaître uniquement
       pendant la deuxième dispersion.
       ======================================================== */

    const createProgress = clamp(
      (progress - 0.66) / 0.34,
      0,
      1
    );

    const createEase =
      easeOutCubic(createProgress);


    if (createHeader) {

      const headerY =
        65 * (1 - createEase);

      const headerScale =
        0.96 + createEase * 0.04;

      createHeader.style.setProperty(
        'transform',
        `
          translate3d(0, ${headerY}px, 0)
          scale(${headerScale})
        `,
        'important'
      );

      createHeader.style.setProperty(
        'opacity',
        createEase,
        'important'
      );

    }


    createItems.forEach((item, index) => {

      const delay =
        index * 0.06;

      const itemProgress = clamp(
        (createProgress - delay) /
        (1 - delay),
        0,
        1
      );

      const itemEase =
        easeOutCubic(itemProgress);

      const itemY =
        38 * (1 - itemEase);

      item.style.setProperty(
        'transform',
        `translate3d(0, ${itemY}px, 0)`,
        'important'
      );

      item.style.setProperty(
        'opacity',
        itemEase,
        'important'
      );

    });

  }


  updateFeaturedMotion();

  window.addEventListener(
    'scroll',
    updateFeaturedMotion,
    { passive: true }
  );

  window.addEventListener(
    'resize',
    updateFeaturedMotion,
    { passive: true }
  );

});
/* ============================================================
   FORGE — WELLNESS APPS
   ZOOM IN → ZOOM OUT
   ============================================================ */

window.addEventListener('load', () => {

  const section =
    document.getElementById('wellness-apps');

  if (!section) {
    console.warn('Wellness scroll motion: section not found');
    return;
  }

  const content =
    section.querySelector('.container');

  if (!content) return;


  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }


  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }


  function updateWellnessMotion() {

    /* Pas d'animation mobile */
    if (window.innerWidth <= 768) {

      content.style.removeProperty('transform');
      content.style.removeProperty('opacity');
      content.style.removeProperty('will-change');

      return;
    }


    const rect =
      section.getBoundingClientRect();

    const vh =
      window.innerHeight;


    /*
      Progression de toute la traversée :

      0 = section arrive par le bas
      0.5 = section au centre
      1 = section quitte vers le haut
    */

    const start =
      vh;

    const end =
      -section.offsetHeight;

    const progress = clamp(
      (start - rect.top) /
      (start - end),
      0,
      1
    );


    /*
      On construit une courbe :

      0 → 0.5 : zoom IN
      0.5 → 1 : zoom OUT
    */

    let zoomProgress;

    if (progress <= 0.5) {

      zoomProgress =
        progress / 0.5;

    } else {

      zoomProgress =
        (1 - progress) / 0.5;

    }

    const eased =
      easeInOutCubic(
        clamp(zoomProgress, 0, 1)
      );


    /*
      0.90 quand éloigné
      1.00 au centre
      puis retour à 0.90
    */

    const scale =
      0.90 + eased * 0.10;


    /*
      Léger déplacement vertical
    */

    const y =
      (1 - eased) * 35;


    /*
      Opacité :
      jamais trop faible
    */

    const opacity =
      0.62 + eased * 0.38;


    content.style.setProperty(
      'transform',
      `
        translate3d(0, ${y}px, 0)
        scale(${scale})
      `,
      'important'
    );

    content.style.setProperty(
      'opacity',
      opacity,
      'important'
    );

    content.style.setProperty(
      'transform-origin',
      '50% 50%',
      'important'
    );

    content.style.setProperty(
      'will-change',
      'transform, opacity'
    );

  }


  updateWellnessMotion();


  window.addEventListener(
    'scroll',
    updateWellnessMotion,
    { passive: true }
  );


  window.addEventListener(
    'resize',
    updateWellnessMotion,
    { passive: true }
  );

});
/* ============================================================
   FORGE — STUDIO FINAL NARRATIVE MOTION
   Seed → Studio → CTA
   ============================================================ */

window.addEventListener('load', () => {

  const studio = document.getElementById('studio');

  if (!studio) {
    console.warn('Studio motion: section not found');
    return;
  }

  const button =
    studio.querySelector('.btn-studio');

  const arrow =
    button?.querySelector('.btn-arrow');

  const screen =
    studio.querySelector('.studio-screen-frame');

  const studioInner =
    studio.querySelector('.studio-inner');

  if (!button || !screen || !studioInner) return;


  /* ========================================================
     CREATE TRAVELLING SEED
     ======================================================== */

  const seed = document.createElement('div');

  seed.className = 'studio-travel-seed';

  seed.innerHTML = `
    <span class="studio-seed-core"></span>
    <span class="studio-seed-trail"></span>
  `;

  studio.appendChild(seed);


  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }


  function updateStudioMotion() {

    /* =========================
       MOBILE RESET
       ========================= */

    if (window.innerWidth <= 768) {

      seed.style.display = 'none';

      screen.style.removeProperty('transform');
      screen.style.removeProperty('opacity');
      screen.style.removeProperty('filter');
      screen.style.removeProperty('box-shadow');

      button.style.removeProperty('transform');
      button.style.removeProperty('opacity');
      button.style.removeProperty('box-shadow');

      if (arrow) {
        arrow.style.removeProperty('transform');
        arrow.style.removeProperty('opacity');
      }

      return;
    }

    seed.style.display = 'block';


    /* =========================
       GLOBAL SCROLL PROGRESS
       ========================= */

    const rect =
      studio.getBoundingClientRect();

    const vh =
      window.innerHeight;

    const progress = clamp(
      (vh - rect.top) /
      (vh * 1.05),
      0,
      1
    );


    /* ========================================================
       PHASES

       0.00 → 0.35 : seed appears
       0.20 → 0.67 : seed travels
       0.50 → 0.82 : screen activates
       0.66 → 1.00 : CTA activates
       ======================================================== */


    /* =========================
       SEED TRAVEL
       ========================= */

    const seedProgress = clamp(
      (progress - 0.18) / 0.48,
      0,
      1
    );

    const seedEase =
      easeInOutCubic(seedProgress);


    /*
      Start roughly near the text area.
      Finish inside the Studio screen.
    */

    const startX = 25;
    const startY = 34;

    const endX = 73;
    const endY = 53;


    const seedX =
      startX +
      (endX - startX) * seedEase;

    /*
      Slight arc instead of straight line
    */

    const arc =
      Math.sin(seedEase * Math.PI) * -12;

    const seedY =
      startY +
      (endY - startY) * seedEase +
      arc;


    const seedScale =
      0.65 + seedEase * 0.45;


    /*
      Fade in, then disappear as it enters Studio
    */

    let seedOpacity = 1;

    if (seedProgress < 0.12) {
      seedOpacity =
        seedProgress / 0.12;
    }

    if (seedProgress > 0.82) {
      seedOpacity =
        1 -
        (seedProgress - 0.82) / 0.18;
    }


    seed.style.setProperty(
      'left',
      `${seedX}%`
    );

    seed.style.setProperty(
      'top',
      `${seedY}%`
    );

    seed.style.setProperty(
      'transform',
      `translate(-50%, -50%) scale(${seedScale})`
    );

    seed.style.setProperty(
      'opacity',
      clamp(seedOpacity, 0, 1)
    );


    /* =========================
       SCREEN ACTIVATION
       ========================= */

    const screenProgress = clamp(
      (progress - 0.46) / 0.34,
      0,
      1
    );

    const screenEase =
      easeOutCubic(screenProgress);


    const screenScale =
      0.92 + screenEase * 0.08;

    const screenY =
      38 * (1 - screenEase);

    const screenBlur =
      7 * (1 - screenEase);

    const screenOpacity =
      0.50 + screenEase * 0.50;


    screen.style.setProperty(
      'transform',
      `
        translate3d(0, ${screenY}px, 0)
        scale(${screenScale})
      `,
      'important'
    );

    screen.style.setProperty(
      'opacity',
      screenOpacity,
      'important'
    );

    screen.style.setProperty(
      'filter',
      `blur(${screenBlur}px)`,
      'important'
    );


    /*
      Tiny impact when the seed enters the screen
    */

    const impact = clamp(
      1 -
      Math.abs(seedProgress - 0.92) / 0.12,
      0,
      1
    );

    screen.style.setProperty(
      'box-shadow',
      `
        0 30px 90px rgba(0,0,0,.46),
        0 0 ${40 + impact * 70}px
        rgba(77,157,224,${0.08 + impact * 0.20})
      `,
      'important'
    );


    /* =========================
       CTA ACTIVATION
       ========================= */

    const buttonProgress = clamp(
      (progress - 0.64) / 0.30,
      0,
      1
    );

    const buttonEase =
      easeOutCubic(buttonProgress);


    const buttonScale =
      0.90 + buttonEase * 0.10;

    const buttonY =
      24 * (1 - buttonEase);

    const buttonOpacity =
      0.48 + buttonEase * 0.52;

    const glowOpacity =
      0.06 + buttonEase * 0.28;


    button.style.setProperty(
      'transform',
      `
        translate3d(0, ${buttonY}px, 0)
        scale(${buttonScale})
      `,
      'important'
    );

    button.style.setProperty(
      'opacity',
      buttonOpacity,
      'important'
    );

    button.style.setProperty(
      'box-shadow',
      `
        0 0 ${18 + buttonEase * 32}px
        rgba(77,157,224,${glowOpacity}),
        0 12px 34px rgba(0,0,0,.28)
      `,
      'important'
    );


    /* =========================
       CTA ARROW
       ========================= */

    if (arrow) {

      arrow.style.setProperty(
        'display',
        'inline-block'
      );

      arrow.style.setProperty(
        'transform',
        `translateX(${buttonEase * 8}px)`
      );

      arrow.style.setProperty(
        'opacity',
        0.5 + buttonEase * 0.5
      );

    }

  }


  updateStudioMotion();


  window.addEventListener(
    'scroll',
    updateStudioMotion,
    { passive: true }
  );

  window.addEventListener(
    'resize',
    updateStudioMotion,
    { passive: true }
  );

});
