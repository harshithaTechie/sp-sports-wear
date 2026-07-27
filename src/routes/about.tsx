import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, CheckCircle2, Factory, Heart, Target, Users } from "lucide-react";
import { Section } from "@/components/site/Section";
import stitching from "@/assets/process-stitching.jpg";
import fabric from "@/assets/process-fabric.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About SP Sports Wear — Our Story & Manufacturing" },
      {
        name: "description",
        content:
          "SP Sports Wear is a custom sportswear manufacturer in Andhra Pradesh, India. Learn about our story, mission, quality promise and in-house manufacturing.",
      },
      { property: "og:title", content: "About SP Sports Wear" },
      { property: "og:description", content: "Custom sportswear manufacturer in India." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <section className="bg-navy text-white">
        <div className="container-x py-12 sm:py-16 md:py-24">
          <span className="eyebrow text-orange">About Us</span>
          <h1 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-balance max-w-3xl">
            Custom sportswear manufacturer. Made in India.
          </h1>
          <p className="mt-4 sm:mt-5 text-white/75 max-w-2xl text-base sm:text-lg">
            SP Sports Wear is a dedicated custom sportswear manufacturer specialising in
            bulk orders, premium fabrics, custom printing and team uniforms for schools,
            colleges and events across India.
          </p>
          <div className="mt-5 sm:mt-6 flex flex-wrap gap-2">
            {["Bulk Orders", "Premium Fabrics", "Custom Printing", "Team Uniforms", "Schools & Colleges", "Events"].map((tag) => (
              <span key={tag} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Section
        eyebrow="Our Story"
        title="A workshop with a big mission."
      >
        <div className="grid gap-10 lg:grid-cols-2 items-center">
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              We manufacture customized jerseys, tracksuits, shorts, lowers, sleeveless T-shirts,
              caps and sports uniforms for schools, colleges, sports academies, clubs, corporate
              organizations, tournaments and events across India.
            </p>
            <p>
              Every order is produced using high-quality fabrics, advanced printing technology
              and skilled craftsmanship — so every team looks professional and performs
              confidently.
            </p>
            <p>
              From a single cricket team to 500-piece corporate orders, we treat every customer
              with the same care: fair pricing, honest timelines, and a finished product we're
              proud to put our name on.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img src={stitching} loading="lazy" width={1280} height={896} className="rounded-2xl h-full object-cover" alt="Stitching floor" />
            <img src={fabric} loading="lazy" width={1280} height={896} className="rounded-2xl h-full object-cover" alt="Fabric" />
          </div>
        </div>
      </Section>

      <Section tone="surface">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: Target, title: "Our Mission", desc: "Deliver world-class custom sportswear that makes every Indian team feel professional." },
            { icon: Heart, title: "Our Vision", desc: "Become India's most trusted custom manufacturer for schools, clubs and corporates." },
            { icon: Award, title: "Quality Promise", desc: "Premium fabrics, wash-safe prints, precision stitching — inspected on every jersey." },
          ].map((v) => (
            <div key={v.title} className="rounded-2xl border border-border bg-card p-7 shadow-card">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-accent-gradient text-white shadow-glow">
                <v.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold text-primary">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Why Choose Us"
        title="What sets SP Sports Wear apart."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {[
            "In-house fabric to finish manufacturing",
            "Sublimation, embroidery and print in one place",
            "Skilled tailors with 10+ years of experience",
            "Full customization — colors, logos, names, numbers",
            "MOQ from just 10 pieces",
            "Tracked delivery across Andhra Pradesh & Telangana",
            "Dedicated production coordinator for every order",

          ].map((point) => (
            <div key={point} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-success mt-0.5" />
              <span className="text-sm text-foreground">{point}</span>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/customize" className="inline-flex items-center rounded-md bg-accent-gradient px-6 py-3 text-sm font-semibold text-white shadow-glow">
            Start Your Order
          </Link>
          <Link to="/gallery" className="inline-flex items-center rounded-md border border-border bg-card px-6 py-3 text-sm font-semibold text-primary">
            View Our Work
          </Link>
        </div>
      </Section>
    </>
  );
}
