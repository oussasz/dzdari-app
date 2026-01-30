import React, { ChangeEvent, FC, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { TbPhotoPlus, TbTrash } from "react-icons/tb";

import SpinnerMini from "./Loader";
import { cn } from "@/utils/helper";

interface ImagesUploadProps {
  onChange: (fieldName: string, value: string[]) => void;
  initialImages?: string[];
  max?: number;
}

const DEFAULT_MAX = 5;

function normalizeImages(input?: string[]) {
  const list = Array.isArray(input) ? input : [];
  return list.map((s) => s.trim()).filter(Boolean).slice(0, DEFAULT_MAX);
}

const ImagesUpload: FC<ImagesUploadProps> = ({
  onChange,
  initialImages = [],
  max = DEFAULT_MAX,
}) => {
  const [images, setImages] = useState<string[]>(() => normalizeImages(initialImages));
  const [isLoading, startTransition] = useTransition();
  const [isDragging, setIsDragging] = useState(false);

  const canAddMore = images.length < max;

  const previewImages = useMemo(() => images, [images]);

  const pushImages = (newUrls: string[]) => {
    const next = [...images, ...newUrls].slice(0, max);
    setImages(next);
    onChange("images", next);
  };

  const removeImage = (url: string) => {
    const next = images.filter((i) => i !== url);
    setImages(next);
    onChange("images", next);

    // Best-effort delete from storage (Cloudinary/local). Do not block UI.
    startTransition(async () => {
      try {
        await fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: url }),
        });
      } catch {
        // ignore
      }
    });
  };

  const uploadFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (!canAddMore) return;

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", "products");

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.path) {
          throw new Error(data?.error || "Upload failed");
        }

        pushImages([data.path]);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
      }
    });
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = Array.from(e.target.files);

    files.slice(0, max - images.length).forEach((file) => uploadFile(file));
    e.target.value = "";
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    files.slice(0, max - images.length).forEach((file) => uploadFile(file));
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "relative border-dashed border-2 border-neutral-300 rounded-xl p-4 transition",
          isDragging && "border-rose-500",
          isLoading && "opacity-70",
        )}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/60 rounded-xl">
            <SpinnerMini className="w-[32px] h-[32px] text-rose-600" />
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {previewImages.map((src) => (
            <div
              key={src}
              className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100"
            >
              <Image
                fill
                src={src}
                alt="listing"
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={() => removeImage(src)}
                className="absolute top-2 right-2 bg-white/90 hover:bg-white text-neutral-800 rounded-full p-2 shadow"
                aria-label="Remove image"
              >
                <TbTrash size={16} />
              </button>
            </div>
          ))}

          {canAddMore && (
            <label
              htmlFor="listing-images"
              className="aspect-square rounded-lg border border-neutral-200 flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition bg-white"
            >
              <TbPhotoPlus className="!w-[40px] !h-[40px] mb-2" />
              <span className="font-semibold text-sm">Add image</span>
              <span className="text-xs text-neutral-500">{images.length}/{max}</span>
            </label>
          )}
        </div>

        <input
          id="listing-images"
          type="file"
          accept="image/*"
          multiple
          disabled={!canAddMore}
          className="w-0 h-0 opacity-0"
          onChange={handleChange}
        />
      </div>

      {!canAddMore && (
        <div className="text-sm text-neutral-500">
          Maximum {max} images reached.
        </div>
      )}
    </div>
  );
};

export default ImagesUpload;
