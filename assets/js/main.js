/*!
 * Quote Creator JS
 * (c) 2025 Siddharth Kumar
 * MIT License
 * https://github.com/siddharthvishwamitra
 */

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let img = new Image();
let cropper;
let selectedImageSrc = "";
let currentActiveModalMode = ""; 

let targetWidth = 1080;
let targetHeight = 1080;
let targetAspectRatio = 1;

let textStyles = { bold: false, italic: false, shadow: false };

let activeSettings = {
  textColor: "#ffffff",
  overlayColor: "#000000",
  outlineColor: "none", 
  fontFamily: "Geist",
  fontFamilyName: "Geist",
  textAlign: "center"
};

const premiumColorPalette = [
  "#ffffff", "#000000", "#f44336", "#e91e63", "#9c27b0",
  "#673ab7", "#3f51b5", "#2196f3", "#03a9f4", "#00bcd4",
  "#009688", "#4caf50", "#8bc34a", "#ffeb3b", "#ffc107",
  "#ff9800", "#ff5722", "#795548", "#9e9e9e", "#607d8b"
];

const fontOptions = [
    { name: "Geist", value: "Geist" },
    { name: "Instagram Sans", value: "IGSans-R" },
    { name: "Classic Serif", value: "serif" },
    { name: "Monospace", value: "monospace" }
];

const alignOptions = [
    { name: "Left", value: "left" },
    { name: "Center", value: "center" },
    { name: "Right", value: "right" }
];

const DB_NAME = "QuoteCreatorDB";
const DB_VERSION = 1;
const STORE_NAME = "recentImages";

function openDB(callback) {
  const request = indexedDB.open(DB_NAME, DB_VERSION);
  request.onupgradeneeded = (e) => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: "id" });
  };
  request.onsuccess = (e) => callback(e.target.result);
}

function saveRecentImageIndexedDB(id, src) {
  openDB((db) => db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put({ id, src }));
}

function loadRecentFromIndexedDB() {
  openDB((db) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll();
    request.onsuccess = () => request.result.forEach((item) => addRecentImage(item.src, item.id));
  });
}

function deleteRecentFromIndexedDB(id) {
  openDB((db) => db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).delete(id));
}

