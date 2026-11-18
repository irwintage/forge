const PLANET_SVG = {
      "Sun": `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="4" stroke="currentColor" stroke-width="1.2"/><circle cx="10" cy="10" r="1.2" fill="currentColor"/><line x1="10" y1="1" x2="10" y2="4" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><line x1="10" y1="16" x2="10" y2="19" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><line x1="1" y1="10" x2="4" y2="10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><line x1="16" y1="10" x2="19" y2="10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><line x1="3.05" y1="3.05" x2="5.17" y2="5.17" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><line x1="14.83" y1="14.83" x2="16.95" y2="16.95" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><line x1="16.95" y1="3.05" x2="14.83" y2="5.17" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><line x1="5.17" y1="14.83" x2="3.05" y2="16.95" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
      "Moon": `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13 3.5C10 3.5 7 6 7 10C7 14 10 16.5 13 16.5C11.5 16.5 8 15 8 10C8 5 11.5 3.5 13 3.5Z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" fill="none"/><path d="M13 3.5C9.5 4.5 7 7 7 10C7 13 9.5 15.5 13 16.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
      "Mercury": `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="9" r="4" stroke="currentColor" stroke-width="1.2"/><line x1="10" y1="13" x2="10" y2="18" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><line x1="7" y1="16" x2="13" y2="16" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M6.5 5C7.5 3.5 9 2.5 10 2.5C11 2.5 12.5 3.5 13.5 5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
      "Venus": `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="8" r="5" stroke="currentColor" stroke-width="1.2"/><line x1="10" y1="13" x2="10" y2="18" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><line x1="7" y1="16" x2="13" y2="16" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
      "Mars": `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8.5" cy="11.5" r="5" stroke="currentColor" stroke-width="1.2"/><line x1="12.5" y1="7.5" x2="18" y2="2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><polyline points="14,2 18,2 18,6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      "Jupiter": `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C12 2 7 5 7 9C7 12 9 13 11 13" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><line x1="5" y1="11" x2="15" y2="11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><line x1="13" y1="7" x2="13" y2="18" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
      "Saturn": `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 2C11 2 6 5 6 9C6 12 8 13 10 13" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><line x1="4" y1="11" x2="14" y2="11" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><line x1="12" y1="7" x2="12" y2="18" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><line x1="9" y1="18" x2="15" y2="18" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
      "Uranus": `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="13" r="3.5" stroke="currentColor" stroke-width="1.2"/><line x1="10" y1="9.5" x2="10" y2="2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><circle cx="10" cy="2.5" r="1" fill="currentColor"/><line x1="3" y1="16" x2="17" y2="16" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><line x1="3" y1="16" x2="3" y2="13" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><line x1="17" y1="16" x2="17" y2="13" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
      "Neptune": `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><line x1="10" y1="2" x2="10" y2="18" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><line x1="4" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><path d="M4 7C4 7 7 10 10 10C13 10 16 7 16 7" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><line x1="4" y1="18" x2="16" y2="18" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><line x1="4" y1="12" x2="4" y2="15" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><line x1="16" y1="12" x2="16" y2="15" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`
    };

    const PLANETS = [
      { name: "Sun", hz: 126.22, note: "B2", sign: "Leo" },
      { name: "Moon", hz: 210.42, note: "G#3", sign: "Cancer" },
      { name: "Mercury", hz: 141.27, note: "C#3", sign: "Gemini" },
      { name: "Venus", hz: 221.23, note: "A3", sign: "Taurus" },
      { name: "Mars", hz: 144.72, note: "D3", sign: "Aries" },
      { name: "Jupiter", hz: 183.58, note: "F#3", sign: "Sagittarius" },
      { name: "Saturn", hz: 147.85, note: "D3", sign: "Capricorn" },
      { name: "Uranus", hz: 207.36, note: "G#3", sign: "Aquarius" },
      { name: "Neptune", hz: 211.44, note: "G#3", sign: "Pisces" }
    ];

    const SIGNS = [
      { name: "Aries", symbol: "♈", start: [3, 21], end: [4, 19], planet: "Mars" },
      { name: "Taurus", symbol: "♉", start: [4, 20], end: [5, 20], planet: "Venus" },
      { name: "Gemini", symbol: "♊", start: [5, 21], end: [6, 20], planet: "Mercury" },
      { name: "Cancer", symbol: "♋", start: [6, 21], end: [7, 22], planet: "Moon" },
      { name: "Leo", symbol: "♌", start: [7, 23], end: [8, 22], planet: "Sun" },
      { name: "Virgo", symbol: "♍", start: [8, 23], end: [9, 22], planet: "Mercury" },
      { name: "Libra", symbol: "♎", start: [9, 23], end: [10, 22], planet: "Venus" },
      { name: "Scorpio", symbol: "♏", start: [10, 23], end: [11, 21], planet: "Mars" },
      { name: "Sagittarius", symbol: "♐", start: [11, 22], end: [12, 21], planet: "Jupiter" },
      { name: "Capricorn", symbol: "♑", start: [12, 22], end: [1, 19], planet: "Saturn" },
      { name: "Aquarius", symbol: "♒", start: [1, 20], end: [2, 18], planet: "Uranus" },
      { name: "Pisces", symbol: "♓", start: [2, 19], end: [3, 20], planet: "Neptune" }
    ];

    const MONTHS = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const ELEMENT_PRESETS = {
      Fire:    { filter: 1550, reverb: 0.10, panFreq: 0.015, breathFreq: 0.09, breathMin: 0.60, breathMax: 0.90 },
      Earth:   { filter: 1050, reverb: 0.08, panFreq: 0.010, breathFreq: 0.07, breathMin: 0.62, breathMax: 0.86 },
      Air:     { filter: 1700, reverb: 0.12, panFreq: 0.022, breathFreq: 0.10, breathMin: 0.58, breathMax: 0.88 },
      Water:   { filter: 1200, reverb: 0.18, panFreq: 0.013, breathFreq: 0.08, breathMin: 0.56, breathMax: 0.84 }
    };

    const SIGN_TO_ELEMENT = {
      Aries: "Fire",
      Leo: "Fire",
      Sagittarius: "Fire",
      Taurus: "Earth",
      Virgo: "Earth",
      Capricorn: "Earth",
      Gemini: "Air",
      Libra: "Air",
      Aquarius: "Air",
      Cancer: "Water",
      Scorpio: "Water",
      Pisces: "Water"
    };

    const selDay = document.getElementById("sel-day");
    const selMonth = document.getElementById("sel-month");
    const selYear = document.getElementById("sel-year");

    const wheelCanvas = document.getElementById("wheel");
    const wheelContainer = document.querySelector(".wheel-container");
    const wctx = wheelCanvas.getContext("2d");

    let currentSign = null;
    let currentPlanet = null;
    let activeSignIndex = 0;
    let isPlaying = false;
    let audioStarted = false;
    let audioStartPromise = null;
    let startRequestId = 0;
    let animationFrameId = null;
    let wheelRotation = 0;

    let audioBus = {
      master: null,
      droneGain: null,
      filter: null,
      reverb: null,
      panner: null,
      breathLfo: null,
      filterLfo: null,
      panLfo: null,
      oscillators: [],
      accents: []
    };

    function populateMonths() {
      MONTHS.forEach((month, index) => {
        const option = document.createElement("option");
        option.value = index + 1;
        option.textContent = month;
        selMonth.appendChild(option);
      });
    }

    function populateYears() {
      for (let year = new Date().getFullYear(); year >= 1920; year--) {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = String(year);
        selYear.appendChild(option);
      }
    }

    function isLeapYear(year) {
      return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }

    function getDaysInMonth(month, year) {
      const thirtyOne = [1, 3, 5, 7, 8, 10, 12];
      const thirty = [4, 6, 9, 11];
      if (thirtyOne.includes(month)) return 31;
      if (thirty.includes(month)) return 30;
      return isLeapYear(year) ? 29 : 28;
    }

    function populateDays(maxDays, selectedDay = 1) {
      selDay.innerHTML = "";
      for (let day = 1; day <= maxDays; day++) {
        const option = document.createElement("option");
        option.value = day;
        option.textContent = String(day).padStart(2, "0");
        if (day === selectedDay) option.selected = true;
        selDay.appendChild(option);
      }
    }

    function syncDays() {
      const month = Number(selMonth.value || 1);
      const year = Number(selYear.value || 2000);
      const currentDay = Number(selDay.value || 1);
      const maxDays = getDaysInMonth(month, year);
      populateDays(maxDays, Math.min(currentDay, maxDays));
    }

    function getSign(day, month) {
      for (const sign of SIGNS) {
        const [startMonth, startDay] = sign.start;
        const [endMonth, endDay] = sign.end;

        if (startMonth <= endMonth) {
          const inStartMonth = month === startMonth && day >= startDay;
          const inEndMonth = month === endMonth && day <= endDay;
          const betweenMonths = month > startMonth && month < endMonth;
          if (inStartMonth || inEndMonth || betweenMonths) return sign;
        } else {
          const inWrappedStart = month === startMonth && day >= startDay;
          const inWrappedEnd = month === endMonth && day <= endDay;
          const betweenWrapped = month > startMonth || month < endMonth;
          if (inWrappedStart || inWrappedEnd || betweenWrapped) return sign;
        }
      }
      return SIGNS[0];
    }

    function getPlanetFromSign(sign) {
      return PLANETS.find((planet) => planet.name === sign.planet) || PLANETS[0];
    }

    function getElementForSign(signName) {
      return SIGN_TO_ELEMENT[signName] || "Air";
    }

    function updateFromDate() {
      const day = Number(selDay.value);
      const month = Number(selMonth.value);
      const sign = getSign(day, month);
      const planet = getPlanetFromSign(sign);

      currentSign = sign;
      currentPlanet = planet;
      activeSignIndex = SIGNS.findIndex((item) => item.name === sign.name);

      document.getElementById("disp-note").textContent = planet.note;
      document.getElementById("disp-hz").textContent = `${planet.hz.toFixed(2)} Hz`;
      document.getElementById("disp-planet").textContent = planet.name;
      document.getElementById("bottom-sign").textContent = sign.name;
      document.getElementById("bottom-planet").textContent = `${planet.name} · Cousto Frequency`;

      buildPlanetGrid(planet.name);

      if (isPlaying) {
        restartAudioForCurrentSign();
      }
    }

    function buildPlanetGrid(activePlanetName) {
      const grid = document.getElementById("planet-grid");
      grid.innerHTML = "";

      PLANETS.forEach((planet) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `planet-item${planet.name === activePlanetName ? " active" : ""}`;
        button.dataset.planet = planet.name;
        button.setAttribute("aria-label", `Play ${planet.name}`);

        button.innerHTML = `
          <span class="planet-symbol">${PLANET_SVG[planet.name] || ""}</span>
          <span class="planet-name">${planet.name}</span>
          <span class="planet-note">${planet.note}</span>
          <span class="planet-hz">${planet.hz.toFixed(2)} Hz</span>
        `;

        button.addEventListener("click", () => playPlanetAccent(planet));
        grid.appendChild(button);
      });
    }

    async function ensureAudioStarted() {
      if (!audioStarted) {
        if (!audioStartPromise) audioStartPromise = Tone.start().then(() => { audioStarted = true; }).finally(() => { audioStartPromise = null; });
        await audioStartPromise;
      }

      if (!audioBus.master) {
        audioBus.master = new Tone.Gain(0.9).toDestination();
        audioBus.reverb = new Tone.Reverb({ decay: 7, preDelay: 0.05, wet: 0.12 });
        audioBus.filter = new Tone.Filter({ type: "lowpass", frequency: 1400, rolloff: -12, Q: 0.25 });
        audioBus.panner = new Tone.AutoPanner(0.015);
        audioBus.droneGain = null;
        audioBus.filter.connect(audioBus.reverb);
        audioBus.reverb.connect(audioBus.panner);
        audioBus.panner.connect(audioBus.master);
        audioBus.panner.start();
      }
    }

    function stopAndDisposeNodes(nodes) {
      nodes.forEach((node) => {
        try {
          if (typeof node.stop === "function") node.stop();
        } catch (e) {}
        try {
          if (typeof node.dispose === "function") node.dispose();
        } catch (e) {}
      });
    }

    function clearDrone() {
      // Each drone has its own envelope. Never reopen the previous drone when
      // a new sign starts, otherwise old oscillators can bleed into the mix.
      const oldGain = audioBus.droneGain;
      const oldNodes = audioBus.oscillators.splice(0);
      const oldLfos = [audioBus.breathLfo, audioBus.filterLfo, audioBus.panLfo].filter(Boolean);
      audioBus.droneGain = null;
      audioBus.breathLfo = audioBus.filterLfo = audioBus.panLfo = null;
      const now = Tone.now();
      if (oldGain) {
        oldGain.gain.cancelScheduledValues(now);
        oldGain.gain.setValueAtTime(Math.max(0.00001,oldGain.gain.value),now);
        oldGain.gain.linearRampToValueAtTime(0, now + 0.5);
      }
      oldLfos.forEach(l => { try { l.stop(); } catch(e) {} });
      setTimeout(() => {
        stopAndDisposeNodes(oldNodes);
        stopAndDisposeNodes(oldLfos);
        if(oldGain) oldGain.dispose();
      }, 700);
    }

    async function startAudioForPlanet(planet, sign) {
      const requestId = ++startRequestId;
      await ensureAudioStarted();
      if(requestId !== startRequestId) return;
      clearDrone();
      audioBus.droneGain = new Tone.Gain(0).connect(audioBus.filter);

      const element = getElementForSign(sign.name);
      const preset = ELEMENT_PRESETS[element];
      const now = Tone.now();

      audioBus.filter.frequency.value = preset.filter;
      audioBus.reverb.wet.value = preset.reverb;
      audioBus.panner.frequency.value = preset.panFreq;
      audioBus.panner.depth.value = 0.32;

      const osc1 = new Tone.Oscillator(planet.hz, "sine");
      const osc2 = new Tone.Oscillator(planet.hz * 0.5, "sine");
      const osc3 = new Tone.Oscillator(planet.hz * 2, "triangle");
      const osc4 = new Tone.Oscillator(planet.hz * 1.5, "triangle");

      osc1.volume.value = -14;
      osc2.volume.value = -22;
      osc3.volume.value = -28;
      osc4.volume.value = -31;

      osc1.connect(audioBus.droneGain);
      osc2.connect(audioBus.droneGain);
      osc3.connect(audioBus.droneGain);
      osc4.connect(audioBus.droneGain);

      osc1.start(now);
      osc2.start(now);
      osc3.start(now);
      osc4.start(now);

      audioBus.oscillators = [osc1, osc2, osc3, osc4];

      audioBus.droneGain.gain.cancelScheduledValues(now);
      audioBus.droneGain.gain.setValueAtTime(0, now);
      audioBus.droneGain.gain.linearRampToValueAtTime(0.76, now + 2.8);

      audioBus.breathLfo = new Tone.LFO({
        frequency: preset.breathFreq,
        min: preset.breathMin,
        max: preset.breathMax
      }).connect(audioBus.droneGain.gain);
      audioBus.breathLfo.start();

      audioBus.filterLfo = new Tone.LFO({
        frequency: preset.breathFreq * 0.55,
        min: preset.filter * 0.82,
        max: preset.filter * 1.18
      }).connect(audioBus.filter.frequency);
      audioBus.filterLfo.start();

      audioBus.panLfo = new Tone.LFO({
        frequency: preset.panFreq,
        min: 0.08,
        max: 0.36
      }).connect(audioBus.panner.depth);
      audioBus.panLfo.start();

      isPlaying = true;
      updateLedState();
    }

    async function restartAudioForCurrentSign() {
      if (!currentPlanet || !currentSign) return;
      await startAudioForPlanet(currentPlanet, currentSign);
    }

    function stopAudio() {
      ++startRequestId;
      clearDrone();

      document.querySelectorAll(".planet-item").forEach((item) => {
        item.classList.remove("playing");
      });

      isPlaying = false;
      updateLedState();
    }

    async function playPlanetAccent(planet) {
      if (!isPlaying) return;

      document.querySelectorAll(".planet-item").forEach((item) => {
        item.classList.toggle("playing", item.dataset.planet === planet.name);
      });

      await ensureAudioStarted();

      const accentGain = new Tone.Gain(0);
      const accentFilter = new Tone.Filter({
        type: "lowpass",
        frequency: 1800,
        rolloff: -12,
        Q: 0.2
      });
      const accentOsc = new Tone.Oscillator(planet.hz, "sine");
      const accentHarm = new Tone.Oscillator(planet.hz * 2, "triangle");

      accentOsc.volume.value = -18;
      accentHarm.volume.value = -28;

      accentOsc.connect(accentGain);
      accentHarm.connect(accentGain);
      accentGain.connect(accentFilter);
      accentFilter.connect(audioBus.reverb);

      const now = Tone.now();
      accentOsc.start(now);
      accentHarm.start(now);

      accentGain.gain.setValueAtTime(0, now);
      accentGain.gain.linearRampToValueAtTime(0.32, now + 0.08);
      accentGain.gain.linearRampToValueAtTime(0.12, now + 0.45);
      accentGain.gain.linearRampToValueAtTime(0, now + 1.6);

      setTimeout(() => {
        stopAndDisposeNodes([accentOsc, accentHarm, accentGain, accentFilter]);
      }, 1900);

      setTimeout(() => {
        document.querySelectorAll(".planet-item").forEach((item) => {
          item.classList.remove("playing");
        });
      }, 1200);
    }

    function updateLedState() {
      const powerLed = document.getElementById("led-power");
      const audioLed = document.getElementById("led-audio");
      const ledText = document.getElementById("led-text");

      document.getElementById("btn-play")?.classList.toggle("is-playing", isPlaying);
      powerLed.classList.toggle("active", isPlaying);
      audioLed.classList.toggle("active", isPlaying);
      ledText.classList.toggle("active-label", isPlaying);
      ledText.textContent = isPlaying ? "Active" : "Standby";
      const play = document.getElementById("btn-play");
      play.classList.toggle("is-playing", isPlaying);
      play.textContent = isPlaying ? "● Active" : "▶ Activate";
      play.setAttribute("aria-pressed", String(isPlaying));
    }

    function setupCanvas() {
      const rect = wheelContainer.getBoundingClientRect();
      const cssSize = Math.max(1, Math.floor(rect.width));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      wheelCanvas.width = Math.floor(cssSize * dpr);
      wheelCanvas.height = Math.floor(cssSize * dpr);
      wheelCanvas.style.width = `100%`;
      wheelCanvas.style.height = `100%`;

      wctx.setTransform(1, 0, 0, 1, 0, 0);
      wctx.scale(dpr, dpr);
    }

    function drawSignGlyph(ctx, name, x, y, s) {
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();

      switch (name) {
        case "Aries":
          ctx.moveTo(-s, 0);
          ctx.arc(-s * 0.4, 0, s * 0.6, Math.PI, 0, false);
          ctx.arc(s * 0.4, 0, s * 0.6, Math.PI, 0, false);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-s * 0.4, s * 0.6); ctx.lineTo(-s * 0.4, s * 1.1);
          ctx.moveTo(s * 0.4, s * 0.6); ctx.lineTo(s * 0.4, s * 1.1);
          ctx.stroke();
          break;
        case "Taurus":
          ctx.arc(0, s * 0.4, s * 0.6, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-s * 0.6, s * 0.4);
          ctx.arc(-s * 0.3, -s * 0.1, s * 0.35, Math.PI, 0, false);
          ctx.arc(s * 0.3, -s * 0.1, s * 0.35, Math.PI, 0, false);
          ctx.stroke();
          break;
        case "Gemini":
          ctx.moveTo(-s * 0.55, -s); ctx.lineTo(s * 0.55, -s);
          ctx.moveTo(-s * 0.55, s); ctx.lineTo(s * 0.55, s);
          ctx.moveTo(-s * 0.25, -s); ctx.lineTo(-s * 0.25, s);
          ctx.moveTo(s * 0.25, -s); ctx.lineTo(s * 0.25, s);
          ctx.stroke();
          break;
        case "Cancer":
          ctx.moveTo(-s * 0.8, -s * 0.2);
          ctx.bezierCurveTo(-s * 0.8, -s * 0.8, s * 0.2, -s * 0.8, s * 0.2, -s * 0.2);
          ctx.bezierCurveTo(s * 0.2, s * 0.2, -s * 0.2, s * 0.3, -s * 0.4, s * 0.1);
          ctx.moveTo(s * 0.8, s * 0.2);
          ctx.bezierCurveTo(s * 0.8, s * 0.8, -s * 0.2, s * 0.8, -s * 0.2, s * 0.2);
          ctx.bezierCurveTo(-s * 0.2, -s * 0.2, s * 0.2, -s * 0.3, s * 0.4, -s * 0.1);
          ctx.stroke();
          break;
        case "Leo":
          ctx.arc(0, -s * 0.2, s * 0.6, 0.3, Math.PI * 2 - 0.3);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(
            s * 0.6 * Math.cos(Math.PI * 2 - 0.3),
            -s * 0.2 + s * 0.6 * Math.sin(Math.PI * 2 - 0.3)
          );
          ctx.bezierCurveTo(s * 1.0, -s * 0.2, s * 1.0, s * 0.9, s * 0.2, s * 0.9);
          ctx.stroke();
          break;
        case "Virgo":
          ctx.moveTo(-s * 0.8, s * 0.9); ctx.lineTo(-s * 0.8, -s * 0.3);
          ctx.arc(-s * 0.4, -s * 0.3, s * 0.4, Math.PI, 0, false);
          ctx.arc(0, -s * 0.3, s * 0.4, Math.PI, 0, false);
          ctx.lineTo(s * 0.4, s * 0.9);
          ctx.bezierCurveTo(s * 0.4, s * 1.2, s * 0.9, s * 1.2, s * 0.9, s * 0.6);
          ctx.stroke();
          break;
        case "Libra":
          ctx.moveTo(-s, s * 0.6); ctx.lineTo(s, s * 0.6);
          ctx.moveTo(-s * 0.6, s * 0.6);
          ctx.bezierCurveTo(-s * 0.6, -s * 0.2, s * 0.6, -s * 0.2, s * 0.6, s * 0.6);
          ctx.stroke();
          break;
        case "Scorpio":
          ctx.moveTo(-s * 0.8, s * 0.5); ctx.lineTo(-s * 0.8, -s * 0.3);
          ctx.arc(-s * 0.4, -s * 0.3, s * 0.4, Math.PI, 0, false);
          ctx.arc(0, -s * 0.3, s * 0.4, Math.PI, 0, false);
          ctx.lineTo(s * 0.4, s * 0.5);
          ctx.lineTo(s * 0.8, s * 0.1);
          ctx.moveTo(s * 0.4, s * 0.5);
          ctx.lineTo(s * 0.8, s * 0.9);
          ctx.stroke();
          break;
        case "Sagittarius":
          ctx.moveTo(-s * 0.7, s * 0.7); ctx.lineTo(s * 0.7, -s * 0.7);
          ctx.moveTo(s * 0.1, -s * 0.7); ctx.lineTo(s * 0.7, -s * 0.7); ctx.lineTo(s * 0.7, -s * 0.1);
          ctx.moveTo(-s * 0.3, s * 0.05); ctx.lineTo(s * 0.05, -s * 0.3);
          ctx.stroke();
          break;
        case "Capricorn":
          ctx.moveTo(-s * 0.8, -s * 0.5);
          ctx.lineTo(-s * 0.1, s * 0.4);
          ctx.bezierCurveTo(s * 0.4, s * 1.1, s * 1.1, s * 0.7, s * 0.85, s * 0.05);
          ctx.arc(s * 0.55, 0, s * 0.3, 0.2, Math.PI * 1.9, false);
          ctx.stroke();
          break;
        case "Aquarius":
          ctx.moveTo(-s, -s * 0.3);
          ctx.bezierCurveTo(-s * 0.5, -s * 0.7, 0, 0.1, s * 0.5, -s * 0.3);
          ctx.bezierCurveTo(s * 0.75, -s * 0.5, s, -s * 0.1, s, -s * 0.3);
          ctx.moveTo(-s, s * 0.3);
          ctx.bezierCurveTo(-s * 0.5, -s * 0.1, 0, s * 0.7, s * 0.5, s * 0.3);
          ctx.bezierCurveTo(s * 0.75, s * 0.1, s, s * 0.5, s, s * 0.3);
          ctx.stroke();
          break;
        case "Pisces":
          ctx.moveTo(-s * 0.1, -s);
          ctx.bezierCurveTo(-s * 0.7, -s, -s * 0.9, -s * 0.4, -s * 0.9, 0);
          ctx.bezierCurveTo(-s * 0.9, s * 0.4, -s * 0.7, s, -s * 0.1, s);
          ctx.moveTo(s * 0.1, -s);
          ctx.bezierCurveTo(s * 0.7, -s, s * 0.9, -s * 0.4, s * 0.9, 0);
          ctx.bezierCurveTo(s * 0.9, s * 0.4, s * 0.7, s, s * 0.1, s);
          ctx.moveTo(-s * 0.5, 0); ctx.lineTo(s * 0.5, 0);
          ctx.stroke();
          break;
        default:
          ctx.arc(0, 0, s * 0.6, 0, Math.PI * 2);
          ctx.stroke();
      }

      ctx.restore();
    }

    function drawWheel() {
      const cssWidth = wheelCanvas.clientWidth;
      const cssHeight = wheelCanvas.clientHeight;
      const cx = cssWidth / 2;
      const cy = cssHeight / 2;
      const outerR = cssWidth * 0.455;
      const innerR = cssWidth * 0.29;
      const centerR = cssWidth * 0.105;
      const segAngle = (Math.PI * 2) / 12;
      const time = performance.now() * 0.001;
      const pulse = 0.5 + Math.sin(time * 2) * 0.5;

      wctx.clearRect(0, 0, cssWidth, cssHeight);

      const bgGrad = wctx.createRadialGradient(cx, cy, 0, cx, cy, outerR);
      bgGrad.addColorStop(0, "rgba(131, 215, 255, 0.08)");
      bgGrad.addColorStop(0.5, "rgba(131, 215, 255, 0.03)");
      bgGrad.addColorStop(1, "rgba(131, 215, 255, 0)");

      wctx.beginPath();
      wctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      wctx.fillStyle = bgGrad;
      wctx.fill();

      for (let i = 0; i < 12; i++) {
        const startA = -Math.PI / 2 + i * segAngle + wheelRotation;
        const endA = startA + segAngle;
        const midA = startA + segAngle / 2;
        const isActive = i === activeSignIndex;

        wctx.beginPath();
        wctx.moveTo(cx, cy);
        wctx.arc(cx, cy, outerR, startA, endA);
        wctx.closePath();

        if (isActive) {
          const activeGrad = wctx.createRadialGradient(cx, cy, innerR * 0.8, cx, cy, outerR);
          activeGrad.addColorStop(0, `rgba(244, 197, 122, ${0.18 + pulse * 0.08})`);
          activeGrad.addColorStop(1, "rgba(244, 197, 122, 0.06)");
          wctx.fillStyle = activeGrad;
        } else {
          wctx.fillStyle = i % 2 === 0
            ? "rgba(12, 18, 29, 0.84)"
            : "rgba(8, 13, 22, 0.84)";
        }
        wctx.fill();

        wctx.beginPath();
        wctx.moveTo(cx, cy);
        wctx.arc(cx, cy, outerR, startA, endA);
        wctx.closePath();
        wctx.strokeStyle = isActive
          ? "rgba(244, 197, 122, 0.55)"
          : "rgba(110, 145, 200, 0.14)";
        wctx.lineWidth = isActive ? 1.3 : 0.8;
        wctx.stroke();

        const textR = (outerR + innerR) / 2;
        const tx = cx + Math.cos(midA) * textR;
        const ty = cy + Math.sin(midA) * textR;

        wctx.save();
        wctx.translate(tx, ty);
        wctx.rotate(midA + Math.PI / 2);

        const glyphColor = isActive ? "#f4c57a" : "rgba(157, 169, 187, 0.7)";
        wctx.strokeStyle = glyphColor;
        wctx.fillStyle = glyphColor;
        wctx.lineWidth = isActive ? 1.4 : 1;
        wctx.lineCap = "round";
        wctx.lineJoin = "round";

        drawSignGlyph(wctx, SIGNS[i].name, 0, -10, isActive ? cssWidth * 0.018 : cssWidth * 0.016);

        wctx.font = `${isActive ? "500" : "400"} ${Math.max(8, cssWidth * 0.022)}px Inter Custom`;
        wctx.fillStyle = isActive ? "rgba(255, 227, 170, 0.95)" : "rgba(157, 169, 187, 0.62)";
        wctx.textAlign = "center";
        wctx.textBaseline = "middle";
        wctx.fillText(SIGNS[i].name.slice(0, 4).toUpperCase(), 0, cssWidth * 0.018);

        const signPlanet = getPlanetFromSign(SIGNS[i]);
        wctx.font = `500 ${Math.max(8, cssWidth * 0.024)}px Inter Custom`;
        wctx.fillStyle = isActive ? "rgba(181, 238, 255, 0.95)" : "rgba(131, 215, 255, 0.40)";
        wctx.fillText(signPlanet.note, 0, cssWidth * 0.050);

        wctx.restore();
      }

      wctx.beginPath();
      wctx.arc(cx, cy, innerR, 0, Math.PI * 2);
      wctx.strokeStyle = "rgba(110, 145, 200, 0.18)";
      wctx.lineWidth = 1;
      wctx.stroke();

      const starPoints = 9;
      const starR = innerR * 0.82;
      const connections = [[0,3],[1,4],[2,6],[3,7],[4,8],[5,1],[6,2],[7,0],[8,5]];

      connections.forEach(([a, b]) => {
        const angleA = -Math.PI / 2 + (a / starPoints) * Math.PI * 2;
        const angleB = -Math.PI / 2 + (b / starPoints) * Math.PI * 2;
        const ax = cx + Math.cos(angleA) * starR;
        const ay = cy + Math.sin(angleA) * starR;
        const bx = cx + Math.cos(angleB) * starR;
        const by = cy + Math.sin(angleB) * starR;
        const highlighted = a === activeSignIndex % 9 || b === activeSignIndex % 9;

        wctx.beginPath();
        wctx.moveTo(ax, ay);
        wctx.lineTo(bx, by);
        wctx.strokeStyle = highlighted
          ? "rgba(244, 197, 122, 0.32)"
          : "rgba(131, 215, 255, 0.10)";
        wctx.lineWidth = highlighted ? 1.1 : 0.6;
        wctx.stroke();
      });

      for (let i = 0; i < starPoints; i++) {
        const angle = -Math.PI / 2 + (i / starPoints) * Math.PI * 2;
        const px = cx + Math.cos(angle) * starR;
        const py = cy + Math.sin(angle) * starR;

        wctx.beginPath();
        wctx.arc(px, py, cssWidth * 0.006, 0, Math.PI * 2);
        wctx.fillStyle = i === activeSignIndex % 9
          ? "rgba(244, 197, 122, 0.85)"
          : "rgba(131, 215, 255, 0.22)";
        wctx.fill();
      }

      const centerGrad = wctx.createRadialGradient(cx, cy, 0, cx, cy, centerR * 1.6);
      centerGrad.addColorStop(0, `rgba(181, 238, 255, ${isPlaying ? 0.20 + pulse * 0.10 : 0.12})`);
      centerGrad.addColorStop(0.65, "rgba(131, 215, 255, 0.06)");
      centerGrad.addColorStop(1, "rgba(131, 215, 255, 0)");

      wctx.beginPath();
      wctx.arc(cx, cy, centerR * 1.45, 0, Math.PI * 2);
      wctx.fillStyle = centerGrad;
      wctx.fill();

      wctx.beginPath();
      wctx.arc(cx, cy, centerR, 0, Math.PI * 2);
      wctx.strokeStyle = isPlaying
        ? "rgba(181, 238, 255, 0.42)"
        : "rgba(131, 215, 255, 0.24)";
      wctx.lineWidth = 1;
      wctx.stroke();

      const ringCount = isPlaying ? 3 : 2;
      for (let i = 1; i <= ringCount; i++) {
        const phase = (time * (isPlaying ? 0.34 : 0.18) + i * 0.28) % 1;
        const ringR = centerR + phase * (innerR - centerR - 8);
        const alpha = (1 - phase) * (isPlaying ? 0.18 : 0.08);

        wctx.beginPath();
        wctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        wctx.strokeStyle = `rgba(131, 215, 255, ${alpha})`;
        wctx.lineWidth = 1;
        wctx.stroke();
      }

      wctx.beginPath();
      wctx.arc(cx, cy, outerR, 0, Math.PI * 2);
      wctx.strokeStyle = isPlaying
        ? "rgba(131, 215, 255, 0.22)"
        : "rgba(131, 215, 255, 0.12)";
      wctx.lineWidth = 1;
      wctx.stroke();
    }

    function animate() {
      wheelRotation += isPlaying ? 0.0012 : 0.00012;
      drawWheel();
      animationFrameId = document.hidden ? null : requestAnimationFrame(animate);
    }

    function startAnimationLoop() {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animate();
    }

    function debounce(fn, delay = 120) {
      let timeoutId;
      return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
      };
    }

    function bindEvents() {
      selMonth.addEventListener("change", () => {
        syncDays();
        updateFromDate();
      });

      selYear.addEventListener("change", () => {
        syncDays();
        updateFromDate();
      });

      selDay.addEventListener("change", updateFromDate);

      document.getElementById("btn-play").addEventListener("click", async () => {
        if (!currentPlanet) updateFromDate();
        await restartAudioForCurrentSign();
      });

      document.getElementById("btn-stop").addEventListener("click", stopAudio);

      window.addEventListener("resize", debounce(() => {
        setupCanvas();
        drawWheel();
      }, 120));
    }

    function init() {
      populateMonths();
      populateYears();

      selMonth.value = "1";
      selYear.value = "2000";
      syncDays();
      selDay.value = "1";

      updateLedState();
      updateFromDate();
      setupCanvas();
      bindEvents();
      startAnimationLoop();
      document.addEventListener("visibilitychange", () => { if (!document.hidden && !animationFrameId) startAnimationLoop(); });
      window.addEventListener("pagehide", () => { stopAudio(); });
    }

    init();
  