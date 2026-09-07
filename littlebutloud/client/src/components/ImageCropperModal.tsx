import { useRef, useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RotateCw, ZoomIn, Maximize2 } from "lucide-react";

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
  aspectRatio?: number;
  title?: string;
}

export default function ImageCropperModal({
  isOpen,
  imageSrc,
  onCropComplete,
  onCancel,
  aspectRatio = 3,
  title = "Crop Cover Image",
}: ImageCropperModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [minZoom, setMinZoom] = useState(0.5);
  const [maxZoom, setMaxZoom] = useState(3);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isCropping, setIsCropping] = useState(false);

  const handleImageLoad = () => {
    if (!imageRef.current || !containerRef.current) return;

    const img = imageRef.current;
    const container = containerRef.current;

    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    const zoomToFitWidth = containerWidth / imgWidth;
    const zoomToFitHeight = containerHeight / imgHeight;
    const zoomToFit = Math.min(zoomToFitWidth, zoomToFitHeight);

    setMinZoom(Math.min(zoomToFit, 0.5));
    setMaxZoom(Math.max(3, zoomToFit * 2));
    setZoom(zoomToFit);
    setImageLoaded(true);
  };

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);
      setRotation(0);
      setImageLoaded(false);
      setIsCropping(false);
    }
  }, [isOpen]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isCropping) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isCropping) return;
    setOffsetX(e.clientX - dragStart.x);
    setOffsetY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleFitToFrame = () => {
    if (!imageRef.current || !containerRef.current) return;

    const img = imageRef.current;
    const container = containerRef.current;

    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    const zoomToFitWidth = containerWidth / imgWidth;
    const zoomToFitHeight = containerHeight / imgHeight;
    const zoomToFit = Math.min(zoomToFitWidth, zoomToFitHeight);

    setZoom(zoomToFit);
    setOffsetX(0);
    setOffsetY(0);
  };

  const handleCrop = async () => {
    if (isCropping) return;
    if (!canvasRef.current || !imageRef.current || !containerRef.current) {
      console.error("Missing required refs for cropping");
      return;
    }

    setIsCropping(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Failed to get canvas context");
      }

      const outputWidth = 1200;
      const outputHeight = 400;
      canvas.width = outputWidth;
      canvas.height = outputHeight;

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, outputWidth, outputHeight);

      const container = containerRef.current;
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;

      const img = imageRef.current;
      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;

      const scaleX = outputWidth / containerWidth;
      const scaleY = outputHeight / containerHeight;

      ctx.save();
      ctx.translate(outputWidth / 2, outputHeight / 2);

      if (rotation !== 0) {
        ctx.rotate((rotation * Math.PI) / 180);
      }

      ctx.translate(-outputWidth / 2, -outputHeight / 2);

      const scaledImgWidth = imgWidth * zoom * scaleX;
      const scaledImgHeight = imgHeight * zoom * scaleY;

      const centerX = containerWidth / 2;
      const centerY = containerHeight / 2;
      const imgDisplayX = centerX - (scaledImgWidth / scaleX) / 2 + offsetX;
      const imgDisplayY = centerY - (scaledImgHeight / scaleY) / 2 + offsetY;

      const imgCanvasX = imgDisplayX * scaleX;
      const imgCanvasY = imgDisplayY * scaleY;

      ctx.drawImage(img, imgCanvasX, imgCanvasY, scaledImgWidth, scaledImgHeight);
      ctx.restore();

      const croppedImage = canvas.toDataURL("image/jpeg", 0.95);
      onCropComplete(croppedImage);
    } catch (error) {
      console.error("Crop error:", error);
    } finally {
      setIsCropping(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl rounded-2xl flex flex-col max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Drag to move the image, use zoom to scale, and rotate as needed. The image will be fitted to 1200x400px with a white background.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          <div
            ref={containerRef}
            className="relative w-full bg-white border-2 border-dashed border-border rounded-xl overflow-hidden cursor-move"
            style={{
              aspectRatio: `${aspectRatio} / 1`,
              maxHeight: "400px",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop preview"
              className="absolute"
              style={{
                left: "50%",
                top: "50%",
                transform: `translate(-50%, -50%) scale(${zoom}) rotate(${rotation}deg) translate(${offsetX / zoom}px, ${offsetY / zoom}px)`,
                transformOrigin: "center",
                transition: isDragging ? "none" : "transform 0.2s ease-out",
                maxWidth: "none",
                maxHeight: "none",
                width: "auto",
                height: "auto",
                pointerEvents: "none",
              }}
              onLoad={handleImageLoad}
              draggable={false}
            />
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              onClick={handleFitToFrame}
              variant="outline"
              className="w-full rounded-full gap-2"
              size="sm"
              disabled={isCropping}
            >
              <Maximize2 className="w-4 h-4" />
              Fit Image to Frame
            </Button>

            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <ZoomIn className="w-4 h-4" />
                Zoom: {(zoom * 100).toFixed(0)}%
              </label>
              <Slider
                value={[zoom]}
                onValueChange={(value) => setZoom(value[0])}
                min={minZoom}
                max={maxZoom}
                step={0.05}
                className="w-full"
                disabled={isCropping}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <RotateCw className="w-4 h-4" />
                Rotation: {rotation}°
              </label>
              <Slider
                value={[rotation]}
                onValueChange={(value) => setRotation(value[0])}
                min={0}
                max={360}
                step={1}
                className="w-full"
                disabled={isCropping}
              />
            </div>

            <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
              <p>💡 <strong>Tip:</strong> Click "Fit Image to Frame" to automatically scale the image to fit within the white frame. Drag to reposition, use zoom to scale, and rotate as needed. The final output will be 1200x400px with white background.</p>
            </div>
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 z-50 bg-background pt-4 border-t mt-4 flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="rounded-full"
            disabled={isCropping}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleCrop}
            className="rounded-full"
            disabled={isCropping}
          >
            {isCropping ? "Cropping..." : "Crop Image"}
          </Button>
        </DialogFooter>

        {/* Hidden canvas for cropping */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </DialogContent>
    </Dialog>
  );
}
