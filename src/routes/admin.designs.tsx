import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { deleteProduct } from "@/lib/catalog.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DesignForm, type AdminProduct, type AdminCategory } from "@/components/admin/DesignForm";
import { DesignTable } from "@/components/admin/DesignTable";
import { ConfirmDeleteDialog } from "../components/admin/ConfirmDeleteDialog";
import { deleteUploadedImage } from "@/components/admin/ImageUpload";

export const Route = createFileRoute("/admin/designs")({
  component: DesignsPage,
});

type StatusFilter = "all" | "active" | "inactive";

function DesignsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState(false);

  const hasCategories = categories.length > 0;

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    const [productsRes, categoriesRes] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name, slug").order("sort_order", { ascending: true }),
    ]);

    if (productsRes.error) {
      toast.error(productsRes.error.message);
    } else {
      setProducts((productsRes.data ?? []) as AdminProduct[]);
    }

    if (categoriesRes.error) {
      toast.error(categoriesRes.error.message);
    } else {
      setCategories((categoriesRes.data ?? []) as AdminCategory[]);
    }
    setLoading(false);
  }

  const categoryNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of categories) map[c.id] = c.name;
    return map;
  }, [categories]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (q) {
        const haystack = `${p.name} ${p.slug} ${p.sport_type ?? ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (categoryFilter !== "all" && p.category_id !== categoryFilter) return false;
      if (statusFilter === "active" && !p.is_active) return false;
      if (statusFilter === "inactive" && p.is_active) return false;
      return true;
    });
  }, [products, search, categoryFilter, statusFilter]);

  function openAddForm() {
    setEditingProduct(null);
    setFormOpen(true);
  }

  function openEditForm(product: AdminProduct) {
    setEditingProduct(product);
    setFormOpen(true);
  }

  async function handleSaved() {
    setFormOpen(false);
    setEditingProduct(null);
    await loadAll();
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct({ data: { id: deleteTarget.id } });

      // Best-effort cleanup of uploaded storage objects; ignore failures.
      const cleanupUrls = [deleteTarget.image_url, ...(deleteTarget.images ?? [])].filter(
        (u): u is string => !!u,
      );
      await Promise.allSettled(
        cleanupUrls.map((u) => deleteUploadedImage("product-images", u).catch(() => undefined)),
      );

      toast.success("Design deleted");
      setDeleteTarget(null);
      await loadAll();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete design");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">Designs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage all sportswear designs shown on the catalog.
          </p>
        </div>
        <Button onClick={openAddForm}>
          <Plus className="h-4 w-4" /> Add Design
        </Button>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, slug, or sport…"
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="rounded-xl border border-border p-12 text-center text-sm text-muted-foreground">
            Loading designs…
          </div>
        ) : (
          <DesignTable
            products={filteredProducts}
            categoryNames={categoryNames}
            onEdit={openEditForm}
            onDelete={setDeleteTarget}
          />
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Design" : "Add New Design"}</DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading categories…</p>
            ) : !hasCategories ? (
              <p className="text-sm text-muted-foreground">
                You need at least one category before adding a design. Create one from the Categories
                page first.
              </p>
            ) : (
              <DesignForm
                product={editingProduct}
                categories={categories}
                onSaved={handleSaved}
                onCancel={() => setFormOpen(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this design?"
        description={`"${deleteTarget?.name ?? ""}" will be permanently removed from your catalog.`}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </div>
  );
}
