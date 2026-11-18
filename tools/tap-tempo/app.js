(() => {
    const root = document.getElementById('forgePulse');
    if (!root) return;

    const q = id => root.querySelector('#' + id);
    const clamp = (value,min,max) => Math.max(min,Math.min(max,value));

    const METERS = {
      '2-4':  {num:2,den:4,type:'simple',groups:[1,1],unit:'Quarter-note pulse',description:'Simple meter · two quarter-note beats'},
      '3-4':  {num:3,den:4,type:'simple',groups:[1,1,1],unit:'Quarter-note pulse',description:'Simple meter · three quarter-note beats'},
      '4-4':  {num:4,den:4,type:'simple',groups:[1,1,1,1],unit:'Quarter-note pulse',description:'Simple meter · four quarter-note beats'},
      '5-4':  {num:5,den:4,type:'simple',groups:[3,2],unit:'Quarter-note pulse',description:'Additive meter · grouped 3 + 2'},
      '7-4':  {num:7,den:4,type:'simple',groups:[4,3],unit:'Quarter-note pulse',description:'Additive meter · grouped 4 + 3'},
      '6-8':  {num:6,den:8,type:'compound',groups:[3,3],unit:'Dotted-quarter pulse',description:'Compound meter · two groups of three eighth notes'},
      '7-8':  {num:7,den:8,type:'odd8',groups:[2,2,3],unit:'Eighth-note pulse',description:'Additive meter · grouped 2 + 2 + 3'},
      '9-8':  {num:9,den:8,type:'compound',groups:[3,3,3],unit:'Dotted-quarter pulse',description:'Compound meter · three groups of three eighth notes'},
      '12-8': {num:12,den:8,type:'compound',groups:[3,3,3,3],unit:'Dotted-quarter pulse',description:'Compound meter · four groups of three eighth notes'}
    };

    const DIVISIONS = {
      simple:[
        {id:'pulse',label:'Beat',factor:1},
        {id:'eighth',label:'Eighth notes',factor:2},
        {id:'triplet',label:'Triplets',factor:3},
        {id:'sixteenth',label:'Sixteenth notes',factor:4}
      ],
      compound:[
        {id:'pulse',label:'Dotted-quarter beat',factor:1},
        {id:'eighth',label:'Eighth notes',factor:3},
        {id:'sixteenth',label:'Sixteenth notes',factor:6}
      ],
      odd8:[
        {id:'group',label:'Grouped accents',factor:1},
        {id:'eighth',label:'Every eighth note',factor:1},
        {id:'sixteenth',label:'Sixteenth notes',factor:2}
      ]
    };

    const ui = {
      orbit:q('fpOrbit'), tickLayer:q('fpTickLayer'), beatLayer:q('fpBeatLayer'),
      tapCore:q('fpTapCore'), tap:q('fpTap'), play:q('fpPlay'),
      bpm:q('fpBpm'), tempoName:q('fpTempoName'), meterNote:q('fpMeterNote'),
      status:q('fpStatus'), statusText:q('fpStatusText'), tapCount:q('fpTapCount'),
      signature:q('fpSignature'), signatureValue:q('fpSignatureValue'),
      division:q('fpDivision'), divisionValue:q('fpDivisionValue'),
      meterDescription:q('fpMeterDescription'), footnote:q('fpFootnote'),
      voice:q('fpVoice'), swing:q('fpSwing'), swingValue:q('fpSwingValue'),
      volume:q('fpVolume'), volumeValue:q('fpVolumeValue'),
      smooth:q('fpSmooth'), smoothValue:q('fpSmoothValue'),
      tempo:q('fpTempo'), tempoValue:q('fpTempoValue'),
      minus:q('fpMinus'), plus:q('fpPlus')
    };

    const state = {
      bpm:120, taps:[], lastTap:0, smoothing:8,
      running:false, step:0, scheduleId:null, audioReady:false
    };

    let limiter, masterGain, clickSynth, noiseSynth, clickFilter;

    const meter = () => METERS[ui.signature.value];
    const division = () => {
      const list = DIVISIONS[meter().type];
      return list.find(item => item.id === ui.division.value) || list[0];
    };

    function tempoLabel(bpm){
      if(bpm < 40) return 'Grave';
      if(bpm < 60) return 'Largo';
      if(bpm < 76) return 'Adagio';
      if(bpm < 108) return 'Andante';
      if(bpm < 120) return 'Moderato';
      if(bpm < 156) return 'Allegro moderato';
      if(bpm < 176) return 'Vivace';
      return 'Presto';
    }

    function setFill(input){
      const min = Number(input.min || 0);
      const max = Number(input.max || 100);
      const value = Number(input.value);
      input.style.setProperty('--fill', `${((value-min)/(max-min))*100}%`);
    }

    function setBpm(value,updateSlider=true){
      state.bpm = clamp(Math.round(value),20,240);
      ui.bpm.textContent = state.bpm;
      ui.tempoName.textContent = tempoLabel(state.bpm);
      ui.tempoValue.textContent = state.bpm;
      if(updateSlider){
        ui.tempo.value = state.bpm;
        setFill(ui.tempo);
      }
    }

    function updateDivisionOptions(){
      const current = ui.division.value;
      const options = DIVISIONS[meter().type];
      ui.division.innerHTML = '';

      options.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.label;
        ui.division.appendChild(option);
      });

      ui.division.value = options.some(item => item.id === current) ? current : options[0].id;
    }

    function updateMeterCopy(){
      const m = meter();
      const d = division();
      ui.signatureValue.textContent = `${m.num}/${m.den}`;
      ui.divisionValue.textContent = d.label === 'Grouped accents' ? m.groups.join('+') : d.label.replace(' notes','');
      ui.meterNote.textContent = m.unit;
      ui.meterDescription.innerHTML =
        `${m.description}${m.groups.length > 1 ? ` · <span class="fp-grouping">${m.groups.join(' + ')}</span>` : ''}`;

      if(m.type === 'compound'){
        ui.footnote.textContent = 'BPM follows the dotted quarter. Each pulse contains three eighth notes.';
      }else if(m.type === 'odd8'){
        ui.footnote.textContent = 'BPM follows the eighth note. Group accents preserve the 2 + 2 + 3 phrasing.';
      }else{
        ui.footnote.textContent = 'BPM follows the quarter note. Additive meters keep their displayed grouping.';
      }
    }

    function buildTicks(){
      ui.tickLayer.innerHTML = '';
      const total = 48;
      const radius = Math.max(138,ui.orbit.clientWidth*.445);
      for(let i=0;i<total;i++){
        const tick = document.createElement('span');
        tick.className = `fp-tick${i%4===0?' major':''}`;
        tick.style.setProperty('--a',`${(360/total)*i}deg`);
        tick.style.setProperty('--r',`-${radius}px`);
        ui.tickLayer.appendChild(tick);
      }
    }

    function groupStarts(groups){
      const starts = new Set([0]);
      let cursor = 0;
      groups.slice(0,-1).forEach(size => {
        cursor += size;
        starts.add(cursor);
      });
      return starts;
    }

    function visualSpec(){
      const m = meter();
      const d = division();

      if(m.type === 'simple'){
        return {
          total:m.num*d.factor,
          groupStarts:new Set(m.groups.reduce((arr,size,index)=>{
            if(index===0) return [0];
            const prior = m.groups.slice(0,index).reduce((a,b)=>a+b,0);
            arr.push(prior*d.factor);
            return arr;
          },[])),
          beatEvery:d.factor,
          silent:() => false
        };
      }

      if(m.type === 'compound'){
        const pulseCount = m.groups.length;
        return {
          total:pulseCount*d.factor,
          groupStarts:new Set(Array.from({length:pulseCount},(_,i)=>i*d.factor)),
          beatEvery:d.factor,
          silent:() => false
        };
      }

      const multiplier = d.id === 'sixteenth' ? 2 : 1;
      const starts = new Set([...groupStarts(m.groups)].map(value=>value*multiplier));
      return {
        total:m.num*multiplier,
        groupStarts:starts,
        beatEvery:multiplier,
        silent:step => d.id === 'group' && !starts.has(step)
      };
    }

    function buildBeats(){
      ui.beatLayer.innerHTML = '';
      const spec = visualSpec();

      const outerRadius = Math.max(124,ui.orbit.clientWidth*.398);
      const innerRadius = Math.max(115,ui.orbit.clientWidth*.373);

      for(let step=0;step<spec.total;step++){
        const group = spec.groupStarts.has(step);
        const beat = step % spec.beatEvery === 0;
        const dot = document.createElement('span');

        dot.className =
          'fp-beat' +
          (!beat ? ' sub' : '') +
          (step === 0 ? ' downbeat' : '') +
          (group && step !== 0 ? ' group-start' : '');

        dot.dataset.step = step;
        dot.style.setProperty('--a',`${(360/spec.total)*step}deg`);
        dot.style.setProperty('--r',beat?`-${outerRadius}px`:`-${innerRadius}px`);
        ui.beatLayer.appendChild(dot);
      }

      updateMeterCopy();
    }

    function activateStep(step){
      ui.beatLayer.querySelectorAll('.fp-beat').forEach(dot => {
        dot.classList.toggle('active',Number(dot.dataset.step) === step);
      });
    }

    function animatePulse(kind='beat',ripple=false){
      ui.orbit.classList.remove('beat','downbeat','tap-wave');
      void ui.orbit.offsetWidth;
      ui.orbit.classList.add(kind === 'downbeat' ? 'downbeat' : 'beat');
      if(ripple) ui.orbit.classList.add('tap-wave');
      setTimeout(() => ui.orbit.classList.remove('beat','downbeat','tap-wave'),820);
    }

    async function initAudio(){
      if(state.audioReady) return;
      await Tone.start();
      await Tone.context.resume();

      limiter = new Tone.Limiter(-1).toDestination();
      masterGain = new Tone.Gain(Number(ui.volume.value)).connect(limiter);
      clickFilter = new Tone.Filter({type:'highpass',frequency:440,Q:.55}).connect(masterGain);
      clickSynth = new Tone.Synth({
        oscillator:{type:'sine'},
        envelope:{attack:.001,decay:.06,sustain:0,release:.015}
      }).connect(clickFilter);
      noiseSynth = new Tone.NoiseSynth({
        noise:{type:'white'},
        envelope:{attack:.001,decay:.035,sustain:0,release:.01}
      }).connect(masterGain);
      state.audioReady = true;
    }

    function profile(kind){
      const voices = {
        crystal:{
          downbeat:{freq:2250,type:'sine',decay:.08,level:.8,noise:.025},
          group:{freq:1900,type:'sine',decay:.065,level:.68,noise:.02},
          beat:{freq:1580,type:'sine',decay:.056,level:.58,noise:.018},
          sub:{freq:1000,type:'triangle',decay:.035,level:.28,noise:.008}
        },
        wood:{
          downbeat:{freq:980,type:'triangle',decay:.07,level:.82,noise:.24},
          group:{freq:840,type:'triangle',decay:.06,level:.72,noise:.2},
          beat:{freq:720,type:'triangle',decay:.052,level:.62,noise:.18},
          sub:{freq:520,type:'sine',decay:.031,level:.3,noise:.1}
        },
        pulse:{
          downbeat:{freq:1720,type:'square',decay:.052,level:.72,noise:.018},
          group:{freq:1440,type:'square',decay:.048,level:.62,noise:.012},
          beat:{freq:1220,type:'square',decay:.042,level:.54,noise:.01},
          sub:{freq:800,type:'square',decay:.026,level:.24,noise:0}
        },
        deep:{
          downbeat:{freq:520,type:'sine',decay:.11,level:.88,noise:.04},
          group:{freq:450,type:'sine',decay:.095,level:.76,noise:.03},
          beat:{freq:390,type:'sine',decay:.082,level:.66,noise:.025},
          sub:{freq:300,type:'triangle',decay:.046,level:.28,noise:.008}
        },
        minimal:{
          downbeat:{freq:1600,type:'sine',decay:.036,level:.52,noise:0},
          group:{freq:1350,type:'sine',decay:.031,level:.46,noise:0},
          beat:{freq:1100,type:'sine',decay:.027,level:.38,noise:0},
          sub:{freq:760,type:'sine',decay:.018,level:.16,noise:0}
        }
      };
      return voices[ui.voice.value]?.[kind] || voices.crystal[kind];
    }

    function triggerClick(kind,time){
      if(!state.audioReady) return;
      const p = profile(kind);
      clickSynth.set({
        oscillator:{type:p.type},
        envelope:{attack:.001,decay:p.decay,sustain:0,release:.012}
      });
      clickSynth.triggerAttackRelease(p.freq,p.decay,time,p.level);
      if(p.noise>0) noiseSynth.triggerAttackRelease(Math.min(p.decay,.055),time,p.noise);
    }

    function stepDuration(){
      const m = meter();
      const d = division();
      const pulseSeconds = 60/state.bpm;

      if(m.type === 'simple') return pulseSeconds/d.factor;
      if(m.type === 'compound') return pulseSeconds/d.factor;
      return pulseSeconds/(d.id === 'sixteenth' ? 2 : 1);
    }

    function eventKind(step,spec){
      if(step === 0) return 'downbeat';
      if(spec.groupStarts.has(step)) return 'group';
      if(step % spec.beatEvery === 0) return 'beat';
      return 'sub';
    }

    function configureTransport(){
      if(state.scheduleId !== null){
        Tone.Transport.clear(state.scheduleId);
        state.scheduleId = null;
      }

      Tone.Transport.cancel();
      const spec = visualSpec();
      const interval = stepDuration();
      state.step = 0;

      state.scheduleId = Tone.Transport.scheduleRepeat(time => {
        const step = state.step % spec.total;
        const isSilent = spec.silent(step);
        const kind = eventKind(step,spec);
        const swing = Number(ui.swing.value);
        const swungTime = step % 2 === 1 ? time + interval*swing*.34 : time;

        if(!isSilent) triggerClick(kind,swungTime);

        Tone.Draw.schedule(() => {
          activateStep(step);
          if(!isSilent) animatePulse(kind === 'downbeat' ? 'downbeat' : 'beat');
        },swungTime);

        state.step = (state.step+1)%spec.total;
      },interval);
    }

    function syncRunningUI(){
      ui.status.classList.toggle('running',state.running);
      ui.statusText.textContent = state.running ? 'Running' : 'Idle';
      ui.play.textContent = state.running ? 'Stop pulse' : 'Start pulse';
      ui.play.classList.toggle('running',state.running);
    }

    async function toggleTransport(){
      await initAudio();
      if(!state.running){
        configureTransport();
        Tone.Transport.start('+0.03');
        state.running = true;
      }else{
        Tone.Transport.stop();
        state.running = false;
        ui.beatLayer.querySelectorAll('.fp-beat').forEach(dot=>dot.classList.remove('active'));
      }
      syncRunningUI();
    }

    function updateTransport(){
      if(!state.audioReady || !state.running) return;
      Tone.Transport.stop();
      configureTransport();
      Tone.Transport.start('+0.025');
    }

    function tapTempo(){
      const now = performance.now();
      animatePulse('downbeat',true);

      if(state.lastTap === 0){
        state.lastTap = now;
        ui.tapCount.textContent = '1 tap';
        return;
      }

      const interval = now-state.lastTap;
      state.lastTap = now;

      if(interval<250 || interval>3000){
        state.taps = [];
        ui.tapCount.textContent = '1 tap';
        return;
      }

      state.taps.push(interval);
      if(state.taps.length>state.smoothing) state.taps.shift();

      const average = state.taps.reduce((sum,value)=>sum+value,0)/state.taps.length;
      setBpm(60000/average);
      ui.tapCount.textContent = `${state.taps.length+1} taps`;
      updateTransport();
    }

    function adjustTempo(amount){
      setBpm(state.bpm+amount);
      updateTransport();
    }

    ui.tapCore.addEventListener('click',tapTempo);
    ui.tap.addEventListener('click',tapTempo);
    ui.play.addEventListener('click',toggleTransport);
    ui.minus.addEventListener('click',()=>adjustTempo(-1));
    ui.plus.addEventListener('click',()=>adjustTempo(1));

    ui.signature.addEventListener('change',()=>{
      updateDivisionOptions();
      buildBeats();
      updateTransport();
    });

    ui.division.addEventListener('change',()=>{
      buildBeats();
      updateTransport();
    });

    ui.swing.addEventListener('input',event=>{
      ui.swingValue.textContent = `${Math.round(Number(event.target.value)*100)}%`;
      setFill(event.target);
      updateTransport();
    });

    ui.volume.addEventListener('input',event=>{
      const value = Number(event.target.value);
      ui.volumeValue.textContent = `${Math.round(value*100)}%`;
      setFill(event.target);
      if(masterGain) masterGain.gain.rampTo(value,.05);
    });

    ui.smooth.addEventListener('input',event=>{
      state.smoothing = Number(event.target.value);
      ui.smoothValue.textContent = state.smoothing;
      setFill(event.target);
      while(state.taps.length>state.smoothing) state.taps.shift();
    });

    ui.tempo.addEventListener('input',event=>{
      setBpm(Number(event.target.value),false);
      setFill(event.target);
      updateTransport();
    });

    window.addEventListener('keydown',event=>{
      const target = event.target;
      const editable =
        target instanceof HTMLInputElement ||
        target instanceof HTMLSelectElement ||
        target instanceof HTMLTextAreaElement;
      if(editable) return;

      if(event.code === 'Space'){
        event.preventDefault();
        tapTempo();
      }else if(event.key.toLowerCase() === 'm'){
        event.preventDefault();
        toggleTransport();
      }else if(event.key === 'ArrowUp'){
        event.preventDefault();
        adjustTempo(1);
      }else if(event.key === 'ArrowDown'){
        event.preventDefault();
        adjustTempo(-1);
      }
    });

    let resizeTimer;
    window.addEventListener('resize',()=>{
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(()=>{
        buildTicks();
        buildBeats();
      },120);
    });

    [ui.swing,ui.volume,ui.smooth,ui.tempo].forEach(setFill);
    updateDivisionOptions();
    buildTicks();
    buildBeats();
    setBpm(120);
    syncRunningUI();
  })();
