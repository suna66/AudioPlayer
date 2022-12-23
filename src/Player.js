class Player {
  constructor(view) {
    this.view = view;
    this.soundObjectManager = new SoundObjectManager();
    this.bpm = DEFAULT_BPM;
    this.widthParMeasure = DEFAULT_MEASURE_WIDTH;
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
      this.webAudio.mainGain.gain.value = 0.3;
      this.webAudio.mainGain.connect(this.webAudio.context.destination);
    }
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
      this.soundObjectManager.AddSound(this.webAudio, array, name).then((idx) => {
        let x = GetRandomInt(100);
        let y = GetRandomInt(100);
        this.view.SetSoundObjectPositionLocal(idx, x, y);
        this.view.SetVisibleSoundObject(idx);

        resolve(this.soundObjectManager.GetListSize());
      }).catch(err => {
        reject(err);
      });
    });
  }

  updateProgress = () => {
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

  OnMouseUp(e) {
    this.view.OnMouseUp(e);
  }

  OnMouseMove(e) {
    this.view.OnMouseMove(e);
  }

  OnKeyDown(e) {

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
