import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

function pathFromPublicUrl(bucket: string, url: string): string | null {
  const marker = `/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
}

export const createGalleryItem = createServerFn({ method: "POST" })
  .validator((data) =>
    z
      .object({
        title: z.string().min(1),
        category: z.string().nullable().optional(),
        image_url: z.string().min(1),
        description: z.string().nullable().optional(),
        client_name: z.string().nullable().optional(),
        sort_order: z.number().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error } = await supabaseAdmin
      .from("gallery_items")
      .insert({
        title: data.title,
        category: data.category ?? null,
        image_url: data.image_url,
        description: data.description ?? null,
        client_name: data.client_name ?? null,
        sort_order: data.sort_order ?? 0,
      })
      .select()
      .maybeSingle();

    if (error) throw new Error(error.message);
    return row;
  });

export const updateGalleryItem = createServerFn({ method: "POST" })
  .validator((data) => z.object({ id: z.string().min(1), payload: z.any() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, payload } = data;
    const { data: row, error } = await supabaseAdmin
      .from("gallery_items")
      .update(payload)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteGalleryItem = createServerFn({ method: "POST" })
  .validator((data) =>
    z
      .object({
        id: z.string().min(1),
        image_url: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error: deleteError } = await supabaseAdmin
      .from("gallery_items")
      .delete()
      .eq("id", data.id);

    if (deleteError) throw new Error(deleteError.message);

    if (data.image_url) {
      const path = pathFromPublicUrl("gallery-images", data.image_url);
      if (path) {
        const { error: storageError } = await supabaseAdmin.storage.from("gallery-images").remove([path]);
        if (storageError) {
          console.warn("Failed to remove gallery image from storage:", storageError.message);
        }
      }
    }

    return { success: true };
  });
