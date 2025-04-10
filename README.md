# QuoteCreator JS

**A clean, fully client-side quote image generator. No backend. No dependencies. Just custom CSS and vanilla JavaScript.**

![Quote Creator Demo](https://quotecreator.pages.dev/screenshot.png) <!-- optional -->

## What It Does

- **Create high-quality quote images in a fixed 1:1 ratio**  
  Ideal for social media posts (Instagram, WhatsApp, etc.)

- **Choose from built-in default images**

- **Upload your own images**  
  - Crop before use (square crop with Cropper.js)
  - Saved locally using **IndexedDB** — your images remain available between sessions

- **Powerful Quote Editor**  
  - Adjust **background opacity**
  - Change **text size**
  - Add **text outline** with configurable **color** and **thickness**
  - Control **text alignment** (left, center, right)

- **Fully Offline & Secure**  
  - Works entirely in the browser
  - No internet required after loading
  - No tracking, no uploads, and no user data collection

- **Custom, Responsive UI**  
  - Built with 100% custom CSS
  - Optimized for both desktop and mobile experience

## Tech Stack

- **Vanilla JavaScript**
- **Custom CSS** (no frameworks like Tailwind or Bootstrap)
- **HTML5 Canvas API**
- **Cropper.js** for cropping (the only third-party dependency)
- **IndexedDB** for saving uploaded images

## How to Use

1. **Pick an image**  
   Choose from default or upload your own.

2. **Crop (if uploaded)**  
   Crop your image into a square with the built-in cropping tool.

3. **Add & Style Text**  
   Customize the font size, color, opacity, outline, and alignment to your liking.

4. **Download Your Image**  
   Once satisfied, save your creation as a square PNG.

5. **Reuse Your Uploaded Images**  
   All uploaded images are saved locally and appear in the **Recent Images** section.

## Local Image Storage

Uploaded images are cached using **IndexedDB**, so you don’t need to re-upload them each time. You can delete any of them from the UI when needed.

## Live Demo

[**Try It Now**](https://quotecreator.pages.dev)

## License

MIT License — free to use, modify, and share.

## Contributions

Pull requests are welcome! Feel free to contribute improvements, features, or bug fixes. Let's make this better together.
