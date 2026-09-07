import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface ImageCropperProps {
  isOpen: boolean;
  imageSrc: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
  aspectRatio?: number;
}

export default function ImageCropper({
  isOpen,
  imageSrc,
  onCropComplete,
  onCancel,
  aspectRatio = 3 / 1, // Default to 3:1 for cover image
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropChange = (location: any) => {
    setCrop(location);
  };

  const onZoomChange = (newZoom: number) => {
    setZoom(newZoom);
  };

  const onCropAreaChange = (_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropConfirm = useCallback(async () => {
    if (!croppedAreaPixels) return;

    try {
      // Create canvas for cropping
      const image = new Image();
      image.src = imageSrc;
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        const pixels = croppedAreaPixels as any;
        canvas.width = pixels.width;
        canvas.height = pixels.height;

        ctx.drawImage(
          image,
          pixels.x,
          pixels.y,
          pixels.width,
          pixels.height,
          0,
          0,
          pixels.width,
          pixels.height
        );

        // Convert canvas to data URL
        const croppedImage = canvas.toDataURL("image/jpeg", 0.9);
        onCropComplete(croppedImage);
      };
    } catch (error) {
      console.error("Error cropping image:", error);
    }
  }, [croppedAreaPixels, imageSrc, onCropComplete]);

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Crop Your Cover Image</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Cropper */}
          <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              onCropChange={onCropChange}
              onCropAreaChange={onCropAreaChange}
              onZoomChange={onZoomChange}
            />
          </div>

          {/* Zoom Slider */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Zoom</Label>
            <Slider
              min={1}
              max={3}
              step={0.1}
              value={[zoom]}
              onValueChange={(value) => onZoomChange(value[0])}
              className="w-full"
            />
          </div>

          {/* Info Text */}
          <p className="text-xs text-muted-foreground">
            Drag to move the image, scroll to zoom. The highlighted area will be your cover image.
          </p>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleCropConfirm}>
            Crop & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
