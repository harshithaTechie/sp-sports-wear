import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createProduct, updateProduct } from "@/lib/catalog.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload, MultiImageUpload } from "@/components/admin/ImageUpload";

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
};

export type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  short_description: string | null;
  description: string | null;
  sport_type: string | null;
  moq: number | null;
  fabric: string[] | null;
  sizes: string[] | null;
  colors: string[] | null;
  collar_types: string[] | null;
  sleeve_types: string[] | null;
  image_url: string | null;
  images: string[] | null;
  featured: boolean | null;
  is_active: boolean;
  sort_order: number | null;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function resolveUniqueSlug(baseSlug: string) {
  const { data, error } = await supabase
    .from("products")
    .select("slug")
    .like("slug", `${baseSlug}%`);

  if (error) {
    throw new Error(`Failed to validate slug uniqueness: ${error.message}`);
  }

  const existingSlugs = new Set((data ?? []).map((row) => row.slug as string));
  if (!existingSlugs.has(baseSlug)) {
    return baseSlug;
  }

  const suffixPattern = new RegExp(`^${escapeRegExp(baseSlug)}-(\\d+)$`);
  let maxSuffix = 1;

  for (const slug of existingSlugs) {
    const match = slug.match(suffixPattern);
    if (match) {
      const value = Number(match[1]);
      if (!Number.isNaN(value) && value >= maxSuffix) {
        maxSuffix = value + 1;
      }
    }
  }

  return `${baseSlug}-${maxSuffix}`;
}

function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

const formSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug must be at least 2 characters")
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers and hyphens",
    ),
  category_id: z.string().min(1, "Please select a category"),
  short_description: z.string().trim().max(200, "Keep it under 200 characters").optional(),
  description: z.string().trim().optional(),
  sport_type: z.string().trim().optional(),
  moq: z.coerce.number().int("MOQ must be a whole number").min(1, "MOQ must be at least 1"),
  sort_order: z.coerce.number().int().min(0).optional(),
  sizes: z.string().optional(),
  colors: z.string().optional(),
  fabric: z.string().optional(),
  collar_types: z.string().optional(),
  sleeve_types: z.string().optional(),
  featured: z.boolean(),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

function buildDefaultValues(product: AdminProduct | null): FormValues {
  return {
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    category_id: product?.category_id ?? "",
    short_description: product?.short_description ?? "",
    description: product?.description ?? "",
    sport_type: product?.sport_type ?? "",
    moq: product?.moq ?? 10,
    sort_order: product?.sort_order ?? 0,
    sizes: (product?.sizes ?? []).join(", "),
    colors: (product?.colors ?? []).join(", "),
    fabric: (product?.fabric ?? []).join(", "),
    collar_types: (product?.collar_types ?? []).join(", "),
    sleeve_types: (product?.sleeve_types ?? []).join(", "),
    featured: product?.featured ?? false,
    is_active: product?.is_active ?? true,
  };
}

