class Player {
  constructor(view) {
    this.view = view;
    this.soundObjectManager = new SoundObjectManager();
    this.bpm = DEFAULT_BPM;
    this.widthParMeasure = DEFAULT_MEASURE_WIDTH;
    this.volume = DEFAULT_VOL;
    this.playbackState = "stop";
    this.progressPos = 0;
    this.startTime = 0;
    this.interval = null;
    this.webAudio = {
      context: null,
      mainGain: null
    };
    this.bpmBox = new TextBox("bpm");
    this.measureBox = new TextBox("measure");
    this.divideBox = new SelectBox("divide");
  }

  Init() {
    this.view.SetBpmMeasure(this.bpm, this.widthParMeasure);
    this.view.SetSoundManager(this.soundObjectManager);
    this.view.SetSeekCallback(this.seekCallback);
    this.soundObjectManager.SetBpmMeaure(this.bpm, this.widthParMeasure);
    this.bpmBox.Init();
    this.bpmBox.SetOnChangeEvent(this.ChangeBpm);
    this.measureBox.Init();
    this.measureBox.SetOnChangeEvent(this.ChangeMeasure);
    this.divideBox.Init();
    this.divideBox.SetOnChangeEvent(this.ChangeDivide);
  }

  initAudio() {
    if (this.webAudio.context == null) {
      this.webAudio.context = new (window.AudioContext || window.webkitAudioContext)();
      this.webAudio.mainGain = this.webAudio.context.createGain();
      this.webAudio.mainGain.gain.value = this.volume;
      this.webAudio.mainGain.connect(this.webAudio.context.destination);
    }
  }

  ChangeMasterVol = (value) => {
    this.volume = value;
    this.webAudio.mainGain.gain.value = this.volume;
  }

  ChangeBpm = (value) => {
    this.bpm = value;
    this.view.SetBpmMeasure(this.bpm, this.widthParMeasure);
  }

  ChangeMeasure = (value) => {
    this.widthParMeasure = value;
    this.view.SetBpmMeasure(this.bpm, this.widthParMeasure);
  }

  ChangeDivide = (value) => {
    this.view.SetDivide(value);
  }

  AddSound(array, name) {
    return new Promise((resolve, reject) => {
      this.initAudio();
      this.soundObjectManager.AddSound(this.webAudio, array, name).then((id) => {
        let x = GetRandomInt(100);
        let y = GetRandomInt(100);
        this.view.SetSoundObjectPositionLocal(id, x, y);
        this.view.SetVisibleSoundObject(id);

        resolve(this.soundObjectManager.GetListSize());
      }).catch(err => {
        
        reject(err);
      });
    });
  }

  updateProgress = () => {
    if (this.playbackState != "play") {
      return;
    }
    let currentTime = this.webAudio.context.currentTime;
    let elapseTime = currentTime - this.startTime;
    let secParPixel = GetSecParPixel(this.bpm, this.widthParMeasure);
    this.startTime = currentTime;

    this.progressPos += elapseTime / secParPixel;
    this.view.moveProgress(this.progressPos);
  }

  Start = () => {
    if (this.playbackState != "stop") {
      return;
    }
    this.initAudio();
    this.playbackState = "play";
    this.progressPos = this.view.getWorldProgress();
    this.view.moveProgress(this.progressPos);
    this.view.TrackCameraToProgress();
    //this.view.SetCamera(0, 0);

    let offset = GetSecFromWorldPos(this.bpm, this.widthParMeasure, this.progressPos);

    this.soundObjectManager.SetBpmMeaure(this.bpm, this.widthParMeasure);
    this.soundObjectManager.AudioPlay(this.webAudio, offset);
    this.startTime = this.webAudio.context.currentTime;
    this.interval = setInterval(this.updateProgress, 100);
  }

  Stop = () => {
    this.playbackState = "stop";
    this.soundObjectManager.AudioStop();
    clearInterval(this.interval);
    this.interval = null;
  }

  Seek = () => {
    if (this.playbackState != "seek") {
      return;
    }
    this.progressPos = this.view.getWorldProgress();
    let offset = GetSecFromWorldPos(this.bpm, this.widthParMeasure, this.progressPos);
    this.soundObjectManager.AudioSeek(this.webAudio, offset);
    this.startTime = this.webAudio.context.currentTime;
    this.playbackState = "play";
  }

  Mixing = (callback) => {
    let mix = new Mixing();
    try {
      mix.Init(this.soundObjectManager.GetObjectList(), this.bpm, this.widthParMeasure, this.volume);
      mix.Mixing((wav, err) => {
        if (err) {
          throw err;
        }
        mix.Download(wav);
        mix.Close();
        callback();
      });
    } catch (err) {
     window.alert(err);
     mix.Close();
     callback();
    }
  }

  seekCallback = () => {
    if (this.playbackState == "play") {
      this.playbackState = "seek"
    }
    this.Seek();
  }

  OnMouseUp(e) {
    this.view.OnMouseUp(e);
  }

  OnMouseMove(e) {
    this.view.OnMouseMove(e);
  }

  OnKeyDown(e) {
    if (e.code == "Backspace") {
      this.view.DeleteSelectedAudio();
    }
    if (e.code == "SPACE") {
      var ev = new Event("click");
      var elem = GetElem("startBtn");
      elem.dispatchEvent(ev);
    }
    if (e.code == "Home") {
      this.view.SetCamera(0, 0);
    }
  }

  setBpm(bpm) {
    this.bpm = bpm;
  }

  getBpm() {
    this.bpm;
  }

  setWidthParMeasure(widthParMeasure) {
    this.widthParMeasure = widthParMeasure;
  }

  getWidthParMeasure() {
    return this.widthParMeasure;
  }
}
