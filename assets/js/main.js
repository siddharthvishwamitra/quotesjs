let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let img = new Image();
let cropper;

let quoteText = document.getElementById("quoteText");
let textSize = document.getElementById("textSize");
let textColor = document.getElementById("textColor");
let outlineColor = document.getElementById("outlineColor");
let outlineSize = document.getElementById("outlineSize");
let overlayOpacity = document.getElementById("overlayOpacity");
let textAlign = document.getElementById("textAlign");

let cropModal = document.getElementById("cropModal");
let cropperImage = document.getElementById("cropperImage");

document.getElementById("uploadImage").addEventListener("change", function(e) {
  let file = e.target.files[0];
  if (!file) return;
  
  let reader = new FileReader();
  reader.onload = function(evt) {
    cropperImage.src = evt.target.result;
    cropModal.style.display = "flex";
    cropperImage.onload = function() {
      if (cropper) cropper.destroy();
      cropper = new Cropper(cropperImage, {
        aspectRatio: 1,
        viewMode: 1,
        movable: true,
        zoomable: true,
        background: false,
      });
    };
  };
  reader.readAsDataURL(file);
});

function cropAndUse() {
  const canvasCrop = cropper.getCroppedCanvas({
    width: 800,
    height: 800,
  });
  img.src = canvasCrop.toDataURL("image/jpeg");
  cropModal.style.display = "none";
  document.getElementById("imageSelect").style.display = "none";
  document.getElementById("editor").style.display = "flex";
  
  img.onload = updateCanvas;
}

function openEditor(src) {
  img.src = src;
  document.getElementById("imageSelect").style.display = "none";
  document.getElementById("editor").style.display = "flex";
  img.onload = updateCanvas;
}

function updateCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
  // Overlay
  ctx.fillStyle = `rgba(0,0,0,${overlayOpacity.value})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Text
  let lines = quoteText.value.split("\n");
  let size = parseInt(textSize.value);
  ctx.font = `${size}px IGSans-R`;
  ctx.fillStyle = textColor.value;
  ctx.textAlign = textAlign.value;
  ctx.textBaseline = "middle";
  
  let y = canvas.height / 2 - (lines.length - 1) * size / 2;
  
  lines.forEach(line => {
    if (outlineColor.value !== "none" && outlineSize.value > 0) {
      ctx.lineWidth = parseInt(outlineSize.value);
      ctx.strokeStyle = outlineColor.value;
      ctx.strokeText(line, canvas.width / 2, y);
    }
    ctx.fillText(line, canvas.width / 2, y);
    y += size;
  });
}

function downloadImage() {
  let link = document.createElement("a");
  link.download = "quote.jpg";
  link.href = canvas.toDataURL("image/jpeg", 0.95);
  link.click();
}

function resetEditor() {
  document.getElementById("editor").style.display = "none";
  document.getElementById("imageSelect").style.display = "block";
  quoteText.value = "";
}