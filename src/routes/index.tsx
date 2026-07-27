import { Link, createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronRight,
  Factory,
  Palette,
  Shield,
  ShoppingBag,
  Sparkles,
  Star,
  Trophy,
  Truck,
  Users,
  Zap,
} from "lucide-react";
import heroImg from "@/assets/hero-cricket.jpg";
import stitching from "@/assets/process-stitching.jpg";
import printing from "@/assets/process-printing.jpg";
import fabric from "@/assets/process-fabric.jpg";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/lib/catalog.functions";
import { GALLERY } from "@/data/gallery";
import { Section } from "@/components/site/Section";
import { ProductCard } from "@/components/site/ProductCard";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { waLink } from "@/lib/whatsapp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {title: "SP Sports Wear - Cherukupalli | Custom Jerseys & Sportswear" },
      
        {
  name: "description",
  content:
    "SP Sports Wear - Cherukupalli manufactures custom sports jerseys, tracksuits, shorts, lowers, sleeveless t-shirts and caps for schools, colleges, sports clubs, academies and events in Andhra Pradesh and Telangana. Request a free quote today.",
},
    ],
  }),
  component: Home,
});

const HERO_FEATURES = [
  "Premium Quality Fabric",
  "Fully Customizable Designs",
  "Vibrant & Long-lasting Printing",
  "Custom Names & Numbers",
  "All Sports & All Sizes",
  "Minimum Order: 10 Pieces",
  "Bulk Team Orders",
];

const HERO_SHIPPING = [
  "Serving Andhra Pradesh & Telangana",
  "Door Delivery Available on Request",
  "Delivery Time depends on order quantity",
];

const WHY = [
  { icon: Factory, title: "In-house Manufacturing", desc: "Fabric to final jersey — every step under one roof for consistent quality." },
  { icon: Palette, title: "Full Customization", desc: "Team colors, logos, player names, numbers, sponsors — nothing off-limits." },
  { icon: Shield, title: "Premium Fabrics", desc: "Micro polyester, Lycra, dry-fit, honeycomb — sourced for performance & durability." },
  { icon: Truck, title: "AP & Telangana Delivery", desc: "Reliable, tracked shipping across Andhra Pradesh & Telangana." },
  { icon: Zap, title: "Fast Turnaround", desc: "Bulk delivery in 7–14 days depending on order size." },
  { icon: Award, title: "10+ Years Craftsmanship", desc: "Skilled tailors and printers building kits that teams are proud to wear." },
];

const PROCESS = [
  { icon: Users, title: "Share your requirement", desc: "Tell us the sport, quantity, colors and design ideas." },
  { icon: Palette, title: "Design & mockup", desc: "Our designers create a digital mockup for your approval." },
  { icon: Sparkles, title: "Digital Design Preview", desc: "A professional digital preview of your customized sportswear is provided for approval before production." },
  { icon: Factory, title: "Bulk manufacturing", desc: "Sublimation printing, cutting and stitching under one roof." },
  { icon: CheckCircle2, title: "Quality check", desc: "Every jersey inspected for stitching, print and sizing." },
  { icon: Truck, title: "Shipped on Request", desc: "Packed and shipped with tracking, door delivery available on request." },
];


const CLIENTS = [
  "Schools",
  "Colleges",
  "Sports Academies",
  "Clubs",
  "Corporates",
  "Tournaments",
  "Events",
  "Government",
  "Dealers",
];

const TESTIMONIALS = [
  { name: "Rajesh Kumar", quote: "The finish and print quality are outstanding. Our team looked professional at the state tournament." },
  { name: "Priya Nair", quote: "SP Sports Wear delivered 120 uniforms in 10 days with perfect sizing and crest embroidery." },
  { name: "Ankit Sharma", quote: "Beautiful corporate jerseys for our annual cricket cup. Bulk pricing was fair and communication was smooth." },
];

