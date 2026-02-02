# Phase 1: Compression Utilities

## Context

| Field | Value |
|-------|-------|
| **Parent Plan** | [plan.md](plan.md) |
| **Dependencies** | None |
| **Docs** | [system-architecture](../../docs/system-architecture.md) |

## Overview

| Field | Value |
|-------|-------|
| **Date** | 2026-02-03 |
| **Description** | Add adaptive compression functions to image-utils |
| **Priority** | High |
| **Implementation Status** | Not Started |
| **Review Status** | Pending |

## Key Insights

1. Canvas `toDataURL()` supports quality param (0-1) for JPEG/WebP
2. WebP typically 25-35% smaller than JPEG at same quality
3. Browser WebP support: 97%+ (can check via canvas test)
4. Iterative compression allows hitting target size precisely

## Requirements

- Add `CompressionOptions` interface
- Create `compressImageAdaptive()` with iterative quality reduction
- Add WebP support with automatic fallback
- Implement `supportsWebP()` detection
- Add `getBase64Size()` utility
- Update `getCroppedImg()` to accept compression options

## Related Code Files

| File | Purpose | Action |
|------|---------|--------|
| `lib/utils/image-utils.ts` | Image utilities | Modify |

## Implementation Steps

### Step 1.1: Add Compression Types

```typescript
export interface CompressionOptions {
  targetSizeKB?: number;    // Target max size in KB (default: 500)
  minQuality?: number;      // Minimum quality 0-1 (default: 0.6)
  maxQuality?: number;      // Starting quality 0-1 (default: 0.9)
  qualityStep?: number;     // Quality reduction per iteration (default: 0.05)
  preferWebP?: boolean;     // Use WebP if supported (default: true)
  maxDimension?: number;    // Max width/height (default: 1920)
}

export interface CompressionResult {
  data: string;             // Base64 data URL
  originalSize: number;     // Original size in bytes
  compressedSize: number;   // Final size in bytes
  quality: number;          // Final quality used
  format: 'jpeg' | 'webp';  // Output format
  iterations: number;       // Compression iterations
}
```

### Step 1.2: Add WebP Detection

```typescript
let webpSupported: boolean | null = null;

export function supportsWebP(): boolean {
  if (webpSupported !== null) return webpSupported;

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  webpSupported = canvas.toDataURL('image/webp').startsWith('data:image/webp');
  return webpSupported;
}
```

### Step 1.3: Add Base64 Size Utility

```typescript
export function getBase64Size(base64: string): number {
  // Remove data URL prefix
  const base64Data = base64.split(',')[1] || '';
  // Base64 to bytes: length * 0.75
  return Math.round(base64Data.length * 0.75);
}
```

### Step 1.4: Add Scale Dimensions Utility

```typescript
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
    scaled: true
  };
}
```

### Step 1.5: Implement Adaptive Compression

```typescript
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
    maxDimension = 1920
  } = options;

  const image = await createImage(imageSrc);
  const format = preferWebP && supportsWebP() ? 'webp' : 'jpeg';
  const mimeType = `image/${format}`;

  // Determine crop area
  const crop = cropArea || {
    x: 0, y: 0,
    width: image.naturalWidth,
    height: image.naturalHeight
  };

  // Scale if needed
  const { width, height } = scaleDimensionsToMax(
    crop.width, crop.height, maxDimension
  );

  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  // Draw cropped image
  ctx.drawImage(
    image,
    crop.x, crop.y, crop.width, crop.height,
    0, 0, width, height
  );

  // Get original size estimate
  const originalData = canvas.toDataURL(mimeType, 1);
  const originalSize = getBase64Size(originalData);

  // Iterative compression
  let quality = maxQuality;
  let data = canvas.toDataURL(mimeType, quality);
  let iterations = 1;

  const targetBytes = targetSizeKB * 1024;

  while (getBase64Size(data) > targetBytes && quality > minQuality) {
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
    iterations
  };
}
```

### Step 1.6: Update getCroppedImg

Add optional compression parameter to existing function for backward compatibility:

```typescript
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: CropArea,
  maxWidth: number = 800,
  quality: number = 0.85,
  compress?: CompressionOptions
): Promise<string | CompressionResult> {
  if (compress) {
    return compressImageAdaptive(imageSrc, pixelCrop, {
      maxDimension: maxWidth,
      ...compress
    });
  }
  // ... existing implementation
}
```

## Todo List

- [ ] Add CompressionOptions interface
- [ ] Add CompressionResult interface
- [ ] Implement supportsWebP()
- [ ] Implement getBase64Size()
- [ ] Implement scaleDimensionsToMax()
- [ ] Implement compressImageAdaptive()
- [ ] Update getCroppedImg signature
- [ ] Add unit tests for compression

## Success Criteria

- [ ] compressImageAdaptive reduces images to under 500KB
- [ ] WebP used automatically when supported
- [ ] Fallback to JPEG works correctly
- [ ] Quality never goes below 60%
- [ ] Large images auto-scaled to max 1920px
- [ ] Compression result includes all stats

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Quality too low | Medium | Set reasonable minQuality (0.6) |
| Too many iterations | Low | Larger qualityStep, max 10 iterations |
| Memory usage | Low | Clean up canvas after use |

## Security Considerations

- Validate image source before processing
- Limit max iterations to prevent infinite loops

## Next Steps

After Phase 1: Proceed to Phase 2 for UI integration.
