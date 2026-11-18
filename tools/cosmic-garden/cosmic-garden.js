/* ============================================================
   COSMIC GARDEN
   Chrysasynth
   ============================================================ */

(() => {

  "use strict";


  /* ==========================================================
     REQUIRE THREE
     ========================================================== */

  if (!window.THREE) {

    console.error(
      "Cosmic Garden: Three.js could not be loaded."
    );

    return;

  }


  const THREE =
    window.THREE;


  /* ==========================================================
     DOM
     ========================================================== */

  const stage =
    document.getElementById(
      "garden-observatory"
    );


  const canvas =
    document.getElementById(
      "cosmic-canvas"
    );


  const scaleSelect =
    document.getElementById(
      "scale-select"
    );


  const waveSelect =
    document.getElementById(
      "wave-select"
    );


  const toneSlider =
    document.getElementById(
      "tone-slider"
    );


  const freezeSlider =
    document.getElementById(
      "freeze-slider"
    );


  const levelSlider =
    document.getElementById(
      "level-slider"
    );


  const toneVal =
    document.getElementById(
      "tone-val"
    );


  const freezeVal =
    document.getElementById(
      "freeze-val"
    );


  const levelVal =
    document.getElementById(
      "level-val"
    );


  const resonanceValue =
    document.getElementById(
      "resonance-value"
    );


  const bloomLabel =
    document.getElementById(
      "garden-bloom-label"
    );


  const recButton =
    document.getElementById(
      "rec-button"
    );


  const recLabel =
    document.getElementById(
      "rec-label"
    );


  const exportButton =
    document.getElementById(
      "export-button"
    );


  if (
    !stage ||
    !canvas
  ) {

    console.error(
      "Cosmic Garden: stage or canvas missing."
    );

    return;

  }


  /* ==========================================================
     THREE SCENE
     ========================================================== */

  const scene =
    new THREE.Scene();


  scene.background =
    new THREE.Color(
      0x010307
    );


  scene.fog =
    new THREE.FogExp2(
      0x010307,
      0.0042
    );


  const camera =
    new THREE.PerspectiveCamera(
      50,
      1,
      0.1,
      500
    );


  const renderer =
    new THREE.WebGLRenderer({

      canvas,

      antialias:true,

      alpha:false,

      powerPreference:
        "high-performance"

    });


  renderer.outputColorSpace =
    THREE.SRGBColorSpace;


  renderer.setPixelRatio(

    Math.min(
      window.devicePixelRatio || 1,
      1.7
    )

  );


  /* ==========================================================
     CAMERA / ORBIT
     Custom, no OrbitControls dependency.
     ========================================================== */

  let cameraYaw =
    0.12;


  let cameraPitch =
    0.12;


  let cameraDistance =
    32;


  let targetYaw =
    cameraYaw;


  let targetPitch =
    cameraPitch;


  let targetDistance =
    cameraDistance;


  let isDragging =
    false;


  let dragDistance =
    0;


  let pointerStartX =
    0;


  let pointerStartY =
    0;


  let previousX =
    0;


  let previousY =
    0;


  function updateCamera(){

    cameraYaw +=
      (
        targetYaw -
        cameraYaw
      ) *
      0.17;


    cameraPitch +=
      (
        targetPitch -
        cameraPitch
      ) *
      0.17;


    cameraDistance +=
      (
        targetDistance -
        cameraDistance
      ) *
      0.17;


    const cosPitch =
      Math.cos(
        cameraPitch
      );


    camera.position.set(

      Math.sin(
        cameraYaw
      ) *
      cosPitch *
      cameraDistance,

      Math.sin(
        cameraPitch
      ) *
      cameraDistance,

      Math.cos(
        cameraYaw
      ) *
      cosPitch *
      cameraDistance

    );


    camera.lookAt(
      0,
      0,
      0
    );

  }


  /* ==========================================================
     COLORS
     ========================================================== */

  const COLORS = {

    cyan:
      new THREE.Color(
        0x7bdbe8
      ),

    violet:
      new THREE.Color(
        0xa491ee
      ),

    pink:
      new THREE.Color(
        0xdd8fc8
      ),

    gold:
      new THREE.Color(
        0xe8c894
      ),

    white:
      new THREE.Color(
        0xeefeff
      )

  };


  /* ==========================================================
     GARDEN NODE
     ========================================================== */

  class GardenNode {

    constructor(
      position,
      level,
      branch,
      leaf = false
    ){

      this.position =
        position;


      this.level =
        level;


      this.branch =
        branch;


      this.leaf =
        leaf;


      this.noteIndex =
        0;


      this.connections =
        [];


      this.sprite =
        null;


      this.baseScale =
        leaf
          ? 0.76
          : 0.48;


      this.energy =
        0;


      this.targetEnergy =
        0;


      this.phase =
        Math.random() *
        Math.PI *
        2;

    }


    connect(
      other
    ){

      if (
        !other ||
        other === this
      ) {
        return;
      }


      if (
        this.connections
          .includes(
            other
          )
      ) {
        return;
      }


      this.connections.push(
        other
      );


      other.connections.push(
        this
      );

    }

  }


  /* ==========================================================
     GARDEN DATA
     ========================================================== */

  const nodes =
    [];


  const root =
    new GardenNode(

      new THREE.Vector3(
        0,
        0,
        0
      ),

      0,

      0,

      false

    );


  root.baseScale =
    1.2;


  nodes.push(
    root
  );


  /* ==========================================================
     GARDEN GENERATION
     More organic than original radial graph.
     ========================================================== */

  function generateGarden(){

    nodes.length =
      1;


    root.connections =
      [];


    root.position.set(
      0,
      0,
      0
    );


    const branches =
      7;


    for (
      let branchIndex = 0;
      branchIndex < branches;
      branchIndex++
    ){

      const longitude =

        (
          branchIndex /
          branches
        ) *
        Math.PI *
        2 +

        branchIndex *
        0.17;


      const vertical =
        THREE.MathUtils.randFloat(
          -0.62,
          0.62
        );


      let previous =
        root;


      const count =
        THREE.MathUtils.randInt(
          7,
          10
        );


      for (
        let step = 1;
        step <= count;
        step++
      ){

        const t =
          step /
          count;


        const radius =
          3.1 +

          t *
          15.5;


        const spiral =

          longitude +

          Math.sin(
            t *
            Math.PI
          ) *
          0.22;


        const position =
          new THREE.Vector3(

            Math.cos(
              spiral
            ) *
            radius,

            vertical *
            radius *
            0.62 +

            Math.sin(
              t *
              Math.PI *
              1.8 +
              branchIndex
            ) *
            1.25,

            Math.sin(
              spiral
            ) *
            radius

          );


        position.x +=
          THREE.MathUtils.randFloatSpread(
            0.55
          );


        position.y +=
          THREE.MathUtils.randFloatSpread(
            0.45
          );


        position.z +=
          THREE.MathUtils.randFloatSpread(
            0.55
          );


        const leaf =
          step === count;


        const node =
          new GardenNode(

            position,

            step,

            branchIndex,

            leaf

          );


        nodes.push(
          node
        );


        previous.connect(
          node
        );


        previous =
          node;


        /*
         * Tiny secondary growth.
         */

        if (
          step > 3 &&
          step < count &&
          Math.random() < 0.22
        ){

          const sidePosition =
            position
              .clone();


          sidePosition.add(

            new THREE.Vector3(

              THREE.MathUtils
                .randFloatSpread(
                  2.2
                ),

              THREE.MathUtils
                .randFloatSpread(
                  1.7
                ),

              THREE.MathUtils
                .randFloatSpread(
                  2.2
                )

            )

          );


          const side =
            new GardenNode(

              sidePosition,

              step + 1,

              branchIndex,

              true

            );


          nodes.push(
            side
          );


          node.connect(
            side
          );

        }

      }

    }


    nodes.forEach(
      (
        node,
        index
      ) => {

        node.noteIndex =
          index;

      }
    );

  }


  generateGarden();


  /* ==========================================================
     FORGE V3 : SCALE MORPHOLOGY
     Five deterministic geometries, matched to the existing scales.
     All nodes retain their identities and interactive sound mapping.
     ========================================================== */
  const IDENTITIES = {
    majAmbient:{label:'Radial Bloom',palette:['#eed5a4','#a3e8c7','#86b9da'],type:'radial'},
    lydian:{label:'Celestial Helix',palette:['#c5f4e8','#95d5eb','#b9a2f0'],type:'helix'},
    dorian:{label:'Twin Currents',palette:['#9ce7d4','#55bcb3','#718bdd'],type:'double'},
    minor:{label:'Nocturnal Canopy',palette:['#bea5e9','#7795cf','#a4b8d4'],type:'canopy'},
    jap:{label:'Five Lanterns',palette:['#f0d6aa','#d9abca','#aedfd9'],type:'lanterns'}
  };
  let visualIdentity=IDENTITIES.majAmbient;
  const originalPositions=nodes.map(n=>n.position.clone());
  const morphTargets=nodes.map(n=>n.position.clone());
  const morphStartPositions=nodes.map(n=>n.position.clone());
  let morphProgress=1;
  const morphDuration=1.55;
  let morphStartTime=0;
  function identityPosition(n,index,kind){
    if(index===0) return new THREE.Vector3();
    const branch=n.branch, step=Math.max(1,n.level),t=Math.min(1,step/11), leaf=n.leaf;
    const a=branch*Math.PI*2/7;
    const r=2+15*t;
    const flutter=Math.sin(step*1.13+branch*.7);
    if(kind==='helix'){
      const theta=a+2.8*t+flutter*.12;
      return new THREE.Vector3(Math.cos(theta)*(3+8*t),-10+20*t+flutter*.45,Math.sin(theta)*(3+8*t));
    }
    if(kind==='double'){
      const theta=(branch%2)*Math.PI+4.7*t+(branch/7)*.36;
      return new THREE.Vector3(Math.cos(theta)*(2+10*t),-7+14*t+(branch-3)*.36,Math.sin(theta)*(2+10*t));
    }
    if(kind==='canopy'){
      const theta=a+flutter*.095;
      return new THREE.Vector3(Math.cos(theta)*(2+14*t),5+8*Math.sin(Math.PI*t)-16*t*t+flutter*.5,Math.sin(theta)*(2+14*t));
    }
    if(kind==='lanterns'){
      const group=branch%5,theta=group*Math.PI*2/5;
      const radius=(2+13*t)*(branch>4?.86:1);
      return new THREE.Vector3(Math.cos(theta)*radius+Math.sin(step*.8+branch)*.65,
        Math.sin(theta*2)*3+Math.sin(t*Math.PI*2+group)*2.5,
        Math.sin(theta)*radius+Math.cos(step*.7+branch)*.6);
    }
    return new THREE.Vector3(Math.cos(a+flutter*.07)*r,Math.sin(t*Math.PI*1.6+branch)*2.3,Math.sin(a+flutter*.07)*r);
  }
  function startMorph(identityName){
    visualIdentity=IDENTITIES[identityName]||IDENTITIES.majAmbient;
    nodes.forEach((node,i)=>{
      morphStartPositions[i].copy(node.position);
      morphTargets[i].copy(identityPosition(node,i,visualIdentity.type));
    });
    morphProgress=0;
    morphStartTime=performance.now()*.001;
  }

  /* ==========================================================
     SPRITE TEXTURE
     ========================================================== */

  function makeGlowTexture(){

    const textureCanvas =
      document.createElement(
        "canvas"
      );


    textureCanvas.width =
      128;


    textureCanvas.height =
      128;


    const context =
      textureCanvas.getContext(
        "2d"
      );


    const gradient =
      context.createRadialGradient(

        64,
        64,
        0,

        64,
        64,
        64

      );


    gradient.addColorStop(
      0,
      "rgba(255,255,255,1)"
    );


    gradient.addColorStop(
      .08,
      "rgba(255,255,255,.98)"
    );


    gradient.addColorStop(
      .25,
      "rgba(175,235,245,.65)"
    );


    gradient.addColorStop(
      .52,
      "rgba(146,113,236,.22)"
    );


    gradient.addColorStop(
      1,
      "rgba(0,0,0,0)"
    );


    context.fillStyle =
      gradient;


    context.fillRect(
      0,
      0,
      128,
      128
    );


    const texture =
      new THREE.CanvasTexture(
        textureCanvas
      );


    texture.colorSpace =
      THREE.SRGBColorSpace;


    return texture;

  }


  const glowTexture =
    makeGlowTexture();


  /* ==========================================================
     NODE GROUP
     ========================================================== */

  const seedGroup =
    new THREE.Group();


  scene.add(
    seedGroup
  );


  function nodeColor(
    node
  ){

    if (
      node === root
    ) {

      return COLORS.gold
        .clone();

    }


    if (
      node.leaf
    ) {

      return COLORS.pink
        .clone()
        .lerp(
          COLORS.violet,
          0.28
        );

    }


    const ratio =
      Math.min(
        1,
        node.level /
        8
      );


    return COLORS.cyan
      .clone()
      .lerp(
        COLORS.violet,
        ratio *
        0.72
      );

  }


  nodes.forEach(
    node => {

      const material =
        new THREE.SpriteMaterial({

          map:
            glowTexture,

          color:
            nodeColor(
              node
            ),

          transparent:
            true,

          opacity:
            node === root
              ? 1
              : 0.72,

          blending:
            THREE.AdditiveBlending,

          depthWrite:
            false

        });


      const sprite =
        new THREE.Sprite(
          material
        );


      sprite.position.copy(
        node.position
      );


      sprite.scale.setScalar(
        node.baseScale *
        3
      );


      sprite.userData.node =
        node;


      node.sprite =
        sprite;


      seedGroup.add(
        sprite
      );

    }
  );


  /* ==========================================================
     CENTRAL SEED
     ========================================================== */

  const coreGeometry =
    new THREE.IcosahedronGeometry(
      0.32,
      2
    );


  const coreMaterial =
    new THREE.MeshBasicMaterial({

      color:
        0xf2ddaf,

      transparent:
        true,

      opacity:
        .92

    });


  const coreMesh =
    new THREE.Mesh(

      coreGeometry,

      coreMaterial

    );


  scene.add(
    coreMesh
  );


  /* ==========================================================
     ORGANIC BRANCHES
     ========================================================== */

  const branchGroup =
    new THREE.Group();


  scene.add(
    branchGroup
  );


  const connectionMap =
    new Set();


  function addBranch(
    from,
    to
  ){

    const a =
      from.position
        .clone();


    const b =
      to.position
        .clone();


    const middle =
      a.clone()
        .lerp(
          b,
          .5
        );


    const distance =
      a.distanceTo(
        b
      );


    middle.x +=
      Math.sin(
        from.noteIndex *
        1.7
      ) *
      distance *
      .08;


    middle.y +=
      Math.cos(
        to.noteIndex *
        1.3
      ) *
      distance *
      .10;


    middle.z +=
      Math.sin(
        (
          from.noteIndex +
          to.noteIndex
        ) *
        .8
      ) *
      distance *
      .08;


    const curve =
      new THREE.QuadraticBezierCurve3(

        a,

        middle,

        b

      );


    const geometry =
      new THREE.BufferGeometry()
        .setFromPoints(
          curve.getPoints(
            22
          )
        );


    const color =
      nodeColor(
        from
      )
      .lerp(
        nodeColor(
          to
        ),
        .5
      );


    const material =
      new THREE.LineBasicMaterial({

        color,

        transparent:
          true,

        opacity:
          .13,

        blending:
          THREE.AdditiveBlending,

        depthWrite:
          false

      });


    const line =
      new THREE.Line(

        geometry,

        material

      );


    line.userData = {

      from,

      to,

      baseOpacity:
        .13,

      energy:
        0

    };


    branchGroup.add(
      line
    );

  }


  nodes.forEach(
    node => {

      node.connections
        .forEach(
          other => {

            const a =
              nodes.indexOf(
                node
              );


            const b =
              nodes.indexOf(
                other
              );


            const key =
              a < b
                ? `${a}-${b}`
                : `${b}-${a}`;


            if (
              connectionMap.has(
                key
              )
            ) {
              return;
            }


            connectionMap.add(
              key
            );


            addBranch(
              node,
              other
            );

          }
        );

    }
  );


  function syncBranchGeometries(){
    branchGroup.children.forEach(line=>{
      const {from,to}=line.userData;
      const a=from.position,b=to.position;
      const middle=a.clone().lerp(b,.5);
      const dir=b.clone().sub(a);
      middle.x+=dir.y*.11;
      middle.y-=dir.x*.11;
      middle.z+=Math.sin(from.noteIndex*1.7)*.3;
      const positions=line.geometry.attributes.position;
      for(let i=0;i<positions.count;i++){
        const t=i/(positions.count-1),u=1-t;
        positions.setXYZ(i,u*u*a.x+2*u*t*middle.x+t*t*b.x,
          u*u*a.y+2*u*t*middle.y+t*t*b.y,
          u*u*a.z+2*u*t*middle.z+t*t*b.z);
      }
      positions.needsUpdate=true;
      line.geometry.computeBoundingSphere();
    });
  }

  /* ==========================================================
     BACKGROUND SPORES
     ========================================================== */

  const sporeGeometry =
    new THREE.BufferGeometry();


  const sporePositions =
    [];


  const SPORE_COUNT =
    650;


  for (
    let index = 0;
    index < SPORE_COUNT;
    index++
  ){

    const radius =
      THREE.MathUtils.randFloat(
        26,
        78
      );


    const theta =
      THREE.MathUtils.randFloat(
        0,
        Math.PI *
        2
      );


    const phi =
      Math.acos(
        THREE.MathUtils.randFloatSpread(
          2
        )
      );


    sporePositions.push(

      radius *
      Math.sin(phi) *
      Math.cos(theta),

      radius *
      Math.sin(phi) *
      Math.sin(theta),

      radius *
      Math.cos(phi)

    );

  }


  sporeGeometry.setAttribute(

    "position",

    new THREE
      .Float32BufferAttribute(
        sporePositions,
        3
      )

  );


  const sporeMaterial =
    new THREE.PointsMaterial({

      color:
        0x8fa7bb,

      size:
        .055,

      transparent:
        true,

      opacity:
        .23,

      depthWrite:
        false

    });


  const spores =
    new THREE.Points(

      sporeGeometry,

      sporeMaterial

    );


  scene.add(
    spores
  );


  /* ==========================================================
     AUDIO
     ========================================================== */

  const AudioContextClass =

    window.AudioContext ||
    window.webkitAudioContext;


  let audioCtx =
    null;


  let masterGain =
    null;


  let dryBus =
    null;


  let reverbBus =
    null;


  let convolver =
    null;


  let reverbTone =
    null;


  let waveType =
    "round";


  let freezeAmount =
    0.70;


  let levelAmount =
    0.55;


  const activeVoices =
    [];


  const MAX_VOICES =
    8;


  const scales = {

    majAmbient:
      [0,2,4,7,9],

    lydian:
      [0,2,4,6,7,9],

    dorian:
      [0,2,3,5,7,9,10],

    minor:
      [0,3,5,7,10],

    jap:
      [0,2,5,7,9]

  };


  const roots = {

    majAmbient:
      60,

    lydian:
      60,

    dorian:
      62,

    minor:
      57,

    jap:
      62

  };


  let currentScaleName =
    "majAmbient";


  let currentScale =
    scales[
      currentScaleName
    ];


  const reverbSettings = {

    duration:
      5,

    decay:
      3.5,

    toneFreq:
      8000

  };


  function midiToFrequency(
    midi
  ){

    return 440 *
      Math.pow(
        2,
        (
          midi - 69
        ) /
        12
      );

  }


  function buildImpulse(
    context,
    duration,
    decay
  ){

    const sampleRate =
      context.sampleRate;


    const length =
      Math.floor(
        sampleRate *
        duration
      );


    const buffer =
      context.createBuffer(
        2,
        length,
        sampleRate
      );


    for (
      let channel = 0;
      channel < 2;
      channel++
    ){

      const data =
        buffer.getChannelData(
          channel
        );


      for (
        let index = 0;
        index < length;
        index++
      ){

        const t =
          index /
          length;


        data[index] =

          (
            Math.random() *
            2 -
            1
          ) *

          Math.pow(
            1 - t,
            decay
          ) *

          (
            channel === 0
              ? .9
              : .8
          );

      }

    }


    return buffer;

  }


  function buildAudioGraph(
    context
  ){

    const master =
      context.createGain();


    const dry =
      context.createGain();


    const reverb =
      context.createGain();


    const impulse =
      context.createConvolver();


    const tone =
      context.createBiquadFilter();


    const highPass =
      context.createBiquadFilter();


    master.gain.value =
      levelAmount;


    dry.gain.value =

      .6 *

      (
        1 -
        freezeAmount *
        .45
      );


    reverb.gain.value =

      .5 +

      freezeAmount *
      .9;


    impulse.buffer =
      buildImpulse(

        context,

        reverbSettings.duration,

        reverbSettings.decay

      );


    tone.type =
      "lowpass";


    tone.frequency.value =
      reverbSettings.toneFreq;


    tone.Q.value =
      .7;


    highPass.type =
      "highpass";


    highPass.frequency.value =
      80;


    dry.connect(
      highPass
    );


    reverb.connect(
      highPass
    );


    highPass.connect(
      master
    );


    master.connect(
      context.destination
    );


    impulse.connect(
      tone
    );


    tone.connect(
      reverb
    );


    return {

      master,
      dry,
      reverb,
      impulse,
      tone

    };

  }


  function initAudio(){

    if (
      audioCtx
    ) {
      return;
    }


    audioCtx =
      new AudioContextClass();


    const graph =
      buildAudioGraph(
        audioCtx
      );


    masterGain =
      graph.master;


    dryBus =
      graph.dry;


    reverbBus =
      graph.reverb;


    convolver =
      graph.impulse;


    reverbTone =
      graph.tone;

  }


  function noteForNode(
    node
  ){

    const degree =

      currentScale[
        node.noteIndex %
        currentScale.length
      ];


    const radius =
      node.position.length();


    let octave =
      4;


    if (
      radius < 8
    ) {

      octave =
        3;

    }
    else if (
      radius > 18
    ) {

      octave =
        5;

    }


    return (

      roots[
        currentScaleName
      ] +

      degree +

      (
        octave - 4
      ) *
      12

    );

  }


  function playChordOnContext(
    context,
    graph,
    node,
    offset = 0
  ){

    const now =

      context.currentTime +
      offset;


    const rootMidi =
      noteForNode(
        node
      );


    const frequencies = [

      midiToFrequency(
        rootMidi
      ),

      midiToFrequency(
        rootMidi + 7
      ),

      midiToFrequency(
        rootMidi + 16
      )

    ];


    const gain =
      context.createGain();


    gain.gain.setValueAtTime(
      0,
      now
    );


    gain.gain.linearRampToValueAtTime(
      .40,
      now + .85
    );


    gain.gain.linearRampToValueAtTime(
      0,
      now + 9
    );


    const pan =
      context.createStereoPanner();


    pan.pan.setValueAtTime(

      THREE.MathUtils.clamp(
        node.position.x /
        20,
        -1,
        1
      ),

      now

    );


    const preReverb =
      context.createGain();


    preReverb.gain.value =
      .9;


    gain.connect(
      pan
    );


    pan.connect(
      graph.dry
    );


    pan.connect(
      preReverb
    );


    preReverb.connect(
      graph.impulse
    );


    const oscillators =

      frequencies.map(
        frequency => {

          const oscillator =
            context.createOscillator();


          let type =
            "sine";


          if (
            waveType ===
            "triangle"
          ) {

            type =
              "triangle";

          }


          if (
            waveType ===
            "softsquare"
          ) {

            type =
              "square";

          }


          oscillator.type =
            type;


          oscillator.frequency
            .setValueAtTime(
              frequency,
              now
            );


          if (
            waveType ===
            "softsquare"
          ){

            const filter =
              context
                .createBiquadFilter();


            filter.type =
              "lowpass";


            filter.frequency.value =
              3800;


            oscillator.connect(
              filter
            );


            filter.connect(
              gain
            );

          }
          else{

            oscillator.connect(
              gain
            );

          }


          oscillator.start(
            now
          );


          oscillator.stop(
            now + 9.5
          );


          return oscillator;

        }
      );


    return {

      gain,
      oscillators

    };

  }


  /* ==========================================================
     RECORDING
     ========================================================== */

  let isRecording =
    false;


  let recordStart =
    0;


  let recordEvents =
    [];


  function toggleRecording(){

    initAudio();


    if (
      !audioCtx
    ) {
      return;
    }


    if (
      !isRecording
    ){

      isRecording =
        true;


      recordEvents =
        [];


      recordStart =
        audioCtx.currentTime;


      recButton.classList.add(
        "is-recording"
      );


      recLabel.textContent =
        "Recording";


      exportButton.disabled =
        true;

    }
    else{

      isRecording =
        false;


      recButton.classList.remove(
        "is-recording"
      );


      recLabel.textContent =
        "Record";


      exportButton.disabled =
        recordEvents.length ===
        0;

    }

  }


  recButton.addEventListener(
    "click",
    toggleRecording
  );


  /* ==========================================================
     BLOOM / SOUND
     ========================================================== */

  function bloomNode(
    node,
    propagate = true
  ){
    igniteFilaments(node);

    node.targetEnergy =
      1;


    bloomLabel.classList.add(
      "is-awake"
    );


    bloomLabel.firstElementChild
      .textContent =
        "RESONATING";


    branchGroup.children
      .forEach(
        line => {

          const from =
            line.userData.from;


          const to =
            line.userData.to;


          if (
            from === node ||
            to === node
          ){

            line.userData.energy =
              1;

          }

        }
      );


    if (
      propagate
    ){

      node.connections
        .forEach(
          connected => {

            connected.targetEnergy =
              Math.max(
                connected.targetEnergy,
                .38
              );

          }
        );

    }


    setTimeout(
      () => {

        node.targetEnergy =
          0;


        node.connections
          .forEach(
            connected => {

              connected.targetEnergy =
                0;

            }
          );

      },

      1500 +
      freezeAmount *
      2600

    );

  }


  function playNode(
    node
  ){

    initAudio();


    if (
      audioCtx.state ===
      "suspended"
    ){

      audioCtx.resume();

    }


    const voice =
      playChordOnContext(

        audioCtx,

        {
          dry:
            dryBus,

          impulse:
            convolver
        },

        node

      );


    activeVoices.push(
      voice
    );


    if (
      activeVoices.length >
      MAX_VOICES
    ){

      const oldVoice =
        activeVoices.shift();


      if (
        oldVoice?.gain
      ){

        oldVoice.gain.gain
          .setTargetAtTime(

            0,

            audioCtx.currentTime,

            .6

          );

      }

    }


    if (
      isRecording
    ){

      recordEvents.push({

        time:

          audioCtx.currentTime -
          recordStart,

        nodeIndex:
          nodes.indexOf(
            node
          )

      });

    }


    bloomNode(
      node
    );

  }


  /* ==========================================================
     RAYCAST
     ========================================================== */

  const raycaster =
    new THREE.Raycaster();


  const pointer =
    new THREE.Vector2();


  function triggerAt(
    clientX,
    clientY
  ){

    const rect =
      stage.getBoundingClientRect();


    pointer.x =

      (
        (
          clientX -
          rect.left
        ) /
        rect.width
      ) *
      2 -
      1;


    pointer.y =

      -
      (
        (
          clientY -
          rect.top
        ) /
        rect.height
      ) *
      2 +
      1;


    raycaster.setFromCamera(
      pointer,
      camera
    );


    const hits =
      raycaster.intersectObjects(

        seedGroup.children,

        false

      );


    if (
      !hits.length
    ) {
      return;
    }


    const node =
      hits[0]
        .object
        .userData
        .node;


    if (
      node
    ){

      playNode(
        node
      );

    }

  }


  /* ==========================================================
     POINTER ORBIT
     ========================================================== */

  canvas.addEventListener(
    "pointerdown",
    event => {

      isDragging =
        true;


      dragDistance =
        0;


      pointerStartX =
        event.clientX;


      pointerStartY =
        event.clientY;


      previousX =
        event.clientX;


      previousY =
        event.clientY;


      canvas.setPointerCapture(
        event.pointerId
      );

    }
  );


  canvas.addEventListener(
    "pointermove",
    event => {

      if (
        !isDragging
      ) {
        return;
      }


      const dx =
        event.clientX -
        previousX;


      const dy =
        event.clientY -
        previousY;


      dragDistance +=
        Math.abs(dx) +
        Math.abs(dy);


      targetYaw -=
        dx *
        .005;


      targetPitch +=
        dy *
        .004;


      targetPitch =
        THREE.MathUtils.clamp(

          targetPitch,

          -1.32,

          1.32

        );


      previousX =
        event.clientX;


      previousY =
        event.clientY;

    }
  );


  canvas.addEventListener(
    "pointerup",
    event => {

      isDragging =
        false;


      if (
        dragDistance < 7
      ){

        triggerAt(
          event.clientX,
          event.clientY
        );

      }

    }
  );


  canvas.addEventListener(
    "wheel",
    event => {

      event.preventDefault();


      targetDistance +=

        event.deltaY *
        .034;


      targetDistance =
        THREE.MathUtils.clamp(

          targetDistance,

          8,

          63

        );

    },

    {
      passive:false
    }
  );


  /* ==========================================================
     UI
     ========================================================== */

  scaleSelect.addEventListener(
    "change",
    () => {

      currentScaleName =

        scales[
          scaleSelect.value
        ]

          ? scaleSelect.value

          : "majAmbient";


      currentScale =
        scales[
          currentScaleName
        ];
      startMorph(currentScaleName);

    }
  );


  waveSelect.addEventListener(
    "change",
    () => {

      waveType =
        waveSelect.value ||
        "round";

    }
  );


  toneSlider.addEventListener(
    "input",
    () => {

      const value =
        Number(
          toneSlider.value
        );


      toneVal.textContent =
        `${Math.round(
          value *
          100
        )}%`;


      const frequency =

        3000 +

        value *
        9000;


      reverbSettings.toneFreq =
        frequency;


      if (
        reverbTone &&
        audioCtx
      ){

        reverbTone.frequency
          .setTargetAtTime(

            frequency,

            audioCtx.currentTime,

            .2

          );

      }

    }
  );


  freezeSlider.addEventListener(
    "input",
    () => {

      freezeAmount =
        Number(
          freezeSlider.value
        );


      const percentage =
        Math.round(
          freezeAmount *
          100
        );


      freezeVal.textContent =
        `${percentage}%`;


      resonanceValue.textContent =
        percentage;


      scene.fog.density =

        .0046 -

        freezeAmount *
        .0017;


      sporeMaterial.opacity =

        .15 +

        freezeAmount *
        .18;


      if (
        audioCtx &&
        dryBus &&
        reverbBus
      ){

        dryBus.gain
          .setTargetAtTime(

            .6 *

            (
              1 -
              freezeAmount *
              .45
            ),

            audioCtx.currentTime,

            .15

          );


        reverbBus.gain
          .setTargetAtTime(

            .5 +
            freezeAmount *
            .9,

            audioCtx.currentTime,

            .15

          );

      }

    }
  );


  levelSlider.addEventListener(
    "input",
    () => {

      levelAmount =
        Number(
          levelSlider.value
        );


      levelVal.textContent =
        `${Math.round(
          levelAmount *
          100
        )}%`;


      if (
        masterGain &&
        audioCtx
      ){

        masterGain.gain
          .setTargetAtTime(

            levelAmount,

            audioCtx.currentTime,

            .12

          );

      }

    }
  );


  /* ==========================================================
     WAV ENCODER
     ========================================================== */

  function encodeWav(
    buffer
  ){

    const channels =
      buffer.numberOfChannels;


    const frames =
      buffer.length;


    const sampleRate =
      buffer.sampleRate;


    const data =
      new Float32Array(
        frames *
        channels
      );


    for (
      let channel = 0;
      channel < channels;
      channel++
    ){

      const channelData =
        buffer.getChannelData(
          channel
        );


      for (
        let frame = 0;
        frame < frames;
        frame++
      ){

        data[
          frame *
          channels +
          channel
        ] =
          channelData[
            frame
          ];

      }

    }


    const view =
      new DataView(

        new ArrayBuffer(

          44 +

          data.length *
          2

        )

      );


    function writeText(
      offset,
      text
    ){

      for (
        let index = 0;
        index < text.length;
        index++
      ){

        view.setUint8(

          offset +
          index,

          text.charCodeAt(
            index
          )

        );

      }

    }


    writeText(
      0,
      "RIFF"
    );


    view.setUint32(

      4,

      36 +
      data.length *
      2,

      true

    );


    writeText(
      8,
      "WAVE"
    );


    writeText(
      12,
      "fmt "
    );


    view.setUint32(
      16,
      16,
      true
    );


    view.setUint16(
      20,
      1,
      true
    );


    view.setUint16(
      22,
      channels,
      true
    );


    view.setUint32(
      24,
      sampleRate,
      true
    );


    view.setUint32(

      28,

      sampleRate *
      channels *
      2,

      true

    );


    view.setUint16(

      32,

      channels *
      2,

      true

    );


    view.setUint16(
      34,
      16,
      true
    );


    writeText(
      36,
      "data"
    );


    view.setUint32(

      40,

      data.length *
      2,

      true

    );


    let offset =
      44;


    data.forEach(
      sample => {

        const clamped =
          Math.max(
            -1,
            Math.min(
              1,
              sample
            )
          );


        view.setInt16(

          offset,

          clamped < 0

            ? clamped *
              0x8000

            : clamped *
              0x7fff,

          true

        );


        offset +=
          2;

      }
    );


    return new Blob(

      [view],

      {
        type:
          "audio/wav"
      }

    );

  }


  /* ==========================================================
     EXPORT
     ========================================================== */

  async function exportRecording(){

    if (
      !recordEvents.length
    ) {
      return;
    }


    exportButton.disabled =
      true;


    exportButton.textContent =
      "Rendering…";


    const sampleRate =

      audioCtx
        ? audioCtx.sampleRate
        : 48000;


    const last =
      recordEvents[
        recordEvents.length -
        1
      ];


    const duration =
      last.time +
      10;


    const offline =
      new OfflineAudioContext(

        2,

        Math.ceil(
          duration *
          sampleRate
        ),

        sampleRate

      );


    const graph =
      buildAudioGraph(
        offline
      );


    recordEvents.forEach(
      event => {

        const node =
          nodes[
            event.nodeIndex
          ];


        if (
          !node
        ) {
          return;
        }


        playChordOnContext(

          offline,

          graph,

          node,

          event.time

        );

      }
    );


    const rendered =
      await offline
        .startRendering();


    const blob =
      encodeWav(
        rendered
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        "a"
      );


    link.href =
      url;


    link.download =
      "chrysasynth_cosmic_garden.wav";


    document.body.appendChild(
      link
    );


    link.click();


    link.remove();


    setTimeout(
      () => {

        URL.revokeObjectURL(
          url
        );

      },

      1000
    );


    exportButton.textContent =
      "Export WAV";


    exportButton.disabled =
      false;

  }


  exportButton.addEventListener(
    "click",
    exportRecording
  );



  /* ===========================================================
     LIVING LIGHT FIELD · FORGE V2
     3D nebula, circulating motes, breathing halos and bloom waves
     =========================================================== */
  const lightField = { pulses: [], ribbons: [], motes: [], time: 0 };
  const slowMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const subtleMobile = window.matchMedia('(max-width: 640px)').matches;

  // Deep atmospheric volume: independent from the instrument's graph.
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(110, 48, 32),
    new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false,
      uniforms: { uTime: {value:0}, uEnergy:{value:0},uTint:{value:new THREE.Color("#6dbdb5")} },
      vertexShader: `varying vec3 vDirection; void main(){vDirection=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `
        precision highp float;
        varying vec3 vDirection;
        uniform float uTime;
        uniform float uEnergy;
        uniform vec3 uTint;
        float hash(vec3 p){p=fract(p*.1031);p+=dot(p,p.yxz+33.33);return fract((p.x+p.y)*p.z);}
        float noise(vec3 p){vec3 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
          return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
                     mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
        void main(){vec3 p=vDirection; float t=uTime*.009;
          float n=noise(p*4.3+vec3(t,t*.4,-t*.6))*.55+noise(p*9.7-vec3(t*.3,t,t*.4))*.29+noise(p*19.)*.16;
          float clouds=smoothstep(.43,.83,n); float veil=smoothstep(.5,.85,noise(p*2.4+vec3(1.7,2.8,t)));
          vec3 deep=vec3(.002,.006,.014);
          vec3 cyan=uTint*.085; vec3 violet=mix(uTint,vec3(.24,.14,.45),.62)*.08;
          vec3 col=deep+mix(cyan,violet,smoothstep(-.5,.65,p.x+p.z*.3))*clouds*(.52+uEnergy*.1);
          col+=vec3(.024,.026,.052)*veil*.18;
          float stars=step(.9993,hash(floor(p*510.)))*(.13+.15*noise(p*71.));
          col+=stars*vec3(.27,.42,.58); gl_FragColor=vec4(col,1.);}
      `
    })
  );
  scene.add(atmosphere);

  // Organic filaments, closer to a living organism than a static network.
  const filamentGroup = new THREE.Group();
  scene.add(filamentGroup);
  const filamentData = [];
  nodes.filter(n => n.leaf).forEach((leaf,idx) => {
    const from=leaf.connections[0] || root;
    const dir=leaf.position.clone().sub(from.position).normalize();
    const axis=new THREE.Vector3(0,1,0);
    if(Math.abs(dir.dot(axis))>.9) axis.set(1,0,0);
    const side=new THREE.Vector3().crossVectors(dir,axis).normalize();
    const up=new THREE.Vector3().crossVectors(dir,side).normalize();
    for(let k=0;k<3;k++){
      const angle=k*Math.PI*2/3+idx*.71;
      const reach=1.3+(idx%4)*.15;
      const radial=side.clone().multiplyScalar(Math.cos(angle)).addScaledVector(up,Math.sin(angle));
      const a=leaf.position.clone();
      const b=leaf.position.clone().addScaledVector(dir,reach*.8).addScaledVector(radial,reach*.67);
      const c=leaf.position.clone().addScaledVector(dir,reach*1.35).addScaledVector(radial,reach*.28);
      const curve=new THREE.QuadraticBezierCurve3(a,b,c);
      const material=new THREE.LineBasicMaterial({color:idx%2?0xad8bec:0x76dfda,transparent:true,opacity:.06,blending:THREE.AdditiveBlending,depthWrite:false});
      const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(32)),material);
      filamentGroup.add(line); filamentData.push({line,node:leaf,phase:angle+idx});
    }
  });

  // Halos use shared glow texture, never interfere with raycasting.
  const haloGroup=new THREE.Group(); scene.add(haloGroup);
  const halos=[];
  nodes.forEach((node,idx)=>{
    if(node!==root && !node.leaf && idx%3!==0) return;
    const mat=new THREE.SpriteMaterial({map:glowTexture,color:node===root?0xc4b2ff:node.leaf?0xb68cfd:0x7bdbe8,
      transparent:true,opacity:.04,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:true});
    const sprite=new THREE.Sprite(mat);sprite.position.copy(node.position);
    sprite.scale.setScalar(node===root?8:3.5);haloGroup.add(sprite);halos.push({sprite,node});
  });

  // Travelling light along the plant's branches (individual point sprites).
  const paths=[];
  nodes.forEach(node=>node.connections.forEach(next=>{if(node.noteIndex<next.noteIndex){
    const middle=node.position.clone().lerp(next.position,.5).add(new THREE.Vector3(.2,.22,-.12));
    paths.push({from:node,to:next});
  }}));
  const moteCount=subtleMobile?70:150;
  const moteMaterial=new THREE.SpriteMaterial({map:glowTexture,color:0xa7e7ea,transparent:true,opacity:.44,
    depthWrite:false,blending:THREE.AdditiveBlending});
  for(let i=0;i<moteCount && paths.length;i++){
    const sprite=new THREE.Sprite(moteMaterial.clone());
    const size=.08+Math.random()*.16;sprite.scale.setScalar(size);
    scene.add(sprite);lightField.motes.push({sprite,path:paths[i%paths.length],phase:Math.random(),speed:.04+Math.random()*.085});
  }
  // No geometric rings: energy travels down the real branch network.
  const travellingBursts=[];
  function igniteFilaments(node){
    const time=performance.now()*.001;
    const nearby=paths.filter(p=>p.from===node||p.to===node);
    (nearby.length?nearby:paths.slice(0,3)).forEach((path,i)=>{
      travellingBursts.push({path,birth:time+i*.075,duration:.65+i*.1,
        reverse:path.to===node});
    });
    const light=node.sprite;
    if(light){light.material.opacity=1;light.scale.multiplyScalar(1.25);}
  }
  const burstMaterial=new THREE.SpriteMaterial({map:glowTexture,color:0xcafbe8,
    transparent:true,opacity:.86,depthWrite:false,blending:THREE.AdditiveBlending});
  const burstSprites=[];
  for(let i=0;i<25;i++){let sprite=new THREE.Sprite(burstMaterial.clone());sprite.visible=false;
    sprite.scale.setScalar(.45);scene.add(sprite);burstSprites.push(sprite);}
  let lastGeometryFrame=-1;
  function updateMorph(time){
    if(morphProgress>=1)return;
    morphProgress=Math.min(1,(time-morphStartTime)/morphDuration);
    const t=morphProgress, eased=t*t*(3-2*t);
    nodes.forEach((n,i)=>{
      n.position.lerpVectors(morphStartPositions[i],morphTargets[i],eased);
      n.sprite.position.copy(n.position);
    });
    syncBranchGeometries();
    coreMesh.position.copy(root.position);
    const colors=visualIdentity.palette.map(c=>new THREE.Color(c));
    nodes.forEach((n,i)=>{
      const color=n===root?colors[0]:n.leaf?colors[2]:colors[1].clone().lerp(colors[2],Math.min(1,n.level/12));
      n.sprite.material.color.lerp(color,.07);
    });
    branchGroup.children.forEach(line=>{
      const c=line.userData.from.sprite.material.color.clone().lerp(line.userData.to.sprite.material.color,.5);
      line.material.color.lerp(c,.1);
    });
  }
  function animateLivingField(time,energy){
    atmosphere.material.uniforms.uTime.value=slowMotion?0:time;
    atmosphere.material.uniforms.uTint.value.lerp(new THREE.Color(visualIdentity.palette[1]),.012);
    atmosphere.material.uniforms.uEnergy.value=Math.min(1,energy/8);
    const energyDrive=Math.min(1,energy/4);
    filamentData.forEach(f=>{
      f.line.material.opacity=.045+f.node.energy*.42+(slowMotion?0:Math.sin(time*.65+f.phase)*.012);
    });
    halos.forEach(h=>{
      const e=h.node.energy;h.sprite.material.opacity=.045+e*.23;
      const breathe=slowMotion?1:1+Math.sin(time*.6+h.node.phase)*.085;
      h.sprite.scale.setScalar((h.node===root?9:3.8)*breathe*(1+e*.8));
      h.sprite.position.y=h.node.position.y+(slowMotion?0:Math.sin(time*.22+h.node.phase)*.055);
    });
    lightField.motes.forEach(m=>{
      const p=(m.phase+(slowMotion?0:time*m.speed))%1;
      m.sprite.position.lerpVectors(m.path.from.position,m.path.to.position,p);
      m.sprite.material.opacity=(.12+energyDrive*.4)*Math.pow(Math.sin(Math.PI*p),2);
    });
    burstSprites.forEach(sprite=>sprite.visible=false);
    for(let i=travellingBursts.length-1;i>=0;i--){
      const burst=travellingBursts[i];
      const t=(performance.now()*.001-burst.birth)/burst.duration;
      if(t>=1){travellingBursts.splice(i,1);continue;}
      if(t<0)continue;
      const sprite=burstSprites[i%burstSprites.length];
      const progress=burst.reverse?1-t:t;
      sprite.visible=true;
      sprite.position.lerpVectors(burst.path.from.position,burst.path.to.position,progress);
      sprite.material.opacity=.8*Math.sin(Math.PI*t);
      sprite.scale.setScalar(.52+Math.sin(Math.PI*t)*.33);
    }
    // Responsive filament tips follow the current seed positions.
    filamentData.forEach(f=>{
      const p=f.node.position;
      const attr=f.line.geometry.attributes.position;
      const tangent=p.clone().normalize();
      for(let j=0;j<attr.count;j++){
        const q=j/(attr.count-1);
        attr.setXYZ(j,p.x+tangent.x*q*1.5+Math.sin(q*3.14+f.phase)*q*.32,
          p.y+tangent.y*q*1.5+Math.cos(q*3.14+f.phase)*q*.24,
          p.z+tangent.z*q*1.5+Math.sin(q*6.28+f.phase)*q*.2);
      }
      attr.needsUpdate=true;
    });

  }

  /* ==========================================================
     RESIZE
     ========================================================== */

  function resize(){

    const rect =
      stage.getBoundingClientRect();


    const width =
      Math.max(
        1,
        rect.width
      );


    const height =
      Math.max(
        1,
        rect.height
      );


    camera.aspect =
      width /
      height;


    camera.updateProjectionMatrix();


    renderer.setSize(
      width,
      height,
      false
    );

  }


  window.addEventListener(
    "resize",
    resize
  );


  resize();


  /* ==========================================================
     ANIMATION
     ========================================================== */

  const clock =
    new THREE.Clock();


  let quietTimer =
    0;


  function animate(){

    if(document.hidden){requestAnimationFrame(animate);return;}
    requestAnimationFrame(
      animate
    );


    const time =
      clock.getElapsedTime();
    updateMorph(performance.now()*.001);


    /*
     * Automatic slow drift only when untouched.
     */

    if (
      !isDragging
    ){

      targetYaw +=
        0.00018;

    }


    updateCamera();


    /*
     * Central seed.
     */

    const corePulse =

      1 +

      Math.sin(
        time *
        .9
      ) *
      .09;


    coreMesh.scale.setScalar(
      corePulse
    );


    coreMesh.rotation.x +=
      .0012;


    coreMesh.rotation.y +=
      .0018;


    /*
     * Seeds breathe and react.
     */

    let activeEnergy =
      0;


    nodes.forEach(
      node => {

        node.energy +=

          (
            node.targetEnergy -
            node.energy
          ) *

          (
            node.targetEnergy >
            node.energy

              ? .08

              : .018
          );


        activeEnergy +=
          node.energy;


        const breathe =

          1 +

          Math.sin(
            time *
            .65 +
            node.phase
          ) *
          .055;


        const scale =

          node.baseScale *
          3 *

          breathe *

          (
            1 +
            node.energy *
            1.15
          );


        node.sprite.scale.setScalar(
          scale
        );


        node.sprite.material.opacity =

          (
            node === root
              ? .92
              : .48
          ) +

          node.energy *
          .48;


        /*
         * Small organic drift,
         * but keep graph legible.
         */

        if (
          node !== root
        ){

          node.sprite.position.y =

            node.position.y +

            Math.sin(
              time *
              .21 +
              node.phase
            ) *
            .055;

        }

      }
    );


    /*
     * Branch resonance.
     */

    branchGroup.children
      .forEach(
        line => {

          line.userData.energy +=

            (
              0 -
              line.userData.energy
            ) *
            .013;


          line.material.opacity =

            line.userData
              .baseOpacity +

            line.userData.energy *
            .42 +

            freezeAmount *
            .025;

        }
      );


    /*
     * Deep field movement.
     */

    spores.rotation.y +=
      .000045;


    spores.rotation.x =

      Math.sin(
        time *
        .02
      ) *
      .015;


    /*
     * UI state.
     */

    if (
      activeEnergy >
      .08
    ){

      quietTimer =
        time;

    }
    else if (
      time -
      quietTimer >
      2.5
    ){

      bloomLabel.classList.remove(
        "is-awake"
      );


      bloomLabel
        .firstElementChild
        .textContent =
          "DORMANT";

    }


    animateLivingField(time,activeEnergy);

    renderer.render(
      scene,
      camera
    );

  }


  startMorph(currentScaleName);
  animate();

})();