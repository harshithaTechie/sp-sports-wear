import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Package, ShoppingCart, Users, Images } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

const STATS = [
  { label: "Products", icon: Package, key: "products" },
  { label: "Categories", icon: Users, key: "categories" },
  { label: "Quote Requests", icon: Images, key: "quotations" },
  { label: "Orders", icon: ShoppingCart, key: "orders" },
];

function AdminDashboard() {
  const [counts, setCounts] = useState<Record<string, number | null>>({
    products: null,
    categories: null,
    quotations: null,
    orders: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCounts();
  }, []);

  async function loadCounts() {
    setLoading(true);
    const [productsRes, categoriesRes, quotationsRes, ordersRes] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("categories").select("id", { count: "exact", head: true }),
      supabase.from("quotations").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }),
    ]);

    setCounts({
      products: productsRes.error ? 0 : productsRes.count ?? 0,
      categories: categoriesRes.error ? 0 : categoriesRes.count ?? 0,
      quotations: quotationsRes.error ? 0 : quotationsRes.count ?? 0,
      orders: ordersRes.error ? 0 : ordersRes.count ?? 0,
    });

    setLoading(false);
  }

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-primary">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Overview of your SP Sports Wear operations.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {s.label}
              </span>
              <s.icon className="h-4 w-4 text-secondary" />
            </div>
            <div className="mt-3 font-display text-3xl font-bold text-primary">
              {loading ? "..." : counts[s.key] ?? 0}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Admin modules (Products, Categories, Orders, Gallery, Settings) will be
        connected here in upcoming updates.
      </div>
    </div>
  );
}
