class ImgButton extends Button {
  constructor() {
    super();
  }

  Init(view, id, x, y, r, fill, name) {
    super.Init(view, id, x, y, r, fill);
    let text = CreateText(null, r, r, name, "32px", "#000000");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "central");
    this.svg.appendChild(text);
  }
}

