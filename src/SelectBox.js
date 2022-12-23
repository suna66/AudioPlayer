class SelectBox {
  constructor(id) {
    this.id = id;
    this.onChange = null;
  }

  Init() {
    let e = GetElem(this.id);
    e.addEventListener("change", this.OnChange);
  }

  OnChange = () => {
    if (this.onChange != null) {
      this.onChange(GetElem(this.id).value);
    }
  }

  SetOnChangeEvent(callback) {
    this.onChange = callback;
  }
}
