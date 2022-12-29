class StopButton extends Button {
  constructor() {
    super();
  }

  Init(view, id, x, y, r, fill) {
    super.Init(view, id, x, y, r, fill);
    let path = CreateRect(null, r/2, r/2, r, r, "none", "red");
    this.svg.appendChild(path);
  }
}
