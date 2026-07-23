import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type CatalogProduct = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  sport_type: string | null;
  fabric: string[];
  sizes: string[];
  colors: string[];
  collar_types: string[];
  sleeve_types: string[];
  images: string[];
  image_url: string | null;
  moq: number | null;
  featured: boolean;
  sort_order: number | null;
  is_active: boolean;
  category: { id: string; name: string; slug: string } | null;
};

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  sort_order: number | null;
};

const SELECT =
  "id, slug, name, short_description, description, sport_type, fabric, sizes, colors, collar_types, sleeve_types, images, image_url, moq, featured, sort_order, is_active, category:categories(id, name, slug)";

type CatalogRow = Omit<
  CatalogProduct,
  'fabric' | 'sizes' | 'colors' | 'collar_types' | 'sleeve_types' | 'images'
> & {
  fabric?: string[] | null;
  sizes?: string[] | null;
  colors?: string[] | null;
  collar_types?: string[] | null;
  sleeve_types?: string[] | null;
  images?: string[] | null;
  category?: { id: string; name: string; slug: string } | null;
};

function normalize(row: CatalogRow): CatalogProduct {
  return {
    ...row,
    fabric: row.fabric ?? [],
    sizes: row.sizes ?? [],
    colors: row.colors ?? [],
    collar_types: row.collar_types ?? [],
    sleeve_types: row.sleeve_types ?? [],
    images: row.images ?? [],
    category: row.category ?? null,
  };
}

export const getProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("products")
    .select(SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(normalize);
});

export const getCategories = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("id, name, slug, sort_order")
    .order("sort_order", { ascending: true, nullsFirst: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as CatalogCategory[];
});

export const getProductBySlug = createServerFn({ method: "GET" })
  .validator((data) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("products")
      .select(SELECT)
      .eq("slug", data.slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    const product = normalize(row);
    let related: CatalogProduct[] = [];
    if (product.category?.id) {
      const { data: rel } = await supabaseAdmin
        .from("products")
        .select(SELECT)
        .eq("is_active", true)
        .eq("category_id", product.category.id)
        .neq("id", product.id)
        .limit(4);
      related = (rel ?? []).map(normalize);
    }
    // ignore linter about server() helper (kept for future use)
    return { product, related };
  });

// Admin mutators (use server-side service role client to bypass RLS)
export const createCategory = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        name: z.string().min(1),
        slug: z.string().min(1),
        description: z.string().optional(),
        image_url: z.string().optional(),
        sort_order: z.number().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload = {
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      image_url: data.image_url ?? null,
      sort_order: data.sort_order ?? 0,
    };
    const { data: row, error } = await supabaseAdmin
      .from("categories")
      .insert(payload)
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateCategory = createServerFn({ method: "POST" })
  .validator((d) => z.object({ id: z.string().min(1), payload: z.any() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, payload } = data;
    const { data: row, error } = await supabaseAdmin
      .from("categories")
      .update(payload)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .validator((d) => z.object({ id: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id } = data;
    const { data: row, error } = await supabaseAdmin
      .from("categories")
      .delete()
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row ?? { success: true };
  });

export const createProduct = createServerFn({ method: "POST" })
  .validator((d) => z.any().parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    try {
      console.log("[createProduct] payload:", JSON.stringify(data, null, 2));
      const { data: row, error, status, statusText } = await supabaseAdmin
        .from("products")
        .insert(data)
        .select()
        .maybeSingle();
      console.log("[createProduct] supabase response:", {
        data: row,
        error,
        status,
        statusText,
      });
      if (error) {
        const errorDetails = [
          error.message,
          error.code ? `code=${error.code}` : null,
          error.details ? `details=${error.details}` : null,
          error.hint ? `hint=${error.hint}` : null,
          status ? `status=${status}` : null,
          statusText ? `statusText=${statusText}` : null,
        ]
          .filter(Boolean)
          .join(" | ");
        const message = `Supabase insert failed: ${errorDetails}`;
        console.error("[createProduct] supabase error", error, { status, statusText });
        throw new Error(message);
      }
      return row;
    } catch (err) {
      console.error("[createProduct] exception", err instanceof Error ? err.stack || err.message : err);
      throw err;
    }
  });

export const updateProduct = createServerFn({ method: "POST" })
  .validator((d) => z.object({ id: z.string().min(1), payload: z.any() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, payload } = data;
    const { data: row, error } = await supabaseAdmin
      .from("products")
      .update(payload)
      .eq("id", id)
      .select()
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .validator((d) => z.object({ id: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id } = data;
    const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return { success: true };
  });