function openTab(event, tabId) {
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(tb => tb.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

function loadTemplate(src, ratio, width, height) {
    targetAspectRatio = ratio; targetWidth = width; targetHeight = height;
    let tempImg = new Image();
    tempImg.onload = () => openEditor(src);
    tempImg.src = src;
}

document.getElementById("uploadImage").addEventListener("change", function(event) {
  let file = event.target.files[0];
  if (file) {
    let reader = new FileReader();
    reader.onload = (e) => {
        selectedImageSrc = e.target.result;
        document.getElementById("imageSelect").style.display = "none";
        document.getElementById("ratioSelectContainer").style.display = "block";
    };
    reader.readAsDataURL(file);
  }
});

function loadVaultImage(src) {
    let tempImg = new Image();
    tempImg.onload = function() {
      targetWidth = tempImg.width; targetHeight = tempImg.height; targetAspectRatio = targetWidth / targetHeight;
      openEditor(src);
    };
    tempImg.src = src;
}

function setRatioAndProceed(aspectRatio, width, height) {
  targetAspectRatio = aspectRatio; targetWidth = width; targetHeight = height;
  document.getElementById("ratioSelectContainer").style.display = "none";
  openCropper(selectedImageSrc);
}

function openCropper(imageSrc) {
  document.getElementById("cropContainer").style.display = "flex";
  let cropImage = document.getElementById("cropImage");
  cropImage.src = imageSrc;
  
  if (cropper) cropper.destroy();
  setTimeout(() => {
    cropper = new Cropper(cropImage, {
      aspectRatio: targetAspectRatio, viewMode: 1, responsive: true, restore: false
    });
  }, 50);
}

function cropImage() {
  if (!cropper) return;
  let croppedCanvas = cropper.getCroppedCanvas({ width: targetWidth, height: targetHeight });
  let croppedImage = croppedCanvas.toDataURL("image/png");
  let id = Date.now().toString();
  
  saveRecentImageIndexedDB(id, croppedImage);
  addRecentImage(croppedImage, id);
  closeCropper();
  openEditor(croppedImage);
}

function closeCropper() {
  document.getElementById("cropContainer").style.display = "none";
  if (cropper) { cropper.destroy(); cropper = null; }
  if (!document.getElementById("editor").style.display || document.getElementById("editor").style.display === "none") resetEditor();
}

function openModalPicker(mode) {
  currentActiveModalMode = mode;
  let modalWindow = document.getElementById("customModalWindow");
  let modalTitle = document.getElementById("customModalTitle");
  let modalBody = document.getElementById("customModalBody");
  modalBody.innerHTML = "";
  
  if (mode === "textColor" || mode === "overlayColor" || mode === "outlineColor") {
      modalTitle.innerText = mode === "textColor" ? "Text Color" : mode === "overlayColor" ? "Overlay Tint" : "Outline Color";
      
      if (mode === "outlineColor") {
          let noneBtn = document.createElement("div");
          noneBtn.classList.add("modal-list-item");
          if (activeSettings.outlineColor === "none") noneBtn.classList.add("selected");
          noneBtn.innerText = "No Outline (Clear)";
          noneBtn.onclick = function() {
              activeSettings.outlineColor = "none";
              updateUIAndCanvas();
              closeCustomModal();
          };
          modalBody.appendChild(noneBtn);
      }

      let gridElement = document.createElement("div");
      gridElement.classList.add("color-swatch-grid");
      
      premiumColorPalette.forEach(hexColor => {
        let swatch = document.createElement("div");
        swatch.classList.add("swatch-item");
        swatch.style.backgroundColor = hexColor;
        
        if (activeSettings[mode] === hexColor) swatch.classList.add("selected");
        
        swatch.onclick = function() {
          activeSettings[mode] = hexColor;
          updateUIAndCanvas();
          closeCustomModal();
        };
        gridElement.appendChild(swatch);
      });
      modalBody.appendChild(gridElement);
  }
  else if (mode === "fontFamily") {
      modalTitle.innerText = "Select Font Family";
      fontOptions.forEach(font => {
          let item = document.createElement("div");
          item.classList.add("modal-list-item");
          if (activeSettings.fontFamily === font.value) item.classList.add("selected");
          item.innerText = font.name;
          item.style.fontFamily = font.value;
          item.onclick = function() {
              activeSettings.fontFamily = font.value;
              activeSettings.fontFamilyName = font.name;
              updateUIAndCanvas();
              closeCustomModal();
          };
          modalBody.appendChild(item);
      });
  }
  else if (mode === "textAlign") {
      modalTitle.innerText = "Text Alignment";
      let grid = document.createElement("div");
      grid.classList.add("align-grid");
      
      alignOptions.forEach(align => {
          let item = document.createElement("div");
          item.classList.add("modal-list-item");
          if (activeSettings.textAlign === align.value) item.classList.add("selected");
          item.innerText = align.name;
          item.onclick = function() {
              activeSettings.textAlign = align.value;
              updateUIAndCanvas();
              closeCustomModal();
          };
          grid.appendChild(item);
      });
      modalBody.appendChild(grid);
  }
  
  modalWindow.style.display = "flex";
}

function closeCustomModal() { document.getElementById("customModalWindow").style.display = "none"; }

function updateUIAndCanvas() {
  document.getElementById("textColorBlob").style.backgroundColor = activeSettings.textColor;
  document.getElementById("overlayColorBlob").style.backgroundColor = activeSettings.overlayColor;
  
  let outlineBlob = document.getElementById("outlineColorBlob");
  let outlineLabel = document.getElementById("outlineColorLabel");
  if (activeSettings.outlineColor === "none") {
      outlineBlob.style.backgroundColor = "transparent";
      outlineLabel.innerText = "None";
  } else {
      outlineBlob.style.backgroundColor = activeSettings.outlineColor;
      outlineLabel.innerText = "Custom";
  }

  document.getElementById("fontFamilyLabel").innerText = activeSettings.fontFamilyName;
  document.getElementById("fontFamilyLabel").style.fontFamily = activeSettings.fontFamily;
  
  document.getElementById("textAlignLabel").innerText = activeSettings.textAlign.charAt(0).toUpperCase() + activeSettings.textAlign.slice(1);
  
  updateCanvas();
}

function openEditor(src) {
  document.getElementById("imageSelect").style.display = "none";
  document.getElementById("ratioSelectContainer").style.display = "none";
  document.getElementById("editor").style.display = "grid";
  
  img = new Image();
  img.onload = () => {
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    updateUIAndCanvas();
  };
  img.src = src;
  history.pushState({ page: "editor" }, "", "?editor");
}

function toggleStyle(styleKey) {
  textStyles[styleKey] = !textStyles[styleKey];
  document.getElementById(`btn${styleKey.charAt(0).toUpperCase() + styleKey.slice(1)}`).classList.toggle('active', textStyles[styleKey]);
  updateCanvas();
}

function updateCanvas() {
  if (!img.src) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  let overlayOpacity = document.getElementById("overlayOpacity").value;
  let r = parseInt(activeSettings.overlayColor.substr(1,2), 16);
  let g = parseInt(activeSettings.overlayColor.substr(3,2), 16);
  let b = parseInt(activeSettings.overlayColor.substr(5,2), 16);
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${overlayOpacity})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  let text = document.getElementById("quoteText").value;
  let author = document.getElementById("authorText").value;
  let baseSize = parseInt(document.getElementById("textSize").value);
  let customLineSpacing = parseFloat(document.getElementById("lineSpacing").value);
  
  let textYPercent = parseInt(document.getElementById("textYPosition").value);
  let outlineSize = parseInt(document.getElementById("outlineSize").value);

  let scale = canvas.width / 1000;
  let fontSize = baseSize * scale;
  let lineHeight = fontSize * customLineSpacing;
  let maxWidth = canvas.width * 0.85;
  
  let fontModifiers = textStyles.italic ? "italic " : "";
  if (textStyles.bold) fontModifiers += "bold ";
  
  ctx.font = `${fontModifiers}${fontSize}px "${activeSettings.fontFamily}", sans-serif`;
  ctx.fillStyle = activeSettings.textColor;
  ctx.textAlign = activeSettings.textAlign;
  
  if (textStyles.shadow) {
    ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
    ctx.shadowBlur = 12 * scale;
    ctx.shadowOffsetX = 3 * scale;
    ctx.shadowOffsetY = 3 * scale;
  } else {
    ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
  }
  
  let x = activeSettings.textAlign === "left" ? canvas.width * 0.08 : activeSettings.textAlign === "right" ? canvas.width * 0.92 : canvas.width / 2;
  let y = canvas.height * (textYPercent / 100);
  
  let finalY = wrapText(ctx, text, x, y, maxWidth, lineHeight, outlineSize * scale, activeSettings.outlineColor);

  if (author.trim() !== "") {
      let authorFontSize = fontSize * 0.55; 
      let authorFontModifiers = textStyles.italic ? "italic " : "";
      ctx.font = `${authorFontModifiers}${authorFontSize}px "${activeSettings.fontFamily}", sans-serif`;
      
      let authorY = finalY + (lineHeight * 1.2);
      
      if (outlineSize > 0 && activeSettings.outlineColor !== "none") {
          ctx.strokeStyle = activeSettings.outlineColor;
          ctx.lineWidth = outlineSize * scale * 0.5;
          let tempShadow = ctx.shadowColor;
          ctx.shadowColor = "transparent";
          ctx.strokeText(author, x, authorY);
          ctx.shadowColor = tempShadow;
      }
      ctx.fillText(author, x, authorY);
  }
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, outlineSize, outlineColor) {
  if (!text) return y;
  
  let lines = text.split("\n");
  let wrappedLines = [];
  
  lines.forEach(line => {
    let words = line.split(" ");
    let currentLine = "";
    words.forEach(word => {
      let testLine = currentLine + word + " ";
      if (ctx.measureText(testLine).width > maxWidth && currentLine !== "") {
        wrappedLines.push(currentLine.trim());
        currentLine = word + " ";
      } else {
        currentLine = testLine;
      }
    });
    wrappedLines.push(currentLine.trim());
  });
  
  let startY = y - ((wrappedLines.length - 1) * lineHeight) / 2;
  let lastDrawnY = startY;

  wrappedLines.forEach((line, i) => {
    let posY = startY + i * lineHeight;
    lastDrawnY = posY;
    
    if (outlineSize > 0 && outlineColor !== "none") {
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = outlineSize;
      let tempShadow = ctx.shadowColor;
      ctx.shadowColor = "transparent";
      ctx.strokeText(line, x, posY);
      ctx.shadowColor = tempShadow;
    }
    ctx.fillText(line, x, posY);
  });
  
  return lastDrawnY;
}

function downloadImage() {
  let link = document.createElement("a");
  link.download = `quote_${Date.now()}.png`;
  link.href = canvas.toDataURL("image/png", 1.0);
  link.click();
}

function resetEditor() {
  document.getElementById("editor").style.display = "none";
  document.getElementById("ratioSelectContainer").style.display = "none";
  document.getElementById("imageSelect").style.display = "block";
  document.getElementById("uploadImage").value = "";
  selectedImageSrc = "";
  history.pushState({ page: "home" }, "", window.location.pathname);
}

window.addEventListener("popstate", function(event) {
  if (event.state && event.state.page === "editor") openEditor(img.src);
  else resetEditor();
});

function addRecentImage(src, id) {
  let container = document.getElementById("recentImages");
  if ([...container.querySelectorAll("img")].some(i => i.src === src)) return;
  
  let div = document.createElement("div");
  div.classList.add("image-item");
  
  let imgEl = document.createElement("img");
  imgEl.src = src;
  imgEl.onclick = () => loadVaultImage(src);
  
  let btn = document.createElement("div");
  btn.classList.add("delete-icon");
  btn.innerHTML = "×";
  btn.onclick = (e) => {
    e.stopPropagation();
    div.remove();
    if (id) deleteRecentFromIndexedDB(id);
    checkRecentVisibility();
  };
  
  div.appendChild(imgEl);
  div.appendChild(btn);
  container.appendChild(div);
  checkRecentVisibility();
}

function checkRecentVisibility() {
  let len = document.getElementById("recentImages").children.length;
  document.getElementById("recentTitle").style.display = len > 0 ? "block" : "none";
}

window.addEventListener("DOMContentLoaded", loadRecentFromIndexedDB);