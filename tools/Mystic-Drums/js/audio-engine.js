  /* ── AUDIO ENGINE ──────────────────────────────────────────────────────────*/
  async function initAudio(){
    if(toneReady) return;
    await Tone.start();

    drumBus    = new Tone.Gain(1).toDestination();
    limiter    = new Tone.Limiter(-1).connect(drumBus);
    masterGain = new Tone.Gain(0.9).connect(limiter);

    recordDest = Tone.getContext().rawContext.createMediaStreamDestination();
    drumBus.connect(recordDest);

    reverbSend = new Tone.Gain(0).connect(masterGain);
    reverb     = new Tone.Reverb({decay:2.8,preDelay:0.05,wet:1}).connect(reverbSend);
    warmth     = new Tone.Distortion({distortion:0.15,oversample:'4x',wet:0.3}).connect(masterGain);

    const out = ()=>warmth;

    voices = {};

    // ── KICK – chaîne anti-crack ─────────────────────────────────────────────
    // • attack 0.003 s (au lieu de 0.001) → élimine la discontinuité DC
    // • pitchDecay 0.045, octaves 4 → valeurs stables sans artefact haute-fréq
    // • HPF 20 Hz → retire le DC offset résiduel
    // • Compresseur doux → arrondit le transient sans écrêter
    // • Sortie directe vers masterGain, bypasse warmth/distortion
    voices.kick = {};
    voices.kick.synth = new Tone.MembraneSynth({
      pitchDecay : 0.045,
      octaves    : 4,
      oscillator : { type:'sine' },
      envelope   : { attack:0.003, decay:0.35, sustain:0, release:0.2 }
    });
    voices.kick.hpf  = new Tone.Filter({ type:'highpass', frequency:20, rolloff:-12 });
    voices.kick.comp = new Tone.Compressor({ threshold:-18, ratio:4, attack:0.002, release:0.12, knee:6 });
    voices.kick.gain = new Tone.Gain(1).connect(masterGain); // bypass distortion
    voices.kick.synth.connect(voices.kick.hpf);
    voices.kick.hpf.connect(voices.kick.comp);
    voices.kick.comp.connect(voices.kick.gain);

    // ── SNARE ────────────────────────────────────────────────────────────────
    voices.snare = {};
    voices.snare.synth  = new Tone.NoiseSynth({ noise:{type:'white'}, envelope:{attack:0.002,decay:0.18,sustain:0,release:0.08} });
    voices.snare.filter = new Tone.Filter({ type:'bandpass', frequency:2300, Q:1.4 });
    voices.snare.gain   = new Tone.Gain(1).connect(out());
    voices.snare.synth.connect(voices.snare.filter);
    voices.snare.filter.connect(voices.snare.gain);

    // ── CLOSED HAT ───────────────────────────────────────────────────────────
    voices.ch = {};
    voices.ch.synth  = new Tone.NoiseSynth({ noise:{type:'white'}, envelope:{attack:0.002,decay:0.07,sustain:0} });
    voices.ch.filter = new Tone.Filter({ type:'highpass', frequency:7000, Q:0.8 });
    voices.ch.gain   = new Tone.Gain(1).connect(out());
    voices.ch.synth.connect(voices.ch.filter);
    voices.ch.filter.connect(voices.ch.gain);

    // ── OPEN HAT ─────────────────────────────────────────────────────────────
    voices.oh = {};
    voices.oh.synth  = new Tone.NoiseSynth({ noise:{type:'white'}, envelope:{attack:0.002,decay:0.3,sustain:0} });
    voices.oh.filter = new Tone.Filter({ type:'highpass', frequency:6500, Q:0.7 });
    voices.oh.gain   = new Tone.Gain(1).connect(out());
    voices.oh.synth.connect(voices.oh.filter);
    voices.oh.filter.connect(voices.oh.gain);

    // ── RITUAL BELL ──────────────────────────────────────────────────────────
    voices.perc = {};
    voices.perc.synth = new Tone.PolySynth(Tone.FMSynth, {
      maxPolyphony:8, oscillator:{type:'sine'}, modulationIndex:8,
      envelope:{attack:0.002,decay:0.25,sustain:0,release:0.25},
      modulationEnvelope:{attack:0.002,decay:0.15,sustain:0,release:0.1}
    });
    voices.perc.gain    = new Tone.Gain(0.8).connect(out());
    voices.perc.revSend = new Tone.Gain(0.35).connect(reverb);
    voices.perc.synth.connect(voices.perc.gain);

    Tone.Transport.loop      = true;
    Tone.Transport.loopStart = 0;
    Tone.Transport.loopEnd   = '1m';

    Tone.Transport.scheduleRepeat((time)=>{
      const stepIndex = Math.floor((Tone.Transport.ticks / Tone.Time('16n').toTicks()) % stepsCount);
      currentStep = stepIndex;

      if(stepIndex===0 && lockAB && lastStep===stepsCount-1){
        currentBank = currentBank==='A'?'B':'A';
        updateABButtons();
        refreshGridFromPatterns();
        refreshRowLocksForCurrentBank();
      }
      lastStep = stepIndex;

      for(let i=0;i<stepsCount;i++)
        stepCells[i].forEach(c=>c.classList.toggle('playhead',i===stepIndex));

      instruments.forEach(inst=>{
        if(params[inst.id].muted) return;
        if(!patterns[currentBank][inst.id][stepIndex]) return;
        trigger(inst.id, time);
      });
    }, '16n');

    applyAllParams();
    updateGlobal();
    toneReady = true;
    setStatus('ready','Engine ready. Load a preset or draw a pattern.');
  }

  function trigger(id, time){
    switch(id){
      case 'kick': {
        // ── Guard anti-crack : ignore si moins de 75 ms depuis le dernier hit ──
        const now = Tone.getContext().currentTime;
        if(now - kickLastTrigTime < KICK_RETRIG_MIN) return;
        kickLastTrigTime = now;

        // Fréquence cible calculée proprement et clampée [40–200 Hz]
        const toneHz = Math.max(40, Math.min(200, 50 + params.kick.tone * 40));
        const note   = Tone.Frequency(toneHz, 'hz').toNote();
        voices.kick.synth.triggerAttackRelease(note, 0.4, time);
        break;
      }
      case 'snare':
        voices.snare.synth.triggerAttackRelease('16n', time); break;
      case 'ch':
        voices.ch.synth.triggerAttackRelease('16n', time); break;
      case 'oh':
        voices.oh.synth.triggerAttackRelease('8n', time); break;
      case 'perc': {
        const shift = (params.perc.tone - 0.5) * 6;
        const f     = 440 * Math.pow(2, shift / 12);
        voices.perc.synth.triggerAttackRelease(f, '16n', time);
        break;
      }
    }
  }

  function applyParam(id, key){
    if(!voices) return;
    const v = params[id][key];

    if(key==='volume'){
      voices[id].gain.gain.rampTo(v, 0.05);
    }
    if(key==='decay'){
      const d = 0.05 + v * 0.95;
      if(id==='kick'){
        // Rampe lente pour éviter un crack lors du changement en temps réel
        voices.kick.synth.envelope.decay   = d * 0.8;
        voices.kick.synth.envelope.release = d * 0.4;
      } else if(id==='snare'){
        voices.snare.synth.envelope.decay = 0.05 + d * 0.25;
      } else if(id==='ch'){
        voices.ch.synth.envelope.decay = 0.01 + d * 0.12;
      } else if(id==='oh'){
        voices.oh.synth.envelope.decay = 0.12 + d * 0.35;
      }
    }
    if(key==='tone'){
      if(id==='kick'){
        // octaves clamped [2–5] et pitchDecay clamped pour éviter des artefacts
        voices.kick.synth.octaves    = Math.max(2, Math.min(5, 2 + v * 2));
        voices.kick.synth.pitchDecay = Math.max(0.02, Math.min(0.1, 0.02 + (1-v) * 0.06));
      } else if(id==='snare'){
        voices.snare.filter.frequency.value = 1400 + v * 2200;
      } else if(id==='ch'){
        voices.ch.filter.frequency.value = 6000 + v * 5000;
      } else if(id==='oh'){
        voices.oh.filter.frequency.value = 5500 + v * 5500;
      } else if(id==='perc'){
        voices.perc.synth.options = { ...voices.perc.synth.options, modulationIndex: 4 + v * 12 };
      }
    }
  }

  function applyAllParams(){
    instruments.forEach(inst=>{
      ['volume','decay','tone'].forEach(k=>applyParam(inst.id,k));
      if(voices&&voices[inst.id]) voices[inst.id].gain.mute=params[inst.id].muted;
    });
  }

  function updateGlobal(){
    const bpm=+tempoEl.value, sw=+swingEl.value, vb=+verbEl.value, wt=+warmthEl.value;
    tempoVal.textContent=bpm+' BPM';
    swingVal.textContent=sw+' %';
    verbVal.textContent=vb+' % verb';
    warmthVal.textContent=wt+' % tape';
    if(!toneReady) return;
    Tone.Transport.bpm.rampTo(bpm, 0.05);
    Tone.Transport.swing = sw/100;
    Tone.Transport.swingSubdivision = '16n';
    reverbSend.gain.rampTo(vb/100*0.9, 0.1);
    warmth.distortion = 0.05 + (wt/100)*0.3;
    warmth.wet.rampTo(0.15 + (wt/100)*0.4, 0.1);
  }

