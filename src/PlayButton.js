class PlayButton extends Button {
  constructor() {
    super();
  }

  Init(view, id, x, y, r, fill) {
    super.Init(view, id, x, y, r, fill);
    let path = CreateLeftTriangle(null, r + 5, r, r, "none", "blue");
    this.svg.appendChild(path);
  }
}
