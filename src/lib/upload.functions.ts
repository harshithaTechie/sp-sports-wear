import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

function randomFileName(originalName: string) {
  const ext = originalName.includes(".") ? originalName.split(".").pop() : "jpg";
  const rand = Math.random().toString(36).slice(2, 10);
  return `${Date.now()}-${rand}.${ext}`;
}

const uploadSchema = z.object({
  bucket: z.string(),
  fileName: z.string(),
  fileType: z.string(),
  base64Data: z.string(),
});

export const uploadFileServer = createServerFn({ method: "POST" })
  .validator((data) => uploadSchema.parse(data))
  .handler(async ({ data: input }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Convert base64 back to buffer for storage upload
    const buffer = Buffer.from(input.base64Data, "base64");
    const path = randomFileName(input.fileName);

    // Ensure bucket exists and is public
    try {
      const { data: bucketData, error: bucketErr } = await supabaseAdmin.storage.getBucket(
        input.bucket,
      );
      if (bucketErr || !bucketData) {
        await supabaseAdmin.storage.createBucket(input.bucket, { public: true });
      } else if (!bucketData.public) {
        await supabaseAdmin.storage.updateBucket(input.bucket, { public: true });
      }
    } catch (e) {
      console.warn("Bucket check/create error, trying upload anyway:", e);
    }

    const { error } = await supabaseAdmin.storage.from(input.bucket).upload(path, buffer, {
      contentType: input.fileType,
      cacheControl: "3600",
      upsert: false,
    });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = supabaseAdmin.storage.from(input.bucket).getPublicUrl(path);
    return { publicUrl: data.publicUrl };
  });
