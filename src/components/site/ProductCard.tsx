import { Link, useNavigate } from "@tanstack/react-router";
import type { CatalogProduct } from "@/lib/catalog.functions";

export function ProductCard({ product }: { product: CatalogProduct }) {
  const img = product.images?.[0] || product.image_url || "";
  const desc = product.short_description || product.description || "";
  const categoryName = product.category?.name || "Sportswear";
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate({ to: "/products/$slug", params: { slug: product.slug } });
  };

  return (
    <div
      onClick={handleNavigate}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleNavigate();
        }
      }}
      role="button"
      tabIndex={0}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card hover-lift cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange"
    >
      <div className="relative aspect-square overflow-hidden bg-surface">
        {img ? (
          <img
            src={img}
            alt={product.name}
            loading="lazy"
            width={1024}
            height={1024}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}
        <span className="absolute top-3 left-3 rounded-full bg-accent-gradient px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-glow">
          Fully Customizable
        </span>
        <span className="absolute top-3 right-3 rounded-full bg-white/95 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary shadow-card">
          MOQ {product.moq ?? 10} pcs
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4 md:p-5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-orange">
          {categoryName}
        </span>
        <div className="mt-1 font-display text-lg font-semibold text-primary">
          {product.name}
        </div>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{desc}</p>
        {product.fabric?.length ? (
          <p className="mt-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground/70">Fabric:</span>{" "}
            {product.fabric.slice(0, 2).join(" · ")}
          </p>
        ) : null}
        <div className="mt-3 text-xs font-semibold text-secondary">
          Custom Quote Available
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-border">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              handleNavigate();
            }}
            className="inline-flex items-center justify-center rounded-md border border-border bg-card px-3 py-2 text-xs font-semibold text-primary hover:border-secondary transition"
          >
            View Design
          </button>
          <Link
            to="/customize"
            search={{ designSlug: product.slug }}
            onClick={(event) => event.stopPropagation()}
            className="inline-flex items-center justify-center rounded-md bg-accent-gradient px-3 py-2 text-xs font-semibold text-white shadow-glow hover:brightness-110 transition"
          >
            Customize Now
          </Link>
        </div>
      </div>
    </div>
  );
}
