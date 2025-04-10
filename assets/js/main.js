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
let uploadedImage = null;
let originalWidth = 1080;
let originalHeight = 1080;

let currentSettings = {
  text: "",
  textSize: "40",
  textColor: "#ffffff",
  outlineColor: "none",
  outlineSize: "0",
  textAlign: "center",
  overlayOpacity: "0.5"
};

// IndexedDB Setup
const DB_NAME = "QuoteCreatorDB";
const DB_VERSION = 1;
const STORE_NAME = "recentImages";

function openDB(callback) {
  const request = indexedDB.open(DB_NAME, DB_VERSION);
  request.onupgradeneeded = function(e) {
    const db = e.target.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: "id" });
    }
  };
  request.onsuccess = function(e) {
    callback(e.target.result);
  };
  request.onerror = function(e) {
    console.error("IndexedDB error:", e.target.errorCode);
  };
}

function saveRecentImageIndexedDB(id, src) {
  openDB((db) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put({ id, src });
    tx.oncomplete = () => db.close();
  });
}

function loadRecentFromIndexedDB() {
  openDB((db) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = function() {
      request.result.forEach((item) => addRecentImage(item.src, item.id));
      db.close();
    };
  });
}

function deleteRecentFromIndexedDB(id) {
  openDB((db) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    tx.oncomplete = () => db.close();
  });
}

// Upload & Cropper
document.getElementById("uploadImage").addEventListener("change", function(event) {
  let file = event.target.files[0];
  if (file) {
    let reader = new FileReader();
    reader.onload = function(e) {
      openCropper(e.target.result);
    };
    reader.readAsDataURL(file);
  }
});

function openCropper(imageSrc) {
  document.getElementById("cropContainer").style.display = "block";
  let cropImage = document.getElementById("cropImage");
  cropImage.src = imageSrc;
  
  if (cropper) cropper.destroy();
  cropper = new Cropper(cropImage, {
    aspectRatio: 1,
    viewMode: 1
  });
}

function cropImage() {
  let croppedCanvas = cropper.getCroppedCanvas();
  let croppedImage = croppedCanvas.toDataURL("image/png");
  let id = Date.now().toString();
  saveRecentImageIndexedDB(id, croppedImage);
  addRecentImage(croppedImage, id);
  closeCropper();
}

function closeCropper() {
  document.getElementById("cropContainer").style.display = "none";
}

// Editor Functions
function openEditor(src) {
  document.getElementById("imageSelect").style.display = "none";
  document.getElementById("editor").style.display = "flex";
  
  img = new Image();
  img.onload = () => {
    originalWidth = img.width;
    originalHeight = img.height;
    canvas.width = originalWidth;
    canvas.height = originalHeight;
    updateCanvas();
  };
  img.src = src;
  
  history.pushState({ page: "editor" }, "", "?editor");
}

function updateCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  let overlayOpacity = document.getElementById("overlayOpacity").value || currentSettings.overlayOpacity;
  ctx.fillStyle = `rgba(0, 0, 0, ${overlayOpacity})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  let text = document.getElementById("quoteText").value || currentSettings.text;
  let baseSize = parseInt(document.getElementById("textSize").value || currentSettings.textSize);
  let color = document.getElementById("textColor").value || currentSettings.textColor;
  let outlineColor = document.getElementById("outlineColor").value || currentSettings.outlineColor;
  let outlineSize = parseInt(document.getElementById("outlineSize").value || currentSettings.outlineSize);
  let textAlign = document.getElementById("textAlign").value || currentSettings.textAlign;
  
  let scale = canvas.width / 1000;
  let fontSize = baseSize * scale;
  let lineHeight = fontSize * 1.2;
  let maxWidth = canvas.width * 0.9;
  
  ctx.textAlign = textAlign;
  ctx.fillStyle = color;
  ctx.font = `${fontSize}px IGSans-R`;
  
  let x = textAlign === "left" ? canvas.width * 0.05 : textAlign === "right" ? canvas.width * 0.95 : canvas.width / 2;
  wrapText(ctx, text, x, canvas.height / 2, maxWidth, lineHeight, outlineSize * scale, outlineColor);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, outlineSize, outlineColor) {
  let lines = text.split("\n");
  let wrappedLines = [];
  
  lines.forEach(line => {
    let words = line.split(" ");
    let currentLine = "";
    
    words.forEach(word => {
      let testLine = currentLine + word + " ";
      let width = ctx.measureText(testLine).width;
      if (width > maxWidth && currentLine !== "") {
        wrappedLines.push(currentLine.trim());
        currentLine = word + " ";
      } else {
        currentLine = testLine;
      }
    });
    
    wrappedLines.push(currentLine.trim());
  });
  
  let startY = y - ((wrappedLines.length - 1) * lineHeight) / 2;
  
  wrappedLines.forEach((line, i) => {
    let posY = startY + i * lineHeight;
    if (outlineSize > 0 && outlineColor !== "none") {
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = outlineSize;
      ctx.strokeText(line, x, posY);
    }
    ctx.fillText(line, x, posY);
  });
}

function downloadImage() {
  let link = document.createElement("a");
  link.download = "quote.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function resetEditor() {
  document.getElementById("editor").style.display = "none";
  document.getElementById("imageSelect").style.display = "block";
  history.pushState({ page: "home" }, "", window.location.pathname);
}

window.addEventListener("popstate", function(event) {
  if (event.state && event.state.page === "editor") {
    openEditor(img.src);
  } else {
    resetEditor();
  }
});

// UI: Recent Section
function addRecentImage(src, id) {
  let recentContainer = document.getElementById("recentImages");
  if ([...recentContainer.querySelectorAll("img")].some(i => i.src === src)) return;
  
  let imageDiv = document.createElement("div");
  imageDiv.classList.add("image-item");
  
  let img = document.createElement("img");
  img.src = src;
  img.onclick = () => openEditor(src);
  
  let deleteBtn = document.createElement("div");
  deleteBtn.classList.add("delete-icon");
  deleteBtn.innerHTML = "×";
  deleteBtn.onclick = () => {
    imageDiv.remove();
    if (id) deleteRecentFromIndexedDB(id);
    checkRecentVisibility();
  };
  
  imageDiv.appendChild(img);
  imageDiv.appendChild(deleteBtn);
  recentContainer.appendChild(imageDiv);
  checkRecentVisibility();
}

function checkRecentVisibility() {
  let recentContainer = document.getElementById("recentImages");
  let recentTitle = document.getElementById("recentTitle");
  recentTitle.style.display = recentContainer.children.length > 0 ? "block" : "none";
}

window.addEventListener("DOMContentLoaded", loadRecentFromIndexedDB);
