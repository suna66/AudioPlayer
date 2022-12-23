class Button {
  constructor() {
    this.svg = null;
    this.callback = null;
    this.fill = "#CFCFCF";
    this.pushColor = "#AF0000";
    this.isPush = false;
  }

  Init(view, id, x, y, r, fill) {
    let g = CreateSVGElem("g", id);
    g.setAttribute("width", r*2);
    g.setAttribute("height", r*2);
    let circle  = CreateCircle(null, r, r, r, "none", fill);
    g.appendChild(circle);
    g.addEventListener("click", this._onClick);
    g.addEventListener("mousedown", this._onDefaultEvent);
    g.addEventListener("mouseup", this._onDefaultEvent);
    g.addEventListener("mousemove", this._onDefaultEvent);
    g.addEventListener("mouseover", this._onDefaultEvent);
    g.setAttribute("transform", `translate(${x}, ${y})`);
    view.appendChild(g);
    this.svg = g;
    this.fill = fill;
  }

  SetBackColor(color) {
    this.fill = color;
  }

  SetActiveColor(color) {
    this.pushColor = color;
  }

  Move(x, y) {
    this.svg.setAttribute("transform", `translate(${x}, ${y})`);
  }

  SetClick(callback) {
    this.callback = callback;
  }

  OnClickEvent(e) {
    if (this.callback != null) {
      this.callback(e);
    }
  }

  _onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    this.svg.childNodes.item(0).setAttribute("fill", this.pushColor);

    this.OnClickEvent(e);

    setTimeout(() => {
      this.svg.childNodes.item(0).setAttribute("fill", this.fill);
    }, 100);
    return false;
   }

  _onDefaultEvent = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
}
