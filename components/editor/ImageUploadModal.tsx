"use client";

import { X, Image as ImageIcon, Check } from "lucide-react";
import { useCallback, useEffect, useState, useMemo } from "react";
import { UploadZone } from "./UploadZone";
import { ImageCropper, CropArea } from "./ImageCropper";
import { ResizeControls } from "./ResizeControls";
import { ImagePreview } from "./ImagePreview";
import {
  compressImageAdaptive,
  getImageDimensions,
  saveImageToFile,
  CompressionResult,
} from "@/lib/utils/image-utils";
import { CompressionStats } from "./ImagePreview";

type ModalStep = "upload" | "edit" | "preview";

interface ImageUploadModalProps {
  isOpen: boolean;
  noteId: string;
  onClose: () => void;
  onInsert: (imagePath: string, altText: string) => void;
}

const STEP_LABELS: Record<ModalStep, string> = {
  upload: "Upload",
  edit: "Edit",
  preview: "Preview",
};

export function ImageUploadModal({
  isOpen,
  noteId,
  onClose,
  onInsert,
}: ImageUploadModalProps) {
  const [step, setStep] = useState<ModalStep>("upload");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Image dimensions
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [maxWidth, setMaxWidth] = useState(800);

  // Crop area
  const [cropArea, setCropArea] = useState<CropArea | null>(null);

  // Compression stats
  const [compressionStats, setCompressionStats] =
    useState<CompressionStats | null>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep("upload");
      setImageSrc(null);
      setProcessedImage(null);
      setAltText("");
      setOriginalWidth(0);
      setOriginalHeight(0);
      setWidth(0);
      setHeight(0);
      setCropArea(null);
      setCompressionStats(null);
      setIsProcessing(false);
      setIsSaving(false);
    }
  }, [isOpen]);

  // Handle ESC key to close
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  const handleImageSelect = useCallback(async (dataUrl: string) => {
    setImageSrc(dataUrl);
    setStep("edit");

    // Get original dimensions
    const dims = await getImageDimensions(dataUrl);
    setOriginalWidth(dims.width);
    setOriginalHeight(dims.height);
    setWidth(dims.width);
    setHeight(dims.height);
  }, []);

  const handleCropComplete = useCallback((area: CropArea) => {
    setCropArea(area);
  }, []);

  const handleReset = useCallback(() => {
    setWidth(originalWidth);
    setHeight(originalHeight);
  }, [originalWidth, originalHeight]);

  const handleNext = useCallback(async () => {
    if (step === "edit" && imageSrc) {
      setIsProcessing(true);
      try {
        // Use crop area if defined, otherwise use full image
        const cropToUse = cropArea || {
          x: 0,
          y: 0,
          width: originalWidth,
          height: originalHeight,
        };

        // Use adaptive compression
        const result: CompressionResult = await compressImageAdaptive(
          imageSrc,
          cropToUse,
          {
            targetSizeKB: 500,
            minQuality: 0.6,
            maxQuality: 0.9,
            maxDimension: maxWidth,
            preferWebP: true,
          }
        );

        setProcessedImage(result.data);
        setCompressionStats({
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          quality: result.quality,
          format: result.format,
        });
        setStep("preview");
      } catch (error) {
        console.error("Failed to process image:", error);
      } finally {
        setIsProcessing(false);
      }
    }
  }, [step, imageSrc, cropArea, originalWidth, originalHeight, maxWidth]);

  const handleBack = useCallback(() => {
    if (step === "edit") {
      setStep("upload");
      setImageSrc(null);
      setProcessedImage(null);
      setCropArea(null);
    } else if (step === "preview") {
      setStep("edit");
    }
  }, [step]);

  const handleInsert = useCallback(async () => {
    if (processedImage && noteId) {
      setIsSaving(true);
      try {
        // Save image to file and get path
        const result = await saveImageToFile(processedImage, noteId);
        onInsert(result.path, altText || "image");
        onClose();
      } catch (error) {
        console.error("Failed to save image:", error);
      } finally {
        setIsSaving(false);
      }
    }
  }, [processedImage, noteId, altText, onInsert, onClose]);

  const isStepCompleted = useMemo(() => {
    return (s: ModalStep) => {
      if (s === "upload") return step === "edit" || step === "preview";
      if (s === "edit") return step === "preview";
      return false;
    };
  }, [step]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-upload-title"
      >
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <ImageIcon size={16} className="text-white" />
              </div>
              <h2
                id="image-upload-title"
                className="text-lg font-semibold text-slate-900"
              >
                Insert Image
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-150 cursor-pointer"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Step Indicator */}
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 shrink-0">
            <div className="flex items-center gap-2">
              {(["upload", "edit", "preview"] as ModalStep[]).map(
                (s, index) => (
                  <div key={s} className="flex items-center">
                    {index > 0 && (
                      <div
                        className={`w-8 h-px mx-2 ${
                          step === s || isStepCompleted(s) || (step === "preview" && s === "edit")
                            ? "bg-blue-500"
                            : "bg-slate-300"
                        }`}
                      />
                    )}
                    <div
                      className={`
                        flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
                        ${
                          step === s
                            ? "bg-blue-500 text-white"
                            : isStepCompleted(s)
                            ? "bg-blue-100 text-blue-600"
                            : "bg-slate-200 text-slate-500"
                        }
                      `}
                    >
                      {isStepCompleted(s) ? (
                        <Check size={12} />
                      ) : (
                        <span>{index + 1}</span>
                      )}
                      <span>{STEP_LABELS[s]}</span>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1">
            {step === "upload" && (
              <UploadZone onImageSelect={handleImageSelect} />
            )}

            {step === "edit" && imageSrc && (
              <div className="space-y-4">
                <ImageCropper
                  imageSrc={imageSrc}
                  onCropComplete={handleCropComplete}
                />

                <ResizeControls
                  width={width}
                  height={height}
                  originalWidth={originalWidth}
                  originalHeight={originalHeight}
                  lockAspect={lockAspect}
                  maxWidth={maxWidth}
                  onWidthChange={setWidth}
                  onHeightChange={setHeight}
                  onLockChange={setLockAspect}
                  onMaxWidthChange={setMaxWidth}
                  onReset={handleReset}
                />
              </div>
            )}

            {step === "preview" && processedImage && (
              <ImagePreview
                base64Src={processedImage}
                altText={altText}
                onAltTextChange={setAltText}
                compressionStats={compressionStats || undefined}
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 shrink-0">
            <div>
              {step !== "upload" && (
                <button
                  onClick={handleBack}
                  disabled={isProcessing}
                  className="text-sm text-slate-600 hover:text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-200 transition-all duration-200 cursor-pointer font-medium disabled:opacity-50"
                >
                  Back
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClose}
                disabled={isProcessing}
                className="text-sm text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100 transition-all duration-200 cursor-pointer font-medium disabled:opacity-50"
              >
                Cancel
              </button>

              {step === "edit" && (
                <button
                  onClick={handleNext}
                  disabled={isProcessing}
                  className="text-sm bg-linear-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 cursor-pointer font-medium shadow-lg shadow-purple-500/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Next"
                  )}
                </button>
              )}

              {step === "preview" && (
                <button
                  onClick={handleInsert}
                  disabled={!processedImage || isSaving}
                  className="text-sm bg-linear-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer font-medium shadow-lg shadow-purple-500/20 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Insert Image"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ImageUploadModal;
