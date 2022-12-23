
function GetElem(id) {
  return document.getElementById(id);
}

function GetParent(id) {
  return document.getElementById(id).parentNode;
}

function CreateSVGElem(type, id) {
  let elem = document.createElementNS('http://www.w3.org/2000/svg', type);
  if (id != null) {
    elem.id = id;
  }
  return elem;
}

function CreateGroup(id, x, y, width, height) {
  let group = CreateSVGElem("g", id);
  group.setAttribute("width", width);
  group.setAttribute("height", height);
  group.setAttribute("transform", `translate(${x}, ${y})`);
  return group;
}

function CreateWaveFormPath(waveform, id, name, color_id) {
  const scaleY = (amplitude, height) => {
    const range = 256;
    const offset = 128;
    return height - ((amplitude + offset) * height) / range;
  }

  const channel = waveform.channel(0);
  const group = CreateSVGElem("g", `wav_group${id}`);
  group.setAttribute("fill-opacity", "0.5");
  group.setAttribute("width", waveform.length);
  var data = "M 0 0 "
  for (let x = 0; x < waveform.length; x++) {
    const val = channel.max_sample(x);
    data += `L ${x} ${scaleY(val, 100)} `;
  }
  for (let x = waveform.length - 1; x >= 0; x--) {
    const val = channel.min_sample(x);
    data += `L ${x} ${scaleY(val, 100)} `;
  }
  const path = CreateSVGElem("path", `wav_path${id}`);
  path.setAttribute("d", data);
  path.setAttribute("fill", COLOR_DEFINE[color_id].wave);

  const rect = CreateRect(`wav_rect${id}`, 0, 0, waveform.length, 100, COLOR_DEFINE[color_id].back, COLOR_DEFINE[color_id].back);
  const text = CreateText(null, 0, 12, name, "12px", "#000000");
  group.appendChild(rect);
  group.appendChild(path);
  group.appendChild(text);
  return group;
}

function CreateRect(id, x, y, width, height, stroke, fill) {
  const rect = CreateSVGElem("rect", id);
  rect.setAttribute("x", x);
  rect.setAttribute("y", y);
  rect.setAttribute("width", width);
  rect.setAttribute("height", height);
  if (stroke != null) {
    rect.setAttribute("stroke", stroke);
  }
  if  (fill != null) {
    rect.setAttribute("fill", fill);
  }
  return rect;
}

function CreateLine(id, x1, y1, x2, y2, stroke, width) {
  const line = CreateSVGElem("line", id);
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  if (stroke != null) {
    line.setAttribute("stroke", stroke);
  }
  if (width != null) {
    line.setAttribute("stroke-width", width);
  }
  return line;
}

function CreateUse(id, x, y, ref) {
  const use = CreateSVGElem("use", id);
  use.setAttribute("href", `#${ref}`);
  use.setAttribute("x", x);
  use.setAttribute("y", y);

  return use;
}

function CreateText(id, x, y, text, size, color) {
  const txt = CreateSVGElem("text", id);
  txt.setAttribute("x", x);
  txt.setAttribute("y", y);
  txt.setAttribute("font-size", size);
  txt.setAttribute("fill", color);
  txt.textContent = text;

  return txt;
}

function CreateCircle(id, cx, cy, r, stroke, fill) {
  const circle = CreateSVGElem("circle", id);
  circle.setAttribute("cx", cx);
  circle.setAttribute("cy", cy);
  circle.setAttribute("r", r);
  if (stroke != null) {
    circle.setAttribute("stroke", stroke);
  }
  if (fill != null) {
    circle.setAttribute("fill", fill);
  }

  return circle;
}
