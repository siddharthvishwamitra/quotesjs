/*!
 * Quote Creator JS (Safety)
 * (c) 2025 Siddharth Kumar
 * MIT License
 * https://github.com/siddharthvishwamitra
 */

class InteractionProtector {
  constructor(options = {}) {
    this.selector = options.selector || "body";
    this.enableImageCopy = options.enableImageCopy || false;
    this.longPressDuration = options.longPressDuration || 600;
    this._applyProtections();
  }

  _applyProtections() {
    const el = document.querySelector(this.selector);
    if (!el) return;

    // Disable context menu
    el.addEventListener("contextmenu", (e) => {
      if (!this._isEditableElement(e.target)) e.preventDefault();
    });

    // Disable selection
    el.style.userSelect = "none";
    el.addEventListener("selectstart", (e) => {
      if (!this._isEditableElement(e.target)) e.preventDefault();
    });

    // Disable dragging
    el.addEventListener("dragstart", (e) => {
      if (!this._isEditableElement(e.target)) e.preventDefault();
    });

    // Disable copy/cut/paste outside input/textarea
    ["copy", "cut", "paste"].forEach((evt) => {
      el.addEventListener(evt, (e) => {
        if (!this._isEditableElement(e.target)) e.preventDefault();
      });
    });

    // Enable long press to copy image (optional)
    if (this.enableImageCopy) {
      const images = el.querySelectorAll("img");
      images.forEach((img) => this._addLongPressCopy(img));
    }
  }

  _isEditableElement(el) {
    return el.tagName === "TEXTAREA" || (el.tagName === "INPUT" && !el.readOnly && !el.disabled);
  }

  _addLongPressCopy(imgEl) {
    let pressTimer = null;

    const startPress = () => {
      pressTimer = setTimeout(() => this._copyImage(imgEl), this.longPressDuration);
    };

    const cancelPress = () => clearTimeout(pressTimer);

    imgEl.addEventListener("mousedown", startPress);
    imgEl.addEventListener("mouseup", cancelPress);
    imgEl.addEventListener("mouseleave", cancelPress);
    imgEl.addEventListener("touchstart", startPress);
    imgEl.addEventListener("touchend", cancelPress);
  }

  async _copyImage(imgEl) {
    try {
      const res = await fetch(imgEl.src);
      const blob = await res.blob();
      const item = new ClipboardItem({ [blob.type]: blob });
      await navigator.clipboard.write([item]);
    } catch (err) {
      // silently fail
    }
  }
}

// Usage
document.addEventListener("DOMContentLoaded", () => {
  new InteractionProtector({
    selector: "body",
    enableImageCopy: true
  });
});
