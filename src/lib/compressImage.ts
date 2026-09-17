const MAX_IMAGE_EDGE = 1600;
const TARGET_IMAGE_BYTES = 450 * 1024;
const MIN_IMAGE_QUALITY = 0.58;

const canvasToBlob = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error("La compression de l'image a échoué")),
      "image/webp",
      quality,
    );
  });

const loadImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Cette image ne peut pas être lue"));
    };
    image.src = url;
  });

/** Optimise a dish photo for fast mobile menus while preserving its aspect ratio. */
export const compressDishImage = async (file: File): Promise<File> => {
  const image = await loadImage(file);
  const initialScale = Math.min(1, MAX_IMAGE_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
  let width = Math.max(1, Math.round(image.naturalWidth * initialScale));
  let height = Math.max(1, Math.round(image.naturalHeight * initialScale));
  let quality = 0.84;
  let blob: Blob | null = null;

  for (let attempt = 0; attempt < 7; attempt += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) throw new Error("La compression n'est pas disponible sur cet appareil");

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(image, 0, 0, width, height);
    blob = await canvasToBlob(canvas, quality);

    if (blob.size <= TARGET_IMAGE_BYTES) break;
    if (quality > MIN_IMAGE_QUALITY) {
      quality = Math.max(MIN_IMAGE_QUALITY, quality - 0.08);
    } else {
      width = Math.max(1, Math.round(width * 0.82));
      height = Math.max(1, Math.round(height * 0.82));
    }
  }

  if (!blob) throw new Error("La compression de l'image a échoué");

  const baseName = file.name.replace(/\.[^.]+$/, "") || "photo-plat";
  return new File([blob], `${baseName}.webp`, {
    type: "image/webp",
    lastModified: Date.now(),
  });
};