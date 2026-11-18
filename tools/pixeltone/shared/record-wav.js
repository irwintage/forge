/* MediaRecorder capture -> decoded PCM -> genuine 16-bit stereo WAV. */
(() => {
  function encodeWav(buffer) {
    const channels = Math.min(2, Math.max(1, buffer.numberOfChannels));
    const length = buffer.length;
    const bytes = length * channels * 2;
    const raw = new ArrayBuffer(bytes + 44);
    const v = new DataView(raw);
    const str = (offset, s) => { for (let i=0;i<s.length;i++) v.setUint8(offset+i,s.charCodeAt(i)); };
    str(0,'RIFF');v.setUint32(4,bytes+36,true);str(8,'WAVE');str(12,'fmt ');
    v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,channels,true);
    v.setUint32(24,buffer.sampleRate,true);v.setUint32(28,buffer.sampleRate*channels*2,true);
    v.setUint16(32,channels*2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,bytes,true);
    let at=44;
    for(let i=0;i<length;i++)for(let c=0;c<channels;c++){
      const sample=Math.max(-1,Math.min(1,buffer.getChannelData(c)[i]));
      v.setInt16(at,sample<0?Math.round(sample*32768):Math.round(sample*32767),true);at+=2;
    }
    return new Blob([raw],{type:'audio/wav'});
  }
  window.pixelToneRecordWav = async (recorder, context, name, seconds=10) => {
    if (!recorder || recorder.state !== 'inactive') throw new Error('Recording is unavailable or already running.');
    await context.resume();
    const chunks=[];
    let timer;
    const recorded = new Promise((resolve,reject)=>{
      recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
      recorder.onerror=e=>reject(e.error || new Error('Recorder error'));
      recorder.onstop=()=>resolve(new Blob(chunks,{type:recorder.mimeType||'audio/webm'}));
    });
    recorder.start();
    timer=setTimeout(()=>{if(recorder.state==='recording')recorder.stop()},seconds*1000);
    try {
      const encoded=await recorded;
      const samples=await context.decodeAudioData(await encoded.arrayBuffer());
      const wav=encodeWav(samples);
      const url=URL.createObjectURL(wav);
      const a=document.createElement('a');a.href=url;a.download=name;a.style.display='none';document.body.append(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),5000);
      return wav;
    } finally {clearTimeout(timer)}
  };
})();
