let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let img = new Image();
let cropper;
let uploadedImage = null;
let currentSettings = {
  text: "",
  textSize: "40",
  textColor: "#ffffff",
  outlineColor: "none",
  outlineSize: "0",
  textAlign: "center",
  overlayOpacity: "0.5"
};

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
  
  addRecentImage(croppedImage);
  closeCropper();
}

function closeCropper() {
  document.getElementById("cropContainer").style.display = "none";
}

function addRecentImage(src) {
  let recentContainer = document.getElementById("recentImages");
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
  if (recentContainer.children.length > 0) {
    recentTitle.style.display = "block";
  } else {
    recentTitle.style.display = "none";
  }
}

function openEditor(src) {
  document.getElementById("imageSelect").style.display = "none";
  document.getElementById("editor").style.display = "flex";
  
  img.src = src;
  img.onload = () => updateCanvas();
  
  history.pushState({ page: "editor" }, "", "?editor");
}

function updateCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  let overlayOpacity = document.getElementById("overlayOpacity").value || currentSettings.overlayOpacity;
  ctx.fillStyle = `rgba(0, 0, 0, ${overlayOpacity})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  let text = document.getElementById("quoteText").value || currentSettings.text;
  let size = document.getElementById("textSize").value || currentSettings.textSize;
  let color = document.getElementById("textColor").value || currentSettings.textColor;
  let outlineColor = document.getElementById("outlineColor").value || currentSettings.outlineColor;
  let outlineSize = document.getElementById("outlineSize").value || currentSettings.outlineSize;
  let textAlign = document.getElementById("textAlign").value || currentSettings.textAlign;
  
  ctx.font = `${size}px Arial`;
  ctx.fillStyle = color;
  ctx.textAlign = textAlign;
  
  let x = textAlign === "left" ? 50 : textAlign === "right" ? canvas.width - 50 : canvas.width / 2;
  wrapText(ctx, text, x, canvas.height / 2, 500, size * 1.2, outlineSize, outlineColor);
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, outlineSize, outlineColor) {
  let lines = text.split("\n");
  let wrappedLines = [];
  
  lines.forEach((line) => {
    let words = line.split(" ");
    let tempLine = "";
    
    words.forEach((word) => {
      let testLine = tempLine + word + " ";
      let metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && tempLine.length > 0) {
        wrappedLines.push(tempLine.trim());
        tempLine = word + " ";
      } else {
        tempLine = testLine;
      }
    });
    
    wrappedLines.push(tempLine.trim());
  });
  
  let startY = y - ((wrappedLines.length - 1) * lineHeight) / 2;
  wrappedLines.forEach((line, i) => {
    let lineY = startY + i * lineHeight;
    if (outlineSize > 0 && outlineColor !== "none") {
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = outlineSize;
      ctx.strokeText(line, x, lineY);
    }
    ctx.fillText(line, x, lineY);
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

function saveRecentToLocalStorage() {
  let images = Array.from(document.querySelectorAll("#recentImages img")).map(img => img.src);
  localStorage.setItem("recentUploads", JSON.stringify(images));
}

function loadRecentFromLocalStorage() {
  let images = JSON.parse(localStorage.getItem("recentUploads") || "[]");
  images.forEach(src => addRecentImage(src));
}

function addRecentImage(src) {
  let recentContainer = document.getElementById("recentImages");
  
  // Avoid duplicate
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
    saveRecentToLocalStorage();
    checkRecentVisibility();
  };
  
  imageDiv.appendChild(img);
  imageDiv.appendChild(deleteBtn);
  recentContainer.appendChild(imageDiv);
  checkRecentVisibility();
  saveRecentToLocalStorage();
}

window.addEventListener("DOMContentLoaded", loadRecentFromLocalStorage);