'use strict';
// Modular master bus. DynamicsCompressorNode is a protective compressor,
// not a certified true-peak brickwall limiter.
class KnotMaster {
  constructor(ctx,input){
    this.ctx=ctx;this.input=input;
    this.compressor=ctx.createDynamicsCompressor();
    this.compressor.threshold.value=-7;
    this.compressor.knee.value=1.5;
    this.compressor.ratio.value=16;
    this.compressor.attack.value=.003;
    this.compressor.release.value=.12;
    this.analyser=ctx.createAnalyser();this.analyser.fftSize=2048;
    this.output=ctx.createGain();
    this.enabled=true;this.setLimiter(true);
  }
  setLimiter(enabled){
    this.enabled=enabled;
    try{this.input.disconnect();this.compressor.disconnect();}catch{}
    if(enabled){this.input.connect(this.compressor);this.compressor.connect(this.analyser);}
    else this.input.connect(this.analyser);
    // Prevent stacking connections when toggling.
    try{this.analyser.disconnect();}catch{}
    this.analyser.connect(this.output);
  }
  connect(dest){this.output.connect(dest);}
}
