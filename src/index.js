"use restrict";

var player = null;
var view = null;

//Entry Point
(function() {
  init();
})();


//Init
function init() {
  view = new View("mainframe");
  player = new Player(view);
  player.Init();

  initView("mainframe");
  initWindowEvent();
  initAudioAddAction(onAddEvent);
  initStartAudioAction();
}


function initAudioAddAction(callback) {
  var elem = GetElem("audioFile");
  elem.onchange = function() {
    let audioFile = elem.files[0];
    const fileReader = new FileReader();
    fileReader.onload = () => {
      if (callback) {
        callback(fileReader.result, audioFile.name);
      }
    }
    fileReader.readAsArrayBuffer(audioFile);
  }
}

function initStartAudioAction() {
  var elem = GetElem("startBtn");
  elem.addEventListener("click", () => {
    let txt = elem.innerText;
    if (txt == "START") {
      elem.innerText = "STOP";
      player.Start();
    }
    else {
      elem.innerText = "START";
      player.Stop();
    }
  });
}

function initView(id) {
  let width = window.innerWidth - ADJUST_WIDTH;
  let height = window.innerHeight - ADJUST_HEIGHT;
 
  var elem = GetElem(id);
  elem.setAttribute("width", width);
  elem.setAttribute("height", height);
  view.Init();
}

function ReSize(id) {
  let width = window.innerWidth - ADJUST_WIDTH;
  let height = window.innerHeight - ADJUST_HEIGHT;
  var elem = GetElem(id);
  elem.setAttribute("width", width);
  elem.setAttribute("height", height);
  view.ReSize(width, height);
}


function initWindowEvent() {
  window.addEventListener("resize", () => {
    ReSize("mainframe");
  });

  document.addEventListener("mouseup", () => {
    player.OnMouseUp();
  });
  document.addEventListener("mousemove", (e) => {
    player.OnMouseMove(e);
  });
  document.addEventListener("keydown", (e) => {
    //Keyboard Event
    player.OnKeyDown(e);
  });
}

function onAddEvent(array, name) {
  player.AddSound(array, name).then((num) => {
    console.log(num);
  }).catch(err => {
    console.log(err);
  });
}