export function DesignForm({
  product,
  categories,
  onSaved,
  onCancel,
}: {
  product: AdminProduct | null;
  categories: AdminCategory[];
  onSaved: () => void | Promise<void>;
  onCancel: () => void;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(product?.image_url ?? null);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!product);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: buildDefaultValues(product),
  });

  useEffect(() => {
    reset(buildDefaultValues(product));
    setImageUrl(product?.image_url ?? null);
    setImages(product?.images ?? []);
    setSlugTouched(!!product);
  }, [product, reset]);

  const name = watch("name");
  useEffect(() => {
    if (!slugTouched) {
      setValue("slug", slugify(name || ""));
    }
  }, [name, slugTouched, setValue]);

  async function onSubmit(values: FormValues) {
    setSaving(true);
    try {
      let slug = values.slug;
      if (!slugTouched) {
        slug = await resolveUniqueSlug(slugify(values.name));
        setValue("slug", slug);
      }

      const payload = {
        name: values.name,
        slug,
        category_id: values.category_id,
        short_description: values.short_description || null,
        description: values.description || null,
        sport_type: values.sport_type || null,
        moq: values.moq,
        sort_order: values.sort_order ?? 0,
        sizes: parseTags(values.sizes ?? ""),
        colors: parseTags(values.colors ?? ""),
        fabric: parseTags(values.fabric ?? ""),
        collar_types: parseTags(values.collar_types ?? ""),
        sleeve_types: parseTags(values.sleeve_types ?? ""),
        featured: values.featured,
        is_active: values.is_active,
        image_url: imageUrl,
        images,
      };

      if (product) {
        await updateProduct({ data: { id: product.id, payload } });
        toast.success("Design updated");
      } else {
        await createProduct({ data: payload });
        toast.success("Design added");
      }
      await onSaved();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      if (message.includes("duplicate key") && message.includes("slug")) {
        toast.error(
          "A design with this slug already exists. Please choose a different name or slug.",
        );
      } else {
        toast.error(message);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Product Name *</Label>
          <Input id="name" {...register("name")} placeholder="e.g. Pro Cricket Jersey" />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="slug">Slug *</Label>
          <Input
            id="slug"
            {...register("slug", {
              onChange: () => setSlugTouched(true),
            })}
            placeholder="pro-cricket-jersey"
          />
          {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="category_id">Category *</Label>
          <Select
            value={watch("category_id")}
            onValueChange={(v) => setValue("category_id", v, { shouldValidate: true })}
          >
            <SelectTrigger id="category_id">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
            {/*
              Radix Select renders items in a portal which can make automated
              queries and some accessibility tools miss the options. Add a
              visually-hidden native <select> bound to the same form value as a
              minimal, safe fallback so category options are always present in
              the DOM and persist selection behavior.
            */}
            <select
              id="category_id_native"
              value={watch("category_id")}
              onChange={(e) => setValue("category_id", e.target.value, { shouldValidate: true })}
              aria-hidden="false"
              style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", overflow: "hidden" }}
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          {errors.category_id && (
            <p className="text-xs text-destructive">{errors.category_id.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sport_type">Sport Type</Label>
          <Input id="sport_type" {...register("sport_type")} placeholder="e.g. Cricket" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="short_description">Short Description</Label>
        <Input
          id="short_description"
          {...register("short_description")}
          placeholder="One-line summary shown on product cards"
        />
        {errors.short_description && (
          <p className="text-xs text-destructive">{errors.short_description.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Full Description</Label>
        <Textarea
          id="description"
          rows={4}
          {...register("description")}
          placeholder="Detailed product description"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="moq">MOQ (Minimum Order Quantity) *</Label>
          <Input id="moq" type="number" min={1} {...register("moq")} />
          {errors.moq && <p className="text-xs text-destructive">{errors.moq.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sort_order">Sort Order</Label>
          <Input id="sort_order" type="number" min={0} {...register("sort_order")} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="sizes">Sizes (comma separated)</Label>
          <Input id="sizes" {...register("sizes")} placeholder="S, M, L, XL, XXL" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="colors">Colors (comma separated)</Label>
          <Input id="colors" {...register("colors")} placeholder="Red, Blue, Black" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fabric">Fabric options (comma separated)</Label>
          <Input id="fabric" {...register("fabric")} placeholder="Polyester, Dri-Fit" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="collar_types">Collar types (comma separated)</Label>
          <Input id="collar_types" {...register("collar_types")} placeholder="Round Neck, V-Neck" />
        </div>
        <div className="space-y-1.5 sm:col-span-2 md:col-span-2">
          <Label htmlFor="sleeve_types">Sleeve types (comma separated)</Label>
          <Input
            id="sleeve_types"
            {...register("sleeve_types")}
            placeholder="Full Sleeve, Half Sleeve"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
        <ImageUpload
          bucket="product-images"
          value={imageUrl}
          onChange={setImageUrl}
          label="Primary Image"
        />
        <MultiImageUpload
          bucket="product-images"
          value={images}
          onChange={setImages}
          label="Additional Gallery Images"
        />
      </div>

      <div className="flex flex-wrap gap-8">
        <label className="flex items-center gap-3">
          <Switch checked={watch("featured")} onCheckedChange={(v) => setValue("featured", v)} />
          <span className="text-sm font-medium">Featured</span>
        </label>
        <label className="flex items-center gap-3">
          <Switch checked={watch("is_active")} onCheckedChange={(v) => setValue("is_active", v)} />
          <span className="text-sm font-medium">
            {watch("is_active") ? "Active (visible on site)" : "Inactive (hidden)"}
          </span>
        </label>
      </div>

      <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : product ? "Save Changes" : "Add Design"}
        </Button>
      </div>
    </form>
  );
}