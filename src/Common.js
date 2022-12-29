//Global variables and Constant variables

const ADJUST_WIDTH = 10;
const ADJUST_HEIGHT = 50;
const BUTTON_RADIUS = 60;

const VIEW_BACK_COLOR = "#AFAFAF";
const VIEW_MEASURE_LINE_COLOR = "#CFCFCF";
const VIEW_BEAT_LINE_COLOR = "#9F9F9F";
const VIEW_PROGRESS_COLOR = "#FFFFFF";

const DEFAULT_VOL = 0.5;
const DEFAULT_BPM = 120;
const DEFAULT_MEASURE_WIDTH = 120;
const DEFAULT_DIVIDE_NUM = 4;

const COLOR_DEFINE = [
  {
    wave: "#FF0000",
    back: "#7F0000",
    select: "#CF0000"
  },
  {
    wave: "#00FF00",
    back: "#007F00",
    select: "#00CF00"
  },
  {
    wave: "#0000FF",
    back: "#00007F",
    select: "#0000CF"
  },
  {
    wave: "#FFFF00",
    back: "#7F7F00",
    select: "#CFCF00"
  },
  {
    wave: "#00FFFF",
    back: "#007F7F",
    select: "#00CFCF"
  },
  {
    wave: "#FF00FF",
    back: "#7F007F",
    select: "#CF00CF"
  },
];

function GetRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function GetSecParMeasure(bpm) {
  return (60/bpm)*4;
}

function GetSecParPixel(bpm, widthParMeasure) {
  let secParMeasure = GetSecParMeasure(bpm);
  return secParMeasure/widthParMeasure;
}

function GetSecFromWorldPos(bpm, widthParMeasure, x) {
  let secParPixel = GetSecParPixel(bpm, widthParMeasure);
  return x * secParPixel;
}

function GetMeasurePos(widthParMeasure, x) {
  return x / widthParMeasure;
}

function GetWorldPosFromMeasurePos(bpm, widthParMeasure, measurePos) {
  return measurePos * widthParMeasure;
}
