import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createCategory, updateCategory, deleteCategory } from "@/lib/catalog.functions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number | null;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const Route = createFileRoute("/admin/categories")({
  component: CategoriesPage,
});

function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, description, image_url, sort_order")
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("name", { ascending: true });

    if (error) {
      toast.error(error.message);
    } else {
      setCategories((data ?? []) as CategoryRow[]);
    }
    setLoading(false);
  }

  function resetForm() {
    setName("");
    setSlug("");
    setDescription("");
    setSortOrder("0");
    setEditingCategory(null);
  }

  function openAddForm() {
    resetForm();
    setFormOpen(true);
  }

  function openEditForm(category: CategoryRow) {
    setEditingCategory(category);
    setName(category.name);
    setSlug(category.slug);
    setDescription(category.description ?? "");
    setSortOrder(category.sort_order?.toString() ?? "0");
    setFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name,
        slug: slug || slugify(name),
        description: description || undefined,
        sort_order: Number(sortOrder) || 0,
      };

      if (editingCategory) {
        await updateCategory({ data: { id: editingCategory.id, payload } });
        toast.success("Category updated");
      } else {
        await createCategory({ data: payload });
        toast.success("Category added");
      }

      setFormOpen(false);
      resetForm();
      await loadCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setSaving(false);
    }
  }

  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    if (!deleteTarget) return;
    const idToDelete = deleteTarget.id;
    setDeleting(true);
    try {
      await deleteCategory({ data: { id: idToDelete } });
      toast.success("Category deleted");
      setDeleteTarget(null);
      await loadCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete category");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">Categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage the main product categories shown on the catalog.</p>
        </div>
        <Button onClick={openAddForm}>
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading categories…</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No categories yet.</div>
        ) : (
          <table className="min-w-[600px] w-full text-sm">
            <thead className="bg-muted/70 text-left">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Sort</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{category.name}</td>
                  <td className="px-4 py-3 text-muted-foreground break-words">/{category.slug}</td>
                  <td className="px-4 py-3">{category.sort_order ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground break-words">{category.description ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEditForm(category)} aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(category)}
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={(open) => { if (!open) { resetForm(); setFormOpen(false); } else { setFormOpen(true); } }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="category-name">Name</Label>
                <Input id="category-name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category-slug">Slug</Label>
                <Input
                  id="category-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="jerseys"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category-sort">Sort Order</Label>
                <Input id="category-sort" type="number" min={0} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category-description">Description</Label>
                <Textarea id="category-description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => { resetForm(); setFormOpen(false); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>{saving ? "Saving…" : editingCategory ? "Save Changes" : "Add Category"}</Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this category?"
        description={`"${deleteTarget?.name ?? ""}" will be removed from the catalog.`}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
}
