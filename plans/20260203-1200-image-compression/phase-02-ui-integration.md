# Phase 2: UI Integration

## Context

| Field | Value |
|-------|-------|
| **Parent Plan** | [plan.md](plan.md) |
| **Dependencies** | [Phase 1](phase-01-compression-utilities.md) |
| **Docs** | [system-architecture](../../docs/system-architecture.md) |

## Overview

| Field | Value |
|-------|-------|
| **Date** | 2026-02-03 |
| **Description** | Integrate compression into UI with stats display |
| **Priority** | Medium |
| **Implementation Status** | Not Started |
| **Review Status** | Pending |

## Key Insights

1. ImageUploadModal handles the crop-to-preview flow
2. ImagePreview already shows estimated size
3. Need to show compression stats: original → compressed
4. Can show format used (WebP/JPEG) as bonus info

## Requirements

- Update ImageUploadModal to use compressImageAdaptive
- Pass compression stats to ImagePreview
- Display original vs compressed size with savings %
- Show format used (WebP/JPEG)
- Add compression progress indicator during processing

## Related Code Files

| File | Purpose | Action |
|------|---------|--------|
| `components/editor/ImageUploadModal.tsx` | Modal component | Modify |
| `components/editor/ImagePreview.tsx` | Preview component | Modify |

## Implementation Steps

### Step 2.1: Update ImagePreview Props

```typescript
interface ImagePreviewProps {
  base64Src: string;
  altText: string;
  onAltTextChange: (alt: string) => void;
  // New compression stats
  compressionStats?: {
    originalSize: number;
    compressedSize: number;
    quality: number;
    format: 'jpeg' | 'webp';
  };
}
```

### Step 2.2: Add Compression Stats UI

In ImagePreview, replace simple size display with:

```tsx
{/* Compression Stats */}
<div className="p-3 bg-slate-50 rounded-lg space-y-2">
  <div className="flex items-center justify-between">
    <span className="text-sm text-slate-600">Original:</span>
    <span className="text-sm text-slate-500">
      {formatFileSize(compressionStats?.originalSize || 0)}
    </span>
  </div>
  <div className="flex items-center justify-between">
    <span className="text-sm text-slate-600">Compressed:</span>
    <span className="text-sm font-medium text-green-600">
      {formatFileSize(compressionStats?.compressedSize || estimatedSize)}
    </span>
  </div>
  {compressionStats && (
    <>
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-600">Savings:</span>
        <span className="text-sm font-medium text-green-600">
          {Math.round((1 - compressionStats.compressedSize / compressionStats.originalSize) * 100)}%
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Format: {compressionStats.format.toUpperCase()}</span>
        <span>Quality: {Math.round(compressionStats.quality * 100)}%</span>
      </div>
    </>
  )}
</div>
```

### Step 2.3: Update ImageUploadModal State

Add compression result state:

```typescript
const [compressionStats, setCompressionStats] = useState<{
  originalSize: number;
  compressedSize: number;
  quality: number;
  format: 'jpeg' | 'webp';
} | null>(null);
```

### Step 2.4: Use Adaptive Compression

Replace current crop handling with compression:

```typescript
const handleProceedToPreview = async () => {
  if (!imageSrc || !cropArea) return;

  setIsProcessing(true);

  try {
    const result = await compressImageAdaptive(imageSrc, cropArea, {
      targetSizeKB: 500,
      minQuality: 0.6,
      maxDimension: resizeWidth || 1920,
      preferWebP: true
    });

    setProcessedImage(result.data);
    setCompressionStats({
      originalSize: result.originalSize,
      compressedSize: result.compressedSize,
      quality: result.quality,
      format: result.format
    });
    setStep("preview");
  } catch (error) {
    console.error("Compression failed:", error);
  } finally {
    setIsProcessing(false);
  }
};
```

### Step 2.5: Pass Stats to ImagePreview

```tsx
<ImagePreview
  base64Src={processedImage}
  altText={altText}
  onAltTextChange={setAltText}
  compressionStats={compressionStats}
/>
```

## Todo List

- [ ] Update ImagePreviewProps interface
- [ ] Add compression stats UI in ImagePreview
- [ ] Add compressionStats state to ImageUploadModal
- [ ] Replace getCroppedImg with compressImageAdaptive
- [ ] Pass stats to ImagePreview
- [ ] Test with various image sizes
- [ ] Verify WebP fallback on Safari

## Success Criteria

- [ ] Compression stats displayed in preview
- [ ] Shows original vs compressed size
- [ ] Shows savings percentage
- [ ] Shows format (WebP/JPEG)
- [ ] Shows quality percentage
- [ ] Processing indicator during compression

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Slow compression | Low | Show loading state, max 10 iterations |
| UI too cluttered | Low | Collapsible stats section |

## Security Considerations

- No additional security concerns for UI

## Next Steps

After Phase 2: Feature complete! Ready for testing.
