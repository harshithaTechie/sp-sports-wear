import { Link, createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, MessageCircle, Ruler, Shirt } from "lucide-react";
import { useState } from "react";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { Section } from "@/components/site/Section";
import { ProductCard } from "@/components/site/ProductCard";
import { getProductBySlug } from "@/lib/catalog.functions";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { waLink } from "@/lib/whatsapp";

const productQuery = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/products/$slug")({
  loader: async ({ params, context }) => {
    const result = await context.queryClient.ensureQueryData(productQuery(params.slug));
    if (!result) throw notFound();
    return result;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Product not found — SP Sports Wear" }, { name: "robots", content: "noindex" }] };
    }
    const p = loaderData.product;
    const img = p.images?.[0] || p.image_url || undefined;
    return {
      meta: [
        { title: `${p.name} — SP Sports Wear` },
        { name: "description", content: p.short_description || p.description || p.name },
        { property: "og:title", content: p.name },
        { property: "og:description", content: p.short_description || p.description || p.name },
        ...(img ? [{ property: "og:image", content: img }] : []),
        { property: "og:type", content: "product" },
      ],
    };
  },
  errorComponent: ({ error }) => (
    <div className="container-x py-20 text-center text-muted-foreground">
      Unable to load product: {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="container-x py-20 text-center">
      <h1 className="font-display text-3xl font-bold text-primary">Product not found</h1>
      <p className="mt-2 text-muted-foreground">This product may have been removed or is no longer active.</p>
      <Link to="/products" className="mt-6 inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
        Back to products
      </Link>
    </div>
  ),
  component: ProductDetail,
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(productQuery(slug));
  const navigate = useNavigate();
  const product = data!.product;
  const related = data!.related;

  const gallery = product.images?.length
    ? product.images
    : product.image_url
      ? [product.image_url]
      : [];
  const [activeImg, setActiveImg] = useState(0);
  const [zoom, setZoom] = useState(false);
  const heroImg = gallery[activeImg];

  const settings = useSiteSettings();
  const resolvedWhatsapp = settings?.whatsapp_number?.trim() || settings?.phone_number?.trim() || "919701052073";
  const resolvedWhatsappPhone = resolvedWhatsapp.replace(/\D/g, "");
  const waMessage = `Hi SP Sports Wear, I'd like a quote for: ${product.name}`;

  return (
    <>
      <div className="container-x pt-6">
        <Link to="/products" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to Designs
        </Link>
      </div>

      <section className="container-x pt-6 pb-12 md:py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <div
              className={`overflow-hidden rounded-3xl border border-border bg-surface aspect-square ${heroImg ? "cursor-zoom-in" : ""}`}
              onClick={() => heroImg && setZoom(true)}
            >
              {heroImg ? (
                <img src={heroImg} alt={product.name} width={1024} height={1024} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">No image</div>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {gallery.slice(0, 8).map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`aspect-square overflow-hidden rounded-xl border ${i === activeImg ? "border-secondary" : "border-border"} bg-surface`}
                  >
                    <img src={src} alt="" width={512} height={512} loading="lazy" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            {product.category && <span className="eyebrow">{product.category.name}</span>}
            <h1 className="mt-2 font-display text-3xl md:text-4xl font-bold text-primary">{product.name}</h1>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">Design Details</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-orange/10 text-orange px-3 py-1 text-xs font-semibold">
                Fully Customizable
              </span>
              <span className="rounded-full bg-secondary/10 text-secondary px-3 py-1 text-xs font-semibold">
                MOQ {product.moq ?? 10} pcs
              </span>
              <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-semibold">
                Custom Quote Available
              </span>
              {product.sport_type && (
                <span className="rounded-full bg-card border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
                  Sport: {product.sport_type}
                </span>
              )}
            </div>
            {product.short_description && (
              <p className="mt-5 font-medium text-primary/80">{product.short_description}</p>
            )}
            {product.description && (
              <p className="mt-3 text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {product.fabric.length > 0 && (
                <SpecCard icon={<Shirt className="h-4 w-4" />} label="Fabric" value={product.fabric.join(" · ")} />
              )}
              {product.sizes.length > 0 && (
                <SpecCard icon={<Ruler className="h-4 w-4" />} label="Sizes" value={product.sizes.join(", ")} />
              )}
              {product.collar_types.length > 0 && (
                <SpecCard label="Collar Options" value={product.collar_types.join(", ")} />
              )}
              {product.sleeve_types.length > 0 && (
                <SpecCard label="Sleeve Options" value={product.sleeve_types.join(", ")} />
              )}
            </div>

            {product.colors.length > 0 && (
              <div className="mt-4 rounded-xl border border-border p-4">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Colors available</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.colors.map((c) => (
                    <span key={c} className="rounded-full border border-border bg-card px-3 py-1 text-xs">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 rounded-xl border border-border p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Customization included</div>
              <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                {["Sublimation print", "Team name & numbers", "Sponsor logos", "Custom collar & sleeve", "Player names", "Team crest"].map((c) => (
                  <li key={c} className="flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success" /> {c}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => navigate({ to: "/customize", search: { designSlug: product.slug } })}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-accent-gradient px-6 py-3.5 text-sm font-semibold text-white shadow-glow hover:brightness-110 transition"
              >
                Customize Now
              </button>
              <a
                href={waLink(waMessage, resolvedWhatsappPhone)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-6 py-3.5 text-sm font-semibold text-primary hover:border-secondary transition"
              >
                <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <Section eyebrow="Related Designs" title="You might also like">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </Section>
      )}

      {zoom && heroImg && (
        <div
          onClick={() => setZoom(false)}
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-6 cursor-zoom-out"
        >
          <img src={heroImg} alt={product.name} className="max-h-full max-w-full object-contain" />
        </div>
      )}
    </>
  );
}

function SpecCard({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <p className="mt-1.5 text-sm font-medium text-primary">{value}</p>
    </div>
  );
}