const FAQS = [
  { q: "What is the minimum order quantity?", a: "Most jerseys start at 10 pieces. Some categories like caps and event jerseys have higher MOQs — mentioned on each product page." },
  { q: "Do you provide sample before bulk production?", a: "We do not provide physical sample stitching pieces. We provide a professional digital design preview showing exactly how your customized sportswear will look before production." },
  { q: "Can you match Pantone / brand colors?", a: "Yes, we can match brand colors within sublimation tolerances. Share your Pantone code or brand guidelines and we'll match it as closely as possible." },
  { q: "How long does bulk delivery take?", a: "Standard turnaround is 7–14 days after design approval, depending on order size and complexity." },
  { q: "What areas do you deliver to?", a: "We currently provide delivery only in Andhra Pradesh and Telangana. Door delivery is available based on customer requirements." },
];

function Home() {
  const settings = useSiteSettings();
  const { data: featuredProducts = [] } = useQuery({
    queryKey: ["products", "featured-home"],
    queryFn: () => getProducts(),
  });

  const resolvedWhatsapp = settings?.whatsapp_number?.trim() || settings?.phone_number?.trim() || "919701052073";
  const resolvedWhatsappPhone = resolvedWhatsapp.replace(/\D/g, "");

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden text-white">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Cricket team celebrating in custom SP Sports Wear jerseys"
            width={1920}
            height={1280}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-navy/60 via-navy/20 to-transparent" />

        <div className="container-x relative py-12 sm:py-16 md:py-24 lg:py-32">
          <div className="max-w-3xl fade-in-up">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white">
              <span className="h-1.5 w-1.5 rounded-full bg-orange" />
              Custom Sportswear Manufacturer · India
            </span>
            <h1 className="mt-4 sm:mt-6 font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] sm:leading-[1.05] text-balance">
              Premium Sportswear <span className="text-orange">Manufacturer.</span>
            </h1>
            <p className="mt-4 sm:mt-5 font-display text-lg sm:text-xl md:text-2xl font-semibold text-white/95">
              Your Design. <span className="text-orange">Your Team.</span> Your Identity.
            </p>
            <p className="mt-4 sm:mt-5 max-w-xl text-sm sm:text-base md:text-lg text-white/80">
              Custom Jerseys, Tracksuits, Shorts, Lowers, Sleeveless T-Shirts, Caps &amp; Flags for
              Schools, Colleges, Teams, Events and Festivals.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-wrap gap-3">
              <Link
                to="/customize"
                className="inline-flex items-center gap-2 rounded-md bg-accent-gradient px-5 py-3 sm:px-6 sm:py-3.5 text-sm font-semibold text-white shadow-glow hover:brightness-110 transition"
              >
                Customize Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-3 sm:px-6 sm:py-3.5 text-sm font-semibold text-navy hover:bg-white/90 transition"
              >
                View Designs
              </Link>
            </div>

            <ul className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3 max-w-2xl">
              {HERO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-xs sm:text-sm text-white/90">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-orange/20 border border-orange flex-shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <div className="mt-4 sm:mt-6 flex flex-wrap gap-x-4 sm:gap-x-5 gap-y-2 max-w-2xl text-[10px] sm:text-[11px] uppercase tracking-widest text-white/70">
              {HERO_SHIPPING.map((s) => (
                <span key={s} className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-orange flex-shrink-0" />
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CLIENTS STRIP */}
      <div className="border-y border-border bg-surface">
        <div className="container-x py-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Trusted by
          </span>
          {CLIENTS.map((c) => (
            <span key={c} className="text-sm font-medium text-primary/80">
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* FEATURED CATEGORIES */}
      <Section
        eyebrow="Design Range"
        title="Built for every game."
        description="From cricket whites to corporate polos — we manufacture the full range in premium fabrics with unlimited color customization. Fully customizable · MOQ 10 pieces."
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-4 rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
              New designs are being added — visit the Designs page for the latest collection.
            </div>
          ) : (
            featuredProducts.slice(0, 8).map((p) => <ProductCard key={p.slug} product={p} />)
          )}
        </div>
        <div className="mt-10 flex justify-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
          >
            See all designs <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      {/* PROCESS */}
      <Section
        tone="surface"
        eyebrow="How It Works"
        title="From your idea to match-day kit."
        description="A transparent 6-step process — designed to keep quality high and turnarounds fast."
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PROCESS.map((step, i) => (
            <div
              key={step.title}
              className="relative rounded-2xl border border-border bg-card p-6 shadow-card hover-lift"
            >
              <div className="absolute -top-3 -left-3 grid h-10 w-10 place-items-center rounded-full bg-accent-gradient text-white text-sm font-bold shadow-glow">
                {i + 1}
              </div>
              <step.icon className="h-8 w-8 text-secondary" />
              <h3 className="mt-4 font-display text-lg font-semibold text-primary">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* WHY US - split with image */}
      <Section
        eyebrow="Why SP Sports Wear"
        title="A manufacturer that plays for your team."
        description="We're not resellers — we're builders. Fabric sourcing, printing and stitching happen in-house so quality stays consistent order after order."
      >
        <div className="grid gap-10 lg:grid-cols-5">
          <div className="lg:col-span-2 space-y-4">
            <div className="overflow-hidden rounded-2xl">
              <img src={printing} alt="Sublimation printing" loading="lazy" width={1280} height={896} className="h-full w-full object-cover" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="overflow-hidden rounded-2xl">
                <img src={stitching} alt="Stitching" loading="lazy" width={1280} height={896} className="h-40 w-full object-cover" />
              </div>
              <div className="overflow-hidden rounded-2xl">
                <img src={fabric} alt="Fabric" loading="lazy" width={1280} height={896} className="h-40 w-full object-cover" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-3 grid gap-4 sm:grid-cols-2">
            {WHY.map((w) => (
              <div key={w.title} className="rounded-2xl border border-border p-5 hover-lift bg-card">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/5 text-secondary">
                  <w.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-base font-semibold text-primary">{w.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* DESIGN COLLECTION PREVIEW */}
      <Section
        tone="surface"
        eyebrow="Design Collection"
        title="Explore our sportswear designs."
        description="A curated collection of jersey and sportswear designs you can fully customize for your team."
      >
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {GALLERY.slice(0, 4).map((g, i) => (
            <div
              key={g.id}
              className={
                (i === 0 ? "md:col-span-2 md:row-span-2 " : "") +
                "group relative aspect-square md:aspect-auto overflow-hidden rounded-2xl bg-navy"
              }
            >
              <img
                src={g.image}
                alt={g.title}
                loading="lazy"
                width={1280}
                height={960}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <span className="text-[11px] uppercase tracking-widest text-orange font-semibold">
                  {g.category}
                </span>
                <h3 className="mt-1 font-display text-base md:text-lg font-semibold">
                  {g.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-orange transition"
          >
            View full collection <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Section>

      {/* TESTIMONIALS */}
      <Section
        eyebrow="What Teams Say"
        title="Coaches, schools and corporates trust us."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex text-orange">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 text-sm text-foreground leading-relaxed">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-5 border-t border-border pt-4">
                <div className="font-semibold text-primary text-sm">{t.name}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>

      {/* FAQ */}
      <Section
        tone="surface"
        eyebrow="FAQ"
        title="Answers to common questions."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {FAQS.map((f) => (
            <details key={f.q} className="group rounded-xl border border-border bg-card p-5 open:shadow-card">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-primary">
                {f.q}
                <ChevronRight className="h-5 w-5 transition group-open:rotate-90" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <section className="bg-hero-gradient text-white">
        <div className="container-x py-16 md:py-24 grid gap-8 md:grid-cols-2 items-center">
          <div>
            <span className="eyebrow text-orange">Ready when you are</span>
            <h2 className="mt-3 font-display text-3xl md:text-5xl font-bold text-balance">
              Get your custom quotation in <span className="text-orange">under 24 hours.</span>
            </h2>
            <p className="mt-4 text-white/75 max-w-md">
              Share your requirement and our team will get back with a mockup and quote.
              No hidden charges — just fair, transparent pricing.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link
              to="/customize"
              className="inline-flex items-center gap-2 rounded-md bg-accent-gradient px-6 py-3.5 text-sm font-semibold text-white shadow-glow hover:brightness-110 transition"
            >
              <ShoppingBag className="h-4 w-4" /> Start Custom Order
            </Link>
            <a
              href={waLink("Hi SP Sports Wear, I'd like a quote for team jerseys.", resolvedWhatsappPhone)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-3.5 text-sm font-semibold text-navy hover:bg-white/90 transition"
            >
              <Trophy className="h-4 w-4" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
