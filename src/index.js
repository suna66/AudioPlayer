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

function loadAudioFile(fileObj, callback)
{
  let type = fileObj.type;
  if (type.indexOf("audio") == -1) {
    window.alert(`${fileObj.name} is no audio file`);
    return;
  }
  const fileReader = new FileReader();
  fileReader.onload = () => {
    if (callback) {
      callback(fileReader.result, fileObj.name);
    }
  }
  fileReader.readAsArrayBuffer(fileObj);
}

function initAudioAddAction(callback) {
  var elem = GetElem("audioFile");
  elem.onchange = function() {
    let audioFile = elem.files[0];
    loadAudioFile(audioFile, callback);
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
  elem.addEventListener('dragover', (e) => {
    e.stopPropagation();
    e.preventDefault();
    return false;
  });
  elem.addEventListener('dragleave', (e) => {
    e.stopPropagation();
    e.preventDefault();
    return false;
  });
  elem.addEventListener('drop', (e) => {
    e.stopPropagation();
    e.preventDefault();
    const fileReader = new FileReader();
    var audioFile = e.dataTransfer.files[0];
    loadAudioFile(audioFile, onAddEvent);
    return false;
  });
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
    player.OnKeyDown(e);
    return false;
  });
}

function onAddEvent(array, name) {
  
  player.AddSound(array, name).then((num) => {
    //console.log(num);
  }).catch(err => {
    window.alert(err);
  });
}
