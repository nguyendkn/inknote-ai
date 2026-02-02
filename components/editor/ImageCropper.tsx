"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { ZoomIn, ZoomOut, Maximize2, Square, RectangleHorizontal } from "lucide-react";

// Dynamic import to avoid SSR issues
const Cropper = dynamic(() => import("react-easy-crop").then((mod) => mod.default), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-slate-900 rounded-xl">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  ),
});

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedAreaPixels: CropArea) => void;
}

type AspectRatioOption = "free" | "1:1" | "4:3" | "16:9";

interface AspectOption {
  value: AspectRatioOption;
  label: string;
  ratio: number | undefined;
  icon: React.ReactNode;
}

const ASPECT_RATIOS: AspectOption[] = [
  { value: "free", label: "Free", ratio: undefined, icon: <Maximize2 size={14} /> },
  { value: "1:1", label: "1:1", ratio: 1, icon: <Square size={14} /> },
  { value: "4:3", label: "4:3", ratio: 4 / 3, icon: <RectangleHorizontal size={14} /> },
  { value: "16:9", label: "16:9", ratio: 16 / 9, icon: <RectangleHorizontal size={14} /> },
];

interface Point {
  x: number;
  y: number;
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function ImageCropper({ imageSrc, onCropComplete }: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspectOption, setAspectOption] = useState<AspectRatioOption>("free");

  const handleCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      onCropComplete({
        x: croppedAreaPixels.x,
        y: croppedAreaPixels.y,
        width: croppedAreaPixels.width,
        height: croppedAreaPixels.height,
      });
    },
    [onCropComplete]
  );

  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(z + 0.1, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(z - 0.1, 1));
  }, []);

  const currentAspect = ASPECT_RATIOS.find((a) => a.value === aspectOption);
  const aspectRatio = currentAspect?.ratio;

  return (
    <div className="space-y-4">
      {/* Cropper Container */}
      <div className="relative h-64 md:h-80 bg-slate-900 rounded-xl overflow-hidden">
        {aspectRatio !== undefined ? (
          // @ts-expect-error - react-easy-crop types are strict but defaults are provided
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
            showGrid
          />
        ) : (
          // @ts-expect-error - react-easy-crop types are strict but defaults are provided
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
            showGrid
          />
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Zoom Controls */}
        <div className="flex items-center gap-2 flex-1">
          <button
            onClick={handleZoomOut}
            className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Zoom out"
          >
            <ZoomOut size={18} />
          </button>

          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            aria-label="Zoom level"
          />

          <button
            onClick={handleZoomIn}
            className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Zoom in"
          >
            <ZoomIn size={18} />
          </button>

          <span className="text-xs text-slate-500 w-12 text-right">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* Aspect Ratio */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500 mr-2">Aspect:</span>
          {ASPECT_RATIOS.map((option) => (
            <button
              key={option.value}
              onClick={() => setAspectOption(option.value)}
              className={`
                flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-lg
                transition-colors cursor-pointer
                ${
                  aspectOption === option.value
                    ? "bg-blue-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }
              `}
              aria-label={`Set aspect ratio to ${option.label}`}
            >
              {option.icon}
              <span className="hidden md:inline">{option.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ImageCropper;
