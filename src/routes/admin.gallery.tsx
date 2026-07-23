import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Image, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createGalleryItem, updateGalleryItem, deleteGalleryItem } from "@/lib/gallery.functions";
import { GALLERY_CATEGORIES, type GalleryCategory } from "@/lib/gallery.constants";
import { uploadFileServer } from "@/lib/upload.functions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";

type GalleryItemRow = {
  id: string;
  title: string;
  category: string | null;
  image_url: string;
  description: string | null;
  client_name: string | null;
  sort_order: number | null;
};

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES: string[] = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const Route = createFileRoute("/admin/gallery")({
  component: GalleryPage,
});

function GalleryPage() {
  const [items, setItems] = useState<GalleryItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GalleryItemRow | null>(null);
  const [editingItem, setEditingItem] = useState<GalleryItemRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<GalleryCategory | "">("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [clientName, setClientName] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canSubmit = !!title.trim() && !!imageUrl && !uploadingImage;

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    setLoading(true);
    const { data, error } = await supabase
      .from("gallery_items")
      .select("id, title, category, image_url, description, client_name, sort_order")
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
    } else {
      setItems((data ?? []) as GalleryItemRow[]);
    }
    setLoading(false);
  }

  async function handleImageFile(file?: File) {
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Please upload a JPG, PNG, WEBP, or GIF image.");
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      toast.error("Image must be smaller than 5MB.");
      return;
    }

    setUploadingImage(true);

    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const res = await uploadFileServer({
        data: {
          bucket: "gallery-images",
          fileName: file.name,
          fileType: file.type,
          base64Data,
        },
      });

      setImageUrl(res.publicUrl);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function resetForm() {
    setTitle("");
    setCategory("");
    setImageUrl("");
    setDescription("");
    setClientName("");
    setEditingItem(null);
  }

  function openAddForm() {
    resetForm();
    setFormOpen(true);
  }

  function openEditForm(item: GalleryItemRow) {
    setEditingItem(item);
    setTitle(item.title);
    setCategory((item.category as GalleryCategory) ?? "");
    setImageUrl(item.image_url);
    setDescription(item.description ?? "");
    setClientName(item.client_name ?? "");
    setFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageUrl) {
      toast.error("Please upload an image before saving.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title,
        category: category || null,
        image_url: imageUrl,
        description: description || null,
        client_name: clientName || null,
        sort_order: editingItem?.sort_order ?? 0,
      };

      if (editingItem) {
        await updateGalleryItem({ data: { id: editingItem.id, payload } });
        toast.success("Gallery item updated");
      } else {
        await createGalleryItem({ data: payload });
        toast.success("Gallery item added");
      }

      setFormOpen(false);
      resetForm();
      await loadItems();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save gallery item");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteGalleryItem({ data: { id: deleteTarget.id, image_url: deleteTarget.image_url } });
      toast.success("Gallery item deleted");
      setDeleteTarget(null);
      await loadItems();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete gallery item");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">Gallery</h1>
          <p className="mt-1 text-sm text-muted-foreground">Showcase featured designs and client work.</p>
        </div>
        <Button onClick={openAddForm}>
          <Plus className="h-4 w-4" /> Add Gallery Item
        </Button>
      </div>

      <div className="mt-6 rounded-3xl border border-border bg-card p-4">
        {loading ? (
          <div className="rounded-2xl border border-dashed border-border bg-background p-10 text-center text-sm text-muted-foreground">
            Loading gallery…
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-background p-10 text-center text-sm text-muted-foreground">
            No gallery items yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <div key={item.id} className="overflow-hidden rounded-3xl border border-border bg-background shadow-sm">
                <div className="relative h-64 bg-muted">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center p-6 text-muted-foreground">
                      <Image className="h-12 w-12" />
                    </div>
                  )}
                </div>
                <div className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-lg font-semibold text-primary">{item.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{item.category ?? "Uncategorized"}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditForm(item)} aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(item)}
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {item.client_name ? (
                      <p>
                        <span className="font-medium text-foreground">Customer / Team / Organization:</span> {item.client_name}
                      </p>
                    ) : null}
                    {item.description ? <p className="line-clamp-3">{item.description}</p> : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={(open) => { if (!open) { resetForm(); setFormOpen(false); } else { setFormOpen(true); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Gallery Item" : "Add Gallery Item"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="gallery-title">Title</Label>
              <Input id="gallery-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gallery-category">Category</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as GalleryCategory)}>
                <SelectTrigger id="gallery-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {GALLERY_CATEGORIES.map((catValue) => (
                    <SelectItem key={catValue} value={catValue}>
                      {catValue}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gallery-client">Customer / Team / Organization</Label>
              <Input id="gallery-client" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="ACME Team" />
            </div>
            <div className="space-y-3">
              <Label>Upload Image</Label>
              <div className="rounded-3xl border border-border bg-muted p-4">
                <div className="mb-3 flex h-52 items-center justify-center overflow-hidden rounded-2xl bg-slate-950">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Selected image preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Image className="h-12 w-12" />
                      <p className="text-sm">No image selected yet.</p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_TYPES.join(",")}
                  className="hidden"
                  onChange={(e) => handleImageFile(e.target.files?.[0] ?? undefined)}
                />
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploadingImage ? "Uploading…" : imageUrl ? "Replace image" : "Upload image"}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {uploadingImage
                      ? "Uploading image..."
                      : imageUrl
                      ? "Image ready to save."
                      : "Please upload a gallery image."}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="gallery-description">Description</Label>
              <Textarea id="gallery-description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => { resetForm(); setFormOpen(false); }}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || uploadingImage || !canSubmit}>
                {uploadingImage ? "Uploading…" : saving ? "Saving…" : editingItem ? "Save Changes" : "Add Item"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this gallery item?"
        description={`"${deleteTarget?.title ?? ""}" will be removed from the gallery.`}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
}
