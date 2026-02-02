# Research: Image Crop/Resize Libraries for React

## Overview
Comparison of lightweight image manipulation libraries for InkNote AI.

## Library Comparison

| Library | Bundle Size | TypeScript | Mobile | Maintained | Features |
|---------|-------------|------------|--------|------------|----------|
| **react-image-crop** | ~10KB | ✅ | ✅ | ✅ Active | Basic crop, you handle canvas |
| **react-easy-crop** | ~10KB | ✅ | ✅ | ✅ Active | Zoom, rotation, Instagram-like |
| **react-cropper** | ~90KB | ✅ | ✅ | ✅ | Full-featured, Cropper.js wrapper |
| **Custom Canvas** | 0KB | - | ✅ | - | Full control, more code |

## Recommendation: react-easy-crop

### Reasons:
1. **Small bundle size** (~10KB minified)
2. **Modern UX** - zoom/pan like Instagram
3. **Touch support** - works on mobile
4. **TypeScript** - full type definitions
5. **Active maintenance** - regular updates
6. **Simple API** - easy integration

### Installation
```bash
pnpm add react-easy-crop
```

### Basic Usage
```typescript
import Cropper from 'react-easy-crop';
import { getCroppedImg } from './cropImage'; // Helper function

function ImageCropper({ imageSrc, onCropComplete }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  return (
    <Cropper
      image={imageSrc}
      crop={crop}
      zoom={zoom}
      aspect={16 / 9} // or undefined for free crop
      onCropChange={setCrop}
      onZoomChange={setZoom}
      onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
    />
  );
}
```

## Canvas API for Base64 Conversion

### Crop & Convert to Base64
```typescript
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  maxWidth: number = 800
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Calculate scale for resize
  const scale = Math.min(1, maxWidth / pixelCrop.width);
  canvas.width = pixelCrop.width * scale;
  canvas.height = pixelCrop.height * scale;

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y,
    pixelCrop.width, pixelCrop.height,
    0, 0,
    canvas.width, canvas.height
  );

  // Return base64
  return canvas.toDataURL('image/jpeg', 0.85);
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', reject);
    img.src = url;
  });
}
```

## Resize Controls

### Implementation with Inputs
```typescript
interface ResizeState {
  width: number;
  height: number;
  lockAspect: boolean;
  aspectRatio: number;
}

function handleWidthChange(newWidth: number) {
  if (lockAspect) {
    setHeight(Math.round(newWidth / aspectRatio));
  }
  setWidth(newWidth);
}
```

## Performance Considerations

1. **Max file size**: Suggest 5MB limit (base64 is ~33% larger)
2. **Preview at lower resolution**: Full quality only on export
3. **Web Workers**: Consider for large images
4. **Memory**: Revoke object URLs after use

## Unresolved Questions
- None - approach is clear
