class TextBox {
  constructor(id) {
    this.id = id;
    this.onChange = null;
  }

  Init() {
    let btn = GetElem(this.id);
    btn.addEventListener("change", this.OnChange);
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
