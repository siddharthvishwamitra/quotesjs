let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let img = new Image();
let customFont = new FontFace('IGSans-R', 'url(/assets/font/InstagramSans-Regular.ttf)');

customFont.load().then((font) => document.fonts.add(font)).catch(() => {});

// Store current text/settings when switching images
let currentSettings = {
  text: "",
  textSize: "40",
  textColor: "#ffffff",
  outlineColor: "none",
  outlineSize: "0",
  textAlign: "center",
  overlayOpacity: "0.5"
};

// Ensure images are clickable
document.querySelectorAll(".image-item").forEach((image) => {
  image.addEventListener("click", function() {
    let src = this.getAttribute("src");
    openEditor(src);
  });
});

// Open editor without resetting settings
function openEditor(src) {
  document.getElementById("imageSelect").style.display = "none";
  document.getElementById("editor").style.display = "flex";
  
  img.src = src;
  img.onload = () => updateCanvas();
  
  // Store ?editor in history without allowing direct access
  history.pushState({ page: "editor" }, "", "?editor");
}

// Update canvas with stored settings
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
  
  ctx.font = `${size}px IGSans-R, Arial`;
  ctx.fillStyle = color;
  ctx.textAlign = textAlign;
  
  let x = textAlign === "left" ? 50 : textAlign === "right" ? canvas.width - 50 : canvas.width / 2;
  wrapText(ctx, text, x, canvas.height / 2, 500, size * 1.2, outlineSize, outlineColor);
}

// Handle text wrapping with outline
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

// Download the generated image
function downloadImage() {
  let link = document.createElement("a");
  link.download = "quote.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

// Change image in editor without resetting settings
function changeImage(src) {
  img.src = src;
  img.onload = () => updateCanvas();
}

// Save settings before resetting editor
function resetEditor() {
  document.getElementById("editor").style.display = "none";
  document.getElementById("imageSelect").style.display = "block";
  
  // Store current settings before reset
  currentSettings.text = document.getElementById("quoteText").value;
  currentSettings.textSize = document.getElementById("textSize").value;
  currentSettings.textColor = document.getElementById("textColor").value;
  currentSettings.outlineColor = document.getElementById("outlineColor").value;
  currentSettings.outlineSize = document.getElementById("outlineSize").value;
  currentSettings.textAlign = document.getElementById("textAlign").value;
  currentSettings.overlayOpacity = document.getElementById("overlayOpacity").value;
  
  // Remove ?editor from URL safely
  history.pushState({ page: "home" }, "", window.location.pathname);
}

// Handle Android back button and browser back action
window.addEventListener("popstate", function(event) {
  if (event.state && event.state.page === "editor") {
    openEditor(img.src); // Reopen editor without affecting layout
  } else {
    resetEditor(); // Go back to image selection properly
  }
});