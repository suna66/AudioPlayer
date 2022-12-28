
class Mixing {
  constructor() {
    this.context = null;
    this.gain = null;
    this.objectList = null;
    this.sampleRate = 44100;
    this.channelNum = 2;
    this.length = 0;
    this.bpm = 0;
    this.widthParMeasure = 0;
  }

  Init(objectList, bpm, widthParMeasure, vol) {
    if (objectList == null || objectList.length == 0) {
      throw new Error("audio object list is empty");
    }

    this.objectList = objectList;
    this.bpm = bpm;
    this.widthParMeasure = widthParMeasure;
    this.length = this.getMixDuration(objectList);

    this.context = new OfflineAudioContext(this.channelNum, this.length * this.sampleRate, this.sampleRate);
    this.gain = this.context.createGain();
    this.gain.value = vol;
    this.gain.connect(this.context.destination);
  }

  Close() {
    this.gain = null;
    this.context = null;
    this.objectList = null;
  }

  Mixing(callback) {
    this.objectList.map(async (obj) => {
      let startTime = GetSecFromWorldPos(this.bpm, this.widthParMeasure, obj.x);
      let source = this.context.createBufferSource();
      source.buffer= obj.audioBuffer;
      source.connect(this.gain);
      source.start(this.context.currentTime + startTime);
    });

    this.context.startRendering().then((buf) => {
      let wav = window.audioBufferToWav(buf);
      callback(wav, null);
    }).catch ((err) => {
      callback(null, err);
    });
  }

  Download(wav) {
    const audioBlob = new Blob([wav], {type: 'audio/wav'});
    const url = URL.createObjectURL(audioBlob);
    const date = new Date();
    let link = document.createElement("a");
    link.href = url;
    link.download = this.createFilename();
    link.click();
  }

  createFilename() {
    const date = new Date();
    const Y = date.getFullYear();
    const M = ("00" + (date.getMonth()+1)).slice(-2);
    const D = ("00" + date.getDate()).slice(-2);
    const h = ("00" + date.getHours()).slice(-2);
    const m = ("00" + date.getMinutes()).slice(-2);
    const s = ("00" + date.getSeconds()).slice(-2);
    return `mix_${Y}${M}${D}${h}${m}${s}`;
  }

  getMixDuration(objectList) {
    var max_len = 0;
    for (let i = 0; i < objectList.length; i++) {
      let len = this.getSoundEndTime(objectList[i]);
      if (max_len < len) {
        max_len = len;
      }
    }
    return max_len;
  }

  getSoundEndTime(soundObject) {
    let startTime = GetSecFromWorldPos(this.bpm, this.widthParMeasure, soundObject.x);
    return (startTime + soundObject.audioBuffer.duration);
  }

}
