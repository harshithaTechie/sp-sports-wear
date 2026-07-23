import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadFileServer } from "@/lib/upload.functions";

export type ImageUploadBucket = "product-images" | "gallery-images";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function randomFileName(originalName: string) {
  const ext = originalName.includes(".") ? originalName.split(".").pop() : "jpg";
    const rand = Math.random().toString(36).slice(2, 10);
      return `${Date.now()}-${rand}.${ext}`;
      }

      async function uploadFile(bucket: ImageUploadBucket, file: File): Promise<string> {
        if (!ACCEPTED_TYPES.includes(file.type)) {
            throw new Error("Please upload a JPG, PNG, WEBP, or GIF image.");
              }
                if (file.size > MAX_FILE_BYTES) {
                    throw new Error("Image must be smaller than 5MB.");
                      }
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(",")[1];
            resolve(base64);
          };
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });

        const res = await uploadFileServer({
          data: {
            bucket,
            fileName: file.name,
            fileType: file.type,
            base64Data,
          },
        });

        return res.publicUrl;
      }


function pathFromPublicUrl(bucket: ImageUploadBucket, url: string): string | null {
  const marker = `/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
}

export async function deleteUploadedImage(bucket: ImageUploadBucket, url: string) {
  const path = pathFromPublicUrl(bucket, url);
  if (!path) return; // external/legacy URL, nothing to clean up in storage
  await supabase.storage.from(bucket).remove([path]);
}

/**
 * Single-image uploader with preview. Value is a public image URL (or null).
 */
export function ImageUpload({
  bucket,
  value,
  onChange,
  label = "Image",
  className,
}: {
  bucket: ImageUploadBucket;
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(bucket, file);
      onChange(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <span className="text-sm font-medium leading-none">{label}</span>
      <div className="flex items-start gap-3">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-muted">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : uploading ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
          </Button>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={async () => {
                await deleteUploadedImage(bucket, value);
                onChange(null);
              }}
            >
              <X className="h-3.5 w-3.5" /> Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Multi-image uploader with thumbnail grid, used for product gallery images.
 */
export function MultiImageUpload({
  bucket,
  value,
  onChange,
  label = "Gallery Images",
  className,
}: {
  bucket: ImageUploadBucket;
  value: string[];
  onChange: (urls: string[]) => void;
  label?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        try {
          uploaded.push(await uploadFile(bucket, file));
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Upload failed");
        }
      }
      if (uploaded.length) onChange([...value, ...uploaded]);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function removeAt(index: number) {
    const url = value[index];
    await deleteUploadedImage(bucket, url);
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className={cn("space-y-2", className)}>
      <span className="text-sm font-medium leading-none">{label}</span>
      <div className="flex flex-wrap gap-3">
        {value.map((url, i) => (
          <div
            key={url + i}
            className="group relative h-20 w-20 overflow-hidden rounded-md border border-border"
          >
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white opacity-0 transition group-hover:opacity-100"
              aria-label="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground hover:border-secondary hover:text-secondary disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Upload className="h-5 w-5" />
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </div>
  );
}
