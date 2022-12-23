
class SoundObject {
  constructor(name) {
    this.audioBuffer = null;
    this.wave = null;
    this.svg = null;
    this.id = 0;
    this.x = 0;
    this.y = 0;
    this.visible = false;
    this.playback = false;
    this.source = null;
    this.name = name;
    this.color_id = GetRandomInt(COLOR_DEFINE.length); 
  }

  copyAudioBuffer(audioBuffer) {
    const copyBuffer = new AudioBuffer({
      length: audioBuffer.length,
      numberOfChannels: audioBuffer.numberOfChannels,
      sampleRate:audioBuffer.sampleRate
    });
    for (let channel = 0; channel < copyBuffer.numberOfChannels; channel++) {
      const samples = audioBuffer.getChannelData(channel);
      copyBuffer.copyToChannel(samples, channel);
    }
    return copyBuffer;
  }

  createWaveForm(webAudio) {
    return new Promise((resolve, reject) => {
      const options = {
        audio_context: webAudio.context,
        audio_buffer: this.copyAudioBuffer(this.audioBuffer),
        scale:2048
      };
      WaveformData.createFromAudio(options, (err, waveform) => {
        if (err) {
          reject(err);
        }
        else {
          this.wave = waveform;
          resolve();
        }
      });
    });
  }

  Load(webAudio, buffer) {
    this.audioBuffer = buffer;
    return this.createWaveForm(webAudio);
  }

  SetIndex = (index) => {
    this.id = index;
  }

  CreateSVG() {
    this.svg = CreateWaveFormPath(this.wave, this.id, this.name, this.color_id);
  }

  SetSelected(sw) {
    let e = this.svg.childNodes.item(0);
    if (sw) {
      e.setAttribute("fill", COLOR_DEFINE[this.color_id].select);
    } else {
      e.setAttribute("fill", COLOR_DEFINE[this.color_id].back);
    }
  }

  Size(bpm, widthParMeasure){
    //let secParMeasure = (60/bpm)*4;
    //let secParPixel = secParMeasure/widthParMeasure;
    let secParPixel = GetSecParPixel(bpm, widthParMeasure);
    let duration = this.audioBuffer.duration;

    let width = duration / secParPixel;
    this.svg.setAttribute("width", width);
    //console.log(`duration=${duration}, secParPixel=${secParPixel}`);

    let wave_length = this.wave.length;
    let path = this.svg.childNodes.item(1);
    path.setAttribute("style", `transform:scale(${width/wave_length},1);`);
    let rect = this.svg.childNodes.item(0);
    rect.setAttribute("width", width);
  }

  SetMouseDownEvent(callback) {
    this.svg.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      callback(e, this);
      return false;
    });
  }

  Play = (context, destination, bpm, widthParMeasure, offset) => {
    this.source = context.createBufferSource();
    this.source.buffer = this.audioBuffer;
    this.source.connect(destination);
    this.source.onended = () => {
      this.playback = false;
    }

    let isPlay = true;
    let _offset = 0;
    let startTime = GetSecFromWorldPos(bpm, widthParMeasure, this.x);
    if (offset <= startTime) {
      startTime -= offset;
      _offset = 0;
    }
    else if (startTime < offset && (startTime + this.audioBuffer.duration) > offset) {
      _offset = offset - startTime;
      startTime = 0;
    }
    else {
      isPlay = false;
      this.source = null;
      this.playback = false;
    }

    if (isPlay) {
      this.source.start(context.currentTime + startTime, _offset);
      this.playback = true;
    }
  }

  Stop() {
    if (this.playback) {
      this.source.stop();
    }
    this.playback = false;
    this.source = null;
  }
}

class SoundObjectManager {
  constructor() {
    this.objectList = null;
    this.drag = {
      isMouseDown: false,
      targets : null,
      //target: null,
      //offsetx: 0,
      //offsety: 0,
    };
    //this.selected = null;
    this.bpm = 120;
    this.widthParMeasure = 120;
  }

  GetListSize() {
    if (this.objectList == null) {
      return 0;
    }
    return this.objectList.length;
  }

  GetObjectList() {
    return this.objectList;
  }

  OnMouseDown = (e, obj) => {
    if (e.button == 0) {
      var rect = obj.svg.getBoundingClientRect();
      this.drag.isMouseDown = true;
      if (e.ctrlKey || e.metaKey) {
        if (this.drag.targets == null) {
          this.drag.targets = [];
        }
        let target = {
          target: obj,
          offsetx: rect.left,
          offsety: rect.top,
        };
        obj.SetSelected(true);
        this.drag.targets.push(target);
      } else {
        if (this.drag.targets != null && this.drag.targets.length > 0) {
          this.drag.targets.map((obj) => {
            obj.target.SetSelected(false);
          });
          this.clearDragList();
        }
        this.drag.targets = [];
        let target = {
          target: obj,
          offsetx: rect.left,
          offsety: rect.top,
        };
        obj.SetSelected(true);
        this.drag.targets.push(target);
        /*
        this.drag.offsetx = e.clientX - rect.left;
        this.drag.offsety = e.clientY - rect.top;
        this.drag.isMouseDown = true;
        this.drag.target = obj;
        if (this.selected) {
          this.selected.SetSelected(false);
        }
        obj.SetSelected(true);
        this.selected = obj;
        */
      }
    }
  }

  clearDragList() {
    if (this.drag.targets != null) {
      this.drag.targets = null;
    }
  }

  OnMouseUp() {
    //this.drag.target = null;
    this.drag.isMouseDown = false;
    //this.drag.offsetx = 0;
    //this.drag.offsety = 0;
  }

  AddSound(webAudio, array, name) {
    return new Promise((resolve, reject) => {
      webAudio.context.decodeAudioData(array, (audio) => {
        let audioObject = new SoundObject(name);
        audioObject.Load(webAudio, audio).then(() => {
          if (this.objectList == null) this.objectList = [];
          let indexNo = this.objectList.length;
          audioObject.SetIndex(indexNo);
          audioObject.CreateSVG();
          audioObject.Size(this.bpm, this.widthParMeasure);
          audioObject.SetMouseDownEvent(this.OnMouseDown);
          this.objectList.push(audioObject);
          resolve(indexNo);
        }).catch(err => {
          reject(err);
        });
      }, (err) => {
        reject(err);
      });
    });
  }

  SetSoundPosition(idx, x, y) {
    console.log(idx);
    let obj = this.objectList[idx];
    obj.Translate(x, y);
  }

  AudioPlay(webAudio, offset) {
    const play = (offset) => {
      if (this.objectList != null) {
        this.objectList.map(async (obj) => {
          obj.Play(webAudio.context, webAudio.mainGain, this.bpm, this.widthParMeasure, offset);
        });
      }
    }
    play(offset);
  }

  AudioStop() {
    if (this.objectList != null) {
      this.objectList.map(async (obj) => {
        obj.Stop();
      });
    }
  }

  SetBpmMeaure(bpm, widthParMeasure) {
    this.bpm = bpm;
    this.widthParMeasure = widthParMeasure;
  }
}
