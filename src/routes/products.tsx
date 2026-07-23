import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Section } from "@/components/site/Section";
import { ProductCard } from "@/components/site/ProductCard";
import { getProducts } from "@/lib/catalog.functions";
import { cn } from "@/lib/utils";

const productsQuery = queryOptions({
  queryKey: ["products", "list"],
  queryFn: () => getProducts(),
});

const tabs = [
  { slug: "All", label: "All" },
  { slug: "jerseys", label: "Jerseys" },
  { slug: "tracksuits", label: "Tracksuits" },
  { slug: "shorts", label: "Shorts" },
  { slug: "lowers", label: "Lowers" },
  { slug: "sleeveless-t-shirts", label: "Sleeveless T-Shirts" },
  { slug: "caps", label: "Caps" },
];

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Designs — Custom Jerseys & Uniforms | SP Sports Wear" },
      {
        name: "description",
        content:
          "Browse our sportswear designs — jerseys, tracksuits, shorts, lowers, sleeveless tees and caps. Fully customizable. Get a custom quote.",
      },
      { property: "og:title", content: "SP Sports Wear — Designs" },
      { property: "og:description", content: "Fully customizable sportswear designs." },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(productsQuery);
  },
  errorComponent: ({ error }) => (
    <div className="container-x py-20 text-center text-muted-foreground">
      Unable to load products: {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="container-x py-20">Not found.</div>,
  component: Products,
});

function Products() {
  const { data: products } = useSuspenseQuery(productsQuery);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (pathname.startsWith("/products/")) {
    return <Outlet />;
  }

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");

  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    return products.filter((p) => {
      if (cat !== "All" && p.category?.slug !== cat) return false;
      if (ql) {
        const hay = p.name.toLowerCase();
        if (!hay.includes(ql)) return false;
      }
      return true;
    });
  }, [products, q, cat]);

  return (
    <>
      <section className="bg-navy text-white">
        <div className="container-x py-14 md:py-20">
          <span className="eyebrow text-orange">Design Catalog</span>
          <h1 className="mt-3 font-display text-4xl md:text-5xl font-bold">
            Sportswear designs, customized for your team.
          </h1>
          <p className="mt-4 max-w-2xl text-white/75">
            Every design is fully customizable — colors, fabric, sizes, logos and names.
            Browse designs and get a custom quote based on your quantity.
          </p>

          <div className="mt-8 flex flex-col md:flex-row gap-3 max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search jerseys, tracksuits, uniforms…"
                className="w-full h-12 rounded-md bg-white/10 border border-white/20 pl-10 pr-4 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-orange"
              />
            </div>
          </div>
        </div>
      </section>

      <Section>
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-2 min-w-full flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.slug}
                onClick={() => setCat(tab.slug)}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs font-semibold transition whitespace-nowrap",
                  cat === tab.slug
                    ? "border-transparent bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground/70 hover:border-primary hover:text-primary",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            New designs are being added — please check back soon or contact us for a custom quote.
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No designs match your search. Try a different keyword or category.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}

