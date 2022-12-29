class View {
  constructor(parentId) {
    this.mainFrame = parentId;
    this.bkColor = VIEW_BACK_COLOR;
    this.lineColor = VIEW_MEASURE_LINE_COLOR;
    this.lineColor2 = VIEW_BEAT_LINE_COLOR;
    this.progressColor = VIEW_PROGRESS_COLOR;
    this.measureSize = DEFAULT_MEASURE_WIDTH;
    this.bpm = DEFAULT_BPM;
    this.camera = {
      x: 0,
      y: 0
    }
    this.soundManager = null;
    this.optLine = DEFAULT_DIVIDE_NUM;
    this.progress = {
      isMouseDown: false,
      worldPosition: 0,
    }
    this.leftMoveBtn = null;
    this.rightMoveBtn = null;
    this.playBtn = null;
    this.stopBtn = null;
    this.seekCallback = null;
  }

  Init() {
    this.InitCamera();
    this.createView();
  }

  InitCamera() {
    this.camera.x = 0;
    this.camera.y = 0;
  }

  SetBpmMeasure(bpm, measure) {
    let measureChange = false;
    let oldMeasure = this.measureSize;
    if (this.measureSize != measure) {
      measureChange = true;
    }
    this.bpm = bpm;
    this.measureSize = measure;

    const group = GetElem("view_group");
    if (group != null) {
      this.ReSize(group.getAttribute("width"), group.getAttribute("height"));
      let list = this.soundManager.GetObjectList();
      if (list != null) {
        list.map(async (obj) => {
          obj.Size(bpm, measure);
          if (measureChange) {
            this.calcStartPosForSoundObject(obj, oldMeasure);
          }
        });
      }
    }
  }

  calcStartPosForSoundObject(obj, oldMeasure) {
    let measurePos = GetMeasurePos(oldMeasure, obj.x);
    let x = GetWorldPosFromMeasurePos(this.bpm, this.measureSize, measurePos);
    obj.x = x;
    let svg = obj.svg;
    svg.setAttribute("transform", `translate(${obj.x - this.camera.x}, ${obj.y - this.camera.y})`);
  }

  SetDivide(x) {
    this.optLine = x;
    const group = GetElem("view_group");
    if (group != null) {
      this.ReSize(group.getAttribute("width"), group.getAttribute("height"));
    }
  }

  SetCamera(x, y) {
    this.camera.x = x;
    this.camera.y = y;
    this.MoveSoundObject();
    this.updateMeasureNumber();
    this.flashProgress();
  }

  TrackCameraToProgress() {
    let progress = this.progress.worldPosition;
    let camerax = this.camera.x;
    let width = this.GetViewWidth();

    if ((progress < camerax) || (camerax + width < progress)) {
      camerax = (parseInt(progress/this.measureSize)) * this.measureSize;
      this.SetCamera(camerax, 0);
    }
  }

  SetSoundManager(mng) {
    this.soundManager = mng;
  }

  GetSnapPosition(x) {
    let beat = this.measureSize / this.optLine;
    let bx = parseInt(x / beat) * beat;
    return bx;
  }

  MoveSoundObject() {
    let list = this.soundManager.GetObjectList();
    //console.log(list);
    if (list == null) return;

    list.map(async (obj) => {
      let svg = obj.svg;
      svg.setAttribute("transform", `translate(${obj.x - this.camera.x}, ${obj.y - this.camera.y})`);
    });
  }

  SetVisibleSoundObject(id) {
    let idx = this.soundManager.GetSoundListIndex(id);
    let list = this.soundManager.GetObjectList();
    let obj = list[idx];
    let frame = GetElem(this.mainFrame);
    frame.appendChild(obj.svg);
    obj.visible = true;
  }

  SetSoundObjectPositionLocal(id, x, y) {
    let idx = this.soundManager.GetSoundListIndex(id);
    let list = this.soundManager.GetObjectList();
    let obj = list[idx];

    let bx = this.GetSnapPosition(x);
    let wx = this.LocalToWorldX(bx);
    let wy = this.LocalToWorldY(y);

    wx = (wx < 0) ? 0: wx;
    wy = (wy < 0) ? 0: wy;
    obj.x = wx;
    obj.y = wy;
    let svg = obj.svg;
    svg.setAttribute("transform", `translate(${obj.x - this.camera.x}, ${obj.y - this.camera.y})`);
  }

  ReSize(width, height) {
    const group = GetElem("view_group");
    group.setAttribute("width", width);
    group.setAttribute("height", height);
    const rect = GetElem("view_rect");
    rect.setAttribute("width", width);
    rect.setAttribute("height", height);
    Array.from(group.childNodes).forEach((child) => {
      if (child.id != "view_rect") {
        child.remove();
      }
    });
    this.createViewLine(group, width, height);
    this.createMeasureNumber(group, width);
    this.resizeProgress(height);
    this.resizeButton(width, height);
  }

  GetViewWidth() {
    let frame = GetElem(this.mainFrame);
    return frame.getAttribute("width");
  }

  GetViewHeight() {
    let frame = GetElem(this.mainFrame);
    return frame.getAttribute("height");
  }

  createView() {
    let frame = GetElem(this.mainFrame);
    let width = frame.getAttribute("width");
    let height = frame.getAttribute("height");
    const group = CreateSVGElem("g", "view_group");
    group.setAttribute("width", width);
    group.setAttribute("height", height);
    const rect = CreateRect("view_rect", 0, 0, width, height, this.bkColor, this.bkColor);
    group.appendChild(rect);
    this.createViewLine(group, width, height);
    this.createMeasureNumber(group, width);
    frame.appendChild(group);
    this.createProgress();
    this.createButton(frame, width, height);

    frame.addEventListener("mousedown", this.OnMouseDown);
  }

  createButton(frame, width, height) {
    let r = BUTTON_RADIUS;
    this.leftMoveBtn = new ImgButton();
    this.rightMoveBtn = new ImgButton();
    this.playBtn = new PlayButton();
    this.stopBtn = new StopButton();

    this.leftMoveBtn.Init(frame, "btnLeftMove", 0, height - r*2, r, "#CFCFCF", "<<");
    this.rightMoveBtn.Init(frame, "btnRightMove", width - r*2, height - r*2, r, "#CFCFCF", ">>");
    this.playBtn.Init(frame, "btnPlayback", width/2, height - 2*r, r, "#CFCFCF");
    this.stopBtn.Init(frame, "btnStop", width/2, height - 2*r, r, "#CFCFCF");
    this.stopBtn.SetDisplay("none");
    const requestPlayEvent = () => {
      let ev = new Event("click");
      let elem = GetElem("startBtn");
      elem.dispatchEvent(ev);
    };

    this.leftMoveBtn.SetClick((e) => {
      let pos = this.camera.x - this.measureSize;
      if (pos < 0) {
        pos = 0;
      }
      this.SetCamera(pos, this.camera.y);
    });
    this.rightMoveBtn.SetClick((e) => {
      let pos = this.camera.x + this.measureSize;
      this.SetCamera(pos, this.camera.y);
    });
    this.playBtn.SetClick((e) => {
      this.playBtn.SetDisplay("none");
      this.stopBtn.SetDisplay("inline");
      requestPlayEvent();
    });
    this.stopBtn.SetClick((e) => {
      this.stopBtn.SetDisplay("none");
      this.playBtn.SetDisplay("inline");
      requestPlayEvent();
    });
  }

  resizeButton(width, height) {
    let r = BUTTON_RADIUS;
    this.leftMoveBtn.Move(0, height - r*2);
    this.rightMoveBtn.Move(width - r*2, height - r*2);
    this.playBtn.Move(width/2, height - 2*r);
    this.stopBtn.Move(width/2, height - 2*r);
  }

  createViewLine(group, width, height) {
    let line_box = CreateGroup("line_box", 0, 0, this.measureSize, height);
    for (let i = 1; i < this.optLine; i++) {
      line_box.appendChild(CreateLine(null, i * (this.measureSize/this.optLine), 0, i * (this.measureSize/this.optLine), height, this.lineColor2, 1));
    }
    line_box.appendChild(CreateLine(null, this.measureSize, 0, this.measureSize, height, this.lineColor, 1));
    group.appendChild(line_box);

    for (let i = 1; i < width/this.measureSize; i++) {
      group.appendChild(CreateUse(null, i*this.measureSize, 0, "line_box"));
    }
  }

  createMeasureNumber(group, width) {
    let number_box = CreateGroup("number_box", 0, 0, width, 60);
    let start_measure = parseInt(this.camera.x/this.measureSize);
    for (let i = 0; i < width/this.measureSize; i++) {
      let text = CreateText(null, i*this.measureSize, 15, `${start_measure + i + 1}`, "11px", "#000000");
      number_box.appendChild(text);
    }
    group.appendChild(number_box);
  }

  updateMeasureNumber() {
    let number_box = GetElem("number_box");
    let start_measure = parseInt(this.camera.x/this.measureSize);
    Array.from(number_box.childNodes).forEach((child, idx) => {
      child.textContent = `${start_measure + idx + 1}`;
    });
  }

  createProgress() {
    let frame = GetElem(this.mainFrame);
    let height = frame.getAttribute("height");
    let line = CreateLine("progress", 0, 0, 0, height, this.progressColor, 1.5);
    frame.appendChild(line);
  }

  resizeProgress(height) {
    let progress = GetElem("progress");
    progress.setAttribute("y2", height);
  }

  moveProgress(x) {
    let progress = GetElem("progress");
    this.progress.worldPosition = x;
    let localX = this.WorldToLocalX(x);
    progress.setAttribute("x1", localX);
    progress.setAttribute("x2", localX);

    let frame = GetElem(this.mainFrame);
    let width = frame.getAttribute("width");
    let right = (parseInt(width/this.measureSize)) * this.measureSize;
    if (localX >= right) {
      this.SetCamera(this.camera.x + right, 0);
    }
  }

  flashProgress() {
    let progress = GetElem("progress");
    let localX = this.WorldToLocalX(this.progress.worldPosition);
    progress.setAttribute("x1", localX);
    progress.setAttribute("x2", localX);
  }

  getWorldProgress() {
    return this.progress.worldPosition;
  }

  OnMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.progress.isMouseDown = true;
    this.progress.worldPosition = this.GetSnapPosition(this.camera.x + e.clientX);
    if (this.seekCallback)
      this.seekCallback();
    return false;
  }

  OnMouseMove(e) {
    let drag = this.soundManager.drag;
    if (drag.isMouseDown) {
      drag.targets.map(async (obj) => {
        obj.offsetx = obj.offsetx + e.movementX;
        obj.offsety = obj.offsety + e.movementY;
        this.SetSoundObjectPositionLocal(obj.target.id, obj.offsetx, obj.offsety);
      });
      //this.SetSoundObjectPositionLocal(drag.target.id, e.clientX - drag.offsetx, e.clientY - drag.offsety);
    }
  }

  OnMouseUp(e) {
    let drag = this.soundManager.drag;
    if (drag.isMouseDown) {
      if (this.seekCallback)
        this.seekCallback();
    }
    this.soundManager.OnMouseUp();
    if (this.progress.isMouseDown) {
      this.progress.isMouseDown = false;
      this.moveProgress(this.progress.worldPosition);
    }
  }

  DeleteSelectedAudio() {
    let frame = GetElem(this.mainFrame);
    let drag = this.soundManager.drag;
    drag.targets.map((obj) => {
      frame.removeChild(obj.target.svg);
      this.soundManager.DeleteAudio(obj.target.id);
    });
    this.soundManager.ClearDragList();
  }

  LocalToWorldX(x) {
    return this.camera.x + x;
  }

  WorldToLocalX(x) {
    return x - this.camera.x;
  }

  LocalToWorldY(y) {
    return this.camera.y + y;
  }

  WorldToLocalY(y) {
    return y - this.camera.y;
  }

  SetSeekCallback(callback) {
    this.seekCallback = callback;
  }
}
