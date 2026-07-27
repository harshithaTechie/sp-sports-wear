import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Section } from "@/components/site/Section";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

import { GALLERY_CATEGORIES } from "@/lib/gallery.constants";

const CATS = ["All", ...GALLERY_CATEGORIES] as const;

type GalleryItem = {
  id: string;
  title: string;
  category: string | null;
  description: string | null;
  image_url: string;
};

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Design Collection — SP Sports Wear" },
      { name: "description", content: "Browse our design collection — professional jersey and sportswear mockups for schools, colleges, teams and events." },
      { property: "og:title", content: "SP Sports Wear — Design Collection" },
      { property: "og:description", content: "Browse our sportswear design collection." },
    ],
  }),
  component: Gallery,
});

function Gallery() {
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const [items, setItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    loadGalleryItems();
  }, []);

  async function loadGalleryItems() {
    const { data, error } = await supabase
      .from("gallery_items")
      .select("id, title, category, description, image_url, sort_order")
      .order("sort_order", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (!error) {
      setItems(data ?? []);
    } else {
      console.error(error.message);
    }
  }

  const filteredItems = cat === "All" ? items : items.filter((g) => g.category === cat);

  return (
    <>
      <section className="bg-navy text-white">
        <div className="container-x py-12 sm:py-14 md:py-20">
          <span className="eyebrow text-orange">Design Collection</span>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl font-bold text-balance">Explore our sportswear designs.</h1>
          <p className="mt-4 max-w-2xl text-white/75 text-sm sm:text-base">
            A curated collection of jersey and sportswear designs you can fully customize for your team, school, college or event.
          </p>
        </div>
      </section>

      <Section>
        <div className="mb-6 sm:mb-8 flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "rounded-full border px-3 sm:px-4 py-2 text-xs font-semibold transition",
                cat === c ? "border-transparent bg-primary text-primary-foreground" : "border-border bg-card text-foreground/70 hover:border-primary hover:text-primary",
              )}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((g) => (
            <figure key={g.id} className="group overflow-hidden rounded-2xl border border-border bg-card">
              <div className="aspect-[4/3] overflow-hidden">
                <img src={g.image_url} alt={g.title} loading="lazy" width={1280} height={960} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              </div>
              <figcaption className="p-4 sm:p-5">
                <span className="text-[11px] uppercase tracking-widest text-orange font-semibold">{g.category}</span>
                <h3 className="mt-1 font-display text-base font-semibold text-primary">{g.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{g.description}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>
    </>
  );
}
