# Quotes Creator JS

**An advanced, fully client-side quote image generator. No backend. No dependencies. Just premium custom CSS and vanilla JavaScript.**

## What It Does

- **Create high-quality images in Multiple Aspect Ratios** Perfectly sized for any platform: 1:1 (Square), 9:16 (Story/Reel), 16:9 (Banner), and 3:4 (Portrait).

- **Tabbed Default Templates & Custom Uploads** - Choose from built-in images cleanly organized by their native aspect ratios.
  - Upload your own images and crop them to your exact desired layout using Cropper.js.

- **Advanced Typographic Quote Editor** - **Font Selection:** Swap between modern, serif, and sans-serif typefaces.
  - **Author Tag Field:** A dedicated, automatically scaled input for author attributions.
  - **Precision Controls:** Adjust text size, vertical positioning, and line spacing.
  - **Style Modifiers:** Quick toggles for Bold, Italic, and Drop Shadows.
  - **Outlines & Overlays:** Control background tint color/opacity, and add customizable text outlines.

- **Premium Native-App Interface** - **Split-Screen Workspace:** A professional 50/50 dual-column desktop layout that scales down flawlessly on mobile.
  - **Custom Modal Engine:** Ugly browser dropdowns have been entirely replaced with bespoke, touch-friendly UI popups for fonts, alignments, and color palettes.

- **Fully Offline, Persistent & Secure** - Works entirely in the browser (no internet required after loading).
  - **Cropped Canvas Vault:** Your custom-cropped uploads are saved locally using **IndexedDB**, remaining available between sessions without needing to re-upload or re-crop.
  - No tracking, no uploads, and zero user data collection.

## Tech Stack

- **Vanilla JavaScript** (ES6+)
- **Custom CSS** (Zero frameworks, modern CSS Grid/Flexbox)
- **HTML5 Canvas API** (High-resolution rendering engine)
- **Cropper.js** (For dynamic aspect-ratio image cropping)
- **IndexedDB** (For client-side vault storage)

## How to Use

1. **Pick an Image & Layout** Select a pre-made template from the tabs, or upload your own file.
2. **Set Your Ratio & Crop** If uploading, choose your canvas shape (Square, Story, etc.) and crop your image to fit perfectly.
3. **Design & Style** Use the control panel to write your quote, add an author, adjust the vertical alignment, tweak line spacing, and apply custom colors using the built-in palette popups.
4. **Export High-Res** Once satisfied, download your creation as a crisp, full-resolution PNG.
5. **Access Your Vault** Return anytime to reuse your previous custom uploads straight from the IndexedDB-powered vault.

## Local Image Storage

Uploaded images are safely cached in your browser's **IndexedDB**. You don’t need to re-upload or re-crop them each time you visit. You can manage and delete items from your vault directly within the UI.

## Live Demo

[**Try It Now**](https://quotecreator.pages.dev)

## License

MIT License — free to use, modify, and share.

## Contributions

Pull requests are welcome! Feel free to contribute improvements, features, or bug fixes. Let's make this better together.