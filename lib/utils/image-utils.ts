/**
 * Image utility functions for crop, resize, and base64 conversion
 */

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export interface CompressionOptions {
  targetSizeKB?: number; // Target max size in KB (default: 500)
  minQuality?: number; // Minimum quality 0-1 (default: 0.6)
  maxQuality?: number; // Starting quality 0-1 (default: 0.9)
  qualityStep?: number; // Quality reduction per iteration (default: 0.05)
  preferWebP?: boolean; // Use WebP if supported (default: true)
  maxDimension?: number; // Max width/height (default: 1920)
}

export interface CompressionResult {
  data: string; // Base64 data URL
  originalSize: number; // Original size in bytes
  compressedSize: number; // Final size in bytes
  quality: number; // Final quality used (0-1)
  format: "jpeg" | "webp"; // Output format
  iterations: number; // Compression iterations
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

/**
 * Create an HTMLImageElement from a URL or data URL
 */
export function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

/**
 * Get cropped and optionally resized image as base64
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: CropArea,
  maxWidth: number = 800,
  quality: number = 0.85
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  // Calculate scale for resize
  const scale = maxWidth > 0 ? Math.min(1, maxWidth / pixelCrop.width) : 1;
  canvas.width = Math.floor(pixelCrop.width * scale);
  canvas.height = Math.floor(pixelCrop.height * scale);

  // Draw the cropped image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  // Return as base64
  return canvas.toDataURL("image/jpeg", quality);
}

/**
 * Resize image to specified dimensions
 */
export async function resizeImage(
  imageSrc: string,
  width: number,
  height: number,
  quality: number = 0.85
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", quality);
}

/**
 * Read a file as a data URL
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file"));
      }
    });
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file (type and size)
 */
export function validateImageFile(file: File): ImageValidationResult {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_TYPES.map((t) => t.split("/")[1]).join(", ")}`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
    return {
      valid: false,
      error: `File too large. Maximum size: ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Get image dimensions from a data URL
 */
export async function getImageDimensions(
  src: string
): Promise<{ width: number; height: number }> {
  const image = await createImage(src);
  return {
    width: image.naturalWidth,
    height: image.naturalHeight,
  };
}

/**
 * Calculate new dimensions maintaining aspect ratio
 */
export function calculateAspectRatioDimensions(
  originalWidth: number,
  originalHeight: number,
  newWidth?: number,
  newHeight?: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;

  if (newWidth && !newHeight) {
    return {
      width: newWidth,
      height: Math.round(newWidth / aspectRatio),
    };
  }

  if (newHeight && !newWidth) {
    return {
      width: Math.round(newHeight * aspectRatio),
      height: newHeight,
    };
  }

  return {
    width: newWidth || originalWidth,
    height: newHeight || originalHeight,
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Estimate base64 size from file size
 * Base64 encoding increases size by ~33%
 */
export function estimateBase64Size(fileSize: number): number {
  return Math.ceil(fileSize * 1.37);
}

// WebP support detection cache
let webpSupported: boolean | null = null;

/**
 * Check if browser supports WebP format
 */
export function supportsWebP(): boolean {
  if (typeof document === "undefined") return false;
  if (webpSupported !== null) return webpSupported;

  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  webpSupported = canvas.toDataURL("image/webp").startsWith("data:image/webp");
  return webpSupported;
}

/**
 * Get actual byte size from base64 data URL
 */
export function getBase64Size(base64: string): number {
  const base64Data = base64.split(",")[1] || "";
  return Math.round(base64Data.length * 0.75);
}

/**
 * Scale dimensions to fit within max dimension while maintaining aspect ratio
 */
export function scaleDimensionsToMax(
  width: number,
  height: number,
  maxDimension: number
): { width: number; height: number; scaled: boolean } {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height, scaled: false };
  }

  const ratio = Math.min(maxDimension / width, maxDimension / height);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
    scaled: true,
  };
}

/**
 * Adaptively compress image to meet target file size
 * Uses iterative quality reduction and optional WebP format
 */
export async function compressImageAdaptive(
  imageSrc: string,
  cropArea?: CropArea,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    targetSizeKB = 500,
    minQuality = 0.6,
    maxQuality = 0.9,
    qualityStep = 0.05,
    preferWebP = true,
    maxDimension = 1920,
  } = options;

  const image = await createImage(imageSrc);
  const format = preferWebP && supportsWebP() ? "webp" : "jpeg";
  const mimeType = `image/${format}`;

  // Use full image if no crop area specified
  const crop = cropArea || {
    x: 0,
    y: 0,
    width: image.naturalWidth,
    height: image.naturalHeight,
  };

  // Scale dimensions if needed
  const { width, height } = scaleDimensionsToMax(
    crop.width,
    crop.height,
    maxDimension
  );

  // Create canvas and draw image
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    width,
    height
  );

  // Get original size at full quality
  const originalData = canvas.toDataURL(mimeType, 1);
  const originalSize = getBase64Size(originalData);

  // Iterative compression to meet target size
  let quality = maxQuality;
  let data = canvas.toDataURL(mimeType, quality);
  let iterations = 1;
  const maxIterations = 15;
  const targetBytes = targetSizeKB * 1024;

  while (
    getBase64Size(data) > targetBytes &&
    quality > minQuality &&
    iterations < maxIterations
  ) {
    quality -= qualityStep;
    quality = Math.max(quality, minQuality);
    data = canvas.toDataURL(mimeType, quality);
    iterations++;
  }

  return {
    data,
    originalSize,
    compressedSize: getBase64Size(data),
    quality: Math.round(quality * 100) / 100,
    format,
    iterations,
  };
}

export interface SaveImageResult {
  success: boolean;
  path: string;
  filename: string;
}

/**
 * Save image to file via Electron IPC
 */
export async function saveImageToFile(
  imageData: string,
  noteId: string
): Promise<SaveImageResult> {
  // Use Electron API if available
  if (typeof window !== "undefined" && window.electronAPI?.images) {
    const result = await window.electronAPI.images.save(imageData, noteId);
    if (!result.success) {
      throw new Error(result.error || "Failed to save image");
    }
    return {
      success: true,
      path: result.path || "",
      filename: result.filename || "",
    };
  }

  // Fallback: return base64 data URL as path (for web usage without Electron)
  console.warn(
    "Electron API not available, using base64 inline image"
  );
  return {
    success: true,
    path: imageData, // Use base64 directly
    filename: "inline-image",
  };
}
