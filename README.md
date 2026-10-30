# Platorama 

Build a mobile-first AR virtual menu interface accessible via QR code.
Overall concept:
A restaurant digital menu that displays dishes in Augmented Reality using the device's native AR viewer. When a user scans a QR code, they land on this interface. The primary experience is an AR view of a 3D dish (captured via photogrammetry), overlaid with a custom UI showing dish name, description, and ingredients.

Visual design reference:

Dark, elegant, fine-dining aesthetic
Background: deep black/dark charcoal
Typography: thin serif font (like Cormorant Garamond or similar) in white/cream
Category label above dish name (e.g. "ENTRÉE") in small spaced caps, muted tone
Dish name in large bold serif (e.g. "HOUMOUS")
Ingredients listed in small italic serif text, centered, below the name
Bottom navigation: horizontal scrollable row of circular dish thumbnails with dish names below — the active/selected dish is highlighted (larger, white ring border)
Left/right arrows for navigation
The overall feel is: luxury restaurant meets spatial computing


Core features:

AR Dish Viewer (native device AR)

On iOS: trigger native AR via an <a> tag with rel="ar" linking to a .usdz file
On Android/other: use .glb file with <model-viewer> web component (Google's library)
Detect the platform (iOS vs Android) and serve the correct file format automatically
The AR launch should feel seamless — one tap on the dish or a dedicated "View in AR" button


Dish selector carousel (bottom bar)

Horizontally scrollable row of circular thumbnails (real food photos)
Each dish has a short name below
Active dish: slightly enlarged, white circular border highlight
Smooth transition animation when switching dishes


Dish info overlay

Displayed above the carousel, centered on screen
Category (e.g. "ENTRÉE", "PLAT", "DESSERT") — small spaced caps
Dish name — large elegant serif
Ingredients — small italic text, 2–3 lines max, centered


Data structure (JSON-based menu)

json[
  {
    "id": 1,
    "category": "ENTRÉE",
    "name": "Houmous",
    "ingredients": "Pois chiches, tahini, citron, ail, huile d'olive, sumac, herbes fraîches",
    "thumbnail": "/dishes/houmous.jpg",
    "model_ios": "/models/houmous.usdz",
    "model_android": "/models/houmous.glb"
  }
]

Platform detection logic

jsconst isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
// iOS → use <a href="model.usdz" rel="ar"> inside an <img> tag
// Android → use <model-viewer src="model.glb" ar ar-modes="scene-viewer webxr">

Responsive & mobile-first

Designed exclusively for portrait mobile (375–430px wide)
No desktop layout needed
Touch-friendly tap targets (min 48px)
Fast load: lazy load 3D models, only load selected dish




Tech stack:

React + Tailwind CSS
@google/model-viewer for Android AR
Native iOS AR via <a rel="ar"> HTML trick
No backend needed — static JSON menu data


Pages / screens:

Single page app (SPA), one screen only
Optional: subtle loading splash screen with restaurant logo for 1–2 seconds on first load


Interactions & animations:

Dish switch: fade transition on name/ingredients, smooth scroll snap on carousel
"View in AR" CTA button: appears below dish name, pill-shaped, light border, elegant
On AR launch (iOS): opens native QuickLook AR viewer
On AR launch (Android): opens scene-viewer or model-viewer in-page AR

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://platorama.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/de8665e3-2b44-4cd4-bee0-cfd9a9cafa55).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
