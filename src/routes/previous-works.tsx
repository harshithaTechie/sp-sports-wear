import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Section } from "@/components/site/Section";
import team1 from "@/assets/gallery-team1.jpg";
import team2 from "@/assets/gallery-team2.jpg";
import team3 from "@/assets/gallery-team3.jpg";
import team4 from "@/assets/gallery-team4.jpg";

const WORKS = [
  { image: team1, segment: "Schools", title: "Sri Vidya High School — Cricket Team", qty: "24 jerseys · caps · lowers", detail: "Full sublimation navy & white jerseys with school crest and player numbers for the district cricket tournament." },
  { image: team2, segment: "Colleges", title: "SVR Engineering College — Football", qty: "30 jerseys · shorts", detail: "Orange & navy college kit with sponsor logos and player names for the inter-college football league." },
  { image: team3, segment: "Corporate", title: "TechNova India — Cricket Cup", qty: "45 jerseys · caps", detail: "Corporate branded cricket jerseys for the annual company tournament, embroidered logos included." },
  { image: team4, segment: "Clubs", title: "Bapatla Kabaddi Academy", qty: "18 jerseys · shorts", detail: "Red & yellow lycra-blend kabaddi kits, produced in 5 days for a regional tournament." },
];

export const Route = createFileRoute("/previous-works")({
  head: () => ({
    meta: [
      { title: "Previous Works — SP Sports Wear Case Studies" },
      { name: "description", content: "Case studies of previous orders — schools, colleges, clubs, corporates and events across India." },
      { property: "og:title", content: "SP Sports Wear — Previous Works" },
      { property: "og:description", content: "Case studies from our custom jersey orders." },
    ],
  }),
  component: PreviousWorks,
});

function PreviousWorks() {
  return (
    <>
      <section className="bg-navy text-white">
        <div className="container-x py-14 md:py-20">
          <span className="eyebrow text-orange">Previous Works</span>
          <h1 className="mt-3 font-display text-4xl md:text-5xl font-bold">A track record you can trust.</h1>
          <p className="mt-4 max-w-2xl text-white/75">
            From school teams to corporate leagues — a look at the orders we've delivered.
          </p>
        </div>
      </section>

      <Section>
        <div className="grid gap-8">
          {WORKS.map((w, i) => (
            <article key={w.title} className={"grid gap-6 md:grid-cols-2 items-center " + (i % 2 ? "md:[&>*:first-child]:order-2" : "")}>
              <div className="overflow-hidden rounded-2xl border border-border">
                <img src={w.image} alt={w.title} loading="lazy" width={1280} height={960} className="h-full w-full object-cover" />
              </div>
              <div>
                <span className="eyebrow">{w.segment}</span>
                <h2 className="mt-2 font-display text-2xl md:text-3xl font-bold text-primary">{w.title}</h2>
                <p className="mt-3 text-sm font-semibold text-secondary">{w.qty}</p>
                <p className="mt-3 text-muted-foreground">{w.detail}</p>
                <Link to="/customize" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-orange hover:underline">
                  Start a similar order <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
